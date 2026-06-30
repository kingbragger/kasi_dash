import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

interface Order {
  id: string; status: string; paymentStatus: string;
  pickupAddress: string; deliveryAddress: string;
  customerName: string; customerPhone: string; customerEmail?: string;
  description?: string; amount: number; driverId?: string; driverName?: string;
  createdAt: string;
}
interface Driver { id: string; fullName: string; vehicleType: string; township: string; }

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_transit: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled:  "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    const [ordersRes, driversRes] = await Promise.all([
      fetch("/api/staff/orders/all", { credentials: "include" }),
      fetch("/api/staff/drivers", { credentials: "include" }),
    ]);
    if (ordersRes.ok) setOrders(await ordersRes.json());
    if (driversRes.ok) setDrivers(await driversRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const assignDriver = async (orderId: string) => {
    const driverId = selectedDriver[orderId];
    if (!driverId) return;
    setAssigning(orderId);
    try {
      const res = await fetch(`/api/staff/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ driverId }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Driver assigned successfully" });
      fetchAll();
    } catch {
      toast({ title: "Error", description: "Could not assign driver", variant: "destructive" });
    } finally { setAssigning(null); }
  };

  const pending = orders.filter((o) => o.status === "pending");
  const active  = orders.filter((o) => ["accepted","in_transit"].includes(o.status));
  const done    = orders.filter((o) => ["delivered","cancelled"].includes(o.status));

  const OrderCard = ({ order }: { order: Order }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-white/5 rounded-2xl overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {order.customerName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{order.customerName}</p>
            <p className="text-xs text-muted-foreground truncate">{order.deliveryAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-primary font-bold text-sm">R {order.amount.toFixed(2)}</span>
          <Badge className={`capitalize text-xs border ${STATUS_COLORS[order.status] ?? ""}`}>
            {order.status.replace("_", " ")}
          </Badge>
          {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded === order.id && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              ["Phone", order.customerPhone],
              ["Email", order.customerEmail ?? "N/A"],
              ["Payment", order.paymentStatus],
              ["Pickup", order.pickupAddress],
              ["Delivery", order.deliveryAddress],
              ["Placed", new Date(order.createdAt).toLocaleString("en-ZA")],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                <p className="font-medium text-xs break-words">{val}</p>
              </div>
            ))}
          </div>

          {order.description && (
            <p className="text-sm bg-background/50 rounded-lg p-2 border border-white/5 text-muted-foreground">{order.description}</p>
          )}

          {/* Assign driver */}
          {!order.driverId && drivers.length > 0 && order.status === "pending" && (
            <div className="flex gap-2 items-center">
              <Select value={selectedDriver[order.id] ?? ""} onValueChange={(v) => setSelectedDriver((p) => ({ ...p, [order.id]: v }))}>
                <SelectTrigger className="bg-background border-white/10 text-sm flex-1">
                  <SelectValue placeholder="Assign a driver…" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.fullName} · {d.vehicleType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground font-bold"
                disabled={!selectedDriver[order.id] || assigning === order.id}
                onClick={() => assignDriver(order.id)}
              >
                {assigning === order.id ? "…" : "Assign"}
              </Button>
            </div>
          )}

          {order.driverId && (
            <p className="text-sm text-muted-foreground">
              Driver: <span className="text-white font-medium">{order.driverName}</span>
            </p>
          )}

          <div className="flex gap-2">
            <Link href={`/track/${order.id}`}>
              <Button variant="outline" size="sm" className="border-white/10 hover:border-primary hover:text-primary gap-1 text-xs">
                <LinkIcon className="w-3 h-3" /> Track Link
              </Button>
            </Link>
            <Link href={`/receipt/${order.id}`}>
              <Button variant="outline" size="sm" className="border-white/10 hover:border-primary hover:text-primary gap-1 text-xs">
                Receipt
              </Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <StaffLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-black">Orders</h1>
        </div>
        <p className="text-muted-foreground">Manage all deliveries and assign drivers</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}</div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-3">Pending · {pending.length}</h2>
              <div className="space-y-2">{pending.map((o) => <OrderCard key={o.id} order={o} />)}</div>
            </section>
          )}
          {active.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Active · {active.length}</h2>
              <div className="space-y-2">{active.map((o) => <OrderCard key={o.id} order={o} />)}</div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Completed · {done.length}</h2>
              <div className="space-y-2">{done.map((o) => <OrderCard key={o.id} order={o} />)}</div>
            </section>
          )}
          {orders.length === 0 && (
            <div className="text-center py-24 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No orders yet</p>
            </div>
          )}
        </>
      )}
    </StaffLayout>
  );
}
