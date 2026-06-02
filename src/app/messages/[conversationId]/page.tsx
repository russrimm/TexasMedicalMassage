import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { and, asc, eq, or } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { conversations, messages, users } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { sendMessageAction } from "@/server/actions/messages";
import { cn, formatRelative } from "@/lib/utils";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const me = session.user.id;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.therapistUserId, me), eq(conversations.businessUserId, me)),
      ),
    )
    .limit(1);
  if (!conv) notFound();

  const otherId = conv.therapistUserId === me ? conv.businessUserId : conv.therapistUserId;
  const [other] = await db
    .select({ name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, otherId))
    .limit(1);

  const thread = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(asc(messages.createdAt));

  return (
    <div className="container py-8 max-w-2xl mx-auto w-full flex flex-col">
      <div className="mb-4">
        <Link href="/messages" className="text-sm text-muted-foreground hover:text-primary">
          ← All messages
        </Link>
        <h1 className="text-2xl font-bold mt-2">{other?.name ?? "Conversation"}</h1>
        <p className="text-xs text-muted-foreground capitalize">{other?.role}</p>
      </div>

      <Card className="bg-muted/30 mb-4">
        <CardContent className="py-3 text-xs text-center text-muted-foreground">
          Keep your conversations professional. Do not share protected health information.
        </CardContent>
      </Card>

      <div className="flex-1 space-y-2 mb-4 min-h-[40vh]">
        {thread.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet — say hi.</p>
        ) : (
          thread.map((m) => {
            const mine = m.senderId === me;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      mine ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {formatRelative(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={sendMessageAction} className="flex gap-2 items-end sticky bottom-4">
        <input type="hidden" name="conversationId" value={conv.id} />
        <Textarea
          name="body"
          required
          maxLength={4000}
          rows={2}
          placeholder="Write a message..."
          className="flex-1 bg-background"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
