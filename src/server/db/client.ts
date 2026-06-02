import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false, // required for Supabase transaction pooler (port 6543)
    max: 10,
    connection: { application_name: "texas-medical-massage" },
    // Force IPv4: some networks (and Supabase poolers) advertise IPv6
    // addresses that aren't routable, causing ENETUNREACH.
    fetch_types: false,
    // @ts-expect-error postgres-js forwards this to net.connect
    family: 4,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
