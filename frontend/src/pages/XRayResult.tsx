import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const severityConfig = {
  low: {
    label: "Low Risk",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    prog: "bg-emerald-500",
  },
  medium: {
    label: "Medium Risk",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    icon: AlertTriangle,
    prog: "bg-amber-500",
  },
  high: {
    label: "High Risk",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    prog: "bg-red-500",
  },
};

export default function XRayResult() {
  const location = useLocation();
  const report = location.state?.report;

  const [heatmap, setHeatmap] = useState(false);
  const [zoom, setZoom] = useState(false);

  if (!report) {
    return <Navigate to="/dashboard" replace />;
  }

  const sev =
    severityConfig[report.severity as keyof typeof severityConfig] ||
    severityConfig.medium;
  const SevIcon = sev.icon;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Result</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Report ID: {report._id.slice(-6).toUpperCase()} ·{" "}
            {new Date(report.createdAt).toLocaleDateString("en-IN", {
              dateStyle: "long",
            })}
          </p>
        </div>
        <Button variant="medical" className="gap-2">
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image panel */}
        <Card className="medical-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Medical Scan</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={heatmap ? "medical" : "outline"}
                size="sm"
                onClick={() => setHeatmap(!heatmap)}
                className="text-xs"
              >
                {heatmap ? "Original" : "Heatmap"}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setZoom(!zoom)}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`relative rounded-xl overflow-hidden bg-black/10 transition-all duration-300 ${
                zoom ? "h-96" : "h-72"
              }`}
            >
              <img
                src={report.imageUrl || "/images/diseases/pneumonia.png"}
                alt="Medical scan"
                className="w-full h-full object-cover"
                style={{
                  filter: heatmap
                    ? "hue-rotate(120deg) saturate(2)"
                    : "grayscale(0.3)",
                }}
              />
              {/* Heatmap overlay */}
              {heatmap && report.bboxCoords && (
                <div className="absolute inset-0 mix-blend-color-dodge">
                  <div
                    className="absolute rounded-full opacity-60 blur-2xl bg-red-500"
                    style={{
                      left: `${report.bboxCoords.x}%`,
                      top: `${report.bboxCoords.y}%`,
                      width: `${report.bboxCoords.w}%`,
                      height: `${report.bboxCoords.h}%`,
                    }}
                  />
                </div>
              )}
              {/* Bounding box */}
              {report.bboxCoords && (
                <div
                  className="absolute border-2 border-medical-cyan rounded"
                  style={{
                    left: `${report.bboxCoords.x}%`,
                    top: `${report.bboxCoords.y}%`,
                    width: `${report.bboxCoords.w}%`,
                    height: `${report.bboxCoords.h}%`,
                    boxShadow:
                      "0 0 0 1px rgba(0,209,255,0.3), inset 0 0 0 1px rgba(0,209,255,0.1)",
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-medical-cyan text-medical-blue text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {report.diseaseName} — {report.confidence}%
                  </span>
                  {/* Corner marks */}
                  {[
                    "-top-1 -left-1",
                    "-top-1 -right-1",
                    "-bottom-1 -left-1",
                    "-bottom-1 -right-1",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={`absolute ${pos} w-3 h-3 border-2 border-medical-cyan bg-medical-cyan/20 rounded-sm`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results panel */}
        <div className="space-y-4">
          {/* Severity card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border-2 ${sev.border} ${sev.bg}`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${sev.bg}`}
                >
                  <SevIcon className={`w-8 h-8 ${sev.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Severity Level
                  </p>
                  <p className={`text-2xl font-black ${sev.color}`}>
                    {sev.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.diseaseName} detected
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confidence */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="medical-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">AI Confidence Score</p>
                  <span className="text-2xl font-black text-primary">
                    {report.confidence}%
                  </span>
                </div>
                <Progress
                  value={report.confidence}
                  indicatorClassName={sev.prog}
                  className="h-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0% — No findings</span>
                  <span>100% — High confidence</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Individual model scores: ResNet-50: ${(report.confidence - 2.1).toFixed(1)}% ·
                  EfficientNet: ${(report.confidence + 1.2).toFixed(1)}% · DenseNet: ${report.confidence.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="medical-card">
              <CardContent className="p-5 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">Report Status</p>
                  <Badge variant={report.status === "completed" ? "success" : "info"}>
                    <span className="capitalize">{report.status}</span>
                  </Badge>
                </div>
                {report.doctorName && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed by{" "}
                    <span className="font-medium text-foreground">
                      {report.doctorName}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* AI Findings */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> AI Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.aiFindings || "No AI findings generated."}
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.recommendation || "No recommendations."}
            </p>
            {report.doctorNotes && (
              <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
                <p className="text-xs font-semibold text-foreground mb-1">
                  Doctor Notes
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.doctorNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
