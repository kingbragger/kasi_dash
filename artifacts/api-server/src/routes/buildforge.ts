import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, buildforgeTeamTable, buildforgeProjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    buildforgeUser?: { id: string; name: string; email: string; role: string; mustChangePassword: boolean; profileCompleted: boolean };
  }
}

export function requireBuildforge(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.buildforgeUser) {
    res.status(401).json({ error: "unauthorized", message: "BuildForge login required" });
    return;
  }
  next();
}

const router: IRouter = Router();

// ── Check email ───────────────────────────────────────────────────────────────
router.post("/buildforge/check-email", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "invalid_request", message: "Email required" }); return; }
  const [member] = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.email, email.toLowerCase().trim()));
  if (!member) { res.status(404).json({ found: false, message: "This email is not registered as a BuildForge team member." }); return; }
  if (!member.isActive) { res.status(403).json({ found: true, active: false, message: "Your account is not yet activated. Contact the admin." }); return; }
  res.json({ found: true, active: true, hasPassword: !!member.passwordHash });
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/buildforge/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "invalid_request", message: "Email and password required" }); return; }
  const [member] = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.email, email.toLowerCase().trim()));
  if (!member || !member.isActive) { res.status(401).json({ error: "unauthorized", message: "Invalid credentials" }); return; }

  let valid = false;
  if (member.passwordHash) valid = await bcrypt.compare(password, member.passwordHash);
  else if (member.tempPassword) valid = password === member.tempPassword;

  if (!valid) { res.status(401).json({ error: "unauthorized", message: "Invalid credentials" }); return; }

  req.session.buildforgeUser = { id: member.id, name: member.name, email: member.email, role: member.role, mustChangePassword: member.mustChangePassword, profileCompleted: member.profileCompleted };
  req.log.info({ memberId: member.id }, "BuildForge member login");
  res.json({ success: true, mustChangePassword: member.mustChangePassword, profileCompleted: member.profileCompleted });
});

// ── Me ─────────────────────────────────────────────────────────────────────────
router.get("/buildforge/me", (req, res): void => {
  if (!req.session?.buildforgeUser) { res.json({ isAuthenticated: false }); return; }
  res.json({ ...req.session.buildforgeUser, isAuthenticated: true });
});

// ── Logout ─────────────────────────────────────────────────────────────────────
router.post("/buildforge/logout", (req, res): void => {
  req.session.destroy(() => res.json({ success: true }));
});

// ── Change password ────────────────────────────────────────────────────────────
router.patch("/buildforge/change-password", requireBuildforge, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) { res.status(400).json({ error: "invalid_request", message: "New password must be at least 8 characters" }); return; }
  const user = req.session.buildforgeUser!;
  const [member] = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.id, user.id));
  if (!member) { res.status(404).json({ error: "not_found" }); return; }

  if (member.passwordHash && currentPassword) {
    const valid = await bcrypt.compare(currentPassword, member.passwordHash);
    if (!valid) { res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" }); return; }
  } else if (member.tempPassword && currentPassword && currentPassword !== member.tempPassword) {
    res.status(401).json({ error: "unauthorized", message: "Current password is incorrect" }); return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.update(buildforgeTeamTable).set({ passwordHash: hashed, tempPassword: null, mustChangePassword: false }).where(eq(buildforgeTeamTable.id, user.id));
  req.session.buildforgeUser = { ...user, mustChangePassword: false };
  res.json({ success: true, profileCompleted: member.profileCompleted });
});

// ── Complete profile ───────────────────────────────────────────────────────────
router.patch("/buildforge/profile", requireBuildforge, async (req, res): Promise<void> => {
  const user = req.session.buildforgeUser!;
  const { idNumber, phone, bio } = req.body;
  if (!idNumber || idNumber.trim().length < 4) { res.status(400).json({ error: "invalid_request", message: "ID number is required" }); return; }
  const [updated] = await db.update(buildforgeTeamTable)
    .set({ idNumber: idNumber.trim(), phone: phone?.trim() || null, bio: bio?.trim() || null, profileCompleted: true })
    .where(eq(buildforgeTeamTable.id, user.id)).returning();
  req.session.buildforgeUser = { ...user, profileCompleted: true };
  res.json({ success: true, member: { ...updated, passwordHash: undefined, tempPassword: undefined } });
});

// ── Get own full profile ───────────────────────────────────────────────────────
router.get("/buildforge/profile", requireBuildforge, async (req, res): Promise<void> => {
  const user = req.session.buildforgeUser!;
  const [member] = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.id, user.id));
  if (!member) { res.status(404).json({ error: "not_found" }); return; }
  res.json({ ...member, passwordHash: undefined, tempPassword: undefined });
});

// ── Bank details ───────────────────────────────────────────────────────────────
router.patch("/buildforge/bank-details", requireBuildforge, async (req, res): Promise<void> => {
  const user = req.session.buildforgeUser!;
  const { bankAccountHolder, bankName, bankAccountNumber, bankAccountType, bankBranchCode } = req.body;
  if (!bankAccountHolder || !bankName || !bankAccountNumber) {
    res.status(400).json({ error: "invalid_request", message: "Account holder, bank name and account number are required" }); return;
  }
  await db.update(buildforgeTeamTable)
    .set({ bankAccountHolder: bankAccountHolder.trim(), bankName: bankName.trim(), bankAccountNumber: bankAccountNumber.trim(), bankAccountType: bankAccountType?.trim() || null, bankBranchCode: bankBranchCode?.trim() || null })
    .where(eq(buildforgeTeamTable.id, user.id));
  req.log.info({ memberId: user.id }, "BuildForge member updated bank details");
  res.json({ success: true });
});

// ── My assigned projects ───────────────────────────────────────────────────────
router.get("/buildforge/projects", requireBuildforge, async (req, res): Promise<void> => {
  const user = req.session.buildforgeUser!;
  const projects = await db.select().from(buildforgeProjectsTable)
    .where(eq(buildforgeProjectsTable.assignedMemberId, user.id))
    .orderBy(buildforgeProjectsTable.createdAt);
  res.json(projects);
});

export default router;

// ── Staff CRUD ─────────────────────────────────────────────────────────────────
export const staffBuildforgeRouter: IRouter = Router();

// Team members
staffBuildforgeRouter.get("/staff/buildforge/team", async (req, res): Promise<void> => {
  const members = await db.select().from(buildforgeTeamTable).orderBy(buildforgeTeamTable.createdAt);
  res.json(members.map((m) => ({ ...m, passwordHash: undefined })));
});

staffBuildforgeRouter.post("/staff/buildforge/team", async (req, res): Promise<void> => {
  const { name, email, role, tempPassword } = req.body;
  if (!name || !email || !role) { res.status(400).json({ error: "invalid_request", message: "name, email and role are required" }); return; }
  const existing = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.email, email.toLowerCase().trim()));
  if (existing.length > 0) { res.status(409).json({ error: "conflict", message: "A team member with this email already exists" }); return; }
  const [member] = await db.insert(buildforgeTeamTable).values({ name: name.trim(), email: email.toLowerCase().trim(), role, tempPassword: tempPassword?.trim() || null, isActive: false, mustChangePassword: true }).returning();
  res.status(201).json({ ...member, passwordHash: undefined });
});

staffBuildforgeRouter.patch("/staff/buildforge/team/:id", async (req, res): Promise<void> => {
  const { name, email, role, isActive, tempPassword } = req.body;
  const updates: Record<string, unknown> = {};
  if (name != null) updates.name = name.trim();
  if (email != null) updates.email = email.toLowerCase().trim();
  if (role != null) updates.role = role;
  if (isActive != null) updates.isActive = isActive;
  if (tempPassword != null) { updates.tempPassword = tempPassword.trim() || null; if (tempPassword.trim()) { updates.passwordHash = null; updates.mustChangePassword = true; } }
  const [member] = await db.update(buildforgeTeamTable).set(updates).where(eq(buildforgeTeamTable.id, req.params.id)).returning();
  if (!member) { res.status(404).json({ error: "not_found" }); return; }
  res.json({ ...member, passwordHash: undefined });
});

staffBuildforgeRouter.delete("/staff/buildforge/team/:id", async (req, res): Promise<void> => {
  await db.delete(buildforgeTeamTable).where(eq(buildforgeTeamTable.id, req.params.id));
  res.json({ success: true });
});

// Staff view of bank details
staffBuildforgeRouter.get("/staff/buildforge/team/:id/bank-details", async (req, res): Promise<void> => {
  const [member] = await db.select().from(buildforgeTeamTable).where(eq(buildforgeTeamTable.id, req.params.id));
  if (!member) { res.status(404).json({ error: "not_found" }); return; }
  res.json({ bankAccountHolder: member.bankAccountHolder, bankName: member.bankName, bankAccountNumber: member.bankAccountNumber, bankAccountType: member.bankAccountType, bankBranchCode: member.bankBranchCode });
});

// Projects
staffBuildforgeRouter.get("/staff/buildforge/projects", async (req, res): Promise<void> => {
  const projects = await db.select().from(buildforgeProjectsTable).orderBy(buildforgeProjectsTable.createdAt);
  res.json(projects);
});

staffBuildforgeRouter.post("/staff/buildforge/projects", async (req, res): Promise<void> => {
  const { clientName, clientContact, websiteType, description, assignedMemberId, assignedMemberName, amountRands, notes } = req.body;
  if (!clientName || !websiteType) { res.status(400).json({ error: "invalid_request", message: "Client name and website type are required" }); return; }
  const [project] = await db.insert(buildforgeProjectsTable).values({ clientName: clientName.trim(), clientContact: clientContact?.trim() || null, websiteType, description: description?.trim() || null, assignedMemberId: assignedMemberId || null, assignedMemberName: assignedMemberName?.trim() || null, amountRands: amountRands || null, notes: notes?.trim() || null }).returning();
  res.status(201).json(project);
});

staffBuildforgeRouter.patch("/staff/buildforge/projects/:id", async (req, res): Promise<void> => {
  const { clientName, clientContact, websiteType, description, assignedMemberId, assignedMemberName, status, amountRands, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (clientName != null) updates.clientName = clientName.trim();
  if (clientContact != null) updates.clientContact = clientContact.trim();
  if (websiteType != null) updates.websiteType = websiteType;
  if (description != null) updates.description = description.trim();
  if (assignedMemberId != null) updates.assignedMemberId = assignedMemberId || null;
  if (assignedMemberName != null) updates.assignedMemberName = assignedMemberName.trim() || null;
  if (status != null) updates.status = status;
  if (amountRands != null) updates.amountRands = amountRands || null;
  if (notes != null) updates.notes = notes.trim();
  const [project] = await db.update(buildforgeProjectsTable).set(updates).where(eq(buildforgeProjectsTable.id, req.params.id)).returning();
  if (!project) { res.status(404).json({ error: "not_found" }); return; }
  res.json(project);
});

staffBuildforgeRouter.delete("/staff/buildforge/projects/:id", async (req, res): Promise<void> => {
  await db.delete(buildforgeProjectsTable).where(eq(buildforgeProjectsTable.id, req.params.id));
  res.json({ success: true });
});
