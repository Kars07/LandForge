import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { apiAuth, setToken, clearToken, getToken } from '@/lib/apiClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: object) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session from token
  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLoading(false); return; }
    apiAuth.me()
      .then(data => setUser({
        id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        accountType: data.accountType,
        businessName: data.businessName,
        buyerPreference: data.buyerPreference,
        createdAt: data.createdAt,
      }))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { token, user: data } = await apiAuth.login(email, password);
      setToken(token);
      setUser({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role, createdAt: new Date().toISOString() });
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (formData: object) => {
    const { token, user: data } = await apiAuth.register(formData);
    setToken(token);
    setUser({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role, createdAt: new Date().toISOString() });
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout: handleLogout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
