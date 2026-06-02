"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  reviews,
  therapistProfiles,
  businessProfiles,
  jobApplications,
  conversations,
} from "@/server/db/schema";
import { auth } from "@/server/auth";
import { reviewSchema } from "@/lib/validation";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session.user;
}

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser();
  const parsed = reviewSchema.parse({
    subjectType: formData.get("subjectType"),
    subjectId: formData.get("subjectId"),
    rating: formData.get("rating"),
    title: formData.get("title") ?? "",
    body: formData.get("body"),
  });

  // Verified engagement = the author has either applied/exchanged messages with this subject
  let verified = false;
  if (parsed.subjectType === "therapist") {
    // Subject is a therapist profile. Author (business or therapist) is verified if there's a conversation
    // where the subject's user is the therapist and the author is the business.
    const [sub] = await db
      .select({ userId: therapistProfiles.userId })
      .from(therapistProfiles)
      .where(eq(therapistProfiles.id, parsed.subjectId))
      .limit(1);
    if (sub) {
      const [conv] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(eq(conversations.therapistUserId, sub.userId), eq(conversations.businessUserId, user.id)),
        )
        .limit(1);
      verified = !!conv;
    }
  } else {
    const [sub] = await db
      .select({ userId: businessProfiles.userId })
      .from(businessProfiles)
      .where(eq(businessProfiles.id, parsed.subjectId))
      .limit(1);
    if (sub) {
      const [conv] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(
          and(eq(conversations.businessUserId, sub.userId), eq(conversations.therapistUserId, user.id)),
        )
        .limit(1);
      verified = !!conv;
    }
  }

  await db
    .insert(reviews)
    .values({
      authorId: user.id,
      subjectType: parsed.subjectType,
      subjectId: parsed.subjectId,
      rating: parsed.rating,
      title: parsed.title || null,
      body: parsed.body,
      verifiedEngagement: verified,
    })
    .onConflictDoNothing();

  // Recompute aggregate
  const agg = await db.execute<{ avg: number; count: number }>(sql`
    select round(avg(rating))::int as avg, count(*)::int as count
    from ${reviews}
    where subject_type = ${parsed.subjectType} and subject_id = ${parsed.subjectId}
  `);
  const { avg, count } = (agg as unknown as { avg: number; count: number }[])[0] ?? { avg: 0, count: 0 };

  if (parsed.subjectType === "therapist") {
    await db
      .update(therapistProfiles)
      .set({ ratingAvg: avg ?? 0, ratingCount: count ?? 0 })
      .where(eq(therapistProfiles.id, parsed.subjectId));
    revalidatePath(`/therapists/${parsed.subjectId}`);
  } else {
    await db
      .update(businessProfiles)
      .set({ ratingAvg: avg ?? 0, ratingCount: count ?? 0 })
      .where(eq(businessProfiles.id, parsed.subjectId));
    revalidatePath(`/businesses/${parsed.subjectId}`);
  }
}

export async function applyToJobAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "therapist") throw new Error("Only therapists can apply.");
  const jobId = String(formData.get("jobId"));
  const coverNote = String(formData.get("coverNote") ?? "");

  const [tp] = await db
    .select({ id: therapistProfiles.id })
    .from(therapistProfiles)
    .where(eq(therapistProfiles.userId, user.id))
    .limit(1);
  if (!tp) throw new Error("Complete your profile before applying.");

  await db
    .insert(jobApplications)
    .values({ jobId, therapistId: tp.id, coverNote: coverNote || null })
    .onConflictDoNothing();

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
}
