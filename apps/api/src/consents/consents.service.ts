import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditAction, ConsentStatus } from '@anchorid/types';
import type { AccessRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ConsentsService {
  private readonly logger = new Logger(ConsentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findMine(userId: string) {
    const consents = await this.prisma.consent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { anchor: { select: { name: true } } },
    });
    return consents.map(({ anchor, ...consent }) => ({ ...consent, anchorName: anchor.name }));
  }

  async revoke(userId: string, consentId: string) {
    const consent = await this.prisma.consent.findUnique({ where: { id: consentId } });
    if (!consent) throw new NotFoundException('Consent not found');
    if (consent.userId !== userId) {
      throw new ForbiddenException('You do not have access to this consent');
    }
    if (consent.status !== ConsentStatus.ACTIVE) {
      throw new ForbiddenException('Only an active consent can be revoked');
    }

    const updated = await this.prisma.consent.update({
      where: { id: consentId },
      data: { status: ConsentStatus.REVOKED, revokedAt: new Date() },
    });

    await this.auditLogs.record({
      action: AuditAction.CONSENT_REVOKED,
      actorId: userId,
      targetType: 'Consent',
      targetId: consentId,
      metadata: { anchorId: consent.anchorId },
    });

    return updated;
  }

  /** Invoked by AccessRequestsService when a user approves an AccessRequest. */
  async grantFromAccessRequest(accessRequest: AccessRequest, userId: string) {
    const expiresAt = new Date(
      Date.now() + accessRequest.requestedExpiryDays * 24 * 60 * 60 * 1000,
    );

    const consent = await this.prisma.consent.create({
      data: {
        userId,
        identityProfileId: accessRequest.identityProfileId,
        anchorId: accessRequest.anchorId,
        scopes: accessRequest.scopes,
        expiresAt,
        accessRequestId: accessRequest.id,
      },
    });

    await this.auditLogs.record({
      action: AuditAction.CONSENT_GRANTED,
      actorId: userId,
      targetType: 'Consent',
      targetId: consent.id,
      metadata: { anchorId: accessRequest.anchorId, scopes: accessRequest.scopes },
    });

    return consent;
  }

  @Cron('0 * * * *')
  async expireStale() {
    const result = await this.prisma.consent.updateMany({
      where: { status: ConsentStatus.ACTIVE, expiresAt: { lt: new Date() } },
      data: { status: ConsentStatus.EXPIRED },
    });
    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} stale consent grant(s)`);
      await this.auditLogs.record({
        action: AuditAction.CONSENT_EXPIRED,
        metadata: { count: result.count },
      });
    }
    return result;
  }
}
