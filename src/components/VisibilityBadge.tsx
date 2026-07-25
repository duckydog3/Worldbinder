import type { Visibility } from "@/lib/types/database";

const labels: Record<Visibility, string> = {
  hidden: "Hidden",
  revealed_to_specific: "Specific",
  revealed_to_party: "Party",
};

const classes: Record<Visibility, string> = {
  hidden: "badge-hidden",
  revealed_to_specific: "badge-specific",
  revealed_to_party: "badge-party",
};

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  return <span className={`badge ${classes[visibility]}`}>{labels[visibility]}</span>;
}
