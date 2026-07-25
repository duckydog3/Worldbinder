import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/images";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { EntityImage } from "@/components/EntityImage";
import type { LoreEntry } from "@/lib/types/database";

const categoryLabel: Record<string, string> = {
  history: "History",
  religion: "Religion",
  culture: "Culture",
  magic: "Magic",
  creature: "Creature",
  other: "Other",
};

export default async function LorePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView = view === "timeline" ? "timeline" : "tree";

  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  // RLS already scopes this to visible rows only — both views below just
  // arrange whatever came back, no extra permission logic.
  const { data: entries } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("title");

  const list = entries ?? [];
  const imageUrls = await getSignedImageUrls(list.map((e) => e.image_url));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Lore</h1>
        {isDm && (
          <Link href="/lore/new" className="btn btn-primary">
            New entry
          </Link>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        <Link
          href="/lore?view=tree"
          className={`rounded-t-md px-3 py-1.5 text-sm ${
            activeView === "tree" ? "bg-surface-raised text-foreground" : "text-muted"
          }`}
        >
          Tree
        </Link>
        <Link
          href="/lore?view=timeline"
          className={`rounded-t-md px-3 py-1.5 text-sm ${
            activeView === "timeline" ? "bg-surface-raised text-foreground" : "text-muted"
          }`}
        >
          Timeline
        </Link>
      </div>

      {list.length === 0 && <p className="text-sm text-muted">No lore revealed yet.</p>}

      {activeView === "tree" ? (
        <LoreTree entries={list} isDm={isDm} imageUrls={imageUrls} />
      ) : (
        <LoreTimeline entries={list} isDm={isDm} imageUrls={imageUrls} />
      )}
    </div>
  );
}

function LoreTree({
  entries,
  isDm,
  imageUrls,
}: {
  entries: LoreEntry[];
  isDm: boolean;
  imageUrls: Record<string, string>;
}) {
  const visibleIds = new Set(entries.map((e) => e.id));
  const childrenOf = new Map<string, LoreEntry[]>();
  const roots: LoreEntry[] = [];

  for (const entry of entries) {
    // If the parent isn't in this viewer's visible set (hidden from them,
    // or doesn't exist), fall back to top-level rather than dropping the
    // entry — a revealed entry never silently disappears.
    if (entry.parent_entry_id && visibleIds.has(entry.parent_entry_id)) {
      const siblings = childrenOf.get(entry.parent_entry_id) ?? [];
      siblings.push(entry);
      childrenOf.set(entry.parent_entry_id, siblings);
    } else {
      roots.push(entry);
    }
  }

  if (roots.length === 0) return null;

  return (
    <div className="space-y-2">
      {roots.map((entry) => (
        <LoreTreeNode
          key={entry.id}
          entry={entry}
          childrenOf={childrenOf}
          depth={0}
          isDm={isDm}
          imageUrls={imageUrls}
        />
      ))}
    </div>
  );
}

function LoreTreeNode({
  entry,
  childrenOf,
  depth,
  isDm,
  imageUrls,
}: {
  entry: LoreEntry;
  childrenOf: Map<string, LoreEntry[]>;
  depth: number;
  isDm: boolean;
  imageUrls: Record<string, string>;
}) {
  const kids = childrenOf.get(entry.id) ?? [];

  return (
    <div className={depth > 0 ? "ml-5 border-l-2 border-border pl-4" : ""}>
      <Link
        href={`/lore/${entry.id}`}
        className="card flex items-center gap-3 p-3 transition-colors hover:border-accent"
      >
        {entry.image_url && (
          <EntityImage url={imageUrls[entry.image_url] ?? null} alt={entry.title} className="h-10 w-10 rounded-md" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="badge">{categoryLabel[entry.category]}</span>
            {isDm && <VisibilityBadge visibility={entry.visibility} />}
          </div>
          <p className="mt-1 font-medium text-foreground">{entry.title}</p>
        </div>
      </Link>
      {kids.length > 0 && (
        <div className="mt-2 space-y-2">
          {kids.map((child) => (
            <LoreTreeNode
              key={child.id}
              entry={child}
              childrenOf={childrenOf}
              depth={depth + 1}
              isDm={isDm}
              imageUrls={imageUrls}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoreTimeline({
  entries,
  isDm,
  imageUrls,
}: {
  entries: LoreEntry[];
  isDm: boolean;
  imageUrls: Record<string, string>;
}) {
  const dated = entries
    .filter((e) => e.event_sort_value != null)
    .sort((a, b) => Number(a.event_sort_value) - Number(b.event_sort_value));

  if (dated.length === 0) {
    return (
      <p className="text-sm text-muted">
        No dated entries yet — set a timeline order on a lore entry to place it here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {dated.map((entry) => (
        <Link
          key={entry.id}
          href={`/lore/${entry.id}`}
          className="card flex items-center gap-3 border-l-2 border-l-accent p-3 transition-colors hover:border-accent"
        >
          {entry.image_url && (
            <EntityImage url={imageUrls[entry.image_url] ?? null} alt={entry.title} className="h-10 w-10 rounded-md" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="label">{entry.event_date_label || "Undated"}</span>
              <span className="badge">{categoryLabel[entry.category]}</span>
              {isDm && <VisibilityBadge visibility={entry.visibility} />}
            </div>
            <p className="mt-1 font-medium text-foreground">{entry.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
