import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

export const buildforgeTeamTable = pgTable("buildforge_team", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  passwordHash: text("password_hash"),
  tempPassword: text("temp_password"),
  idNumber: text("id_number"),
  phone: text("phone"),
  bio: text("bio"),
  isActive: boolean("is_active").notNull().default(false),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  // Bank details
  bankAccountHolder: text("bank_account_holder"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountType: text("bank_account_type"),
  bankBranchCode: text("bank_branch_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type BuildforgeTeamMember = typeof buildforgeTeamTable.$inferSelect;
