'use server';

import { revalidatePath } from 'next/cache';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import type { WalletDto } from '@anchorid/types';
import { apiFetch } from '../api';
import { requireAccessToken } from '../session';
import { requestChallenge } from './auth';

export async function listMyWallets(): Promise<WalletDto[]> {
  const accessToken = await requireAccessToken();
  return apiFetch<WalletDto[]>('/wallets/me', { accessToken });
}

async function linkWallet(stellarAddress: string, transactionXdr: string) {
  const accessToken = await requireAccessToken();
  await apiFetch('/wallets/me', {
    method: 'POST',
    accessToken,
    body: { stellarAddress, transactionXdr },
  });
  revalidatePath('/dashboard/wallets');
}

/** Mirrors loginWithDevKeypair in auth.ts, but links instead of logging in. */
export async function linkWalletWithDevKeypair(secret: string) {
  const keypair = Keypair.fromSecret(secret);
  const stellarAddress = keypair.publicKey();
  const challenge = await requestChallenge(stellarAddress);
  const transaction = TransactionBuilder.fromXDR(challenge.transactionXdr, challenge.networkPassphrase);
  if ('innerTransaction' in transaction) {
    throw new Error('Unexpected fee-bump transaction from challenge endpoint');
  }
  transaction.sign(keypair);
  await linkWallet(stellarAddress, transaction.toEnvelope().toXDR('base64'));
}

export async function completeWalletLink(stellarAddress: string, signedTransactionXdr: string) {
  await linkWallet(stellarAddress, signedTransactionXdr);
}

export async function setPrimaryWallet(walletId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/wallets/me/${walletId}/primary`, { method: 'PATCH', accessToken });
  revalidatePath('/dashboard/wallets');
}

export async function removeWallet(walletId: string) {
  const accessToken = await requireAccessToken();
  await apiFetch(`/wallets/me/${walletId}`, { method: 'DELETE', accessToken });
  revalidatePath('/dashboard/wallets');
}
