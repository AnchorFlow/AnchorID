'use server';

import type { VerificationDto } from '@anchorid/types';
import { apiFetch, ApiError } from '../api';
import { requireAccessToken } from '../session';

export async function listMyVerifications(): Promise<VerificationDto[]> {
  const accessToken = await requireAccessToken();
  try {
    return await apiFetch<VerificationDto[]>('/verifications/me', { accessToken });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}
