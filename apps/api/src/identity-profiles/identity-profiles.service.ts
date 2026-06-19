import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { CreateIdentityProfileDto } from './dto/create-identity-profile.dto';
import type { UpdateIdentityProfileDto } from './dto/update-identity-profile.dto';

@Injectable()
export class IdentityProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findByUserId(userId: string) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Identity profile not found');
    return profile;
  }

  async findByUserIdOrNull(userId: string) {
    return this.prisma.identityProfile.findUnique({ where: { userId } });
  }

  async findById(id: string) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Identity profile not found');
    return profile;
  }

  async create(userId: string, dto: CreateIdentityProfileDto) {
    const existing = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('Identity profile already exists for this user');
    }

    const profile = await this.prisma.identityProfile.create({
      data: { userId, ...dto, dateOfBirth: new Date(dto.dateOfBirth) },
    });

    await this.auditLogs.record({
      action: AuditAction.IDENTITY_CREATED,
      actorId: userId,
      targetType: 'IdentityProfile',
      targetId: profile.id,
    });

    return profile;
  }

  async update(userId: string, dto: UpdateIdentityProfileDto) {
    const existing = await this.findByUserId(userId);

    const profile = await this.prisma.identityProfile.update({
      where: { id: existing.id },
      data: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined },
    });

    await this.auditLogs.record({
      action: AuditAction.IDENTITY_UPDATED,
      actorId: userId,
      targetType: 'IdentityProfile',
      targetId: profile.id,
      metadata: { changedFields: Object.keys(dto) },
    });

    return profile;
  }
}
