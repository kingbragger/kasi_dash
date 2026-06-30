import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import KasiDashLogo from "@/components/KasiDashLogo";
import {
  Store, LogOut, Plus, Trash2, Edit2, Check, X,
  Package, Clock, MapPin, ImageIcon, RefreshCw,
} from "lucide-react";

interface VendorSession { id: string; businessName: string; catalogueId: string | null; }
interface CatalogueItem { id: string; name: string; description?: string; price: number; imageUrl?: string; category?: string; inStock: boolean; }
interface Catalogue { id: string; vendorName: string; description?: string; category: string; coverImage?: string; township?: string; storeHours?: string; isActive: boolean; items: CatalogueItem[]; }
interface ItemForm { name: string; description?: string; price: number; imageUrl?: string; category?: string; }
interface StoreForm { description?: string; storeHours?: string; coverImage?: string; township?: string; }

export default function VendorDashboard() {
  const [session, setSession] = useState<VendorSession | null>(null);
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);
  const [editingStore, setEditingStore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const itemForm = useForm<ItemForm>();
  const storeForm = useForm<StoreForm>();

  const loadCatalogue = useCallback(async () => {
    const res = await fetch("/api/vendor/catalogue", { credentials: "include" });
    if (res.ok) setCatalogue(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/vendor/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAuthenticated) { navigate("/vendor/login"); return; }
        setSession(d);
        if (d.catalogueId) loadCatalogue().finally(() => setLoading(false));
        else setLoading(false);
      })
      .catch(() => navigate("/vendor/login"));
  }, [navigate, loadCatalogue]);

  const handleLogout = async () => {
    await fetch("/api/vendor/logout", { method: "POST", credentials: "include" });
    navigate("/vendor/login");
  };

  const handleSaveItem = async (data: ItemForm) => {
    setSaving(true);
    try {
      const url = editingItem ? `/api/vendor/catalogue/items/${editingItem.id}` : "/api/vendor/catalogue/items";
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast({ title: editingItem ? "Item updated" : "Item added" });
      itemForm.reset();
      setShowItemForm(false);
      setEditingItem(null);
      await loadCatalogue();
    } catch {
      toast({ title: "Error", description: "Failed to save item", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/vendor/catalogue/items/${id}`, { method: "DELETE", credentials: "include" });
      toast({ title: "Item removed" });
      await loadCatalogue();
    } catch {
      toast({ title: "Error", description: "Failed to remove item", variant: "destructive" });
    } finally { setDeletingId(null); }
  };

  const handleToggleStock = async (item: CatalogueItem) => {
    await fetch(`/api/vendor/catalogue/items/${item.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ inStock: !item.inStock }),
    });
    await loadCatalogue();
  };

  const handleSaveStore = async (data: StoreForm) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/catalogue", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Store info updated" });
      setEditingStore(false);
      await loadCatalogue();
    } catch {
      toast({ title: "Error", description: "Failed to update store", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const startEditItem = (item: CatalogueItem) => {
    setEditingItem(item);
    itemForm.reset({ name: item.name, description: item.description, price: item.price, imageUrl: item.imageUrl, category: item.category });
    setShowItemForm(true);
  };

  const startEditStore = () => {
    if (!catalogue) return;
    storeForm.reset({ description: catalogue.description, storeHours: catalogue.storeHours, coverImage: catalogue.coverImage, township: catalogue.township });
    setEditingStore(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KasiDashLogo size="sm" />
            <div className="hidden sm:block border-l border-white/10 pl-4">
              <p className="text-xs text-muted-foreground">Vendor Portal</p>
              <p className="text-sm font-bold text-primary">{session?.businessName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign Out</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        {!catalogue ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-white/5 rounded-2xl p-12 text-center"
          >
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No catalogue linked</h2>
            <p className="text-muted-foreground text-sm">Your account has no catalogue assigned yet. Contact admin at <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a></p>
          </motion.div>
        ) : (
          <>
            {/* Store Info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">{catalogue.vendorName}</h2>
                    <Badge className={catalogue.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}>
                      {catalogue.isActive ? "Live" : "Not Live"}
                    </Badge>
                  </div>
                </div>
                {!editingStore && (
                  <Button variant="ghost" size="sm" onClick={startEditStore} className="text-muted-foreground hover:text-primary gap-2">
                    <Edit2 className="w-4 h-4" /> Edit
                  </Button>
                )}
              </div>

              {editingStore ? (
                <form onSubmit={storeForm.handleSubmit(handleSaveStore)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Store Hours</Label>
                      <Input {...storeForm.register("storeHours")} placeholder="e.g. Mon–Sat 8am–8pm" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Township</Label>
                      <Input {...storeForm.register("township")} placeholder="e.g. Soweto" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Cover Image URL</Label>
                      <Input {...storeForm.register("coverImage")} placeholder="https://..." className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Textarea {...storeForm.register("description")} placeholder="Describe your store..." className="bg-background border-white/10 focus-visible:ring-primary text-sm resize-none" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110" disabled={saving}>
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Save</>}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStore(false)}><X className="w-4 h-4 mr-1" />Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Hours</p>
                    <p className="font-medium">{catalogue.storeHours || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" /> Township</p>
                    <p className="font-medium">{catalogue.township || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-medium">{catalogue.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Products</p>
                    <p className="font-medium">{catalogue.items.length}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Products</h3>
                <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2"
                  onClick={() => { setEditingItem(null); itemForm.reset(); setShowItemForm(true); }}>
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </div>

              <AnimatePresence>
                {showItemForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="bg-card border border-primary/20 rounded-xl p-5 mb-4 overflow-hidden"
                  >
                    <h4 className="font-bold text-sm mb-4">{editingItem ? "Edit Product" : "New Product"}</h4>
                    <form onSubmit={itemForm.handleSubmit(handleSaveItem)} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Product Name *</Label>
                          <Input {...itemForm.register("name", { required: true })} placeholder="e.g. Boerewors Roll" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Price (R) *</Label>
                          <Input {...itemForm.register("price", { required: true, valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Category</Label>
                          <Input {...itemForm.register("category")} placeholder="e.g. Mains" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Image URL</Label>
                          <Input {...itemForm.register("imageUrl")} placeholder="https://..." className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Description</Label>
                          <Textarea {...itemForm.register("description")} placeholder="Short description..." className="bg-background border-white/10 focus-visible:ring-primary text-sm resize-none" rows={2} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110" disabled={saving}>
                          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />{editingItem ? "Update" : "Add"}</>}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setShowItemForm(false); setEditingItem(null); itemForm.reset(); }}>
                          <X className="w-4 h-4 mr-1" />Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {catalogue.items.length === 0 ? (
                <div className="bg-card border border-white/5 rounded-xl p-10 text-center">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No products yet. Add your first product above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {catalogue.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="bg-card border border-white/5 rounded-xl px-4 py-3 flex items-center gap-4"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          {item.category && <span className="text-xs text-muted-foreground hidden sm:block">· {item.category}</span>}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="text-sm font-bold text-primary">R{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground hidden sm:block">{item.inStock ? "In stock" : "Out"}</span>
                          <Switch checked={item.inStock} onCheckedChange={() => handleToggleStock(item)} />
                        </div>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-primary" onClick={() => startEditItem(item)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(item.id)} disabled={deletingId === item.id}>
                          {deletingId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
