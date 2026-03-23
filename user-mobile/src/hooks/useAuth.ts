import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UserProfile } from '../types/parking';

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (profile?: Partial<UserProfile>) => void;
  logout: () => void;
  register: (profile?: Partial<UserProfile>) => void;
  updateProfile: (profile: UserProfile) => void;
};

const defaultUser: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 555 010 2030',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((profile?: Partial<UserProfile>) => {
    setUser({
      name: profile?.name ?? defaultUser.name,
      email: profile?.email ?? defaultUser.email,
      phone: profile?.phone ?? defaultUser.phone,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback((profile?: Partial<UserProfile>) => {
    setUser({
      name: profile?.name ?? defaultUser.name,
      email: profile?.email ?? defaultUser.email,
      phone: profile?.phone ?? defaultUser.phone,
    });
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
      register,
      updateProfile,
    }),
    [login, logout, register, updateProfile, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
