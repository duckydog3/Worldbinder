import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { LoreFormFields } from "../LoreFormFields";
import { createLoreEntry } from "../actions";

export default async function NewLorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSessionContext();
  if (!session) return null;
  if (session.membership.role !== "dm") redirect("/lore");

  const supabase = await createClient();
  const [{ data: characters }, { data: locations }, { data: npcs }, { data: allEntries }] =
    await Promise.all([
      supabase.from("characters").select("*").eq("campaign_id", session.campaign.id).order("sort_order"),
      supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
      supabase.from("npcs").select("*").eq("campaign_id", session.campaign.id).order("name"),
      supabase.from("lore_entries").select("*").eq("campaign_id", session.campaign.id).order("title"),
    ]);

  const action = createLoreEntry.bind(null, session.campaign.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">New lore entry</h1>
      {error && (
        <p className="rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <form action={action} className="card-raised space-y-5 p-5">
        <LoreFormFields
          characters={characters ?? []}
          locations={locations ?? []}
          npcs={npcs ?? []}
          allEntries={allEntries ?? []}
        />
        <button type="submit" className="btn btn-primary">
          Create entry
        </button>
      </form>
    </div>
  );
}
