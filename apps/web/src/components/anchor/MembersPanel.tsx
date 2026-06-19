'use client';

import { useState, useTransition } from 'react';
import type { AnchorMemberDto } from '@anchorid/types';
import { addMember, removeMember } from '../../lib/actions/anchors';

export function MembersPanel({
  anchorId,
  members,
}: {
  anchorId: string;
  members: (AnchorMemberDto & { id: string })[];
}) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'ANCHOR_ADMIN' | 'ANCHOR_MEMBER'>('ANCHOR_MEMBER');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addMember(anchorId, userId.trim(), role);
        setUserId('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add member');
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID (UUID)"
          className="w-64 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm font-mono dark:border-slate-700"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'ANCHOR_ADMIN' | 'ANCHOR_MEMBER')}
          className="rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        >
          <option value="ANCHOR_MEMBER">Member</option>
          <option value="ANCHOR_ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          disabled={isPending || !userId.trim()}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          Add member
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm">{member.email ?? member.userId}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => removeMember(anchorId, member.id))}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-red-600 dark:border-slate-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
