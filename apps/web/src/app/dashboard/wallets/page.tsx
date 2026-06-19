import { PageHeader } from '@anchorid/ui';
import { listMyWallets } from '../../../lib/actions/wallets';
import { WalletLinkForm } from '../../../components/WalletLinkForm';
import { WalletList } from '../../../components/WalletList';

export default async function WalletsPage() {
  const wallets = await listMyWallets();

  return (
    <div>
      <PageHeader title="Wallets" description="Stellar addresses linked to your AnchorID account." />
      <WalletLinkForm />
      <WalletList wallets={wallets} />
    </div>
  );
}
