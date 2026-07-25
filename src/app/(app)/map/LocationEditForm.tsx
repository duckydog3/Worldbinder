"use client";

import { useState } from "react";
import type { Character, Location, LocationSecrets } from "@/lib/types/database";
import { LocationFormFields } from "./LocationFormFields";
import { ImageUpload } from "@/components/ImageUpload";
import { updateLocation, deleteLocation, setLocationImage } from "./actions";

export function LocationEditForm({
  location,
  secrets,
  characters,
  locations,
}: {
  location: Location;
  secrets: LocationSecrets | null;
  characters: Character[];
  locations: Location[];
}) {
  const [editing, setEditing] = useState(false);
  const action = updateLocation.bind(null, location.id, location.campaign_id);
  const removeAction = deleteLocation.bind(null, location.id);
  const imageAction = setLocationImage.bind(null, location.id);

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
      className="card-raised mt-3 space-y-5 p-4"
    >
      <ImageUpload
        pathPrefix={`locations/${location.id}`}
        currentPath={location.image_url}
        onChange={imageAction}
        label="Image"
      />
      <LocationFormFields
        location={location}
        secrets={secrets}
        characters={characters}
        locations={locations}
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
            if (confirm(`Delete ${location.name}? This cannot be undone.`)) {
              removeAction();
            }
          }}
        >
          Delete
        </button>
      </div>
    </form>
  );
}
