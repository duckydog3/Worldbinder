import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { JournalComposer } from "./JournalComposer";
import { DeleteEntryButton } from "./DeleteEntryButton";

export default async function JournalPage() {
  const session = await getSessionContext();
  if (!session) return null;
  if (!session.character) redirect("/campaign");

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Journal</h1>
        <p className="text-sm text-muted">
          Private to you — not visible to the DM or other players.
        </p>
      </div>

      <JournalComposer campaignId={session.campaign.id} characterId={session.character.id} />

      <div className="space-y-3">
        {entries?.map((entry) => (
          <div key={entry.id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="label">
                {new Date(entry.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <DeleteEntryButton entryId={entry.id} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-foreground">{entry.content}</p>
          </div>
        ))}
        {(!entries || entries.length === 0) && (
          <p className="text-sm text-muted">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
