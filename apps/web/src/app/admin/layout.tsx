import Link from 'next/link';
import { logoutAction } from '../../lib/actions/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/anchors', label: 'Anchor review' },
  { href: '/admin/documents', label: 'Document review' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/audit-logs', label: 'Audit log' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 px-4 py-6 dark:border-slate-800">
        <Link href="/" className="block px-2 text-lg font-semibold tracking-tight">
          AnchorID Admin
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/dashboard" className="mt-4 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
            ← User dashboard
          </Link>
        </nav>
        <form action={logoutAction} className="mt-6 px-2">
          <button type="submit" className="text-sm text-muted-foreground hover:underline">
            Log out
          </button>
        </form>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
