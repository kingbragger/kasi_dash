import { useEffect, useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Package, MapPin, Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import KasiDashLogo from "@/components/KasiDashLogo";

interface TrackingData {
  order: {
    id: string; status: string; paymentStatus: string;
    pickupAddress: string; deliveryAddress: string;
    customerName: string; customerPhone: string;
    description?: string; amount: number; createdAt: string;
    driverName?: string;
  };
  driverLocation: { lat: number; lng: number } | null;
  driverInfo: { name: string; vehicleType: string; phone?: string } | null;
}

const STATUS_STEPS = [
  { key: "pending",    label: "Order placed",     icon: Package },
  { key: "accepted",   label: "Driver assigned",   icon: Truck },
  { key: "in_transit", label: "On the way",        icon: MapPin },
  { key: "delivered",  label: "Delivered",         icon: CheckCircle2 },
];

const driverIcon = L.divIcon({
  html: `<div style="background:#D4AF37;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:3px solid #000;box-shadow:0 0 12px rgba(212,175,55,0.6)">🚗</div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destIcon = L.divIcon({
  html: `<div style="background:#22D3EE;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:2px solid #000">📦</div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const STATUS_COLOR: Record<string, string> = {
  pending:    "text-yellow-400",
  accepted:   "text-blue-400",
  in_transit: "text-purple-400",
  delivered:  "text-green-400",
  cancelled:  "text-red-400",
};

export default function TrackOrder() {
  const [, params] = useRoute("/track/:orderId");
  const orderId = params?.orderId ?? "";
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState(false);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${orderId}`);
      if (!res.ok) { setError(true); return; }
      setData(await res.json());
    } catch { setError(true); }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    fetchTracking();
    const id = setInterval(fetchTracking, 8000);
    return () => clearInterval(id);
  }, [orderId, fetchTracking]);

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === data?.order?.status);
  const mapCenter: [number, number] = data?.driverLocation
    ? [data.driverLocation.lat, data.driverLocation.lng]
    : [-26.2041, 28.0473];

  if (error) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">Order not found</h2>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { order, driverLocation, driverInfo } = data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card/50 border-b border-white/5 px-4 py-4 sticky top-0 z-30 backdrop-blur">
        <div className="container mx-auto max-w-xl flex items-center justify-between">
          <Link href="/"><KasiDashLogo size="sm" /></Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="relative flex h-2 w-2">
              {order.status !== "delivered" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${order.status === "delivered" ? "bg-green-400" : "bg-primary"}`} />
            </span>
            <span className={`font-medium capitalize ${STATUS_COLOR[order.status] ?? ""}`}>
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-xl px-4 py-6 space-y-5">
        {/* Progress steps */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-white/5 mx-6" />
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const active = i === currentStepIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? "bg-primary/20 border-primary text-primary" : "bg-card border-white/10 text-muted-foreground"
                  } ${active ? "shadow-[0_0_15px_rgba(212,175,55,0.3)]" : ""}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs text-center leading-tight ${done ? "text-white" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Live map */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <p className="font-medium text-sm">Live Map</p>
            {driverLocation ? (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live tracking
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Waiting for driver location…</span>
            )}
          </div>
          <div className="h-64">
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%", background: "#1a1a1a" }} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
              />
              {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                  <Popup>{driverInfo?.name ?? "Driver"} · {driverInfo?.vehicleType}</Popup>
                </Marker>
              )}
              {driverLocation && (
                <Marker position={mapCenter} icon={destIcon}>
                  <Popup>Delivery destination</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </motion.div>

        {/* Driver info */}
        {driverInfo && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {driverInfo.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{driverInfo.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{driverInfo.vehicleType}</p>
            </div>
            {driverInfo.phone && (
              <a href={`tel:${driverInfo.phone}`} className="ml-auto">
                <Button variant="outline" size="sm" className="border-white/10 hover:border-primary hover:text-primary text-xs">
                  Call Driver
                </Button>
              </a>
            )}
          </motion.div>
        )}

        {/* Order details */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="font-bold">Order Details</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs text-primary font-bold">P</div>
              <div><p className="text-xs text-muted-foreground">Pickup</p><p className="font-medium">{order.pickupAddress}</p></div>
            </div>
            <div className="w-px h-3 bg-white/10 ml-3" />
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-xs text-secondary font-bold">D</div>
              <div><p className="text-xs text-muted-foreground">Delivery</p><p className="font-medium">{order.deliveryAddress}</p></div>
            </div>
          </div>
          {order.description && <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3 border border-white/5">{order.description}</p>}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-muted-foreground text-sm">Amount</span>
            <span className="font-bold text-primary">R {order.amount.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Receipt link */}
        {order.status === "delivered" && (
          <Link href={`/receipt/${order.id}`}>
            <Button className="w-full bg-primary text-primary-foreground font-bold">
              <Package className="w-4 h-4 mr-2" /> View Receipt
            </Button>
          </Link>
        )}

        {/* Order placed time */}
        <p className="text-center text-xs text-muted-foreground">
          Order placed {new Date(order.createdAt).toLocaleString("en-ZA")} · Updates every 8 seconds
        </p>
      </div>
    </div>
  );
}
