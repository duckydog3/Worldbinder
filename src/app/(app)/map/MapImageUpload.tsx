"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MapImageUpload({
  pathPrefix,
  currentUrl,
  onChange,
  label = "Map background image",
}: {
  pathPrefix: string;
  currentUrl: string | null;
  onChange: (url: string | null) => Promise<void>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${pathPrefix}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("map-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("map-images").getPublicUrl(path);

      await onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex items-center justify-between gap-4 p-4">
      <div>
        <p className="label">{label}</p>
        <p className="text-sm text-muted">
          {currentUrl ? "A map image is set." : "No image yet — showing the list view."}
        </p>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      <div className="flex gap-2">
        <label className="btn cursor-pointer">
          {busy ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
        {currentUrl && (
          <button
            type="button"
            className="btn text-danger"
            disabled={busy}
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
