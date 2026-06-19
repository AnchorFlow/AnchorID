import { PageHeader } from '@anchorid/ui';
import { RegisterAnchorForm } from '../../../components/RegisterAnchorForm';

export default function RegisterAnchorPage() {
  return (
    <div>
      <PageHeader
        title="Register an anchor"
        description="Onboard your organization to request consent-scoped access to verified identities."
      />
      <RegisterAnchorForm />
    </div>
  );
}
