import dns from "node:dns";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

// Force IPv4 DNS resolution: Supabase poolers often advertise IPv6 addresses
// that aren't routable from many networks, causing ENETUNREACH.
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false, // required for Supabase transaction pooler (port 6543)
    max: 10,
    connection: {
      application_name: "texas-medical-massage",
      // Supabase installs PostGIS in the `extensions` schema; ensure functions
      // like ST_MakePoint, ST_DWithin etc. resolve without qualification.
      search_path: "public, extensions",
    },
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
