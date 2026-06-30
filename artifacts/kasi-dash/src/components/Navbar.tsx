import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import KasiDashLogo from "@/components/KasiDashLogo";
import { ShoppingCart, Menu, X, LogOut, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser, useClerk, Show } from "@clerk/react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Careers", href: "/careers" },
  { label: "About", href: "/about" },
  { label: "BuildForge", href: "/buildforge" },
  { label: "Invest", href: "/invest" },
  { label: "Become a Driver", href: "/apply/driver" },
  { label: "Partner With Us", href: "/apply/vendor" },
];

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Account";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
      >
        <User className="w-3.5 h-3.5" />
        <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </p>
            </div>
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { count } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <KasiDashLogo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className={`hover:text-primary transition-colors ${location === href ? "text-primary" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
          </Link>

          <Show when="signed-in">
            <UserMenu />
          </Show>

          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hidden sm:flex">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 hidden sm:flex shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                Sign Up
              </Button>
            </Link>
          </Show>

          <Link href="/order">
            <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 hidden lg:flex shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              Order Now
            </Button>
          </Link>

          <button onClick={() => setOpen((v) => !v)} className="md:hidden text-muted-foreground hover:text-white transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-card/95 backdrop-blur border-b border-white/5 px-4 pb-4"
          >
            <nav className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`py-2.5 text-sm font-medium transition-colors ${location === href ? "text-primary" : "text-muted-foreground hover:text-white"}`}>
                  {label}
                </Link>
              ))}
              <Show when="signed-out">
                <div className="flex gap-2 mt-2">
                  <Link href="/sign-in" onClick={() => setOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full bg-primary text-primary-foreground font-bold">Sign Up</Button>
                  </Link>
                </div>
              </Show>
              <Show when="signed-in">
                <MobileUserSection onClose={() => setOpen(false)} />
              </Show>
              <Link href="/order" onClick={() => setOpen(false)}>
                <Button size="sm" className="mt-2 w-full bg-primary text-primary-foreground font-bold">Order Now</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileUserSection({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="border-t border-white/5 pt-2 mt-1">
      <p className="text-xs text-muted-foreground px-1 mb-1">
        {user?.emailAddresses?.[0]?.emailAddress}
      </p>
      <button
        onClick={() => { signOut(); onClose(); }}
        className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}
