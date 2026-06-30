import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import KasiDashLogo from "@/components/KasiDashLogo";

export default function VendorPaymentSuccess() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const businessName = params.get("businessName") ?? "Your store";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-white/5 rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_60px_rgba(212,175,55,0.08)]"
      >
        <div className="flex justify-center mb-8">
          <KasiDashLogo size="md" />
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <Store className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-black mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
          Your R250/month hosting fee has been received. Your vendor listing application for <span className="text-white font-semibold">{decodeURIComponent(businessName)}</span> is now being reviewed.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Our team will reach out within <span className="text-primary font-semibold">2 to 3 business days</span> to set up your catalogue on the Kasi Dash shop.
        </p>

        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">What happens next</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              "Team reviews your application",
              "Catalogue created for your store",
              "You receive your login details",
              "Your store goes live on Kasi Dash",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>

        <Link href="/">
          <Button className="w-full bg-primary text-primary-foreground font-bold gap-2 h-12">
            Back to Kasi Dash <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground mt-4">
          Questions? Email{" "}
          <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">
            unity@kasidash.co.za
          </a>
        </p>
      </motion.div>
    </div>
  );
}
