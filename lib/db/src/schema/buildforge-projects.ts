import { pgTable, text, uuid, timestamp, integer } from "drizzle-orm/pg-core";

export const buildforgeProjectsTable = pgTable("buildforge_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientName: text("client_name").notNull(),
  clientContact: text("client_contact"),
  websiteType: text("website_type").notNull(),
  description: text("description"),
  assignedMemberId: text("assigned_member_id"),
  assignedMemberName: text("assigned_member_name"),
  status: text("status").notNull().default("Pending"),
  amountRands: integer("amount_rands"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type BuildforgeProject = typeof buildforgeProjectsTable.$inferSelect;
