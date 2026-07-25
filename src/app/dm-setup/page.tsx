import Link from "next/link";
import { getBootstrapState } from "@/lib/onboarding";
import { signUpAsDm } from "./actions";

export default async function DmSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { campaignId, dmClaimed } = await getBootstrapState();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-foreground">DM Setup</h1>
        <p className="mt-1 text-sm text-muted">Create the DM account for The Wounds.</p>

        {!campaignId && (
          <p className="mt-6 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
            No campaign found yet. Run <code>supabase/seed.sql</code> against the database
            first.
          </p>
        )}

        {campaignId && dmClaimed && (
          <p className="mt-6 rounded-md border border-border bg-surface-raised p-3 text-sm text-muted">
            The DM seat has already been claimed.{" "}
            <Link href="/login" className="text-accent underline">
              Go to login
            </Link>
            .
          </p>
        )}

        {campaignId && !dmClaimed && (
          <form action={signUpAsDm} className="mt-6 space-y-4">
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
              <input
                className="input"
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Create DM account
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
