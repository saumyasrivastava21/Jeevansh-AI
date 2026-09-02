import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  MessageSquare,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Download,
  Stethoscope,
  CalendarDays,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiFetch } from "@/lib/api";
import { appointmentApi, Appointment } from "@/lib/appointmentApi";
import { downloadReportPdf } from "@/utils/pdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const statusBadgeMap: Record<
  string,
  { variant: "success" | "processing" | "warning" | "pending" | "info"; label: string }
> = {
  completed: { variant: "success", label: "Completed" },
  reviewed: { variant: "info", label: "Reviewed" },
  processing: { variant: "processing", label: "Processing" },
  pending: { variant: "pending", label: "Pending" },
};

const appointmentStatusMap: Record<
  string,
  { variant: "success" | "pending" | "info" | "destructive"; label: string }
> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "pending", label: "Pending" },
  completed: { variant: "info", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  rejected: { variant: "destructive", label: "Rejected" },
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/reports/myreports")
        .then((res) => {
          if (res.success) setReports(res.data || []);
        })
        .catch(console.error),
      appointmentApi
        .getMyAppointments()
        .then((data) => setAppointments(data || []))
        .catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  const recentReports = reports.slice(0, 4);
  const upcomingAppointments = appointments
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .slice(0, 3);

  // Compute real metrics
  const totalScans = reports.length;
  const reportsGenerated = reports.filter((r) => r.reportStatus === "completed").length;
  const activeConsultations = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  ).length;
  const lastScanDate =
    reports.length > 0
      ? new Date(reports[0].createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : "N/A";

  const statsCards = [
    {
      label: "Total Scans",
      value: totalScans.toString(),
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Reports Completed",
      value: reportsGenerated.toString(),
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active Consultations",
      value: activeConsultations.toString(),
      icon: Stethoscope,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Last Scan Upload",
      value: lastScanDate,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Greeting Section */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-gradient-to-r from-medical-blue to-primary p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-white/10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-medical-cyan animate-pulse" />
            AI-Powered Medical Scan Analysis & Specialist Consultations
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
            Welcome back, <span className="text-medical-cyan">{user?.name?.split(" ")[0]}</span> 👋
          </h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Diagnose diagnostic images with deep learning screening, track AI interpretation reports, and manage your verified doctor appointments.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => navigate("/dashboard/upload")}
              className="bg-medical-cyan text-medical-blue hover:bg-medical-cyan/90 font-bold rounded-xl"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload New Scan
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm rounded-xl"
            >
              <Link to="/find-doctors">
                <Stethoscope className="w-4 h-4 mr-2" /> Find a Specialist
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            <Card className="medical-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
                  >
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-black">{s.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-6"
        >
          <Card className="medical-card border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 pt-2">
              {[
                {
                  label: "Upload Medical Scan",
                  desc: "Start an AI screening analysis",
                  icon: Upload,
                  to: "/dashboard/upload",
                  bg: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
                },
                {
                  label: "Doctor Appointments",
                  desc: "View upcoming & book specialist",
                  icon: CalendarDays,
                  to: "/appointments",
                  bg: "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20",
                },
                {
                  label: "My Reports History",
                  desc: "Filter and download past PDFs",
                  icon: FileText,
                  to: "/dashboard/reports",
                  bg: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
                },
                {
                  label: "Medical AI Assistant",
                  desc: "Consult our clinical chatbot",
                  icon: MessageSquare,
                  to: "/chatbot",
                  bg: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
                },
              ].map((act) => (
                <Link key={act.label} to={act.to}>
                  <div
                    className={`flex items-start gap-4 p-3.5 rounded-xl border border-border transition-all duration-200 cursor-pointer ${act.bg}`}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                      <act.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold flex items-center gap-1">
                        {act.label}
                        <ArrowRight className="w-3.5 h-3.5 opacity-60 transition-transform group-hover:translate-x-1" />
                      </p>
                      <p className="text-xs opacity-80 mt-0.5">{act.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Consultations Widget */}
          <Card className="medical-card border-primary/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Upcoming Consultations
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/appointments">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Loading appointments...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">No upcoming appointments.</p>
                  <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1">
                    <Link to="/find-doctors">
                      <Plus className="w-3 h-3" /> Book a Doctor
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingAppointments.map((app) => {
                    const status =
                      appointmentStatusMap[app.status] || appointmentStatusMap.pending;
                    return (
                      <div
                        key={app._id}
                        className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">
                              {app.doctorId?.userId?.name || "Specialist"}
                            </p>
                            <p className="text-primary text-[11px]">
                              {app.doctorId?.specialty}
                            </p>
                          </div>
                          <Badge variant={status.variant} className="text-[9px] uppercase px-1.5 py-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                          <span>
                            📅{" "}
                            {new Date(app.appointmentDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span>⏰ {app.appointmentTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reports List */}
        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3"
        >
          <Card className="medical-card h-full border-primary/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Reports
              </CardTitle>
              {reports.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="text-xs">
                  <Link to="/dashboard/reports">View all reports</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-xs text-muted-foreground font-semibold">Loading history...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <div className="space-y-1">
                    <p className="font-bold text-base text-foreground">No scans yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Upload your first medical scan to begin AI-assisted analysis and generate clinical PDFs.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/dashboard/upload")}
                    variant="medical"
                    size="sm"
                    className="rounded-xl"
                  >
                    Upload X-Ray
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report, i) => {
                    const status =
                      statusBadgeMap[report.status as keyof typeof statusBadgeMap] ||
                      statusBadgeMap.pending;
                    return (
                      <motion.div
                        key={report._id}
                        variants={fadeUp}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                report.imageUrl
                                  ? report.imageUrl.startsWith("http") ||
                                    report.imageUrl.startsWith("blob:")
                                    ? report.imageUrl
                                    : `http://localhost:5000${report.imageUrl}`
                                  : "/images/diseases/pneumonia.png"
                              }
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-black"
                            />
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-bold truncate text-foreground">
                                {report.diseaseName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(report.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge
                                  variant={status.variant}
                                  className="text-[9px] px-1.5 py-0"
                                >
                                  {status.label}
                                </Badge>
                                {report.prediction && (
                                  <span className="text-[10px] text-muted-foreground">
                                    Prediction:{" "}
                                    <strong className="text-foreground capitalize">
                                      {report.prediction.replace(/_/g, " ")}
                                    </strong>
                                  </span>
                                )}
                                {report.confidence !== null && report.confidence !== undefined && (
                                  <span className="text-[10px] text-muted-foreground">
                                    Confidence:{" "}
                                    <strong className="text-foreground">
                                      {report.confidence}%
                                    </strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                            <span className="text-xs">
                              {report.reportStatus === "completed" ? (
                                <Badge
                                  variant="success"
                                  className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] px-1.5 py-0 font-bold"
                                >
                                  AI Report: Completed
                                </Badge>
                              ) : report.reportStatus === "generating" ? (
                                <Badge
                                  variant="warning"
                                  className="bg-amber-500/10 text-amber-500 border-none text-[9px] px-1.5 py-0 font-bold animate-pulse"
                                >
                                  AI Report: Generating...
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="bg-red-500/10 text-red-500 border-none text-[9px] px-1.5 py-0 font-bold"
                                >
                                  AI Report: Failed
                                </Badge>
                              )}
                            </span>

                            <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="text-[11px] h-7 px-2.5 rounded-lg"
                              >
                                <Link
                                  to={`/result?reportId=${report._id}`}
                                  state={{ report }}
                                >
                                  View Report
                                </Link>
                              </Button>

                              <Button
                                size="sm"
                                variant="medical"
                                className="text-[11px] h-7 px-2.5 rounded-lg gap-1"
                                disabled={report.reportStatus !== "completed"}
                                onClick={() => downloadReportPdf(report._id, toast)}
                              >
                                <Download className="w-3 h-3" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
