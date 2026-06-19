'use client';

import { useTransition } from 'react';
import { StatusBadge } from '@anchorid/ui';
import type { UserDto } from '@anchorid/types';
import { suspendUser, reactivateUser } from '../../lib/actions/admin';

export function UserList({ users }: { users: UserDto[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm">{user.email ?? user.id}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            {user.status === 'ACTIVE' ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => suspendUser(user.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
              >
                Suspend
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => reactivateUser(user.id))}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
              >
                Reactivate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
