import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrl } from "@/lib/images";
import { DiscoveryBadge } from "@/components/DiscoveryBadge";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { EntityImage } from "@/components/EntityImage";
import { LocationEditForm } from "@/app/(app)/map/LocationEditForm";
import type { Character, Location } from "@/lib/types/database";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();
  // RLS returns nothing for a hidden location unless the caller is the DM —
  // a player guessing an id gets the same 404 as a nonexistent one, same
  // pattern as the NPC and lore detail pages.
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!location) notFound();

  let secrets = null;
  let characters: Character[] = [];
  let allLocations: Location[] = [];

  if (isDm) {
    const [secretsRes, charactersRes, locationsRes] = await Promise.all([
      supabase.from("location_secrets").select("*").eq("location_id", id).maybeSingle(),
      supabase
        .from("characters")
        .select("*")
        .eq("campaign_id", session.campaign.id)
        .order("sort_order"),
      supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
    ]);
    secrets = secretsRes.data;
    characters = charactersRes.data ?? [];
    allLocations = locationsRes.data ?? [];
  }

  // Same threshold as the map list: a "rumored" location stays a name/hint,
  // no image or full description, even though the row itself is visible.
  const showDetail = isDm || location.discovery_state === "discovered";
  const imageUrl = showDetail ? await getSignedImageUrl(location.image_url) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-5">
        {imageUrl && <EntityImage url={imageUrl} alt={location.name} className="h-20 w-20 rounded-md" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-foreground">{location.name}</h1>
            {location.is_wound && <span className="badge badge-hidden">Wound</span>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DiscoveryBadge state={location.discovery_state} />
            {isDm && <VisibilityBadge visibility={location.visibility} />}
            {(location.map_image_url || isDm) && (
              <Link href={`/map?at=${location.id}`} className="text-xs text-accent hover:underline">
                {location.map_image_url ? "open map" : "add a local map"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        {showDetail ? (
          <p className="whitespace-pre-wrap text-foreground">
            {location.description_player || "Nothing recorded yet."}
          </p>
        ) : (
          <p className="text-sm italic text-muted">Rumored — details unknown.</p>
        )}
      </div>

      {isDm && (
        <LocationEditForm
          location={location}
          secrets={secrets}
          characters={characters}
          locations={allLocations}
        />
      )}
    </div>
  );
}
