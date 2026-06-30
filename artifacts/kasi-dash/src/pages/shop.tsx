import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ShoppingCart, Search, Store, Package, Plus, Check, Clock,
  UtensilsCrossed, ShoppingBasket, Smartphone, Sparkles, Shirt, Cross,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

interface CatalogueItem {
  id: string; catalogueId: string; name: string; description?: string;
  price: number; imageUrl?: string; category?: string; inStock: boolean;
}
interface Catalogue {
  id: string; vendorName: string; description?: string; category: string;
  coverImage?: string; township?: string; storeHours?: string; items: CatalogueItem[];
}

const FIXED_CATEGORIES = [
  { label: "All",         icon: Store },
  { label: "Restaurant",  icon: UtensilsCrossed },
  { label: "Groceries",   icon: ShoppingBasket },
  { label: "Gadgets",     icon: Smartphone },
  { label: "Perfumes",    icon: Sparkles },
  { label: "Clothing",    icon: Shirt },
  { label: "Pharmacy",    icon: Cross },
] as const;

export default function Shop() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [added, setAdded] = useState<string | null>(null);
  const { add, count } = useCart();

  useEffect(() => {
    const fetchAll = async () => {
      const res = await fetch("/api/catalogues");
      if (res.ok) {
        const cats: Omit<Catalogue, "items">[] = await res.json();
        const withItems = await Promise.all(
          cats.map((c) => fetch(`/api/catalogues/${c.id}`).then((r) => r.json()))
        );
        setCatalogues(withItems);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = catalogues
    .filter((c) => activeCategory === "All" || c.category === activeCategory)
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
          (i.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
          c.vendorName.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((c) => !search || c.items.length > 0 || c.vendorName.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (item: CatalogueItem, catalogue: Catalogue) => {
    add({ id: item.id, catalogueId: catalogue.id, catalogueName: catalogue.vendorName, name: item.name, price: item.price, imageUrl: item.imageUrl });
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-4 pt-28 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Shop Local</h1>
              <p className="text-muted-foreground">Browse township vendors. Add to cart, we'll deliver.</p>
            </div>
            <Link href="/cart">
              <Button className="bg-primary text-primary-foreground font-bold gap-2 relative">
                <ShoppingCart className="w-4 h-4" />
                Cart
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground text-background text-xs font-black flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-white/10 focus-visible:ring-primary"
            />
          </div>

          {/* Fixed category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FIXED_CATEGORIES.map(({ label, icon: Icon }) => {
              const active = activeCategory === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                      : "bg-card text-muted-foreground border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="h-72 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}
          </div>
        ) : catalogues.length === 0 ? (
          <div className="text-center py-32 text-muted-foreground">
            <Store className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold mb-2">No stores published yet</p>
            <p className="text-sm">Vendor catalogues will appear here once published by our team.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-bold mb-1">Nothing found</p>
            <p className="text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {filtered.map((catalogue, ci) => {
              const CatIcon = FIXED_CATEGORIES.find(c => c.label === catalogue.category)?.icon ?? Store;
              return (
                <motion.div key={catalogue.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
                  {/* Vendor header */}
                  <div className="flex items-start gap-4 mb-6">
                    {catalogue.coverImage ? (
                      <img
                        src={catalogue.coverImage}
                        alt={catalogue.vendorName}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <CatIcon className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-xl font-black">{catalogue.vendorName}</h2>
                        <Badge className="text-xs bg-primary/10 text-primary border border-primary/20">{catalogue.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                        {catalogue.township && <span>{catalogue.township}</span>}
                        {catalogue.storeHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {catalogue.storeHours}
                          </span>
                        )}
                      </div>
                      {catalogue.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{catalogue.description}</p>
                      )}
                    </div>
                  </div>

                  {catalogue.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-20">No items in this catalogue yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {catalogue.items.filter((i) => i.inStock).map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all group cursor-default"
                        >
                          {item.imageUrl ? (
                            <div className="aspect-square overflow-hidden bg-black/20">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          ) : (
                            <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                              <Package className="w-8 h-8 text-primary/30" />
                            </div>
                          )}
                          <div className="p-3">
                            <p className="font-bold text-sm leading-snug mb-1 line-clamp-2">{item.name}</p>
                            {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-primary font-black text-sm">R {item.price.toFixed(2)}</span>
                              <button
                                onClick={() => handleAdd(item, catalogue)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  added === item.id
                                    ? "bg-green-500 text-white scale-90"
                                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110"
                                }`}
                              >
                                <AnimatePresence mode="wait">
                                  {added === item.id ? (
                                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                      <Check className="w-4 h-4" />
                                    </motion.div>
                                  ) : (
                                    <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                      <Plus className="w-4 h-4" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
