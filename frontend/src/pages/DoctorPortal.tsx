import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

const severityColor = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const;
const statusColor = {
  completed: "success",
  reviewed: "info",
  processing: "processing",
  pending: "pending",
} as const;

export default function DoctorPortal() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/reports")
      .then((res) => {
        if (res.success) {
          setReports(res.data);
          if (res.data.length > 0) {
            setSelected(res.data[0]);
            setNotes(res.data[0].doctorNotes || "");
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/reports/${selected._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "reviewed", doctorNotes: notes }),
      });
      if (res.success) {
        setSaved(true);
        // Update local state
        setReports((prev) =>
          prev.map((r) => (r._id === selected._id ? res.data : r))
        );
        setSelected(res.data);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Doctor Portal</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review patient scans and add clinical notes.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reports found.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Reports list */}
          <div className="lg:col-span-2">
            <Card className="medical-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Patient Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {reports.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => {
                        setSelected(r);
                        setNotes(r.doctorNotes ?? "");
                        setSaved(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        selected?._id === r._id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <img
                        src={r.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {r.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.diseaseName}
                        </p>
                      </div>
                      <Badge
                        variant={
                          statusColor[r.status as keyof typeof statusColor] ||
                          "pending"
                        }
                        className="text-[10px]"
                      >
                        {r.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3 space-y-4">
            {selected && (
              <>
                {/* Patient info */}
                <Card className="medical-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold">{selected.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {selected.diseaseName} — ID:{" "}
                          {selected._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          severityColor[
                            selected.severity as keyof typeof severityColor
                          ] || "info"
                        }
                        className="ml-auto capitalize"
                      >
                        {selected.severity} risk
                      </Badge>
                    </div>
                    <img
                      src={selected.imageUrl}
                      alt="scan"
                      className="w-full h-52 object-cover rounded-xl mb-4 bg-black/10"
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-bold text-primary">
                          {selected.confidence}%
                        </span>
                      </div>
                      <Progress value={selected.confidence} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                <Card className="medical-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {selected.severity === "high" ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      AI Findings & Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {selected.aiFindings || "No AI findings generated."}
                    </p>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground">
                      {selected.recommendation || "No recommendation."}
                    </div>
                  </CardContent>
                </Card>

                {/* Doctor notes */}
                <Card className="medical-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Clinical Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Add your clinical observations, diagnosis confirmation, and treatment plan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <Button
                      onClick={handleSave}
                      variant="medical"
                      size="sm"
                      disabled={saving}
                      className="gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Notes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
