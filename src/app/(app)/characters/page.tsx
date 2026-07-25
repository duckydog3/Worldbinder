import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export default async function CharactersPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-foreground">Party</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {characters?.map((character) => (
          <Link
            key={character.id}
            href={`/characters/${character.id}`}
            className="card p-5 transition-colors hover:border-accent"
          >
            <div className="h-16 w-16 rounded-full bg-surface-raised" />
            <p className="mt-3 font-medium text-foreground">{character.name}</p>
            <p className="text-sm text-muted">{character.short_description}</p>
            {character.player_name && (
              <p className="mt-2 text-xs text-muted">played by {character.player_name}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
