"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function randomCode(prefix: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix.toUpperCase()}-${suffix}`;
}

export async function generateInviteCode(campaignId: string, characterId: string, name: string) {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("campaign_memberships")
    .select("id")
    .eq("character_id", characterId)
    .maybeSingle();

  if (membership) return; // already claimed — nothing to generate

  await supabase.from("invite_codes").insert({
    campaign_id: campaignId,
    character_id: characterId,
    code: randomCode(name.slice(0, 5)),
  });

  revalidatePath("/admin/invites");
}
