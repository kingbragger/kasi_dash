import { pgTable, text, uuid, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  driverId: uuid("driver_id"),
  driverName: text("driver_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
