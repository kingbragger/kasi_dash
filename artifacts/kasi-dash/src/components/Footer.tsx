import { Link } from "wouter";
import KasiDashLogo from "@/components/KasiDashLogo";
import { Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-card/30 border-t border-white/5 px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <KasiDashLogo size="md" />
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Fast deliveries built for South African townships.
            </p>
            <a href="mailto:unity@kasidash.co.za" className="flex items-center gap-2 text-sm text-primary hover:underline mt-3">
              <Mail className="w-4 h-4" /> unity@kasidash.co.za
            </a>
            <div className="mt-4">
              <a
                href="https://www.bark.com/en/za/company/kasidash-and-buildforge-ptyltd/Qw61nL/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/bark-badge.png" alt="Bark Professional" className="h-10 w-auto" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Platform</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
              <Link href="/order" className="hover:text-primary transition-colors">Place Order</Link>
              <Link href="/careers" className="hover:text-primary transition-colors">Careers</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            </div>
          </div>

          {/* Partners */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Partners</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/apply/driver" className="hover:text-primary transition-colors">Become a Driver</Link>
              <Link href="/apply/vendor" className="hover:text-primary transition-colors">List Your Store</Link>
              <p className="text-primary text-xs font-semibold mt-1">R250/month per catalogue</p>
              <div className="border-t border-white/5 pt-2 mt-1 flex flex-col gap-1.5">
                <Link href="/driver/login" className="hover:text-primary transition-colors text-xs">Driver Portal →</Link>
                <Link href="/vendor/login" className="hover:text-primary transition-colors text-xs">Vendor Portal →</Link>
                <Link href="/staff/login" className="hover:text-primary transition-colors text-xs">Staff Login →</Link>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Legal</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
              <p className="text-xs text-muted-foreground mt-1">POPIA Compliant</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {year} Kasi Dash. All rights reserved. South Africa.</p>
          <p>Built for the kasi.</p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-muted-foreground/60">
          <span>Reg. No. 2026/362826/07</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span>Jurisdiction: Republic of South Africa</span>
          <span className="hidden sm:inline text-white/10">|</span>
          <span>Structure: Web-based Enterprise</span>
        </div>
      </div>
    </footer>
  );
}
