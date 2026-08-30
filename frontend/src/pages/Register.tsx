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
  { id: 'patient', label: 'Patient', icon: User, desc: 'Get AI-powered diagnoses' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Review & annotate reports' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Platform management' },
];

export default function Register() {
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const password = form.password;

    // 1. Minimum 8 characters
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    // 2. At least 1 uppercase letter (A-Z)
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }
    // 3. At least 1 lowercase letter (a-z)
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter (a-z).');
      return;
    }
    // 4. At least 1 digit (0-9)
    if (!/\d/.test(password)) {
      setError('Password must contain at least one digit (0-9).');
      return;
    }
    // 5. At least 1 special character (@, #, $, %, etc.)
    if (!/[^A-Za-z0-9\s]/.test(password)) {
      setError('Password must contain at least one special character (e.g. @, #, $, %).');
      return;
    }
    // 6. No spaces
    if (/\s/.test(password)) {
      setError('Password must not contain spaces.');
      return;
    }
    // 7. Confirm password should match the password
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({ ...form, role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground">Join 50,000+ patients and doctors on Jeevansh AI</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {roles.map(r => (
          <button key={r.id} type="button" onClick={() => setRole(r.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
              role === r.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <r.icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{r.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" className="mt-1.5 h-10" placeholder="Dr. Arjun Mehta" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="col-span-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" className="mt-1.5 h-10" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" className="mt-1.5 h-10" placeholder="+91-9876543210" value={form.phone} onChange={handleChange('phone')} />
          </div>
          <div>
            <Label htmlFor="address">City / Address</Label>
            <Input id="address" className="mt-1.5 h-10" placeholder="Bangalore, KA" value={form.address} onChange={handleChange('address')} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative mt-1.5">
              <Input id="reg-password" type={showPassword ? 'text' : 'password'} className="h-10 pr-10" placeholder="Min. 8 characters with A-Z, a-z, 0-9, special char" value={form.password} onChange={handleChange('password')} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative mt-1.5">
              <Input id="confirm-password" type={showPassword ? 'text' : 'password'} className="h-10 pr-10" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

        <Button type="submit" className="w-full h-11" variant="medical" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
      <p className="text-center text-xs text-muted-foreground mt-3">
        By signing up you agree to our{' '}
        <Link to="#" className="text-primary hover:underline">Terms</Link>{' '}and{' '}
        <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </motion.div>
  );
}
