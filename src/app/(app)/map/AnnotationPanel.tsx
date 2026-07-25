"use client";

import { useRef } from "react";
import type { Location, MapAnnotation } from "@/lib/types/database";
import { addAnnotation, deleteAnnotation } from "./actions";

export function AnnotationPanel({
  campaignId,
  characterId,
  annotations,
  locations,
}: {
  campaignId: string;
  characterId: string | null;
  annotations: MapAnnotation[];
  locations: Location[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addAnnotation.bind(null, campaignId, characterId);

  return (
    <div className="card p-4">
      <p className="label">Party notes</p>
      <p className="mb-3 text-xs text-muted">
        Shared with the party only — the DM can&apos;t see this.
      </p>

      <div className="space-y-2">
        {annotations.map((a) => {
          const text = typeof a.data?.text === "string" ? a.data.text : "";
          const location = locations.find((l) => l.id === a.location_id);
          return (
            <div key={a.id} className="flex items-start justify-between gap-2 rounded-md border border-border p-2">
              <div>
                {location && <p className="text-xs text-accent">{location.name}</p>}
                <p className="text-sm text-foreground">{text}</p>
              </div>
              <button
                type="button"
                className="text-xs text-muted hover:text-danger"
                onClick={() => deleteAnnotation(a.id)}
              >
                Remove
              </button>
            </div>
          );
        })}
        {annotations.length === 0 && <p className="text-sm text-muted">No notes yet.</p>}
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          await action(formData);
          formRef.current?.reset();
        }}
        className="mt-4 space-y-2"
      >
        <select className="input" name="location_id" defaultValue="">
          <option value="">No specific location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <textarea className="input" name="text" rows={2} placeholder="Add a note..." required />
        <button type="submit" className="btn btn-primary text-sm">
          Add note
        </button>
      </form>
    </div>
  );
}
