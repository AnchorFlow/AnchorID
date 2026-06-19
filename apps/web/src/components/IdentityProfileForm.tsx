'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identityProfileSchema, type IdentityProfileDto } from '@anchorid/types';
import { saveProfile } from '../lib/actions/identity';

type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phoneNumber: string;
  governmentIdType?: string;
  governmentIdNumber: string;
};

export function IdentityProfileForm({ profile }: { profile: IdentityProfileDto | null }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // dateOfBirth is a coerced Date in the shared schema; the form keeps it
    // as the raw <input type="date"> string and lets the resolver coerce it.
    resolver: zodResolver(identityProfileSchema) as never,
    defaultValues: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          dateOfBirth: profile.dateOfBirth.slice(0, 10),
          nationality: profile.nationality,
          address: profile.address,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          governmentIdType: profile.governmentIdType ?? '',
          governmentIdNumber: profile.governmentIdNumber,
        }
      : undefined,
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setSaved(false);
    try {
      await saveProfile(Boolean(profile), { ...values, dateOfBirth: new Date(values.dateOfBirth) });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="First name" error={errors.firstName?.message}>
        <input {...register('firstName')} className={inputClass} />
      </Field>
      <Field label="Last name" error={errors.lastName?.message}>
        <input {...register('lastName')} className={inputClass} />
      </Field>
      <Field label="Date of birth" error={errors.dateOfBirth?.message}>
        <input type="date" {...register('dateOfBirth')} className={inputClass} />
      </Field>
      <Field label="Nationality" error={errors.nationality?.message}>
        <input {...register('nationality')} className={inputClass} placeholder="e.g. US" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <input type="email" {...register('email')} className={inputClass} />
      </Field>
      <Field label="Phone number" error={errors.phoneNumber?.message}>
        <input {...register('phoneNumber')} className={inputClass} />
      </Field>
      <Field label="Address" error={errors.address?.message} full>
        <input {...register('address')} className={inputClass} />
      </Field>
      <Field label="Government ID type" error={errors.governmentIdType?.message}>
        <input {...register('governmentIdType')} className={inputClass} placeholder="Passport" />
      </Field>
      <Field label="Government ID number" error={errors.governmentIdNumber?.message}>
        <input {...register('governmentIdNumber')} className={inputClass} />
      </Field>

      <div className="col-span-full mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {isSubmitting ? 'Saving…' : profile ? 'Save changes' : 'Create profile'}
        </button>
        {saved ? <span className="text-sm text-emerald-600">Saved</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700';

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? 'sm:col-span-2' : ''}`}>
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
