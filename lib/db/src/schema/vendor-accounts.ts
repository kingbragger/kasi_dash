import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

export const vendorAccountsTable = pgTable("vendor_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  catalogueId: uuid("catalogue_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type VendorAccount = typeof vendorAccountsTable.$inferSelect;
