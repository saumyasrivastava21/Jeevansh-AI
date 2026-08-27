import { useState, useEffect } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  ZoomIn,
  Loader2,
  FileText,
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
  const initialReport = location.state?.report;

  const [heatmap, setHeatmap] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [reportData, setReportData] = useState(initialReport);
  const [initialLoading, setInitialLoading] = useState(!initialReport);
  const [initialError, setInitialError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch initial report if only reportId in URL is available
  useEffect(() => {
    if (reportData) return;

    const queryParams = new URLSearchParams(location.search);
    const reportId = queryParams.get("reportId");
    if (!reportId) {
      setInitialLoading(false);
      return;
    }

    async function fetchInitialReport() {
      try {
        const token = localStorage.getItem('jeevansh_token');
        const res = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const apiRes = await res.json();
          if (apiRes.success && apiRes.data) {
            setReportData(apiRes.data);
          } else {
            setInitialError(apiRes.message || "Failed to load report");
          }
        } else {
          setInitialError("Failed to fetch report from backend");
        }
      } catch (err) {
        setInitialError(err.message || "Network error loading report");
      } finally {
        setInitialLoading(false);
      }
    }

    fetchInitialReport();
  }, [location.search, reportData]);

  // Polling effect for background report generation
  useEffect(() => {
    if (!reportData?._id) return;
    if (reportData.reportStatus !== "generating" && reportData.reportStatus !== "pending") return;
    if (isTimeout) return;

    const startTime = Date.now();
    const maxDuration = 120000; // 2 minutes

    const intervalId = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxDuration) {
        setIsTimeout(true);
        clearInterval(intervalId);
        return;
      }

      try {
        const token = localStorage.getItem('jeevansh_token');
        const res = await fetch(`http://localhost:5000/api/reports/${reportData._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const apiRes = await res.json();
          if (apiRes.success && apiRes.data) {
            setReportData(apiRes.data);
            if (apiRes.data.reportStatus !== "generating" && apiRes.data.reportStatus !== "pending") {
              clearInterval(intervalId);
            }
          }
        }
      } catch (err) {
        console.error("Error polling report status:", err);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [reportData?._id, reportData?.reportStatus, isTimeout]);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-background p-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading analysis result...</p>
      </div>
    );
  }

  if (initialError || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-background p-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-bold text-foreground">{initialError || "Analysis result not found."}</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">Go back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const report = reportData;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('jeevansh_token');
      const response = await fetch(`http://localhost:5000/api/reports/${report._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        alert("Failed to download PDF report");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Jeevansh-AI-Report-${report._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF download failed", error);
      alert("An error occurred while downloading the report PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setReportData(prev => prev ? { ...prev, reportStatus: "generating" } : prev);
      setIsTimeout(false);
      const token = localStorage.getItem('jeevansh_token');
      const response = await fetch(`http://localhost:5000/api/reports/${report._id}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const apiRes = await response.json();
        if (apiRes.success && apiRes.data) {
          setReportData(apiRes.data);
        }
      } else {
        alert("Regeneration failed");
        setReportData(prev => prev ? { ...prev, reportStatus: "failed" } : prev);
      }
    } catch (err) {
      console.error("Regeneration request failed:", err);
      setReportData(prev => prev ? { ...prev, reportStatus: "failed" } : prev);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsTimeout(false);
      const token = localStorage.getItem('jeevansh_token');
      const res = await fetch(`http://localhost:5000/api/reports/${report._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const apiRes = await res.json();
        if (apiRes.success && apiRes.data) {
          setReportData(apiRes.data);
        }
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  const sev =
    severityConfig[report.severity as keyof typeof severityConfig] ||
    severityConfig.medium;
  const SevIcon = sev.icon;

  const getScanImageSrc = () => {
    if (heatmap && report.heatmapImage) {
      return `data:image/jpeg;base64,${report.heatmapImage}`;
    }
    if (!report.imageUrl) {
      return "/images/diseases/pneumonia.png";
    }
    if (report.imageUrl.startsWith("http") || report.imageUrl.startsWith("blob:")) {
      return report.imageUrl;
    }
    return `http://localhost:5000${report.imageUrl}`;
  };

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
        {report.reportStatus === "completed" ? (
          <Button variant="medical" className="gap-2" onClick={handleDownloadPdf} disabled={downloading}>
            <Download className="w-4 h-4" /> Download Medical Report
          </Button>
        ) : report.reportStatus === "generating" ? (
          <Button variant="outline" className="gap-2" disabled>
            <Loader2 className="w-4.5 h-4.5 animate-spin text-cyan-500" /> Generating Report...
          </Button>
        ) : (
          <Button variant="outline" className="gap-2" disabled>
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" /> Report generation unavailable
          </Button>
        )}
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
                {heatmap ? "Original" : (report.taskType === "detection" ? "Attention Overlay" : "Grad-CAM Heatmap")}
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
                src={getScanImageSrc()}
                alt="Medical scan"
                className="w-full h-full object-cover"
                style={{
                  filter: heatmap
                    ? (report.heatmapImage ? "none" : "hue-rotate(120deg) saturate(2)")
                    : "grayscale(0.3)",
                }}
              />
              {/* Heatmap overlay (Attention Overlay for YOLO, Grad-CAM for Classification) */}
              {heatmap && (report.taskType === "detection" ? (
                // Draw attention circles centered on each detection
                <div className="absolute inset-0 mix-blend-color-dodge">
                  {(report.detections && report.detections.length > 0 ? report.detections : (report.bboxCoords ? [{ bbox: report.bboxCoords }] : [])).map((d: any, idx: number) => (
                    <div
                      key={`heatmap-${idx}`}
                      className="absolute rounded-full opacity-60 blur-2xl bg-red-500"
                      style={{
                        left: `${d.bbox.x}%`,
                        top: `${d.bbox.y}%`,
                        width: `${d.bbox.w}%`,
                        height: `${d.bbox.h}%`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                report.heatmapImage && (
                  <div className="absolute inset-0">
                    {/* Heatmap base64 is already set as image src */}
                  </div>
                )
              ))}
              
              {/* Bounding boxes (multiple detections support) */}
              {(report.taskType === "detection" || report.bboxCoords) && 
                (report.detections && report.detections.length > 0 ? report.detections : (report.bboxCoords ? [{ label: report.diseaseName, confidence: report.confidence, bbox: report.bboxCoords }] : [])).map((d: any, idx: number) => {
                  const bbox = d.bbox;
                  if (!bbox) return null;
                  const labelVal = d.label || d.class || report.diseaseName;
                  const confVal = d.confidence ? (d.confidence <= 1 ? Math.round(d.confidence * 100) : d.confidence) : report.confidence;
                  return (
                    <div
                      key={`bbox-${idx}`}
                      className="absolute border-2 border-medical-cyan rounded"
                      style={{
                        left: `${bbox.x}%`,
                        top: `${bbox.y}%`,
                        width: `${bbox.w}%`,
                        height: `${bbox.h}%`,
                        boxShadow:
                          "0 0 0 1px rgba(0,209,255,0.3), inset 0 0 0 1px rgba(0,209,255,0.1)",
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-medical-cyan text-medical-blue text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                        {labelVal.replace(/_/g, " ")} — {confVal}%
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
                  );
                })
              }
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
                    {report.hasFinding ? `${report.diseaseName} detected` : `No ${report.diseaseName.toLowerCase()} detected`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confidence */}
          {report.confidence !== null && report.confidence !== undefined ? (
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
                    Inference Model: <span className="font-semibold text-foreground">{report.aiModel || "Jeevansh AI Classifier"} {report.aiModelVersion ? `(v${report.aiModelVersion})` : ""}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="medical-card bg-muted/20 border border-border">
                <CardContent className="p-5 space-y-2">
                  <p className="text-sm font-semibold">AI Confidence Score</p>
                  <p className="text-sm font-black text-primary">N/A</p>
                  <p className="text-xs text-muted-foreground">
                    No {report.diseaseName.toLowerCase()} detected above the configured detection threshold (0.25).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inference Model: <span className="font-semibold text-foreground">{report.aiModel || "Jeevansh AI Detector"} {report.aiModelVersion ? `(v${report.aiModelVersion})` : ""}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

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

      {/* Dynamic Class Probabilities or YOLO Detections */}
      {report.taskType === "classification" && report.probabilities && Object.keys(report.probabilities).length > 0 && (
        <Card className="medical-card mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Class Probabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(report.probabilities) as [string, number][])
              .sort((a, b) => b[1] - a[1]) // Sort probabilities descending
              .map(([cls, prob]) => {
                const percentageValue = prob <= 1 ? prob * 100 : prob;
                return (
                  <div key={cls} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize">{cls.replace(/_/g, " ")}</span>
                      <span>{percentageValue.toFixed(2)}%</span>
                    </div>
                    <Progress value={percentageValue} className="h-1.5" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}

      {report.taskType === "detection" && report.detections && report.detections.length > 0 && (
        <Card className="medical-card mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Detected Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.detections.map((d: any, idx: number) => {
              const percentageValue = d.confidence <= 1 ? d.confidence * 100 : d.confidence;
              return (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold capitalize">{(d.label || d.class || "").replace(/_/g, " ")}</p>
                    {d.bbox && (
                      <p className="text-xs text-muted-foreground">Location: X: {Math.round(d.bbox.x)}%, Y: {Math.round(d.bbox.y)}%</p>
                    )}
                  </div>
                  <Badge variant="outline" className="border-medical-cyan text-medical-cyan font-bold">
                    {percentageValue.toFixed(2)}% Confidence
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* AI Medical Report Section */}
      {report.reportStatus === "completed" && report.medicalReport ? (
        <Card className="medical-card mt-6 border-cyan-500/30 bg-cyan-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-500" /> AI-Generated Medical Report
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              AI-generated interpretation based on verified model output.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-1">SUMMARY</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.medicalReport.summary}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-2">FINDINGS</h4>
              <div className="space-y-3">
                {(report.medicalReport.findings || []).map((finding: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-background border border-border space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">{finding.diseaseName}</span>
                      <Badge variant={finding.status === "detected" ? "destructive" : "success"}>
                        <span className="capitalize">{finding.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">Inference Model:</span>
                        <p>{finding.modelName || report.aiModel}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Architecture:</span>
                        <p>{finding.modelArchitecture || (report.taskType === "detection" ? "YOLO11" : "MobileNetV3-Large")}</p>
                      </div>
                      {finding.prediction && (
                        <div>
                          <span className="font-semibold text-foreground">Prediction:</span>
                          <p className="capitalize">{finding.prediction.replace(/_/g, " ")}</p>
                        </div>
                      )}
                      {finding.confidence !== null && finding.confidence !== undefined && (
                        <div>
                          <span className="font-semibold text-foreground">Confidence:</span>
                          <p>{finding.confidence}%</p>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground pt-1">
                      <span className="font-semibold text-foreground text-xs block mb-0.5">Interpretation:</span>
                      <p className="leading-relaxed">{finding.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-1">OVERALL ASSESSMENT</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.medicalReport.overallAssessment}
              </p>
            </div>

            {report.medicalReport.recommendations && report.medicalReport.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">RECOMMENDATIONS</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {report.medicalReport.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.medicalReport.limitations && report.medicalReport.limitations.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">LIMITATIONS</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {report.medicalReport.limitations.map((lim: string, idx: number) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.medicalReport.disclaimer && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-500">
                <span className="font-bold block mb-1">DISCLAIMER</span>
                <p>{report.medicalReport.disclaimer}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="medical" className="gap-2" onClick={handleDownloadPdf} disabled={downloading}>
                <Download className="w-4 h-4" /> Download Medical Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isTimeout ? (
        <Card className="medical-card mt-6 bg-muted/20 border-amber-500/30">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">Report generation is taking longer than expected.</p>
              <p className="text-xs text-muted-foreground">The AI report builder has not completed in the expected 2 minutes. You can manually refresh the status or request a retry.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh Status
              </Button>
              <Button variant="medical" size="sm" onClick={handleRegenerate}>
                Retry Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : report.reportStatus === "generating" ? (
        <Card className="medical-card mt-6 border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">Generating AI Medical Report...</p>
              <p className="text-xs text-muted-foreground">NVIDIA Nemotron is analyzing the findings and constructing your clinical report.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="medical-card mt-6 bg-muted/20">
          <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-foreground">AI report generation is currently unavailable.</p>
              {report.reportStatus === "failed_validation" ? (
                <p className="text-xs text-muted-foreground">The generated report did not pass clinical safety validation checks. Raw model outputs remain fully verified.</p>
              ) : (
                <p className="text-xs text-muted-foreground">The AI report builder timed out or is temporarily offline. Model inference results are preserved.</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2 border-primary text-primary hover:bg-primary/5">
              Retry Report Generation
            </Button>
          </CardContent>
        </Card>
      )}


      {/* Medical Safety Disclaimer */}

      <Card className="border-red-200/40 bg-red-500/5 mt-6">
        <CardContent className="p-4 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Clinical Review Required</h4>
            <p className="text-xs text-red-600/90 dark:text-red-400/80 leading-relaxed">
              <strong>Disclaimer:</strong> Jeevansh AI predictions are decision-support outputs and are <strong>NOT</strong> a confirmed medical diagnosis. These AI results are for decision support and do not replace evaluation by a qualified healthcare professional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
