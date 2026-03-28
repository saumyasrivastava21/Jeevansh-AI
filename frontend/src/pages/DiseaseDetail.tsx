import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const severityColor = {
  low: "success",
  medium: "warning",
  high: "danger",
} as const;

export default function DiseaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [disease, setDisease] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/diseases/${id}`)
      .then((res) => setDisease(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading disease details...</p>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Disease Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The disease you're looking for doesn't exist in our database.
        </p>
        <Button asChild variant="medical">
          <Link to="/diseases">Back to Diseases</Link>
        </Button>
      </div>
    );
  }

  const sections = [
    { tab: "symptoms", label: "🩺 Symptoms", items: disease.symptoms || [] },
    { tab: "causes", label: "🔬 Causes", items: disease.causes || [] },
    { tab: "treatment", label: "💊 Treatment", items: disease.treatment || [] },
    { tab: "prevention", label: "🛡️ Prevention", items: disease.prevention || [] },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
        <Link to="/diseases">
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </Button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-8"
      >
        <div className="relative h-64">
          <img
            src={disease.imageUrl}
            alt={disease.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{disease.icon}</span>
              <div>
                <h1 className="text-3xl font-black text-white">
                  {disease.name}
                </h1>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant={
                      severityColor[disease.severity as keyof typeof severityColor]
                    }
                  >
                    {disease.severity} severity
                  </Badge>
                  <Badge variant="info">AI Detectable</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="p-5 rounded-2xl bg-muted/50 border border-border">
          <p className="text-foreground leading-relaxed">
            {disease.shortDescription}
          </p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-medical-cyan" />{" "}
            {disease.prevalence}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs defaultValue="symptoms">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1.5 bg-muted rounded-2xl">
            {sections.map((s) => (
              <TabsTrigger
                key={s.tab}
                value={s.tab}
                className="text-xs sm:text-sm py-2 rounded-xl"
              >
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((s) => (
            <TabsContent key={s.tab} value={s.tab}>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 mt-2"
              >
                {s.items.map((item: string, i: number) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground">{item}</p>
                  </motion.li>
                ))}
              </motion.ul>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 p-6 rounded-2xl bg-medical-blue text-white text-center"
      >
        <h3 className="text-xl font-bold mb-2">
          Think you might have {disease.name}?
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Upload your scan and get an AI-powered diagnosis in seconds.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="cyan">
            <Link to="/dashboard">Upload Scan</Link>
          </Button>
          <Button
            asChild
            className="bg-white/10 text-white border border-white/30 hover:bg-white/20"
          >
            <Link to="/find-doctors">Find Specialist</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
