import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import KasiDashLogo from "@/components/KasiDashLogo";
import {
  LayoutDashboard,
  Truck,
  Users,
  Briefcase,
  ListChecks,
  LogOut,
  Menu,
  X,
  MapPin,
  ShoppingBag,
  Store,
  KeyRound,
  Hammer,
  TrendingUp,
} from "lucide-react";

interface StaffSession { username: string; role: string; isAuthenticated: boolean; }
interface StaffLayoutProps { children: React.ReactNode; }

const NAV = [
  { label: "Dashboard",            href: "/staff",                          icon: LayoutDashboard },
  { label: "Orders",               href: "/staff/orders",                   icon: ShoppingBag },
  { label: "Live Driver Map",      href: "/staff/map",                      icon: MapPin,    badge: "Live" },
  { label: "Catalogues",           href: "/staff/catalogues",               icon: Store },
  { label: "Vendor Accounts",      href: "/staff/vendors",                  icon: KeyRound },
  { label: "Driver Applications",  href: "/staff/applications/drivers",     icon: Truck },
  { label: "Vendor Applications",  href: "/staff/applications/vendors",     icon: Users },
  { label: "Job Applications",     href: "/staff/applications/jobs",        icon: Briefcase },
  { label: "Manage Careers",       href: "/staff/careers",                  icon: ListChecks },
  { label: "BuildForge",           href: "/staff/buildforge",               icon: Hammer },
  { label: "Investor Leads",       href: "/staff/invest",                   icon: TrendingUp },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [location, navigate] = useLocation();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/staff/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.isAuthenticated) navigate("/staff/login");
        else setSession(data);
      })
      .catch(() => navigate("/staff/login"));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch("/api/staff/logout", { method: "POST", credentials: "include" });
    navigate("/staff/login");
  };

  if (!session) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <KasiDashLogo size="md" />
        <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">{session.username}</p>
            <p className="text-xs text-muted-foreground capitalize">{session.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-card/30 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-72 bg-card border-r border-white/5 z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="md:hidden flex items-center gap-4 p-4 border-b border-white/5 bg-background/80 backdrop-blur sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <KasiDashLogo size="sm" />
        </div>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
