"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users, therapistProfiles, businessProfiles } from "@/server/db/schema";
import { auth } from "@/server/auth";
import {
  therapistProfileSchema,
  businessProfileSchema,
  type TherapistProfileInput,
  type BusinessProfileInput,
} from "@/lib/validation";

async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session.user;
}

export async function setRoleAction(formData: FormData) {
  const role = formData.get("role");
  if (role !== "therapist" && role !== "business") return;
  const user = await requireUser();
  await db.update(users).set({ role }).where(eq(users.id, user.id));
  redirect("/onboarding/profile");
}

function parseFormSet<T extends string>(formData: FormData, name: string): T[] {
  return formData.getAll(name).filter((v): v is string => typeof v === "string") as T[];
}

export async function saveTherapistProfileAction(formData: FormData) {
  const user = await requireUser();
  const raw: TherapistProfileInput = {
    displayName: String(formData.get("displayName") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    yearsExperience: Number(formData.get("yearsExperience") ?? 0),
    licenseNumber: String(formData.get("licenseNumber") ?? ""),
    hourlyRateMin: Number(formData.get("hourlyRateMin") ?? 0) || undefined,
    hourlyRateMax: Number(formData.get("hourlyRateMax") ?? 0) || undefined,
    availability: parseFormSet(formData, "availability") as TherapistProfileInput["availability"],
    modalities: parseFormSet(formData, "modalities") as TherapistProfileInput["modalities"],
    addressLine1: String(formData.get("addressLine1") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? "TX"),
    postalCode: String(formData.get("postalCode") ?? ""),
    longitude: Number(formData.get("longitude") ?? 0),
    latitude: Number(formData.get("latitude") ?? 0),
    serviceRadiusMiles: Number(formData.get("serviceRadiusMiles") ?? 25),
  };
  const parsed = therapistProfileSchema.parse(raw);

  // Upsert
  const [existing] = await db
    .select({ id: therapistProfiles.id })
    .from(therapistProfiles)
    .where(eq(therapistProfiles.userId, user.id))
    .limit(1);

  if (existing) {
    await db.execute(sql`
      update ${therapistProfiles} set
        display_name=${parsed.displayName},
        headline=${parsed.headline || null},
        bio=${parsed.bio || null},
        years_experience=${parsed.yearsExperience},
        license_number=${parsed.licenseNumber || null},
        hourly_rate_min=${parsed.hourlyRateMin ?? null},
        hourly_rate_max=${parsed.hourlyRateMax ?? null},
        availability=${parsed.availability}::text[],
        modalities=${parsed.modalities}::text[],
        address_line1=${parsed.addressLine1 || null},
        city=${parsed.city},
        state=${parsed.state},
        postal_code=${parsed.postalCode || null},
        location=ST_SetSRID(ST_MakePoint(${parsed.longitude}, ${parsed.latitude}), 4326)::geography,
        service_radius_miles=${parsed.serviceRadiusMiles},
        updated_at=now()
      where user_id=${user.id}
    `);
  } else {
    await db.execute(sql`
      insert into ${therapistProfiles}
        (user_id, display_name, headline, bio, years_experience, license_number,
         hourly_rate_min, hourly_rate_max, availability, modalities,
         address_line1, city, state, postal_code, location, service_radius_miles)
      values (
        ${user.id}, ${parsed.displayName}, ${parsed.headline || null}, ${parsed.bio || null},
        ${parsed.yearsExperience}, ${parsed.licenseNumber || null},
        ${parsed.hourlyRateMin ?? null}, ${parsed.hourlyRateMax ?? null},
        ${parsed.availability}::text[], ${parsed.modalities}::text[],
        ${parsed.addressLine1 || null}, ${parsed.city}, ${parsed.state},
        ${parsed.postalCode || null},
        ST_SetSRID(ST_MakePoint(${parsed.longitude}, ${parsed.latitude}), 4326)::geography,
        ${parsed.serviceRadiusMiles}
      )
    `);
  }

  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, user.id));
  revalidatePath("/therapists");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveBusinessProfileAction(formData: FormData) {
  const user = await requireUser();
  const raw: BusinessProfileInput = {
    businessName: String(formData.get("businessName") ?? ""),
    type: ((formData.get("type") as string) || undefined) as BusinessProfileInput["type"],
    description: String(formData.get("description") ?? ""),
    website: String(formData.get("website") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? "TX"),
    postalCode: String(formData.get("postalCode") ?? ""),
    longitude: Number(formData.get("longitude") ?? 0),
    latitude: Number(formData.get("latitude") ?? 0),
  };
  const parsed = businessProfileSchema.parse(raw);

  const [existing] = await db
    .select({ id: businessProfiles.id })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, user.id))
    .limit(1);

  if (existing) {
    await db.execute(sql`
      update ${businessProfiles} set
        business_name=${parsed.businessName},
        type=${parsed.type ?? null},
        description=${parsed.description || null},
        website=${parsed.website || null},
        phone=${parsed.phone || null},
        address_line1=${parsed.addressLine1 || null},
        city=${parsed.city},
        state=${parsed.state},
        postal_code=${parsed.postalCode || null},
        location=ST_SetSRID(ST_MakePoint(${parsed.longitude}, ${parsed.latitude}), 4326)::geography,
        updated_at=now()
      where user_id=${user.id}
    `);
  } else {
    await db.execute(sql`
      insert into ${businessProfiles}
        (user_id, business_name, type, description, website, phone,
         address_line1, city, state, postal_code, location)
      values (
        ${user.id}, ${parsed.businessName}, ${parsed.type ?? null}, ${parsed.description || null},
        ${parsed.website || null}, ${parsed.phone || null},
        ${parsed.addressLine1 || null}, ${parsed.city}, ${parsed.state}, ${parsed.postalCode || null},
        ST_SetSRID(ST_MakePoint(${parsed.longitude}, ${parsed.latitude}), 4326)::geography
      )
    `);
  }

  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, user.id));
  revalidatePath("/businesses");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
