import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, FileText, MessageSquare, Clock, TrendingUp, Activity,
  CloudUpload, X, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockReports } from '@/data/mock/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const statusBadgeMap: Record<string, { variant: 'success' | 'processing' | 'warning' | 'pending' | 'info'; label: string }> = {
  completed: { variant: 'success', label: 'Completed' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  processing: { variant: 'processing', label: 'Processing' },
  pending: { variant: 'pending', label: 'Pending' },
};

const diseases = [
  { value: 'brain-tumor', label: 'Brain Tumor' },
  { value: 'pneumonia', label: 'Pneumonia' },
  { value: 'bone-fracture', label: 'Bone Fracture' },
  { value: 'dental', label: 'Dental Caries' },
  { value: 'diabetic-retinopathy', label: 'Diabetic Retinopathy' },
  { value: 'skin-cancer', label: 'Skin Cancer' },
  { value: 'tuberculosis', label: 'Tuberculosis' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'lung-cancer', label: 'Lung Cancer' },
];

const statsCards = [
  { label: 'Total Reports', value: '12', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Completed', value: '9', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Pending', value: '2', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'AI Accuracy', value: '94.7%', icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [disease, setDisease] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f && f.type.startsWith('image/')) setFile(f);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file || !disease) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    setUploading(false);
    navigate('/result');
  };

  const userReports = mockReports.slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-2xl font-bold">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'},{' '}
          <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Here's your health overview for today.</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} custom={i} initial="hidden" animate="visible">
            <Card className="medical-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload card */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="medical-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-primary" />
                Upload & Analyze
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragging ? 'border-primary bg-primary/10 scale-[1.02]' : file ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:border-primary/60 hover:bg-muted/50'
                }`}
              >
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {file ? (
                  <div>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-emerald-600 truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Drop your scan here</p>
                    <p className="text-xs text-muted-foreground mt-1">X-Ray, MRI, CT — PNG, JPG, DICOM</p>
                  </div>
                )}
              </div>

              {/* Disease selector */}
              <div>
                <p className="text-sm font-medium mb-1.5">Disease Type</p>
                <Select value={disease} onValueChange={setDisease}>
                  <SelectTrigger><SelectValue placeholder="Select disease to analyze..." /></SelectTrigger>
                  <SelectContent>
                    {diseases.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full" variant="medical"
                disabled={!file || !disease || uploading}
                onClick={handleAnalyze}
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Activity className="w-4 h-4" />Analyze with AI</>}
              </Button>

              {(!file || !disease) && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Upload a scan and select disease type to start
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent reports */}
        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="medical-card h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Reports
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/dashboard/reports">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userReports.map((report, i) => {
                  const status = statusBadgeMap[report.status];
                  return (
                    <motion.div key={report.id} variants={fadeUp} custom={i} initial="hidden" animate="visible">
                      <Link to="/result">
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                          <img src={report.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{report.diseaseName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <span className={`text-xs font-semibold ${report.confidence > 85 ? 'text-emerald-600' : report.confidence > 70 ? 'text-amber-600' : 'text-red-600'}`}>
                              {report.confidence}%
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'AI Chatbot', icon: MessageSquare, to: '/chatbot', color: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
            { label: 'Find Doctors', icon: Activity, to: '/find-doctors', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
            { label: 'Disease Info', icon: FileText, to: '/diseases', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20' },
            { label: 'Tutorial', icon: CheckCircle2, to: '/tutorial', color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
          ].map(a => (
            <Link key={a.label} to={a.to}>
              <div className={`flex items-center gap-3 p-4 rounded-xl border border-border transition-all duration-200 cursor-pointer ${a.color}`}>
                <a.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
