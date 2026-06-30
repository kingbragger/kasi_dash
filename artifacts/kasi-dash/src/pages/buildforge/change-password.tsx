import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";

export default function BuildforgeChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [me, setMe] = useState<{ name: string; mustChangePassword: boolean } | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch("/api/buildforge/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAuthenticated) { navigate("/buildforge/login"); return; }
        setMe(d);
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/buildforge/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Failed to change password."); return; }
      toast({ title: "Password updated", description: "You are all set." });
      if (!data.profileCompleted) {
        navigate("/buildforge/complete-profile");
      } else {
        navigate("/buildforge/portal");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.07),transparent_65%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black mb-1">Set Your Password</h1>
          <p className="text-muted-foreground text-sm">
            {me?.mustChangePassword
              ? "You are using a temporary password. Please set a new one to continue."
              : "Choose a new password for your account."}
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Current / Temporary Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Your temporary password"
                  className="bg-background border-white/10 focus-visible:ring-primary h-11 pr-10"
                />
                <button type="button" onClick={() => setShowCurrent((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  type={showNext ? "text" : "password"}
                  required
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="bg-background border-white/10 focus-visible:ring-primary h-11 pr-10"
                />
                <button type="button" onClick={() => setShowNext((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Confirm New Password</Label>
              <Input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="bg-background border-white/10 focus-visible:ring-primary h-11"
              />
            </div>

            {next && (
              <div className="space-y-1">
                {[
                  { ok: next.length >= 8, label: "At least 8 characters" },
                  { ok: next === confirm && confirm.length > 0, label: "Passwords match" },
                ].map((check) => (
                  <div key={check.label} className={`flex items-center gap-2 text-xs ${check.ok ? "text-green-400" : "text-muted-foreground"}`}>
                    <CheckCircle2 className={`w-3 h-3 ${check.ok ? "text-green-400" : "text-white/20"}`} />
                    {check.label}
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !current || !next || !confirm}
              className="w-full h-11 bg-primary text-primary-foreground font-bold hover:brightness-110"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set Password and Continue"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
