import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, MessageSquare, Activity, Stethoscope,
  BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, UserCheck, Upload,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Upload X-Ray', icon: Upload, to: '/dashboard/upload', roles: ['patient'] },
  { label: 'My Reports', icon: FileText, to: '/dashboard/reports' },
  { label: 'AI Chatbot', icon: MessageSquare, to: '/chatbot' },
  { label: 'Diseases', icon: BookOpen, to: '/diseases' },
  { label: 'Find Doctors', icon: Stethoscope, to: '/find-doctors' },
  { label: 'Community', icon: Users, to: '/community' },
  { label: 'Tutorial', icon: Activity, to: '/tutorial' },
  // Doctor only
  { label: 'Patient Reports', icon: UserCheck, to: '/doctor', roles: ['doctor'] },
  // Admin only
  { label: 'Admin Panel', icon: ShieldCheck, to: '/admin', roles: ['admin'] },
  { label: 'Manage Users', icon: Users, to: '/admin/users', roles: ['admin'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filtered = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-screen sidebar-gradient border-r border-white/10 z-40 flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-0')}>
        <div className="w-9 h-9 rounded-xl bg-medical-cyan flex items-center justify-center flex-shrink-0 glow-cyan">
          <Activity className="w-5 h-5 text-medical-blue" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <p className="text-white font-bold text-lg leading-none">Jeevansh</p>
              <p className="text-medical-cyan text-xs font-medium">AI Healthcare</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {filtered.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group',
                  active
                    ? 'bg-medical-cyan/20 text-medical-cyan border border-medical-cyan/30'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-medical-cyan')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-medical-cyan" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* User + Actions */}
      <div className={cn('p-3 space-y-2', collapsed && 'flex flex-col items-center')}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-medical-cyan text-medical-blue text-xs font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-white/40 text-xs capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <Link to="/settings">
          <div className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer', collapsed && 'justify-center px-0')}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </Link>
        <button onClick={handleLogout} className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors', collapsed && 'justify-center px-0')}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-medical-cyan text-medical-blue hover:bg-medical-cyan-dark shadow-lg z-50 flex-shrink-0"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>
    </motion.aside>
  );
}
