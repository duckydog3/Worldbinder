"use client";

import { deleteJournalEntry } from "./actions";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const action = deleteJournalEntry.bind(null, entryId);

  return (
    <button
      type="button"
      className="text-xs text-muted hover:text-danger"
      onClick={() => {
        if (confirm("Delete this entry?")) action();
      }}
    >
      Delete
    </button>
  );
}
