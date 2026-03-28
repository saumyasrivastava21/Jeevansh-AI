export type UserRole = 'patient' | 'doctor' | 'admin';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  reportsCount: number;
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1', name: 'Arjun Mehta', email: 'arjun@example.com',
    phone: '+91-9876543210', address: '14 MG Road, Bangalore, KA 560001',
    role: 'patient', avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=0B3C5D&color=fff&size=128',
    isActive: true, createdAt: '2025-11-12', reportsCount: 7,
  },
  {
    id: 'u2', name: 'Priya Sharma', email: 'priya@example.com',
    phone: '+91-9123456780', address: '22 Andheri West, Mumbai, MH 400053',
    role: 'patient', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=2ECC71&color=fff&size=128',
    isActive: true, createdAt: '2025-12-01', reportsCount: 3,
  },
  {
    id: 'u3', name: 'Ravi Kumar', email: 'ravi@example.com',
    phone: '+91-9988776655', address: '5 Civil Lines, Delhi 110054',
    role: 'patient', avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=1A5C8F&color=fff&size=128',
    isActive: false, createdAt: '2025-10-20', reportsCount: 12,
  },
  {
    id: 'u4', name: 'Dr. Neha Joshi', email: 'neha.joshi@hospital.com',
    phone: '+91-9900112233', address: 'Apollo Hospital, Chennai 600006',
    role: 'doctor', avatar: 'https://ui-avatars.com/api/?name=Neha+Joshi&background=00D1FF&color=0B3C5D&size=128',
    isActive: true, createdAt: '2025-09-15', reportsCount: 0,
  },
  {
    id: 'u5', name: 'Admin User', email: 'admin@jeevansh.ai',
    phone: '+91-9000000001', address: 'Jeevansh AI HQ, Hyderabad',
    role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff&size=128',
    isActive: true, createdAt: '2025-08-01', reportsCount: 0,
  },
];

export const DEMO_USERS = {
  patient: { email: 'arjun@example.com', password: 'demo123', role: 'patient' as UserRole },
  doctor:  { email: 'neha.joshi@hospital.com', password: 'demo123', role: 'doctor' as UserRole },
  admin:   { email: 'admin@jeevansh.ai', password: 'demo123', role: 'admin' as UserRole },
};
