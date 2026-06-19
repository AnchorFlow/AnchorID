import { PageHeader } from '@anchorid/ui';
import { listUsers } from '../../../lib/actions/admin';
import { UserList } from '../../../components/admin/UserList';

export default async function AdminUsersPage() {
  const { data: users } = await listUsers();

  return (
    <div>
      <PageHeader title="Users" description="Suspend or reactivate accounts." />
      <UserList users={users} />
    </div>
  );
}
