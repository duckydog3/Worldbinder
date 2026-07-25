"use client";

import { useState } from "react";
import type { Character, Location, LoreEntry, LoreSecrets, Npc } from "@/lib/types/database";
import { LoreFormFields } from "../LoreFormFields";
import { ImageUpload } from "@/components/ImageUpload";
import { updateLoreEntry, deleteLoreEntry, setLoreImage } from "../actions";

export function LoreEditForm({
  entry,
  secrets,
  characters,
  locations,
  npcs,
  allEntries,
}: {
  entry: LoreEntry;
  secrets: LoreSecrets | null;
  characters: Character[];
  locations: Location[];
  npcs: Npc[];
  allEntries: LoreEntry[];
}) {
  const [editing, setEditing] = useState(false);
  const action = updateLoreEntry.bind(null, entry.id, entry.campaign_id);
  const removeAction = deleteLoreEntry.bind(null, entry.id);
  const imageAction = setLoreImage.bind(null, entry.id);

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
      <ImageUpload
        pathPrefix={`lore/${entry.id}`}
        currentPath={entry.image_url}
        onChange={imageAction}
        label="Image"
      />
      <LoreFormFields
        entry={entry}
        secrets={secrets}
        characters={characters}
        locations={locations}
        npcs={npcs}
        allEntries={allEntries}
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
