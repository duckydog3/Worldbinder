import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tryClaimDmSeat } from "@/lib/onboarding";

// Lands here right after any login/signup. Resolves membership state once so
// both "confirm email then log in" and "session available immediately"
// signup paths converge on the same DM-claim logic.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("campaign_memberships")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) redirect("/campaign");

  const claimed = await tryClaimDmSeat(user.id);
  if (claimed) redirect("/campaign");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">No access yet</h1>
        <p className="mt-2 text-sm text-muted">
          This account isn&apos;t attached to a character in The Wounds. Ask your DM for your
          invite link.
        </p>
      </div>
    </main>
  );
}
