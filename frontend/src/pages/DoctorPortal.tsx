import { motion } from 'framer-motion';
import { useState } from 'react';
import { mockReports } from '@/data/mock/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, User, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

const severityColor = { low: 'success', medium: 'warning', high: 'danger' } as const;
const statusColor = { completed: 'success', reviewed: 'info', processing: 'processing', pending: 'pending' } as const;

export default function DoctorPortal() {
  const [selected, setSelected] = useState(mockReports[0]);
  const [notes, setNotes] = useState(selected.doctorNotes ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold">Doctor Portal</h2>
        <p className="text-muted-foreground text-sm mt-1">Review patient scans and add clinical notes.</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Reports list */}
        <div className="lg:col-span-2">
          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Patient Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {mockReports.map(r => (
                  <button key={r.id} onClick={() => { setSelected(r); setNotes(r.doctorNotes ?? ''); setSaved(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selected.id === r.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/60'}`}>
                    <img src={r.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.patientName}</p>
                      <p className="text-xs text-muted-foreground">{r.diseaseName}</p>
                    </div>
                    <Badge variant={statusColor[r.status]} className="text-[10px]">{r.status}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient info */}
          <Card className="medical-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">{selected.patientName}</p>
                  <p className="text-sm text-muted-foreground">{selected.diseaseName} — ID: {selected.id.toUpperCase()}</p>
                </div>
                <Badge variant={severityColor[selected.severity]} className="ml-auto capitalize">{selected.severity} risk</Badge>
              </div>
              <img src={selected.imageUrl} alt="scan" className="w-full h-52 object-cover rounded-xl mb-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-bold text-primary">{selected.confidence}%</span>
                </div>
                <Progress value={selected.confidence} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {selected.severity === 'high' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                AI Findings & Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{selected.aiFindings}</p>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground">{selected.recommendation}</div>
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
                onChange={e => setNotes(e.target.value)}
              />
              <Button onClick={handleSave} variant="medical" size="sm" className="gap-2">
                {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Notes</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
