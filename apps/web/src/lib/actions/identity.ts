'use server';

import { revalidatePath } from 'next/cache';
import type { IdentityProfileDto, IdentityProfileInput } from '@anchorid/types';
import { apiFetch, ApiError } from '../api';
import { requireAccessToken } from '../session';

export async function getMyProfile(): Promise<IdentityProfileDto | null> {
  const accessToken = await requireAccessToken();
  try {
    return await apiFetch<IdentityProfileDto>('/identity-profiles/me', { accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function saveProfile(existing: boolean, input: IdentityProfileInput) {
  const accessToken = await requireAccessToken();
  const body = { ...input, dateOfBirth: input.dateOfBirth.toISOString() };
  await apiFetch('/identity-profiles/me', {
    method: existing ? 'PATCH' : 'POST',
    accessToken,
    body,
  });
  revalidatePath('/dashboard/identity');
}
