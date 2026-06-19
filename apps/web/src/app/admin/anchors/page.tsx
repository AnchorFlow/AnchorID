import { PageHeader } from '@anchorid/ui';
import { listAnchorReviewQueue } from '../../../lib/actions/anchors';
import { AnchorReviewList } from '../../../components/admin/AnchorReviewList';

export default async function AdminAnchorsPage() {
  const { data: anchors } = await listAnchorReviewQueue();

  return (
    <div>
      <PageHeader title="Anchor review" description="Approve, reject, or suspend anchor organizations." />
      <AnchorReviewList anchors={anchors} />
    </div>
  );
}
