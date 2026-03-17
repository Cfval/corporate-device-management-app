import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = "auth";

function loadStoredUser(): { role: UserRole; clientId?: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ role: UserRole; clientId?: string } | null>(loadStoredUser);

  const login = (role: UserRole, clientId?: string) => {
    const value = { role, clientId };
    setUser(value);
    localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

