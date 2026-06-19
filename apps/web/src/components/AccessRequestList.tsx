'use client';

import { useTransition } from 'react';
import { StatusBadge } from '@anchorid/ui';
import type { AccessRequestDto } from '@anchorid/types';
import { approveAccessRequest, denyAccessRequest } from '../lib/actions/access-requests';

export function AccessRequestList({ accessRequests }: { accessRequests: AccessRequestDto[] }) {
  const [isPending, startTransition] = useTransition();

  if (accessRequests.length === 0) {
    return <p className="text-sm text-muted-foreground">No access requests yet.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {accessRequests.map((req) => (
        <div key={req.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{req.anchorName ?? req.anchorId}</p>
            <p className="text-xs text-muted-foreground">
              Wants: {req.scopes.join(', ')} · {req.requestedExpiryDays}-day grant
            </p>
            {req.reason ? <p className="text-xs text-muted-foreground">“{req.reason}”</p> : null}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} />
            {req.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => approveAccessRequest(req.id))}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => denyAccessRequest(req.id))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                >
                  Deny
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
