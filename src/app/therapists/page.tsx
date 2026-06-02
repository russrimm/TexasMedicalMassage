import { Suspense } from "react";
import { searchTherapists } from "@/server/queries/search";
import { SearchPanel } from "@/components/search/search-panel";
import { TherapistCard } from "@/components/search/result-cards";
import { parseSearchParams } from "@/lib/search-params";

export const metadata = { title: "Find a Therapist" };

export default async function TherapistsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = parseSearchParams(sp);
  const results = await searchTherapists(params);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find a Therapist</h1>
        <p className="text-muted-foreground">
          Browse licensed Texas massage therapists. Filter by location, modality, and rating.
        </p>
      </div>
      <Suspense>
        <SearchPanel />
      </Suspense>

      {results.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">No therapists match your filters. Try widening your search.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{results.length} therapist{results.length === 1 ? "" : "s"} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => (
              <TherapistCard key={t.id} t={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
