import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrl } from "@/lib/images";
import { EntityImage } from "@/components/EntityImage";
import { CharacterEditForm } from "./CharacterEditForm";

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionContext();
  if (!session) return null;

  const supabase = await createClient();
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!character) notFound();

  const isDm = session.membership.role === "dm";
  const canEdit = isDm || character.user_id === session.userId;
  const imageUrl = await getSignedImageUrl(character.portrait_url);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-5">
        <EntityImage url={imageUrl} alt={character.name} className="h-24 w-24 rounded-full" />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{character.name}</h1>
          {character.player_name && (
            <p className="text-sm text-muted">played by {character.player_name}</p>
          )}
          {character.quote && (
            <p className="mt-2 font-serif text-lg italic text-muted">&ldquo;{character.quote}&rdquo;</p>
          )}
        </div>
      </div>

      <div className="card p-5">
        <p className="label">Description</p>
        <p className="mt-1 text-foreground">
          {character.short_description || "Nothing set yet."}
        </p>
      </div>

      <div className="card p-5">
        <p className="label">Backstory</p>
        <p className="mt-1 whitespace-pre-wrap text-foreground">
          {character.backstory_summary || "Nothing set yet."}
        </p>
      </div>

      {character.character_sheet_url && (
        <a
          href={character.character_sheet_url}
          target="_blank"
          rel="noreferrer"
          className="btn inline-flex"
        >
          Open character sheet
        </a>
      )}

      {canEdit && <CharacterEditForm character={character} isDm={isDm} />}
    </div>
  );
}
