'use client';

import { useState, useTransition } from 'react';
import { requestChallenge } from '../lib/actions/auth';
import { linkWalletWithDevKeypair, completeWalletLink } from '../lib/actions/wallets';
import { freighterAdapter } from '../lib/wallet';

export function WalletLinkForm() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDevLink() {
    setError(null);
    startTransition(async () => {
      try {
        await linkWalletWithDevKeypair(secret.trim());
        setSecret('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to link wallet');
      }
    });
  }

  function handleFreighterLink() {
    setError(null);
    startTransition(async () => {
      try {
        const available = await freighterAdapter.isAvailable();
        if (!available) throw new Error('Freighter extension not detected in this browser');
        const address = await freighterAdapter.connect();
        const challenge = await requestChallenge(address);
        const signedXdr = await freighterAdapter.sign(challenge.transactionXdr, challenge.networkPassphrase);
        await completeWalletLink(address, signedXdr);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to link wallet');
      }
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm font-medium">Link another wallet</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="S... (Testnet secret key)"
          className="w-72 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm font-mono dark:border-slate-700"
        />
        <button
          type="button"
          onClick={handleDevLink}
          disabled={isPending || !secret.trim()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
        >
          Link demo keypair
        </button>
        <button
          type="button"
          onClick={handleFreighterLink}
          disabled={isPending}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          Link via Freighter
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
