"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Создаем контекст для аутентификации
const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined);

// Хук для использования контекста аутентификации
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

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