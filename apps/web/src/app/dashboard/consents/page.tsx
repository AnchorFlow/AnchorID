import { PageHeader } from '@anchorid/ui';
import { listMyConsents } from '../../../lib/actions/consents';
import { ConsentList } from '../../../components/ConsentList';

export default async function ConsentsPage() {
  const consents = await listMyConsents();

  return (
    <div>
      <PageHeader title="Consent history" description="Every grant you've ever made, and the ability to revoke it." />
      <ConsentList consents={consents} />
    </div>
  );
}
