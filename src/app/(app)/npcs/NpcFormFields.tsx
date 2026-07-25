import type { Character, Location, Npc, NpcSecrets } from "@/lib/types/database";
import { VisibilityControl } from "@/components/VisibilityControl";

export function NpcFormFields({
  npc,
  secrets,
  characters,
  locations,
}: {
  npc?: Npc;
  secrets?: NpcSecrets | null;
  characters: Character[];
  locations: Location[];
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input className="input" id="name" name="name" defaultValue={npc?.name ?? ""} required />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="role_occupation">
            Role / occupation
          </label>
          <input
            className="input"
            id="role_occupation"
            name="role_occupation"
            defaultValue={npc?.role_occupation ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="status">
            Status
          </label>
          <select className="input" id="status" name="status" defaultValue={npc?.status ?? "alive"}>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="missing">Missing</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input
            className="input"
            id="tags"
            name="tags"
            defaultValue={npc?.tags.join(", ") ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="portrait_url">
            Portrait URL
          </label>
          <input
            className="input"
            id="portrait_url"
            name="portrait_url"
            defaultValue={npc?.portrait_url ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="last_known_location_id">
            Last known location
          </label>
          <select
            className="input"
            id="last_known_location_id"
            name="last_known_location_id"
            defaultValue={npc?.last_known_location_id ?? ""}
          >
            <option value="">—</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="label" htmlFor="appearance">
          Appearance
        </label>
        <textarea
          className="input"
          id="appearance"
          name="appearance"
          rows={2}
          defaultValue={npc?.appearance ?? ""}
        />
      </div>

      <div className="space-y-1">
        <label className="label" htmlFor="player_visible_info">
          Player-visible info
        </label>
        <textarea
          className="input"
          id="player_visible_info"
          name="player_visible_info"
          rows={3}
          defaultValue={npc?.player_visible_info ?? ""}
        />
        <p className="text-xs text-muted">Shown to players once revealed.</p>
      </div>

      <VisibilityControl
        initialVisibility={npc?.visibility ?? "hidden"}
        initialRevealedTo={npc?.revealed_to_character_ids ?? []}
        characters={characters}
      />

      <fieldset className="space-y-4 rounded-lg border-2 border-danger/40 p-4">
        <legend className="label px-1 text-danger">DM only — never sent to players</legend>
        <div className="space-y-1">
          <label className="label" htmlFor="secrets">
            Secrets
          </label>
          <textarea
            className="input"
            id="secrets"
            name="secrets"
            rows={2}
            defaultValue={secrets?.secrets ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="hidden_motives">
            Hidden motives
          </label>
          <textarea
            className="input"
            id="hidden_motives"
            name="hidden_motives"
            rows={2}
            defaultValue={secrets?.hidden_motives ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="true_allegiance">
            True allegiance
          </label>
          <input
            className="input"
            id="true_allegiance"
            name="true_allegiance"
            defaultValue={secrets?.true_allegiance ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="future_plans">
            Future plans
          </label>
          <textarea
            className="input"
            id="future_plans"
            name="future_plans"
            rows={2}
            defaultValue={secrets?.future_plans ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="dm_notes">
            DM notes
          </label>
          <textarea
            className="input"
            id="dm_notes"
            name="dm_notes"
            rows={2}
            defaultValue={secrets?.dm_notes ?? ""}
          />
        </div>
      </fieldset>
    </>
  );
}
