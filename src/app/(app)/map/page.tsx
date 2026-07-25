import { getSessionContext } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { getSignedImageUrls } from "@/lib/images";
import { DiscoveryBadge } from "@/components/DiscoveryBadge";
import { VisibilityBadge } from "@/components/VisibilityBadge";
import { EntityImage } from "@/components/EntityImage";
import { LocationEditForm } from "./LocationEditForm";
import { MapImageUpload } from "./MapImageUpload";
import { AnnotationPanel } from "./AnnotationPanel";
import Link from "next/link";
import type { Location, LocationSecrets, MapAnnotation } from "@/lib/types/database";

export default async function MapPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const isDm = session.membership.role === "dm";

  const supabase = await createClient();

  const [{ data: allLocations }, { data: characters }] = await Promise.all([
    supabase.from("locations").select("*").eq("campaign_id", session.campaign.id).order("name"),
    supabase
      .from("characters")
      .select("*")
      .eq("campaign_id", session.campaign.id)
      .order("sort_order"),
  ]);

  // Fog of war, defense-in-depth: even if a row's visibility already lets it
  // through RLS, an "unknown" location still shouldn't render for players.
  const locations = (allLocations ?? []).filter((l) => isDm || l.discovery_state !== "unknown");

  let secretsByLocationId = new Map<string, LocationSecrets>();
  if (isDm && locations.length > 0) {
    const { data: secrets } = await supabase
      .from("location_secrets")
      .select("*")
      .in(
        "location_id",
        locations.map((l) => l.id)
      );
    secretsByLocationId = new Map((secrets ?? []).map((s) => [s.location_id, s]));
  }

  let annotations: MapAnnotation[] = [];
  if (!isDm) {
    const { data } = await supabase
      .from("map_annotations")
      .select("*")
      .eq("campaign_id", session.campaign.id)
      .order("created_at", { ascending: false });
    annotations = data ?? [];
  }

  const topLevel = locations.filter((l) => !l.parent_location_id);
  const childrenOf = (id: string) => locations.filter((l) => l.parent_location_id === id);
  const pinned = locations.filter((l) => l.map_x != null && l.map_y != null);
  const imageUrls = await getSignedImageUrls(locations.map((l) => l.image_url));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Map</h1>
        {isDm && (
          <Link href="/map/new" className="btn btn-primary">
            New location
          </Link>
        )}
      </div>

      {isDm && <MapImageUpload campaignId={session.campaign.id} currentUrl={session.campaign.map_image_url} />}

      {session.campaign.map_image_url && (
        <div className="card relative overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={session.campaign.map_image_url} alt="Campaign map" className="w-full" />
          {pinned.map((loc) => (
            <div
              key={loc.id}
              title={loc.name}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent"
              style={{ left: `${loc.map_x}%`, top: `${loc.map_y}%` }}
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {topLevel.length === 0 && (
            <p className="text-sm text-muted">Nothing revealed on the map yet.</p>
          )}
          {topLevel.map((region) => (
            <LocationGroup
              key={region.id}
              location={region}
              childLocations={childrenOf(region.id)}
              isDm={isDm}
              characters={characters ?? []}
              allLocations={locations}
              secretsByLocationId={secretsByLocationId}
              imageUrls={imageUrls}
            />
          ))}
        </div>

        {!isDm && (
          <div>
            <AnnotationPanel
              campaignId={session.campaign.id}
              characterId={session.character?.id ?? null}
              annotations={annotations}
              locations={locations}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function LocationGroup({
  location,
  childLocations,
  isDm,
  characters,
  allLocations,
  secretsByLocationId,
  imageUrls,
}: {
  location: Location;
  childLocations: Location[];
  isDm: boolean;
  characters: import("@/lib/types/database").Character[];
  allLocations: Location[];
  secretsByLocationId: Map<string, LocationSecrets>;
  imageUrls: Record<string, string>;
}) {
  return (
    <div className="card p-5">
      <LocationCard
        location={location}
        isDm={isDm}
        characters={characters}
        allLocations={allLocations}
        secrets={secretsByLocationId.get(location.id) ?? null}
        imageUrls={imageUrls}
      />
      {childLocations.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-border pl-4">
          {childLocations.map((child) => (
            <LocationCard
              key={child.id}
              location={child}
              isDm={isDm}
              characters={characters}
              allLocations={allLocations}
              secrets={secretsByLocationId.get(child.id) ?? null}
              imageUrls={imageUrls}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LocationCard({
  location,
  isDm,
  characters,
  allLocations,
  secrets,
  imageUrls,
}: {
  location: Location;
  isDm: boolean;
  characters: import("@/lib/types/database").Character[];
  allLocations: Location[];
  secrets: LocationSecrets | null;
  imageUrls: Record<string, string>;
}) {
  // Players only get the image once discovery_state is "discovered" — that's
  // the same threshold that unlocks the full description_player text, so a
  // "rumored" location stays a name/hint and doesn't leak a picture either.
  const showImage = isDm || location.discovery_state === "discovered";
  const imageUrl = showImage && location.image_url ? imageUrls[location.image_url] ?? null : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {imageUrl && <EntityImage url={imageUrl} alt={location.name} className="h-10 w-10 rounded-md" />}
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{location.name}</p>
            {location.is_wound && <span className="badge badge-hidden">Wound</span>}
            <DiscoveryBadge state={location.discovery_state} />
            {isDm && <VisibilityBadge visibility={location.visibility} />}
          </div>
        </div>
        {isDm && <LocationEditForm location={location} secrets={secrets} characters={characters} locations={allLocations} />}
      </div>
      {location.discovery_state === "discovered" && location.description_player && (
        <p className="mt-1 text-sm text-muted">{location.description_player}</p>
      )}
      {location.discovery_state === "rumored" && (
        <p className="mt-1 text-sm italic text-muted">Rumored — details unknown.</p>
      )}
    </div>
  );
}
