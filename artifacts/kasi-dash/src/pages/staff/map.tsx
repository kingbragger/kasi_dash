import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverMapEntry {
  id: string; name: string; vehicleType: string; township: string; phone: string;
  lat: number | null; lng: number | null; lastSeen: string | null;
}

const makeDriverIcon = (color: string) => L.divIcon({
  html: `<div style="background:${color};border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:2px solid #000;font-size:16px;box-shadow:0 0 10px ${color}80">🚗</div>`,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const activeIcon = makeDriverIcon("#D4AF37");
const staleIcon = makeDriverIcon("#6b7280");

export default function StaffMap() {
  const [drivers, setDrivers] = useState<DriverMapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/drivers/locations", { credentials: "include" });
      if (res.ok) {
        setDrivers(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const id = setInterval(fetchLocations, 8000);
    return () => clearInterval(id);
  }, [fetchLocations]);

  const located = drivers.filter((d) => d.lat != null && d.lng != null);
  const center: [number, number] = located.length > 0 && located[0].lat != null && located[0].lng != null
    ? [located[0].lat, located[0].lng]
    : [-26.2041, 28.0473];

  const isRecent = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 2 * 60 * 1000;
  };

  return (
    <StaffLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <MapPin className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-black">Live Driver Map</h1>
          </div>
          <p className="text-muted-foreground">Real time driver locations, updates every 8 seconds</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10 gap-2" onClick={fetchLocations}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Drivers", value: drivers.length },
          { label: "Broadcasting", value: located.length },
          { label: "Active (2 min)", value: drivers.filter((d) => isRecent(d.lastSeen)).length },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-white/5 rounded-2xl overflow-hidden mb-6">
        {loading ? (
          <div className="h-96 flex items-center justify-center bg-card">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-[480px]">
            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%", background: "#1a1a1a" }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
              />
              {located.map((driver) => (
                <Marker
                  key={driver.id}
                  position={[driver.lat!, driver.lng!]}
                  icon={isRecent(driver.lastSeen) ? activeIcon : staleIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{driver.name}</p>
                      <p className="text-gray-500">{driver.vehicleType} · {driver.township}</p>
                      <p className="text-gray-500">{driver.phone}</p>
                      {driver.lastSeen && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last seen: {new Date(driver.lastSeen).toLocaleTimeString("en-ZA")}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
        {lastUpdated && (
          <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Auto-refreshing
            </span>
            <span>Last updated: {lastUpdated.toLocaleTimeString("en-ZA")}</span>
          </div>
        )}
      </motion.div>

      {/* Driver roster */}
      <h2 className="font-bold text-lg mb-3">Driver Roster</h2>
      <div className="space-y-2">
        {drivers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No active drivers yet. Activate drivers from the Applications page.</p>
          </div>
        ) : (
          drivers.map((d) => (
            <div key={d.id} className="bg-card border border-white/5 rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {d.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.vehicleType} · {d.township}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {d.lat != null ? (
                  <span className={`text-xs flex items-center gap-1 ${isRecent(d.lastSeen) ? "text-green-400" : "text-yellow-400"}`}>
                    <MapPin className="w-3 h-3" />
                    {isRecent(d.lastSeen) ? "Live" : "Last seen " + new Date(d.lastSeen!).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No location</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </StaffLayout>
  );
}
