import type { SearchParams } from "@/server/queries/search";

export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchParams {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const lng = get("lng");
  const lat = get("lat");
  const radius = get("radius");
  const modalities = get("modalities");
  const minRating = get("minRating");
  return {
    q: get("q") || undefined,
    lng: lng ? Number(lng) : undefined,
    lat: lat ? Number(lat) : undefined,
    radiusMi: radius ? Number(radius) : lng && lat ? 25 : undefined,
    modalities: modalities ? modalities.split(",").filter(Boolean) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
  };
}
