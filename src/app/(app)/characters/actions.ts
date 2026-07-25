"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Character } from "@/lib/types/database";

export async function updateCharacter(characterId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: character } = await supabase
    .from("characters")
    .select("campaign_id")
    .eq("id", characterId)
    .maybeSingle();
  if (!character) return;

  const { data: membership } = await supabase
    .from("campaign_memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("campaign_id", character.campaign_id)
    .maybeSingle();
  const isDm = membership?.role === "dm";

  const fields: Partial<Character> = {
    name: String(formData.get("name") ?? "").trim(),
    short_description: String(formData.get("short_description") ?? "").trim() || null,
    quote: String(formData.get("quote") ?? "").trim() || null,
    backstory_summary: String(formData.get("backstory_summary") ?? "").trim() || null,
    character_sheet_url: String(formData.get("character_sheet_url") ?? "").trim() || null,
  };

  // player_name is DM-only — enforced here, not just by hiding the field in
  // the UI, since RLS (characters_update_owner_or_dm) is row-level and would
  // otherwise let an owning player set it via a hand-crafted request.
  if (isDm) {
    fields.player_name = String(formData.get("player_name") ?? "").trim() || null;
  }

  // RLS (characters_update_owner_or_dm) enforces that only the owning player
  // or the DM can actually change a row here.
  await supabase.from("characters").update(fields).eq("id", characterId);

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/characters");
  revalidatePath("/campaign");
}

export async function setCharacterImage(characterId: string, path: string | null) {
  const supabase = await createClient();
  await supabase.from("characters").update({ portrait_url: path }).eq("id", characterId);

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/characters");
  revalidatePath("/campaign");
}
