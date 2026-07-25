import type { Character, LoreEntry, LoreSecrets, Npc, Location } from "@/lib/types/database";
import { VisibilityControl } from "@/components/VisibilityControl";

export function LoreFormFields({
  entry,
  secrets,
  characters,
  locations,
  npcs,
  allEntries,
}: {
  entry?: LoreEntry;
  secrets?: LoreSecrets | null;
  characters: Character[];
  locations: Location[];
  npcs: Npc[];
  allEntries: LoreEntry[];
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            className="input"
            id="title"
            name="title"
            defaultValue={entry?.title ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="category">
            Category
          </label>
          <select
            className="input"
            id="category"
            name="category"
            defaultValue={entry?.category ?? "other"}
          >
            <option value="history">History</option>
            <option value="religion">Religion</option>
            <option value="culture">Culture</option>
            <option value="magic">Magic</option>
            <option value="creature">Creature</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="parent_entry_id">
            Nested under
          </label>
          <select
            className="input"
            id="parent_entry_id"
            name="parent_entry_id"
            defaultValue={entry?.parent_entry_id ?? ""}
          >
            <option value="">— top level —</option>
            {allEntries
              .filter((e) => e.id !== entry?.id)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="related_location_id">
            Related location
          </label>
          <select
            className="input"
            id="related_location_id"
            name="related_location_id"
            defaultValue={entry?.related_location_id ?? ""}
          >
            <option value="">—</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="related_npc_id">
            Related NPC
          </label>
          <select
            className="input"
            id="related_npc_id"
            name="related_npc_id"
            defaultValue={entry?.related_npc_id ?? ""}
          >
            <option value="">—</option>
            {npcs.map((npc) => (
              <option key={npc.id} value={npc.id}>
                {npc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="label" htmlFor="event_date_label">
            Timeline date (optional)
          </label>
          <input
            className="input"
            id="event_date_label"
            name="event_date_label"
            placeholder="e.g. Year 412, or 3 years before the campaign began"
            defaultValue={entry?.event_date_label ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="event_sort_value">
            Timeline order (optional)
          </label>
          <input
            className="input"
            id="event_sort_value"
            name="event_sort_value"
            type="number"
            step="any"
            placeholder="Lower = earlier"
            defaultValue={entry?.event_sort_value ?? ""}
          />
          <p className="text-xs text-muted">
            Only entries with a number here show up on the timeline. Text date alone isn&apos;t
            sortable.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="label" htmlFor="player_visible_content">
          Player-visible content
        </label>
        <textarea
          className="input"
          id="player_visible_content"
          name="player_visible_content"
          rows={6}
          defaultValue={entry?.player_visible_content ?? ""}
        />
      </div>

      <VisibilityControl
        initialVisibility={entry?.visibility ?? "hidden"}
        initialRevealedTo={entry?.revealed_to_character_ids ?? []}
        characters={characters}
      />

      <fieldset className="space-y-4 rounded-lg border-2 border-danger/40 p-4">
        <legend className="label px-1 text-danger">DM only — never sent to players</legend>
        <div className="space-y-1">
          <label className="label" htmlFor="dm_only_content">
            DM-only content
          </label>
          <textarea
            className="input"
            id="dm_only_content"
            name="dm_only_content"
            rows={4}
            defaultValue={secrets?.dm_only_content ?? ""}
          />
        </div>
      </fieldset>
    </>
  );
}
