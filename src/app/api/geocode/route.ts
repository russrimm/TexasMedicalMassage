import { NextRequest, NextResponse } from "next/server";

const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export async function GET(req: NextRequest) {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "MAPBOX_TOKEN not configured", features: [] },
      { status: 500 },
    );
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const lng = searchParams.get("lng");
  const lat = searchParams.get("lat");

  let url: string;
  if (q) {
    url = `${MAPBOX_BASE}/${encodeURIComponent(q)}.json?country=us&types=address,place,postcode&limit=5&access_token=${token}`;
  } else if (lng && lat) {
    url = `${MAPBOX_BASE}/${lng},${lat}.json?types=address,place&limit=1&access_token=${token}`;
  } else {
    return NextResponse.json({ error: "Provide ?q= or ?lng=&lat=" }, { status: 400 });
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Mapbox error", features: [] }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json({ features: data.features ?? [] });
}
