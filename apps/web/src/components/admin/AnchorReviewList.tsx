'use client';

import { useTransition } from 'react';
import { StatusBadge } from '@anchorid/ui';
import type { AnchorOrganizationDto } from '@anchorid/types';
import { reviewAnchor, suspendAnchor } from '../../lib/actions/anchors';

export function AnchorReviewList({ anchors }: { anchors: AnchorOrganizationDto[] }) {
  const [isPending, startTransition] = useTransition();

  if (anchors.length === 0) {
    return <p className="text-sm text-muted-foreground">No anchors to review.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {anchors.map((anchor) => (
        <div key={anchor.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{anchor.name}</p>
            <p className="text-xs text-muted-foreground">{anchor.homeDomain} · {anchor.legalName}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={anchor.status} />
            {anchor.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => reviewAnchor(anchor.id, true))}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => reviewAnchor(anchor.id, false, 'Not specified'))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                >
                  Reject
                </button>
              </>
            )}
            {anchor.status === 'APPROVED' && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => suspendAnchor(anchor.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
              >
                Suspend
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
