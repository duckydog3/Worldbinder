import { createAdminClient } from "@/lib/supabase/server";
import { claimInvite } from "./actions";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const { error } = await searchParams;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invite_codes")
    .select("*, characters(name)")
    .eq("code", code)
    .maybeSingle<{ used_by_user_id: string | null; characters: { name: string } | null }>();

  const claimAction = claimInvite.bind(null, code);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-foreground">Join The Wounds</h1>

        {!invite && (
          <p className="mt-6 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
            This invite link isn&apos;t valid.
          </p>
        )}

        {invite && invite.used_by_user_id && (
          <p className="mt-6 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
            This invite link has already been used.
          </p>
        )}

        {invite && !invite.used_by_user_id && (
          <>
            <p className="mt-1 text-sm text-muted">
              Create your account to play{" "}
              <span className="text-foreground">{invite.characters?.name ?? "your character"}</span>.
            </p>
            <form action={claimAction} className="mt-6 space-y-4">
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
                Create account
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
