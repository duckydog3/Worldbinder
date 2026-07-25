import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";

export default async function CharactersPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("campaign_id", session.campaign.id)
    .order("sort_order");

  const imageUrls = await getSignedImageUrls((characters ?? []).map((c) => c.portrait_url));

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
            <EntityImage
              url={character.portrait_url ? imageUrls[character.portrait_url] ?? null : null}
              alt={character.name}
              className="h-16 w-16 rounded-full"
            />
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
