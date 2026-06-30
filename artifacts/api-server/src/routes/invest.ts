import { Router, type IRouter } from "express";
import { db, investorSubmissionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/invest", async (req, res): Promise<void> => {
  const { fullName, email, phone, amount, contactMethod, message } = req.body;
  if (!fullName || !email || !phone || !amount || !contactMethod) {
    res.status(400).json({ error: "invalid_request", message: "All required fields must be filled in." });
    return;
  }
  const [submission] = await db.insert(investorSubmissionsTable).values({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    amount: amount.trim(),
    contactMethod: contactMethod.trim(),
    message: message?.trim() || null,
  }).returning();
  req.log.info({ id: submission.id }, "Investor interest submitted");
  res.status(201).json({ id: submission.id });
});

export default router;

export const staffInvestRouter: IRouter = Router();

staffInvestRouter.get("/staff/invest", async (req, res): Promise<void> => {
  const submissions = await db
    .select()
    .from(investorSubmissionsTable)
    .orderBy(desc(investorSubmissionsTable.createdAt));
  res.json(submissions);
});

staffInvestRouter.patch("/staff/invest/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const { status, staffReply } = req.body;

  const validStatuses = ["pending", "contacted", "interested", "declined"];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: "invalid_status" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (staffReply !== undefined) {
    updates.staffReply = staffReply?.trim() || null;
    updates.repliedAt = staffReply?.trim() ? new Date() : null;
  }

  const [updated] = await db
    .update(investorSubmissionsTable)
    .set(updates)
    .where(eq(investorSubmissionsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  req.log.info({ id }, "Investor submission updated");
  res.json(updated);
});
