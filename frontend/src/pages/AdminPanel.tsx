import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Users, FileText, Activity, TrendingUp, Search } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminStats } from '@/data/mock/reports';
import { mockUsers } from '@/data/mock/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const statsCards = [
  { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12.4%' },
  { label: 'Reports Today', value: adminStats.reportsToday.toString(), icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+8.1%' },
  { label: 'Active Doctors', value: adminStats.activeDoctors.toString(), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+3' },
  { label: 'AI Accuracy', value: `${adminStats.aiAccuracy}%`, icon: BarChart2, color: 'text-cyan-500', bg: 'bg-cyan-500/10', trend: '+0.3%' },
];

const roleBadge = { patient: 'info', doctor: 'success', admin: 'warning' } as const;

export default function AdminPanel() {
  const [search, setSearch] = useState('');
  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Platform analytics and user management.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((s, i) => (
          <motion.div key={s.label} variants={fadeUp} custom={i} initial="hidden" animate="visible">
            <Card className="medical-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{s.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-base">Monthly Reports & Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={adminStats.monthlyReports} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="reports" fill="#0B3C5D" radius={[4, 4, 0, 0]} name="Reports" />
                  <Bar dataKey="users" fill="#00D1FF" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
          <Card className="medical-card h-full">
            <CardHeader>
              <CardTitle className="text-base">Disease Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={adminStats.diseaseDistribution} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                    {adminStats.diseaseDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Line chart */}
      <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-base">Platform Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={adminStats.monthlyReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <Line type="monotone" dataKey="reports" stroke="#0B3C5D" strokeWidth={2.5} dot={{ fill: '#00D1FF', strokeWidth: 2 }} name="Reports" />
                <Line type="monotone" dataKey="users" stroke="#2ECC71" strokeWidth={2.5} dot={{ fill: '#2ECC71', strokeWidth: 2 }} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* User table */}
      <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">User Management</CardTitle>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-sm rounded-lg" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg" />
                        <div>
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadge[user.role]} className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{user.reportsCount}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'success' : 'pending'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
