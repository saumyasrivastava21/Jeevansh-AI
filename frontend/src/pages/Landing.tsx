import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity, Brain, Upload, MessageSquare, Stethoscope,
  CheckCircle2, ArrowRight, Star, Shield, Zap, Heart,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const features = [
  {
    icon: Brain,
    title: 'AI Disease Detection',
    description: 'Upload X-rays, MRIs, or CT scans and get instant AI-powered disease detection with 94.7% accuracy.',
    color: 'text-purple-500', bg: 'bg-purple-500/10',
  },
  {
    icon: MessageSquare,
    title: 'RAG-Powered Chatbot',
    description: 'Get personalized medical insights from our AI doctor trained on millions of clinical cases.',
    color: 'text-cyan-500', bg: 'bg-cyan-500/10',
  },
  {
    icon: Stethoscope,
    title: 'Doctor Consultation',
    description: 'Connect with 200+ specialist doctors for second opinions and expert medical advice.',
    color: 'text-emerald-500', bg: 'bg-emerald-500/10',
  },
];

const steps = [
  { num: '01', title: 'Upload Your Scan', desc: 'Upload your X-ray, MRI, or CT scan securely to our HIPAA-compliant platform.' },
  { num: '02', title: 'AI Analysis', desc: 'Our deep learning models analyze your scan in seconds, detecting anomalies with high precision.' },
  { num: '03', title: 'Get Your Report', desc: 'Receive a detailed report with findings, confidence scores, and recommended next steps.' },
];

const testimonials = [
  {
    name: 'Arjun Mehta', role: 'Patient', location: 'Bangalore',
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=0B3C5D&color=fff&size=128',
    text: 'Jeevansh AI detected my pneumonia 3 days before my follow-up appointment. The confidence score and detailed report gave my doctor all the information needed immediately.',
    rating: 5,
  },
  {
    name: 'Dr. Priya Kapoor', role: 'Radiologist', location: 'Mumbai',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Kapoor&background=2ECC71&color=fff&size=128',
    text: 'As a practicing radiologist, I use Jeevansh AI as a second opinion tool. It has caught subtle findings I initially missed. The AI annotations are exceptional.',
    rating: 5,
  },
  {
    name: 'Ravi Kumar', role: 'Patient', location: 'Delhi',
    avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=8B5CF6&color=fff&size=128',
    text: 'The chatbot explained my diagnosis in simple language my family could understand. The disease knowledge section helped us research treatment options.',
    rating: 5,
  },
];

const stats = [
  { label: 'Diagnoses Made', value: '50,000+' },
  { label: 'AI Accuracy', value: '94.7%' },
  { label: 'Specialist Doctors', value: '200+' },
  { label: 'Diseases Detected', value: '9 Types' },
];

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://picsum.photos/seed/hospital-hero/1920/1080)' }}
        />
        <div className="absolute inset-0 hero-overlay" />

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-medical-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-medical-green/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-medical-cyan/20 border border-medical-cyan/30 text-medical-cyan text-sm font-medium mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              Powered by Deep Learning AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6"
            >
              AI-Powered Medical{' '}
              <span className="text-medical-cyan">Diagnosis</span>{' '}
              for Everyone
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg"
            >
              Upload medical images, detect diseases instantly, and get AI-powered medical insights. Hospital-quality diagnosis, accessible anywhere.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {['HIPAA Compliant', 'FDA Cleared AI', '24/7 Available'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-white/70 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-medical-green" />
                  {item}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button asChild size="xl" variant="cyan" className="group">
                <Link to="/register">
                  <Upload className="w-5 h-5" />
                  Upload X-Ray
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm">
                <Link to="/chatbot">
                  <MessageSquare className="w-5 h-5" />
                  Talk to AI Doctor
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right — AI scan animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              {/* Outer pulse rings */}
              <div className="absolute inset-0 rounded-full border-2 border-medical-cyan/20 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-8 rounded-full border-2 border-medical-cyan/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              {/* Center */}
              <div className="absolute inset-16 rounded-full bg-medical-cyan/20 border-2 border-medical-cyan/60 flex items-center justify-center glow-cyan">
                <Activity className="w-20 h-20 text-medical-cyan animate-float" />
              </div>
              {/* Scan line */}
              <div className="absolute inset-16 rounded-full overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-medical-cyan/60 animate-scan-line" style={{ boxShadow: '0 0 10px rgba(0,209,255,0.8)' }} />
              </div>
              {/* Floating badges */}
              {[
                { label: 'Pneumonia', conf: '91%', pos: 'top-4 -left-8', color: 'bg-cyan-500' },
                { label: 'Clear', conf: '99%', pos: 'bottom-4 -right-8', color: 'bg-emerald-500' },
                { label: 'Analyzing...', conf: '', pos: 'top-1/2 -right-16', color: 'bg-amber-500' },
              ].map(b => (
                <motion.div
                  key={b.label}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: Math.random() * 2 }}
                  className={`absolute ${b.pos} px-3 py-1.5 rounded-lg glass-dark text-white text-xs font-medium flex items-center gap-1.5`}
                >
                  <span className={`w-2 h-2 rounded-full ${b.color}`} />
                  {b.label} {b.conf && <span className="text-medical-cyan">{b.conf}</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl font-black text-medical-cyan">{s.value}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Platform Features</span>
            <h2 className="text-4xl font-bold mb-4">Everything you need for <span className="gradient-text">AI-powered healthcare</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From instant disease detection to expert consultations — our platform covers every step of your medical journey.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="medical-card h-full group cursor-pointer">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <f.icon className={`w-7 h-7 ${f.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                    <div className="flex items-center gap-1 mt-6 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Learn more <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">How It Works</span>
            <h2 className="text-4xl font-bold mb-4">Get your diagnosis in <span className="text-secondary">3 simple steps</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-medical-cyan via-medical-green to-medical-blue opacity-30" />

            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative text-center">
                <div className="w-24 h-24 rounded-full bg-medical-blue flex items-center justify-center mx-auto mb-6 border-4 border-background shadow-lg">
                  <span className="text-medical-cyan text-2xl font-black">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
            <Button asChild size="lg" variant="medical" className="rounded-xl">
              <Link to="/register">Start Your Free Analysis <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">Testimonials</span>
            <h2 className="text-4xl font-bold mb-4">Trusted by patients and <span className="gradient-text">medical professionals</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="medical-card h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-muted-foreground text-xs">{t.role} · {t.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 bg-medical-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border-2 border-medical-cyan" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex justify-center mb-6">
              <Heart className="w-12 h-12 text-medical-cyan animate-float" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Take Control of Your Health Today
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Join 50,000+ patients and doctors using Jeevansh AI for smarter, faster, more accessible healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl" variant="cyan">
                <Link to="/register"><Shield className="w-5 h-5" />Get Started Free</Link>
              </Button>
              <Button asChild size="xl" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm">
                <Link to="/find-doctors">Find a Specialist</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
