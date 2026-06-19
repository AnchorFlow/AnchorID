'use client';

import { useTransition } from 'react';
import { StatusBadge } from '@anchorid/ui';
import type { ConsentDto } from '@anchorid/types';
import { revokeConsent } from '../lib/actions/consents';

export function ConsentList({ consents }: { consents: ConsentDto[] }) {
  const [isPending, startTransition] = useTransition();

  if (consents.length === 0) {
    return <p className="text-sm text-muted-foreground">No consent grants yet.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {consents.map((consent) => (
        <div key={consent.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{consent.anchorName ?? consent.anchorId}</p>
            <p className="text-xs text-muted-foreground">
              Scopes: {consent.scopes.join(', ')}
              {consent.expiresAt ? ` · Expires ${new Date(consent.expiresAt).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={consent.status} />
            {consent.status === 'ACTIVE' && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => revokeConsent(consent.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
              >
                Revoke
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
