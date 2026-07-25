"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addJournalEntry(
  campaignId: string,
  characterId: string,
  formData: FormData
) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // RLS (journal_entries_owner_all) requires user_id = auth.uid(), so this
  // can never write into anyone else's journal — including the DM's.
  await supabase.from("journal_entries").insert({
    campaign_id: campaignId,
    character_id: characterId,
    user_id: user.id,
    content,
  });

  revalidatePath("/journal");
}

export async function deleteJournalEntry(entryId: string) {
  const supabase = await createClient();
  await supabase.from("journal_entries").delete().eq("id", entryId);
  revalidatePath("/journal");
}
