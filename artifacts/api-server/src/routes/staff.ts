import { Router, type IRouter } from "express";
import { db, ordersTable, waitlistTable, driverApplicationsTable, vendorApplicationsTable, jobApplicationsTable, jobListingsTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
import { StaffLoginBody } from "@workspace/api-zod";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    staffUser?: { username: string; role: string };
  }
}

const STAFF_USERNAME = process.env.STAFF_USERNAME ?? "admin";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD ?? "kasidash2025";

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.staffUser) {
    res.status(401).json({ error: "unauthorized", message: "Staff login required" });
    return;
  }
  next();
}

const router: IRouter = Router();

router.post("/staff/login", async (req, res): Promise<void> => {
  const parsed = StaffLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== STAFF_USERNAME || password !== STAFF_PASSWORD) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }

  req.session.staffUser = { username, role: "admin" };
  req.log.info({ username }, "Staff login");
  res.json({ success: true, username, role: "admin" });
});

router.post("/staff/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/staff/me", (req, res): void => {
  if (!req.session?.staffUser) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  res.json({ ...req.session.staffUser, isAuthenticated: true });
});

router.get("/staff/stats", requireStaff, async (req, res): Promise<void> => {
  const [totalOrders] = await db.select({ count: count() }).from(ordersTable);
  const [activeOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "in_transit"));
  const [revenue] = await db.select({ total: sum(ordersTable.amount) }).from(ordersTable).where(eq(ordersTable.paymentStatus, "success"));
  const [waitlist] = await db.select({ count: count() }).from(waitlistTable);
  const [pendingDrivers] = await db.select({ count: count() }).from(driverApplicationsTable).where(eq(driverApplicationsTable.status, "pending"));
  const [pendingVendors] = await db.select({ count: count() }).from(vendorApplicationsTable).where(eq(vendorApplicationsTable.status, "pending"));
  const [pendingJobs] = await db.select({ count: count() }).from(jobApplicationsTable).where(eq(jobApplicationsTable.status, "pending"));
  const [activeListings] = await db.select({ count: count() }).from(jobListingsTable).where(eq(jobListingsTable.isActive, true));

  res.json({
    totalOrders: Number(totalOrders.count),
    activeOrders: Number(activeOrders.count),
    totalRevenue: Number(revenue.total ?? 0),
    waitlistCount: Number(waitlist.count),
    pendingDriverApplications: Number(pendingDrivers.count),
    pendingVendorApplications: Number(pendingVendors.count),
    pendingJobApplications: Number(pendingJobs.count),
    activeJobListings: Number(activeListings.count),
  });
});

export default router;
