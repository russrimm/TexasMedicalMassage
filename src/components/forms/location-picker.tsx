"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, LocateFixed, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Defaults = Partial<{
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  longitude: number;
  latitude: number;
}>;

type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number];
  context?: { id: string; text: string }[];
  text?: string;
};

export function LocationPicker({ defaults = {} }: { defaults?: Defaults }) {
  const [query, setQuery] = useState(
    defaults.addressLine1
      ? `${defaults.addressLine1}, ${defaults.city ?? ""} ${defaults.state ?? ""}`
      : "",
  );
  const [results, setResults] = useState<Suggestion[]>([]);
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(
    defaults.longitude && defaults.latitude
      ? { lng: defaults.longitude, lat: defaults.latitude }
      : null,
  );
  const [address, setAddress] = useState({
    addressLine1: defaults.addressLine1 ?? "",
    city: defaults.city ?? "",
    state: defaults.state ?? "TX",
    postalCode: defaults.postalCode ?? "",
  });
  const [searching, setSearching] = useState(false);
  const [usingGps, setUsingGps] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error("Geocode failed");
      const data: { features: Suggestion[] } = await res.json();
      setResults(data.features ?? []);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function pickResult(s: Suggestion) {
    const [lng, lat] = s.center;
    setCoords({ lng, lat });
    const ctx = s.context ?? [];
    const get = (prefix: string) => ctx.find((c) => c.id.startsWith(prefix))?.text ?? "";
    setAddress({
      addressLine1: s.text ?? s.place_name.split(",")[0] ?? "",
      city: get("place"),
      state: (get("region") || "TX").slice(0, 2).toUpperCase(),
      postalCode: get("postcode"),
    });
    setQuery(s.place_name);
    setResults([]);
  }

  async function useGps() {
    if (!navigator.geolocation) return;
    setUsingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude, latitude } = pos.coords;
        setCoords({ lng: longitude, lat: latitude });
        try {
          const res = await fetch(`/api/geocode?lng=${longitude}&lat=${latitude}`);
          const data: { features: Suggestion[] } = await res.json();
          const first = data.features?.[0];
          if (first) pickResult(first);
        } finally {
          setUsingGps(false);
        }
      },
      () => setUsingGps(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    // Suppress when input is empty
    if (!query) setResults([]);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search address or city, e.g. 123 Main St, Austin TX"
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
          />
        </div>
        <Button type="button" variant="secondary" onClick={runSearch} disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </Button>
        <Button type="button" variant="outline" onClick={useGps} disabled={usingGps} aria-label="Use my location">
          <LocateFixed />
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-card text-sm">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => pickResult(r)}
                className="w-full text-left px-3 py-2 hover:bg-accent flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>{r.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Address">
          <Input
            name="addressLine1"
            value={address.addressLine1}
            onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
          />
        </Field>
        <Field label="City *">
          <Input
            name="city"
            required
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
        </Field>
        <Field label="State">
          <Input
            name="state"
            value={address.state}
            maxLength={2}
            onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="Postal code">
          <Input
            name="postalCode"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          />
        </Field>
      </div>

      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />

      {coords ? (
        <p className="text-xs text-muted-foreground">
          Location set: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
      ) : (
        <p className="text-xs text-destructive">
          Pick a location above (search, use GPS, or type your city and search).
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
