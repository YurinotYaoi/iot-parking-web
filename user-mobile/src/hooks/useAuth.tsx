import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UpdateProfile, UserProfile } from '../types/parking';

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (profile?: Partial<UserProfile>) => void;
  logout: () => void;
  register: (profile?: Partial<UserProfile>) => void;
  updateProfile: (profile: UpdateProfile) => void;
};

const defaultUser: UserProfile = {
  firstName: 'Alex',
  middleName: '',
  lastName: 'Johnson',
  email: 'alex.johnson@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((profile?: Partial<UserProfile>) => {
    setUser({
      firstName: profile?.firstName ?? defaultUser.firstName,
      middleName: profile?.middleName ?? defaultUser.middleName,
      lastName: profile?.lastName ?? defaultUser.lastName,
      email: profile?.email ?? defaultUser.email,
      password: profile?.password ?? defaultUser.password,
      confirmPassword: profile?.confirmPassword ?? profile?.password ?? defaultUser.confirmPassword,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback((profile?: Partial<UserProfile>) => {
    setUser({
      firstName: profile?.firstName ?? defaultUser.firstName,
      middleName: profile?.middleName ?? defaultUser.middleName,
      lastName: profile?.lastName ?? defaultUser.lastName,
      email: profile?.email ?? defaultUser.email,
      password: profile?.password ?? defaultUser.password,
      confirmPassword: profile?.confirmPassword ?? profile?.password ?? defaultUser.confirmPassword,
    });
  }, []);

  const updateProfile = useCallback((profile: UpdateProfile) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        ...profile,
        confirmPassword: currentUser.confirmPassword,
      };
    });
  }, []);

  // You must create the 'value' object to satisfy the AuthContextValue type
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
  }), [user, login, logout, register, updateProfile]);

  // This return block was missing and is required for Context to work
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};