import 'server-only';
import { cookies } from 'next/headers';
import type { Role } from '@anchorid/types';
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from './cookie-names';

export { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE };

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export async function setSessionCookies(tokens: SessionTokens) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...baseCookieOptions, maxAge: 60 * 15 });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
  store.set(ROLE_COOKIE, tokens.role, { ...baseCookieOptions, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(ROLE_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

export async function getRole(): Promise<Role | undefined> {
  const store = await cookies();
  return store.get(ROLE_COOKIE)?.value as Role | undefined;
}

export async function requireAccessToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}
