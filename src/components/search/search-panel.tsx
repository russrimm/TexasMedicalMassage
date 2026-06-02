"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LocateFixed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MODALITIES } from "@/lib/utils";

export function SearchPanel({ showModalities = true }: { showModalities?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [radius, setRadius] = useState(params.get("radius") ?? "25");
  const [lng, setLng] = useState(params.get("lng") ?? "");
  const [lat, setLat] = useState(params.get("lat") ?? "");
  const [where, setWhere] = useState(params.get("where") ?? "");
  const initialMods = (params.get("modalities") ?? "").split(",").filter(Boolean);
  const [mods, setMods] = useState<string[]>(initialMods);

  function apply(extra?: Record<string, string>) {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (radius) next.set("radius", radius);
    if (lng && lat) {
      next.set("lng", lng);
      next.set("lat", lat);
    }
    if (where) next.set("where", where);
    if (mods.length) next.set("modalities", mods.join(","));
    if (extra) for (const [k, v] of Object.entries(extra)) next.set(k, v);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  async function useGps() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lngStr = pos.coords.longitude.toString();
        const latStr = pos.coords.latitude.toString();
        setLng(lngStr);
        setLat(latStr);
        setWhere("My location");
        apply({ lng: lngStr, lat: latStr, where: "My location" });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function geocodeWhere() {
    if (!where.trim()) return;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(where)}`);
    if (!res.ok) return;
    const data: { features: { center: [number, number]; place_name: string }[] } = await res.json();
    const first = data.features?.[0];
    if (first) {
      const [glng, glat] = first.center;
      setLng(String(glng));
      setLat(String(glat));
      apply({ lng: String(glng), lat: String(glat) });
    }
  }

  function toggleMod(m: string) {
    setMods((curr) => (curr.includes(m) ? curr.filter((x) => x !== m) : [...curr, m]));
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="grid md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keyword (name, title, modality)"
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Where (city, ZIP)"
            onKeyDown={(e) => e.key === "Enter" && geocodeWhere()}
          />
          <Button type="button" variant="outline" onClick={useGps} aria-label="Use GPS">
            <LocateFixed />
          </Button>
        </div>
        <div className="md:col-span-2">
          <Input
            type="number"
            min={1}
            max={500}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            aria-label="Radius (miles)"
            placeholder="25 mi"
          />
        </div>
        <div className="md:col-span-2">
          <Button onClick={() => (where && (!lng || !lat) ? geocodeWhere() : apply())} className="w-full" disabled={pending}>
            {pending ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {showModalities && (
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map((m) => {
            const on = mods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMod(m)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge variant={on ? "default" : "outline"} className="cursor-pointer">
                  {m}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
