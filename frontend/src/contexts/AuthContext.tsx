import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface AuthUser {
  id: string; // _id from mongo
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jeevansh_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiFetch('/users/profile');
        if (response.success && response.data) {
          const userData = response.data;
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0B3C5D&color=fff&size=128&bold=true`
          });
        } else {
          localStorage.removeItem('jeevansh_token');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        localStorage.removeItem('jeevansh_token');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      if (response.success && response.data) {
        localStorage.setItem('jeevansh_token', response.data.token);
        setUser({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          avatar: response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name)}&background=0B3C5D&color=fff&size=128&bold=true`
        });
      }
    } catch (error) {
      console.error('Login error', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/users/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.success && response.data) {
        localStorage.setItem('jeevansh_token', response.data.token);
        setUser({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          avatar: response.data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.data.name)}&background=0B3C5D&color=fff&size=128&bold=true`
        });
      }
    } catch (error) {
      console.error('Register error', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jeevansh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
