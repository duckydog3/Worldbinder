import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

// Single-campaign bootstrap checks, using the admin client because these run
// before the caller necessarily has a campaign_memberships row of their own
// (so normal RLS-scoped queries would return nothing either way).
export async function getBootstrapState() {
  const admin = createAdminClient();

  const { data: campaign } = await admin.from("campaigns").select("id").maybeSingle();
  if (!campaign) return { campaignId: null, dmClaimed: false };

  const { data: dmMembership } = await admin
    .from("campaign_memberships")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("role", "dm")
    .maybeSingle();

  return { campaignId: campaign.id, dmClaimed: !!dmMembership };
}

// Called once, right after a fresh signup/login with no membership row yet.
// Only ever succeeds for the very first authenticated user to reach it while
// no DM membership exists — after that it's a no-op that returns false, so
// there is no window for a second account to "steal" the DM seat.
export async function tryClaimDmSeat(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { campaignId, dmClaimed } = await getBootstrapState();
  if (!campaignId || dmClaimed) return false;

  const { error } = await admin.from("campaign_memberships").insert({
    campaign_id: campaignId,
    user_id: userId,
    role: "dm",
  });

  return !error;
}
