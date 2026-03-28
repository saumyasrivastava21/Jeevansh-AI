import { motion } from 'framer-motion';
import { Upload, Brain, MessageSquare, FileText, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Upload, num: '01', color: 'bg-blue-500/10 text-blue-600',
    title: 'Uploading Your Scan',
    points: ['Go to your Dashboard', 'Click "Upload X-Ray" or drag & drop', 'Select the disease type from dropdown', 'Click "Analyze with AI"'],
  },
  {
    icon: Brain, num: '02', color: 'bg-purple-500/10 text-purple-600',
    title: 'Understanding AI Analysis',
    points: ['AI processes your scan in seconds', 'Bounding boxes highlight findings', 'Confidence score shows certainty', 'Severity level guides urgency'],
  },
  {
    icon: MessageSquare, num: '03', color: 'bg-cyan-500/10 text-cyan-600',
    title: 'Using the AI Chatbot',
    points: ['Ask about your diagnosis', 'Use suggested question chips', 'Get evidence-based responses', 'Discuss treatment options'],
  },
  {
    icon: FileText, num: '04', color: 'bg-emerald-500/10 text-emerald-600',
    title: 'Getting Your Report',
    points: ['View full AI findings', 'Read doctor notes if reviewed', 'Download PDF report', 'Book doctor follow-up'],
  },
];

const faqs = [
  { q: 'How accurate is the AI diagnosis?', a: 'Jeevansh AI achieves 94.7% average accuracy across all 9 disease categories, validated against clinical diagnoses.' },
  { q: 'Is my data secure?', a: 'Yes. All medical data is encrypted end-to-end and stored in HIPAA-compliant infrastructure. We never share your data.' },
  { q: 'Can I use this as a final diagnosis?', a: 'No. Jeevansh AI is a screening and decision-support tool. Always consult a qualified doctor for diagnosis and treatment.' },
  { q: 'What image formats are supported?', a: 'We support JPEG, PNG, and DICOM formats. Image resolution should be at least 224x224 pixels for accurate analysis.' },
];

export default function Tutorial() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Getting Started</span>
        <h1 className="text-4xl font-bold mb-4">How to use <span className="gradient-text">Jeevansh AI</span></h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete step-by-step guide to getting the most out of our AI medical platform.</p>
        <Button asChild variant="cyan" className="mt-6 gap-2">
          <Link to="/register"><Play className="w-4 h-4" />Start Now — Free</Link>
        </Button>
      </motion.div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="medical-card overflow-hidden">
              <CardContent className="p-0">
                <div className={`flex flex-col sm:flex-row ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                  <div className={`${step.color} p-8 sm:w-56 flex flex-col items-center justify-center text-center flex-shrink-0`}>
                    <step.icon className="w-14 h-14 mb-3" />
                    <span className="text-4xl font-black opacity-30">{step.num}</span>
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <ul className="space-y-2.5">
                      {step.points.map((pt, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Video placeholder */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card className="medical-card overflow-hidden">
          <div className="h-64 bg-medical-blue relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://picsum.photos/seed/tutorial/800/400)', backgroundSize: 'cover' }} />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 border-4 border-white/40">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
              <p className="text-white font-bold text-xl">Watch Video Walkthrough</p>
              <p className="text-white/70 text-sm">5-minute complete platform tour</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="medical-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">Q</span>
                    <div>
                      <p className="font-semibold mb-1">{faq.q}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center p-8 rounded-2xl bg-medical-blue text-white">
        <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
        <p className="text-white/70 mb-5">Create your free account and upload your first scan in minutes.</p>
        <Button asChild variant="cyan" size="lg">
          <Link to="/register">Create Free Account <ArrowRight className="ml-2 w-4 h-4" /></Link>
        </Button>
      </motion.div>
    </div>
  );
}
