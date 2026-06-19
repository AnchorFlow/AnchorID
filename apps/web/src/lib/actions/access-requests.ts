'use server';

import { revalidatePath } from 'next/cache';
import type { AccessRequestDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';

export async function listMyAccessRequests(): Promise<AccessRequestDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch<AccessRequestDto[]>('/access-requests/me', { accessToken });
}

export async function approveAccessRequest(id: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/access-requests/${id}/approve`, { method: 'PATCH', accessToken });
  revalidatePath('/dashboard/access-requests');
  revalidatePath('/dashboard/consents');
}

export async function denyAccessRequest(id: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/access-requests/${id}/deny`, { method: 'PATCH', accessToken });
  revalidatePath('/dashboard/access-requests');
}
