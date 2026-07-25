import type { DiscoveryState } from "@/lib/types/database";

const labels: Record<DiscoveryState, string> = {
  unknown: "Unknown",
  rumored: "Rumored",
  discovered: "Discovered",
};

export function DiscoveryBadge({ state }: { state: DiscoveryState }) {
  return <span className="badge">{labels[state]}</span>;
}
