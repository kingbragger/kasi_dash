import { Link, useSearch } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import KasiDashLogo from "@/components/KasiDashLogo";

export default function PaymentSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const transactionId = params.get("transactionId");

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-white/5 p-8 md:p-12 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(212,175,55,0.1)]"
      >
        <div className="flex justify-center mb-6">
          <KasiDashLogo size="md" />
        </div>
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your order has been received and a driver will be assigned shortly.
        </p>
        
        {transactionId && (
          <div className="bg-background rounded-xl p-4 border border-white/5 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Transaction Ref</p>
            <p className="font-mono text-sm break-all">{transactionId}</p>
          </div>
        )}
        
        <Link href="/">
          <Button className="w-full h-14 text-lg bg-primary text-primary-foreground hover:brightness-110">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
