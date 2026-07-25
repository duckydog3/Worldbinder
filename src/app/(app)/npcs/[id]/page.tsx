import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { NpcEditForm } from "./NpcEditForm";
import type { Character, Location } from "@/lib/types/database";

const statusLabel: Record<string, string> = {
  alive: "Alive",
  dead: "Dead",
  missing: "Missing",
  unknown: "Unknown",
};

export default async function NpcDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  // RLS returns nothing here for a hidden NPC unless the caller is the DM —
  // a player guessing an id gets the same 404 as a nonexistent one.
  const { data: npc } = await supabase.from("npcs").select("*").eq("id", id).maybeSingle();
  if (!npc) notFound();

  let secrets = null;
  let characters: Character[] = [];
  let locations: Location[] = [];

  if (isDm) {
    const [secretsRes, charactersRes, locationsRes] = await Promise.all([
      supabase.from("npc_secrets").select("*").eq("npc_id", id).maybeSingle(),
      supabase
        .from("characters")
        .select("*")
        .eq("campaign_id", session.campaign.id)
        .order("sort_order"),
      supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
    ]);
    secrets = secretsRes.data;
    characters = charactersRes.data ?? [];
    locations = locationsRes.data ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-5">
        <div className="h-20 w-20 shrink-0 rounded-full bg-surface-raised" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-foreground">{npc.name}</h1>
            {isDm && <VisibilityBadge visibility={npc.visibility} />}
          </div>
          <p className="text-sm text-muted">{npc.role_occupation}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="badge">{statusLabel[npc.status]}</span>
            {npc.tags.map((tag) => (
              <span key={tag} className="badge">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {npc.appearance && (
        <div className="card p-5">
          <p className="label">Appearance</p>
          <p className="mt-1 text-foreground">{npc.appearance}</p>
        </div>
      )}

      <div className="card p-5">
        <p className="label">What&apos;s known</p>
        <p className="mt-1 whitespace-pre-wrap text-foreground">
          {npc.player_visible_info || "Nothing recorded yet."}
        </p>
      </div>

      {isDm && (
        <NpcEditForm npc={npc} secrets={secrets} characters={characters} locations={locations} />
      )}
    </div>
  );
}
