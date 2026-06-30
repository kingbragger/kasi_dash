import { Router, type IRouter } from "express";
import { db, jobListingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateJobListingBody, UpdateJobListingBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/careers", async (req, res): Promise<void> => {
  const listings = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.isActive, true))
    .orderBy(jobListingsTable.createdAt);

  res.json(listings);
});

router.get("/careers/:jobId", async (req, res): Promise<void> => {
  const [listing] = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, req.params.jobId));

  if (!listing) {
    res.status(404).json({ error: "not_found", message: "Job listing not found" });
    return;
  }

  res.json(listing);
});

export const staffCareersRouter: IRouter = Router();

staffCareersRouter.get("/staff/careers", async (req, res): Promise<void> => {
  const listings = await db
    .select()
    .from(jobListingsTable)
    .orderBy(jobListingsTable.createdAt);

  res.json(listings);
});

staffCareersRouter.post("/staff/careers", async (req, res): Promise<void> => {
  const parsed = CreateJobListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const [listing] = await db
    .insert(jobListingsTable)
    .values({
      title: parsed.data.title,
      department: parsed.data.department,
      location: parsed.data.location,
      type: parsed.data.type,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  req.log.info({ listingId: listing.id }, "Job listing created");
  res.status(201).json(listing);
});

staffCareersRouter.patch("/staff/careers/:id", async (req, res): Promise<void> => {
  const parsed = UpdateJobListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", message: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, req.params.id));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Job listing not found" });
    return;
  }

  const [updated] = await db
    .update(jobListingsTable)
    .set({ ...parsed.data })
    .where(eq(jobListingsTable.id, req.params.id))
    .returning();

  res.json(updated);
});

staffCareersRouter.delete("/staff/careers/:id", async (req, res): Promise<void> => {
  const [existing] = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, req.params.id));

  if (!existing) {
    res.status(404).json({ error: "not_found", message: "Job listing not found" });
    return;
  }

  await db.delete(jobListingsTable).where(eq(jobListingsTable.id, req.params.id));
  res.json({ success: true });
});

export default router;
