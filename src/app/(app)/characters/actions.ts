"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCharacter(characterId: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    short_description: String(formData.get("short_description") ?? "").trim() || null,
    quote: String(formData.get("quote") ?? "").trim() || null,
    backstory_summary: String(formData.get("backstory_summary") ?? "").trim() || null,
    character_sheet_url: String(formData.get("character_sheet_url") ?? "").trim() || null,
  };

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
