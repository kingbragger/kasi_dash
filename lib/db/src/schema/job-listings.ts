import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobListingsTable = pgTable("job_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull().default("full_time"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertJobListingSchema = createInsertSchema(jobListingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;
export type JobListingRow = typeof jobListingsTable.$inferSelect;
