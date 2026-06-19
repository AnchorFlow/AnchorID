'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  requestChallenge,
  completeLogin,
  loginWithDevKeypair,
  generateDevKeypair,
} from '../lib/actions/auth';
import { freighterAdapter } from '../lib/wallet';

type Tab = 'freighter' | 'demo';

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('demo');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function afterLogin() {
    router.push('/dashboard');
    router.refresh();
  }

  function handleFreighterConnect() {
    setError(null);
    startTransition(async () => {
      try {
        const available = await freighterAdapter.isAvailable();
        if (!available) {
          throw new Error('Freighter extension not detected in this browser');
        }
        const address = await freighterAdapter.connect();
        const challenge = await requestChallenge(address);
        const signedXdr = await freighterAdapter.sign(
          challenge.transactionXdr,
          challenge.networkPassphrase,
        );
        await completeLogin(address, signedXdr);
        afterLogin();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect Freighter');
      }
    });
  }

  function handleGenerateDevKeypair() {
    setError(null);
    startTransition(async () => {
      const keypair = await generateDevKeypair();
      setSecret(keypair.secret);
    });
  }

  function handleDevLogin() {
    setError(null);
    startTransition(async () => {
      try {
        await loginWithDevKeypair(secret.trim());
        afterLogin();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    });
  }

  return (
    <div className="mt-8">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab('demo')}
          className={`px-3 py-2 text-sm font-medium ${tab === 'demo' ? 'border-b-2 border-slate-900 dark:border-white' : 'text-muted-foreground'}`}
        >
          Demo wallet (Testnet)
        </button>
        <button
          type="button"
          onClick={() => setTab('freighter')}
          className={`px-3 py-2 text-sm font-medium ${tab === 'freighter' ? 'border-b-2 border-slate-900 dark:border-white' : 'text-muted-foreground'}`}
        >
          Freighter
        </button>
      </div>

      {tab === 'demo' ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            For local development only — generates a disposable Testnet keypair and signs the
            login challenge for you, so you can exercise the full flow without a browser wallet
            extension.
          </p>
          <textarea
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="S... (Testnet secret key)"
            rows={2}
            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm font-mono dark:border-slate-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerateDevKeypair}
              disabled={isPending}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
            >
              Generate new keypair
            </button>
            <button
              type="button"
              onClick={handleDevLogin}
              disabled={isPending || !secret.trim()}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Signs the challenge inside the Freighter extension — your secret key is never sent to
            this app or the API.
          </p>
          <button
            type="button"
            onClick={handleFreighterConnect}
            disabled={isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            {isPending ? 'Connecting…' : 'Connect Freighter'}
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
