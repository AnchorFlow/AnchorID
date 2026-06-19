import { PageHeader, StatusBadge } from '@anchorid/ui';
import { listMyDocuments } from '../../../lib/actions/documents';
import { DocumentUploadForm } from '../../../components/DocumentUploadForm';

export default async function DocumentsPage() {
  const documents = await listMyDocuments();

  return (
    <div>
      <PageHeader title="Documents" description="Upload KYC documents for admin review." />
      <DocumentUploadForm />

      <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{doc.type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                {doc.rejectionReason ? (
                  <p className="text-xs text-red-600">{doc.rejectionReason}</p>
                ) : null}
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
