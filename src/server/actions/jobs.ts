"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { jobs, businessProfiles } from "@/server/db/schema";
import { pgTextArray } from "@/server/db/sql-helpers";
import { auth } from "@/server/auth";
import { jobSchema } from "@/lib/validation";

async function requireBusiness() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "business") throw new Error("Only businesses can manage jobs.");
  const [bp] = await db
    .select({ id: businessProfiles.id })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, session.user.id))
    .limit(1);
  if (!bp) {
    redirect("/onboarding/profile");
  }
  return { user: session.user, business: bp };
}

export async function createJobAction(formData: FormData) {
  const { business } = await requireBusiness();
  const parsed = jobSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    employmentType: formData.get("employmentType"),
    payMin: formData.get("payMin") || undefined,
    payMax: formData.get("payMax") || undefined,
    payPeriod: formData.get("payPeriod") || "hour",
    requiredModalities: formData.getAll("requiredModalities"),
    minYearsExperience: formData.get("minYearsExperience") ?? 0,
    city: formData.get("city"),
    state: formData.get("state") ?? "TX",
    longitude: Number(formData.get("longitude")),
    latitude: Number(formData.get("latitude")),
    isMobile: formData.get("isMobile") === "on",
  });

  const result = await db.execute<{ id: string }>(sql`
    insert into ${jobs}
      (business_id, title, description, employment_type, pay_min, pay_max, pay_period,
       required_modalities, min_years_experience, city, state, location, is_mobile, status)
    values (
      ${business.id},
      ${parsed.title},
      ${parsed.description},
      ${parsed.employmentType}::employment_type,
      ${parsed.payMin ?? null}, ${parsed.payMax ?? null}, ${parsed.payPeriod},
      ${pgTextArray(parsed.requiredModalities)}::text[],
      ${parsed.minYearsExperience},
      ${parsed.city}, ${parsed.state},
      ST_SetSRID(ST_MakePoint(${parsed.longitude}, ${parsed.latitude}), 4326)::geography,
      ${parsed.isMobile},
      'open'::job_status
    )
    returning id
  `);
  const newId = (result as unknown as { id: string }[])[0]?.id;
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  if (newId) redirect(`/jobs/${newId}`);
}

export async function closeJobAction(formData: FormData) {
  const { business } = await requireBusiness();
  const id = String(formData.get("jobId"));
  await db
    .update(jobs)
    .set({ status: "closed" })
    .where(and(eq(jobs.id, id), eq(jobs.businessId, business.id)));
  revalidatePath(`/jobs/${id}`);
  revalidatePath("/dashboard");
}
