import { LoginForm } from '../../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Connect your Stellar wallet</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        AnchorID authenticates with a SEP-10-style challenge: sign a one-time message proving you
        own the address — your secret key never leaves your wallet.
      </p>
      <LoginForm />
    </div>
  );
}
