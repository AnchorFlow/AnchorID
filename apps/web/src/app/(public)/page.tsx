import Link from 'next/link';

const JOURNEYS = [
  {
    title: 'End users',
    description: 'Verify once, control who sees what, revoke at any time.',
  },
  {
    title: 'Stellar anchors',
    description: 'Reduce KYC integration cost; trust a portable, auditable identity.',
  },
  {
    title: 'Wallet & fintech platforms',
    description: 'Plug into a shared compliance layer instead of building N bespoke ones.',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Verify once. Use everywhere.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AnchorID is an open-source identity and compliance layer for the Stellar ecosystem.
          Complete KYC once, then share consent-scoped, revocable access with any participating
          anchor — without repeating the same paperwork.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Connect your wallet
          </Link>
          <Link
            href="/anchor/register"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium dark:border-slate-700"
          >
            Register an anchor
          </Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {JOURNEYS.map((journey) => (
          <div key={journey.title} className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold">{journey.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{journey.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
