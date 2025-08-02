"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Типы для контекста аутентификации
interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  signIn: (data: { email: string; password: string }) => Promise<any>;
  signUp: (data: { email: string; password: string; displayName: string; role?: string }) => Promise<any>;
  signOut: () => Promise<any>;
  clearError: () => void;
  isAuthenticated: () => boolean;
  getUserRole: () => string;
}

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста аутентификации
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext должен использоваться внутри AuthProvider');
  }
  
  return context;
} 