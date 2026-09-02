import { motion } from "framer-motion";
import { Linkedin, Phone, UserCheck, Stethoscope, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const teamMembers = [
  {
    name: "Saumya Srivastava",
    role: "Founder & Lead AI / Full-Stack Architect",
    phone: "+91 9026348598",
    linkedin: "https://www.linkedin.com/in/saumsriv/?skipRedirect=true",
  },
  {
    name: "Priyanshu Mishra",
    role: "Backend Developer",
  },
  {
    name: "Rajneesh Kumar",
    role: "Core AI Developer & System Integrator",
  },
];

export default function Team() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded-md">
          About Us
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          The Innovators
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mb-4">
          Meet the <span className="gradient-text">Jeevansh AI</span> Team
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          The engineers and developers behind Jeevansh AI, working to revolutionize clinical decision support.
        </p>
      </motion.div>

      {/* Grid of Team Members */}
      <div className="grid md:grid-cols-3 gap-8">
        {teamMembers.map((member, i) => (
          <motion.div
            key={member.name}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            <Card className="medical-card h-full border-primary/10 bg-background/50 backdrop-blur-xl relative overflow-hidden group">
              <CardContent className="p-6 space-y-6 flex flex-col items-center text-center">
                {/* Holographic Initial Avatar (Empty Photo area) */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-medical-blue/20 via-medical-cyan/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <span className="text-3xl font-black text-primary leading-none">
                    {member.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  {/* Subtle Tech Grid Animation Overlay */}
                  <div className="absolute inset-0 bg-grid-line opacity-10" />
                  <div className="absolute -inset-1 rounded-full border border-primary/30 animate-pulse pointer-events-none" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Jeevansh AI Core Team
                  </p>
                </div>

                {/* Contact info (Strictly conditionally rendered) */}
                <div className="space-y-2.5 w-full pt-4 border-t border-border flex flex-col items-center">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-primary hover:underline font-semibold"
                    >
                      <Linkedin className="w-4 h-4 text-primary" />
                      <span>Connect on LinkedIn</span>
                    </a>
                  )}

                  {!member.phone && !member.linkedin && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-60">
                      <UserCheck className="w-4 h-4" />
                      <span>Verified Core Innovator</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Small platform tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-8"
      >
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-primary animate-pulse" />
          Building tools to empower clinical radiography through artificial intelligence.
        </p>
      </motion.div>
    </div>
  );
}
