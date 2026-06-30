import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useJoinWaitlist } from "@workspace/api-client-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Zap, ShieldCheck, CreditCard, Navigation, Truck, Users, Briefcase, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  {
    name: "Restaurant",
    label: "Hot & Fresh",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85",
    color: "from-orange-500/80",
    accent: "#f97316",
    rotation: "-rotate-2",
  },
  {
    name: "Clothing",
    label: "Street Style",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=85",
    color: "from-violet-500/80",
    accent: "#8b5cf6",
    rotation: "rotate-1",
  },
  {
    name: "Groceries",
    label: "Daily Essentials",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=85",
    color: "from-green-500/80",
    accent: "#22c55e",
    rotation: "-rotate-1",
  },
  {
    name: "Gadgets",
    label: "Tech & More",
    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=85",
    color: "from-blue-500/80",
    accent: "#3b82f6",
    rotation: "rotate-2",
  },
  {
    name: "Perfumes",
    label: "Smell Amazing",
    img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=85",
    color: "from-pink-500/80",
    accent: "#ec4899",
    rotation: "-rotate-2",
  },
  {
    name: "Pharmacy",
    label: "Health & Care",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=85",
    color: "from-teal-500/80",
    accent: "#14b8a6",
    rotation: "rotate-1",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    joinWaitlist.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          toast({ title: "You're on the list!", description: "We'll notify you when we launch in your area." });
          setEmail("");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to join waitlist. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Full-bleed background collage */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          {/* Background image grid */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-40 scale-110">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="relative overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60`} />
              </div>
            ))}
          </div>
          {/* Dark overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-medium text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live in selected townships
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter mb-6 leading-[1.05]"
            >
              Everything<br />
              <span className="text-primary drop-shadow-[0_0_40px_rgba(212,175,55,0.5)]">Kasi</span>{" "}
              Needs,<br />
              Delivered.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed"
            >
              Food, clothing, groceries, gadgets and more. From your township's best vendors, straight to your door.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-[0_0_40px_rgba(212,175,55,0.35)] gap-2">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/order">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold border-white/10 hover:border-primary hover:text-primary transition-colors">
                  Place a Delivery
                </Button>
              </Link>
            </motion.div>

            {/* Waitlist */}
            <motion.form
              onSubmit={handleWaitlist}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-2 max-w-sm"
            >
              <Input
                type="email"
                placeholder="Get early access, enter your email"
                className="h-12 bg-card/50 backdrop-blur border-white/10 focus-visible:ring-primary text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={joinWaitlist.isPending}
              />
              <Button type="submit" size="sm" className="h-12 px-5 font-bold bg-primary text-primary-foreground hover:brightness-110 whitespace-nowrap" disabled={joinWaitlist.isPending}>
                Join
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <a
                href="https://www.bark.com/en/za/company/kasidash-and-buildforge-ptyltd/Qw61nL/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/bark-badge.png" alt="Bark Professional" className="h-12 w-auto" />
              </a>
            </motion.div>
          </div>

          {/* Right: Floating category tiles */}
          <div className="hidden lg:block relative h-[580px]">
            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            {/* Tile positions */}
            {[
              { cat: CATEGORIES[0], top: "4%",  left: "8%",  w: "w-44", delay: 0    },
              { cat: CATEGORIES[1], top: "4%",  left: "55%", w: "w-40", delay: 0.1  },
              { cat: CATEGORIES[2], top: "36%", left: "0%",  w: "w-48", delay: 0.15 },
              { cat: CATEGORIES[3], top: "34%", left: "50%", w: "w-44", delay: 0.2  },
              { cat: CATEGORIES[4], top: "66%", left: "12%", w: "w-40", delay: 0.25 },
              { cat: CATEGORIES[5], top: "64%", left: "54%", w: "w-44", delay: 0.3  },
            ].map(({ cat, top, left, w, delay }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + delay, ease: "easeOut" }}
                whileHover={{ scale: 1.05, zIndex: 20 }}
                style={{ top, left }}
                className={`absolute ${w} ${cat.rotation} rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 cursor-pointer transition-shadow hover:shadow-[0_12px_48px_rgba(0,0,0,0.7)] group`}
              >
                <img src={cat.img} alt={cat.name} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-50`} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-bold uppercase tracking-widest">{cat.name}</p>
                  <p className="text-white/70 text-xs">{cat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── CATEGORY SHOWCASE ─────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-3">What We Deliver</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">From kasi to your door</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Six categories. One app. Everything your township needs, delivered fast.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className="text-white font-black text-lg md:text-xl">{cat.name}</p>
                  <p className="text-white/60 text-xs md:text-sm">{cat.label}</p>
                </div>
                {/* Shop arrow on hover */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/shop">
              <Button size="lg" className="h-14 px-10 font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.25)] gap-2">
                Browse All Categories <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-card/20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Fast Delivery",         desc: "No more waiting. We move at kasi speed.",              icon: <Zap className="w-5 h-5 text-primary" /> },
              { title: "Trusted Drivers",        desc: "Local drivers who know every street.",                icon: <ShieldCheck className="w-5 h-5 text-primary" /> },
              { title: "Affordable Prices",      desc: "Premium service that doesn't break the bank.",        icon: <CreditCard className="w-5 h-5 text-primary" /> },
              { title: "Live GPS Tracking",      desc: "Watch your order arrive on the map in real time.",    icon: <Navigation className="w-5 h-5 text-primary" /> },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-sm">{f.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Three steps, door delivered</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Getting what you need has never been this easy.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {[
              { title: "Browse & Order",  desc: "Shop vendor catalogues or place a custom delivery request.",             step: "01", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80" },
              { title: "Driver Assigned", desc: "A vetted local driver picks up your order immediately.",                  step: "02", img: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&q=80" },
              { title: "Live Tracking",   desc: "Watch your delivery arrive live on the map until it's in your hands.",   step: "03", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-3xl overflow-hidden bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute top-4 left-4 text-7xl font-black text-white/10 group-hover:text-primary/15 transition-colors select-none leading-none">
                    {step.step}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR PRICING ────────────────────────────────────────────── */}
      <section className="py-24 bg-card/20 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.06)]"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image side */}
              <div className="relative h-56 md:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&q=85"
                  alt="Vendor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)]" />
              </div>
              {/* Text side */}
              <div className="p-8 md:p-12 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-primary text-xs font-bold mb-5">
                    Vendor Plan
                  </div>
                  <div className="mb-3">
                    <span className="text-5xl font-black text-primary">R250</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Per active catalogue. Get your products in front of township customers with full delivery infrastructure included.</p>
                  <div className="space-y-2 mb-8">
                    {["Unlimited products", "Live on Kasi Dash Shop", "Delivery included", "Real-time notifications", "Cancel anytime"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/apply/vendor">
                    <Button className="w-full h-12 font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.2)] gap-2">
                      Apply to List Your Store <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── JOIN ECOSYSTEM ────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-3">Opportunities</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Join the Kasi Dash Ecosystem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Whether you want to deliver, partner, or build a career, there is a place for you.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <Truck className="w-6 h-6 text-primary" />, title: "Become a Driver", desc: "Earn on your own schedule. Join our growing fleet of trusted local drivers.", cta: "Apply Now", href: "/apply/driver", img: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&q=80" },
              { icon: <Users className="w-6 h-6 text-primary" />, title: "Partner With Us", desc: "Got a business? Use Kasi Dash delivery infrastructure to grow your reach.", cta: "Partner Up", href: "/apply/vendor", img: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&q=80" },
              { icon: <Briefcase className="w-6 h-6 text-primary" />, title: "Work With Us", desc: "We are building something big. Find open roles and be part of the journey.", cta: "View Careers", href: "/careers", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80" },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                </div>
                <div className="bg-card p-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-black mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{card.desc}</p>
                  <Link href={card.href}>
                    <Button variant="outline" size="sm" className="border-white/10 hover:border-primary hover:text-primary transition-colors gap-1">
                      {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILDFORGE ────────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.05)]"
          >
            <div className="p-8 md:p-14">
              <div className="mb-6 inline-block bg-white rounded-xl px-5 py-3">
                <img src="/buildforge-logo.png" alt="BuildForge" className="h-12 w-auto" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-5 max-w-2xl leading-tight">
                Prove your skills.<br />Join the core team.
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl leading-relaxed">
                BuildForge is a system where developers, designers, and marketers prove their skills through real challenges and get selected into a core team to work on real projects.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[
                  { title: "Skill-based selection", desc: "No interviews. Your work speaks for you." },
                  { title: "Real-world challenges", desc: "Tackle actual problems, not contrived tests." },
                  { title: "Core team opportunity", desc: "Top performers join the team and build together." },
                ].map((item, i) => (
                  <div key={i} className="bg-background/50 rounded-2xl p-5 border border-white/5">
                    <h4 className="font-bold mb-1.5 text-sm">{item.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <a href="https://build-forge-team.lovable.app/" target="_blank" rel="noreferrer">
                <Button size="lg" className="h-14 px-10 font-bold bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_30px_rgba(212,175,55,0.25)] gap-2">
                  Start Challenge <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-40 px-4 relative overflow-hidden">
        {/* Background image with heavy overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=85"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_65%)]" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mb-5">Ready?</p>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Start ordering<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-primary">smarter today</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">Join the people relying on Kasi Dash for fast, reliable local deliveries every day.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="h-16 px-14 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-[0_0_60px_rgba(212,175,55,0.45)] hover:shadow-[0_0_100px_rgba(212,175,55,0.65)]">
                  Shop Now
                </Button>
              </Link>
              <Link href="/order">
                <Button size="lg" variant="outline" className="h-16 px-14 text-lg font-bold rounded-full border-white/10 hover:border-primary hover:text-primary">
                  Place a Delivery
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="flex justify-center py-10 border-t border-white/5 bg-background/50">
        <a
          href="https://www.bark.com/en/za/company/kasidash-and-buildforge-ptyltd/Qw61nL/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/bark-badge.png" alt="Bark Professional" className="h-12 w-auto" />
        </a>
      </div>

      <Footer />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/27840640853"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(37,211,102,0.45)] hover:scale-110 transition-transform z-50 text-white"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>
    </div>
  );
}
