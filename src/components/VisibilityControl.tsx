"use client";

import { useState } from "react";
import type { Character, Visibility } from "@/lib/types/database";

const options: { value: Visibility; label: string; hint: string; className: string }[] = [
  {
    value: "hidden",
    label: "Hidden",
    hint: "Invisible to players — doesn't appear anywhere for them.",
    className: "border-danger text-danger",
  },
  {
    value: "revealed_to_specific",
    label: "Revealed to specific",
    hint: "Only the players you pick below can see it.",
    className: "border-gold text-gold",
  },
  {
    value: "revealed_to_party",
    label: "Revealed to party",
    hint: "Every player can see it.",
    className: "border-accent text-accent",
  },
];

export function VisibilityControl({
  initialVisibility,
  initialRevealedTo,
  characters,
}: {
  initialVisibility: Visibility;
  initialRevealedTo: string[];
  characters: Character[];
}) {
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);

  return (
    <div className="space-y-3 rounded-lg border-2 border-border p-4">
      <p className="label">Visibility — who can see this</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-md border-2 p-3 text-sm transition-colors ${
              visibility === opt.value ? opt.className : "border-border text-muted"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                className="accent-current"
              />
              <span className="font-medium">{opt.label}</span>
            </div>
            <p className="mt-1 text-xs opacity-80">{opt.hint}</p>
          </label>
        ))}
      </div>

      {visibility === "revealed_to_specific" && (
        <div className="rounded-md border border-border bg-surface-raised p-3">
          <p className="label mb-2">Visible to</p>
          <div className="flex flex-wrap gap-3">
            {characters.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="revealed_to_character_ids"
                  value={c.id}
                  defaultChecked={initialRevealedTo.includes(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
