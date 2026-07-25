"use client";

import { generateInviteCode } from "./actions";

export function GenerateButton({
  campaignId,
  characterId,
  name,
}: {
  campaignId: string;
  characterId: string;
  name: string;
}) {
  const action = generateInviteCode.bind(null, campaignId, characterId, name);

  return (
    <button type="button" className="btn text-xs" onClick={() => action()}>
      Generate new code
    </button>
  );
}
