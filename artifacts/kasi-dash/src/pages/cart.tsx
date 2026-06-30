import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  Package, CreditCard, Banknote, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupAddress: string;
  deliveryAddress: string;
  notes?: string;
}

type PaymentMethod = "ozow" | "cod";
type Step = "cart" | "checkout" | "done";

export default function Cart() {
  const { items, remove, update, clear, total, count } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOzowRedirecting, setIsOzowRedirecting] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>();

  const onCheckout = async (data: CheckoutForm) => {
    const description = items.map((i) => `${i.quantity}x ${i.name} (${i.catalogueName})`).join(", ");
    try {
      // 1. Create the order
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          pickupAddress: data.pickupAddress,
          deliveryAddress: data.deliveryAddress,
          description: description + (data.notes ? ` | Notes: ${data.notes}` : ""),
          amount: total,
          paymentMethod,
        }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const order = await res.json();

      clear();

      if (paymentMethod === "ozow") {
        // 2a. Initiate Ozow and redirect
        setIsOzowRedirecting(true);
        const payRes = await fetch("/api/payments/ozow/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            customerName: data.customerName,
            customerEmail: data.customerEmail ?? data.customerPhone,
            description: `Kasi Dash order — ${description}`,
          }),
        });
        if (!payRes.ok) throw new Error("Payment initiation failed");
        const { paymentUrl } = await payRes.json();
        window.location.href = paymentUrl;
        return;
      }

      // 2b. COD — show confirmation
      setOrderId(order.id);
      setStep("done");
    } catch {
      setIsOzowRedirecting(false);
      toast({ title: "Error", description: "Could not place order. Please try again.", variant: "destructive" });
    }
  };

  // ── Order placed confirmation ──────────────────────────────────────────────
  if (step === "done" && orderId) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-black mb-2">Order Placed!</h1>
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <Banknote className="w-4 h-4" /> Cash on Delivery
        </div>
        <p className="text-muted-foreground mb-8 text-sm">
          Your order has been received. Please have <span className="text-white font-bold">R {total.toFixed(2)}</span> ready for the driver on delivery.
        </p>
        <div className="flex flex-col gap-3">
          <Link href={`/track/${orderId}`}>
            <Button className="w-full bg-primary text-primary-foreground font-bold gap-2">
              Track Your Order <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/receipt/${orderId}`}>
            <Button variant="outline" className="w-full border-white/10 hover:border-primary hover:text-primary">
              View Receipt
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pt-28 pb-20">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {step === "checkout" ? (
            <button onClick={() => setStep("cart")} className="text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link href="/shop">
              <button className="text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
          )}
          <h1 className="text-3xl font-black">
            {step === "cart" ? "Your Cart" : "Checkout"}
          </h1>
          {count > 0 && step === "cart" && (
            <span className="text-sm text-muted-foreground">{count} item{count > 1 ? "s" : ""}</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Empty cart ───────────────────────────────────────────────── */}
          {items.length === 0 && step === "cart" && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold mb-2">Your cart is empty</p>
              <p className="text-sm mb-6">Browse our vendor catalogues and add items to get started.</p>
              <Link href="/shop">
                <Button className="bg-primary text-primary-foreground font-bold">Browse Shop</Button>
              </Link>
            </motion.div>
          )}

          {/* ── Cart items ────────────────────────────────────────────────── */}
          {items.length > 0 && step === "cart" && (
            <motion.div key="cart" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="space-y-3 mb-8">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.catalogueName}</p>
                        <p className="text-primary font-bold text-sm mt-0.5">R {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => update(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => update(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors ml-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order summary */}
              <div className="bg-card border border-white/5 rounded-2xl p-5 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Subtotal ({count} items)</span>
                  <span>R {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-black">
                  <span>Items Total</span>
                  <span className="text-primary text-lg">R {total.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={() => setStep("checkout")} className="w-full h-14 text-base font-black bg-primary text-primary-foreground hover:brightness-110 gap-2">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* ── Checkout form ─────────────────────────────────────────────── */}
          {step === "checkout" && (
            <motion.div key="checkout" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <form onSubmit={handleSubmit(onCheckout)} className="space-y-5">

                {/* Cart summary pill */}
                <div className="bg-card border border-white/5 rounded-2xl p-4">
                  <p className="text-sm font-bold mb-1">{count} item{count > 1 ? "s" : ""} · R {total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </p>
                </div>

                {/* Customer details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Full Name *</Label>
                    <Input {...register("customerName", { required: true })} placeholder="Your full name" className="bg-background border-white/10 focus-visible:ring-primary" />
                    {errors.customerName && <p className="text-destructive text-xs">Required</p>}
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Phone Number *</Label>
                    <Input {...register("customerPhone", { required: true })} placeholder="0XX XXX XXXX" className="bg-background border-white/10 focus-visible:ring-primary" />
                    {errors.customerPhone && <p className="text-destructive text-xs">Required</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Address (for receipt)</Label>
                  <Input {...register("customerEmail")} type="email" placeholder="you@example.com" className="bg-background border-white/10 focus-visible:ring-primary" />
                </div>

                <div className="space-y-2">
                  <Label>Pickup Address *</Label>
                  <Input {...register("pickupAddress", { required: true })} placeholder="Where should we collect from?" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.pickupAddress && <p className="text-destructive text-xs">Required</p>}
                </div>

                <div className="space-y-2">
                  <Label>Delivery Address *</Label>
                  <Input {...register("deliveryAddress", { required: true })} placeholder="Where should we deliver to?" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.deliveryAddress && <p className="text-destructive text-xs">Required</p>}
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea {...register("notes")} placeholder="Any special instructions for the driver?" className="bg-background border-white/10 focus-visible:ring-primary min-h-20" />
                </div>

                {/* ── Payment method selector ─────────────────────────────── */}
                <div>
                  <Label className="mb-3 block">Payment Method *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`relative rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === "cod"
                          ? "border-amber-500/50 bg-amber-500/8 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                          : "border-white/10 bg-card hover:border-white/20"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${paymentMethod === "cod" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-muted-foreground"}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <p className={`font-bold text-sm mb-0.5 ${paymentMethod === "cod" ? "text-amber-400" : ""}`}>Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay the driver when your order arrives</p>
                    </button>

                    {/* Ozow EFT */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ozow")}
                      className={`relative rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === "ozow"
                          ? "border-primary/50 bg-primary/8 shadow-[0_0_20px_rgba(212,175,55,0.08)]"
                          : "border-white/10 bg-card hover:border-white/20"
                      }`}
                    >
                      {paymentMethod === "ozow" && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${paymentMethod === "ozow" ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <p className={`font-bold text-sm mb-0.5 ${paymentMethod === "ozow" ? "text-primary" : ""}`}>Pay with Ozow</p>
                      <p className="text-xs text-muted-foreground">Instant EFT, secure, no card needed</p>
                    </button>
                  </div>

                  {paymentMethod === "ozow" && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      You will be redirected to Ozow to complete payment securely.
                    </motion.p>
                  )}
                  {paymentMethod === "cod" && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"
                    >
                      <Banknote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      Please have <span className="text-white font-semibold mx-1">R {total.toFixed(2)}</span> ready for the driver.
                    </motion.p>
                  )}
                </div>

                {/* ── Submit ───────────────────────────────────────────────── */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep("cart")} className="border-white/10 hover:border-white/20 flex-1">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isOzowRedirecting}
                    className={`font-black h-12 flex-[2] gap-2 ${
                      paymentMethod === "ozow"
                        ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                        : "bg-amber-500 text-black hover:brightness-110"
                    }`}
                  >
                    {isOzowRedirecting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Ozow…</>
                    ) : isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                    ) : paymentMethod === "ozow" ? (
                      <><CreditCard className="w-4 h-4" /> Pay R {total.toFixed(2)} with Ozow</>
                    ) : (
                      <><Banknote className="w-4 h-4" /> Place Order · R {total.toFixed(2)}</>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
