import { Suspense } from "react";
import { searchBusinesses } from "@/server/queries/search";
import { SearchPanel } from "@/components/search/search-panel";
import { BusinessCard } from "@/components/search/result-cards";
import { parseSearchParams } from "@/lib/search-params";

export const metadata = { title: "Find a Business" };

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = parseSearchParams(sp);
  const results = await searchBusinesses(params);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Massage Businesses</h1>
        <p className="text-muted-foreground">Spas, clinics, and wellness centers across Texas.</p>
      </div>
      <Suspense>
        <SearchPanel showModalities={false} />
      </Suspense>

      {results.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">No businesses match your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{results.length} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((b) => (
              <BusinessCard key={b.id} b={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
