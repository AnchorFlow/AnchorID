import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            AnchorID
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="rounded-md bg-slate-900 px-4 py-2 text-white dark:bg-white dark:text-slate-900">
              Connect wallet
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 px-6 py-6 text-center text-sm text-muted-foreground dark:border-slate-800">
        AnchorID — open-source identity and compliance layer for the Stellar ecosystem.
      </footer>
    </div>
  );
}
