import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  Filter,
  Eye,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { downloadReportPdf } from "@/utils/pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
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

const diseaseOptions = [
  { value: "all", label: "All Scan Types" },
  { value: "brain-tumor", label: "Brain Tumor" },
  { value: "pneumonia", label: "Pneumonia" },
  { value: "bone-fracture", label: "Bone Fracture" },
  { value: "skin-cancer", label: "Skin Cancer" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
];

export default function MyReports() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filter/Sort States
  const [search, setSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortByDate, setSortByDate] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/reports/myreports");
      if (res.success) {
        setReports(res.data || []);
      } else {
        setError(res.message || "Failed to load reports history.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const processedReports = reports
    .filter((report) => {
      // 1. Search Query Match
      const matchesSearch =
        report.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
        (report.prediction &&
          report.prediction.toLowerCase().includes(search.toLowerCase()));

      // 2. Disease Match
      const matchesDisease =
        diseaseFilter === "all" || report.disease === diseaseFilter;

      // 3. Status Match
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && report.reportStatus === "completed") ||
        (statusFilter === "processing" && report.reportStatus === "generating");

      return matchesSearch && matchesDisease && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by Date
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortByDate === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">My Medical Reports</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Access, filter, and review all AI analysis history logs and medical PDFs.
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/upload")} variant="medical" className="rounded-xl">
          Upload New X-Ray
        </Button>
      </div>

      {/* Query Controls */}
      <Card className="medical-card border-primary/10">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by disease or label..."
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                <SelectTrigger className="w-[150px] h-10 rounded-xl">
                  <SelectValue placeholder="Scan Type" />
                </SelectTrigger>
                <SelectContent>
                  {diseaseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl">
                <SelectValue placeholder="Report Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortByDate((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="h-10 rounded-xl gap-1.5 px-3 border-border hover:bg-muted"
            >
              <ArrowUpDown className="w-4 h-4" />
              Date ({sortByDate === "desc" ? "Latest" : "Oldest"})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid or Table list */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground font-semibold">Fetching diagnostic reports...</p>
        </div>
      ) : error ? (
        <Card className="p-8 border-red-500/20 bg-red-500/5 text-center flex flex-col items-center gap-3 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <div>
            <p className="font-bold text-foreground">Inquiry Failed</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchReports} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/5">
            Retry Connection
          </Button>
        </Card>
      ) : processedReports.length === 0 ? (
        <div className="py-20 border border-dashed rounded-2xl text-center space-y-4 bg-background/40">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-lg">No reports found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No medical analysis matching your query matches the saved records.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard/upload")} variant="medical" className="rounded-xl">
            Upload X-Ray
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {processedReports.map((report, i) => {
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
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="medical-card h-full flex flex-col overflow-hidden">
                    {/* Thumbnail banner */}
                    <div className="h-32 bg-black relative flex items-center justify-center overflow-hidden">
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
                        className="w-full h-full object-cover opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={status.variant} className="backdrop-blur-md bg-opacity-70">
                          {status.label}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 text-[10px] bg-black/60 text-white font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        ID: {report._id.slice(-6).toUpperCase()}
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between min-w-0">
                          <p className="font-bold text-base text-foreground truncate">
                            {report.diseaseName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>

                        <div className="space-y-1 pt-1">
                          <p className="text-xs text-muted-foreground flex justify-between">
                            <span>Prediction:</span>
                            <span className="font-bold text-foreground capitalize">
                              {(report.prediction || "Negative").replace(/_/g, " ")}
                            </span>
                          </p>
                          {report.confidence !== null && report.confidence !== undefined && (
                            <p className="text-xs text-muted-foreground flex justify-between">
                              <span>Confidence:</span>
                              <span className="font-bold text-foreground">
                                {report.confidence}%
                              </span>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground flex justify-between">
                            <span>AI Model:</span>
                            <span className="font-semibold text-foreground truncate max-w-[150px]">
                              {report.aiModel || "Jeevansh Classifier"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-xs gap-1"
                        >
                          <Link to={`/result?reportId=${report._id}`} state={{ report }}>
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="medical"
                          size="sm"
                          disabled={report.reportStatus !== "completed"}
                          onClick={() => downloadReportPdf(report._id, toast)}
                          className="h-9 rounded-xl text-xs gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </Button>
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
  );
}
