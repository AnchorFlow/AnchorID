import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessRequestStatus, AccountStatus, AnchorStatus, AuditAction, DocumentStatus, Role } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async dashboard() {
    const [pendingAnchors, pendingDocuments, pendingAccessRequests, totalUsers, totalAnchors] =
      await Promise.all([
        this.prisma.anchorOrganization.count({ where: { status: AnchorStatus.PENDING } }),
        this.prisma.document.count({ where: { status: DocumentStatus.PENDING } }),
        this.prisma.accessRequest.count({ where: { status: AccessRequestStatus.PENDING } }),
        this.prisma.user.count(),
        this.prisma.anchorOrganization.count(),
      ]);

    return { pendingAnchors, pendingDocuments, pendingAccessRequests, totalUsers, totalAnchors };
  }

  async suspendUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.SUSPENDED },
    });

    await this.auditLogs.record({
      action: AuditAction.ACCOUNT_SUSPENDED,
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetType: 'User',
      targetId: userId,
    });

    return updated;
  }

  async reactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.ACTIVE },
    });

    await this.auditLogs.record({
      action: AuditAction.ACCOUNT_REACTIVATED,
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetType: 'User',
      targetId: userId,
    });

    return updated;
  }
}
