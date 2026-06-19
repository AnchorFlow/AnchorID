import { PageHeader } from '@anchorid/ui';
import { getMyProfile } from '../../../lib/actions/identity';
import { IdentityProfileForm } from '../../../components/IdentityProfileForm';

export default async function IdentityProfilePage() {
  const profile = await getMyProfile();

  return (
    <div>
      <PageHeader
        title="Identity profile"
        description="This information is verified once and shared only with anchors you explicitly approve."
      />
      <IdentityProfileForm profile={profile} />
    </div>
  );
}
