import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 sidebar-gradient relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-medical-cyan"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-medical-cyan flex items-center justify-center">
            <Activity className="w-6 h-6 text-medical-blue" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-none">Jeevansh AI</p>
            <p className="text-medical-cyan text-xs">Healthcare Platform</p>
          </div>
        </div>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10"
        >
          {/* Animated scan icon */}
          <div className="relative w-32 h-32 mb-10">
            <div className="w-32 h-32 rounded-full bg-medical-cyan/20 border-2 border-medical-cyan/40 flex items-center justify-center">
              <Activity className="w-14 h-14 text-medical-cyan animate-float" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-medical-cyan/30 animate-ping" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            AI-Powered Medical<br />
            <span className="text-medical-cyan">Diagnosis</span> Platform
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Upload medical images, get instant AI analysis, and connect with specialist doctors — all in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { label: 'Diagnoses', value: '50K+' },
              { label: 'Accuracy', value: '94.7%' },
              { label: 'Doctors', value: '200+' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-medical-cyan font-bold text-xl">{stat.value}</p>
                <p className="text-white/60 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/80 text-sm italic">"Jeevansh AI detected my condition early, giving me more treatment options. This technology saved my life."</p>
          <p className="text-medical-cyan text-xs mt-2 font-medium">— Priya S., Patient</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-medical-blue flex items-center justify-center">
              <Activity className="w-4 h-4 text-medical-cyan" />
            </div>
            <span className="font-bold text-lg">Jeevansh <span className="text-medical-cyan">AI</span></span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
