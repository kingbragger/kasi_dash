import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, vendorAccountsTable, cataloguesTable, catalogueItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    vendorUser?: { id: string; businessName: string; catalogueId: string | null };
  }
}

export function requireVendor(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.vendorUser) {
    res.status(401).json({ error: "unauthorized", message: "Vendor login required" });
    return;
  }
  next();
}

const router: IRouter = Router();

router.post("/vendor/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "invalid_request", message: "Email and password required" });
    return;
  }

  const [vendor] = await db
    .select()
    .from(vendorAccountsTable)
    .where(and(eq(vendorAccountsTable.email, email.toLowerCase().trim()), eq(vendorAccountsTable.isActive, true)));

  if (!vendor) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, vendor.password);
  if (!valid) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
    return;
  }

  req.session.vendorUser = { id: vendor.id, businessName: vendor.businessName, catalogueId: vendor.catalogueId ?? null };
  req.log.info({ vendorId: vendor.id }, "Vendor login");
  res.json({ success: true, id: vendor.id, businessName: vendor.businessName, catalogueId: vendor.catalogueId ?? null });
});

router.post("/vendor/logout", (req, res): void => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get("/vendor/me", (req, res): void => {
  if (!req.session?.vendorUser) {
    res.status(401).json({ error: "unauthorized", isAuthenticated: false });
    return;
  }
  res.json({ ...req.session.vendorUser, isAuthenticated: true });
});

router.get("/vendor/catalogue", requireVendor, async (req, res): Promise<void> => {
  const vendor = req.session.vendorUser!;
  if (!vendor.catalogueId) {
    res.status(404).json({ error: "not_found", message: "No catalogue linked to this account. Contact admin." });
    return;
  }
  const [cat] = await db.select().from(cataloguesTable).where(eq(cataloguesTable.id, vendor.catalogueId));
  if (!cat) {
    res.status(404).json({ error: "not_found", message: "Catalogue not found" });
    return;
  }
  const items = await db.select().from(catalogueItemsTable).where(eq(catalogueItemsTable.catalogueId, cat.id)).orderBy(catalogueItemsTable.name);
  res.json({ ...cat, items: items.map((i) => ({ ...i, price: Number(i.price) })) });
});

router.patch("/vendor/catalogue", requireVendor, async (req, res): Promise<void> => {
  const vendor = req.session.vendorUser!;
  if (!vendor.catalogueId) {
    res.status(404).json({ error: "not_found", message: "No catalogue linked to this account" });
    return;
  }
  const { description, storeHours, coverImage, township } = req.body;
  const [cat] = await db.update(cataloguesTable)
    .set({ description, storeHours, coverImage, township })
    .where(eq(cataloguesTable.id, vendor.catalogueId))
    .returning();
  res.json(cat);
});

router.post("/vendor/catalogue/items", requireVendor, async (req, res): Promise<void> => {
  const vendor = req.session.vendorUser!;
  if (!vendor.catalogueId) {
    res.status(404).json({ error: "not_found", message: "No catalogue linked" });
    return;
  }
  const { name, description, price, imageUrl, category } = req.body;
  if (!name || price == null) {
    res.status(400).json({ error: "invalid_request", message: "name and price required" });
    return;
  }
  const [item] = await db.insert(catalogueItemsTable).values({
    catalogueId: vendor.catalogueId, name, description, price: String(price), imageUrl, category, inStock: true,
  }).returning();
  res.status(201).json({ ...item, price: Number(item.price) });
});

router.patch("/vendor/catalogue/items/:itemId", requireVendor, async (req, res): Promise<void> => {
  const vendor = req.session.vendorUser!;
  if (!vendor.catalogueId) {
    res.status(404).json({ error: "not_found", message: "No catalogue linked" });
    return;
  }
  const { name, description, price, imageUrl, category, inStock } = req.body;
  const [item] = await db.update(catalogueItemsTable)
    .set({ name, description, price: price != null ? String(price) : undefined, imageUrl, category, inStock })
    .where(and(eq(catalogueItemsTable.id, req.params.itemId), eq(catalogueItemsTable.catalogueId, vendor.catalogueId)))
    .returning();
  if (!item) { res.status(404).json({ error: "not_found", message: "Item not found" }); return; }
  res.json({ ...item, price: Number(item.price) });
});

router.delete("/vendor/catalogue/items/:itemId", requireVendor, async (req, res): Promise<void> => {
  const vendor = req.session.vendorUser!;
  if (!vendor.catalogueId) {
    res.status(404).json({ error: "not_found", message: "No catalogue linked" });
    return;
  }
  await db.delete(catalogueItemsTable)
    .where(and(eq(catalogueItemsTable.id, req.params.itemId), eq(catalogueItemsTable.catalogueId, vendor.catalogueId)));
  res.json({ success: true });
});

export default router;
