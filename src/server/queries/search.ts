import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { pgTextArray } from "@/server/db/sql-helpers";

export type SearchParams = {
  lng?: number;
  lat?: number;
  radiusMi?: number;
  modalities?: string[];
  minRating?: number;
  q?: string;
  limit?: number;
};

const milesToMeters = (mi: number) => mi * 1609.344;

export type TherapistResult = {
  id: string;
  userId: string;
  displayName: string;
  headline: string | null;
  city: string | null;
  state: string | null;
  modalities: string[];
  ratingAvg: number;
  ratingCount: number;
  avatarUrl: string | null;
  yearsExperience: number;
  lng: number | null;
  lat: number | null;
  distanceMeters: number | null;
};

export async function searchTherapists(params: SearchParams = {}): Promise<TherapistResult[]> {
  const { lng, lat, radiusMi, modalities, minRating, q, limit = 60 } = params;
  const hasGeo = lng != null && lat != null && radiusMi != null;

  const rows = await db.execute<TherapistResult>(sql`
    select
      tp.id,
      tp.user_id as "userId",
      tp.display_name as "displayName",
      tp.headline,
      tp.city,
      tp.state,
      tp.modalities,
      tp.rating_avg as "ratingAvg",
      tp.rating_count as "ratingCount",
      tp.avatar_url as "avatarUrl",
      tp.years_experience as "yearsExperience",
      ST_X(tp.location::geometry) as lng,
      ST_Y(tp.location::geometry) as lat,
      ${
        hasGeo
          ? sql`ST_Distance(tp.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
          : sql`NULL::float`
      } as "distanceMeters"
    from therapist_profiles tp
    where tp.is_public = true
    ${hasGeo ? sql`and ST_DWithin(tp.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${milesToMeters(radiusMi)})` : sql``}
    ${modalities && modalities.length > 0 ? sql`and tp.modalities && ${pgTextArray(modalities)}::text[]` : sql``}
    ${minRating != null ? sql`and tp.rating_avg >= ${minRating}` : sql``}
    ${q ? sql`and (tp.display_name ilike ${"%" + q + "%"} or tp.headline ilike ${"%" + q + "%"} or tp.city ilike ${"%" + q + "%"})` : sql``}
    order by
      ${hasGeo ? sql`"distanceMeters" asc nulls last,` : sql``}
      tp.rating_avg desc,
      tp.created_at desc
    limit ${limit}
  `);
  return rows as unknown as TherapistResult[];
}

export type BusinessResult = {
  id: string;
  userId: string;
  businessName: string;
  type: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  ratingAvg: number;
  ratingCount: number;
  logoUrl: string | null;
  lng: number | null;
  lat: number | null;
  distanceMeters: number | null;
};

export async function searchBusinesses(params: SearchParams = {}): Promise<BusinessResult[]> {
  const { lng, lat, radiusMi, minRating, q, limit = 60 } = params;
  const hasGeo = lng != null && lat != null && radiusMi != null;

  const rows = await db.execute<BusinessResult>(sql`
    select
      bp.id,
      bp.user_id as "userId",
      bp.business_name as "businessName",
      bp.type,
      bp.description,
      bp.city,
      bp.state,
      bp.rating_avg as "ratingAvg",
      bp.rating_count as "ratingCount",
      bp.logo_url as "logoUrl",
      ST_X(bp.location::geometry) as lng,
      ST_Y(bp.location::geometry) as lat,
      ${
        hasGeo
          ? sql`ST_Distance(bp.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
          : sql`NULL::float`
      } as "distanceMeters"
    from business_profiles bp
    where 1=1
    ${hasGeo ? sql`and ST_DWithin(bp.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${milesToMeters(radiusMi)})` : sql``}
    ${minRating != null ? sql`and bp.rating_avg >= ${minRating}` : sql``}
    ${q ? sql`and (bp.business_name ilike ${"%" + q + "%"} or bp.city ilike ${"%" + q + "%"})` : sql``}
    order by
      ${hasGeo ? sql`"distanceMeters" asc nulls last,` : sql``}
      bp.rating_avg desc,
      bp.created_at desc
    limit ${limit}
  `);
  return rows as unknown as BusinessResult[];
}

export type JobResult = {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  employmentType: string;
  payMin: number | null;
  payMax: number | null;
  payPeriod: string | null;
  requiredModalities: string[];
  minYearsExperience: number;
  city: string | null;
  state: string | null;
  status: string;
  lng: number | null;
  lat: number | null;
  distanceMeters: number | null;
  createdAt: string;
};

export async function searchJobs(params: SearchParams = {}): Promise<JobResult[]> {
  const { lng, lat, radiusMi, modalities, q, limit = 60 } = params;
  const hasGeo = lng != null && lat != null && radiusMi != null;

  const rows = await db.execute<JobResult>(sql`
    select
      j.id,
      j.business_id as "businessId",
      bp.business_name as "businessName",
      j.title,
      j.description,
      j.employment_type as "employmentType",
      j.pay_min as "payMin",
      j.pay_max as "payMax",
      j.pay_period as "payPeriod",
      j.required_modalities as "requiredModalities",
      j.min_years_experience as "minYearsExperience",
      j.city,
      j.state,
      j.status,
      ST_X(j.location::geometry) as lng,
      ST_Y(j.location::geometry) as lat,
      ${
        hasGeo
          ? sql`ST_Distance(j.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)`
          : sql`NULL::float`
      } as "distanceMeters",
      j.created_at as "createdAt"
    from jobs j
    join business_profiles bp on bp.id = j.business_id
    where j.status = 'open'
    ${hasGeo ? sql`and ST_DWithin(j.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${milesToMeters(radiusMi)})` : sql``}
    ${modalities && modalities.length > 0 ? sql`and j.required_modalities && ${pgTextArray(modalities)}::text[]` : sql``}
    ${q ? sql`and (j.title ilike ${"%" + q + "%"} or j.description ilike ${"%" + q + "%"} or j.city ilike ${"%" + q + "%"})` : sql``}
    order by
      ${hasGeo ? sql`"distanceMeters" asc nulls last,` : sql``}
      j.created_at desc
    limit ${limit}
  `);
  return rows as unknown as JobResult[];
}
