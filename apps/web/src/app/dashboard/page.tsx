import Link from 'next/link';
import { PageHeader, StatusBadge } from '@anchorid/ui';
import { getMe } from '../../lib/actions/account';
import { getMyProfile } from '../../lib/actions/identity';
import { listMyVerifications } from '../../lib/actions/verifications';

export default async function DashboardPage() {
  const [me, profile, verifications] = await Promise.all([
    getMe(),
    getMyProfile(),
    listMyVerifications(),
  ]);
  const latestVerification = verifications[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back${profile ? `, ${profile.firstName}` : ''}`}
        description="Your verified identity, shared on your terms."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-sm text-muted-foreground">Account status</p>
          <div className="mt-2"><StatusBadge status={me.status} /></div>
        </div>
        <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-sm text-muted-foreground">Identity profile</p>
          {profile ? (
            <p className="mt-2 text-sm font-medium">Complete</p>
          ) : (
            <Link href="/dashboard/identity" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
              Create your profile →
            </Link>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <p className="text-sm text-muted-foreground">Verification</p>
          <div className="mt-2">
            {latestVerification ? <StatusBadge status={latestVerification.status} /> : <StatusBadge status="PENDING" />}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">Role: {me.role}</p>
    </div>
  );
}
