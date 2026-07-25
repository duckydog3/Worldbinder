import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrl } from "@/lib/images";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { EntityImage } from "@/components/EntityImage";
import { LoreEditForm } from "./LoreEditForm";
import type { Character, Location, LoreEntry, Npc } from "@/lib/types/database";

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

  // Ancestor breadcrumb — walks parent_entry_id through the same RLS-scoped
  // client used everywhere else. A hidden ancestor just comes back null,
  // which stops the walk instead of leaking its existence via a placeholder.
  const breadcrumb: { id: string; title: string }[] = [];
  let cursor = entry.parent_entry_id;
  let guard = 0;
  while (cursor && guard < 20) {
    const { data: ancestor } = await supabase
      .from("lore_entries")
      .select("id, title, parent_entry_id")
      .eq("id", cursor)
      .maybeSingle();
    if (!ancestor) break;
    breadcrumb.unshift({ id: ancestor.id, title: ancestor.title });
    cursor = ancestor.parent_entry_id;
    guard++;
  }

  const { data: children } = await supabase
    .from("lore_entries")
    .select("id, title, category")
    .eq("parent_entry_id", id)
    .order("title");

  let secrets = null;
  let characters: Character[] = [];
  let locations: Location[] = [];
  let npcs: Npc[] = [];
  let allEntries: LoreEntry[] = [];

  if (isDm) {
    const [secretsRes, charactersRes, locationsRes, npcsRes, allEntriesRes] = await Promise.all([
      supabase.from("lore_secrets").select("*").eq("lore_entry_id", id).maybeSingle(),
      supabase.from("characters").select("*").eq("campaign_id", session.campaign.id).order("sort_order"),
      supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
      supabase.from("npcs").select("*").eq("campaign_id", session.campaign.id).order("name"),
      supabase.from("lore_entries").select("*").eq("campaign_id", session.campaign.id).order("title"),
    ]);
    secrets = secretsRes.data;
    characters = charactersRes.data ?? [];
    locations = locationsRes.data ?? [];
    npcs = npcsRes.data ?? [];
    allEntries = allEntriesRes.data ?? [];
  }

  const imageUrl = await getSignedImageUrl(entry.image_url);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {breadcrumb.length > 0 && (
        <p className="text-sm text-muted">
          {breadcrumb.map((b) => (
            <span key={b.id}>
              <Link href={`/lore/${b.id}`} className="hover:text-accent">
                {b.title}
              </Link>{" "}
              /{" "}
            </span>
          ))}
          <span className="text-foreground">{entry.title}</span>
        </p>
      )}

      <div className="flex items-start gap-4">
        {imageUrl && <EntityImage url={imageUrl} alt={entry.title} className="h-16 w-16 rounded-md" />}
        <div>
          <div className="flex items-center gap-2">
            <span className="badge">{categoryLabel[entry.category]}</span>
            {entry.event_date_label && <span className="label">{entry.event_date_label}</span>}
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

      {children && children.length > 0 && (
        <div className="card p-5">
          <p className="label mb-2">Related entries</p>
          <div className="space-y-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/lore/${child.id}`}
                className="flex items-center gap-2 text-sm text-foreground hover:text-accent"
              >
                <span className="badge">{categoryLabel[child.category]}</span>
                {child.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isDm && (
        <LoreEditForm
          entry={entry}
          secrets={secrets}
          characters={characters}
          locations={locations}
          npcs={npcs}
          allEntries={allEntries}
        />
      )}
    </div>
  );
}
