import Link from "next/link";
import { redirect } from "next/navigation";
import { aliasedTable, desc, eq, or, sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { conversations, users, messages } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesIndex() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const me = session.user.id;

  const therapistUser = aliasedTable(users, "tu");
  const businessUser = aliasedTable(users, "bu");

  const rows = await db
    .select({
      id: conversations.id,
      lastMessageAt: conversations.lastMessageAt,
      therapistUserId: conversations.therapistUserId,
      businessUserId: conversations.businessUserId,
      therapistName: therapistUser.name,
      businessName: businessUser.name,
      lastBody: sql<string | null>`
        (select body from ${messages} m where m.conversation_id = ${conversations.id}
         order by m.created_at desc limit 1)
      `,
    })
    .from(conversations)
    .innerJoin(therapistUser, eq(conversations.therapistUserId, therapistUser.id))
    .innerJoin(businessUser, eq(conversations.businessUserId, businessUser.id))
    .where(or(eq(conversations.therapistUserId, me), eq(conversations.businessUserId, me)))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(100);

  return (
    <div className="container py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No conversations yet. Start one from a therapist or business profile.
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y border rounded-lg">
          {rows.map((c) => {
            const otherName = c.therapistUserId === me ? c.businessName : c.therapistName;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="font-medium">{otherName ?? "Unknown"}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {c.lastBody ?? "(no messages yet)"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelative(c.lastMessageAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
