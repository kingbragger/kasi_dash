import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";

interface Order {
  id: string; status: string; pickupAddress: string; deliveryAddress: string;
  customerName: string; customerPhone: string; customerEmail?: string;
  description?: string; amount: number; driverName?: string;
  createdAt: string; updatedAt: string; paymentStatus: string; paymentMethod?: string;
}

export default function Receipt() {
  const [, params] = useRoute("/receipt/:orderId");
  const orderId = params?.orderId ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/receipt/${orderId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setOrder)
      .catch(() => setError(true));
  }, [orderId]);

  if (error) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-3">Receipt not found</h2>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const receiptNo = `KD-${order.id.slice(0, 8).toUpperCase()}`;
  const serviceFee = +(order.amount * 0.1).toFixed(2);
  const deliveryFee = +(order.amount * 0.9).toFixed(2);

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      {/* Screen-only header */}
      <div className="print:hidden sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="container mx-auto max-w-md flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <Button onClick={() => window.print()} variant="outline" size="sm" className="border-white/10 hover:border-primary hover:text-primary gap-2">
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card print:bg-white border border-white/5 print:border-gray-200 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.08)]"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-card to-background print:from-gray-50 print:to-gray-100 px-6 pt-8 pb-6 border-b border-white/5 print:border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <KasiDashLogo size="md" />
              {order.status === "delivered" && (
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PAID
                </div>
              )}
            </div>
            <h1 className="text-2xl font-black mb-1 print:text-gray-900">Delivery Receipt</h1>
            <p className="text-muted-foreground print:text-gray-500 text-sm">{receiptNo}</p>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Customer */}
            <div>
              <p className="text-xs text-muted-foreground print:text-gray-400 uppercase tracking-wide mb-2">Customer</p>
              <p className="font-bold print:text-gray-900">{order.customerName}</p>
              <p className="text-sm text-muted-foreground print:text-gray-500">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-sm text-muted-foreground print:text-gray-500">{order.customerEmail}</p>}
            </div>

            <div className="border-t border-dashed border-white/10 print:border-gray-200" />

            {/* Addresses */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-400 uppercase tracking-wide mb-1">Pickup Address</p>
                <p className="text-sm font-medium print:text-gray-700">{order.pickupAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground print:text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
                <p className="text-sm font-medium print:text-gray-700">{order.deliveryAddress}</p>
              </div>
              {order.description && (
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-400 uppercase tracking-wide mb-1">Package Description</p>
                  <p className="text-sm print:text-gray-600">{order.description}</p>
                </div>
              )}
            </div>

            {order.driverName && (
              <>
                <div className="border-t border-dashed border-white/10 print:border-gray-200" />
                <div>
                  <p className="text-xs text-muted-foreground print:text-gray-400 uppercase tracking-wide mb-1">Driver</p>
                  <p className="text-sm font-medium print:text-gray-700">{order.driverName}</p>
                </div>
              </>
            )}

            <div className="border-t border-dashed border-white/10 print:border-gray-200" />

            {/* Line items */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground print:text-gray-500">Delivery fee</span>
                <span className="print:text-gray-700">R {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground print:text-gray-500">Service fee</span>
                <span className="print:text-gray-700">R {serviceFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-white/10 print:border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold print:text-gray-900">Total</span>
              <span className="text-xl font-black text-primary print:text-gray-900">R {order.amount.toFixed(2)}</span>
            </div>

            <div className="border-t border-dashed border-white/10 print:border-gray-200" />

            {/* Meta */}
            <div className="text-xs text-muted-foreground print:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Order date</span>
                <span>{new Date(order.createdAt).toLocaleString("en-ZA")}</span>
              </div>
              {order.updatedAt && order.status === "delivered" && (
                <div className="flex justify-between">
                  <span>Delivered</span>
                  <span>{new Date(order.updatedAt).toLocaleString("en-ZA")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Payment</span>
                <span className={order.paymentMethod === "ozow" ? "text-primary font-semibold" : "text-amber-400 font-semibold"}>
                  {order.paymentMethod === "ozow" ? "Ozow (EFT)" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reference</span>
                <span className="font-mono">{receiptNo}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-primary/5 print:bg-gray-50 px-6 py-4 border-t border-white/5 print:border-gray-200 text-center">
            <p className="text-xs text-muted-foreground print:text-gray-500">
              Thank you for using Kasi Dash · <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline print:text-gray-700">unity@kasidash.co.za</a>
            </p>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4 print:hidden">
          Order ID: <span className="font-mono text-white/50">{order.id}</span>
        </p>
      </div>
    </div>
  );
}
