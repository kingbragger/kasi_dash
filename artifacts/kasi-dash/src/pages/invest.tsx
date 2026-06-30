import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  TrendingUp, CheckCircle2, AlertTriangle, Cpu, Wallet, Megaphone, Rocket,
  Building2, ChevronRight, Users, Shield,
} from "lucide-react";

interface InvestForm {
  fullName: string;
  email: string;
  phone: string;
  amount: string;
  contactMethod: string;
  message: string;
  agreed: boolean;
}

const STEPS = [
  { n: "01", label: "Submit investment interest form" },
  { n: "02", label: "Review by the Kasi Dash team" },
  { n: "03", label: "Zoom introduction meeting" },
  { n: "04", label: "NDA and onboarding for selected investors" },
  { n: "05", label: "Payment and allocation process" },
];

const PURPOSES = [
  { icon: Cpu, label: "Software development and platform scaling" },
  { icon: Rocket, label: "AI and innovation lab expansion" },
  { icon: Wallet, label: "Fintech systems development" },
  { icon: Megaphone, label: "Marketing and user acquisition" },
  { icon: Building2, label: "Operational expansion across divisions" },
];

export default function Invest() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<InvestForm>();

  const onSubmit = async (data: InvestForm) => {
    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setSubmitted(true);
    } catch (e: unknown) {
      toast({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-3">Interest Received</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for expressing interest in Kasi Dash and BuildForge.
            </p>
            <p className="text-muted-foreground text-sm">
              Our team will review your submission and reach out to schedule a Zoom introduction meeting.
              Please do not make any payments until you receive official confirmation.
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(212,175,55,0.07),transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="pt-36 pb-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <TrendingUp className="w-4 h-4" />
            Early Stage Investment Opportunity
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Invest in the Future of<br />
            <span className="text-primary">Township Innovation</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kasidash and BuildForge (PTY) Ltd offers early-stage participation in its digital innovation ecosystem across technology, AI, fintech, and digital platforms.
          </p>
        </motion.div>
      </section>

      {/* Investment Range */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-8">Investment Range</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-white/5 rounded-2xl p-6 text-center"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Minimum Contribution</p>
              <p className="text-5xl font-black text-foreground mb-1">R500</p>
              <p className="text-sm text-muted-foreground">Entry level participation</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-primary/5 border border-primary/25 rounded-2xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-2.5 py-1">Recommended</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Recommended</p>
              <p className="text-5xl font-black text-primary mb-1">R1 000</p>
              <p className="text-sm text-muted-foreground">Standard participation tier</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Purpose of Funds */}
      <section className="py-12 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-2">Purpose of Funds</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">Where your investment goes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PURPOSES.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-card border border-white/5 rounded-xl p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium leading-snug">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Process */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-2">Investor Process</h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">How it works from submission to onboarding</p>
          <div className="space-y-3">
            {STEPS.map(({ n, label }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 bg-card border border-white/5 rounded-xl px-5 py-4"
              >
                <span className="text-2xl font-black text-primary/40 tabular-nums w-10 flex-shrink-0">{n}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Instructions */}
      <section className="py-12 px-4 bg-card/20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-black">Payment Instructions</h2>
              <p className="text-xs text-yellow-400 font-medium">For approved investors only</p>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-4">
            <p className="text-sm font-bold text-yellow-300 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Important Notice
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments should only be made after official confirmation from the Kasi Dash and BuildForge team following investor approval and the onboarding process. Unauthorized or unverified payments will not be recognized.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Banking Details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5">
              {[
                ["Account Name", "Unity Logistics and Delivery"],
                ["Account Holder", "MR HM NDLOVU"],
                ["Account Number", "63185730091"],
                ["Bank Reference", "Your email or phone number used during registration"],
              ].map(([label, val]) => (
                <div key={label} className="bg-card px-5 py-4">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-sm font-bold">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interest Form */}
      <section className="py-16 px-4" id="interest-form">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">Submit Investment Interest</h2>
            <p className="text-muted-foreground text-sm">We accept limited contributions. Complete the form and our team will be in touch.</p>
          </div>

          <div className="bg-card border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input
                    {...register("fullName", { required: true })}
                    placeholder="Your full name"
                    className="bg-background border-white/10 h-11"
                  />
                  {errors.fullName && <p className="text-xs text-destructive">Required</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background border-white/10 h-11"
                  />
                  {errors.email && <p className="text-xs text-destructive">Required</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    {...register("phone", { required: true })}
                    placeholder="+27 ..."
                    className="bg-background border-white/10 h-11"
                  />
                  {errors.phone && <p className="text-xs text-destructive">Required</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Investment Amount</Label>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background border-white/10 h-11">
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="R500">R500</SelectItem>
                          <SelectItem value="R1000">R1 000</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.amount && <p className="text-xs text-destructive">Required</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Preferred Contact Method</Label>
                <Controller
                  name="contactMethod"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background border-white/10 h-11">
                        <SelectValue placeholder="How should we contact you?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Phone Call">Phone Call</SelectItem>
                        <SelectItem value="Zoom">Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.contactMethod && <p className="text-xs text-destructive">Required</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Message <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  {...register("message")}
                  placeholder="Any questions or additional information you would like to share..."
                  className="bg-background border-white/10 min-h-[100px] resize-none"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("agreed", { required: true })}
                  className="mt-0.5 w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                  I confirm interest in investment participation in Kasi Dash and BuildForge (PTY) Ltd and understand that this is an expression of interest only. No payment is required at this stage.
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-destructive">You must confirm interest to continue</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-[0_0_16px_rgba(212,175,55,0.2)] gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Submit Investment Interest
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Your information is stored securely and will only be used for investor communication.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
