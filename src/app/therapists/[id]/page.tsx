import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, BadgeCheck, MessageCircle } from "lucide-react";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { therapistProfiles, reviews, users } from "@/server/db/schema";
import { auth } from "@/server/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stars } from "@/components/ui/stars";
import { startConversationAction } from "@/server/actions/messages";
import { ReviewForm } from "@/components/reviews/review-form";

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [t] = await db
    .select({
      id: therapistProfiles.id,
      userId: therapistProfiles.userId,
      displayName: therapistProfiles.displayName,
      headline: therapistProfiles.headline,
      bio: therapistProfiles.bio,
      yearsExperience: therapistProfiles.yearsExperience,
      licenseNumber: therapistProfiles.licenseNumber,
      licenseVerified: therapistProfiles.licenseVerified,
      hourlyRateMin: therapistProfiles.hourlyRateMin,
      hourlyRateMax: therapistProfiles.hourlyRateMax,
      availability: therapistProfiles.availability,
      modalities: therapistProfiles.modalities,
      city: therapistProfiles.city,
      state: therapistProfiles.state,
      ratingAvg: therapistProfiles.ratingAvg,
      ratingCount: therapistProfiles.ratingCount,
      isPublic: therapistProfiles.isPublic,
    })
    .from(therapistProfiles)
    .where(eq(therapistProfiles.id, id))
    .limit(1);

  if (!t || !t.isPublic) notFound();

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
    .where(sql`${reviews.subjectType} = 'therapist' and ${reviews.subjectId} = ${id}`)
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  const isOwn = session?.user?.id === t.userId;
  const canContact = session?.user && !isOwn && session.user.role === "business";
  const canReview = session?.user && !isOwn;

  return (
    <div className="container py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{t.displayName}</CardTitle>
                <p className="text-muted-foreground mt-1">{t.headline ?? "Licensed Massage Therapist"}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  {t.city}, {t.state}
                </div>
              </div>
              <div className="text-right">
                <Stars rating={t.ratingAvg} count={t.ratingCount} />
                <p className="text-xs text-muted-foreground mt-1">{t.yearsExperience}+ years</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {t.bio && <p className="whitespace-pre-wrap">{t.bio}</p>}
            <div>
              <h3 className="text-sm font-semibold mb-2">Modalities</h3>
              <div className="flex flex-wrap gap-1">
                {t.modalities.map((m) => (
                  <Badge key={m} variant="secondary">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Availability</h3>
              <div className="flex flex-wrap gap-1">
                {t.availability.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            {t.licenseNumber && (
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck
                  className={t.licenseVerified ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"}
                />
                <span>
                  TX License #{t.licenseNumber}
                  {t.licenseVerified ? " · Verified" : " · Self-reported"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <section>
          <h2 className="text-xl font-semibold mb-3">Reviews ({t.ratingCount})</h2>
          {reviewRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviewRows.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Stars rating={r.rating} showCount={false} />
                        {r.title && <p className="font-semibold mt-1">{r.title}</p>}
                      </div>
                      {r.verifiedEngagement && (
                        <Badge variant="secondary">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
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

        {canReview && (
          <ReviewForm subjectType="therapist" subjectId={t.id} />
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t.hourlyRateMin && t.hourlyRateMax
                ? `$${t.hourlyRateMin}–${t.hourlyRateMax}/hr`
                : "Rates on request"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {canContact ? (
              <form action={startConversationAction}>
                <input type="hidden" name="targetType" value="therapist" />
                <input type="hidden" name="targetProfileId" value={t.id} />
                <Button type="submit" className="w-full">
                  <MessageCircle /> Contact
                </Button>
              </form>
            ) : !session?.user ? (
              <Button asChild className="w-full">
                <Link href={`/signin?callbackUrl=/therapists/${t.id}`}>Sign in to contact</Link>
              </Button>
            ) : isOwn ? (
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/edit">Edit my profile</Link>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Only businesses can message therapists.
              </p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
