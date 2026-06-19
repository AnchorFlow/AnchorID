'use server';

import { revalidatePath } from 'next/cache';
import type { AuditLogDto, DocumentDto, PaginatedDto, UserDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';

export interface AdminDashboard {
  pendingAnchors: number;
  pendingDocuments: number;
  pendingAccessRequests: number;
  totalUsers: number;
  totalAnchors: number;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const accessToken = await requireAccessToken();
  return apiFetch<AdminDashboard>('/admin/dashboard', { accessToken });
}

export async function suspendUser(userId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/admin/users/${userId}/suspend`, { method: 'PATCH', accessToken });
  revalidatePath('/admin/users');
}

export async function reactivateUser(userId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/admin/users/${userId}/reactivate`, { method: 'PATCH', accessToken });
  revalidatePath('/admin/users');
}

export async function listUsers(page = 1): Promise<PaginatedDto<UserDto>> {
  const accessToken = await requireAccessToken();
  return apiFetch(`/users?page=${page}&pageSize=25`, { accessToken });
}

export async function listDocumentReviewQueue(): Promise<PaginatedDto<DocumentDto>> {
  const accessToken = await requireAccessToken();
  return apiFetch('/documents/review-queue?pageSize=50', { accessToken });
}

export async function reviewDocument(documentId: string, approve: boolean, rejectionReason?: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/documents/${documentId}/review`, {
    method: 'PATCH',
    accessToken,
    body: { approve, rejectionReason },
  });
  revalidatePath('/admin/documents');
}

export async function listAuditLogs(page = 1): Promise<PaginatedDto<AuditLogDto>> {
  const accessToken = await requireAccessToken();
  return apiFetch(`/audit-logs?page=${page}&pageSize=50`, { accessToken });
}
