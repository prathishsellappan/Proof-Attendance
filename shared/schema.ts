import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Organizers table
export const organizers = pgTable("organizers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hederaAccountId: text("hedera_account_id"),
});

export const insertOrganizerSchema = createInsertSchema(organizers).omit({ id: true });
export type InsertOrganizer = z.infer<typeof insertOrganizerSchema>;
export type Organizer = typeof organizers.$inferSelect;

// Students table
export const students = pgTable("students", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hederaAccountId: text("hedera_account_id"),
  profileCID: text("profile_cid"),
  name: text("name"),
  college: text("college"),
  department: text("department"),
  rollNo: text("roll_no"),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Student profile for IPFS storage
export const studentProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  college: z.string().min(1, "College is required"),
  department: z.string().min(1, "Department is required"),
  rollNo: z.string().min(1, "Roll number is required"),
});
export type StudentProfile = z.infer<typeof studentProfileSchema>;

// Events table
export const events = pgTable("events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  venueName: text("venue_name"),
  venueLat: real("venue_lat").notNull(),
  venueLong: real("venue_long").notNull(),
  radius: integer("radius").notNull().default(100),
  badgeImageCID: text("badge_image_cid"),
  attendanceStatus: text("attendance_status").notNull().default("CLOSED"),
  attendanceStartedAt: timestamp("attendance_started_at"),
  organizerId: varchar("organizer_id", { length: 36 }).notNull(),
  tokenId: text("token_id"),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, attendanceStartedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Registrations table
export const registrations = pgTable("registrations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  eventId: varchar("event_id", { length: 36 }).notNull(),
  studentId: varchar("student_id", { length: 36 }).notNull(),
  studentAccountId: text("student_account_id"),
  registeredAt: timestamp("registered_at").defaultNow(),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  nftSerial: text("nft_serial"),
  metadataCID: text("metadata_cid"),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registeredAt: true,
  claimed: true,
  claimedAt: true,
  nftSerial: true,
  metadataCID: true
});
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// NFT Metadata schema for IPFS
export const nftMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string(),
  })),
});
export type NFTMetadata = z.infer<typeof nftMetadataSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginCredentials = z.infer<typeof loginSchema>;

export const registerOrganizerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hederaAccountId: z.string().optional(),
});
export type RegisterOrganizer = z.infer<typeof registerOrganizerSchema>;

export const registerStudentSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hederaAccountId: z.string().optional(),
  name: z.string().optional(),
  college: z.string().optional(),
  rollNo: z.string().optional(),
});
export type RegisterStudent = z.infer<typeof registerStudentSchema>;

// Event creation schema with validation
export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  venueName: z.string().optional(),
  venueLat: z.number().min(-90).max(90),
  venueLong: z.number().min(-180).max(180),
  radius: z.number().min(10).max(10000).default(100),
  organizerId: z.string(),
});
export type CreateEvent = z.infer<typeof createEventSchema>;

// Location verification schema
export const locationSchema = z.object({
  lat: z.number(),
  long: z.number(),
});
export type Location = z.infer<typeof locationSchema>;

// Badge claim request schema
export const claimBadgeSchema = z.object({
  eventId: z.string(),
  studentId: z.string(),
  location: locationSchema,
  walletSignature: z.string().optional(),
});
export type ClaimBadgeRequest = z.infer<typeof claimBadgeSchema>;

// Verification result schema
export const verificationResultSchema = z.object({
  verified: z.boolean(),
  tokenId: z.string().optional(),
  serial: z.string().optional(),
  owner: z.string().optional(),
  metadata: nftMetadataSchema.optional(),
  eventName: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
});
export type VerificationResult = z.infer<typeof verificationResultSchema>;

// Legacy user types for compatibility
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
