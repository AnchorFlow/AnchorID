'use server';

import type { UserDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';

export async function getMe(): Promise<UserDto> {
  const accessToken = await requireAccessToken();
  return apiFetch<UserDto>('/users/me', { accessToken });
}
