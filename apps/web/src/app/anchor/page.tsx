import Link from 'next/link';
import { PageHeader, StatusBadge } from '@anchorid/ui';
import { listMyAnchors } from '../../lib/actions/anchors';

export default async function MyAnchorsPage() {
  const anchors = await listMyAnchors();

  return (
    <div>
      <PageHeader title="My anchors" description="Organizations you've registered or joined." />

      {anchors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You aren&apos;t a member of any anchor organization yet.{' '}
          <Link href="/anchor/register" className="text-blue-600 hover:underline">
            Register one →
          </Link>
        </p>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {anchors.map((anchor) => (
            <Link
              key={anchor.id}
              href={`/anchor/${anchor.id}`}
              className="flex items-center justify-between py-3 hover:opacity-80"
            >
              <div>
                <p className="text-sm font-medium">{anchor.name}</p>
                <p className="text-xs text-muted-foreground">{anchor.homeDomain} · {anchor.myRole}</p>
              </div>
              <StatusBadge status={anchor.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
