import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrl } from "@/lib/images";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { EntityImage } from "@/components/EntityImage";
import { LoreEditForm } from "./LoreEditForm";
import type { Character, Location, Npc } from "@/lib/types/database";

const categoryLabel: Record<string, string> = {
  history: "History",
  religion: "Religion",
  culture: "Culture",
  magic: "Magic",
  creature: "Creature",
  other: "Other",
};

export default async function LoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  const { data: entry } = await supabase.from("lore_entries").select("*").eq("id", id).maybeSingle();
  if (!entry) notFound();

  let secrets = null;
  let characters: Character[] = [];
  let locations: Location[] = [];
  let npcs: Npc[] = [];

  if (isDm) {
    const [secretsRes, charactersRes, locationsRes, npcsRes] = await Promise.all([
      supabase.from("lore_secrets").select("*").eq("lore_entry_id", id).maybeSingle(),
      supabase.from("characters").select("*").eq("campaign_id", session.campaign.id).order("sort_order"),
      supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
      supabase.from("npcs").select("*").eq("campaign_id", session.campaign.id).order("name"),
    ]);
    secrets = secretsRes.data;
    characters = charactersRes.data ?? [];
    locations = locationsRes.data ?? [];
    npcs = npcsRes.data ?? [];
  }

  const imageUrl = await getSignedImageUrl(entry.image_url);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-4">
        {imageUrl && <EntityImage url={imageUrl} alt={entry.title} className="h-16 w-16 rounded-md" />}
        <div>
          <div className="flex items-center gap-2">
            <span className="badge">{categoryLabel[entry.category]}</span>
            {isDm && <VisibilityBadge visibility={entry.visibility} />}
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{entry.title}</h1>
        </div>
      </div>

      <div className="card p-5">
        <p className="whitespace-pre-wrap text-foreground">
          {entry.player_visible_content || "Nothing recorded yet."}
        </p>
      </div>

      {isDm && (
        <LoreEditForm
          entry={entry}
          secrets={secrets}
          characters={characters}
          locations={locations}
          npcs={npcs}
        />
      )}
    </div>
  );
}
