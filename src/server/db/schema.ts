import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  pgEnum,
  uuid,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  customType,
  serial,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * PostGIS geography(Point, 4326) — stored as WKB hex by postgres-js.
 * We treat it as opaque text in the ORM and round-trip via raw SQL
 * (ST_MakePoint, ST_AsGeoJSON) in queries.
 */
const geography = customType<{ data: string; driverData: string }>({
  dataType() {
    return "geography(Point, 4326)";
  },
});

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
});

export const roleEnum = pgEnum("role", ["therapist", "business", "admin"]);
export const employmentEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "per_diem",
]);
export const jobStatusEnum = pgEnum("job_status", ["open", "closed", "filled"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "viewed",
  "contacted",
  "rejected",
  "hired",
]);
export const subjectTypeEnum = pgEnum("subject_type", ["therapist", "business"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "reviewed", "dismissed"]);

// --- Auth.js core tables ---------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: roleEnum("role"),
  onboardedAt: timestamp("onboarded_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
);

// --- Profiles --------------------------------------------------------------

export const therapistProfiles = pgTable(
  "therapist_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    headline: text("headline"),
    bio: text("bio"),
    yearsExperience: integer("years_experience").default(0).notNull(),
    licenseNumber: text("license_number"),
    licenseState: text("license_state").default("TX"),
    licenseVerified: boolean("license_verified").default(false).notNull(),
    hourlyRateMin: integer("hourly_rate_min"),
    hourlyRateMax: integer("hourly_rate_max"),
    availability: text("availability").array().notNull().default(sql`'{}'::text[]`),
    modalities: text("modalities").array().notNull().default(sql`'{}'::text[]`),
    certifications: jsonb("certifications").$type<string[]>().default([]),
    avatarUrl: text("avatar_url"),
    addressLine1: text("address_line1"),
    city: text("city"),
    state: text("state").default("TX"),
    postalCode: text("postal_code"),
    location: geography("location"),
    serviceRadiusMiles: integer("service_radius_miles").default(25).notNull(),
    isPublic: boolean("is_public").default(true).notNull(),
    ratingAvg: integer("rating_avg").default(0).notNull(),
    ratingCount: integer("rating_count").default(0).notNull(),
    searchTsv: tsvector("search_tsv"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    locationIdx: index("therapist_location_gix").using("gist", t.location),
    modalitiesIdx: index("therapist_modalities_gin").using("gin", t.modalities),
    tsvIdx: index("therapist_tsv_gin").using("gin", t.searchTsv),
  }),
);

export const businessProfiles = pgTable(
  "business_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    type: text("type"),
    description: text("description"),
    website: text("website"),
    phone: text("phone"),
    logoUrl: text("logo_url"),
    addressLine1: text("address_line1"),
    city: text("city"),
    state: text("state").default("TX"),
    postalCode: text("postal_code"),
    location: geography("location"),
    ratingAvg: integer("rating_avg").default(0).notNull(),
    ratingCount: integer("rating_count").default(0).notNull(),
    searchTsv: tsvector("search_tsv"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    locationIdx: index("business_location_gix").using("gist", t.location),
    tsvIdx: index("business_tsv_gin").using("gin", t.searchTsv),
  }),
);

// --- Jobs ------------------------------------------------------------------

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businessProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    employmentType: employmentEnum("employment_type").notNull(),
    payMin: integer("pay_min"),
    payMax: integer("pay_max"),
    payPeriod: text("pay_period").default("hour"),
    requiredModalities: text("required_modalities").array().notNull().default(sql`'{}'::text[]`),
    minYearsExperience: integer("min_years_experience").default(0).notNull(),
    addressLine1: text("address_line1"),
    city: text("city"),
    state: text("state").default("TX"),
    postalCode: text("postal_code"),
    location: geography("location"),
    isMobile: boolean("is_mobile").default(false).notNull(),
    status: jobStatusEnum("status").default("open").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    locationIdx: index("jobs_location_gix").using("gist", t.location),
    modalitiesIdx: index("jobs_modalities_gin").using("gin", t.requiredModalities),
    businessIdx: index("jobs_business_idx").on(t.businessId),
    statusIdx: index("jobs_status_idx").on(t.status),
  }),
);

export const jobApplications = pgTable(
  "job_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    therapistId: uuid("therapist_id")
      .notNull()
      .references(() => therapistProfiles.id, { onDelete: "cascade" }),
    coverNote: text("cover_note"),
    status: applicationStatusEnum("status").default("submitted").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("application_unique").on(t.jobId, t.therapistId),
    therapistIdx: index("application_therapist_idx").on(t.therapistId),
  }),
);

// --- Reviews ---------------------------------------------------------------

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectType: subjectTypeEnum("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    verifiedEngagement: boolean("verified_engagement").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("review_unique").on(t.authorId, t.subjectType, t.subjectId),
    subjectIdx: index("review_subject_idx").on(t.subjectType, t.subjectId),
  }),
);

// --- Messaging -------------------------------------------------------------

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    therapistUserId: uuid("therapist_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessUserId: uuid("business_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
    lastMessageAt: timestamp("last_message_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("conversation_unique").on(t.therapistUserId, t.businessUserId, t.jobId),
    therapistIdx: index("conversation_therapist_idx").on(t.therapistUserId),
    businessIdx: index("conversation_business_idx").on(t.businessUserId),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    conversationIdx: index("message_conversation_idx").on(t.conversationId, t.createdAt),
  }),
);

// --- Misc ------------------------------------------------------------------

export const savedItems = pgTable(
  "saved_items",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectType: text("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.subjectType, t.subjectId] }) }),
);

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

// --- Relations -------------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  therapistProfile: one(therapistProfiles, {
    fields: [users.id],
    references: [therapistProfiles.userId],
  }),
  businessProfile: one(businessProfiles, {
    fields: [users.id],
    references: [businessProfiles.userId],
  }),
  reviewsAuthored: many(reviews),
}));

export const therapistProfilesRelations = relations(therapistProfiles, ({ one, many }) => ({
  user: one(users, { fields: [therapistProfiles.userId], references: [users.id] }),
  applications: many(jobApplications),
}));

export const businessProfilesRelations = relations(businessProfiles, ({ one, many }) => ({
  user: one(users, { fields: [businessProfiles.userId], references: [users.id] }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  business: one(businessProfiles, {
    fields: [jobs.businessId],
    references: [businessProfiles.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobs, { fields: [jobApplications.jobId], references: [jobs.id] }),
  therapist: one(therapistProfiles, {
    fields: [jobApplications.therapistId],
    references: [therapistProfiles.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  therapistUser: one(users, {
    fields: [conversations.therapistUserId],
    references: [users.id],
    relationName: "therapistConversations",
  }),
  businessUser: one(users, {
    fields: [conversations.businessUserId],
    references: [users.id],
    relationName: "businessConversations",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));
