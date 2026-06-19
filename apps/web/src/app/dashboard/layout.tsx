import Link from 'next/link';
import { logoutAction } from '../../lib/actions/auth';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/identity', label: 'Identity profile' },
  { href: '/dashboard/documents', label: 'Documents' },
  { href: '/dashboard/wallets', label: 'Wallets' },
  { href: '/dashboard/access-requests', label: 'Access requests' },
  { href: '/dashboard/consents', label: 'Consents' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 px-4 py-6 dark:border-slate-800">
        <Link href="/" className="block px-2 text-lg font-semibold tracking-tight">
          AnchorID
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
          <Link href="/anchor" className="mt-4 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
            Anchor portal →
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
