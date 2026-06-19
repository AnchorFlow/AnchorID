import { PageHeader } from '@anchorid/ui';
import { listDocumentReviewQueue } from '../../../lib/actions/admin';
import { DocumentReviewList } from '../../../components/admin/DocumentReviewList';

export default async function AdminDocumentsPage() {
  const { data: documents } = await listDocumentReviewQueue();

  return (
    <div>
      <PageHeader title="Document review" description="Approve or reject uploaded KYC documents." />
      <DocumentReviewList documents={documents} />
    </div>
  );
}
