import { pgTable, text, uuid, timestamp, boolean, numeric } from "drizzle-orm/pg-core";

export const driversTable = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  township: text("township").notNull(),
  licenseNumber: text("license_number").notNull(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const driverLocationsTable = pgTable("driver_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id").notNull(),
  lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
  lng: numeric("lng", { precision: 10, scale: 7 }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Driver = typeof driversTable.$inferSelect;
export type DriverLocation = typeof driverLocationsTable.$inferSelect;
