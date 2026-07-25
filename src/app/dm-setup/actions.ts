"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBootstrapState, tryClaimDmSeat } from "@/lib/onboarding";

export async function signUpAsDm(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/dm-setup?error=Email and password are required.");
  }

  const { campaignId, dmClaimed } = await getBootstrapState();
  if (!campaignId) {
    redirect("/dm-setup?error=No campaign found yet. Run the seed script first.");
  }
  if (dmClaimed) {
    redirect("/login?error=The DM seat is already claimed. Log in instead.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/dm-setup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session && data.user) {
    const claimed = await tryClaimDmSeat(data.user.id);
    if (!claimed) {
      redirect("/login?error=The DM seat was just claimed by someone else.");
    }
    redirect("/campaign");
  }

  // Email confirmation is required by the Supabase project's auth settings —
  // the DM seat gets claimed automatically on first login (see /onboarding).
  redirect("/login?message=Check your email to confirm your account, then log in.");
}
