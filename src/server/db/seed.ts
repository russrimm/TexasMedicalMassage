import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db, schema } from "./client";

const TX_CITIES = [
  { city: "Austin", state: "TX", lng: -97.7431, lat: 30.2672 },
  { city: "Houston", state: "TX", lng: -95.3698, lat: 29.7604 },
  { city: "Dallas", state: "TX", lng: -96.797, lat: 32.7767 },
  { city: "San Antonio", state: "TX", lng: -98.4936, lat: 29.4241 },
  { city: "Fort Worth", state: "TX", lng: -97.3308, lat: 32.7555 },
  { city: "El Paso", state: "TX", lng: -106.4424, lat: 31.7619 },
];

async function main() {
  console.log("Seeding...");

  const hashed = await bcrypt.hash("password123", 10);

  // Wipe in dependency order (dev only).
  await db.execute(sql`truncate table
    ${schema.messages}, ${schema.conversations}, ${schema.reviews},
    ${schema.jobApplications}, ${schema.jobs},
    ${schema.therapistProfiles}, ${schema.businessProfiles},
    ${schema.accounts}, ${schema.sessions}, ${schema.users}
    restart identity cascade`);

  for (let i = 0; i < TX_CITIES.length; i++) {
    const c = TX_CITIES[i];

    // Therapist
    const [tUser] = await db
      .insert(schema.users)
      .values({
        email: `therapist${i + 1}@example.com`,
        name: `Therapist ${i + 1}`,
        passwordHash: hashed,
        role: "therapist",
        onboardedAt: new Date(),
      })
      .returning();

    await db.execute(sql`
      insert into ${schema.therapistProfiles}
        (user_id, display_name, headline, bio, years_experience,
         license_number, license_state, hourly_rate_min, hourly_rate_max,
         availability, modalities, city, state, location, service_radius_miles)
      values (
        ${tUser.id},
        ${`Therapist ${i + 1}`},
        ${"Licensed Massage Therapist (LMT)"},
        ${`Experienced LMT serving the ${c.city} area.`},
        ${3 + i},
        ${`MT${100000 + i}`},
        ${"TX"},
        ${70}, ${110},
        ${sql`array['Full-time','Part-time']::text[]`},
        ${sql`array['Swedish','Deep Tissue','Sports','Medical']::text[]`},
        ${c.city}, ${c.state},
        ST_SetSRID(ST_MakePoint(${c.lng}, ${c.lat}), 4326)::geography,
        ${25}
      )
    `);

    // Business
    const [bUser] = await db
      .insert(schema.users)
      .values({
        email: `business${i + 1}@example.com`,
        name: `${c.city} Wellness`,
        passwordHash: hashed,
        role: "business",
        onboardedAt: new Date(),
      })
      .returning();

    const [bProfile] = await db.execute<{ id: string }>(sql`
      insert into ${schema.businessProfiles}
        (user_id, business_name, type, description, phone, city, state, location)
      values (
        ${bUser.id},
        ${`${c.city} Wellness`},
        ${"Day Spa"},
        ${`A premier spa in ${c.city} hiring experienced therapists.`},
        ${"555-555-0100"},
        ${c.city}, ${c.state},
        ST_SetSRID(ST_MakePoint(${c.lng}, ${c.lat}), 4326)::geography
      )
      returning id
    `);

    // Job at that business
    await db.execute(sql`
      insert into ${schema.jobs}
        (business_id, title, description, employment_type,
         pay_min, pay_max, pay_period, required_modalities,
         min_years_experience, city, state, location, status)
      values (
        ${bProfile.id},
        ${`Massage Therapist needed in ${c.city}`},
        ${`Join our team at ${c.city} Wellness. Flexible schedule, great clients, and a supportive environment.`},
        ${"full_time"},
        ${60}, ${90}, ${"hour"},
        ${sql`array['Swedish','Deep Tissue']::text[]`},
        ${2},
        ${c.city}, ${c.state},
        ST_SetSRID(ST_MakePoint(${c.lng}, ${c.lat}), 4326)::geography,
        ${"open"}
      )
    `);
  }

  console.log("Seed complete. Login with any seeded email (e.g. therapist1@example.com) / password123");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
