import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import {
  db,
  driverApplicationsTable,
  vendorApplicationsTable,
  jobApplicationsTable,
  jobListingsTable,
  paymentsTable,
  cataloguesTable,
  vendorAccountsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  SubmitDriverApplicationBody,
  SubmitVendorApplicationBody,
  SubmitJobApplicationBody,
  UpdateDriverApplicationBody,
  UpdateVendorApplicationBody,
  UpdateJobApplicationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ── Public application submissions ───────────────────────────────────────────

router.post("/apply/driver", async (req, res): Promise<void> => {
  const parsed = SubmitDriverApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const [app] = await db.insert(driverApplicationsTable).values({
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    idNumber: parsed.data.idNumber,
    vehicleType: parsed.data.vehicleType,
    vehicleRegistration: parsed.data.vehicleRegistration,
    licenseNumber: parsed.data.licenseNumber,
    township: parsed.data.township,
    message: parsed.data.message,
    status: "pending",
  }).returning();

  req.log.info({ appId: app.id }, "Driver application submitted");
  res.status(201).json({ id: app.id, status: app.status, createdAt: app.createdAt });
});

router.post("/apply/vendor", async (req, res): Promise<void> => {
  const parsed = SubmitVendorApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const [app] = await db.insert(vendorApplicationsTable).values({
    businessName: parsed.data.businessName,
    contactName: parsed.data.contactName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    businessType: parsed.data.businessType,
    township: parsed.data.township,
    description: parsed.data.description,
    website: parsed.data.website,
    status: "pending",
    paymentStatus: "unpaid",
  }).returning();

  req.log.info({ appId: app.id }, "Vendor application submitted");
  res.status(201).json({ id: app.id, status: app.status, createdAt: app.createdAt });
});

// ── Vendor hosting payment initiation ────────────────────────────────────────

function generateOzowHash(params: {
  siteCode: string; countryCode: string; currencyCode: string;
  amount: string; transactionReference: string; bankRef: string;
  cancelUrl: string; errorUrl: string; successUrl: string;
  isTest: string; privateKey: string;
}): string {
  const input = [
    params.siteCode, params.countryCode, params.currencyCode, params.amount,
    params.transactionReference, params.bankRef,
    params.cancelUrl, params.errorUrl, params.successUrl,
    params.isTest, params.privateKey,
  ].join("").toLowerCase();
  return crypto.createHash("sha512").update(input).digest("hex");
}

router.post("/apply/vendor/:id/pay", async (req, res): Promise<void> => {
  const [app] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, req.params.id));
  if (!app) {
    res.status(404).json({ error: "not_found", message: "Vendor application not found" });
    return;
  }

  const siteCode = (process.env.OZOW_SITE_CODE ?? "TST-TST-001").trim();
  const apiKey = (process.env.OZOW_API_KEY ?? "").trim();
  const privateKey = (process.env.OZOW_PRIVATE_KEY ?? "").trim();
  const isTest = (process.env.OZOW_IS_TEST ?? "false").trim();
  const baseUrl = (process.env.APP_BASE_URL ??
    (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://kasidash.replit.app")).trim();

  const transactionId = crypto.randomUUID();
  const amount = "250.00";
  const businessNameEnc = encodeURIComponent(app.businessName);

  const successUrl = `${baseUrl}/vendor-payment/success?businessName=${businessNameEnc}&appId=${app.id}&txId=${transactionId}`;
  const cancelUrl  = `${baseUrl}/vendor-payment/failed?reason=cancelled&appId=${app.id}&businessName=${businessNameEnc}`;
  const errorUrl   = `${baseUrl}/vendor-payment/failed?reason=error&appId=${app.id}&businessName=${businessNameEnc}`;
  const notifyUrl  = `${baseUrl}/api/payments/ozow/notify`;

  const bankRef = app.id.replace(/-/g, "").slice(0, 20);

  const hash = generateOzowHash({
    siteCode, countryCode: "ZA", currencyCode: "ZAR", amount,
    transactionReference: transactionId,
    bankRef,
    cancelUrl, errorUrl, successUrl, isTest, privateKey,
  });

  const ozowParams = new URLSearchParams({
    SiteCode: siteCode,
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: amount,
    TransactionReference: transactionId,
    BankRef: bankRef,
    Customer: app.email,
    Optional1: `vh:${app.id}`,
    Optional2: app.businessName.slice(0, 50),
    CancelUrl: cancelUrl,
    ErrorUrl: errorUrl,
    SuccessUrl: successUrl,
    NotifyUrl: notifyUrl,
    IsTest: isTest,
    HashCheck: hash,
  });

  if (apiKey) ozowParams.set("ApiKey", apiKey);

  const paymentUrl = `https://pay.ozow.com/?${ozowParams.toString()}`;

  await db.insert(paymentsTable).values({
    transactionId,
    orderId: app.id,
    amount,
    status: "pending",
    ozowSiteCode: siteCode,
  });

  await db.update(vendorApplicationsTable)
    .set({ paymentTransactionId: transactionId })
    .where(eq(vendorApplicationsTable.id, app.id));

  req.log.info({ transactionId, appId: app.id }, "Vendor hosting Ozow payment initiated");
  res.json({ transactionId, paymentUrl, status: "pending" });
});

router.post("/apply/job", async (req, res): Promise<void> => {
  const parsed = SubmitJobApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const [job] = await db.select().from(jobListingsTable).where(eq(jobListingsTable.id, parsed.data.jobListingId));
  if (!job) {
    res.status(404).json({ error: "not_found", message: "Job listing not found" });
    return;
  }

  const [app] = await db.insert(jobApplicationsTable).values({
    jobListingId: parsed.data.jobListingId,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    coverLetter: parsed.data.coverLetter,
    linkedIn: parsed.data.linkedIn,
    experience: parsed.data.experience,
    status: "pending",
  }).returning();

  req.log.info({ appId: app.id, jobId: job.id }, "Job application submitted");
  res.status(201).json({ id: app.id, status: app.status, createdAt: app.createdAt });
});

// ── Staff routes ──────────────────────────────────────────────────────────────

export const staffApplicationsRouter: IRouter = Router();

staffApplicationsRouter.get("/staff/applications/drivers", async (req, res): Promise<void> => {
  const apps = await db.select().from(driverApplicationsTable).orderBy(driverApplicationsTable.createdAt);
  res.json(apps);
});

staffApplicationsRouter.get("/staff/applications/drivers/:id", async (req, res): Promise<void> => {
  const [app] = await db.select().from(driverApplicationsTable).where(eq(driverApplicationsTable.id, req.params.id));
  if (!app) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  res.json(app);
});

staffApplicationsRouter.patch("/staff/applications/drivers/:id", async (req, res): Promise<void> => {
  const parsed = UpdateDriverApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_request", message: parsed.error.message }); return; }

  const [updated] = await db.update(driverApplicationsTable)
    .set({ status: parsed.data.status, notes: parsed.data.notes })
    .where(eq(driverApplicationsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  res.json(updated);
});

staffApplicationsRouter.get("/staff/applications/vendors", async (req, res): Promise<void> => {
  const apps = await db.select().from(vendorApplicationsTable).orderBy(vendorApplicationsTable.createdAt);
  res.json(apps);
});

staffApplicationsRouter.patch("/staff/applications/vendors/:id", async (req, res): Promise<void> => {
  const parsed = UpdateVendorApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_request", message: parsed.error.message }); return; }

  const [updated] = await db.update(vendorApplicationsTable)
    .set({ status: parsed.data.status, notes: parsed.data.notes })
    .where(eq(vendorApplicationsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  res.json(updated);
});

staffApplicationsRouter.patch("/staff/applications/vendors/:id/payment", async (req, res): Promise<void> => {
  const { paymentStatus } = req.body;
  const allowed = ["unpaid", "paid", "pending"];
  if (!paymentStatus || !allowed.includes(paymentStatus)) {
    res.status(400).json({ error: "invalid_request", message: `paymentStatus must be one of: ${allowed.join(", ")}` });
    return;
  }

  const [updated] = await db.update(vendorApplicationsTable)
    .set({ paymentStatus })
    .where(eq(vendorApplicationsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  req.log.info({ id: req.params.id, paymentStatus }, "Vendor payment status manually updated");
  res.json(updated);
});

staffApplicationsRouter.post("/staff/applications/vendors/:id/activate", async (req, res): Promise<void> => {
  const [app] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, req.params.id));
  if (!app) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  if (app.paymentStatus !== "paid") {
    res.status(400).json({ error: "payment_required", message: "Payment must be confirmed before activating" });
    return;
  }

  const existing = await db.select().from(vendorAccountsTable).where(eq(vendorAccountsTable.email, app.email.toLowerCase().trim()));
  if (existing.length > 0) {
    res.status(409).json({ error: "conflict", message: "A vendor account already exists for this email address" });
    return;
  }

  const tempPassword = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6) + "@1";
  const hashed = await bcrypt.hash(tempPassword, 10);

  const [catalogue] = await db.insert(cataloguesTable).values({
    vendorName: app.businessName,
    category: app.businessType ?? "General",
    township: app.township ?? undefined,
    isActive: false,
  }).returning();

  await db.insert(vendorAccountsTable).values({
    businessName: app.businessName,
    email: app.email.toLowerCase().trim(),
    password: hashed,
    catalogueId: catalogue.id,
    isActive: true,
  });

  await db.update(vendorApplicationsTable)
    .set({ status: "approved" })
    .where(eq(vendorApplicationsTable.id, app.id));

  req.log.info({ appId: app.id, email: app.email, catalogueId: catalogue.id }, "Vendor account activated from application");
  res.status(201).json({ success: true, email: app.email, tempPassword, catalogueId: catalogue.id });
});

staffApplicationsRouter.get("/staff/applications/jobs", async (req, res): Promise<void> => {
  const apps = await db.select({
    id: jobApplicationsTable.id,
    jobListingId: jobApplicationsTable.jobListingId,
    jobTitle: jobListingsTable.title,
    fullName: jobApplicationsTable.fullName,
    email: jobApplicationsTable.email,
    phone: jobApplicationsTable.phone,
    coverLetter: jobApplicationsTable.coverLetter,
    linkedIn: jobApplicationsTable.linkedIn,
    experience: jobApplicationsTable.experience,
    status: jobApplicationsTable.status,
    notes: jobApplicationsTable.notes,
    createdAt: jobApplicationsTable.createdAt,
    updatedAt: jobApplicationsTable.updatedAt,
  }).from(jobApplicationsTable)
    .leftJoin(jobListingsTable, eq(jobApplicationsTable.jobListingId, jobListingsTable.id))
    .orderBy(jobApplicationsTable.createdAt);
  res.json(apps);
});

staffApplicationsRouter.patch("/staff/applications/jobs/:id", async (req, res): Promise<void> => {
  const parsed = UpdateJobApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_request", message: parsed.error.message }); return; }

  const [updated] = await db.update(jobApplicationsTable)
    .set({ status: parsed.data.status, notes: parsed.data.notes })
    .where(eq(jobApplicationsTable.id, req.params.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "not_found", message: "Application not found" }); return; }
  res.json(updated);
});

export default router;
