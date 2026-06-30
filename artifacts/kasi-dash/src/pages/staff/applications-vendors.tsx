import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users, ChevronDown, ChevronUp, Banknote, CheckCircle2,
  Copy, Mail, Store, X, KeyRound,
} from "lucide-react";
import { useListVendorApplications } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved:  "bg-green-500/10 text-green-400 border-green-500/20",
  rejected:  "bg-red-500/10 text-red-400 border-red-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  unpaid:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
  paid:    "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid:  "Awaiting Payment",
  paid:    "Payment Confirmed",
  pending: "Payment Pending",
};

function loadBankPreset(): string {
  try { return localStorage.getItem("bf_bank_preset") || ""; } catch { return ""; }
}

interface ActivatedCreds { email: string; tempPassword: string; }

export default function StaffVendorApplications() {
  const { data: apps, isLoading } = useListVendorApplications();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [bankPreset, setBankPreset] = useState("");
  const [activatedCreds, setActivatedCreds] = useState<Record<string, ActivatedCreds>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => { setBankPreset(loadBankPreset()); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id + "_status");
    try {
      const res = await fetch(`/api/staff/applications/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes: notes[id] }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Updated", description: `Application marked as ${status}` });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/applications/vendors"] });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally { setUpdating(null); }
  };

  const markPaymentReceived = async (id: string) => {
    setUpdating(id + "_pay");
    try {
      const res = await fetch(`/api/staff/applications/vendors/${id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentStatus: "paid" }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Payment Confirmed", description: "You can now activate the vendor account." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/applications/vendors"] });
    } catch {
      toast({ title: "Error", description: "Failed to update payment status", variant: "destructive" });
    } finally { setUpdating(null); }
  };

  const activateVendor = async (id: string) => {
    setUpdating(id + "_activate");
    try {
      const res = await fetch(`/api/staff/applications/vendors/${id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.message ?? "Failed to activate vendor", variant: "destructive" });
        return;
      }
      setActivatedCreds((prev) => ({ ...prev, [id]: { email: json.email, tempPassword: json.tempPassword } }));
      toast({ title: "Vendor Activated!", description: "Account and catalogue created. Share the credentials below." });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/applications/vendors"] });
    } catch {
      toast({ title: "Error", description: "Failed to activate vendor", variant: "destructive" });
    } finally { setUpdating(null); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard` });
  };

  const paidCount   = apps?.filter((a) => (a as any).paymentStatus === "paid").length ?? 0;
  const approvedCount = apps?.filter((a) => a.status === "approved").length ?? 0;

  return (
    <StaffLayout>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-6 h-6 text-secondary" />
            <h1 className="text-3xl font-black">Vendor Applications</h1>
          </div>
          <p className="text-muted-foreground">Review applicants, confirm payment, then activate their store account</p>
        </div>
        {apps && apps.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-card border border-green-500/20 rounded-xl px-4 py-2 text-sm">
              <span className="text-muted-foreground">Paid </span>
              <span className="font-black text-green-400">{paidCount}</span>
              <span className="text-muted-foreground"> / {apps.length}</span>
            </div>
            <div className="bg-card border border-primary/20 rounded-xl px-4 py-2 text-sm">
              <span className="text-muted-foreground">Approved </span>
              <span className="font-black text-primary">{approvedCount}</span>
            </div>
          </div>
        )}
      </div>

      {!bankPreset && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-sm">
          <Banknote className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <span className="text-yellow-300">No bank details preset saved. Go to <strong>BuildForge Admin</strong> to save your banking details so you can copy them quickly when contacting applicants.</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}
        </div>
      ) : !apps || apps.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No vendor applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app, i) => {
            const paymentStatus = (app as any).paymentStatus as string ?? "unpaid";
            const isPaid = paymentStatus === "paid";
            const creds = activatedCreds[app.id];

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-white/5 rounded-2xl overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                      {app.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold">{app.businessName}</p>
                      <p className="text-sm text-muted-foreground">{app.contactName} · {app.businessType} · {app.township}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge className={`text-xs border ${PAYMENT_COLORS[paymentStatus] ?? PAYMENT_COLORS.unpaid}`}>
                      {PAYMENT_LABELS[paymentStatus] ?? paymentStatus}
                    </Badge>
                    <Badge className={`capitalize text-xs border ${STATUS_COLORS[app.status] ?? ""}`}>
                      {app.status}
                    </Badge>
                    {expanded === app.id
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {expanded === app.id && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">

                    {/* Activated credentials banner */}
                    <AnimatePresence>
                      {creds && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="bg-green-500/10 border border-green-500/25 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                              <Store className="w-4 h-4" /> Vendor account activated! Share these login details:
                            </p>
                            <button onClick={() => setActivatedCreds((p) => { const n = { ...p }; delete n[app.id]; return n; })}>
                              <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Login URL</p>
                              <p className="text-xs font-mono text-white">/vendor/login</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Email</p>
                              <p className="text-xs font-mono text-white break-all">{creds.email}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3 sm:col-span-2">
                              <p className="text-xs text-muted-foreground mb-1">Temporary Password</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono text-primary font-bold">{creds.tempPassword}</p>
                                <button onClick={() => copyToClipboard(creds.tempPassword, "Password")} className="text-muted-foreground hover:text-primary">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <a
                            href={`mailto:${creds.email}?subject=Your Kasi Dash Vendor Account is Active&body=Hi ${app.contactName},%0A%0AGreat news! Your vendor account for ${app.businessName} on Kasi Dash is now active.%0A%0AYou can log in and start managing your products here:%0ALogin page: /vendor/login%0AEmail: ${creds.email}%0ATemporary password: ${creds.tempPassword}%0A%0APlease change your password after your first login.%0A%0AWe will make your catalogue visible on the shop once you have added your products.%0A%0AKind regards,%0AKasi Dash Team`}
                            className="text-xs text-secondary hover:underline flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3" /> Send credentials via email
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Applicant details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {[
                        ["Email",         app.email],
                        ["Phone",         app.phone],
                        ["Business Type", app.businessType],
                        ["Township",      app.township],
                        ["Website",       app.website ?? "N/A"],
                        ["Applied",       new Date(app.createdAt).toLocaleDateString("en-ZA")],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{label}</p>
                          <p className="font-medium break-all">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Banking details panel */}
                    <div className="bg-background/50 border border-white/5 rounded-xl p-4 space-y-3">
                      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
                        <Banknote className="w-3.5 h-3.5" /> Send Banking Details
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white font-medium">{app.email}</span>
                        <button onClick={() => copyToClipboard(app.email, "Email")} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copy email
                        </button>
                        <a
                          href={`mailto:${app.email}?subject=Kasi Dash Vendor Listing - Banking Details&body=Hi ${app.contactName},%0A%0AThank you for applying to partner with Kasi Dash.%0A%0ATo activate your listing for ${app.businessName}, please make a payment of R250/month to the following account:%0A%0A${encodeURIComponent(bankPreset || "[Paste your banking details here]")}%0A%0APlease use your business name as the payment reference.%0A%0AOnce we receive payment, we will activate your catalogue on the Kasi Dash shop.%0A%0AKind regards,%0AKasi Dash Team`}
                          className="text-xs text-secondary hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Open email
                        </a>
                      </div>
                      {bankPreset ? (
                        <div className="bg-card border border-white/5 rounded-xl p-3 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                          {bankPreset}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No bank details preset. Set it in BuildForge Admin.</p>
                      )}
                      {bankPreset && (
                        <Button size="sm" variant="outline" className="border-white/10 gap-1.5 text-xs"
                          onClick={() => copyToClipboard(bankPreset, "Bank details")}>
                          <Copy className="w-3 h-3" /> Copy bank details
                        </Button>
                      )}
                    </div>

                    {/* Payment confirmation */}
                    <div className={`rounded-xl p-4 border ${isPaid ? "bg-green-500/5 border-green-500/15" : "bg-orange-500/5 border-orange-500/15"}`}>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isPaid ? "text-green-400" : "text-orange-400"}`} />
                        Payment Status · R250/month
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`text-xs border ${PAYMENT_COLORS[paymentStatus] ?? PAYMENT_COLORS.unpaid}`}>
                          {PAYMENT_LABELS[paymentStatus] ?? paymentStatus}
                        </Badge>
                        {!isPaid && (
                          <Button
                            size="sm"
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 h-7 text-xs gap-1"
                            disabled={updating === app.id + "_pay"}
                            onClick={() => markPaymentReceived(app.id)}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {updating === app.id + "_pay" ? "Saving…" : "Mark Payment Received"}
                          </Button>
                        )}
                        {isPaid && <span className="text-xs text-green-400">Payment confirmed. Review application and activate store below.</span>}
                      </div>
                    </div>

                    {app.description && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm bg-background/50 rounded-xl p-3 border border-white/5">{app.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Internal Notes</p>
                      <Textarea
                        placeholder="Add notes about this applicant..."
                        value={notes[app.id] ?? app.notes ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        className="bg-background border-white/10 min-h-[80px] text-sm"
                      />
                    </div>

                    {/* Status buttons + Activate */}
                    <div className="flex flex-wrap gap-2 items-center">
                      {["reviewing", "approved", "rejected"].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={app.status === status ? "default" : "outline"}
                          disabled={updating === app.id + "_status"}
                          onClick={() => updateStatus(app.id, status)}
                          className={`capitalize border-white/10 ${
                            status === "approved"  ? "hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30" :
                            status === "rejected"  ? "hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30" :
                            "hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30"
                          }`}
                        >
                          {status}
                        </Button>
                      ))}

                      {isPaid && app.status === "approved" && !creds && (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2 ml-auto"
                          disabled={updating === app.id + "_activate"}
                          onClick={() => activateVendor(app.id)}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          {updating === app.id + "_activate" ? "Activating…" : "Activate Vendor Account"}
                        </Button>
                      )}

                      {!isPaid && app.status === "approved" && (
                        <span className="text-xs text-muted-foreground ml-auto italic">Confirm payment to unlock activation</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
}
