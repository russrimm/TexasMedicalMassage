import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import {
  jobs,
  jobApplications,
  therapistProfiles,
  businessProfiles,
} from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/search/result-cards";
import { searchJobs } from "@/server/queries/search";
import type { JobResult } from "@/server/queries/search";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const user = session.user;

  if (user.role === "therapist") {
    const [tp] = await db
      .select({
        id: therapistProfiles.id,
        displayName: therapistProfiles.displayName,
        city: therapistProfiles.city,
        modalities: therapistProfiles.modalities,
        lng: sql<number>`ST_X(${therapistProfiles.location}::geometry)`,
        lat: sql<number>`ST_Y(${therapistProfiles.location}::geometry)`,
        radius: therapistProfiles.serviceRadiusMiles,
      })
      .from(therapistProfiles)
      .where(eq(therapistProfiles.userId, user.id))
      .limit(1);

    const recommended = tp?.lng && tp?.lat
      ? await searchJobs({
          lng: tp.lng,
          lat: tp.lat,
          radiusMi: tp.radius ?? 25,
          modalities: tp.modalities,
          limit: 6,
        })
      : [];

    const myApps = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        createdAt: jobApplications.createdAt,
        jobId: jobs.id,
        jobTitle: jobs.title,
        businessName: businessProfiles.businessName,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(businessProfiles, eq(jobs.businessId, businessProfiles.id))
      .where(tp ? eq(jobApplications.therapistId, tp.id) : sql`false`)
      .orderBy(desc(jobApplications.createdAt))
      .limit(20);

    return (
      <div className="container py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {tp?.displayName ?? user.name}</h1>
          <p className="text-muted-foreground">Jobs picked for you near {tp?.city ?? "your area"}.</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3">Recommended jobs</h2>
          {recommended.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                <Link href="/onboarding/profile" className="text-primary hover:underline">
                  Complete your profile
                </Link>{" "}
                to see recommendations.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((j: JobResult) => (
                <JobCard key={j.id} j={j} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">My applications</h2>
          {myApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="grid gap-2">
              {myApps.map((a) => (
                <Card key={a.id}>
                  <CardContent className="py-4 flex items-center justify-between gap-3">
                    <div>
                      <Link href={`/jobs/${a.jobId}`} className="font-medium hover:text-primary">
                        {a.jobTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground">{a.businessName}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {a.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Business dashboard
  const [bp] = await db
    .select({ id: businessProfiles.id, businessName: businessProfiles.businessName })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, user.id))
    .limit(1);

  const myJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      createdAt: jobs.createdAt,
      applicantCount: sql<number>`(select count(*)::int from ${jobApplications} where ${jobApplications.jobId} = ${jobs.id})`,
    })
    .from(jobs)
    .where(bp ? eq(jobs.businessId, bp.id) : sql`false`)
    .orderBy(desc(jobs.createdAt))
    .limit(50);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">{bp?.businessName ?? "Your business"}</h1>
          <p className="text-muted-foreground">Manage jobs and view applicants.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus /> Post a job
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your jobs</h2>
        {myJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t posted any jobs yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {myJobs.map((j) => (
              <Card key={j.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link href={`/jobs/${j.id}`} className="font-semibold hover:text-primary">
                      {j.title}
                    </Link>
                    <Badge variant={j.status === "open" ? "default" : "outline"} className="capitalize">
                      {j.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex items-center justify-between gap-3">
                  <span>
                    Posted {new Date(j.createdAt).toLocaleDateString()} · {j.applicantCount}{" "}
                    applicant{j.applicantCount === 1 ? "" : "s"}
                  </span>
                  <Link href={`/jobs/${j.id}/applicants`} className="text-primary hover:underline">
                    View applicants →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
