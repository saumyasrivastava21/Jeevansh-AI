import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, User, Stethoscope, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const roles: { id: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'patient', label: 'Patient', icon: User, desc: 'Analyze scans & get reports' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Review patient reports' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Manage the platform' },
];

export default function Login() {
  const [email, setEmail] = useState('arjun@example.com');
  const [password, setPassword] = useState('demo123');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your Jeevansh AI account</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {roles.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center',
              role === r.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            <r.icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{r.label}</span>
            <span className="text-[10px] opacity-70 hidden sm:block">{r.desc}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5 h-11"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="h-11 pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
        )}

        <Button type="submit" className="w-full h-11" variant="medical" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
      </p>

      {/* Demo hint */}
      <div className="mt-6 p-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground text-center">
        <span className="font-medium">Demo mode:</span> Click a role above, then Sign In with pre-filled credentials.
      </div>
    </motion.div>
  );
}
