"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCampaign(campaignId: string, formData: FormData) {
  const supabase = await createClient();

  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    current_location: String(formData.get("current_location") ?? "").trim() || null,
    current_objective: String(formData.get("current_objective") ?? "").trim() || null,
    latest_recap: String(formData.get("latest_recap") ?? "").trim() || null,
  };

  // RLS (campaigns_update_dm) is the real gate here — this update is a no-op
  // for anyone who isn't the DM, regardless of what the client sent.
  await supabase.from("campaigns").update(fields).eq("id", campaignId);

  revalidatePath("/campaign");
}
