"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function claimInvite(code: string, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`/join/${code}?error=Email and password are required.`);
  }

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("invite_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!invite) {
    redirect(`/join/${code}?error=This invite link is not valid.`);
  }
  if (invite.used_by_user_id) {
    redirect(`/join/${code}?error=This invite link has already been used.`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/join/${code}?error=${encodeURIComponent(error.message)}`);
  }
  if (!data.user) {
    redirect(`/join/${code}?error=Signup did not return a user — try again.`);
  }

  const userId = data.user.id;

  const { error: membershipError } = await admin.from("campaign_memberships").insert({
    campaign_id: invite.campaign_id,
    user_id: userId,
    role: "player",
    character_id: invite.character_id,
  });

  if (membershipError) {
    redirect(`/join/${code}?error=Could not attach your account — contact your DM.`);
  }

  await admin.from("invite_codes").update({ used_by_user_id: userId }).eq("id", invite.id);

  if (invite.character_id) {
    await admin
      .from("characters")
      .update({ user_id: userId })
      .eq("id", invite.character_id)
      .is("user_id", null);
  }

  if (data.session) {
    redirect("/campaign");
  }

  redirect("/login?message=Check your email to confirm your account, then log in.");
}
