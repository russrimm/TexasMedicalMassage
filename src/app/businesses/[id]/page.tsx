import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Phone, MessageCircle } from "lucide-react";
import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import { businessProfiles, jobs, reviews, users } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stars } from "@/components/ui/stars";
import { JobCard } from "@/components/search/result-cards";
import { startConversationAction } from "@/server/actions/messages";
import { ReviewForm } from "@/components/reviews/review-form";
import type { JobResult } from "@/server/queries/search";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [b] = await db
    .select({
      id: businessProfiles.id,
      userId: businessProfiles.userId,
      businessName: businessProfiles.businessName,
      type: businessProfiles.type,
      description: businessProfiles.description,
      website: businessProfiles.website,
      phone: businessProfiles.phone,
      city: businessProfiles.city,
      state: businessProfiles.state,
      ratingAvg: businessProfiles.ratingAvg,
      ratingCount: businessProfiles.ratingCount,
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.id, id))
    .limit(1);

  if (!b) notFound();

  const openJobsRows = await db.execute<JobResult>(sql`
    select j.id, j.business_id as "businessId", ${b.businessName} as "businessName",
           j.title, j.description, j.employment_type as "employmentType",
           j.pay_min as "payMin", j.pay_max as "payMax", j.pay_period as "payPeriod",
           j.required_modalities as "requiredModalities",
           j.min_years_experience as "minYearsExperience",
           j.city, j.state, j.status,
           ST_X(j.location::geometry) as lng, ST_Y(j.location::geometry) as lat,
           NULL::float as "distanceMeters",
           j.created_at as "createdAt"
    from ${jobs} j
    where j.business_id = ${id} and j.status = 'open'
    order by j.created_at desc
  `);
  const openJobs = openJobsRows as unknown as JobResult[];

  const reviewRows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      verifiedEngagement: reviews.verifiedEngagement,
      createdAt: reviews.createdAt,
      authorName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(and(eq(reviews.subjectType, "business"), eq(reviews.subjectId, id)))
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  const isOwn = session?.user?.id === b.userId;
  const canContact = session?.user && !isOwn && session.user.role === "therapist";
  const canReview = session?.user && !isOwn;

  return (
    <div className="container py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{b.businessName}</CardTitle>
                <p className="text-muted-foreground mt-1">{b.type ?? "Business"}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {b.city}, {b.state}
                </div>
              </div>
              <Stars rating={b.ratingAvg} count={b.ratingCount} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {b.description && <p className="whitespace-pre-wrap">{b.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm">
              {b.website && (
                <a
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                  href={b.website}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
              {b.phone && (
                <a className="inline-flex items-center gap-1" href={`tel:${b.phone}`}>
                  <Phone className="h-4 w-4" /> {b.phone}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-xl font-semibold mb-3">Open jobs ({openJobs.length})</h2>
          {openJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open jobs at this time.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {openJobs.map((j) => (
                <JobCard key={j.id} j={j} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Reviews ({b.ratingCount})</h2>
          {reviewRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviewRows.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <Stars rating={r.rating} showCount={false} />
                    {r.title && <p className="font-semibold mt-1">{r.title}</p>}
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{r.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      — {r.authorName ?? "Anonymous"} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {canReview && <ReviewForm subjectType="business" subjectId={b.id} />}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            {canContact ? (
              <form action={startConversationAction}>
                <input type="hidden" name="targetType" value="business" />
                <input type="hidden" name="targetProfileId" value={b.id} />
                <Button type="submit" className="w-full">
                  <MessageCircle /> Contact
                </Button>
              </form>
            ) : !session?.user ? (
              <Button asChild className="w-full">
                <Link href={`/signin?callbackUrl=/businesses/${b.id}`}>Sign in to contact</Link>
              </Button>
            ) : isOwn ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/edit">Edit my business</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
