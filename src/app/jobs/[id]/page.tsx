import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, BriefcaseBusiness, Clock, DollarSign } from "lucide-react";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { jobs, businessProfiles, jobApplications, therapistProfiles } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyToJobAction } from "@/server/actions/reviews";
import { closeJobAction } from "@/server/actions/jobs";
import { startConversationAction } from "@/server/actions/messages";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [j] = await db
    .select({
      id: jobs.id,
      businessId: jobs.businessId,
      title: jobs.title,
      description: jobs.description,
      employmentType: jobs.employmentType,
      payMin: jobs.payMin,
      payMax: jobs.payMax,
      payPeriod: jobs.payPeriod,
      requiredModalities: jobs.requiredModalities,
      minYearsExperience: jobs.minYearsExperience,
      city: jobs.city,
      state: jobs.state,
      status: jobs.status,
      isMobile: jobs.isMobile,
      createdAt: jobs.createdAt,
      businessName: businessProfiles.businessName,
      businessUserId: businessProfiles.userId,
    })
    .from(jobs)
    .innerJoin(businessProfiles, eq(jobs.businessId, businessProfiles.id))
    .where(eq(jobs.id, id))
    .limit(1);

  if (!j) notFound();

  const isOwner = session?.user?.id === j.businessUserId;
  const isTherapist = session?.user?.role === "therapist";

  let alreadyApplied = false;
  if (isTherapist) {
    const [tp] = await db
      .select({ id: therapistProfiles.id })
      .from(therapistProfiles)
      .where(eq(therapistProfiles.userId, session!.user.id))
      .limit(1);
    if (tp) {
      const [app] = await db
        .select({ id: jobApplications.id })
        .from(jobApplications)
        .where(and(eq(jobApplications.jobId, j.id), eq(jobApplications.therapistId, tp.id)))
        .limit(1);
      alreadyApplied = !!app;
    }
  }

  let applicantCount = 0;
  if (isOwner) {
    const rows = await db.execute<{ count: number }>(
      sql`select count(*)::int as count from ${jobApplications} where job_id = ${j.id}`,
    );
    applicantCount = (rows as unknown as { count: number }[])[0]?.count ?? 0;
  }

  const pay =
    j.payMin && j.payMax
      ? `$${j.payMin}–${j.payMax}/${j.payPeriod ?? "hr"}`
      : j.payMin
      ? `From $${j.payMin}/${j.payPeriod ?? "hr"}`
      : "Pay not listed";

  return (
    <div className="container py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{j.title}</CardTitle>
                <Link
                  href={`/businesses/${j.businessId}`}
                  className="text-muted-foreground mt-1 hover:text-primary inline-block"
                >
                  {j.businessName}
                </Link>
              </div>
              <Badge variant={j.status === "open" ? "default" : "outline"} className="capitalize">
                {j.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {j.city}, {j.state}
                {j.isMobile && <span className="ml-1">· mobile</span>}
              </span>
              <span className="inline-flex items-center gap-1">
                <BriefcaseBusiness className="h-4 w-4" /> {j.employmentType.replace("_", "-")}
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-4 w-4" /> {pay}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted{" "}
                {new Date(j.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{j.description}</p>
            <div>
              <h3 className="text-sm font-semibold mb-2">Required modalities</h3>
              <div className="flex flex-wrap gap-1">
                {j.requiredModalities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specific modalities required.</p>
                ) : (
                  j.requiredModalities.map((m) => (
                    <Badge key={m} variant="secondary">
                      {m}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum experience: {j.minYearsExperience}+ years
            </p>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{j.status === "open" ? "Interested?" : "This job is closed"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isOwner ? (
              <>
                <p className="text-sm">{applicantCount} applicant{applicantCount === 1 ? "" : "s"}</p>
                {j.status === "open" && (
                  <form action={closeJobAction}>
                    <input type="hidden" name="jobId" value={j.id} />
                    <Button type="submit" variant="outline" className="w-full">
                      Close job
                    </Button>
                  </form>
                )}
              </>
            ) : isTherapist && j.status === "open" ? (
              alreadyApplied ? (
                <p className="text-sm text-muted-foreground">You&apos;ve already applied. ✓</p>
              ) : (
                <form action={applyToJobAction} className="space-y-3">
                  <input type="hidden" name="jobId" value={j.id} />
                  <div className="space-y-2">
                    <Label htmlFor="coverNote">Cover note (optional)</Label>
                    <Textarea id="coverNote" name="coverNote" rows={4} maxLength={2000} />
                  </div>
                  <Button type="submit" className="w-full">
                    Apply
                  </Button>
                </form>
              )
            ) : !session?.user ? (
              <Button asChild className="w-full">
                <Link href={`/signin?callbackUrl=/jobs/${j.id}`}>Sign in to apply</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only therapists can apply to jobs.
              </p>
            )}

            {!isOwner && session?.user?.role === "therapist" && j.status === "open" && (
              <form action={startConversationAction}>
                <input type="hidden" name="targetType" value="business" />
                <input type="hidden" name="targetProfileId" value={j.businessId} />
                <input type="hidden" name="jobId" value={j.id} />
                <Button type="submit" variant="outline" className="w-full">
                  Message business
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
