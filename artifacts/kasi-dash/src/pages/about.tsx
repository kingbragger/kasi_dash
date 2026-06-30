import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Heart, Shield, Users, Zap, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VALUES = [
  { icon: Truck, title: "Speed First", desc: "We built Kasi Dash because township communities deserve the same fast delivery the suburbs take for granted." },
  { icon: Heart, title: "Community Driven", desc: "Every driver, every vendor, every customer is part of the kasi ecosystem. We grow when you grow." },
  { icon: Shield, title: "Trust & Safety", desc: "Every driver is background-checked, verified and tracked in real time so your parcels always arrive safely." },
  { icon: Zap, title: "Tech for Kasi", desc: "World-class delivery technology built specifically for South African townships. No foreign templates, no compromises." },
];

const TEAM = [
  { name: "Operations Team", role: "Making deliveries happen, every day", initial: "O" },
  { name: "Driver Network", role: "The heartbeat of Kasi Dash", initial: "D" },
  { name: "Tech & Product", role: "Building the future of kasi delivery", initial: "T" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(212,175,55,0.12),transparent_60%)]" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-xs font-semibold tracking-wide mb-6">
              <MapPin className="w-3.5 h-3.5" /> Based in South Africa
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Delivery built<br />
              <span className="text-primary">for the kasi</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Kasi Dash is South Africa's dedicated township delivery platform, connecting local vendors,
              businesses and communities with fast, reliable last-mile delivery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-20 border-y border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Township communities are the economic engine of South Africa, yet they've been underserved by
                delivery platforms designed for formal, suburban retail. We're changing that.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Kasi Dash was built from the ground up for how the kasi actually works. Cash friendly,
                WhatsApp-native, with drivers who know the streets and shortcuts that no GPS will ever map.
              </p>
              <p className="text-primary font-semibold">One delivery at a time. One township at a time.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { label: "Townships Served", value: "Growing" },
                { label: "Active Drivers", value: "Hiring" },
                { label: "Deliveries", value: "Daily" },
                { label: "Founded", value: "2024" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-2xl font-black text-primary mb-1">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">What We Stand For</h2>
            <p className="text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card border border-white/5 rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-20 border-t border-white/5 bg-card/20">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">The Team Behind Kasi Dash</h2>
            <p className="text-muted-foreground">Built by people who believe in the kasi</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {TEAM.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card border border-white/5 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl mx-auto mb-4">
                  {t.initial}
                </div>
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-card border border-white/5 rounded-2xl p-8 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-black mb-2">Get In Touch</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Whether you want to partner with us, become a driver, or just have questions, we would love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:unity@kasidash.co.za">
                <Button className="bg-primary text-primary-foreground font-bold gap-2">
                  <Mail className="w-4 h-4" /> unity@kasidash.co.za
                </Button>
              </a>
              <Link href="/careers">
                <Button variant="outline" className="border-white/10 hover:border-primary hover:text-primary gap-2">
                  <Truck className="w-4 h-4" /> Join Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
