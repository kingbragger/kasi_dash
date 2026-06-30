import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { TrendingUp, Mail, Phone, Wallet, MessageSquare, Clock, RefreshCw, Send, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Submission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  amount: string;
  contactMethod: string;
  message: string | null;
  status: string;
  staffReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: "Pending",    color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  contacted:  { label: "Contacted",  color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20"   },
  interested: { label: "Interested", color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20"  },
  declined:   { label: "Declined",   color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

interface ReplyModalProps {
  submission: Submission;
  onClose: () => void;
  onSaved: (updated: Submission) => void;
}

function ReplyModal({ submission, onClose, onSaved }: ReplyModalProps) {
  const [status, setStatus] = useState(submission.status);
  const [reply, setReply] = useState(submission.staffReply ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/staff/invest/${submission.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staffReply: reply }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="relative bg-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-black">Review Investor</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{submission.fullName} &middot; {submission.amount}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
          <a href={`mailto:${submission.email}`} className="flex items-center gap-2 bg-background/50 rounded-xl px-3 py-2 hover:text-primary transition-colors truncate">
            <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{submission.email}</span>
          </a>
          <a href={`tel:${submission.phone}`} className="flex items-center gap-2 bg-background/50 rounded-xl px-3 py-2 hover:text-primary transition-colors">
            <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            {submission.phone}
          </a>
        </div>

        {submission.message && (
          <div className="mb-5 flex items-start gap-2 bg-background/50 rounded-xl px-4 py-3">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">{submission.message}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-primary/40 transition-colors"
            >
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
            Notes / Reply
          </label>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={4}
            placeholder="Add internal notes or a reply to send..."
            className="w-full bg-background/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/50"
          />
        </div>

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-white/10" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={save} disabled={saving}>
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Save
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function StaffInvest() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Submission | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/invest", { credentials: "include" });
      if (res.ok) setSubmissions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (updated: Submission) => {
    setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const pending    = submissions.filter(s => s.status === "pending").length;
  const interested = submissions.filter(s => s.status === "interested").length;
  const totalValue = submissions.reduce((acc, s) => {
    const n = parseInt(s.amount.replace(/\D/g, ""), 10);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <StaffLayout>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black mb-1">Investor Leads</h1>
          <p className="text-muted-foreground">Investment interest submissions from the public.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="border-white/10 gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads",    value: submissions.length,          icon: TrendingUp, color: "text-primary"      },
          { label: "Pending Review", value: pending,                     icon: Clock,      color: "text-yellow-400"   },
          { label: "Interested",     value: interested,                  icon: Wallet,     color: "text-green-400"    },
          { label: "Potential Value",value: `R ${totalValue.toLocaleString()}`, icon: Wallet, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-5">
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-sm font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-lg font-bold">No submissions yet</p>
          <p className="text-sm text-muted-foreground">Investor interest forms will appear here once submitted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-white/5 rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-black text-base">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString("en-ZA", { dateStyle: "long" })}{" "}
                    at {new Date(s.createdAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={s.status} />
                  <span className="text-sm font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                    {s.amount}
                  </span>
                  <span className="text-xs text-muted-foreground bg-card border border-white/5 rounded-full px-3 py-1">
                    via {s.contactMethod}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <a href={`mailto:${s.email}`} className="hover:text-primary transition-colors truncate">{s.email}</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <a href={`tel:${s.phone}`} className="hover:text-primary transition-colors">{s.phone}</a>
                </div>
              </div>

              {s.message && (
                <div className="mb-3 flex items-start gap-2 bg-background/50 rounded-xl px-4 py-3">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.message}</p>
                </div>
              )}

              {s.staffReply && (
                <div className="mb-3 flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                  <Send className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-primary font-bold mb-1">Staff Notes</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.staffReply}</p>
                    {s.repliedAt && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(s.repliedAt).toLocaleDateString("en-ZA", { dateStyle: "medium" })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-white/10 gap-2 text-xs"
                onClick={() => setActive(s)}
              >
                <Send className="w-3.5 h-3.5" />
                {s.staffReply ? "Edit Notes" : "Add Notes / Reply"}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <ReplyModal
            submission={active}
            onClose={() => setActive(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </StaffLayout>
  );
}
