import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { VisibilityBadge } from "@/components/VisibilityBadge";

const categoryLabel: Record<string, string> = {
  history: "History",
  religion: "Religion",
  culture: "Culture",
  magic: "Magic",
  creature: "Creature",
  other: "Other",
};

export default async function LorePage() {
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("lore_entries")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("title");

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

      {(!entries || entries.length === 0) && (
        <p className="text-sm text-muted">No lore revealed yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {entries?.map((entry) => (
          <Link
            key={entry.id}
            href={`/lore/${entry.id}`}
            className="card p-4 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between">
              <span className="badge">{categoryLabel[entry.category]}</span>
              {isDm && <VisibilityBadge visibility={entry.visibility} />}
            </div>
            <p className="mt-2 font-medium text-foreground">{entry.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
