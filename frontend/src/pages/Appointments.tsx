import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Stethoscope,
  Info,
  CalendarDays,
} from "lucide-react";
import { appointmentApi, Appointment, AppointmentStatus } from "@/lib/appointmentApi";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const statusBadgeConfig: Record<
  AppointmentStatus,
  { variant: "success" | "processing" | "warning" | "pending" | "info" | "destructive"; label: string; bg: string; text: string }
> = {
  confirmed: {
    variant: "success",
    label: "Confirmed",
    bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
    text: "Confirmed by Doctor",
  },
  pending: {
    variant: "pending",
    label: "Pending Review",
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    text: "Awaiting Doctor Confirmation",
  },
  completed: {
    variant: "info",
    label: "Completed",
    bg: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    text: "Consultation Completed",
  },
  cancelled: {
    variant: "destructive",
    label: "Cancelled",
    bg: "bg-gray-500/10 border-gray-500/30 text-gray-400",
    text: "Cancelled",
  },
  rejected: {
    variant: "destructive",
    label: "Rejected",
    bg: "bg-red-500/10 border-red-500/30 text-red-500",
    text: "Slot Unavailable / Rejected",
  },
};

const filterTabs = [
  { id: "all", label: "All Consultations" },
  { id: "upcoming", label: "Upcoming (Confirmed & Pending)" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled & Rejected" },
];

export default function Appointments() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentApi.getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error("Failed to load appointments:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load appointments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const updated = await appointmentApi.cancel(cancelTarget._id, cancelReason);
      setAppointments((prev) =>
        prev.map((app) => (app._id === updated._id ? updated : app))
      );
      toast({
        title: "Appointment Cancelled",
        description: "Your consultation has been successfully cancelled.",
        variant: "success",
      });
      setCancelTarget(null);
      setCancelReason("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Cancellation Failed",
        description: err.message || "Could not cancel appointment.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === "upcoming") {
      return app.status === "confirmed" || app.status === "pending";
    }
    if (activeTab === "completed") {
      return app.status === "completed";
    }
    if (activeTab === "cancelled") {
      return app.status === "cancelled" || app.status === "rejected";
    }
    return true;
  });

  const upcomingCount = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2.5">
            <CalendarDays className="w-8 h-8 text-primary" />
            My <span className="gradient-text">Appointments</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your doctor consultations, track approval status, and view clinical doctor notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAppointments}
            disabled={loading}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild variant="medical" size="sm" className="rounded-xl gap-1.5 font-bold">
            <Link to="/find-doctors">
              <Plus className="w-4 h-4" /> Book New
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
            {tab.id === "upcoming" && upcomingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-medical-cyan text-medical-blue font-bold text-[10px]">
                {upcomingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="medical-card text-center py-16">
          <CardContent className="space-y-4">
            <Stethoscope className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">No appointments found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeTab === "all"
                  ? "You haven't scheduled any consultations yet. Find a specialist to get started."
                  : `No appointments match the "${filterTabs.find((t) => t.id === activeTab)?.label}" filter.`}
              </p>
            </div>
            <Button asChild variant="medical" size="sm" className="rounded-xl gap-2">
              <Link to="/find-doctors">
                <Plus className="w-4 h-4" /> Book Consultation
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredAppointments.map((app, i) => {
              const status = statusBadgeConfig[app.status] || statusBadgeConfig.pending;
              const doctorUser = app.doctorId?.userId;
              const formattedDate = new Date(app.appointmentDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <motion.div
                  key={app._id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="medical-card h-full flex flex-col justify-between border-primary/10">
                    <CardContent className="p-5 space-y-4">
                      {/* Top Bar: Doctor & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              doctorUser?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                doctorUser?.name || "Doctor"
                              )}&background=0B3C5D&color=fff`
                            }
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-foreground truncate">
                              {doctorUser?.name || "Specialist Doctor"}
                            </h3>
                            <p className="text-xs text-primary font-medium truncate">
                              {app.doctorId?.specialty || "Specialist"}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {app.doctorId?.hospital || "Hospital"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={status.variant}
                          className={`text-[10px] px-2 py-0.5 uppercase tracking-wide flex-shrink-0 border ${status.bg}`}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      {/* Schedule info */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{app.appointmentTime}</span>
                        </div>
                      </div>

                      {/* Reason & Notes */}
                      <div className="space-y-1.5 text-xs">
                        <p className="text-muted-foreground font-semibold">Consultation Reason:</p>
                        <p className="text-foreground/90 bg-muted/20 p-2 rounded-lg border border-border/40">
                          {app.reason}
                        </p>
                        {app.symptoms && (
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground/80">Symptoms: </span>
                            {app.symptoms}
                          </p>
                        )}
                        {app.doctorNotes && (
                          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-foreground text-xs space-y-1">
                            <span className="font-bold text-primary flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" /> Doctor's Clinical Notes:
                            </span>
                            <p>{app.doctorNotes}</p>
                          </div>
                        )}
                        {app.rejectionReason && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                            <span className="font-bold">Rejection Reason: </span>
                            {app.rejectionReason}
                          </div>
                        )}
                        {app.cancellationReason && (
                          <div className="p-2 rounded-lg bg-muted text-muted-foreground text-[11px]">
                            <span className="font-semibold">Cancellation Note: </span>
                            {app.cancellationReason}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <span className="text-[11px] text-muted-foreground">
                          ID: {app._id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAppointment(app)}
                            className="text-xs h-8 rounded-lg"
                          >
                            Details
                          </Button>
                          {(app.status === "pending" || app.status === "confirmed") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCancelTarget(app);
                                setCancelReason("");
                              }}
                              className="text-xs h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Appointment Details Modal */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Reference ID: {selectedAppointment?._id}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                <img
                  src={
                    selectedAppointment.doctorId?.userId?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedAppointment.doctorId?.userId?.name || "Doctor"
                    )}&background=0B3C5D&color=fff`
                  }
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-sm">{selectedAppointment.doctorId?.userId?.name}</p>
                  <p className="text-primary">{selectedAppointment.doctorId?.specialty}</p>
                  <p className="text-muted-foreground">{selectedAppointment.doctorId?.hospital}, {selectedAppointment.doctorId?.location}</p>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Slot:</span>
                  <span className="font-semibold text-foreground">{selectedAppointment.appointmentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={statusBadgeConfig[selectedAppointment.status]?.variant || "pending"}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee:</span>
                  <span className="font-semibold text-primary">₹{selectedAppointment.doctorId?.consultationFee}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-muted-foreground">Reason for Visit:</p>
                <p className="text-foreground p-2 rounded-lg bg-muted/40">{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.doctorNotes && (
                <div className="space-y-1">
                  <p className="font-semibold text-primary">Doctor Clinical Notes:</p>
                  <p className="text-foreground p-2 rounded-lg bg-primary/5 border border-primary/20">{selectedAppointment.doctorNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your consultation with{" "}
              <strong>{cancelTarget?.doctorId?.userId?.name || "the doctor"}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Reason for cancellation (Optional)
              </label>
              <Textarea
                placeholder="e.g., Schedule conflict, resolved symptoms..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                className="rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="rounded-xl"
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="rounded-xl gap-2 font-bold"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
