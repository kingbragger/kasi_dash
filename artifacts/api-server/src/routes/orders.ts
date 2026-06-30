import { Router, type IRouter } from "express";
import { db, ordersTable, waitlistTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  ListOrdersResponse,
  GetOrderStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders/stats", async (req, res): Promise<void> => {
  const [totalResult] = await db.select({ count: count() }).from(ordersTable);
  const [deliveredResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));
  const [activeResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "in_transit"));
  const [revenueResult] = await db
    .select({ total: sum(ordersTable.amount) })
    .from(ordersTable)
    .where(eq(ordersTable.paymentStatus, "success"));
  const [waitlistResult] = await db.select({ count: count() }).from(waitlistTable);

  res.json(
    GetOrderStatsResponse.parse({
      totalOrders: Number(totalResult.count),
      deliveredOrders: Number(deliveredResult.count),
      activeOrders: Number(activeResult.count),
      totalRevenue: Number(revenueResult.total ?? 0),
      waitlistCount: Number(waitlistResult.count),
    })
  );
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const paymentMethod = parsed.data.paymentMethod ?? "cod";

  const [order] = await db
    .insert(ordersTable)
    .values({
      pickupAddress: parsed.data.pickupAddress,
      deliveryAddress: parsed.data.deliveryAddress,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
      description: parsed.data.description,
      amount: String(parsed.data.amount),
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "cod" : "pending",
      paymentMethod,
    })
    .returning();

  req.log.info({ orderId: order.id }, "New order created");
  res.status(201).json(GetOrderResponse.parse({
    ...order,
    amount: Number(order.amount),
    customerEmail: order.customerEmail ?? undefined,
    description: order.description ?? undefined,
    driverName: order.driverName ?? undefined,
    driverId: order.driverId ?? undefined,
  }));
});

router.get("/orders", async (req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(ordersTable.createdAt);

  res.json(ListOrdersResponse.parse(orders.map((o) => ({ ...o, amount: Number(o.amount) }))));
});

router.get("/orders/:orderId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const params = GetOrderParams.safeParse({ orderId: raw });
  if (!params.success) {
    res.status(400).json({ error: "invalid_request", message: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "not_found", message: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse({ ...order, amount: Number(order.amount) }));
});

export default router;
