"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/types/database";
import { updateCampaign } from "./actions";

export function CampaignEditForm({ campaign }: { campaign: Campaign }) {
  const [editing, setEditing] = useState(false);
  const action = updateCampaign.bind(null, campaign.id);

  if (!editing) {
    return (
      <button className="btn text-xs" onClick={() => setEditing(true)}>
        Edit campaign fields
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setEditing(false);
      }}
      className="card-raised mt-4 space-y-4 p-4"
    >
      <div className="space-y-1">
        <label className="label" htmlFor="name">
          Name
        </label>
        <input className="input" id="name" name="name" defaultValue={campaign.name} required />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="tagline">
          Tagline
        </label>
        <input
          className="input"
          id="tagline"
          name="tagline"
          defaultValue={campaign.tagline ?? ""}
        />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="current_location">
          Current location
        </label>
        <input
          className="input"
          id="current_location"
          name="current_location"
          defaultValue={campaign.current_location ?? ""}
        />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="current_objective">
          Current objective
        </label>
        <input
          className="input"
          id="current_objective"
          name="current_objective"
          defaultValue={campaign.current_objective ?? ""}
        />
      </div>
      <div className="space-y-1">
        <label className="label" htmlFor="latest_recap">
          Latest recap
        </label>
        <textarea
          className="input"
          id="latest_recap"
          name="latest_recap"
          rows={4}
          defaultValue={campaign.latest_recap ?? ""}
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
