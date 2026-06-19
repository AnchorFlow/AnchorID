import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AnchorID — Verify once. Use everywhere.',
  description: 'Open-source identity and compliance layer for the Stellar ecosystem.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
