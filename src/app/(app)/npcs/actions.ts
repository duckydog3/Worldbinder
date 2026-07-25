"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NpcStatus, Visibility } from "@/lib/types/database";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function npcFieldsFromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role_occupation: String(formData.get("role_occupation") ?? "").trim() || null,
    status: String(formData.get("status") ?? "alive") as NpcStatus,
    tags: parseTags(String(formData.get("tags") ?? "")),
    appearance: String(formData.get("appearance") ?? "").trim() || null,
    player_visible_info: String(formData.get("player_visible_info") ?? "").trim() || null,
    last_known_location_id: String(formData.get("last_known_location_id") ?? "").trim() || null,
    visibility: String(formData.get("visibility") ?? "hidden") as Visibility,
    revealed_to_character_ids: formData.getAll("revealed_to_character_ids").map(String),
  };
}

function secretsFieldsFromForm(formData: FormData) {
  return {
    secrets: String(formData.get("secrets") ?? "").trim() || null,
    hidden_motives: String(formData.get("hidden_motives") ?? "").trim() || null,
    true_allegiance: String(formData.get("true_allegiance") ?? "").trim() || null,
    future_plans: String(formData.get("future_plans") ?? "").trim() || null,
    dm_notes: String(formData.get("dm_notes") ?? "").trim() || null,
  };
}

export async function createNpc(campaignId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: npc, error } = await supabase
    .from("npcs")
    .insert({ campaign_id: campaignId, ...npcFieldsFromForm(formData) })
    .select("id")
    .single();

  if (error || !npc) {
    redirect(`/npcs/new?error=${encodeURIComponent(error?.message ?? "Could not create NPC")}`);
  }

  await supabase
    .from("npc_secrets")
    .insert({ npc_id: npc.id, campaign_id: campaignId, ...secretsFieldsFromForm(formData) });

  revalidatePath("/npcs");
  redirect(`/npcs/${npc.id}`);
}

export async function updateNpc(npcId: string, campaignId: string, formData: FormData) {
  const supabase = await createClient();

  // RLS (npcs_update_dm / npc_secrets_dm_all) enforces DM-only, regardless of
  // what the client sends.
  await supabase.from("npcs").update(npcFieldsFromForm(formData)).eq("id", npcId);

  await supabase
    .from("npc_secrets")
    .upsert({ npc_id: npcId, campaign_id: campaignId, ...secretsFieldsFromForm(formData) });

  revalidatePath(`/npcs/${npcId}`);
  revalidatePath("/npcs");
  revalidatePath("/campaign");
}

export async function deleteNpc(npcId: string) {
  const supabase = await createClient();
  await supabase.from("npcs").delete().eq("id", npcId);
  revalidatePath("/npcs");
  redirect("/npcs");
}

export async function setNpcImage(npcId: string, path: string | null) {
  const supabase = await createClient();
  await supabase.from("npcs").update({ portrait_url: path }).eq("id", npcId);

  revalidatePath(`/npcs/${npcId}`);
  revalidatePath("/npcs");
  revalidatePath("/campaign");
}
