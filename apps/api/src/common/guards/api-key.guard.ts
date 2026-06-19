import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuthenticatedAnchor {
  anchorId: string;
  apiCredentialId: string;
}

/**
 * Authenticates server-to-server anchor calls via `x-api-key-id` /
 * `x-api-key-secret` headers (separate from end-user JWT auth).
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const keyId = request.headers['x-api-key-id'] as string | undefined;
    const secret = request.headers['x-api-key-secret'] as string | undefined;

    if (!keyId || !secret) {
      throw new UnauthorizedException('Missing API credentials');
    }

    const credential = await this.prisma.anchorApiCredential.findUnique({
      where: { keyId },
    });

    if (!credential || credential.revokedAt || credential.deletedAt) {
      throw new UnauthorizedException('Invalid API credentials');
    }

    const matches = await bcrypt.compare(secret, credential.secretHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid API credentials');
    }

    await this.prisma.anchorApiCredential.update({
      where: { id: credential.id },
      data: { lastUsedAt: new Date() },
    });

    (request as Request & { anchor: AuthenticatedAnchor }).anchor = {
      anchorId: credential.anchorId,
      apiCredentialId: credential.id,
    };
    return true;
  }
}
