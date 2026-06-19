import { PageHeader } from '@anchorid/ui';
import { getAdminDashboard } from '../../lib/actions/admin';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboard();

  const cards = [
    { label: 'Pending anchors', value: stats.pendingAnchors },
    { label: 'Pending documents', value: stats.pendingDocuments },
    { label: 'Pending access requests', value: stats.pendingAccessRequests },
    { label: 'Total users', value: stats.totalUsers },
    { label: 'Total anchors', value: stats.totalAnchors },
  ];

  return (
    <div>
      <PageHeader title="Admin dashboard" description="Compliance and platform health at a glance." />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
