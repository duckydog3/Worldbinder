import Link from "next/link";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-foreground">The Wounds</h1>
        <p className="mt-1 text-sm text-muted">Sign in to the campaign archive.</p>

        {message && (
          <p className="mt-6 rounded-md border border-accent/50 bg-accent-soft/30 p-3 text-sm text-foreground">
            {message}
          </p>
        )}

        <form action={signIn} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input className="input" id="password" name="password" type="password" required />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-muted">
          No account? You need an invite link from your DM, or if you are the DM setting this
          up for the first time,{" "}
          <Link href="/dm-setup" className="text-accent underline">
            create the DM account
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
