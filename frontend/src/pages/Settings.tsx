import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Settings() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "appearance" | "notifications" | "security">("profile");

  // Profile Form States (mock/display only)
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState((user as any)?.phone || "+91 9026348598");

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Notifications Toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [scanAlerts, setScanAlerts] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Save Deferred",
      description: "Profile updates are frontend-only and not stored on the server.",
      variant: "warning",
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill out all password fields.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password Save Deferred",
      description: "Password updates are frontend-only and not stored on the server.",
      variant: "warning",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure notification preferences, UI themes, and account security.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Selector */}
        <Card className="medical-card h-fit lg:col-span-1 p-2 border-primary/10">
          <div className="flex flex-col space-y-1">
            {[
              { id: "profile", label: "Profile Information", icon: User },
              { id: "appearance", label: "Appearance", icon: Moon },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Account Security", icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab Contents */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="medical-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Profile Settings</CardTitle>
                  <CardDescription>
                    Review your account profile details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Role</label>
                      <div className="h-10 px-3 flex items-center rounded-xl bg-muted border border-border text-sm capitalize">
                        {user?.role || "Patient"}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Profile modifications cannot be synchronized to the cloud because backend endpoints for editing user profiles are not configured.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="medical" className="rounded-xl">
                        Save Configuration
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="medical-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Appearance & Theme</CardTitle>
                  <CardDescription>
                    Toggle light/dark interfaces and customize styles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Toggle UI color palette.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={toggleTheme}
                      className="rounded-xl h-10 gap-2 px-4 border-border hover:bg-muted"
                    >
                      {isDark ? (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 text-primary" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Theme Colors</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Medical Blue", color: "bg-blue-500" },
                        { name: "Clinical Cyan", color: "bg-cyan-500" },
                        { name: "Healing Green", color: "bg-emerald-500" },
                      ].map((theme) => (
                        <div
                          key={theme.name}
                          className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/40 transition-colors"
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.color}`} />
                          <span className="text-xs font-medium">{theme.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="medical-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Notification Configs</CardTitle>
                  <CardDescription>
                    Manage alerts for completed scans and messages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Report Status Alerts",
                      desc: "Get emails when AI completes reports or radiologists review findings.",
                      val: emailAlerts,
                      set: setEmailAlerts,
                    },
                    {
                      title: "SMS Alerts",
                      desc: "Instant text alerts for critical severity scan assessments.",
                      val: smsAlerts,
                      set: setSmsAlerts,
                    },
                    {
                      title: "Product Feature Notices",
                      desc: "Keep updated with newly trained model checkpoint releases.",
                      val: scanAlerts,
                      set: setScanAlerts,
                    },
                  ].map((notif, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{notif.title}</p>
                        <p className="text-xs text-muted-foreground pr-4">{notif.desc}</p>
                      </div>
                      <button
                        onClick={() => notif.set(!notif.val)}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 flex-shrink-0 ${
                          notif.val ? "bg-primary" : "bg-muted border border-border"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            notif.val ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card className="medical-card border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Update Password</CardTitle>
                  <CardDescription>
                    Configure password credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-muted-foreground">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="rounded-xl h-10 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">New Password</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-xl h-10"
                      />
                    </div>

                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Password updates are frontend-only. Changes are not saved to the backend database.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="medical" className="rounded-xl">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
