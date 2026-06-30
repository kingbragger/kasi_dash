import { useState, useEffect, useCallback } from "react";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, CheckCircle2, Clock, User, Send, Shield, CreditCard,
  ChevronDown, Search, Code2, Palette, Megaphone, Users,
  Plus, Trash2, Edit2, X, Check, RefreshCw, UserCheck, KeyRound, Copy,
  Briefcase, DollarSign, AlertCircle, Building2, FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BFApplication {
  id: string; fullName: string; businessName: string; contact: string;
  websiteType: string; description: string; status: string;
  assignedTo: string; bankDetails: string; submittedAt: string;
  agreedAt?: string;
}
interface TeamMember {
  id: string; name: string; email: string; role: string;
  tempPassword: string | null; isActive: boolean;
  profileCompleted: boolean; mustChangePassword: boolean; createdAt: string;
  bankName?: string; bankAccountHolder?: string; bankAccountNumber?: string;
  bankAccountType?: string; bankBranchCode?: string;
}
interface Project {
  id: string; clientName: string; clientContact?: string;
  websiteType: string; description?: string;
  assignedMemberId?: string; assignedMemberName?: string;
  status: string; amountRands?: number; notes?: string; createdAt: string;
}

// ── localStorage helpers ───────────────────────────────────────────────────────
function loadApps(): BFApplication[] {
  try { return JSON.parse(localStorage.getItem("bf_applications") || "[]"); } catch { return []; }
}
function saveApps(apps: BFApplication[]) { localStorage.setItem("bf_applications", JSON.stringify(apps)); }
function loadBankPreset(): string { return localStorage.getItem("bf_bank_preset") || ""; }
function saveBankPreset(v: string) { localStorage.setItem("bf_bank_preset", v); }

// ── Constants ─────────────────────────────────────────────────────────────────
const APP_STATUS_OPTIONS = ["New", "Assigned", "In Progress", "Completed"];
const APP_STATUS_COLORS: Record<string, string> = {
  "New":         "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Assigned":    "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Completed":   "bg-green-500/10 text-green-400 border-green-500/20",
};
const PROJECT_STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "On Hold"];
const PROJECT_STATUS_COLORS: Record<string, string> = {
  "Pending":     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Completed":   "bg-green-500/10 text-green-400 border-green-500/20",
  "On Hold":     "bg-orange-500/10 text-orange-400 border-orange-500/20",
};
const WEBSITE_TYPES = ["Starter Website", "Standard Website", "Premium Website", "Custom Project"];
const ROLE_ICONS: Record<string, React.ReactNode> = {
  Developer: <Code2 className="w-3.5 h-3.5" />,
  Designer:  <Palette className="w-3.5 h-3.5" />,
  Marketer:  <Megaphone className="w-3.5 h-3.5" />,
};
const ROLE_COLORS: Record<string, string> = {
  Developer: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Designer:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Marketer:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function genPassword(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6) + "@1";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StaffBuildForge() {
  const [tab, setTab] = useState<"applications" | "projects" | "team">("applications");

  // Applications state
  const [apps, setApps] = useState<BFApplication[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bankPreset, setBankPreset] = useState(loadBankPreset());
  const [presetSaved, setPresetSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sendingBank, setSendingBank] = useState<string | null>(null);
  const [customBank, setCustomBank] = useState("");
  const [showContract, setShowContract] = useState<string | null>(null);

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({ name: "", email: "", role: "Developer", tempPassword: "" });
  const [savingMember, setSavingMember] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newlyCreated, setNewlyCreated] = useState<{ name: string; email: string; tempPassword: string } | null>(null);
  const [viewingBankId, setViewingBankId] = useState<string | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({ clientName: "", clientContact: "", websiteType: "Starter Website", description: "", assignedMemberId: "", amountRands: "", notes: "" });
  const [savingProject, setSavingProject] = useState(false);

  const { toast } = useToast();

  useEffect(() => { setApps(loadApps()); }, []);

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    const res = await fetch("/api/staff/buildforge/team", { credentials: "include" });
    if (res.ok) setTeam(await res.json());
    setTeamLoading(false);
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    const res = await fetch("/api/staff/buildforge/projects", { credentials: "include" });
    if (res.ok) setProjects(await res.json());
    setProjectsLoading(false);
  }, []);

  useEffect(() => { loadTeam(); loadProjects(); }, [loadTeam, loadProjects]);

  // ── Applications helpers ──────────────────────────────────────────────────
  const update = (id: string, patch: Partial<BFApplication>) => {
    const updated = apps.map((a) => (a.id === id ? { ...a, ...patch } : a));
    saveApps(updated); setApps(updated);
  };
  const saveBankDetails = (id: string) => {
    const details = customBank || bankPreset;
    if (!details.trim()) return;
    update(id, { bankDetails: details });
    setSendingBank(null); setCustomBank("");
  };
  const savePreset = () => {
    saveBankPreset(bankPreset); setPresetSaved(true);
    setTimeout(() => setPresetSaved(false), 2000);
  };
  const filtered = apps.filter((a) => {
    const matchSearch = [a.fullName, a.businessName, a.contact, a.websiteType].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const counts: Record<string, number> = { All: apps.length };
  APP_STATUS_OPTIONS.forEach((s) => { counts[s] = apps.filter((a) => a.status === s).length; });
  const activeTeam = team.filter((m) => m.isActive);

  // ── Team helpers ──────────────────────────────────────────────────────────
  const openNewMember = () => {
    setEditingMember(null);
    setMemberForm({ name: "", email: "", role: "Developer", tempPassword: genPassword() });
    setShowMemberForm(true);
  };
  const openEditMember = (m: TeamMember) => {
    setEditingMember(m); setMemberForm({ name: m.name, email: m.email, role: m.role, tempPassword: "" });
    setShowMemberForm(true);
  };
  const saveMember = async () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;
    setSavingMember(true);
    try {
      const isEdit = !!editingMember;
      const url = isEdit ? `/api/staff/buildforge/team/${editingMember.id}` : "/api/staff/buildforge/team";
      const body: Record<string, unknown> = { name: memberForm.name, email: memberForm.email, role: memberForm.role };
      if (memberForm.tempPassword) body.tempPassword = memberForm.tempPassword;
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { toast({ title: "Error", description: json.message ?? "Failed to save member", variant: "destructive" }); return; }
      if (!isEdit && memberForm.tempPassword) setNewlyCreated({ name: memberForm.name, email: memberForm.email, tempPassword: memberForm.tempPassword });
      toast({ title: isEdit ? "Member updated" : "Member added" });
      setShowMemberForm(false); setEditingMember(null);
      await loadTeam();
    } catch { toast({ title: "Error", description: "Failed to save", variant: "destructive" }); }
    finally { setSavingMember(false); }
  };
  const toggleActive = async (m: TeamMember) => {
    await fetch(`/api/staff/buildforge/team/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isActive: !m.isActive }) });
    toast({ title: m.isActive ? "Account deactivated" : "Account activated" });
    await loadTeam();
  };
  const deleteMember = async (id: string) => {
    if (!confirm("Delete this team member? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/staff/buildforge/team/${id}`, { method: "DELETE", credentials: "include" });
    toast({ title: "Team member removed" });
    await loadTeam(); setDeletingId(null);
  };
  const resetTempPassword = async (m: TeamMember) => {
    const pw = genPassword();
    await fetch(`/api/staff/buildforge/team/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ tempPassword: pw }) });
    setNewlyCreated({ name: m.name, email: m.email, tempPassword: pw });
    toast({ title: "Temporary password reset" });
    await loadTeam();
  };
  const copyText = (text: string, label: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied", description: `${label} copied` }); };

  // ── Projects helpers ──────────────────────────────────────────────────────
  const openNewProject = () => {
    setEditingProject(null);
    setProjectForm({ clientName: "", clientContact: "", websiteType: "Starter Website", description: "", assignedMemberId: "", amountRands: "", notes: "" });
    setShowProjectForm(true);
  };
  const openEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({ clientName: p.clientName, clientContact: p.clientContact || "", websiteType: p.websiteType, description: p.description || "", assignedMemberId: p.assignedMemberId || "", amountRands: p.amountRands?.toString() || "", notes: p.notes || "" });
    setShowProjectForm(true);
  };
  const saveProject = async () => {
    if (!projectForm.clientName.trim() || !projectForm.websiteType) return;
    setSavingProject(true);
    try {
      const assignedMember = team.find((m) => m.id === projectForm.assignedMemberId);
      const body: Record<string, unknown> = {
        clientName: projectForm.clientName.trim(),
        clientContact: projectForm.clientContact.trim() || null,
        websiteType: projectForm.websiteType,
        description: projectForm.description.trim() || null,
        assignedMemberId: projectForm.assignedMemberId || null,
        assignedMemberName: assignedMember?.name || null,
        amountRands: projectForm.amountRands ? parseInt(projectForm.amountRands) : null,
        notes: projectForm.notes.trim() || null,
      };
      const isEdit = !!editingProject;
      const url = isEdit ? `/api/staff/buildforge/projects/${editingProject.id}` : "/api/staff/buildforge/projects";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); toast({ title: "Error", description: d.message, variant: "destructive" }); return; }
      toast({ title: isEdit ? "Project updated" : "Project created" });
      setShowProjectForm(false); setEditingProject(null);
      await loadProjects();
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSavingProject(false); }
  };
  const updateProjectStatus = async (id: string, status: string) => {
    await fetch(`/api/staff/buildforge/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) });
    await loadProjects();
  };
  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/staff/buildforge/projects/${id}`, { method: "DELETE", credentials: "include" });
    toast({ title: "Project deleted" });
    await loadProjects();
  };

  // ── Project stats ─────────────────────────────────────────────────────────
  const totalRevenue = projects.filter((p) => p.status === "Completed").reduce((s, p) => s + (p.amountRands ?? 0), 0);
  const kasiShare = Math.floor(totalRevenue * 0.5);

  return (
    <StaffLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="inline-block bg-white rounded-xl p-2">
            <img src="/buildforge-logo.png" alt="BuildForge" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-black">BuildForge Admin</h1>
        </div>
        <p className="text-muted-foreground">Manage website applications, assigned projects and your core team.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/5">
        {([
          ["applications", <Globe className="w-4 h-4" />, "Applications", apps.length],
          ["projects",     <Briefcase className="w-4 h-4" />, "Projects", projects.length],
          ["team",         <Users className="w-4 h-4" />, "Team Members", activeTeam.length],
        ] as const).map(([key, icon, label, count]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors border-b-2 -mb-px ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"}`}>
            {icon} {label}
            {(count as number) > 0 && <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${tab === key ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* ── APPLICATIONS TAB ── */}
      {tab === "applications" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {["All", ...APP_STATUS_OPTIONS].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-2xl p-4 border text-left transition-all ${statusFilter === s ? "border-primary bg-primary/10" : "border-white/5 bg-card hover:border-primary/30"}`}>
                <p className={`text-2xl font-black ${statusFilter === s ? "text-primary" : ""}`}>{counts[s] ?? 0}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s}</p>
              </button>
            ))}
          </div>

          <div className="bg-card border border-primary/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Bank Account Preset</h2>
              <span className="text-xs text-muted-foreground ml-1">Saved to quickly send to clients</span>
            </div>
            <div className="flex gap-3">
              <textarea value={bankPreset} onChange={(e) => setBankPreset(e.target.value)}
                placeholder={"Bank: FNB\nAccount Name: BuildForge\nAccount Number: 123456789\nBranch Code: 250655\nReference: Your Business Name"}
                rows={4} className="flex-1 px-3 py-2 rounded-xl bg-background/50 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono" />
              <Button onClick={savePreset} className="self-end h-10 bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2">
                {presetSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Preset"}
              </Button>
            </div>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, business or website type..."
              className="pl-9 bg-card border-white/10 focus-visible:ring-primary" />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">{apps.length === 0 ? "No applications yet" : "No results found"}</p>
              <p className="text-sm mt-1">{apps.length === 0 ? "Applications submitted via the BuildForge page will appear here." : "Try adjusting your search."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app, i) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{app.businessName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${APP_STATUS_COLORS[app.status] ?? "bg-white/5 text-muted-foreground border-white/10"}`}>{app.status}</span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{app.websiteType}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.fullName} &middot; {app.contact}</p>
                    </div>
                    {app.assignedTo && (
                      <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs font-medium text-primary">
                        <Shield className="w-3 h-3" /> {app.assignedTo}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded === app.id ? "rotate-180" : ""}`} />
                  </div>
                  {expanded === app.id && (
                    <div className="border-t border-white/5 p-5 space-y-5">
                      <div className="bg-background/40 rounded-xl p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Business Description</p>
                        <p className="text-sm leading-relaxed">{app.description || "No description provided."}</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Project Status</label>
                          <select value={app.status} onChange={(e) => update(app.id, { status: e.target.value })}
                            className="w-full h-10 px-3 rounded-xl bg-background/50 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            {APP_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5"><User className="w-3 h-3" /> Assign Team Member</label>
                          <select value={app.assignedTo} onChange={(e) => update(app.id, { assignedTo: e.target.value, status: e.target.value ? (app.status === "New" ? "Assigned" : app.status) : app.status })}
                            className="w-full h-10 px-3 rounded-xl bg-background/50 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Unassigned</option>
                            {activeTeam.map((m) => <option key={m.id} value={m.name}>{m.name} ({m.role})</option>)}
                          </select>
                        </div>
                      </div>
                      {app.assignedTo && (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-primary">{app.assignedTo}</p>
                            <p className="text-xs text-muted-foreground">BuildForge Core Team Member</p>
                          </div>
                        </div>
                      )}
                      <div className="border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /><p className="text-sm font-bold">Bank Details for Client</p></div>
                          {!sendingBank && (
                            <Button size="sm" onClick={() => { setSendingBank(app.id); setCustomBank(bankPreset); }}
                              className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:brightness-110 gap-1.5">
                              <Send className="w-3 h-3" /> {app.bankDetails ? "Update" : "Send Bank Details"}
                            </Button>
                          )}
                        </div>
                        {app.bankDetails && sendingBank !== app.id && (
                          <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Sent to client</p>
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">{app.bankDetails}</pre>
                          </div>
                        )}
                        {sendingBank === app.id && (
                          <div className="space-y-3">
                            <textarea value={customBank} onChange={(e) => setCustomBank(e.target.value)} rows={5}
                              className="w-full px-3 py-2 rounded-xl bg-background/50 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono" />
                            <div className="flex gap-2">
                              <Button onClick={() => saveBankDetails(app.id)} className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:brightness-110 gap-1.5">
                                <Send className="w-3 h-3" /> Confirm and Send
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSendingBank(null); setCustomBank(""); }} className="h-9 px-4 text-xs text-muted-foreground hover:text-white">Cancel</Button>
                            </div>
                          </div>
                        )}
                        {!app.bankDetails && sendingBank !== app.id && <p className="text-xs text-muted-foreground">No bank details sent yet.</p>}
                      </div>
                      {/* ── Contract section ── */}
                      <div className="border border-white/5 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowContract(showContract === app.id ? null : app.id)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold">Client Contract</span>
                            {app.agreedAt
                              ? <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Agreed</span>
                              : <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5">Pending acceptance</span>
                            }
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showContract === app.id ? "rotate-180" : ""}`} />
                        </button>
                        {showContract === app.id && (
                          <div className="border-t border-white/5">
                            <ClientContract
                              app={app}
                              onAccept={() => update(app.id, { agreedAt: new Date().toISOString() })}
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">Submitted {new Date(app.submittedAt).toLocaleDateString("en-ZA", { dateStyle: "long" })}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PROJECTS TAB ── */}
      {tab === "projects" && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: projects.length, color: "" },
              { label: "Active", value: projects.filter((p) => p.status === "In Progress").length, color: "text-blue-400" },
              { label: "Completed", value: projects.filter((p) => p.status === "Completed").length, color: "text-green-400" },
              { label: "Kasi Share", value: `R${kasiShare.toLocaleString()}`, color: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-white/5 rounded-2xl p-4">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Website Projects</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Create and assign projects to core team members. They see these in their portal.</p>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2" onClick={openNewProject}>
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </div>

          {/* Project form */}
          <AnimatePresence>
            {showProjectForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-primary/20 rounded-2xl p-6 overflow-hidden">
                <h3 className="font-black text-sm mb-4">{editingProject ? "Edit Project" : "New Project"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Client Name *</Label>
                    <Input value={projectForm.clientName} onChange={(e) => setProjectForm((p) => ({ ...p, clientName: e.target.value }))}
                      placeholder="Client or business name" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Client Contact</Label>
                    <Input value={projectForm.clientContact} onChange={(e) => setProjectForm((p) => ({ ...p, clientContact: e.target.value }))}
                      placeholder="Phone or email" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Website Type *</Label>
                    <select value={projectForm.websiteType} onChange={(e) => setProjectForm((p) => ({ ...p, websiteType: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      {WEBSITE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Assign To</Label>
                    <select value={projectForm.assignedMemberId} onChange={(e) => setProjectForm((p) => ({ ...p, assignedMemberId: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">Unassigned</option>
                      {activeTeam.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Project Value (R)</Label>
                    <Input type="number" value={projectForm.amountRands} onChange={(e) => setProjectForm((p) => ({ ...p, amountRands: e.target.value }))}
                      placeholder="e.g. 2500" className="bg-background border-white/10 focus-visible:ring-primary" />
                    {projectForm.amountRands && (
                      <p className="text-xs text-muted-foreground">Member receives: R{Math.floor(parseInt(projectForm.amountRands) * 0.5).toLocaleString()} | Kasi Dash: R{Math.floor(parseInt(projectForm.amountRands) * 0.5).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Notes for Member</Label>
                    <Input value={projectForm.notes} onChange={(e) => setProjectForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any notes to show the member..." className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <textarea value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3} placeholder="Project brief and requirements..."
                      className="w-full px-3 py-2 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                    disabled={savingProject || !projectForm.clientName.trim()} onClick={saveProject}>
                    {savingProject ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />{editingProject ? "Save Changes" : "Create Project"}</>}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowProjectForm(false); setEditingProject(null); }}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects list */}
          {projectsLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-card/40 animate-pulse border border-white/5" />)}</div>
          ) : projects.length === 0 ? (
            <div className="bg-card border border-white/5 rounded-2xl p-16 text-center">
              <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">No projects yet. Create one and assign it to a team member.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-white/5 rounded-xl p-5">
                  <div className="flex items-start gap-4 justify-between flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm">{p.clientName}</p>
                          <Badge className={`text-xs border ${PROJECT_STATUS_COLORS[p.status] ?? ""}`}>{p.status}</Badge>
                          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{p.websiteType}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {p.clientContact && <p className="text-xs text-muted-foreground">{p.clientContact}</p>}
                          {p.assignedMemberName && (
                            <span className="text-xs flex items-center gap-1 text-primary">
                              <Shield className="w-3 h-3" /> {p.assignedMemberName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.amountRands && (
                        <div className="text-right mr-2">
                          <p className="text-sm font-black text-primary">R{p.amountRands.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">KD: R{Math.floor(p.amountRands * 0.5).toLocaleString()}</p>
                        </div>
                      )}
                      <select value={p.status} onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                        className="h-8 px-2 rounded-lg bg-background border border-white/10 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                        {PROJECT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => openEditProject(p)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => deleteProject(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground mt-3 border-t border-white/5 pt-3">{p.description}</p>}
                  {p.notes && (
                    <div className="mt-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 text-xs">
                      <span className="font-bold text-primary">Note to member: </span>{p.notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TEAM TAB ── */}
      {tab === "team" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Core Team</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Create accounts for developers, designers and marketers.</p>
            </div>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2" onClick={openNewMember}>
              <Plus className="w-4 h-4" /> Add Member
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["Developer", "Designer", "Marketer"] as const).map((role) => {
              const total = team.filter((m) => m.role === role).length;
              const active = team.filter((m) => m.role === role && m.isActive).length;
              return (
                <div key={role} className="bg-card border border-white/5 rounded-2xl p-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${ROLE_COLORS[role]}`}>{ROLE_ICONS[role]}</div>
                  <p className="text-2xl font-black">{total}</p>
                  <p className="text-xs text-muted-foreground">{role}s</p>
                  {active > 0 && <p className="text-xs text-green-400 mt-0.5">{active} active</p>}
                </div>
              );
            })}
          </div>

          {/* Credentials banner */}
          <AnimatePresence>
            {newlyCreated && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-primary/10 border border-primary/25 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-bold text-primary flex items-center gap-2"><KeyRound className="w-4 h-4" /> Share these credentials with {newlyCreated.name}</p>
                  <button onClick={() => setNewlyCreated(null)}><X className="w-4 h-4 text-muted-foreground hover:text-white" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Login URL</p>
                    <p className="text-xs font-mono">/buildforge/login</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono truncate">{newlyCreated.email}</p>
                      <button onClick={() => copyText(newlyCreated.email, "Email")}><Copy className="w-3 h-3 text-muted-foreground hover:text-primary" /></button>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Temp Password</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-bold text-primary">{newlyCreated.tempPassword}</p>
                      <button onClick={() => copyText(newlyCreated.tempPassword, "Password")}><Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" /></button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">They must change this password on first login and complete their profile (ID number required).</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add / Edit form */}
          <AnimatePresence>
            {showMemberForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="bg-card border border-primary/20 rounded-2xl p-6 overflow-hidden">
                <h3 className="font-black text-sm mb-4">{editingMember ? "Edit Team Member" : "New Team Member"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name *</Label>
                    <Input value={memberForm.name} onChange={(e) => setMemberForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Thabo Mokoena" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email *</Label>
                    <Input type="email" value={memberForm.email} onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="team@email.com" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Role *</Label>
                    <select value={memberForm.role} onChange={(e) => setMemberForm((p) => ({ ...p, role: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Marketer">Marketer</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Temporary Password {!editingMember && "*"}</Label>
                    <div className="flex gap-2">
                      <Input value={memberForm.tempPassword} onChange={(e) => setMemberForm((p) => ({ ...p, tempPassword: e.target.value }))}
                        placeholder={editingMember ? "Leave blank to keep existing" : "Auto-generated"}
                        className="bg-background border-white/10 focus-visible:ring-primary font-mono" />
                      <Button type="button" variant="outline" size="sm" className="flex-shrink-0 border-white/10"
                        onClick={() => setMemberForm((p) => ({ ...p, tempPassword: genPassword() }))}>
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                    disabled={savingMember || !memberForm.name.trim() || !memberForm.email.trim()} onClick={saveMember}>
                    {savingMember ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />{editingMember ? "Save Changes" : "Create Account"}</>}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowMemberForm(false); setEditingMember(null); }}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Team list */}
          {teamLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-card/40 animate-pulse border border-white/5" />)}</div>
          ) : team.length === 0 ? (
            <div className="bg-card border border-white/5 rounded-2xl p-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">No team members yet. Add your first member above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {team.map((member, i) => (
                <motion.div key={member.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${ROLE_COLORS[member.role] ?? "bg-white/5 text-white border-white/10"}`}>
                      {ROLE_ICONS[member.role] ?? <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{member.name}</p>
                        <Badge className={`text-xs border ${ROLE_COLORS[member.role] ?? ""}`}>{member.role}</Badge>
                        {member.isActive
                          ? <Badge className="text-xs border bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Active</Badge>
                          : <Badge className="text-xs border bg-white/5 text-muted-foreground border-white/10">Inactive</Badge>}
                        {member.profileCompleted
                          ? <Badge className="text-xs border bg-blue-500/10 text-blue-400 border-blue-500/20">Profile Done</Badge>
                          : <Badge className="text-xs border bg-orange-500/10 text-orange-400 border-orange-500/20">Profile Pending</Badge>}
                        {member.bankName
                          ? <Badge className="text-xs border bg-green-500/10 text-green-400 border-green-500/20 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Bank Added</Badge>
                          : <Badge className="text-xs border bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No Bank</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground hidden sm:block">{member.isActive ? "Active" : "Inactive"}</span>
                        <Switch checked={member.isActive} onCheckedChange={() => toggleActive(member)} />
                      </div>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-blue-400" title="View bank details"
                        onClick={() => setViewingBankId(viewingBankId === member.id ? null : member.id)}>
                        <Building2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-yellow-400" title="Reset temp password"
                        onClick={() => resetTempPassword(member)}>
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => openEditMember(member)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMember(member.id)} disabled={deletingId === member.id}>
                        {deletingId === member.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  {/* Bank details panel */}
                  {viewingBankId === member.id && (
                    <div className="border-t border-white/5 px-5 py-4 bg-background/20">
                      <p className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Bank Account Details</p>
                      {member.bankName ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          {[
                            ["Account Holder", member.bankAccountHolder],
                            ["Bank", member.bankName],
                            ["Account Number", member.bankAccountNumber],
                            ["Branch Code", member.bankBranchCode || "Not set"],
                            ["Account Type", member.bankAccountType || "Not set"],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-xs text-muted-foreground">{label}</p>
                              <p className="font-mono font-medium text-sm mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">This member has not added their bank details yet.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </StaffLayout>
  );
}

// ── Client Contract Component ─────────────────────────────────────────────────
interface ClientContractProps {
  app: BFApplication;
  onAccept: () => void;
}

function ClientContract({ app, onAccept }: ClientContractProps) {
  const [checked, setChecked] = useState(false);
  const agreed = !!app.agreedAt;
  const agreementDate = agreed
    ? new Date(app.agreedAt!).toLocaleDateString("en-ZA", { dateStyle: "long" })
    : new Date().toLocaleDateString("en-ZA", { dateStyle: "long" });

  const handlePrint = () => {
    const el = document.getElementById(`contract-print-${app.id}`);
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>BuildForge Client Contract</title>
      <style>
        body { font-family: Georgia, serif; color: #111; padding: 48px 56px; line-height: 1.75; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
        h3 { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #b8952a; border-left: 4px solid #b8952a; padding-left: 10px; margin-top: 24px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #b8952a; padding-bottom: 20px; margin-bottom: 28px; }
        .brand { font-size: 18px; font-weight: 900; color: #b8952a; font-family: Arial, sans-serif; letter-spacing: 1px; }
        .sub { font-size: 11px; color: #555; font-family: Arial, sans-serif; }
        .info-box { background: #f8f6f0; border: 1px solid #e0d5b0; border-radius: 8px; padding: 14px 18px; margin: 12px 0; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
        .agreed { background: #f0fff4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-top: 24px; font-size: 13px; color: #166534; }
        .sig { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; border-top: 2px solid #e0d5b0; padding-top: 24px; }
        .sig-line { border-bottom: 1.5px solid #333; height: 48px; margin-bottom: 8px; }
        .footer { border-top: 1px solid #e0d5b0; margin-top: 40px; padding-top: 12px; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }
      </style></head><body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-5 space-y-5">
      {/* Printable contract body */}
      <div id={`contract-print-${app.id}`}>
        {/* Header */}
        <div style={{ fontFamily: "Georgia, serif", color: "#111" }}>
          <div className="flex items-center justify-between pb-5 mb-6 border-b-2 border-primary/40">
            <div className="flex items-center gap-3">
              <div className="bg-black rounded-xl p-2">
                <img src="/buildforge-logo.png" alt="BuildForge" className="h-9 w-auto" />
              </div>
              <div>
                <p className="font-black text-base text-primary tracking-wide" style={{ fontFamily: "Arial, sans-serif" }}>BUILDFORGE</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "Arial, sans-serif" }}>A Kasi Dash Initiative</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">unity@kasidash.co.za</p>
              <p className="text-xs text-muted-foreground">kasidash.co.za</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-black uppercase tracking-[0.15em]" style={{ fontFamily: "Arial, sans-serif" }}>Website Development Agreement</h2>
            <p className="text-xs text-muted-foreground mt-1">Service Agreement | BuildForge by Kasi Dash</p>
          </div>

          {/* Client info */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ["Applicant Name", app.fullName],
              ["Business Name", app.businessName],
              ["Project Type", app.websiteType],
              ["Date of Agreement", agreementDate],
              ["Contact", app.contact],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold">{val}</p>
              </div>
            ))}
          </div>

          {/* Terms */}
          <ContractSection title="1. Payment Terms">
            <ul className="space-y-2 text-sm text-foreground">
              {[
                "A 50% deposit is required before any project work begins.",
                "The remaining 50% final payment is required before the final website is delivered.",
                "No work will commence without receipt of the deposit.",
                "The deposit is non-refundable if the project is cancelled after work has begun.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </ContractSection>

          <ContractSection title="2. Delivery and Revisions">
            <ul className="space-y-2 text-sm text-foreground">
              {[
                "Delivery timelines depend on the scope and complexity of the project and will be communicated upon agreement.",
                "2 to 3 minor revisions are included at no additional cost.",
                "Major changes outside the agreed scope may incur additional charges.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </ContractSection>

          <ContractSection title="3. Ownership">
            <p className="text-sm text-foreground">
              Full ownership of the completed website is transferred to the client upon receipt of the final payment. Until final payment is made, BuildForge retains all intellectual property rights to the work produced.
            </p>
          </ContractSection>

          <ContractSection title="4. Project Scope">
            {app.description ? (
              <p className="text-sm text-foreground leading-relaxed">{app.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No project description provided.</p>
            )}
          </ContractSection>

          {/* Agreed stamp */}
          {agreed && (
            <div className="bg-green-500/10 border border-green-500/25 rounded-xl px-4 py-3 flex items-center gap-3 mt-4">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-300">Client agreed to these terms</p>
                <p className="text-xs text-muted-foreground">{agreementDate}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acceptance section */}
      {!agreed ? (
        <div className="border-t border-white/5 pt-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              I confirm that <strong className="text-white">{app.fullName}</strong> has agreed to the BuildForge Website Development Terms above.
            </span>
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!checked}
              onClick={onAccept}
              className="bg-green-600 hover:bg-green-500 text-white font-bold gap-2 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Acceptance
            </Button>
            <Button size="sm" variant="outline" className="border-white/10 hover:border-primary gap-2" onClick={handlePrint}>
              <FileText className="w-4 h-4" /> Print / Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t border-white/5 pt-4 flex justify-end">
          <Button size="sm" variant="outline" className="border-white/10 hover:border-primary gap-2" onClick={handlePrint}>
            <FileText className="w-4 h-4" /> Print / Download
          </Button>
        </div>
      )}
    </div>
  );
}

function ContractSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-primary border-l-4 border-primary pl-3 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}
