"use client";

import { useState } from "react";
import type { Character, Location, Npc, NpcSecrets } from "@/lib/types/database";
import { NpcFormFields } from "../NpcFormFields";
import { updateNpc, deleteNpc } from "../actions";

export function NpcEditForm({
  npc,
  secrets,
  characters,
  locations,
}: {
  npc: Npc;
  secrets: NpcSecrets | null;
  characters: Character[];
  locations: Location[];
}) {
  const [editing, setEditing] = useState(false);
  const action = updateNpc.bind(null, npc.id, npc.campaign_id);
  const removeAction = deleteNpc.bind(null, npc.id);

  if (!editing) {
    return (
      <button className="btn btn-primary" onClick={() => setEditing(true)}>
        Edit NPC
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
      <h2 className="text-lg font-semibold text-foreground">Edit NPC</h2>

      <NpcFormFields npc={npc} secrets={secrets} characters={characters} locations={locations} />

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
            if (confirm(`Delete ${npc.name}? This cannot be undone.`)) {
              removeAction();
            }
          }}
        >
          Delete NPC
        </button>
      </div>
    </form>
  );
}
