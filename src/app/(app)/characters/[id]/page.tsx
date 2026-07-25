import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
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

  const canEdit = session.membership.role === "dm" || character.user_id === session.userId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-5">
        <div className="h-24 w-24 shrink-0 rounded-full bg-surface-raised" />
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

      {canEdit && <CharacterEditForm character={character} />}
    </div>
  );
}
