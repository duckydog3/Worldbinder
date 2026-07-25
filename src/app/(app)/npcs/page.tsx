import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { VisibilityBadge } from "@/components/VisibilityBadge";

const statusLabel: Record<string, string> = {
  alive: "Alive",
  dead: "Dead",
  missing: "Missing",
  unknown: "Unknown",
};

export default async function NpcsPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  // RLS filters this to only visible rows for players — hidden NPCs never
  // reach the client at all.
  const { data: npcs } = await supabase
    .from("npcs")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">NPCs</h1>
        {isDm && (
          <Link href="/npcs/new" className="btn btn-primary">
            New NPC
          </Link>
        )}
      </div>

      {(!npcs || npcs.length === 0) && (
        <p className="text-sm text-muted">No NPCs revealed yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {npcs?.map((npc) => (
          <Link
            key={npc.id}
            href={`/npcs/${npc.id}`}
            className="card p-4 transition-colors hover:border-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="h-12 w-12 shrink-0 rounded-full bg-surface-raised" />
              {isDm && <VisibilityBadge visibility={npc.visibility} />}
            </div>
            <p className="mt-3 font-medium text-foreground">{npc.name}</p>
            <p className="text-sm text-muted">{npc.role_occupation}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="badge">{statusLabel[npc.status]}</span>
              {npc.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
