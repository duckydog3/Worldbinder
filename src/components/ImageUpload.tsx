"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "entity-images";

export function ImageUpload({
  pathPrefix,
  currentPath,
  onChange,
  label = "Image",
}: {
  pathPrefix: string;
  currentPath: string | null;
  onChange: (path: string | null) => Promise<void>;
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
        .from(BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      await onChange(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-raised p-3">
      <div>
        <p className="label">{label}</p>
        <p className="text-sm text-muted">{currentPath ? "An image is set." : "No image yet — optional."}</p>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      <div className="flex gap-2">
        <label className="btn cursor-pointer text-xs">
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
        {currentPath && (
          <button
            type="button"
            className="btn text-xs text-danger"
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
