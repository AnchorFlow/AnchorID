'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerAnchorSchema, type RegisterAnchorInput } from '@anchorid/types';
import { registerAnchor } from '../lib/actions/anchors';

export function RegisterAnchorForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAnchorInput>({ resolver: zodResolver(registerAnchorSchema) });

  async function onSubmit(values: RegisterAnchorInput) {
    setError(null);
    try {
      const anchor = await registerAnchor({
        ...values,
        website: values.website || undefined,
        description: values.description || undefined,
      });
      router.push(`/anchor/${anchor.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register anchor');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid max-w-xl gap-4">
      <Field label="Organization name" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} />
      </Field>
      <Field label="Legal name" error={errors.legalName?.message}>
        <input {...register('legalName')} className={inputClass} />
      </Field>
      <Field label="Home domain" error={errors.homeDomain?.message}>
        <input {...register('homeDomain')} className={inputClass} placeholder="example.com" />
      </Field>
      <Field label="Website" error={errors.website?.message}>
        <input {...register('website')} className={inputClass} placeholder="https://example.com" />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register('description')} rows={3} className={inputClass} />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {isSubmitting ? 'Submitting…' : 'Submit for review'}
        </button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
      <p className="text-xs text-muted-foreground">
        An AnchorID admin reviews every new organization before it can issue API credentials or
        request access to user identities.
      </p>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
