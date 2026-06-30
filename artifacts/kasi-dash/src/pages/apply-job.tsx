import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Briefcase, CheckCircle2, MapPin, Clock } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useGetJobListing } from "@workspace/api-client-react";

interface JobFormData {
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  linkedIn: string;
  experience: string;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

export default function ApplyJob() {
  const [, params] = useRoute("/careers/:id");
  const jobId = params?.id ?? "";
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { data: job, isLoading } = useGetJobListing({ params: { jobId } });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JobFormData>();

  const onSubmit = async (data: JobFormData) => {
    try {
      const res = await fetch("/api/apply/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, jobListingId: jobId }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Position not found</h2>
          <Link href="/careers"><Button variant="outline">View all openings</Button></Link>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-black mb-3">Application Submitted</h2>
          <p className="text-muted-foreground mb-2">Thanks for applying for <strong className="text-white">{job.title}</strong>.</p>
          <p className="text-muted-foreground mb-8">Our team will review your application and get back to you within 5 to 7 business days.</p>
          <Link href="/careers">
            <Button className="bg-primary text-primary-foreground font-bold w-full">Back to Careers</Button>
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
          <Link href="/careers" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> All Jobs
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Job summary card */}
          <div className="bg-card border border-white/5 p-6 rounded-2xl mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {job.department}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                {TYPE_LABELS[job.type] ?? job.type}
              </span>
            </div>
            <h1 className="text-3xl font-black mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{TYPE_LABELS[job.type] ?? job.type}</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{job.description}</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">Apply for this position</p>
              <p className="text-sm text-muted-foreground">Fill in your details below</p>
            </div>
          </div>

          <div className="bg-card border border-white/5 p-6 md:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input {...register("fullName", { required: true })} placeholder="Your full name" className="bg-background border-white/10 focus-visible:ring-primary" />
                  {errors.fullName && <p className="text-destructive text-xs">Required</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input {...register("email", { required: true })} type="email" placeholder="you@example.com" className="bg-background border-white/10 focus-visible:ring-primary" />
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
                  <Label>LinkedIn Profile</Label>
                  <Input {...register("linkedIn")} placeholder="linkedin.com/in/yourprofile" className="bg-background border-white/10 focus-visible:ring-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Relevant Experience</Label>
                <Textarea {...register("experience")} placeholder="Briefly describe your relevant work experience..." className="bg-background border-white/10 focus-visible:ring-primary min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label>Cover Letter *</Label>
                <Textarea {...register("coverLetter", { required: true })} placeholder="Why do you want to work at Kasi Dash? What makes you the right fit for this role?" className="bg-background border-white/10 focus-visible:ring-primary min-h-[140px]" />
                {errors.coverLetter && <p className="text-destructive text-xs">Required</p>}
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
