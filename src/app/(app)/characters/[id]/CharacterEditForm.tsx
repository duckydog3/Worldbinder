"use client";

import { useState } from "react";
import type { Character } from "@/lib/types/database";
import { updateCharacter } from "../actions";

export function CharacterEditForm({ character }: { character: Character }) {
  const [editing, setEditing] = useState(false);
  const action = updateCharacter.bind(null, character.id);

  if (!editing) {
    return (
      <button className="btn text-xs" onClick={() => setEditing(true)}>
        Edit
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setEditing(false);
      }}
      className="card-raised space-y-4 p-4"
    >
      <div className="space-y-1">
        <label className="label" htmlFor="short_description">
          Short description
        </label>
        <input
          className="input"
          id="short_description"
          name="short_description"
          defaultValue={character.short_description ?? ""}
        />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="quote">
          Quote
        </label>
        <input className="input" id="quote" name="quote" defaultValue={character.quote ?? ""} />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="backstory_summary">
          Backstory summary
        </label>
        <textarea
          className="input"
          id="backstory_summary"
          name="backstory_summary"
          rows={6}
          defaultValue={character.backstory_summary ?? ""}
        />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="character_sheet_url">
          Character sheet link
        </label>
        <input
          className="input"
          id="character_sheet_url"
          name="character_sheet_url"
          type="url"
          placeholder="https://..."
          defaultValue={character.character_sheet_url ?? ""}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
