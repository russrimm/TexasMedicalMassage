import dns from "node:dns";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Force IPv4 DNS resolution: Supabase advertises IPv6 addresses that aren't
// routable from many home networks, causing ENETUNREACH.
dns.setDefaultResultOrder("ipv4first");

async function main() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL (or DIRECT_URL) is required");

  const client = postgres(url, {
    max: 1,
    connection: {
      // Resolve PostGIS functions installed in Supabase's `extensions` schema.
      search_path: "public, extensions",
    },
  });
  const db = drizzle(client);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
