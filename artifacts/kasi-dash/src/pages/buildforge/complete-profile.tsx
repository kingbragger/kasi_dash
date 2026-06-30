import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { UserCheck, Loader2 } from "lucide-react";

export default function BuildforgeCompleteProfile() {
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch("/api/buildforge/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAuthenticated) { navigate("/buildforge/login"); return; }
        if (d.mustChangePassword) { navigate("/buildforge/change-password"); return; }
        if (d.profileCompleted) { navigate("/buildforge/portal"); return; }
        setMe(d);
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idNumber.trim() || idNumber.trim().length < 4) {
      setError("Please enter a valid ID number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/buildforge/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idNumber, phone, bio }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Failed to save profile."); return; }
      toast({ title: "Profile complete!", description: "Welcome to BuildForge." });
      navigate("/buildforge/portal");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!me) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(212,175,55,0.07),transparent_65%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-7 h-7 text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">Complete Your Profile</h1>
          <p className="text-muted-foreground text-sm">
            Hi <strong className="text-white">{me.name}</strong>. We need a few more details before you can access your workspace.
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                South African ID Number <span className="text-destructive">*</span>
              </Label>
              <Input
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 9001015009087"
                maxLength={13}
                className="bg-background border-white/10 focus-visible:ring-primary h-11 font-mono tracking-wider"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Required for identity verification.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="bg-background border-white/10 focus-visible:ring-primary h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Short Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={`Tell us a bit about yourself as a ${me.role}...`}
                rows={3}
                className="bg-background border-white/10 focus-visible:ring-primary resize-none text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

            <Button
              type="submit"
              disabled={loading || !idNumber.trim()}
              className="w-full h-11 bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4" /> Complete Profile</>}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
