import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Store, Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check, X,
  Package, Clock, UtensilsCrossed, ShoppingBasket, Smartphone, Sparkles, Shirt, Cross, ImageIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

const CATEGORIES = ["Restaurant", "Groceries", "Gadgets", "Perfumes", "Clothing", "Pharmacy"];
const CAT_ICONS: Record<string, React.ReactNode> = {
  Restaurant: <UtensilsCrossed className="w-4 h-4" />,
  Groceries:  <ShoppingBasket className="w-4 h-4" />,
  Gadgets:    <Smartphone className="w-4 h-4" />,
  Perfumes:   <Sparkles className="w-4 h-4" />,
  Clothing:   <Shirt className="w-4 h-4" />,
  Pharmacy:   <Cross className="w-4 h-4" />,
};

interface CatalogueItem { id: string; name: string; description?: string; price: number; imageUrl?: string; category?: string; inStock: boolean; }
interface Catalogue { id: string; vendorName: string; description?: string; category: string; coverImage?: string; township?: string; storeHours?: string; isActive: boolean; createdAt: string; items: CatalogueItem[]; }
interface CatForm { vendorName: string; description?: string; category: string; township?: string; coverImage?: string; storeHours?: string; }
interface ItemForm { name: string; description?: string; price: number; imageUrl?: string; category?: string; }

export default function StaffCatalogues() {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Catalogue | null>(null);
  const [showItemForm, setShowItemForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ catId: string; item: CatalogueItem } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const catForm = useForm<CatForm>({ defaultValues: { category: "Restaurant" } });
  const itemForm = useForm<ItemForm>();

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/staff/catalogues", { credentials: "include" });
    if (res.ok) setCatalogues(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const saveCatalogue = async (data: CatForm) => {
    setSaving(true);
    try {
      const url = editingCat ? `/api/staff/catalogues/${editingCat.id}` : "/api/staff/catalogues";
      const method = editingCat ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast({ title: editingCat ? "Catalogue updated" : "Catalogue created" });
      setShowCatForm(false);
      setEditingCat(null);
      catForm.reset({ category: "Restaurant" });
      fetch_();
    } catch { toast({ title: "Error", description: "Could not save catalogue", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const deleteCatalogue = async (id: string) => {
    if (!confirm("Delete this catalogue and all its items?")) return;
    await fetch(`/api/staff/catalogues/${id}`, { method: "DELETE", credentials: "include" });
    toast({ title: "Catalogue deleted" });
    fetch_();
  };

  const toggleActive = async (cat: Catalogue) => {
    await fetch(`/api/staff/catalogues/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ isActive: !cat.isActive }) });
    fetch_();
  };

  const saveItem = async (catId: string, data: ItemForm) => {
    setSaving(true);
    try {
      const url = editingItem ? `/api/staff/catalogues/${catId}/items/${editingItem.item.id}` : `/api/staff/catalogues/${catId}/items`;
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...data, price: Number(data.price) }) });
      if (!res.ok) throw new Error();
      toast({ title: editingItem ? "Item updated" : "Item added" });
      setShowItemForm(null);
      setEditingItem(null);
      itemForm.reset();
      fetch_();
    } catch { toast({ title: "Error", description: "Could not save item", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const deleteItem = async (catId: string, itemId: string) => {
    await fetch(`/api/staff/catalogues/${catId}/items/${itemId}`, { method: "DELETE", credentials: "include" });
    toast({ title: "Item removed" });
    fetch_();
  };

  const toggleItemStock = async (catId: string, item: CatalogueItem) => {
    await fetch(`/api/staff/catalogues/${catId}/items/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ inStock: !item.inStock }) });
    fetch_();
  };

  const startEditCat = (cat: Catalogue) => {
    setEditingCat(cat);
    catForm.reset({ vendorName: cat.vendorName, description: cat.description ?? "", category: cat.category, township: cat.township ?? "", coverImage: cat.coverImage ?? "", storeHours: cat.storeHours ?? "" });
    setShowCatForm(true);
  };

  const startEditItem = (catId: string, item: CatalogueItem) => {
    setEditingItem({ catId, item });
    itemForm.reset({ name: item.name, description: item.description ?? "", price: item.price, imageUrl: item.imageUrl ?? "", category: item.category ?? "" });
    setShowItemForm(catId);
  };

  const coverImageWatch = catForm.watch("coverImage");
  const itemImageWatch = itemForm.watch("imageUrl");

  return (
    <StaffLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Store className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-black">Catalogues</h1>
          </div>
          <p className="text-muted-foreground">Create vendor store catalogues, add products with photos and prices, then publish them live.</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground font-bold gap-2 flex-shrink-0"
          onClick={() => { setEditingCat(null); catForm.reset({ category: "Restaurant" }); setShowCatForm(true); }}
        >
          <Plus className="w-4 h-4" /> New Catalogue
        </Button>
      </div>

      {/* Catalogue form */}
      <AnimatePresence>
        {showCatForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card border border-primary/20 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
            <h2 className="font-black text-lg mb-5">{editingCat ? "Edit Catalogue" : "New Catalogue"}</h2>
            <form onSubmit={catForm.handleSubmit(saveCatalogue)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Vendor name */}
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Store / Vendor Name *</Label>
                  <Input {...catForm.register("vendorName", { required: true })} placeholder="e.g. Mama's Kitchen" className="bg-background border-white/10" />
                </div>

                {/* Category dropdown */}
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Category *</Label>
                  <div className="relative">
                    <select
                      {...catForm.register("category", { required: true })}
                      className="w-full h-10 rounded-md bg-background border border-white/10 text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-8"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Township */}
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label>Township / Area</Label>
                  <Input {...catForm.register("township")} placeholder="e.g. Soweto, Khayelitsha" className="bg-background border-white/10" />
                </div>

                {/* Store hours */}
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Store Hours</Label>
                  <Input {...catForm.register("storeHours")} placeholder="e.g. Mon–Sat 08:00–20:00" className="bg-background border-white/10" />
                </div>

                {/* Cover image URL + preview */}
                <div className="space-y-2 col-span-2">
                  <Label className="flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Store Cover Image URL</Label>
                  <Input {...catForm.register("coverImage")} placeholder="https://example.com/store-photo.jpg" className="bg-background border-white/10" />
                  {coverImageWatch && (
                    <div className="mt-2">
                      <img src={coverImageWatch} alt="Cover preview" className="h-24 w-auto rounded-xl object-cover border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2 col-span-2">
                  <Label>Store Description</Label>
                  <Textarea {...catForm.register("description")} placeholder="Brief description of the store…" className="bg-background border-white/10 min-h-16" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground font-bold">
                  {saving ? "Saving…" : editingCat ? "Save Changes" : "Create Catalogue"}
                </Button>
                <Button type="button" variant="outline" className="border-white/10" onClick={() => { setShowCatForm(false); setEditingCat(null); }}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}</div>
      ) : catalogues.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-semibold mb-1">No catalogues yet</p>
          <p className="text-sm">Create a catalogue to start adding products and publishing to the shop.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogues.map((cat, ci) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.04 }} className="bg-card border border-white/5 rounded-2xl overflow-hidden">

              {/* Catalogue header */}
              <div className="flex items-center p-4 gap-3">
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                >
                  {cat.coverImage ? (
                    <img src={cat.coverImage} alt={cat.vendorName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {CAT_ICONS[cat.category] ?? <Store className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold truncate">{cat.vendorName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{cat.category}</span>
                      {cat.township && <span className="text-xs text-muted-foreground">· {cat.township}</span>}
                      {cat.storeHours && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{cat.storeHours}</span>}
                      <Badge className={`text-xs border ${cat.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                        {cat.isActive ? "Live" : "Hidden"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{cat.items.length} item{cat.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch checked={cat.isActive} onCheckedChange={() => toggleActive(cat)} className="data-[state=checked]:bg-green-500" />
                  <Button variant="ghost" size="icon" onClick={() => startEditCat(cat)} className="text-muted-foreground hover:text-primary w-8 h-8">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteCatalogue(cat.id)} className="text-muted-foreground hover:text-destructive w-8 h-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <button onClick={() => setExpanded(expanded === cat.id ? null : cat.id)} className="text-muted-foreground hover:text-white w-8 h-8 flex items-center justify-center">
                    {expanded === cat.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded: items */}
              <AnimatePresence>
                {expanded === cat.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 overflow-hidden">
                    <div className="p-4 space-y-4">
                      {cat.description && <p className="text-sm text-muted-foreground">{cat.description}</p>}

                      {/* Products grid */}
                      {cat.items.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {cat.items.map((item) => (
                            <div key={item.id} className="bg-background/60 border border-white/5 rounded-xl overflow-hidden group">
                              {item.imageUrl ? (
                                <div className="aspect-square overflow-hidden bg-black/20">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                              ) : (
                                <div className="aspect-square bg-primary/5 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-primary/30" />
                                </div>
                              )}
                              <div className="p-2.5">
                                <p className="font-bold text-xs leading-snug line-clamp-2 mb-1">{item.name}</p>
                                {item.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>}
                                <div className="flex items-center justify-between">
                                  <span className="text-primary font-black text-xs">R {item.price.toFixed(2)}</span>
                                  <button
                                    onClick={() => toggleItemStock(cat.id, item)}
                                    className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${item.inStock ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                                  >
                                    {item.inStock ? "✓" : "✗"}
                                  </button>
                                </div>
                                <div className="flex gap-1 mt-2">
                                  <Button variant="ghost" size="sm" onClick={() => startEditItem(cat.id, item)} className="h-6 flex-1 text-xs text-muted-foreground hover:text-primary px-1">
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteItem(cat.id, item.id)} className="h-6 text-xs text-muted-foreground hover:text-destructive px-1">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add/Edit item form */}
                      <AnimatePresence>
                        {showItemForm === cat.id && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card border border-primary/20 rounded-xl p-4">
                            <h3 className="font-bold text-sm mb-3">{editingItem ? "Edit Product" : "Add Product"}</h3>
                            <form onSubmit={itemForm.handleSubmit((d) => saveItem(cat.id, d))} className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                  <Label className="text-xs">Product Name *</Label>
                                  <Input {...itemForm.register("name", { required: true })} placeholder="e.g. Boerewors Roll" className="bg-background border-white/10 h-9 text-sm" />
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                  <Label className="text-xs">Price (R) *</Label>
                                  <Input {...itemForm.register("price", { required: true, valueAsNumber: true, min: 0 })} type="number" step="0.01" placeholder="0.00" className="bg-background border-white/10 h-9 text-sm" />
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                  <Label className="text-xs">Sub-category (optional)</Label>
                                  <Input {...itemForm.register("category")} placeholder="e.g. Mains, Drinks" className="bg-background border-white/10 h-9 text-sm" />
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                  <Label className="text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Product Image URL</Label>
                                  <Input {...itemForm.register("imageUrl")} placeholder="https://example.com/photo.jpg" className="bg-background border-white/10 h-9 text-sm" />
                                </div>
                                {itemImageWatch && (
                                  <div className="col-span-2">
                                    <img src={itemImageWatch} alt="Preview" className="h-20 w-auto rounded-lg object-cover border border-white/10" onError={(e) => (e.currentTarget.style.display = "none")} />
                                  </div>
                                )}
                                <div className="space-y-1 col-span-2">
                                  <Label className="text-xs">Description</Label>
                                  <Textarea {...itemForm.register("description")} placeholder="Short product description…" className="bg-background border-white/10 min-h-14 text-sm" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" size="sm" disabled={saving} className="bg-primary text-primary-foreground font-bold gap-1">
                                  <Check className="w-3.5 h-3.5" /> {saving ? "…" : editingItem ? "Update Product" : "Add Product"}
                                </Button>
                                <Button type="button" size="sm" variant="outline" className="border-white/10 gap-1" onClick={() => { setShowItemForm(null); setEditingItem(null); itemForm.reset(); }}>
                                  <X className="w-3.5 h-3.5" /> Cancel
                                </Button>
                              </div>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {showItemForm !== cat.id && (
                        <Button
                          variant="outline" size="sm"
                          className="border-dashed border-white/10 hover:border-primary hover:text-primary gap-2 w-full"
                          onClick={() => { setEditingItem(null); itemForm.reset(); setShowItemForm(cat.id); }}
                        >
                          <Plus className="w-4 h-4" /> Add Product to Catalogue
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
