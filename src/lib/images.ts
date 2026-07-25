import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "entity-images";
// Long enough to cover a single page view, short enough to bound exposure
// if a viewer ever copies the URL out of the app.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

// Only ever call this after fetching the row through an RLS-scoped query —
// that's what ties image visibility to the entity's own visibility rule.
// The admin client bypasses storage RLS entirely, which is fine because the
// bucket has no SELECT policy for anyone else to exploit either way.
export async function getSignedImageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return null;
  return data.signedUrl;
}

// Batch variant for list views — one round trip instead of N.
export async function getSignedImageUrls(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const uniquePaths = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (uniquePaths.length === 0) return {};

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}
