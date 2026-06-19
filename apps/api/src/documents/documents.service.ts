import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuditAction, DocumentStatus, DocumentType, Role } from '@anchorid/types';
import { buildDocumentStorageKey, sha256Checksum, type StorageAdapter } from '@anchorid/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { STORAGE_ADAPTER } from '../common/storage/storage.module';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter,
  ) {}

  async upload(userId: string, type: DocumentType, file: Express.Multer.File) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Create an identity profile before uploading documents');
    }

    const documentId = randomUUID();
    const storageKey = buildDocumentStorageKey(profile.id, documentId, file.originalname);
    await this.storage.put({ key: storageKey, body: file.buffer, contentType: file.mimetype });

    const document = await this.prisma.document.create({
      data: {
        id: documentId,
        identityProfileId: profile.id,
        type,
        status: DocumentStatus.PENDING,
        storageKey,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        checksum: sha256Checksum(file.buffer),
      },
    });

    await this.auditLogs.record({
      action: AuditAction.DOCUMENT_UPLOADED,
      actorId: userId,
      targetType: 'Document',
      targetId: document.id,
      metadata: { type },
    });

    return document;
  }

  async findMine(userId: string) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.document.findMany({
      where: { identityProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllForReview(params: { page: number; pageSize: number; status?: DocumentStatus }) {
    const { page, pageSize, status } = params;
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: { identityProfile: { select: { firstName: true, lastName: true, userId: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.document.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }

  async findByIdForUser(id: string, requester: { id: string; role: Role }) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { identityProfile: true },
    });
    if (!document) throw new NotFoundException('Document not found');
    if (requester.role !== Role.ADMIN && document.identityProfile.userId !== requester.id) {
      throw new ForbiddenException('You do not have access to this document');
    }
    return document;
  }

  async getFileBuffer(id: string, requester: { id: string; role: Role }) {
    const document = await this.findByIdForUser(id, requester);
    const buffer = await this.storage.get(document.storageKey);
    return { buffer, mimeType: document.mimeType, fileName: document.fileName };
  }

  async review(
    id: string,
    reviewerId: string,
    approve: boolean,
    rejectionReason: string | undefined,
  ) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        status: approve ? DocumentStatus.APPROVED : DocumentStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: approve ? null : rejectionReason ?? 'Not specified',
      },
    });

    await this.auditLogs.record({
      action: AuditAction.DOCUMENT_REVIEWED,
      actorId: reviewerId,
      actorRole: Role.ADMIN,
      targetType: 'Document',
      targetId: id,
      metadata: { approve, rejectionReason },
    });

    return updated;
  }
}
