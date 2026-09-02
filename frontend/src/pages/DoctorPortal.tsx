import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { appointmentApi, Appointment, AppointmentStatus } from "@/lib/appointmentApi";
import { useToast } from "@/contexts/ToastContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
  AlertCircle,
  CalendarDays,
  Clock,
  Calendar,
  Check,
  X,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
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

const appointmentStatusMap: Record<
  AppointmentStatus,
  { variant: "success" | "pending" | "info" | "destructive"; label: string }
> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "pending", label: "Pending Request" },
  completed: { variant: "info", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  rejected: { variant: "destructive", label: "Rejected" },
};

export default function DoctorPortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"appointments" | "reports">("appointments");

  // --- Reports State ---
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Appointments State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Dialogs for Reject & Complete
  const [rejectDialogTarget, setRejectDialogTarget] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [completeDialogTarget, setCompleteDialogTarget] = useState<Appointment | null>(null);
  const [completeNotes, setCompleteNotes] = useState("");

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await apiFetch("/reports");
      if (res.success) {
        setReports(res.data || []);
        if (res.data.length > 0 && !selectedReport) {
          setSelectedReport(res.data[0]);
          setNotes(res.data[0].doctorNotes || "");
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const data = await appointmentApi.getDoctorAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error("Failed to load doctor appointments:", err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchAppointments();
  }, []);

  // --- Save Report Review Notes ---
  const handleSaveReportNotes = async () => {
    if (!selectedReport) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/reports/${selectedReport._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "reviewed", doctorNotes: notes }),
      });
      if (res.success) {
        setSaved(true);
        setReports((prev) =>
          prev.map((r) => (r._id === selectedReport._id ? res.data : r))
        );
        setSelectedReport(res.data);
        toast({
          title: "Notes Saved",
          description: "Clinical notes have been successfully updated.",
          variant: "success",
        });
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to save notes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Appointment Handlers ---
  const handleConfirmAppointment = async (id: string) => {
    setActionLoadingId(id);
    try {
      const updated = await appointmentApi.confirm(id);
      setAppointments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      toast({
        title: "Appointment Confirmed",
        description: `Consultation confirmed for ${updated.patientId?.name}.`,
        variant: "success",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Action Failed",
        description: err.message || "Could not confirm appointment.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectAppointment = async () => {
    if (!rejectDialogTarget) return;
    setActionLoadingId(rejectDialogTarget._id);
    try {
      const updated = await appointmentApi.reject(
        rejectDialogTarget._id,
        rejectReason || "Slot unavailable"
      );
      setAppointments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      toast({
        title: "Appointment Rejected",
        description: "The appointment has been rejected.",
        variant: "info",
      });
      setRejectDialogTarget(null);
      setRejectReason("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Action Failed",
        description: err.message || "Could not reject appointment.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!completeDialogTarget) return;
    setActionLoadingId(completeDialogTarget._id);
    try {
      const updated = await appointmentApi.complete(
        completeDialogTarget._id,
        completeNotes || undefined
      );
      setAppointments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      );
      toast({
        title: "Consultation Completed",
        description: "Appointment marked as completed and clinical notes saved.",
        variant: "success",
      });
      setCompleteDialogTarget(null);
      setCompleteNotes("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Action Failed",
        description: err.message || "Could not complete appointment.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter Appointments
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const filteredAppointments = appointments.filter((app) => {
    if (appointmentFilter === "pending") return app.status === "pending";
    if (appointmentFilter === "confirmed") return app.status === "confirmed";
    if (appointmentFilter === "today") return isToday(app.appointmentDate);
    if (appointmentFilter === "completed") return app.status === "completed";
    if (appointmentFilter === "rejected") return app.status === "rejected" || app.status === "cancelled";
    return true;
  });

  const pendingAppointmentsCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            Doctor <span className="gradient-text">Clinical Portal</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage patient appointment requests, review AI diagnostic scans, and add clinical notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchAppointments();
              fetchReports();
            }}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "appointments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Patient Appointments
          {pendingAppointmentsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs animate-pulse">
              {pendingAppointmentsCount} pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "reports"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Patient Diagnostic Scans ({reports.length})
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS MANAGEMENT */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          {/* Filter subtabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { id: "all", label: "All Appointments" },
              { id: "pending", label: `Pending (${pendingAppointmentsCount})` },
              { id: "confirmed", label: "Confirmed" },
              { id: "today", label: "Today's Schedule" },
              { id: "completed", label: "Completed" },
              { id: "rejected", label: "Rejected / Cancelled" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAppointmentFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  appointmentFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {appointmentsLoading ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground text-sm">Loading appointment schedule...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="medical-card text-center py-16">
              <CardContent className="space-y-3">
                <CalendarDays className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                <h3 className="font-bold text-base text-foreground">No appointments in this category</h3>
                <p className="text-xs text-muted-foreground">
                  When patients request consultations, they will appear here for your review and approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredAppointments.map((app) => {
                  const status =
                    appointmentStatusMap[app.status] || appointmentStatusMap.pending;
                  const patient = app.patientId;
                  const formattedDate = new Date(app.appointmentDate).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  const isActionLoading = actionLoadingId === app._id;

                  return (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="medical-card h-full flex flex-col justify-between border-primary/10">
                        <CardContent className="p-5 space-y-3 flex flex-col h-full justify-between">
                          <div className="space-y-3">
                            {/* Patient Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={
                                    patient?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      patient?.name || "Patient"
                                    )}&background=0B3C5D&color=fff`
                                  }
                                  alt=""
                                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm truncate text-foreground">
                                    {patient?.name || "Patient"}
                                  </h4>
                                  {patient?.phone && (
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-primary" /> {patient.phone}
                                    </p>
                                  )}
                                  {patient?.email && (
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                      <Mail className="w-3 h-3 text-primary" /> {patient.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge variant={status.variant} className="text-[10px] uppercase">
                                {status.label}
                              </Badge>
                            </div>

                            {/* Schedule info */}
                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
                              <div className="flex items-center gap-1 text-foreground font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{formattedDate}</span>
                              </div>
                              <div className="flex items-center gap-1 text-foreground font-semibold">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span>{app.appointmentTime}</span>
                              </div>
                            </div>

                            {/* Consultation details */}
                            <div className="space-y-1.5 text-xs">
                              <p className="text-muted-foreground font-semibold">Reason:</p>
                              <p className="text-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
                                {app.reason}
                              </p>
                              {app.symptoms && (
                                <p className="text-[11px] text-muted-foreground">
                                  <strong className="text-foreground">Symptoms:</strong> {app.symptoms}
                                </p>
                              )}
                              {app.doctorNotes && (
                                <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                                  <span className="font-bold text-primary">Your Clinical Notes:</span>
                                  <p className="text-foreground mt-0.5">{app.doctorNotes}</p>
                                </div>
                              )}
                              {app.rejectionReason && (
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500 text-xs">
                                  <strong>Rejection Reason:</strong> {app.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-border mt-auto">
                            {app.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="medical"
                                  size="sm"
                                  disabled={isActionLoading}
                                  onClick={() => handleConfirmAppointment(app._id)}
                                  className="flex-1 rounded-xl text-xs gap-1 font-bold"
                                >
                                  {isActionLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  Confirm
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isActionLoading}
                                  onClick={() => {
                                    setRejectDialogTarget(app);
                                    setRejectReason("");
                                  }}
                                  className="rounded-xl text-xs gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </Button>
                              </div>
                            )}

                            {app.status === "confirmed" && (
                              <Button
                                variant="medical"
                                size="sm"
                                disabled={isActionLoading}
                                onClick={() => {
                                  setCompleteDialogTarget(app);
                                  setCompleteNotes(app.doctorNotes || "");
                                }}
                                className="w-full rounded-xl text-xs gap-1.5 font-bold"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed & Add Notes
                              </Button>
                            )}

                            {(app.status === "completed" ||
                              app.status === "rejected" ||
                              app.status === "cancelled") && (
                              <p className="text-[11px] text-center text-muted-foreground">
                                Consultation archived ({app.status})
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REPORTS & DIAGNOSTIC SCANS REVIEW */}
      {activeTab === "reports" && (
        <div>
          {reportsLoading ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
              <p className="text-muted-foreground">Loading diagnostic reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No patient reports found.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Reports list */}
              <div className="lg:col-span-2">
                <Card className="medical-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Patient Scans ({reports.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-1 max-h-[600px] overflow-y-auto">
                      {reports.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => {
                            setSelectedReport(r);
                            setNotes(r.doctorNotes ?? "");
                            setSaved(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                            selectedReport?._id === r._id
                              ? "bg-primary/10 border border-primary/30 shadow-sm"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <img
                            src={
                              r.imageUrl
                                ? r.imageUrl.startsWith("http") || r.imageUrl.startsWith("blob:")
                                  ? r.imageUrl
                                  : `http://localhost:5000${r.imageUrl}`
                                : "/images/diseases/pneumonia.png"
                            }
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-black"
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
                {selectedReport && (
                  <>
                    {/* Patient info */}
                    <Card className="medical-card">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold">{selectedReport.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedReport.diseaseName} — ID:{" "}
                              {selectedReport._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              severityColor[
                                selectedReport.severity as keyof typeof severityColor
                              ] || "info"
                            }
                            className="ml-auto capitalize"
                          >
                            {selectedReport.severity} risk
                          </Badge>
                        </div>
                        <img
                          src={
                            selectedReport.imageUrl
                              ? selectedReport.imageUrl.startsWith("http") ||
                                selectedReport.imageUrl.startsWith("blob:")
                                ? selectedReport.imageUrl
                                : `http://localhost:5000${selectedReport.imageUrl}`
                              : "/images/diseases/pneumonia.png"
                          }
                          alt="scan"
                          className="w-full h-56 object-cover rounded-xl mb-4 bg-black/10"
                        />
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Confidence</span>
                            <span className="font-bold text-primary">
                              {selectedReport.confidence}%
                            </span>
                          </div>
                          <Progress value={selectedReport.confidence} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card className="medical-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {selectedReport.severity === "high" ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                          AI Model Findings & Clinical Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {selectedReport.aiFindings || "No AI findings generated."}
                        </p>
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground">
                          {selectedReport.recommendation || "No recommendation."}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Doctor notes */}
                    <Card className="medical-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Clinical Observations & Verification</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Add your clinical observations, diagnosis confirmation, and treatment plan..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                        <Button
                          onClick={handleSaveReportNotes}
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
                              Save Clinical Notes
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
      )}

      {/* Reject Reason Modal */}
      <Dialog
        open={!!rejectDialogTarget}
        onOpenChange={(open) => !open && setRejectDialogTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Reject Appointment Request
            </DialogTitle>
            <DialogDescription>
              Provide an optional reason for rejecting the appointment for{" "}
              <strong>{rejectDialogTarget?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="e.g., Surgery scheduled during this slot, emergency on call..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setRejectDialogTarget(null)}
                className="rounded-xl"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectAppointment}
                className="rounded-xl font-bold"
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Modal */}
      <Dialog
        open={!!completeDialogTarget}
        onOpenChange={(open) => !open && setCompleteDialogTarget(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Complete Consultation
            </DialogTitle>
            <DialogDescription>
              Record diagnosis, prescription, or clinical guidance for{" "}
              <strong>{completeDialogTarget?.patientId?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
              <p><strong>Reason for Visit:</strong> {completeDialogTarget?.reason}</p>
              {completeDialogTarget?.symptoms && (
                <p><strong>Patient Symptoms:</strong> {completeDialogTarget?.symptoms}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Clinical Summary & Doctor's Recommendations
              </label>
              <Textarea
                placeholder="Enter diagnosis findings, prescribed medication, follow-up advice..."
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={4}
                className="text-xs rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setCompleteDialogTarget(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="medical"
                onClick={handleCompleteAppointment}
                className="rounded-xl font-bold gap-1"
              >
                <Check className="w-4 h-4" /> Finish Consultation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
