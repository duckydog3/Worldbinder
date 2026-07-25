"use client";

import { useRef, useState } from "react";
import type { Location, Visibility } from "@/lib/types/database";
import { setLocationCoordinates } from "./actions";

// Matches the badge color language used everywhere else (VisibilityBadge) so
// the DM gets an at-a-glance read of what's revealed, without a new legend.
const visibilityDotClass: Record<Visibility, string> = {
  hidden: "bg-danger",
  revealed_to_specific: "bg-gold",
  revealed_to_party: "bg-accent",
};

export function MapPinEditor({ imageUrl, locations }: { imageUrl: string; locations: Location[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placingId, setPlacingId] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [livePositions, setLivePositions] = useState<Record<string, { x: number; y: number }>>({});

  const pinned = locations.filter((l) => l.map_x != null && l.map_y != null);
  const unplaced = locations.filter((l) => l.map_x == null || l.map_y == null);

  function percentFromEvent(e: { clientX: number; clientY: number }) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  function handleImageClick(e: React.MouseEvent) {
    if (!placingId || draggingId) return;
    const pos = percentFromEvent(e);
    if (!pos) return;
    const id = placingId;
    setPlacingId("");
    setLocationCoordinates(id, pos.x, pos.y);
  }

  function handlePinPointerDown(locationId: string) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDraggingId(locationId);
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const pos = percentFromEvent(e);
    if (!pos) return;
    setLivePositions((prev) => ({ ...prev, [draggingId]: pos }));
  }

  async function handlePointerUp() {
    if (!draggingId) return;
    const id = draggingId;
    const pos = livePositions[id];
    setDraggingId(null);
    if (pos) {
      await setLocationCoordinates(id, pos.x, pos.y);
      setLivePositions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-raised p-3">
        <label className="label" htmlFor="place-location">
          Place a pin for
        </label>
        <select
          id="place-location"
          className="input max-w-xs"
          value={placingId}
          onChange={(e) => setPlacingId(e.target.value)}
        >
          <option value="">Select a location…</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
              {l.map_x != null ? " (placed — click to move)" : ""}
            </option>
          ))}
        </select>
        {placingId && <p className="text-xs text-muted">Click anywhere on the map to place it.</p>}
      </div>

      <div
        ref={containerRef}
        className="card relative overflow-hidden p-0"
        style={{ cursor: placingId ? "crosshair" : "default" }}
        onClick={handleImageClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Campaign map" className="w-full select-none" draggable={false} />
        {pinned.map((loc) => {
          const live = livePositions[loc.id];
          const x = live?.x ?? Number(loc.map_x);
          const y = live?.y ?? Number(loc.map_y);
          return (
            <div
              key={loc.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <button
                type="button"
                onPointerDown={handlePinPointerDown(loc.id)}
                onClick={(e) => e.stopPropagation()}
                className={`h-3.5 w-3.5 cursor-grab rounded-full border-2 border-background shadow active:cursor-grabbing ${visibilityDotClass[loc.visibility]}`}
                title={`Drag to reposition ${loc.name}`}
              />
              <span className="whitespace-nowrap rounded bg-surface/90 px-1.5 py-0.5 text-xs text-foreground shadow">
                {loc.name}
              </span>
              <button
                type="button"
                className="text-[10px] text-muted hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocationCoordinates(loc.id, null, null);
                }}
              >
                remove pin
              </button>
            </div>
          );
        })}
      </div>

      {unplaced.length > 0 && (
        <p className="text-xs text-muted">Not yet placed: {unplaced.map((l) => l.name).join(", ")}</p>
      )}
    </div>
  );
}
