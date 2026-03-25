import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import * as storage from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, _password: string) => boolean;
  signup: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(storage.getUser());

  useEffect(() => {
    storage.setUser(user);
  }, [user]);

  const login = (email: string, _password: string): boolean => {
    const found = storage.findUser(email, _password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const signup = (newUser: User) => {
    storage.addUser(newUser);
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    storage.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout: handleLogout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
