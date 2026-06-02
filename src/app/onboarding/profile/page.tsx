import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { therapistProfiles, businessProfiles } from "@/server/db/schema";
import { TherapistProfileForm } from "@/components/forms/therapist-profile-form";
import { BusinessProfileForm } from "@/components/forms/business-profile-form";

export const metadata = { title: "Complete your profile" };

export default async function OnboardingProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (!session.user.role) redirect("/onboarding/role");

  if (session.user.role === "therapist") {
    const [row] = await db
      .select({
        displayName: therapistProfiles.displayName,
        headline: therapistProfiles.headline,
        bio: therapistProfiles.bio,
        yearsExperience: therapistProfiles.yearsExperience,
        licenseNumber: therapistProfiles.licenseNumber,
        hourlyRateMin: therapistProfiles.hourlyRateMin,
        hourlyRateMax: therapistProfiles.hourlyRateMax,
        availability: therapistProfiles.availability,
        modalities: therapistProfiles.modalities,
        addressLine1: therapistProfiles.addressLine1,
        city: therapistProfiles.city,
        state: therapistProfiles.state,
        postalCode: therapistProfiles.postalCode,
        serviceRadiusMiles: therapistProfiles.serviceRadiusMiles,
        lng: sql<number>`ST_X(${therapistProfiles.location}::geometry)`,
        lat: sql<number>`ST_Y(${therapistProfiles.location}::geometry)`,
      })
      .from(therapistProfiles)
      .where(eq(therapistProfiles.userId, session.user.id))
      .limit(1);

    return (
      <div className="container py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Your therapist profile</h1>
        <p className="text-muted-foreground mb-8">
          Help businesses find you. You can update this anytime.
        </p>
        <TherapistProfileForm
          defaults={
            row
              ? {
                  displayName: row.displayName,
                  headline: row.headline ?? "",
                  bio: row.bio ?? "",
                  yearsExperience: row.yearsExperience,
                  licenseNumber: row.licenseNumber ?? "",
                  hourlyRateMin: row.hourlyRateMin ?? undefined,
                  hourlyRateMax: row.hourlyRateMax ?? undefined,
                  availability: row.availability ?? [],
                  modalities: row.modalities ?? [],
                  addressLine1: row.addressLine1 ?? "",
                  city: row.city ?? "",
                  state: row.state ?? "TX",
                  postalCode: row.postalCode ?? "",
                  longitude: row.lng ?? undefined,
                  latitude: row.lat ?? undefined,
                  serviceRadiusMiles: row.serviceRadiusMiles,
                }
              : { displayName: session.user.name ?? "" }
          }
        />
      </div>
    );
  }

  // Business
  const [row] = await db
    .select({
      businessName: businessProfiles.businessName,
      type: businessProfiles.type,
      description: businessProfiles.description,
      website: businessProfiles.website,
      phone: businessProfiles.phone,
      addressLine1: businessProfiles.addressLine1,
      city: businessProfiles.city,
      state: businessProfiles.state,
      postalCode: businessProfiles.postalCode,
      lng: sql<number>`ST_X(${businessProfiles.location}::geometry)`,
      lat: sql<number>`ST_Y(${businessProfiles.location}::geometry)`,
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, session.user.id))
    .limit(1);

  return (
    <div className="container py-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Your business profile</h1>
      <p className="text-muted-foreground mb-8">
        Tell therapists about your business. You can update this anytime.
      </p>
      <BusinessProfileForm
        defaults={
          row
            ? {
                businessName: row.businessName,
                type: row.type ?? "",
                description: row.description ?? "",
                website: row.website ?? "",
                phone: row.phone ?? "",
                addressLine1: row.addressLine1 ?? "",
                city: row.city ?? "",
                state: row.state ?? "TX",
                postalCode: row.postalCode ?? "",
                longitude: row.lng ?? undefined,
                latitude: row.lat ?? undefined,
              }
            : { businessName: session.user.name ?? "" }
        }
      />
    </div>
  );
}
