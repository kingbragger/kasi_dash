import { motion } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Link } from "wouter";
import { Truck, Users, Briefcase, ShoppingBag, MapPin, ListChecks, TrendingUp, ArrowRight } from "lucide-react";
import { useGetStaffStats } from "@workspace/api-client-react";

export default function StaffDashboard() {
  const { data: stats } = useGetStaffStats();

  const CARDS = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, sub: "all time", icon: ShoppingBag, color: "text-primary", href: "/staff/orders" },
    { label: "Active Deliveries", value: stats?.activeOrders ?? 0, sub: "in transit now", icon: Truck, color: "text-purple-400", href: "/staff/orders" },
    { label: "Total Revenue", value: `R ${(stats?.totalRevenue ?? 0).toFixed(0)}`, sub: "paid orders", icon: TrendingUp, color: "text-green-400", href: "/staff/orders" },
    { label: "Waitlist", value: stats?.waitlistCount ?? 0, sub: "signups", icon: Users, color: "text-blue-400", href: "/staff" },
  ];

  const ACTIONS = [
    { label: "Live Driver Map",     href: "/staff/map",                  icon: MapPin,       desc: "See all driver locations in real time" },
    { label: "Manage Orders",       href: "/staff/orders",               icon: ShoppingBag,  desc: "Assign drivers, track deliveries" },
    { label: "Driver Applications", href: "/staff/applications/drivers", icon: Truck,        desc: "Review and activate new drivers" },
    { label: "Vendor Applications", href: "/staff/applications/vendors", icon: Users,        desc: "Review partner businesses" },
    { label: "Job Applications",    href: "/staff/applications/jobs",    icon: Briefcase,    desc: "Review applicants for open roles" },
    { label: "Manage Careers",      href: "/staff/careers",              icon: ListChecks,   desc: "Create and publish job listings" },
    { label: "Investor Leads",      href: "/staff/invest",               icon: TrendingUp,   desc: "View investment interest submissions" },
  ];

  return (
    <StaffLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to the Kasi Dash admin panel.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link href={card.href}>
                <div className="bg-card border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all group">
                  <div className={`${card.color} mb-3`}><Icon className="w-5 h-5" /></div>
                  <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                  <p className="font-medium text-sm mt-0.5">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <h2 className="font-bold text-lg mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACTIONS.map(({ label, href, icon: Icon, desc }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Link href={href}>
              <div className="bg-card border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-primary/20 hover:bg-card/70 transition-all group flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </StaffLayout>
  );
}
