import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { GenerateButton } from "./GenerateButton";

export default async function InvitesPage() {
  const session = await getSessionContext();
  if (!session) return null;
  if (session.membership.role !== "dm") redirect("/campaign");

  const supabase = await createClient();
  const [{ data: characters }, { data: memberships }, { data: codes }] = await Promise.all([
    supabase.from("characters").select("*").eq("campaign_id", session.campaign.id).order("sort_order"),
    supabase.from("campaign_memberships").select("*").eq("campaign_id", session.campaign.id),
    supabase
      .from("invite_codes")
      .select("*")
      .eq("campaign_id", session.campaign.id)
      .order("created_at", { ascending: false }),
  ]);

  const host = (await headers()).get("host");
  const origin = host ? `${host.includes("localhost") ? "http" : "https"}://${host}` : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Invite links</h1>
      <p className="text-sm text-muted">
        Send each player their link below. A link can only be used once.
      </p>

      <div className="space-y-4">
        {characters?.map((character) => {
          const claimed = memberships?.some((m) => m.character_id === character.id);
          const code = codes?.find((c) => c.character_id === character.id && !c.used_by_user_id);

          return (
            <div key={character.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{character.name}</p>
                {claimed ? (
                  <span className="badge badge-party">Joined</span>
                ) : (
                  <span className="badge">Not joined</span>
                )}
              </div>

              {!claimed && code && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <code className="truncate rounded bg-surface-raised px-2 py-1 text-xs text-foreground">
                    {origin}/join/{code.code}
                  </code>
                  <GenerateButton campaignId={session.campaign.id} characterId={character.id} name={character.name} />
                </div>
              )}
              {!claimed && !code && (
                <div className="mt-2">
                  <GenerateButton campaignId={session.campaign.id} characterId={character.id} name={character.name} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
