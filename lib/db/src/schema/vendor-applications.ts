import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorApplicationsTable = pgTable("vendor_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  businessType: text("business_type").notNull(),
  township: text("township").notNull(),
  description: text("description"),
  website: text("website"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentTransactionId: text("payment_transaction_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVendorApplicationSchema = createInsertSchema(vendorApplicationsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, notes: true, paymentStatus: true, paymentTransactionId: true });
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplicationRow = typeof vendorApplicationsTable.$inferSelect;
