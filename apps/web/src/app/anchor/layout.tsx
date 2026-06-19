import Link from 'next/link';
import { logoutAction } from '../../lib/actions/auth';

export default function AnchorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 px-4 py-6 dark:border-slate-800">
        <Link href="/" className="block px-2 text-lg font-semibold tracking-tight">
          AnchorID
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          <Link href="/anchor" className="rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            My anchors
          </Link>
          <Link
            href="/anchor/register"
            className="rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Register anchor
          </Link>
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
