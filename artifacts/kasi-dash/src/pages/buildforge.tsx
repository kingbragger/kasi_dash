import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  ArrowRight, ArrowLeft, Code2, Palette, Megaphone, Trophy, Users, Zap,
  Globe, CheckCircle2, Star, Send, Briefcase, LogIn
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  { icon: <Code2 className="w-5 h-5 text-primary" />, title: "Skill-based selection", desc: "No interviews. No résumés. Your work speaks for itself. Top performers earn their place." },
  { icon: <Zap className="w-5 h-5 text-primary" />, title: "Real-world challenges", desc: "Tackle actual product problems, not contrived tests. Every challenge mirrors real project work." },
  { icon: <Users className="w-5 h-5 text-primary" />, title: "Core team opportunity", desc: "Standout contributors get selected into the core team and build alongside real products." },
];

const ROLES = [
  { icon: <Code2 className="w-5 h-5 text-primary" />, label: "Developers" },
  { icon: <Palette className="w-5 h-5 text-primary" />, label: "Designers" },
  { icon: <Megaphone className="w-5 h-5 text-primary" />, label: "Marketers" },
];

const PLANS = [
  {
    name: "Starter Website",
    price: "R1,900",
    hosting: "R370 pm",
    icon: <Globe className="w-6 h-6 text-primary" />,
    highlight: false,
    features: ["Basic business website", "1 to 3 pages", "Mobile friendly design", "Contact form included", "Fast delivery"],
  },
  {
    name: "Standard Website",
    price: "R2,500",
    hosting: "R500 pm",
    icon: <Briefcase className="w-6 h-6 text-white" />,
    highlight: true,
    features: ["Multi page business website", "Better UI design", "Service pages included", "Basic SEO setup", "Responsive layout"],
  },
  {
    name: "Premium Website",
    price: "R3,500",
    hosting: "R1,000 pm",
    icon: <Star className="w-6 h-6 text-primary" />,
    highlight: false,
    features: ["Fully custom website", "Advanced UI and UX design", "SEO optimized", "Priority delivery", "Dedicated support"],
  },
];

interface BFApplication {
  id: string;
  fullName: string;
  businessName: string;
  contact: string;
  websiteType: string;
  description: string;
  status: string;
  assignedTo: string;
  bankDetails: string;
  submittedAt: string;
}

function loadApplications(): BFApplication[] {
  try { return JSON.parse(localStorage.getItem("bf_applications") || "[]"); } catch { return []; }
}
function saveApplications(apps: BFApplication[]) {
  localStorage.setItem("bf_applications", JSON.stringify(apps));
}

export default function BuildForge() {
  const [form, setForm] = useState({ fullName: "", businessName: "", contact: "", websiteType: "Starter Website", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apps = loadApplications();
    const newApp: BFApplication = {
      id: Date.now().toString(),
      ...form,
      status: "New",
      assignedTo: "",
      bankDetails: "",
      submittedAt: new Date().toISOString(),
    };
    saveApplications([...apps, newApp]);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[75vh] flex items-center pt-28 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(212,175,55,0.08),transparent_65%)] pointer-events-none" />
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-primary gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="mb-8 inline-block bg-white rounded-2xl px-6 py-4">
              <img src="/buildforge-logo.png" alt="BuildForge" className="h-16 w-auto" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.05]">
              Prove your skills.<br />
              <span className="text-primary drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]">Join the core team.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              BuildForge is a system where developers, designers, and marketers prove their skills through real challenges and get selected into a core team to work on real projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a href="https://build-forge-team.lovable.app/" target="_blank" rel="noreferrer">
                <Button size="lg" className="h-14 px-10 text-base font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_40px_rgba(212,175,55,0.35)] gap-2 hover:scale-105 transition-transform">
                  Start Challenge <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold border-white/10 hover:border-primary hover:text-primary gap-2" onClick={() => { setFormVisible(true); document.getElementById("website-services")?.scrollIntoView({ behavior: "smooth" }); }}>
                Get a Website <Globe className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-6">
              <Link href="/buildforge/login">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:border-primary/30 flex items-center justify-center transition-colors">
                    <LogIn className="w-4 h-4" />
                  </div>
                  Already a team member? <span className="font-bold text-primary underline underline-offset-4">Sign in to your portal</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Open to</span>
              <div className="flex items-center gap-3">
                {ROLES.map((r) => (
                  <div key={r.label} className="flex items-center gap-1.5 bg-card border border-white/5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {r.icon} {r.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section className="py-20 bg-card/20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-black text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEBSITE SERVICES ── */}
      <section id="website-services" className="py-28 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-3">Website Services</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">We build your online presence</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Professional websites built by the BuildForge core team. Fast, modern and affordable for South African businesses.</p>
          </motion.div>

          {/* Service icons row */}
          <div className="flex justify-center gap-8 mb-16">
            {[
              { icon: <Code2 className="w-6 h-6 text-primary" />, label: "Development" },
              { icon: <Palette className="w-6 h-6 text-primary" />, label: "UI and UX Design" },
              { icon: <Globe className="w-6 h-6 text-primary" />, label: "Online Business" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className={`relative rounded-3xl overflow-hidden border transition-all ${plan.highlight ? "border-primary bg-primary/5 shadow-[0_0_60px_rgba(212,175,55,0.15)]" : "border-white/5 bg-card hover:border-primary/30"}`}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
                <div className="p-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${plan.highlight ? "bg-primary" : "bg-primary/10"}`}>
                    {plan.icon}
                  </div>
                  {plan.highlight && (
                    <div className="inline-flex items-center gap-1 bg-primary/20 border border-primary/30 rounded-full px-2.5 py-0.5 text-primary text-xs font-bold mb-3">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-black text-primary">{plan.price}</span>
                    <span className="text-muted-foreground text-sm ml-1">once off</span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs text-muted-foreground">Hosting:</span>
                    <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">{plan.hosting}</span>
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => { setForm((p) => ({ ...p, websiteType: plan.name })); setFormVisible(true); document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" }); }}
                    className={`w-full font-bold gap-2 ${plan.highlight ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]" : "bg-card border border-white/10 hover:border-primary hover:text-primary text-foreground"}`}
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Application form */}
          <motion.div id="apply-form" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.06)]">
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-2xl font-black">Apply for Website</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-8">Tell us about your business and we will assign a BuildForge core team member to build your site.</p>

              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-black mb-2">Application Submitted</h4>
                  <p className="text-muted-foreground text-sm mb-6">Our team will review your request and send you bank details for payment. We will be in touch soon.</p>
                  <Button variant="outline" className="border-white/10 hover:border-primary hover:text-primary" onClick={() => { setSubmitted(false); setForm({ fullName: "", businessName: "", contact: "", websiteType: "Starter Website", description: "" }); }}>
                    Submit Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                      <Input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Your full name" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Name</label>
                      <Input required value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                        placeholder="Your business name" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Information</label>
                    <Input required value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                      placeholder="Phone number or email" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Website Type Needed</label>
                    <select required value={form.websiteType} onChange={(e) => setForm((p) => ({ ...p, websiteType: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md bg-background/50 border border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      {PLANS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Business Description</label>
                    <textarea required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Tell us what your business does and what you need on your website..."
                      rows={4} className="w-full px-3 py-2 rounded-md bg-background/50 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <Button type="submit" size="lg" className="w-full h-12 font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.25)] gap-2">
                    Apply for Website <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative bg-card/10 border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.07),transparent_65%)] pointer-events-none" />
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-5">Ready to prove yourself?</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              Skip the applications.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-primary">Just build.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">The challenge is live. Your next opportunity starts with a single click.</p>
            <a href="https://build-forge-team.lovable.app/" target="_blank" rel="noreferrer">
              <Button size="lg" className="h-16 px-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-[0_0_60px_rgba(212,175,55,0.45)] hover:shadow-[0_0_100px_rgba(212,175,55,0.65)] gap-2">
                Start Challenge <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
