import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Truck, MapPin, LogOut, Navigation, CheckCircle2, Package, Clock, RefreshCw } from "lucide-react";
import KasiDashLogo from "@/components/KasiDashLogo";

interface DriverSession { id: string; name: string; vehicleType: string; township: string; }
interface Order {
  id: string; pickupAddress: string; deliveryAddress: string; customerName: string;
  customerPhone: string; description?: string; amount: number;
  status: string; paymentStatus: string; createdAt: string;
}

const STATUS_FLOW: Record<string, { next: string; label: string; color: string }> = {
  pending:    { next: "accepted",   label: "Accept Order",       color: "bg-primary text-primary-foreground" },
  accepted:   { next: "in_transit", label: "Mark as Picked Up",  color: "bg-blue-500 text-white" },
  in_transit: { next: "delivered",  label: "Mark as Delivered",  color: "bg-green-500 text-white" },
};

const STATUS_BADGE: Record<string, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_transit: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered:  "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function DriverDashboard() {
  const [session, setSession] = useState<DriverSession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/driver/orders", { credentials: "include" });
    if (res.ok) setOrders(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/driver/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAuthenticated) { navigate("/driver/login"); return; }
        setSession(d);
        setLoading(false);
        fetchOrders();
      })
      .catch(() => navigate("/driver/login"));
  }, [navigate, fetchOrders]);

  useEffect(() => {
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (!trackingActive || !navigator.geolocation) return;
    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch("/api/driver/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    };
    sendLocation();
    const id = setInterval(sendLocation, 10000);
    return () => clearInterval(id);
  }, [trackingActive]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/driver/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Status updated" });
      fetchOrders();
    } catch {
      toast({ title: "Error", description: "Could not update status", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/driver/logout", { method: "POST", credentials: "include" });
    navigate("/driver/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = orders.filter((o) => o.status === "delivered");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card/50 border-b border-white/5 px-4 py-4 sticky top-0 z-30 backdrop-blur">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <KasiDashLogo size="sm" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTrackingActive((v) => !v)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                trackingActive
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-white/5 text-muted-foreground border-white/10"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${trackingActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
              {trackingActive ? "Live" : "Go Live"}
            </button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-black mb-1">Hi, {session?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm">{session?.vehicleType} · {session?.township}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Active", value: activeOrders.length, icon: <Package className="w-4 h-4" />, color: "text-primary" },
            { label: "Delivered", value: completedOrders.length, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-400" },
            { label: "Earnings", value: `R ${completedOrders.reduce((s, o) => s + o.amount, 0).toFixed(0)}`, icon: <Truck className="w-4 h-4" />, color: "text-primary" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-xl p-4 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tracking prompt */}
        {!trackingActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <Navigation className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Location sharing is off</p>
              <p className="text-xs text-muted-foreground">Tap "Go Live" to share your location with the admin and customers.</p>
            </div>
          </motion.div>
        )}

        {/* Active Orders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Active Orders</h2>
            <button onClick={fetchOrders} className="text-muted-foreground hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No active orders. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order, i) => {
                const nextStep = STATUS_FLOW[order.status];
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-white/5 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`capitalize text-xs border ${STATUS_BADGE[order.status] ?? ""}`}>
                          {order.status.replace("_", " ")}
                        </Badge>
                        <span className="text-primary font-bold text-sm">R {order.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs font-bold">P</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="font-medium">{order.pickupAddress}</p>
                        </div>
                      </div>
                      <div className="w-px h-4 bg-white/10 ml-2.5" />
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-3 h-3 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Deliver To</p>
                          <p className="font-medium">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    {order.description && (
                      <p className="text-xs text-muted-foreground bg-background/50 rounded-lg p-2 mb-4 border border-white/5">
                        {order.description}
                      </p>
                    )}

                    {nextStep && (
                      <Button
                        className={`w-full font-bold ${nextStep.color}`}
                        disabled={updating === order.id}
                        onClick={() => updateStatus(order.id, nextStep.next)}
                      >
                        {updating === order.id ? "Updating..." : nextStep.label}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-4">Completed Today</h2>
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-card/40 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">R {order.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
