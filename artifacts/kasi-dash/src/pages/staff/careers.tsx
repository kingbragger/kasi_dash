import { useState } from "react";
import { motion } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useStaffListJobListings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";

interface JobForm {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

export default function StaffCareers() {
  const { data: listings, isLoading } = useStaffListJobListings();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editId, setEditId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, setValue, formState: { isSubmitting } } = useForm<JobForm>({
    defaultValues: { isActive: true, type: "full_time" },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/staff/careers"] });

  const onSubmit = async (data: JobForm) => {
    const url = mode === "edit" && editId ? `/api/staff/careers/${editId}` : "/api/staff/careers";
    const method = mode === "edit" ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: mode === "edit" ? "Listing updated" : "Listing created" });
      invalidate();
      setMode("list");
      reset();
    } catch {
      toast({ title: "Error", description: "Failed to save listing", variant: "destructive" });
    }
  };

  const handleEdit = (listing: NonNullable<typeof listings>[number]) => {
    setEditId(listing.id);
    setValue("title", listing.title);
    setValue("department", listing.department);
    setValue("location", listing.location);
    setValue("type", listing.type);
    setValue("description", listing.description);
    setValue("requirements", listing.requirements);
    setValue("isActive", listing.isActive);
    setMode("edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job listing?")) return;
    try {
      const res = await fetch(`/api/staff/careers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Listing deleted" });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/staff/careers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !current }),
      });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const Form = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black">{mode === "edit" ? "Edit Listing" : "New Job Listing"}</h2>
        <Button variant="ghost" size="icon" onClick={() => { setMode("list"); reset(); }}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-card border border-white/5 p-6 rounded-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input {...register("title", { required: true })} placeholder="e.g. Operations Manager" className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Department *</Label>
              <Input {...register("department", { required: true })} placeholder="e.g. Operations, Tech, Finance" className="bg-background border-white/10" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input {...register("location", { required: true })} placeholder="e.g. Johannesburg, Remote" className="bg-background border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Employment Type *</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-background border-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job Description *</Label>
            <Textarea {...register("description", { required: true })} placeholder="Describe the role and responsibilities..." className="bg-background border-white/10 min-h-[120px]" />
          </div>

          <div className="space-y-2">
            <Label>Requirements *</Label>
            <Textarea {...register("requirements", { required: true })} placeholder="List qualifications, skills, and experience required..." className="bg-background border-white/10 min-h-[100px]" />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label>Publish listing immediately</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-primary text-primary-foreground font-bold" disabled={isSubmitting}>
              <Check className="w-4 h-4 mr-2" />
              {mode === "edit" ? "Save Changes" : "Create Listing"}
            </Button>
            <Button type="button" variant="outline" className="border-white/10" onClick={() => { setMode("list"); reset(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  return (
    <StaffLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ListChecks className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-black">Manage Careers</h1>
          </div>
          <p className="text-muted-foreground">Create and manage all public job listings</p>
        </div>
        {mode === "list" && (
          <Button className="bg-primary text-primary-foreground font-bold" onClick={() => setMode("create")}>
            <Plus className="w-4 h-4 mr-2" /> New Listing
          </Button>
        )}
      </div>

      {mode !== "list" ? (
        <Form />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="mb-4">No job listings yet</p>
          <Button className="bg-primary text-primary-foreground" onClick={() => setMode("create")}>
            <Plus className="w-4 h-4 mr-2" /> Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-white/5 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">{listing.department}</Badge>
                    <Badge className="bg-white/5 text-muted-foreground border border-white/10 text-xs">{TYPE_LABELS[listing.type] ?? listing.type}</Badge>
                    {listing.isActive ? (
                      <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs">Live</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs">Hidden</Badge>
                    )}
                  </div>
                  <p className="font-bold text-lg">{listing.title}</p>
                  <p className="text-sm text-muted-foreground">{listing.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-2">
                    <Switch
                      checked={listing.isActive}
                      onCheckedChange={() => toggleActive(listing.id, listing.isActive)}
                    />
                    <span className="text-xs text-muted-foreground">{listing.isActive ? "Live" : "Hidden"}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => handleEdit(listing)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(listing.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
