import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Campaign, CampaignMembership, Character } from "@/lib/types/database";

export interface SessionContext {
  userId: string;
  email: string | null;
  campaign: Campaign;
  membership: CampaignMembership;
  character: Character | null;
}

// Worldbinder is single-campaign: every signed-in user has at most one
// membership row, and there is at most one campaign row. This resolves the
// full context in one round trip for pages/layouts to branch on role.
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("campaign_memberships")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return null;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", membership.campaign_id)
    .maybeSingle();

  if (!campaign) return null;

  let character: Character | null = null;
  if (membership.character_id) {
    const { data } = await supabase
      .from("characters")
      .select("*")
      .eq("id", membership.character_id)
      .maybeSingle();
    character = data ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    campaign,
    membership,
    character,
  };
}
