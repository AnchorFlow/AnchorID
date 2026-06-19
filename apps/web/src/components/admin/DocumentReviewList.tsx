'use client';

import { useTransition } from 'react';
import { StatusBadge } from '@anchorid/ui';
import type { DocumentDto } from '@anchorid/types';
import { reviewDocument } from '../../lib/actions/admin';

export function DocumentReviewList({ documents }: { documents: DocumentDto[] }) {
  const [isPending, startTransition] = useTransition();

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents to review.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium">{doc.type.replace(/_/g, ' ')}</p>
            <p className="text-xs text-muted-foreground">{doc.fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={doc.status} />
            {doc.status === 'PENDING' || doc.status === 'IN_REVIEW' ? (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => reviewDocument(doc.id, true))}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => reviewDocument(doc.id, false, 'Not specified'))}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
                >
                  Reject
                </button>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
