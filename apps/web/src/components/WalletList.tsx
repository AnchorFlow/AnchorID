'use client';

import { useTransition } from 'react';
import type { WalletDto } from '@anchorid/types';
import { setPrimaryWallet, removeWallet } from '../lib/actions/wallets';

export function WalletList({ wallets }: { wallets: WalletDto[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
      {wallets.map((wallet) => (
        <div key={wallet.id} className="flex items-center justify-between py-3">
          <div>
            <p className="font-mono text-sm">{wallet.stellarAddress}</p>
            <p className="text-xs text-muted-foreground">
              {wallet.isPrimary ? 'Primary' : 'Secondary'} ·{' '}
              {wallet.verifiedAt ? 'Verified' : 'Unverified'}
            </p>
          </div>
          <div className="flex gap-2">
            {!wallet.isPrimary && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => setPrimaryWallet(wallet.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
              >
                Make primary
              </button>
            )}
            {!wallet.isPrimary && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => removeWallet(wallet.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
