"use client";

import { useRef } from "react";
import { addJournalEntry } from "./actions";

export function JournalComposer({
  campaignId,
  characterId,
}: {
  campaignId: string;
  characterId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addJournalEntry.bind(null, campaignId, characterId);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="card space-y-3 p-4"
    >
      <textarea
        className="input"
        name="content"
        rows={5}
        placeholder="What's on your mind..."
        required
      />
      <button type="submit" className="btn btn-primary">
        Save entry
      </button>
    </form>
  );
}
