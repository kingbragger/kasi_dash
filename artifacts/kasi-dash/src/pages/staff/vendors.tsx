import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Store, Plus, Trash2, Edit2, Check, X, RefreshCw, KeyRound, Link2 } from "lucide-react";

interface VendorAccount { id: string; businessName: string; email: string; catalogueId: string | null; isActive: boolean; createdAt: string; }
interface CatalogueOption { id: string; vendorName: string; }
interface CreateForm { businessName: string; email: string; password: string; catalogueId?: string; }
interface EditForm { businessName: string; email: string; newPassword?: string; catalogueId?: string; }

export default function StaffVendors() {
  const [vendors, setVendors] = useState<VendorAccount[]>([]);
  const [catalogues, setCatalogues] = useState<CatalogueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const createForm = useForm<CreateForm>();
  const editForm = useForm<EditForm>();

  const load = useCallback(async () => {
    const [vRes, cRes] = await Promise.all([
      fetch("/api/staff/vendors", { credentials: "include" }),
      fetch("/api/staff/catalogues-list", { credentials: "include" }),
    ]);
    if (vRes.ok) setVendors(await vRes.json());
    if (cRes.ok) setCatalogues(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generatePassword = () => {
    const pw = Math.random().toString(36).slice(2, 7).toUpperCase() + Math.random().toString(36).slice(2, 7) + "!";
    return pw;
  };

  const handleCreate = async (data: CreateForm) => {
    setSaving(true);
    try {
      const res = await fetch("/api/staff/vendors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ ...data, catalogueId: data.catalogueId || null }),
      });
      const json = await res.json();
      if (!res.ok) { toast({ title: "Error", description: json.message, variant: "destructive" }); return; }
      setGeneratedPassword(data.password);
      toast({ title: "Vendor account created" });
      createForm.reset();
      setShowCreateForm(false);
      await load();
    } catch {
      toast({ title: "Error", description: "Failed to create vendor", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleEdit = async (id: string, data: EditForm) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { businessName: data.businessName, email: data.email, catalogueId: data.catalogueId || null };
      if (data.newPassword) payload.password = data.newPassword;
      const res = await fetch(`/api/staff/vendors/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Vendor updated" });
      setEditingId(null);
      await load();
    } catch {
      toast({ title: "Error", description: "Failed to update vendor", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (vendor: VendorAccount) => {
    await fetch(`/api/staff/vendors/${vendor.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      credentials: "include", body: JSON.stringify({ isActive: !vendor.isActive }),
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor account? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/staff/vendors/${id}`, { method: "DELETE", credentials: "include" });
      toast({ title: "Vendor account deleted" });
      await load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally { setDeletingId(null); }
  };

  const startEdit = (vendor: VendorAccount) => {
    setEditingId(vendor.id);
    editForm.reset({ businessName: vendor.businessName, email: vendor.email, catalogueId: vendor.catalogueId ?? "", newPassword: "" });
  };

  if (loading) return (
    <StaffLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Store className="w-6 h-6 text-primary" /> Vendor Accounts</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage vendor portal logins</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2"
            onClick={() => { createForm.reset(); setGeneratedPassword(null); setShowCreateForm(true); }}>
            <Plus className="w-4 h-4" /> New Vendor
          </Button>
        </div>

        {/* Generated password notice */}
        <AnimatePresence>
          {generatedPassword && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-bold text-primary mb-1">Vendor account created!</p>
                <p className="text-xs text-muted-foreground">Share these credentials with the vendor:</p>
                <p className="font-mono text-sm mt-1 text-foreground bg-background/50 rounded px-2 py-1 inline-block">{generatedPassword}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setGeneratedPassword(null)}><X className="w-4 h-4" /></Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-primary/20 rounded-2xl p-6 overflow-hidden"
            >
              <h3 className="font-black mb-4 text-sm">New Vendor Account</h3>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Business Name *</Label>
                    <Input {...createForm.register("businessName", { required: true })} placeholder="e.g. Mama's Kitchen" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email *</Label>
                    <Input {...createForm.register("email", { required: true })} type="email" placeholder="vendor@example.com" className="bg-background border-white/10 focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Password *</Label>
                    <div className="flex gap-2">
                      <Input {...createForm.register("password", { required: true })} placeholder="Set a password" className="bg-background border-white/10 focus-visible:ring-primary" />
                      <Button type="button" variant="outline" size="sm" className="flex-shrink-0"
                        onClick={() => createForm.setValue("password", generatePassword())}>
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Link to Catalogue</Label>
                    <select {...createForm.register("catalogueId")} className="w-full h-9 px-3 rounded-md bg-background border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="">— None —</option>
                      {catalogues.map((c) => <option key={c.id} value={c.id}>{c.vendorName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold" disabled={saving}>
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Create Account</>}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}><X className="w-4 h-4 mr-1" />Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vendor list */}
        {vendors.length === 0 ? (
          <div className="bg-card border border-white/5 rounded-2xl p-12 text-center">
            <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No vendor accounts yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((vendor) => {
              const linkedCatalogue = catalogues.find((c) => c.id === vendor.catalogueId);
              return (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-white/5 rounded-xl p-5"
                >
                  {editingId === vendor.id ? (
                    <form onSubmit={editForm.handleSubmit((d) => handleEdit(vendor.id, d))} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Business Name</Label>
                          <Input {...editForm.register("businessName")} className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <Input {...editForm.register("email")} type="email" className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">New Password (leave blank to keep)</Label>
                          <div className="flex gap-2">
                            <Input {...editForm.register("newPassword")} placeholder="New password..." className="bg-background border-white/10 focus-visible:ring-primary text-sm" />
                            <Button type="button" variant="outline" size="sm" className="flex-shrink-0"
                              onClick={() => editForm.setValue("newPassword", generatePassword())}>
                              <KeyRound className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Catalogue</Label>
                          <select {...editForm.register("catalogueId")} className="w-full h-9 px-3 rounded-md bg-background border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                            <option value="">— None —</option>
                            {catalogues.map((c) => <option key={c.id} value={c.id}>{c.vendorName}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold" disabled={saving}>
                          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" />Save</>}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1" />Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm">{vendor.businessName}</p>
                          <Badge className={vendor.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                            {vendor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{vendor.email}</p>
                        {linkedCatalogue ? (
                          <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                            <Link2 className="w-3 h-3" /> {linkedCatalogue.vendorName}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">No catalogue linked</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch checked={vendor.isActive} onCheckedChange={() => handleToggleActive(vendor)} />
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(vendor)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(vendor.id)} disabled={deletingId === vendor.id}>
                          {deletingId === vendor.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
