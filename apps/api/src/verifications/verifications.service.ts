import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Role, VerificationStatus } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { UpdateVerificationDto } from './dto/update-verification.dto';

@Injectable()
export class VerificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findByUserId(userId: string) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Create an identity profile first');
    return this.prisma.verification.findMany({
      where: { identityProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertForProfile(
    identityProfileId: string,
    reviewerId: string,
    dto: UpdateVerificationDto,
  ) {
    const profile = await this.prisma.identityProfile.findUnique({
      where: { id: identityProfileId },
    });
    if (!profile) throw new NotFoundException('Identity profile not found');

    const verification = await this.prisma.verification.create({
      data: {
        identityProfileId,
        status: dto.status,
        level: dto.level ?? 'BASIC',
        notes: dto.notes,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        expiresAt:
          dto.status === VerificationStatus.APPROVED
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    if (dto.status === VerificationStatus.APPROVED) {
      await this.prisma.credential.create({
        data: {
          identityProfileId,
          type: 'kyc_level',
          value: { level: verification.level, verificationId: verification.id },
          expiresAt: verification.expiresAt,
        },
      });
    }

    await this.auditLogs.record({
      action: AuditAction.VERIFICATION_UPDATED,
      actorId: reviewerId,
      actorRole: Role.ADMIN,
      targetType: 'IdentityProfile',
      targetId: identityProfileId,
      metadata: { status: dto.status, level: dto.level },
    });

    return verification;
  }
}
