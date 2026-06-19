import { PageHeader, StatusBadge } from '@anchorid/ui';
import {
  getAnchor,
  listMembers,
  listApiCredentials,
  listAccessRequestsForAnchor,
} from '../../../lib/actions/anchors';
import { MembersPanel } from '../../../components/anchor/MembersPanel';
import { CredentialsPanel } from '../../../components/anchor/CredentialsPanel';

export default async function AnchorDetailPage({
  params,
}: {
  params: Promise<{ anchorId: string }>;
}) {
  const { anchorId } = await params;
  const [anchor, members, credentials, accessRequests] = await Promise.all([
    getAnchor(anchorId),
    listMembers(anchorId),
    listApiCredentials(anchorId),
    listAccessRequestsForAnchor(anchorId),
  ]);

  return (
    <div>
      <PageHeader
        title={anchor.name}
        description={anchor.homeDomain}
        actions={<StatusBadge status={anchor.status} />}
      />

      {anchor.status !== 'APPROVED' ? (
        <p className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/30">
          {anchor.status === 'PENDING'
            ? 'Awaiting admin review. API credentials and access requests are disabled until approved.'
            : `This anchor is ${anchor.status.toLowerCase()}.`}
        </p>
      ) : null}

      <Section title="Members">
        <MembersPanel anchorId={anchorId} members={members} />
      </Section>

      <Section title="API credentials">
        <CredentialsPanel anchorId={anchorId} credentials={credentials} />
      </Section>

      <Section title="Access requests sent">
        {accessRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No access requests sent yet.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {accessRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm">{req.scopes.join(', ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.requestedExpiryDays}-day grant requested
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-slate-200 pt-6 first:mt-0 first:border-t-0 first:pt-0 dark:border-slate-800">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}
