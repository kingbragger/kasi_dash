import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, vendorAccountsTable, cataloguesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/staff/vendors", async (req, res): Promise<void> => {
  const vendors = await db.select().from(vendorAccountsTable).orderBy(vendorAccountsTable.createdAt);
  res.json(vendors.map((v) => ({ ...v, password: undefined })));
});

router.post("/staff/vendors", async (req, res): Promise<void> => {
  const { businessName, email, password, catalogueId } = req.body;
  if (!businessName || !email || !password) {
    res.status(400).json({ error: "invalid_request", message: "businessName, email and password are required" });
    return;
  }

  const existing = await db.select().from(vendorAccountsTable).where(eq(vendorAccountsTable.email, email.toLowerCase().trim()));
  if (existing.length > 0) {
    res.status(409).json({ error: "conflict", message: "A vendor account with this email already exists" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [vendor] = await db.insert(vendorAccountsTable).values({
    businessName,
    email: email.toLowerCase().trim(),
    password: hashed,
    catalogueId: catalogueId || null,
    isActive: true,
  }).returning();

  req.log.info({ vendorId: vendor.id }, "Vendor account created");
  res.status(201).json({ ...vendor, password: undefined });
});

router.patch("/staff/vendors/:id", async (req, res): Promise<void> => {
  const { businessName, email, password, catalogueId, isActive } = req.body;

  const updates: Record<string, unknown> = {};
  if (businessName != null) updates.businessName = businessName;
  if (email != null) updates.email = email.toLowerCase().trim();
  if (catalogueId !== undefined) updates.catalogueId = catalogueId || null;
  if (isActive != null) updates.isActive = isActive;
  if (password) updates.password = await bcrypt.hash(password, 10);

  const [vendor] = await db.update(vendorAccountsTable)
    .set(updates)
    .where(eq(vendorAccountsTable.id, req.params.id))
    .returning();

  if (!vendor) { res.status(404).json({ error: "not_found", message: "Vendor account not found" }); return; }
  res.json({ ...vendor, password: undefined });
});

router.delete("/staff/vendors/:id", async (req, res): Promise<void> => {
  await db.delete(vendorAccountsTable).where(eq(vendorAccountsTable.id, req.params.id));
  res.json({ success: true });
});

router.get("/staff/catalogues-list", async (req, res): Promise<void> => {
  const cats = await db.select({ id: cataloguesTable.id, vendorName: cataloguesTable.vendorName })
    .from(cataloguesTable)
    .orderBy(cataloguesTable.vendorName);
  res.json(cats);
});

export default router;
