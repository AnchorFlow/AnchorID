'use server';

import { revalidatePath } from 'next/cache';
import type { ConsentDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';

export async function listMyConsents(): Promise<ConsentDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch<ConsentDto[]>('/consents/me', { accessToken });
}

export async function revokeConsent(consentId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/consents/${consentId}`, { method: 'DELETE', accessToken });
  revalidatePath('/dashboard/consents');
}
