import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Truck } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";

interface LoginForm { email: string; password: string; }

export default function DriverLogin() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch("/api/driver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Login failed", description: json.message ?? "Invalid credentials", variant: "destructive" });
        return;
      }
      navigate("/driver");
    } catch {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><KasiDashLogo size="lg" /></div>
        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black">Driver Portal</h1>
              <p className="text-xs text-muted-foreground">Sign in to your driver account</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input {...register("email", { required: true })} type="email" placeholder="you@example.com" className="bg-background border-white/10 focus-visible:ring-primary" autoComplete="email" />
              {errors.email && <p className="text-destructive text-xs">Required</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input {...register("password", { required: true })} type="password" placeholder="••••••••" className="bg-background border-white/10 focus-visible:ring-primary" autoComplete="current-password" />
              {errors.password && <p className="text-destructive text-xs">Required</p>}
            </div>
            <Button type="submit" className="w-full h-12 font-bold bg-primary text-primary-foreground hover:brightness-110" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Need help? Contact <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a>
        </p>
      </motion.div>
    </div>
  );
}
