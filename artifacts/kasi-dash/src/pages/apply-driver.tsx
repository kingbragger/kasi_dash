import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { ArrowLeft, Truck, CheckCircle2 } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DriverFormData {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  vehicleType: string;
  vehicleRegistration: string;
  licenseNumber: string;
  township: string;
  message: string;
}

export default function ApplyDriver() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<DriverFormData>();

  const onSubmit = async (data: DriverFormData) => {
    try {
      const res = await fetch("/api/apply/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-white/5 p-10 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(212,175,55,0.1)]"
        >
          <div className="flex justify-center mb-6"><KasiDashLogo size="md" /></div>
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black mb-3">Application Received</h2>
          <p className="text-muted-foreground mb-8">Thanks for applying to drive with Kasi Dash. Our team will review your application and be in touch within 3 to 5 business days.</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground font-bold w-full">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/"><KasiDashLogo size="md" /></Link>
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Driver Application</span>
          </div>
          <h1 className="text-4xl font-black mb-3">Become a Kasi Dash Driver</h1>
          <p className="text-muted-foreground mb-10">Earn on your own schedule. Fill in the form below and we will be in touch.</p>

          <div className="bg-card border border-white/5 p-6 md:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input {...register("fullName", { required: true })} placeholder="John Doe" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.fullName && <p className="text-destructive text-xs">Required</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input {...register("email", { required: true })} type="email" placeholder="john@example.com" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.email && <p className="text-destructive text-xs">Required</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input {...register("phone", { required: true })} placeholder="071 000 0000" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.phone && <p className="text-destructive text-xs">Required</p>}
                </div>
                <div className="space-y-2">
                  <Label>ID Number *</Label>
                  <Input {...register("idNumber", { required: true })} placeholder="SA ID number" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.idNumber && <p className="text-destructive text-xs">Required</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Vehicle Type *</Label>
                  <Controller
                    name="vehicleType"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="bg-background border-white/10 focus:ring-primary">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bicycle">Bicycle</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="bakkie">Bakkie</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.vehicleType && <p className="text-destructive text-xs">Required</p>}
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Registration</Label>
                  <Input {...register("vehicleRegistration")} placeholder="CAA 000 GP" className="bg-background border-white/10 focus-visible:ring-primary" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>License Number *</Label>
                  <Input {...register("licenseNumber", { required: true })} placeholder="Driver license number" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.licenseNumber && <p className="text-destructive text-xs">Required</p>}
                </div>
                <div className="space-y-2">
                  <Label>Township / Area *</Label>
                  <Input {...register("township", { required: true })} placeholder="e.g. Soweto, Khayelitsha" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.township && <p className="text-destructive text-xs">Required</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Message</Label>
                <Textarea {...register("message")} placeholder="Tell us a bit about yourself and why you want to drive with Kasi Dash..." className="bg-background border-white/10 focus-visible:ring-primary min-h-[100px]" />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Driver Application"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
