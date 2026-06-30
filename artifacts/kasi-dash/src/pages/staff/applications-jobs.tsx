import { useState } from "react";
import { motion } from "framer-motion";
import StaffLayout from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { useListJobApplications } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function StaffJobApplications() {
  const { data: apps, isLoading } = useListJobApplications();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/staff/applications/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes: notes[id] }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Updated", description: `Application marked as ${status}` });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/applications/jobs"] });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <StaffLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Briefcase className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-black">Job Applications</h1>
        </div>
        <p className="text-muted-foreground">Review and manage all job applicants</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-card/40 animate-pulse border border-white/5" />)}
        </div>
      ) : !apps || apps.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No job applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-white/5 rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {app.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{app.fullName}</p>
                    <p className="text-sm text-muted-foreground">{app.email} · Applying for: <span className="text-white/70">{app.jobTitle ?? "Unknown position"}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`capitalize text-xs border ${STATUS_COLORS[app.status] ?? ""}`}>
                    {app.status}
                  </Badge>
                  {expanded === app.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expanded === app.id && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {[
                      ["Phone", app.phone],
                      ["LinkedIn", app.linkedIn ?? "N/A"],
                      ["Applied", new Date(app.createdAt).toLocaleDateString("en-ZA")],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{label}</p>
                        <p className="font-medium break-all">{val}</p>
                      </div>
                    ))}
                  </div>

                  {app.experience && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Experience</p>
                      <p className="text-sm bg-background/50 rounded-xl p-3 border border-white/5">{app.experience}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Cover Letter</p>
                    <p className="text-sm bg-background/50 rounded-xl p-3 border border-white/5 whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Internal Notes</p>
                    <Textarea
                      placeholder="Add notes about this applicant..."
                      value={notes[app.id] ?? app.notes ?? ""}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      className="bg-background border-white/10 min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["reviewing", "approved", "rejected"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={app.status === status ? "default" : "outline"}
                        disabled={updating === app.id}
                        onClick={() => updateStatus(app.id, status)}
                        className={`capitalize border-white/10 ${
                          status === "approved" ? "hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30" :
                          status === "rejected" ? "hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30" :
                          "hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30"
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
