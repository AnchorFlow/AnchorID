import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { AuditAction, Role } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { StellarService } from '../stellar/stellar.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { AppConfig } from '../config/configuration';
import type { JwtAccessPayload } from './strategies/jwt-payload.interface';

interface PendingChallenge {
  stellarAddress: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  // In-memory single-use challenge tracker. Acceptable for an MVP single
  // instance; a multi-instance deployment should move this to Redis so a
  // challenge issued by one pod can be consumed/invalidated on another.
  private readonly issuedChallenges = new Map<string, PendingChallenge>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly stellarService: StellarService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly auditLogs: AuditLogsService,
  ) {}

  requestChallenge(stellarAddress: string) {
    if (!this.stellarService.isValidAddress(stellarAddress)) {
      throw new BadRequestException('Invalid Stellar address');
    }
    const challenge = this.stellarService.buildChallenge(stellarAddress);
    this.issuedChallenges.set(challenge.nonce, {
      stellarAddress,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return {
      transactionXdr: challenge.transactionXdr,
      networkPassphrase: challenge.networkPassphrase,
    };
  }

  /**
   * Verifies a signed SEP-10-style challenge proves ownership of
   * `stellarAddress` without logging in — used to link an additional wallet
   * to an already-authenticated user.
   */
  async verifyAddressOwnership(
    stellarAddress: string,
    transactionXdr: string,
    context: { ipAddress?: string; userAgent?: string },
  ) {
    const result = this.stellarService.verifyChallenge(transactionXdr, stellarAddress);
    if (!result.valid) {
      throw new UnauthorizedException(result.reason ?? 'Challenge verification failed');
    }
    this.consumeChallenge(result.nonce, stellarAddress, context);
  }

  async verifyChallengeAndLogin(
    stellarAddress: string,
    transactionXdr: string,
    context: { ipAddress?: string; userAgent?: string },
  ) {
    const result = this.stellarService.verifyChallenge(transactionXdr, stellarAddress);
    if (!result.valid) {
      await this.auditLogs.record({
        action: AuditAction.LOGIN_FAILED,
        metadata: { stellarAddress, reason: result.reason },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedException(result.reason ?? 'Challenge verification failed');
    }

    this.consumeChallenge(result.nonce, stellarAddress, context);

    let wallet = await this.prisma.wallet.findUnique({
      where: { stellarAddress },
      include: { user: true },
    });

    let isNewUser = false;
    if (!wallet) {
      isNewUser = true;
      const user = await this.prisma.user.create({
        data: {
          role: Role.USER,
          wallets: {
            create: { stellarAddress, isPrimary: true, verifiedAt: new Date() },
          },
        },
        include: { wallets: true },
      });
      wallet = { ...user.wallets[0], user };
    } else if (!wallet.verifiedAt) {
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { verifiedAt: new Date() },
      });
    }

    const user = wallet.user;
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('This account has been suspended');
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);

    await this.auditLogs.record({
      action: isNewUser ? AuditAction.USER_REGISTERED : AuditAction.LOGIN_SUCCESS,
      actorId: user.id,
      actorRole: user.role,
      targetType: 'User',
      targetId: user.id,
      metadata: { stellarAddress },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (stored.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('This account has been suspended');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(stored.user.id, stored.user.role, stored.user.email);

    await this.auditLogs.record({
      action: AuditAction.TOKEN_REFRESHED,
      actorId: stored.user.id,
      actorRole: stored.user.role,
      targetType: 'User',
      targetId: stored.user.id,
    });

    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  private async issueTokens(userId: string, role: string, email: string | null) {
    const payload: JwtAccessPayload = { sub: userId, role, email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('jwt.accessSecret', { infer: true }),
      expiresIn: this.config.get('jwt.accessTtlSeconds', { infer: true }),
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTtlSeconds = this.config.get('jwt.refreshTtlSeconds', { infer: true });
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Enforces that a given challenge nonce was actually issued by this
   * server and can only be redeemed once, closing the replay window that a
   * pure signature/timebounds check leaves open.
   */
  private consumeChallenge(
    nonce: string | undefined,
    stellarAddress: string,
    context: { ipAddress?: string; userAgent?: string },
  ) {
    this.pruneExpiredChallenges();

    if (!nonce) {
      throw new UnauthorizedException('Challenge is missing its nonce');
    }
    const pending = this.issuedChallenges.get(nonce);
    if (!pending || pending.stellarAddress !== stellarAddress || pending.expiresAt < Date.now()) {
      void this.auditLogs.record({
        action: AuditAction.LOGIN_FAILED,
        metadata: { stellarAddress, reason: 'Challenge already used, unknown, or expired' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      throw new UnauthorizedException('Challenge already used, unknown, or expired');
    }
    this.issuedChallenges.delete(nonce);
  }

  private pruneExpiredChallenges() {
    const now = Date.now();
    for (const [nonce, pending] of this.issuedChallenges) {
      if (pending.expiresAt < now) this.issuedChallenges.delete(nonce);
    }
  }
}
