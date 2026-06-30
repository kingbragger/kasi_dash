import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, driversTable, driverLocationsTable, ordersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    driverUser?: { id: string; name: string; vehicleType: string; township: string };
  }
}

export function requireDriver(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.driverUser) {
    res.status(401).json({ error: "unauthorized", message: "Driver login required" });
    return;
  }
  next();
}

const router: IRouter = Router();

router.post("/driver/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "invalid_request", message: "Email and password required" });
    return;
  }

  const [driver] = await db.select().from(driversTable).where(and(eq(driversTable.email, email), eq(driversTable.isActive, true)));
  if (!driver) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, driver.password);
  if (!valid) {
    res.status(401).json({ error: "unauthorized", message: "Invalid email or password" });
    return;
  }

  req.session.driverUser = { id: driver.id, name: driver.fullName, vehicleType: driver.vehicleType, township: driver.township };
  req.log.info({ driverId: driver.id }, "Driver login");
  res.json({ success: true, id: driver.id, name: driver.fullName, vehicleType: driver.vehicleType, township: driver.township });
});

router.post("/driver/logout", (req, res): void => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get("/driver/me", (req, res): void => {
  if (!req.session?.driverUser) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  res.json({ ...req.session.driverUser, isAuthenticated: true });
});

router.get("/driver/orders", requireDriver, async (req, res): Promise<void> => {
  const driver = req.session.driverUser!;
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.driverId, driver.id));
  res.json(orders.map((o) => ({ ...o, amount: Number(o.amount) })));
});

router.patch("/driver/orders/:orderId/status", requireDriver, async (req, res): Promise<void> => {
  const driver = req.session.driverUser!;
  const { status } = req.body;
  const allowed = ["accepted", "in_transit", "delivered"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: "invalid_status", message: `Status must be one of: ${allowed.join(", ")}` });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.orderId));
  if (!order || order.driverId !== driver.id) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, req.params.orderId)).returning();
  res.json({ ...updated, amount: Number(updated.amount) });
});

router.post("/driver/location", requireDriver, async (req, res): Promise<void> => {
  const driver = req.session.driverUser!;
  const { lat, lng } = req.body;
  if (lat == null || lng == null) {
    res.status(400).json({ error: "invalid_request", message: "lat and lng required" });
    return;
  }

  const [existing] = await db.select().from(driverLocationsTable).where(eq(driverLocationsTable.driverId, driver.id));
  if (existing) {
    await db.update(driverLocationsTable).set({ lat: String(lat), lng: String(lng) }).where(eq(driverLocationsTable.driverId, driver.id));
  } else {
    await db.insert(driverLocationsTable).values({ driverId: driver.id, lat: String(lat), lng: String(lng) });
  }
  res.json({ success: true });
});

export default router;
