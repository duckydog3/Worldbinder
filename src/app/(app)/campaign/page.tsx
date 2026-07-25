import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";
import { CampaignEditForm } from "./CampaignEditForm";

export default async function CampaignHomePage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = await createClient();
  const isDm = session.membership.role === "dm";

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("sort_order");

  const { data: recentNpcs } = await supabase
    .from("npcs")
    .select("id, name, role_occupation, status, portrait_url")
    .eq("campaign_id", session.campaign.id)
    .order("updated_at", { ascending: false })
    .limit(6);

  const imageUrls = await getSignedImageUrls([
    ...(characters ?? []).map((c) => c.portrait_url),
    ...(recentNpcs ?? []).map((n) => n.portrait_url),
  ]);

  const { campaign } = session;

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">{campaign.status}</p>
            <h1 className="text-4xl font-semibold text-foreground">{campaign.name}</h1>
            {campaign.tagline && <p className="mt-1 text-lg text-muted">{campaign.tagline}</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <p className="label">Where we are</p>
            <p className="mt-1 text-foreground">
              {campaign.current_location || "Not set yet."}
            </p>
          </div>
          <div className="card p-4">
            <p className="label">What we&apos;re doing</p>
            <p className="mt-1 text-foreground">
              {campaign.current_objective || "Not set yet."}
            </p>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <p className="label">Latest recap</p>
          <p className="mt-1 whitespace-pre-wrap text-foreground">
            {campaign.latest_recap || "No recap yet — check back after the next session."}
          </p>
        </div>

        {isDm && <CampaignEditForm campaign={campaign} />}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground">Party</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {characters?.map((character) => (
            <Link
              key={character.id}
              href={`/characters/${character.id}`}
              className="card p-4 transition-colors hover:border-accent"
            >
              <div className="flex items-center gap-3">
                <EntityImage
                  url={character.portrait_url ? imageUrls[character.portrait_url] ?? null : null}
                  alt={character.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">{character.name}</p>
                  <p className="text-sm text-muted">{character.short_description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Recently revealed NPCs</h2>
          <Link href="/npcs" className="text-sm text-accent underline">
            View all
          </Link>
        </div>
        {recentNpcs && recentNpcs.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {recentNpcs.map((npc) => (
              <Link
                key={npc.id}
                href={`/npcs/${npc.id}`}
                className="card p-4 transition-colors hover:border-accent"
              >
                <div className="flex items-center gap-3">
                  <EntityImage
                    url={npc.portrait_url ? imageUrls[npc.portrait_url] ?? null : null}
                    alt={npc.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-foreground">{npc.name}</p>
                    <p className="text-sm text-muted">{npc.role_occupation}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No NPCs revealed yet.</p>
        )}
      </section>
    </div>
  );
}
