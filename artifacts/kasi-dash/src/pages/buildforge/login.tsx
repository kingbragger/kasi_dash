import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import KasiDashLogo from "@/components/KasiDashLogo";
import { Code2, Palette, Megaphone, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

type Step = "email" | "password";

export default function BuildforgeLogin() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/buildforge/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Email not recognized.");
        return;
      }
      setStep("password");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/buildforge/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Invalid credentials.");
        return;
      }
      toast({ title: "Welcome back!" });
      if (data.mustChangePassword) {
        navigate("/buildforge/change-password");
      } else if (!data.profileCompleted) {
        navigate("/buildforge/complete-profile");
      } else {
        navigate("/buildforge/portal");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.07),transparent_65%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <img src="/buildforge-logo.png" alt="BuildForge" className="h-10 w-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-1">Team Portal</h1>
          <p className="text-muted-foreground text-sm">Sign in to access your BuildForge workspace</p>

          <div className="flex justify-center gap-3 mt-4">
            {[
              { icon: <Code2 className="w-3.5 h-3.5" />, label: "Developers" },
              { icon: <Palette className="w-3.5 h-3.5" />, label: "Designers" },
              { icon: <Megaphone className="w-3.5 h-3.5" />, label: "Marketers" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-1.5 bg-card border border-white/5 rounded-full px-3 py-1 text-xs text-muted-foreground">
                {r.icon} {r.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                onSubmit={handleCheckEmail}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-background border-white/10 focus-visible:ring-primary h-11"
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-11 bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Not registered? Contact your admin to get added.
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-0.5">Signing in as</p>
                  <p className="font-bold text-primary">{email}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-background border-white/10 focus-visible:ring-primary h-11 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Use the temporary password your admin provided.</p>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full h-11 bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setPassword(""); setError(""); }}
                  className="w-full text-xs text-muted-foreground hover:text-white text-center"
                >
                  Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          BuildForge by <span className="text-primary font-bold">Kasi Dash</span>
        </p>
      </motion.div>
    </div>
  );
}
