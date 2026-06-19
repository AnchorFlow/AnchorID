'use server';

import { revalidatePath } from 'next/cache';
import type {
  AnchorApiCredentialDto,
  AnchorMemberDto,
  AnchorOrganizationDto,
  AnchorStatus,
  RegisterAnchorInput,
  Role,
} from '@anchorid/types';
import type { AccessRequestDto, PaginatedDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';

export type MyAnchorDto = AnchorOrganizationDto & { myRole: Role };

export async function registerAnchor(input: RegisterAnchorInput) {
  const accessToken = await requireAccessToken();
  const anchor = await apiFetch<AnchorOrganizationDto>('/anchors', {
    method: 'POST',
    accessToken,
    body: input,
  });
  revalidatePath('/anchor');
  return anchor;
}

export async function listMyAnchors(): Promise<MyAnchorDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch<MyAnchorDto[]>('/anchors/mine', { accessToken });
}

export async function getAnchor(anchorId: string): Promise<AnchorOrganizationDto> {
  const accessToken = await requireAccessToken();
  return apiFetch<AnchorOrganizationDto>(`/anchors/${anchorId}`, { accessToken });
}

export async function listMembers(anchorId: string): Promise<(AnchorMemberDto & { id: string })[]> {
  const accessToken = await requireAccessToken();
  return apiFetch(`/anchors/${anchorId}/members`, { accessToken });
}

export async function addMember(anchorId: string, userId: string, role: 'ANCHOR_ADMIN' | 'ANCHOR_MEMBER') {
  const accessToken = await requireAccessToken();
  await apiFetch(`/anchors/${anchorId}/members`, {
    method: 'POST',
    accessToken,
    body: { userId, role },
  });
  revalidatePath(`/anchor/${anchorId}/members`);
}

export async function removeMember(anchorId: string, memberId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/anchors/${anchorId}/members/${memberId}`, { method: 'DELETE', accessToken });
  revalidatePath(`/anchor/${anchorId}/members`);
}

export async function listApiCredentials(anchorId: string): Promise<AnchorApiCredentialDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch(`/anchors/${anchorId}/api-credentials`, { accessToken });
}

export async function createApiCredential(anchorId: string, label?: string) {
  const accessToken = await requireAccessToken();
  const credential = await apiFetch<AnchorApiCredentialDto>(`/anchors/${anchorId}/api-credentials`, {
    method: 'POST',
    accessToken,
    body: { label },
  });
  revalidatePath(`/anchor/${anchorId}/credentials`);
  return credential;
}

export async function revokeApiCredential(anchorId: string, credentialId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/anchors/${anchorId}/api-credentials/${credentialId}`, {
    method: 'DELETE',
    accessToken,
  });
  revalidatePath(`/anchor/${anchorId}/credentials`);
}

export async function listAccessRequestsForAnchor(anchorId: string): Promise<AccessRequestDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch(`/access-requests/anchor/${anchorId}`, { accessToken });
}

// --- Admin-facing anchor review (used by the (admin) section) -------------

export async function listAnchorReviewQueue(status?: AnchorStatus): Promise<PaginatedDto<AnchorOrganizationDto>> {
  const accessToken = await requireAccessToken();
  const query = status ? `?status=${status}` : '';
  return apiFetch(`/anchors/review-queue${query}`, { accessToken });
}

export async function reviewAnchor(anchorId: string, approve: boolean, rejectionReason?: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/anchors/${anchorId}/review`, {
    method: 'PATCH',
    accessToken,
    body: { approve, rejectionReason },
  });
  revalidatePath('/admin/anchors');
}

export async function suspendAnchor(anchorId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/anchors/${anchorId}/suspend`, { method: 'PATCH', accessToken });
  revalidatePath('/admin/anchors');
}
