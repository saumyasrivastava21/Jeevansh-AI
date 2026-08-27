import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CloudUpload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const diseases = [
  { value: "brain-tumor", label: "Brain Tumor Scan" },
  { value: "pneumonia", label: "Pneumonia Chest X-Ray" },
  { value: "bone-fracture", label: "Bone Fracture Scan" },
  { value: "skin-cancer", label: "Skin Cancer Dermoscopy" },
];

export default function XRayUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [disease, setDisease] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const stages = [
    "Uploading scan...",
    "Sending scan for AI analysis...",
    "Running medical AI model...",
    "Processing results...",
    "Generating AI report...",
  ];

  const handleFile = (f: File) => {
    if (f) {
      if (f.type.startsWith("image/")) {
        setFile(f);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (PNG, JPG, JPEG).",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const startStageTransitions = () => {
    setCurrentStage(0);
    // Cycle through stage prompts during waiting
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1500);
    return interval;
  };

  const handleAnalyze = async () => {
    if (!file || !disease) return;
    setUploading(true);
    const stageInterval = startStageTransitions();

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("disease", disease);
      formData.append(
        "diseaseName",
        diseases.find((d) => d.value === disease)?.label || disease
      );

      const res = await apiFetch("/reports", {
        method: "POST",
        body: formData,
      });

      clearInterval(stageInterval);
      if (res.success) {
        toast({
          title: "Analysis Completed",
          description: "Inference completed and saved successfully.",
          variant: "success",
        });
        navigate(`/result?reportId=${res.data._id}`, {
          state: { report: res.data },
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: res.message || "Failed to process scan.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      clearInterval(stageInterval);
      console.error(err);
      toast({
        title: "Inference Error",
        description: err.message || "An error occurred during scan upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back to dashboard */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-md">
          HIPAA Secur·ID
        </span>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-2 text-center"
      >
        <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
          AI Medical Scan Upload
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Securely upload patient scans for high-precision diagnostic screening and AI assessment reports.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <Card className="medical-card overflow-hidden border-primary/20 bg-background/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-primary" />
              Upload Scan Image
            </CardTitle>
            <CardDescription>
              Drag and drop scan files. HIPAA encrypted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? "border-primary bg-primary/10 scale-[1.02]"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border hover:border-primary/60 hover:bg-muted/30"
              } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              {file ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold">Drop medical scan here</p>
                  <p className="text-xs text-muted-foreground">
                    Supports PNG, JPG, JPEG
                  </p>
                </div>
              )}
            </div>

            {/* Disease Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Select Scan Diagnosis Category
              </label>
              <Select
                value={disease}
                onValueChange={setDisease}
                disabled={uploading}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Choose a medical scan model..." />
                </SelectTrigger>
                <SelectContent>
                  {diseases.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full h-12 rounded-xl text-sm font-bold transition-all"
              variant="medical"
              disabled={!file || !disease || uploading}
              onClick={handleAnalyze}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Activity className="w-4.5 h-4.5 mr-2" />
                  Upload & Analyze Scan
                </>
              )}
            </Button>

            {(!file || !disease) && (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Provide a file and diagnosis category to preheat model weights.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploading progress modal */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">AI Scanning In Progress</h3>
                <p className="text-xs text-muted-foreground">Please do not navigate away or close the browser.</p>
              </div>

              {/* Progress ticker */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm font-semibold text-primary animate-pulse">
                  {stages[currentStage]}
                </p>
                <Progress
                  value={((currentStage + 1) / stages.length) * 100}
                  className="h-2 mt-3"
                  indicatorClassName="bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
