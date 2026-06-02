"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { conversations, messages, therapistProfiles, businessProfiles } from "@/server/db/schema";
import { auth } from "@/server/auth";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session.user;
}

/**
 * Open or create a conversation between the current user and the owner
 * of the target profile, then redirect to the thread.
 */
export async function startConversationAction(formData: FormData) {
  const user = await requireUser();
  const targetType = formData.get("targetType") as "therapist" | "business";
  const targetProfileId = String(formData.get("targetProfileId"));
  const jobId = (formData.get("jobId") as string) || null;

  let targetUserId: string | undefined;
  if (targetType === "therapist") {
    const [tp] = await db
      .select({ userId: therapistProfiles.userId })
      .from(therapistProfiles)
      .where(eq(therapistProfiles.id, targetProfileId))
      .limit(1);
    targetUserId = tp?.userId;
  } else {
    const [bp] = await db
      .select({ userId: businessProfiles.userId })
      .from(businessProfiles)
      .where(eq(businessProfiles.id, targetProfileId))
      .limit(1);
    targetUserId = bp?.userId;
  }
  if (!targetUserId) throw new Error("Target profile not found.");

  // Therapist user vs business user resolution:
  // We always store the therapist on therapistUserId and the business on businessUserId.
  const therapistUserId = user.role === "therapist" ? user.id : targetUserId;
  const businessUserId = user.role === "business" ? user.id : targetUserId;

  const [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.therapistUserId, therapistUserId),
        eq(conversations.businessUserId, businessUserId),
        jobId ? eq(conversations.jobId, jobId) : sql`${conversations.jobId} is null`,
      ),
    )
    .limit(1);

  let convId = existing?.id;
  if (!convId) {
    const [row] = await db
      .insert(conversations)
      .values({ therapistUserId, businessUserId, jobId })
      .returning({ id: conversations.id });
    convId = row.id;
  }
  redirect(`/messages/${convId}`);
}

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  // Authorize: caller must be a participant.
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.therapistUserId, user.id), eq(conversations.businessUserId, user.id)),
      ),
    )
    .limit(1);
  if (!conv) throw new Error("Conversation not found.");

  await db.insert(messages).values({ conversationId, senderId: user.id, body });
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
