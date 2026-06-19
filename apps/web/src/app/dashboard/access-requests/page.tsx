import { PageHeader } from '@anchorid/ui';
import { listMyAccessRequests } from '../../../lib/actions/access-requests';
import { AccessRequestList } from '../../../components/AccessRequestList';

export default async function AccessRequestsPage() {
  const accessRequests = await listMyAccessRequests();

  return (
    <div>
      <PageHeader
        title="Access requests"
        description="Anchors that want to read part of your verified identity."
      />
      <AccessRequestList accessRequests={accessRequests} />
    </div>
  );
}
