import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { ArrowLeft, Users, Store, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface VendorFormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  township: string;
  description: string;
  website: string;
}

type Step = "form" | "done";

export default function ApplyVendor() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [submittedData, setSubmittedData] = useState<VendorFormData | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VendorFormData>();

  const onSubmit = async (data: VendorFormData) => {
    try {
      const res = await fetch("/api/apply/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmittedData(data);
      setStep("done");
    } catch {
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/"><KasiDashLogo size="md" /></Link>
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm font-medium text-secondary">Partner Application</span>
              </div>
              <h1 className="text-4xl font-black mb-3">Partner With Kasi Dash</h1>
              <p className="text-muted-foreground mb-10">Use our delivery infrastructure to reach more customers. Tell us about your business below.</p>

              <div className="bg-card border border-white/5 p-6 md:p-8 rounded-2xl shadow-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Business Name *</Label>
                      <Input {...register("businessName", { required: true })} placeholder="Your business name" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.businessName && <p className="text-destructive text-xs">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person *</Label>
                      <Input {...register("contactName", { required: true })} placeholder="Your full name" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.contactName && <p className="text-destructive text-xs">Required</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Email Address *</Label>
                      <Input {...register("email", { required: true })} type="email" placeholder="business@example.com" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.email && <p className="text-destructive text-xs">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input {...register("phone", { required: true })} placeholder="071 000 0000" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.phone && <p className="text-destructive text-xs">Required</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Business Type *</Label>
                      <Input {...register("businessType", { required: true })} placeholder="e.g. Pharmacy, Spaza, Salon" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.businessType && <p className="text-destructive text-xs">Required</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Township / Area *</Label>
                      <Input {...register("township", { required: true })} placeholder="e.g. Soweto, Khayelitsha" className="bg-background border-white/10 focus-visible:ring-primary" />
                      {errors.township && <p className="text-destructive text-xs">Required</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Website (optional)</Label>
                    <Input {...register("website")} placeholder="https://yourbusiness.co.za" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>

                  <div className="space-y-2">
                    <Label>Tell us about your business</Label>
                    <Textarea {...register("description")} placeholder="What does your business do, and how do you think Kasi Dash can help you grow?" className="bg-background border-white/10 focus-visible:ring-primary min-h-[120px]" />
                  </div>

                  <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)] gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>Submit Application <ChevronRight className="w-5 h-5" /></>}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {step === "done" && submittedData && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-black mb-3">Application Received!</h1>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                Thank you, <span className="text-white font-semibold">{submittedData.contactName}</span>. Your application for{" "}
                <span className="text-primary font-semibold">{submittedData.businessName}</span> has been submitted successfully.
              </p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                Our team will review your application and reach out to you at{" "}
                <span className="text-white font-semibold">{submittedData.email}</span> with our banking details to complete your listing setup.
              </p>

              <div className="bg-card border border-white/5 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-semibold">What happens next</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Our team reviews your application",
                    "We send you banking details for the R250/month hosting fee",
                    "Once payment is confirmed, your catalogue goes live",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="bg-primary text-primary-foreground font-bold gap-2">
                    <Store className="w-4 h-4" /> Back to Home
                  </Button>
                </Link>
                <a href="mailto:unity@kasidash.co.za">
                  <Button variant="outline" className="border-white/10 hover:border-primary hover:text-primary">
                    Contact us
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
