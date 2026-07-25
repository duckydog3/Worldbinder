"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DiscoveryState, LocationType, Visibility } from "@/lib/types/database";

function locationFieldsFromForm(formData: FormData) {
  const mapX = String(formData.get("map_x") ?? "").trim();
  const mapY = String(formData.get("map_y") ?? "").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? "other") as LocationType,
    parent_location_id: String(formData.get("parent_location_id") ?? "").trim() || null,
    map_x: mapX ? Number(mapX) : null,
    map_y: mapY ? Number(mapY) : null,
    description_player: String(formData.get("description_player") ?? "").trim() || null,
    discovery_state: String(formData.get("discovery_state") ?? "unknown") as DiscoveryState,
    is_wound: formData.get("is_wound") === "on",
    visibility: String(formData.get("visibility") ?? "hidden") as Visibility,
    revealed_to_character_ids: formData.getAll("revealed_to_character_ids").map(String),
  };
}

function secretsFieldsFromForm(formData: FormData) {
  return {
    description_dm: String(formData.get("description_dm") ?? "").trim() || null,
    dm_notes: String(formData.get("dm_notes") ?? "").trim() || null,
  };
}

export async function createLocation(campaignId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: location, error } = await supabase
    .from("locations")
    .insert({ campaign_id: campaignId, ...locationFieldsFromForm(formData) })
    .select("id")
    .single();

  if (error || !location) {
    redirect(`/map/new?error=${encodeURIComponent(error?.message ?? "Could not create location")}`);
  }

  await supabase
    .from("location_secrets")
    .insert({ location_id: location.id, campaign_id: campaignId, ...secretsFieldsFromForm(formData) });

  revalidatePath("/map");
  redirect("/map");
}

export async function updateLocation(locationId: string, campaignId: string, formData: FormData) {
  const supabase = await createClient();

  await supabase.from("locations").update(locationFieldsFromForm(formData)).eq("id", locationId);

  await supabase
    .from("location_secrets")
    .upsert({ location_id: locationId, campaign_id: campaignId, ...secretsFieldsFromForm(formData) });

  revalidatePath("/map");
}

export async function deleteLocation(locationId: string) {
  const supabase = await createClient();
  await supabase.from("locations").delete().eq("id", locationId);
  revalidatePath("/map");
}

export async function setMapImage(campaignId: string, url: string | null) {
  const supabase = await createClient();
  await supabase.from("campaigns").update({ map_image_url: url }).eq("id", campaignId);
  revalidatePath("/map");
}

export async function addAnnotation(
  campaignId: string,
  characterId: string | null,
  formData: FormData
) {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const locationId = String(formData.get("location_id") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("map_annotations").insert({
    campaign_id: campaignId,
    created_by_character_id: characterId,
    created_by_user_id: user.id,
    location_id: locationId,
    kind: "note",
    data: { text },
  });

  revalidatePath("/map");
}

export async function deleteAnnotation(annotationId: string) {
  const supabase = await createClient();
  await supabase.from("map_annotations").delete().eq("id", annotationId);
  revalidatePath("/map");
}
