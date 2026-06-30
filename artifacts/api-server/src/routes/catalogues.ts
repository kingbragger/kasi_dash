import { Router, type IRouter } from "express";
import { db, cataloguesTable, catalogueItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

// ── Public routes ─────────────────────────────────────────────────────────────
const router: IRouter = Router();

router.get("/catalogues", async (req, res): Promise<void> => {
  const cats = await db.select().from(cataloguesTable).where(eq(cataloguesTable.isActive, true)).orderBy(cataloguesTable.vendorName);
  res.json(cats);
});

router.get("/catalogues/:id", async (req, res): Promise<void> => {
  const [cat] = await db.select().from(cataloguesTable).where(eq(cataloguesTable.id, req.params.id));
  if (!cat) { res.status(404).json({ error: "not_found", message: "Catalogue not found" }); return; }
  const items = await db.select().from(catalogueItemsTable).where(eq(catalogueItemsTable.catalogueId, cat.id)).orderBy(catalogueItemsTable.name);
  res.json({ ...cat, items: items.map((i) => ({ ...i, price: Number(i.price) })) });
});

export default router;

// ── Staff routes (mounted behind requireStaff in routes/index.ts) ─────────────
export const staffCataloguesRouter: IRouter = Router();

staffCataloguesRouter.get("/staff/catalogues", async (req, res): Promise<void> => {
  const cats = await db.select().from(cataloguesTable).orderBy(cataloguesTable.createdAt);
  const items = await db.select().from(catalogueItemsTable);
  res.json(cats.map((c) => ({
    ...c,
    items: items.filter((i) => i.catalogueId === c.id).map((i) => ({ ...i, price: Number(i.price) })),
  })));
});

staffCataloguesRouter.post("/staff/catalogues", async (req, res): Promise<void> => {
  const { vendorName, description, category, coverImage, township, storeHours } = req.body;
  if (!vendorName) { res.status(400).json({ error: "invalid_request", message: "vendorName required" }); return; }
  const [cat] = await db.insert(cataloguesTable).values({
    vendorName, description, category: category ?? "General", coverImage, township, storeHours, isActive: false,
  }).returning();
  req.log.info({ catalogueId: cat.id }, "Catalogue created");
  res.status(201).json(cat);
});

staffCataloguesRouter.patch("/staff/catalogues/:id", async (req, res): Promise<void> => {
  const { vendorName, description, category, coverImage, township, storeHours, isActive } = req.body;
  const [cat] = await db.update(cataloguesTable)
    .set({ vendorName, description, category, coverImage, township, storeHours, isActive })
    .where(eq(cataloguesTable.id, req.params.id))
    .returning();
  if (!cat) { res.status(404).json({ error: "not_found", message: "Catalogue not found" }); return; }
  res.json(cat);
});

staffCataloguesRouter.delete("/staff/catalogues/:id", async (req, res): Promise<void> => {
  await db.delete(catalogueItemsTable).where(eq(catalogueItemsTable.catalogueId, req.params.id));
  await db.delete(cataloguesTable).where(eq(cataloguesTable.id, req.params.id));
  res.json({ success: true });
});

staffCataloguesRouter.post("/staff/catalogues/:id/items", async (req, res): Promise<void> => {
  const { name, description, price, imageUrl, category, inStock } = req.body;
  if (!name || price == null) { res.status(400).json({ error: "invalid_request", message: "name and price required" }); return; }
  const [item] = await db.insert(catalogueItemsTable).values({
    catalogueId: req.params.id, name, description, price: String(price), imageUrl, category, inStock: inStock ?? true,
  }).returning();
  res.status(201).json({ ...item, price: Number(item.price) });
});

staffCataloguesRouter.patch("/staff/catalogues/:id/items/:itemId", async (req, res): Promise<void> => {
  const { name, description, price, imageUrl, category, inStock } = req.body;
  const [item] = await db.update(catalogueItemsTable)
    .set({ name, description, price: price != null ? String(price) : undefined, imageUrl, category, inStock })
    .where(and(eq(catalogueItemsTable.id, req.params.itemId), eq(catalogueItemsTable.catalogueId, req.params.id)))
    .returning();
  if (!item) { res.status(404).json({ error: "not_found", message: "Item not found" }); return; }
  res.json({ ...item, price: Number(item.price) });
});

staffCataloguesRouter.delete("/staff/catalogues/:id/items/:itemId", async (req, res): Promise<void> => {
  await db.delete(catalogueItemsTable)
    .where(and(eq(catalogueItemsTable.id, req.params.itemId), eq(catalogueItemsTable.catalogueId, req.params.id)));
  res.json({ success: true });
});
