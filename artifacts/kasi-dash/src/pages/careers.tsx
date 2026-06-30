import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useListJobListings } from "@workspace/api-client-react";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

export default function Careers() {
  const { data: listings, isLoading } = useListJobListings();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <KasiDashLogo size="md" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/careers" className="text-primary">Careers</Link>
            <Link href="/apply/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
            <Link href="/apply/vendor" className="hover:text-primary transition-colors">Partner With Us</Link>
          </nav>
          <Link href="/order">
            <Button size="sm" className="bg-primary text-primary-foreground font-bold">
              Order Now
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              We are hiring
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
              Build the future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">township delivery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join a passionate team redefining logistics for South African communities. We value hustle, creativity, and purpose.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-card/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : !listings || listings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-full bg-card border border-white/5 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No open positions right now</h3>
              <p className="text-muted-foreground mb-8">We are always on the lookout for great talent. Check back soon or send us your CV.</p>
              <a href="mailto:careers@kasidash.co.za">
                <Button variant="outline" className="border-white/10 hover:border-primary hover:text-primary">
                  Send Your CV
                </Button>
              </a>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-8">{listings.length} open position{listings.length !== 1 ? "s" : ""}</p>
              {listings.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                          {job.department}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                          {TYPE_LABELS[job.type] ?? job.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {TYPE_LABELS[job.type] ?? job.type}
                        </span>
                      </div>
                    </div>
                    <Link href={`/careers/${job.id}`}>
                      <Button className="bg-primary text-primary-foreground font-bold whitespace-nowrap">
                        View & Apply <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Culture section */}
      <section className="py-24 px-4 bg-card/20 border-y border-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black mb-12 text-center">Why work at Kasi Dash?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Purpose driven work", desc: "Every delivery we enable creates economic opportunity in our communities." },
              { title: "Fast growth", desc: "We are scaling rapidly. Your contributions will be seen and rewarded." },
              { title: "Flexible culture", desc: "We trust our team. Work where you do your best thinking." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-white/5"
              >
                <div className="w-2 h-2 rounded-full bg-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
