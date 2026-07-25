"use client";

import { useState } from "react";
import type { Character, Location, LoreEntry, LoreSecrets, Npc } from "@/lib/types/database";
import { LoreFormFields } from "../LoreFormFields";
import { updateLoreEntry, deleteLoreEntry } from "../actions";

export function LoreEditForm({
  entry,
  secrets,
  characters,
  locations,
  npcs,
}: {
  entry: LoreEntry;
  secrets: LoreSecrets | null;
  characters: Character[];
  locations: Location[];
  npcs: Npc[];
}) {
  const [editing, setEditing] = useState(false);
  const action = updateLoreEntry.bind(null, entry.id, entry.campaign_id);
  const removeAction = deleteLoreEntry.bind(null, entry.id);

  if (!editing) {
    return (
      <button className="btn btn-primary" onClick={() => setEditing(true)}>
        Edit entry
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setEditing(false);
      }}
      className="card-raised space-y-5 p-5"
    >
      <h2 className="text-lg font-semibold text-foreground">Edit lore entry</h2>
      <LoreFormFields
        entry={entry}
        secrets={secrets}
        characters={characters}
        locations={locations}
        npcs={npcs}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button type="button" className="btn" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="btn text-danger"
          onClick={() => {
            if (confirm(`Delete "${entry.title}"? This cannot be undone.`)) {
              removeAction();
            }
          }}
        >
          Delete entry
        </button>
      </div>
    </form>
  );
}
