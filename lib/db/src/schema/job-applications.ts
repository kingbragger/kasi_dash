import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobApplicationsTable = pgTable("job_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobListingId: uuid("job_listing_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  coverLetter: text("cover_letter").notNull(),
  linkedIn: text("linkedin"),
  experience: text("experience"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplicationsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, notes: true });
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplicationRow = typeof jobApplicationsTable.$inferSelect;
