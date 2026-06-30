import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const investorSubmissionsTable = pgTable("investor_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  amount: text("amount").notNull(),
  contactMethod: text("contact_method").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  staffReply: text("staff_reply"),
  repliedAt: timestamp("replied_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InvestorSubmission = typeof investorSubmissionsTable.$inferSelect;
