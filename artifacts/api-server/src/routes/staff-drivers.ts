import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, driversTable, driverLocationsTable, ordersTable, driverApplicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/staff/drivers", async (req, res): Promise<void> => {
  const drivers = await db.select().from(driversTable).orderBy(driversTable.createdAt);
  res.json(drivers.map((d) => ({ ...d, password: undefined })));
});

router.post("/staff/applications/drivers/:id/activate", async (req, res): Promise<void> => {
  const [app] = await db.select().from(driverApplicationsTable).where(eq(driverApplicationsTable.id, req.params.id));
  if (!app) {
    res.status(404).json({ error: "not_found", message: "Application not found" });
    return;
  }

  const existing = await db.select().from(driversTable).where(eq(driversTable.email, app.email));
  if (existing.length > 0) {
    res.status(409).json({ error: "conflict", message: "Driver account already exists for this email" });
    return;
  }

  const rawPassword = Math.random().toString(36).slice(-8) + "K!";
  const hashed = await bcrypt.hash(rawPassword, 10);

  const [driver] = await db.insert(driversTable).values({
    applicationId: app.id,
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    vehicleType: app.vehicleType,
    township: app.township,
    licenseNumber: app.licenseNumber,
    password: hashed,
    isActive: true,
  }).returning();

  await db.update(driverApplicationsTable).set({ status: "approved" }).where(eq(driverApplicationsTable.id, app.id));

  req.log.info({ driverId: driver.id }, "Driver account activated");
  res.status(201).json({ ...driver, password: undefined, tempPassword: rawPassword });
});

router.get("/staff/drivers/locations", async (req, res): Promise<void> => {
  const drivers = await db.select().from(driversTable).where(eq(driversTable.isActive, true));
  const locations = await db.select().from(driverLocationsTable);

  const result = drivers.map((d) => {
    const loc = locations.find((l) => l.driverId === d.id);
    return {
      id: d.id,
      name: d.fullName,
      vehicleType: d.vehicleType,
      township: d.township,
      phone: d.phone,
      lat: loc ? Number(loc.lat) : null,
      lng: loc ? Number(loc.lng) : null,
      lastSeen: loc ? loc.updatedAt : null,
    };
  });

  res.json(result);
});

router.post("/staff/orders/:orderId/assign", async (req, res): Promise<void> => {
  const { driverId } = req.body;
  if (!driverId) {
    res.status(400).json({ error: "invalid_request", message: "driverId required" });
    return;
  }

  const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, driverId));
  if (!driver) {
    res.status(404).json({ error: "not_found", message: "Driver not found" });
    return;
  }

  const [order] = await db.update(ordersTable)
    .set({ driverId: driver.id, driverName: driver.fullName, status: "accepted" })
    .where(eq(ordersTable.id, req.params.orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  res.json({ ...order, amount: Number(order.amount) });
});

router.get("/staff/orders/all", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.map((o) => ({ ...o, amount: Number(o.amount) })));
});

export default router;
