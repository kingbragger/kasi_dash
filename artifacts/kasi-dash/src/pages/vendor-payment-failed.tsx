import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import KasiDashLogo from "@/components/KasiDashLogo";

export default function VendorPaymentFailed() {
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const applicationId = params.get("appId");
  const reason = params.get("reason") ?? "error";
  const businessName = params.get("businessName") ?? "";

  const handleRetry = async () => {
    if (!applicationId) {
      toast({ title: "Error", description: "Cannot retry. Application ID missing. Please contact support.", variant: "destructive" });
      return;
    }
    setRetrying(true);
    try {
      const res = await fetch(`/api/apply/vendor/${applicationId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: decodeURIComponent(businessName) }),
      });
      if (!res.ok) throw new Error();
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch {
      toast({ title: "Error", description: "Could not start payment. Please try again.", variant: "destructive" });
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-white/5 rounded-3xl p-10 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-8">
          <KasiDashLogo size="md" />
        </div>

        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-3xl font-black mb-3">Payment {reason === "cancelled" ? "Cancelled" : "Failed"}</h1>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {reason === "cancelled"
            ? "You cancelled the payment. Your application has been saved. You can pay at any time to activate your listing."
            : "Something went wrong with your payment. Your application is saved, but your listing will only go live once payment is received."}
        </p>

        <div className="space-y-3">
          {applicationId && (
            <Button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full bg-primary text-primary-foreground font-bold gap-2 h-12"
            >
              {retrying ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Redirecting to Ozow…</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Try Payment Again R250</>

              )}
            </Button>
          )}
          <Link href="/apply/vendor">
            <Button variant="outline" className="w-full border-white/10 hover:border-white/20 gap-2 h-12">
              <ArrowLeft className="w-4 h-4" /> New Application
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-white h-10">
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Need help?{" "}
          <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">
            unity@kasidash.co.za
          </a>
        </p>
      </motion.div>
    </div>
  );
}
