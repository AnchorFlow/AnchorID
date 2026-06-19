import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuditAction, Role } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordAuditInput {
  action: AuditAction;
  actorId?: string | null;
  actorRole?: Role | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditInput) {
    return this.prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        actorRole: input.actorRole ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }

  async findAll(params: {
    page: number;
    pageSize: number;
    action?: string;
    actorId?: string;
  }) {
    const { page, pageSize, action, actorId } = params;
    const where = {
      ...(action ? { action: action as AuditAction } : {}),
      ...(actorId ? { actorId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }
}
