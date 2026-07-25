import Link from "next/link";
import type { Location } from "@/lib/types/database";

// Read-only, player-facing. `locations` must already be the RLS-filtered
// list the caller queried — this component adds no visibility logic of its
// own, it only renders whatever pins are already visible to the viewer.
export function MapPinOverlay({ locations }: { locations: Location[] }) {
  const pinned = locations.filter((l) => l.map_x != null && l.map_y != null);

  return (
    <>
      {pinned.map((loc) => (
        <Link
          key={loc.id}
          href={loc.map_image_url ? `/map?at=${loc.id}` : `/locations/${loc.id}`}
          className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${loc.map_x}%`, top: `${loc.map_y}%` }}
        >
          <span className="block h-3 w-3 rounded-full border-2 border-background bg-accent shadow transition-transform group-hover:scale-125" />
          <span className="whitespace-nowrap rounded bg-surface/90 px-1.5 py-0.5 text-xs text-foreground shadow">
            {loc.name}
          </span>
        </Link>
      ))}
    </>
  );
}
