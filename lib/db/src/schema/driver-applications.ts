import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const driverApplicationsTable = pgTable("driver_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  idNumber: text("id_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  vehicleRegistration: text("vehicle_registration"),
  licenseNumber: text("license_number").notNull(),
  township: text("township").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDriverApplicationSchema = createInsertSchema(driverApplicationsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, notes: true });
export type InsertDriverApplication = z.infer<typeof insertDriverApplicationSchema>;
export type DriverApplicationRow = typeof driverApplicationsTable.$inferSelect;
