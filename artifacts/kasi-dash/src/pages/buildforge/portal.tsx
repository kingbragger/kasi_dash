import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Code2, Palette, Megaphone, LogOut, User, Briefcase, Globe,
  FileText, CreditCard, CheckCircle2, Clock, AlertCircle,
  Download, ChevronRight, Building2, Loader2, RefreshCw,
} from "lucide-react";

interface Me {
  id: string; name: string; email: string; role: string;
  idNumber?: string; phone?: string; bio?: string;
  bankAccountHolder?: string; bankName?: string;
  bankAccountNumber?: string; bankAccountType?: string; bankBranchCode?: string;
}

interface Project {
  id: string; clientName: string; clientContact?: string;
  websiteType: string; description?: string;
  assignedMemberName?: string; status: string;
  amountRands?: number; notes?: string; createdAt: string;
}

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  Developer: { icon: <Code2 className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Designer:  { icon: <Palette className="w-5 h-5" />, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  Marketer:  { icon: <Megaphone className="w-5 h-5" />, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  "Pending":     { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: <Clock className="w-3 h-3" /> },
  "In Progress": { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <RefreshCw className="w-3 h-3" /> },
  "Completed":   { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  "On Hold":     { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: <AlertCircle className="w-3 h-3" /> },
};

type Tab = "projects" | "bank" | "account";

export default function BuildforgePortal() {
  const [me, setMe] = useState<Me | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("projects");

  // Bank form
  const [bankForm, setBankForm] = useState({ bankAccountHolder: "", bankName: "", bankAccountNumber: "", bankAccountType: "Cheque / Current", bankBranchCode: "" });
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);

  const { toast } = useToast();
  const [, navigate] = useLocation();

  const loadAll = useCallback(async () => {
    const meRes = await fetch("/api/buildforge/me", { credentials: "include" }).then((r) => r.json());
    if (!meRes.isAuthenticated) { navigate("/buildforge/login"); return; }
    if (meRes.mustChangePassword) { navigate("/buildforge/change-password"); return; }
    if (!meRes.profileCompleted) { navigate("/buildforge/complete-profile"); return; }

    const [profileData, projectsData] = await Promise.all([
      fetch("/api/buildforge/profile", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/buildforge/projects", { credentials: "include" }).then((r) => r.json()),
    ]);
    setMe(profileData);
    setProjects(Array.isArray(projectsData) ? projectsData : []);
    if (profileData.bankName) {
      setBankForm({
        bankAccountHolder: profileData.bankAccountHolder || "",
        bankName: profileData.bankName || "",
        bankAccountNumber: profileData.bankAccountNumber || "",
        bankAccountType: profileData.bankAccountType || "Cheque / Current",
        bankBranchCode: profileData.bankBranchCode || "",
      });
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleLogout = async () => {
    await fetch("/api/buildforge/logout", { method: "POST", credentials: "include" });
    toast({ title: "Signed out" });
    navigate("/buildforge/login");
  };

  const saveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaving(true);
    try {
      const res = await fetch("/api/buildforge/bank-details", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(bankForm),
      });
      if (!res.ok) { const d = await res.json(); toast({ title: "Error", description: d.message, variant: "destructive" }); return; }
      setBankSaved(true);
      setTimeout(() => setBankSaved(false), 3000);
      toast({ title: "Bank details saved", description: "Your payment details are on file." });
    } catch { toast({ title: "Failed to save", variant: "destructive" }); }
    finally { setBankSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!me) return null;

  const roleConfig = ROLE_CONFIG[me.role] ?? ROLE_CONFIG.Developer;
  const activeProjects = projects.filter((p) => p.status !== "Completed");
  const completedProjects = projects.filter((p) => p.status === "Completed");
  const hasBankDetails = !!(me.bankName && me.bankAccountNumber);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg p-1.5">
              <img src="/buildforge-logo.png" alt="BuildForge" className="h-7 w-auto" />
            </div>
            <div className="hidden sm:block border-l border-white/10 pl-4">
              <p className="text-xs text-muted-foreground">Team Portal</p>
              <p className="text-sm font-bold text-primary">{me.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10 hover:border-primary gap-2 text-xs" onClick={() => navigate("/buildforge/contract")}>
              <FileText className="w-3.5 h-3.5" /> Contract
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* Welcome card */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-white/5 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${roleConfig.color}`}>
              {roleConfig.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h2 className="text-2xl font-black">{me.name}</h2>
              <Badge className={`text-xs border mt-1 ${roleConfig.color}`}>{me.role}</Badge>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="text-center bg-background/40 rounded-xl px-4 py-3 min-w-[72px]">
              <p className="text-2xl font-black text-primary">{activeProjects.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center bg-background/40 rounded-xl px-4 py-3 min-w-[72px]">
              <p className="text-2xl font-black">{completedProjects.length}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
            <div className={`text-center rounded-xl px-4 py-3 min-w-[72px] ${hasBankDetails ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"}`}>
              <CreditCard className={`w-5 h-5 mx-auto mb-0.5 ${hasBankDetails ? "text-green-400" : "text-destructive"}`} />
              <p className={`text-xs ${hasBankDetails ? "text-green-400" : "text-destructive"}`}>{hasBankDetails ? "Bank Added" : "No Bank"}</p>
            </div>
          </div>
        </motion.div>

        {/* Alert: no bank details */}
        <AnimatePresence>
          {!hasBankDetails && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-yellow-500/5 border border-yellow-500/25 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-yellow-300">Bank details missing</p>
                  <p className="text-xs text-muted-foreground">You will not receive payment until you add your bank account.</p>
                </div>
              </div>
              <Button size="sm" className="bg-yellow-500 text-black font-bold hover:bg-yellow-400 flex-shrink-0" onClick={() => setTab("bank")}>
                Add Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-white/5 rounded-xl p-1">
          {([
            ["projects", <Briefcase className="w-4 h-4" />, "Projects"],
            ["bank",     <CreditCard className="w-4 h-4" />, "Bank Details"],
            ["account",  <User className="w-4 h-4" />, "My Account"],
          ] as const).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === key ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-white"
              }`}>
              {icon} <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ── */}
        {tab === "projects" && (
          <div className="space-y-5">
            {projects.length === 0 ? (
              <div className="bg-card border border-white/5 rounded-2xl p-16 text-center">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="font-bold text-muted-foreground">No projects assigned yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back once the admin assigns you to a project.</p>
              </div>
            ) : (
              <>
                {activeProjects.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Active Projects</p>
                    <div className="space-y-3">
                      {activeProjects.map((p, i) => <ProjectCard key={p.id} project={p} i={i} />)}
                    </div>
                  </div>
                )}
                {completedProjects.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Project History</p>
                    <div className="space-y-3">
                      {completedProjects.map((p, i) => <ProjectCard key={p.id} project={p} i={i} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── BANK TAB ── */}
        {tab === "bank" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-white/5 rounded-2xl p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-lg">Bank Account Details</h3>
                <p className="text-xs text-muted-foreground">Your monthly payment will be sent to this account.</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 mb-6 mt-4 text-sm text-muted-foreground">
              Payments are processed monthly based on work completed. 50% of project earnings go to Kasi Dash and 50% to you.
            </div>

            <form onSubmit={saveBankDetails} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Account Holder Name <span className="text-destructive">*</span></Label>
                <Input required value={bankForm.bankAccountHolder} onChange={(e) => setBankForm((p) => ({ ...p, bankAccountHolder: e.target.value }))}
                  placeholder="Full name as on your bank account"
                  className="bg-background border-white/10 focus-visible:ring-primary h-11" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Bank Name <span className="text-destructive">*</span></Label>
                  <select required value={bankForm.bankName} onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                    className="w-full h-11 px-3 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select bank...</option>
                    {["ABSA", "Capitec Bank", "FNB", "Nedbank", "Standard Bank", "African Bank", "Discovery Bank", "Investec", "TymeBank", "Other"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <select value={bankForm.bankAccountType} onChange={(e) => setBankForm((p) => ({ ...p, bankAccountType: e.target.value }))}
                    className="w-full h-11 px-3 rounded-md bg-background border border-white/10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Cheque / Current</option>
                    <option>Savings</option>
                    <option>Transmission</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Account Number <span className="text-destructive">*</span></Label>
                  <Input required value={bankForm.bankAccountNumber} onChange={(e) => setBankForm((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                    placeholder="e.g. 1234567890" className="bg-background border-white/10 focus-visible:ring-primary h-11 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Branch Code</Label>
                  <Input value={bankForm.bankBranchCode} onChange={(e) => setBankForm((p) => ({ ...p, bankBranchCode: e.target.value }))}
                    placeholder="e.g. 250655" className="bg-background border-white/10 focus-visible:ring-primary h-11 font-mono" />
                </div>
              </div>

              <Button type="submit" disabled={bankSaving || !bankForm.bankAccountHolder || !bankForm.bankName || !bankForm.bankAccountNumber}
                className="w-full h-11 bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2">
                {bankSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : bankSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Bank Details"}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {tab === "account" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl">
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="font-black text-sm mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Account Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Name", me.name],
                  ["Email", me.email],
                  ["Role", me.role],
                  ["Phone", me.phone || "Not set"],
                  ["ID Number", me.idNumber ? me.idNumber.replace(/\d{6}$/, "xxxxxx") : "Not set"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
              </div>
              {me.bio && <p className="text-sm text-muted-foreground mt-4 border-t border-white/5 pt-4">{me.bio}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => navigate("/buildforge/change-password")}
                className="bg-card border border-white/5 hover:border-primary/30 rounded-xl p-4 text-left flex items-center justify-between group transition-colors">
                <div>
                  <p className="font-bold text-sm">Change Password</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Update your login credentials</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => navigate("/buildforge/contract")}
                className="bg-card border border-white/5 hover:border-primary/30 rounded-xl p-4 text-left flex items-center justify-between group transition-colors">
                <div>
                  <p className="font-bold text-sm">Download Contract</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your BuildForge team agreement</p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>

            <div className="bg-card border border-white/5 rounded-xl p-4">
              <a href="https://build-forge-team.lovable.app/" target="_blank" rel="noreferrer"
                className="flex items-center justify-between group">
                <div>
                  <p className="font-bold text-sm">Challenge Platform</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Take on real-world challenges</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, i }: { project: Project; i: number }) {
  const statusCfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG["Pending"];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className="bg-card border border-white/5 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm">{project.clientName}</p>
              <Badge className={`text-xs border flex items-center gap-1 ${statusCfg.color}`}>
                {statusCfg.icon} {project.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{project.websiteType}</p>
          </div>
        </div>
        {project.amountRands && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Project value</p>
            <p className="font-black text-primary">R{project.amountRands.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Your share: R{Math.floor(project.amountRands * 0.5).toLocaleString()}</p>
          </div>
        )}
      </div>
      {project.description && (
        <p className="text-xs text-muted-foreground mt-3 border-t border-white/5 pt-3 leading-relaxed">{project.description}</p>
      )}
      {project.notes && (
        <div className="mt-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 text-xs text-muted-foreground">
          <span className="font-bold text-primary">Note: </span>{project.notes}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Assigned {new Date(project.createdAt).toLocaleDateString("en-ZA", { dateStyle: "medium" })}
      </p>
    </motion.div>
  );
}
