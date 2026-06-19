'use client';

import { useState, useTransition } from 'react';
import type { AnchorApiCredentialDto } from '@anchorid/types';
import { createApiCredential, revokeApiCredential } from '../../lib/actions/anchors';

export function CredentialsPanel({
  anchorId,
  credentials,
}: {
  anchorId: string;
  credentials: AnchorApiCredentialDto[];
}) {
  const [label, setLabel] = useState('');
  const [newSecret, setNewSecret] = useState<{ keyId: string; secret: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const credential = await createApiCredential(anchorId, label.trim() || undefined);
        setNewSecret({ keyId: credential.keyId, secret: credential.secret! });
        setLabel('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create credential');
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-64 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          Create API credential
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {newSecret ? (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/30">
          <p className="font-medium">Save this secret — it won&apos;t be shown again.</p>
          <p className="mt-1 font-mono text-xs">x-api-key-id: {newSecret.keyId}</p>
          <p className="font-mono text-xs">x-api-key-secret: {newSecret.secret}</p>
        </div>
      ) : null}

      <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
        {credentials.map((credential) => (
          <div key={credential.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-mono">{credential.keyId}</p>
              <p className="text-xs text-muted-foreground">
                {credential.label ?? 'No label'}
                {credential.revokedAt ? ' · Revoked' : ''}
              </p>
            </div>
            {!credential.revokedAt && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => revokeApiCredential(anchorId, credential.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
