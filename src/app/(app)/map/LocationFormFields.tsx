import type { Character, Location, LocationSecrets } from "@/lib/types/database";
import { VisibilityControl } from "@/components/VisibilityControl";

export function LocationFormFields({
  location,
  secrets,
  characters,
  locations,
}: {
  location?: Location;
  secrets?: LocationSecrets | null;
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
          <input
            className="input"
            id="name"
            name="name"
            defaultValue={location?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="type">
            Type
          </label>
          <select className="input" id="type" name="type" defaultValue={location?.type ?? "other"}>
            <option value="region">Region</option>
            <option value="town">Town</option>
            <option value="building">Building</option>
            <option value="wound">Wound</option>
            <option value="landmark">Landmark</option>
            <option value="road">Road</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="parent_location_id">
            Parent location
          </label>
          <select
            className="input"
            id="parent_location_id"
            name="parent_location_id"
            defaultValue={location?.parent_location_id ?? ""}
          >
            <option value="">— top level —</option>
            {locations
              .filter((l) => l.id !== location?.id)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="discovery_state">
            Discovery state
          </label>
          <select
            className="input"
            id="discovery_state"
            name="discovery_state"
            defaultValue={location?.discovery_state ?? "unknown"}
          >
            <option value="unknown">Unknown</option>
            <option value="rumored">Rumored (name/hint only)</option>
            <option value="discovered">Discovered (full description)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="map_x">
            Map X (0-100, optional)
          </label>
          <input
            className="input"
            id="map_x"
            name="map_x"
            type="number"
            step="0.1"
            defaultValue={location?.map_x ?? ""}
          />
        </div>
        <div className="space-y-1">
          <label className="label" htmlFor="map_y">
            Map Y (0-100, optional)
          </label>
          <input
            className="input"
            id="map_y"
            name="map_y"
            type="number"
            step="0.1"
            defaultValue={location?.map_y ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="is_wound" defaultChecked={location?.is_wound ?? false} />
        This is a Wound
      </label>

      <div className="space-y-1">
        <label className="label" htmlFor="description_player">
          Player-visible description
        </label>
        <textarea
          className="input"
          id="description_player"
          name="description_player"
          rows={4}
          defaultValue={location?.description_player ?? ""}
        />
      </div>

      <VisibilityControl
        initialVisibility={location?.visibility ?? "hidden"}
        initialRevealedTo={location?.revealed_to_character_ids ?? []}
        characters={characters}
      />

      <fieldset className="space-y-4 rounded-lg border-2 border-danger/40 p-4">
        <legend className="label px-1 text-danger">DM only — never sent to players</legend>
        <div className="space-y-1">
          <label className="label" htmlFor="description_dm">
            DM description
          </label>
          <textarea
            className="input"
            id="description_dm"
            name="description_dm"
            rows={3}
            defaultValue={secrets?.description_dm ?? ""}
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
