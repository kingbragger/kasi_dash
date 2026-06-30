import { Router, type IRouter } from "express";
import { db, ordersTable, driversTable, driverLocationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router: IRouter = Router();

router.get("/track/:orderId", async (req, res): Promise<void> => {
  if (!UUID_RE.test(req.params.orderId)) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.orderId));
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  let driverLocation: { lat: number; lng: number } | null = null;
  let driverInfo: { name: string; vehicleType: string; phone?: string } | null = null;

  if (order.driverId) {
    const [driver] = await db.select().from(driversTable).where(eq(driversTable.id, order.driverId));
    if (driver) {
      driverInfo = { name: driver.fullName, vehicleType: driver.vehicleType, phone: driver.phone };
    }
    const [loc] = await db.select().from(driverLocationsTable).where(eq(driverLocationsTable.driverId, order.driverId));
    if (loc) {
      driverLocation = { lat: Number(loc.lat), lng: Number(loc.lng) };
    }
  }

  res.json({
    order: { ...order, amount: Number(order.amount) },
    driverLocation,
    driverInfo,
  });
});

router.get("/receipt/:orderId", async (req, res): Promise<void> => {
  if (!UUID_RE.test(req.params.orderId)) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.orderId));
  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  res.json({ ...order, amount: Number(order.amount) });
});

export default router;
