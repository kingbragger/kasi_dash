import { Router, type IRouter } from "express";
import { db, waitlistTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import {
  JoinWaitlistBody,
  GetWaitlistCountResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/waitlist", async (req, res): Promise<void> => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(waitlistTable)
    .where(eq(waitlistTable.email, parsed.data.email));

  if (existing.length > 0) {
    res.status(409).json({ error: "already_exists", message: "Email is already on the waitlist" });
    return;
  }

  const [entry] = await db
    .insert(waitlistTable)
    .values({ email: parsed.data.email, name: parsed.data.name })
    .returning();

  req.log.info({ email: entry.email }, "New waitlist signup");
  res.status(201).json({
    id: entry.id,
    email: entry.email,
    name: entry.name ?? undefined,
    createdAt: entry.createdAt,
  });
});

router.get("/waitlist", async (req, res): Promise<void> => {
  const [result] = await db.select({ count: count() }).from(waitlistTable);
  res.json(GetWaitlistCountResponse.parse({ count: Number(result.count) }));
});

export default router;
