import { pgTable, text, uuid, timestamp, boolean, numeric } from "drizzle-orm/pg-core";

export const cataloguesTable = pgTable("catalogues", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorName: text("vendor_name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("General"),
  coverImage: text("cover_image"),
  township: text("township"),
  storeHours: text("store_hours"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const catalogueItemsTable = pgTable("catalogue_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  catalogueId: uuid("catalogue_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Catalogue = typeof cataloguesTable.$inferSelect;
export type CatalogueItem = typeof catalogueItemsTable.$inferSelect;
