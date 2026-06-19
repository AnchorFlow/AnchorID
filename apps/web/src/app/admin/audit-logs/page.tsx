import { PageHeader } from '@anchorid/ui';
import { listAuditLogs } from '../../../lib/actions/admin';

export default async function AdminAuditLogsPage() {
  const { data: logs } = await listAuditLogs();

  return (
    <div>
      <PageHeader title="Audit log" description="Every sensitive action, append-only." />
      <div className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-muted-foreground">
                {log.targetType ? `${log.targetType} · ${log.targetId}` : '—'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
