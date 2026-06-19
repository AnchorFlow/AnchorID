import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AnchorStatus, AuditAction, Role } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { RegisterAnchorDto } from './dto/register-anchor.dto';
import type { ReviewAnchorDto } from './dto/review-anchor.dto';
import type { AddAnchorMemberDto } from './dto/add-anchor-member.dto';
import type { CreateApiCredentialDto } from './dto/create-api-credential.dto';

type Requester = { id: string; role: Role };

@Injectable()
export class AnchorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async register(userId: string, dto: RegisterAnchorDto) {
    const anchor = await this.prisma.anchorOrganization.create({
      data: {
        name: dto.name,
        legalName: dto.legalName,
        website: dto.website,
        homeDomain: dto.homeDomain,
        description: dto.description,
        members: {
          create: { userId, role: Role.ANCHOR_ADMIN },
        },
      },
    });

    await this.auditLogs.record({
      action: AuditAction.ANCHOR_REGISTERED,
      actorId: userId,
      targetType: 'AnchorOrganization',
      targetId: anchor.id,
      metadata: { homeDomain: dto.homeDomain },
    });

    return anchor;
  }

  async findMine(userId: string) {
    const memberships = await this.prisma.anchorMember.findMany({
      where: { userId, deletedAt: null },
      include: { anchor: true },
    });
    return memberships.map((m) => ({ ...m.anchor, myRole: m.role }));
  }

  async findAllForReview(params: { page: number; pageSize: number; status?: AnchorStatus }) {
    const { page, pageSize, status } = params;
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.prisma.anchorOrganization.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.anchorOrganization.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async findById(id: string, requester: Requester) {
    const anchor = await this.prisma.anchorOrganization.findUnique({ where: { id } });
    if (!anchor) throw new NotFoundException('Anchor not found');
    if (requester.role !== Role.ADMIN) {
      await this.assertMember(id, requester.id);
    }
    return anchor;
  }

  async review(id: string, adminId: string, dto: ReviewAnchorDto) {
    const anchor = await this.prisma.anchorOrganization.findUnique({ where: { id } });
    if (!anchor) throw new NotFoundException('Anchor not found');

    const updated = await this.prisma.anchorOrganization.update({
      where: { id },
      data: {
        status: dto.approve ? AnchorStatus.APPROVED : AnchorStatus.REJECTED,
        approvedById: dto.approve ? adminId : null,
        approvedAt: dto.approve ? new Date() : null,
        rejectionReason: dto.approve ? null : dto.rejectionReason ?? 'Not specified',
      },
    });

    await this.auditLogs.record({
      action: dto.approve ? AuditAction.ANCHOR_APPROVED : AuditAction.ANCHOR_REJECTED,
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetType: 'AnchorOrganization',
      targetId: id,
    });

    return updated;
  }

  async suspend(id: string, adminId: string) {
    const anchor = await this.prisma.anchorOrganization.findUnique({ where: { id } });
    if (!anchor) throw new NotFoundException('Anchor not found');

    const updated = await this.prisma.anchorOrganization.update({
      where: { id },
      data: { status: AnchorStatus.SUSPENDED },
    });

    await this.auditLogs.record({
      action: AuditAction.ANCHOR_SUSPENDED,
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetType: 'AnchorOrganization',
      targetId: id,
    });

    return updated;
  }

  async listMembers(anchorId: string, requester: Requester) {
    if (requester.role !== Role.ADMIN) {
      await this.assertMember(anchorId, requester.id);
    }
    return this.prisma.anchorMember.findMany({
      where: { anchorId, deletedAt: null },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  async addMember(anchorId: string, requester: Requester, dto: AddAnchorMemberDto) {
    if (requester.role !== Role.ADMIN) {
      await this.assertAnchorAdmin(anchorId, requester.id);
    }

    const existing = await this.prisma.anchorMember.findUnique({
      where: { anchorId_userId: { anchorId, userId: dto.userId } },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException('User is already a member of this anchor');
    }

    const member = existing
      ? await this.prisma.anchorMember.update({
          where: { id: existing.id },
          data: { role: dto.role, deletedAt: null },
        })
      : await this.prisma.anchorMember.create({
          data: { anchorId, userId: dto.userId, role: dto.role },
        });

    await this.auditLogs.record({
      action: AuditAction.ANCHOR_MEMBER_ADDED,
      actorId: requester.id,
      targetType: 'AnchorMember',
      targetId: member.id,
      metadata: { anchorId, userId: dto.userId, role: dto.role },
    });

    return member;
  }

  async removeMember(anchorId: string, memberId: string, requester: Requester) {
    if (requester.role !== Role.ADMIN) {
      await this.assertAnchorAdmin(anchorId, requester.id);
    }

    const member = await this.prisma.anchorMember.findFirst({
      where: { id: memberId, anchorId, deletedAt: null },
    });
    if (!member) throw new NotFoundException('Anchor member not found');

    await this.prisma.anchorMember.update({
      where: { id: memberId },
      data: { deletedAt: new Date() },
    });

    await this.auditLogs.record({
      action: AuditAction.ANCHOR_MEMBER_REMOVED,
      actorId: requester.id,
      targetType: 'AnchorMember',
      targetId: memberId,
      metadata: { anchorId },
    });

    return { success: true };
  }

  async listApiCredentials(anchorId: string, requester: Requester) {
    if (requester.role !== Role.ADMIN) {
      await this.assertMember(anchorId, requester.id);
    }
    const credentials = await this.prisma.anchorApiCredential.findMany({
      where: { anchorId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return credentials.map(({ secretHash, ...rest }) => rest);
  }

  async createApiCredential(anchorId: string, requester: Requester, dto: CreateApiCredentialDto) {
    if (requester.role !== Role.ADMIN) {
      await this.assertAnchorAdmin(anchorId, requester.id);
    }

    const anchor = await this.prisma.anchorOrganization.findUnique({ where: { id: anchorId } });
    if (!anchor) throw new NotFoundException('Anchor not found');
    if (anchor.status !== AnchorStatus.APPROVED) {
      throw new ForbiddenException('Anchor must be approved before issuing API credentials');
    }

    const keyId = randomUUID();
    const secret = randomBytes(32).toString('base64url');
    const secretHash = await bcrypt.hash(secret, 12);

    const credential = await this.prisma.anchorApiCredential.create({
      data: { anchorId, keyId, secretHash, label: dto.label },
    });

    await this.auditLogs.record({
      action: AuditAction.API_KEY_CREATED,
      actorId: requester.id,
      targetType: 'AnchorApiCredential',
      targetId: credential.id,
      metadata: { anchorId },
    });

    // The plaintext secret is only ever returned once, at creation time.
    return { id: credential.id, keyId, secret, label: credential.label };
  }

  async revokeApiCredential(anchorId: string, credentialId: string, requester: Requester) {
    if (requester.role !== Role.ADMIN) {
      await this.assertAnchorAdmin(anchorId, requester.id);
    }

    const credential = await this.prisma.anchorApiCredential.findFirst({
      where: { id: credentialId, anchorId, deletedAt: null },
    });
    if (!credential) throw new NotFoundException('API credential not found');

    await this.prisma.anchorApiCredential.update({
      where: { id: credentialId },
      data: { revokedAt: new Date() },
    });

    await this.auditLogs.record({
      action: AuditAction.API_KEY_REVOKED,
      actorId: requester.id,
      targetType: 'AnchorApiCredential',
      targetId: credentialId,
      metadata: { anchorId },
    });

    return { success: true };
  }

  private async assertMember(anchorId: string, userId: string) {
    const member = await this.prisma.anchorMember.findFirst({
      where: { anchorId, userId, deletedAt: null },
    });
    if (!member) throw new ForbiddenException('You are not a member of this anchor organization');
    return member;
  }

  private async assertAnchorAdmin(anchorId: string, userId: string) {
    const member = await this.assertMember(anchorId, userId);
    if (member.role !== Role.ANCHOR_ADMIN) {
      throw new ForbiddenException('Only an anchor admin can perform this action');
    }
    return member;
  }
}
