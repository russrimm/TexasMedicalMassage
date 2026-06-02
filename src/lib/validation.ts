import { z } from "zod";
import { MODALITIES, AVAILABILITY, BUSINESS_TYPES } from "@/lib/utils";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(80),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["therapist", "business"]),
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SigninInput = z.infer<typeof signinSchema>;

export const therapistProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  headline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(60).default(0),
  licenseNumber: z.string().max(40).optional().or(z.literal("")),
  hourlyRateMin: z.coerce.number().int().min(0).max(1000).optional(),
  hourlyRateMax: z.coerce.number().int().min(0).max(1000).optional(),
  availability: z.array(z.enum(AVAILABILITY)).default([]),
  modalities: z.array(z.enum(MODALITIES)).default([]),
  addressLine1: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().length(2).default("TX"),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  serviceRadiusMiles: z.coerce.number().int().min(1).max(200).default(25),
});
export type TherapistProfileInput = z.infer<typeof therapistProfileSchema>;

export const businessProfileSchema = z.object({
  businessName: z.string().min(2).max(120),
  type: z.enum(BUSINESS_TYPES).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  addressLine1: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().length(2).default("TX"),
  postalCode: z.string().max(10).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;

export const jobSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20).max(5000),
  employmentType: z.enum(["full_time", "part_time", "contract", "per_diem"]),
  payMin: z.coerce.number().int().min(0).max(1000).optional(),
  payMax: z.coerce.number().int().min(0).max(1000).optional(),
  payPeriod: z.enum(["hour", "year"]).default("hour"),
  requiredModalities: z.array(z.enum(MODALITIES)).default([]),
  minYearsExperience: z.coerce.number().int().min(0).max(50).default(0),
  city: z.string().min(2).max(80),
  state: z.string().length(2).default("TX"),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  isMobile: z.coerce.boolean().default(false),
});
export type JobInput = z.infer<typeof jobSchema>;

export const reviewSchema = z.object({
  subjectType: z.enum(["therapist", "business"]),
  subjectId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal("")),
  body: z.string().min(10).max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const messageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  recipientUserId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  body: z.string().min(1).max(4000),
});
