import { notFound, redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { jobs, jobApplications, therapistProfiles, businessProfiles, users } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const [j] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      businessUserId: businessProfiles.userId,
    })
    .from(jobs)
    .innerJoin(businessProfiles, eq(jobs.businessId, businessProfiles.id))
    .where(eq(jobs.id, id))
    .limit(1);
  if (!j) notFound();
  if (j.businessUserId !== session.user.id) redirect("/dashboard");

  const apps = await db
    .select({
      id: jobApplications.id,
      status: jobApplications.status,
      coverNote: jobApplications.coverNote,
      createdAt: jobApplications.createdAt,
      therapistId: therapistProfiles.id,
      displayName: therapistProfiles.displayName,
      city: therapistProfiles.city,
      yearsExperience: therapistProfiles.yearsExperience,
      ratingAvg: therapistProfiles.ratingAvg,
      ratingCount: therapistProfiles.ratingCount,
      modalities: therapistProfiles.modalities,
    })
    .from(jobApplications)
    .innerJoin(therapistProfiles, eq(jobApplications.therapistId, therapistProfiles.id))
    .where(eq(jobApplications.jobId, id))
    .orderBy(desc(jobApplications.createdAt));

  return (
    <div className="container py-8 space-y-6">
      <div>
        <Link href={`/jobs/${j.id}`} className="text-sm text-muted-foreground hover:text-primary">
          ← Back to job
        </Link>
        <h1 className="text-3xl font-bold mt-2">Applicants for &ldquo;{j.title}&rdquo;</h1>
        <p className="text-muted-foreground">{apps.length} total</p>
      </div>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No applications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <Link
                      href={`/therapists/${a.therapistId}`}
                      className="font-semibold hover:text-primary"
                    >
                      {a.displayName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {a.city} · {a.yearsExperience}+ years · ★ {a.ratingAvg} ({a.ratingCount})
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {a.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.modalities.slice(0, 6).map((m) => (
                    <Badge key={m} variant="secondary">
                      {m}
                    </Badge>
                  ))}
                </div>
                {a.coverNote && (
                  <p className="text-sm whitespace-pre-wrap pt-2 border-t">{a.coverNote}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
