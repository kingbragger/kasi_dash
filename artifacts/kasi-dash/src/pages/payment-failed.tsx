import { Link } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import KasiDashLogo from "@/components/KasiDashLogo";

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-white/5 p-8 md:p-12 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.1)]"
      >
        <div className="flex justify-center mb-6">
          <KasiDashLogo size="md" />
        </div>
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't process your payment. Your account has not been charged.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link href="/order">
            <Button className="w-full h-14 text-lg bg-primary text-primary-foreground hover:brightness-110">
              Try Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full h-14 text-lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
