"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LoreCategory, Visibility } from "@/lib/types/database";

function loreFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "other") as LoreCategory,
    player_visible_content: String(formData.get("player_visible_content") ?? "").trim() || null,
    related_location_id: String(formData.get("related_location_id") ?? "").trim() || null,
    related_npc_id: String(formData.get("related_npc_id") ?? "").trim() || null,
    visibility: String(formData.get("visibility") ?? "hidden") as Visibility,
    revealed_to_character_ids: formData.getAll("revealed_to_character_ids").map(String),
  };
}

export async function createLoreEntry(campaignId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("lore_entries")
    .insert({ campaign_id: campaignId, ...loreFieldsFromForm(formData) })
    .select("id")
    .single();

  if (error || !entry) {
    redirect(`/lore/new?error=${encodeURIComponent(error?.message ?? "Could not create entry")}`);
  }

  const dmOnlyContent = String(formData.get("dm_only_content") ?? "").trim() || null;
  await supabase
    .from("lore_secrets")
    .insert({ lore_entry_id: entry.id, campaign_id: campaignId, dm_only_content: dmOnlyContent });

  revalidatePath("/lore");
  redirect(`/lore/${entry.id}`);
}

export async function updateLoreEntry(entryId: string, campaignId: string, formData: FormData) {
  const supabase = await createClient();

  await supabase.from("lore_entries").update(loreFieldsFromForm(formData)).eq("id", entryId);

  const dmOnlyContent = String(formData.get("dm_only_content") ?? "").trim() || null;
  await supabase
    .from("lore_secrets")
    .upsert({ lore_entry_id: entryId, campaign_id: campaignId, dm_only_content: dmOnlyContent });

  revalidatePath(`/lore/${entryId}`);
  revalidatePath("/lore");

  revalidatePath("/campaign");
}

export async function deleteLoreEntry(entryId: string) {
  const supabase = await createClient();
  await supabase.from("lore_entries").delete().eq("id", entryId);
  revalidatePath("/lore");
  redirect("/lore");
}
