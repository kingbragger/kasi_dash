import { Router, type IRouter } from "express";
import { db, ordersTable, paymentsTable, vendorApplicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  InitiateOzowPaymentBody,
  OzowPaymentNotifyBody,
  GetPaymentStatusParams,
  GetPaymentStatusResponse,
  InitiateOzowPaymentResponse,
  OzowPaymentNotifyResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateOzowHash(params: {
  siteCode: string; countryCode: string; currencyCode: string;
  amount: string; transactionReference: string; bankRef: string;
  optional1?: string; optional2?: string; optional3?: string; optional4?: string; optional5?: string;
  cancelUrl: string; errorUrl: string; successUrl: string; notifyUrl: string;
  isTest: string; privateKey: string;
}): string {
  const input = [
    params.siteCode, params.countryCode, params.currencyCode, params.amount,
    params.transactionReference, params.bankRef,
    params.optional1 ?? "", params.optional2 ?? "", params.optional3 ?? "",
    params.optional4 ?? "", params.optional5 ?? "",
    params.cancelUrl, params.errorUrl, params.successUrl, params.notifyUrl,
    params.isTest, params.privateKey,
  ].join("").toLowerCase();
  return crypto.createHash("sha512").update(input).digest("hex");
}

// Initiate order payment
router.post("/payments/ozow/initiate", async (req, res): Promise<void> => {
  const parsed = InitiateOzowPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const { orderId, amount, customerName, customerEmail, description } = parsed.data;

  const siteCode  = (process.env.OZOW_SITE_CODE ?? "TST-TST-001").trim();
  const apiKey    = (process.env.OZOW_API_KEY ?? "").trim();
  const privateKey = (process.env.OZOW_PRIVATE_KEY ?? "").trim();
  const isTest    = (process.env.OZOW_IS_TEST ?? "false").trim();
  const baseUrl   = (process.env.APP_BASE_URL ??
    (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "https://kasidash.replit.app")).trim();

  const transactionId = crypto.randomUUID();
  const amountStr = Number(amount).toFixed(2);

  const successUrl = `${baseUrl}/payment/success?transactionId=${transactionId}`;
  const cancelUrl  = `${baseUrl}/payment/failed?transactionId=${transactionId}&reason=cancelled`;
  const errorUrl   = `${baseUrl}/payment/failed?transactionId=${transactionId}&reason=error`;
  const notifyUrl  = `${baseUrl}/api/payments/ozow/notify`;

  const bankRef = orderId.replace(/-/g, "").slice(0, 20);

  const optional1 = description.slice(0, 50);

  const hash = generateOzowHash({
    siteCode, countryCode: "ZA", currencyCode: "ZAR", amount: amountStr,
    transactionReference: transactionId, bankRef,
    optional1,
    cancelUrl, errorUrl, successUrl, notifyUrl, isTest, privateKey,
  });

  const ozowParams = new URLSearchParams({
    SiteCode: siteCode, CountryCode: "ZA", CurrencyCode: "ZAR",
    Amount: amountStr, TransactionReference: transactionId, BankReference: bankRef,
    Customer: customerEmail ?? customerName, Optional1: description.slice(0, 50),
    CancelUrl: cancelUrl, ErrorUrl: errorUrl, SuccessUrl: successUrl,
    NotifyUrl: notifyUrl, IsTest: isTest, HashCheck: hash,
  });

  if (apiKey) ozowParams.set("ApiKey", apiKey);

  const paymentUrl = `https://pay.ozow.com/?${ozowParams.toString()}`;

  await db.insert(paymentsTable).values({
    transactionId, orderId, amount: amountStr, status: "pending", ozowSiteCode: siteCode,
  });

  req.log.info({ transactionId, orderId }, "Ozow payment initiated");
  res.json(InitiateOzowPaymentResponse.parse({ transactionId, paymentUrl, status: "pending" }));
});

// Ozow webhook — handles both order payments and vendor hosting payments
router.post("/payments/ozow/notify", async (req, res): Promise<void> => {
  const parsed = OzowPaymentNotifyBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid Ozow notification");
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const { TransactionId, Status, Optional1 } = parsed.data;

  const statusMap: Record<string, string> = {
    Complete: "success",
    Cancelled: "cancelled",
    Error: "failed",
    PendingInvestigation: "processing",
    Pending: "processing",
  };

  const normalizedStatus = statusMap[Status] ?? "pending";

  // Update payment record
  await db.update(paymentsTable)
    .set({ status: normalizedStatus })
    .where(eq(paymentsTable.transactionId, TransactionId));

  // Determine payment type via Optional1
  const isVendorHosting = typeof Optional1 === "string" && Optional1.startsWith("vh:");

  if (isVendorHosting) {
    // Vendor hosting payment — update vendor application payment status
    const applicationId = Optional1.split(":")[1];
    if (applicationId) {
      const newPaymentStatus = normalizedStatus === "success" ? "paid"
        : normalizedStatus === "cancelled" ? "cancelled"
        : normalizedStatus === "failed" ? "failed"
        : "pending";

      await db.update(vendorApplicationsTable)
        .set({ paymentStatus: newPaymentStatus, paymentTransactionId: TransactionId })
        .where(eq(vendorApplicationsTable.id, applicationId));

      req.log.info({ transactionId: TransactionId, applicationId, paymentStatus: newPaymentStatus }, "Vendor hosting payment processed");
    }
  } else {
    // Regular delivery order payment
    if (normalizedStatus === "success") {
      const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, TransactionId));
      if (payment) {
        await db.update(ordersTable)
          .set({ paymentStatus: "success", status: "accepted" })
          .where(eq(ordersTable.id, payment.orderId));
      }
    } else if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
      const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, TransactionId));
      if (payment) {
        await db.update(ordersTable)
          .set({ paymentStatus: normalizedStatus })
          .where(eq(ordersTable.id, payment.orderId));
      }
    }
    req.log.info({ transactionId: TransactionId, status: normalizedStatus }, "Order payment notification processed");
  }

  res.json(OzowPaymentNotifyResponse.parse({ success: true }));
});

// Get payment status
router.get("/payments/:transactionId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.transactionId) ? req.params.transactionId[0] : req.params.transactionId;
  const params = GetPaymentStatusParams.safeParse({ transactionId: raw });
  if (!params.success) {
    res.status(400).json({ error: "invalid_request", message: params.error.message });
    return;
  }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.transactionId, params.data.transactionId));
  if (!payment) {
    res.status(404).json({ error: "not_found", message: "Payment not found" });
    return;
  }

  res.json(GetPaymentStatusResponse.parse({
    transactionId: payment.transactionId,
    orderId: payment.orderId,
    amount: Number(payment.amount),
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }));
});

export default router;
