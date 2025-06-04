import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  bloodGroup: text("blood_group").notNull(),
  weight: integer("weight").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  address: text("address").notNull(),
  lastDonation: text("last_donation"),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  donationCount: integer("donation_count").default(0),
  rating: integer("rating").default(5), // out of 5, stored as integer (50 = 5.0)
  profilePicture: text("profile_picture"),
  coverPhoto: text("cover_photo"),
  bio: text("bio"),
  education: text("education"),
  work: text("work"),
  currentCity: text("current_city"),
  hometown: text("hometown"),
  socialLinks: jsonb("social_links").default('{}'),
  bloodDonationHistory: jsonb("blood_donation_history").default('[]'),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsRequired: integer("units_required").notNull(),
  hospitalName: text("hospital_name").notNull(),
  doctorName: text("doctor_name").notNull(),
  hospitalAddress: text("hospital_address").notNull(),
  requiredBy: text("required_by").notNull(),
  contactNumber: text("contact_number").notNull(),
  additionalInfo: text("additional_info"),
  isCritical: boolean("is_critical").default(false),
  status: text("status").default("pending"), // pending, approved, completed, cancelled
  requesterId: integer("requester_id").references(() => users.id),
  documents: jsonb("documents"), // array of document URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").references(() => users.id).notNull(),
  recipientName: text("recipient_name").notNull(),
  hospitalName: text("hospital_name").notNull(),
  donationDate: text("donation_date").notNull(),
  bloodGroup: text("blood_group").notNull(),
  unitsGiven: integer("units_given").notNull(),
  status: text("status").default("completed"), // completed, scheduled, cancelled
  notes: text("notes"),
  rating: integer("rating"), // recipient rating for donor
  testimonial: text("testimonial"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  donations: many(donations),
  emergencyRequests: many(emergencyRequests),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(users, {
    fields: [donations.donorId],
    references: [users.id],
  }),
}));

export const emergencyRequestsRelations = relations(emergencyRequests, ({ one }) => ({
  requester: one(users, {
    fields: [emergencyRequests.requesterId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  donationCount: true,
  rating: true,
  isVerified: true,
  isAdmin: true,
  createdAt: true,
}).extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username, email or phone is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  requesterId: true,
  status: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;
export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
