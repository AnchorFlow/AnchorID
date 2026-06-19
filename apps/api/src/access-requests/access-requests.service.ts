import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessRequestStatus, AnchorStatus, AuditAction } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ConsentsService } from '../consents/consents.service';
import type { CreateAccessRequestDto } from '../anchors/dto/create-access-request.dto';

@Injectable()
export class AccessRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly consentsService: ConsentsService,
  ) {}

  async createForAnchor(anchorId: string, dto: CreateAccessRequestDto) {
    const anchor = await this.prisma.anchorOrganization.findUnique({ where: { id: anchorId } });
    if (!anchor || anchor.status !== AnchorStatus.APPROVED) {
      throw new ForbiddenException('Anchor is not approved to request access');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { stellarAddress: dto.stellarAddress },
      include: { user: { include: { identityProfile: true } } },
    });
    if (!wallet?.user.identityProfile) {
      throw new NotFoundException('No identity profile found for this Stellar address');
    }

    const accessRequest = await this.prisma.accessRequest.create({
      data: {
        anchorId,
        identityProfileId: wallet.user.identityProfile.id,
        scopes: dto.scopes,
        reason: dto.reason,
        requestedExpiryDays: dto.requestedExpiryDays ?? 90,
      },
    });

    await this.auditLogs.record({
      action: AuditAction.ACCESS_REQUEST_CREATED,
      targetType: 'AccessRequest',
      targetId: accessRequest.id,
      metadata: { anchorId, scopes: dto.scopes },
    });

    return accessRequest;
  }

  async findMineForUser(userId: string) {
    const accessRequests = await this.prisma.accessRequest.findMany({
      where: { identityProfile: { userId } },
      orderBy: { createdAt: 'desc' },
      include: { anchor: { select: { name: true } } },
    });
    return accessRequests.map(({ anchor, ...request }) => ({
      ...request,
      anchorName: anchor.name,
    }));
  }

  async findForAnchor(anchorId: string, requesterId: string) {
    await this.assertMember(anchorId, requesterId);
    return this.prisma.accessRequest.findMany({
      where: { anchorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(userId: string, accessRequestId: string) {
    const accessRequest = await this.findOwnedPending(userId, accessRequestId);

    const updated = await this.prisma.accessRequest.update({
      where: { id: accessRequestId },
      data: { status: AccessRequestStatus.APPROVED, resolvedAt: new Date() },
    });

    await this.consentsService.grantFromAccessRequest(updated, userId);

    await this.auditLogs.record({
      action: AuditAction.ACCESS_REQUEST_APPROVED,
      actorId: userId,
      targetType: 'AccessRequest',
      targetId: accessRequestId,
    });

    return updated;
  }

  async deny(userId: string, accessRequestId: string) {
    await this.findOwnedPending(userId, accessRequestId);

    const updated = await this.prisma.accessRequest.update({
      where: { id: accessRequestId },
      data: { status: AccessRequestStatus.DENIED, resolvedAt: new Date() },
    });

    await this.auditLogs.record({
      action: AuditAction.ACCESS_REQUEST_DENIED,
      actorId: userId,
      targetType: 'AccessRequest',
      targetId: accessRequestId,
    });

    return updated;
  }

  private async findOwnedPending(userId: string, accessRequestId: string) {
    const accessRequest = await this.prisma.accessRequest.findUnique({
      where: { id: accessRequestId },
      include: { identityProfile: true },
    });
    if (!accessRequest) throw new NotFoundException('Access request not found');
    if (accessRequest.identityProfile.userId !== userId) {
      throw new ForbiddenException('You do not have access to this access request');
    }
    if (accessRequest.status !== AccessRequestStatus.PENDING) {
      throw new ForbiddenException('Only a pending access request can be resolved');
    }
    return accessRequest;
  }

  private async assertMember(anchorId: string, userId: string) {
    const member = await this.prisma.anchorMember.findFirst({
      where: { anchorId, userId, deletedAt: null },
    });
    if (!member) throw new ForbiddenException('You are not a member of this anchor organization');
    return member;
  }
}
