import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { auth } from "@/server/auth";
import { searchJobs } from "@/server/queries/search";
import { SearchPanel } from "@/components/search/search-panel";
import { JobCard } from "@/components/search/result-cards";
import { Button } from "@/components/ui/button";
import { parseSearchParams } from "@/lib/search-params";

export const metadata = { title: "Browse Jobs" };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const params = parseSearchParams(sp);
  const results = await searchJobs(params);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Open Jobs</h1>
          <p className="text-muted-foreground">Find massage therapist roles near you in Texas.</p>
        </div>
        {session?.user?.role === "business" && (
          <Button asChild>
            <Link href="/jobs/new">
              <Plus /> Post a job
            </Link>
          </Button>
        )}
      </div>
      <Suspense>
        <SearchPanel />
      </Suspense>

      {results.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">No jobs match your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{results.length} job{results.length === 1 ? "" : "s"}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((j) => (
              <JobCard key={j.id} j={j} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
