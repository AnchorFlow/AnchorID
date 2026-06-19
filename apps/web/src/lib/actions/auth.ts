'use server';

import { redirect } from 'next/navigation';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import type { AuthTokensDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { setSessionCookies, clearSessionCookies, getRefreshToken } from '../session';

export interface ChallengeResult {
  transactionXdr: string;
  networkPassphrase: string;
}

/** Step 1 of any wallet login: ask the API for a SEP-10-style challenge to sign. */
export async function requestChallenge(stellarAddress: string): Promise<ChallengeResult> {
  return apiFetch<ChallengeResult>('/auth/challenge', { method: 'POST', body: { stellarAddress } });
}

/** Step 2: submit the wallet-signed challenge, set session cookies on success. */
export async function completeLogin(stellarAddress: string, signedTransactionXdr: string) {
  const tokens = await apiFetch<AuthTokensDto>('/auth/verify', {
    method: 'POST',
    body: { stellarAddress, transactionXdr: signedTransactionXdr },
  });
  await setSessionCookies({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    role: tokens.user.role,
  });
  return tokens.user;
}

/**
 * Demo-only login path: generates/uses a local Stellar keypair and signs the
 * challenge server-side, so the golden path is testable without a browser
 * wallet extension. Never use a real account's secret key here — this exists
 * purely so the SEP-10 flow can be exercised against Testnet without
 * Freighter/Albedo installed. Real wallets should sign client-side (see
 * `connectFreighter` in lib/wallet.ts) and only ever hand the *signed* XDR to
 * a route handler — the secret key never leaves the browser extension.
 */
export async function loginWithDevKeypair(secret: string) {
  const keypair = Keypair.fromSecret(secret);
  const stellarAddress = keypair.publicKey();

  const challenge = await requestChallenge(stellarAddress);
  const transaction = TransactionBuilder.fromXDR(
    challenge.transactionXdr,
    challenge.networkPassphrase,
  );
  if ('innerTransaction' in transaction) {
    throw new Error('Unexpected fee-bump transaction from challenge endpoint');
  }
  transaction.sign(keypair);
  const signedXdr = transaction.toEnvelope().toXDR('base64');

  return completeLogin(stellarAddress, signedXdr);
}

export async function generateDevKeypair() {
  const keypair = Keypair.random();
  return { publicKey: keypair.publicKey(), secret: keypair.secret() };
}

export async function logoutAction() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await apiFetch('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {});
  }
  await clearSessionCookies();
  redirect('/login');
}
