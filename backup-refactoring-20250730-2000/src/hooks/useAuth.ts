import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '@/lib/auth';
import { UserProfile, AuthState, RegistrationData, LoginData, UserRole, RoleSwitchData } from '@/types/auth';

/**
 * Хук для управления состоянием аутентификации
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  // Загрузка профиля пользователя из Firestore
  const loadUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const profile = await authService.getUserProfile(firebaseUser.uid);
      if (profile) {
        // Устанавливаем currentRole равной основной роли, если не задана
        const userWithCurrentRole = {
          ...profile,
          currentRole: profile.currentRole || profile.role
        };
        
        setAuthState(prev => ({
          ...prev,
          user: userWithCurrentRole,
          firebaseUser,
          isAuthenticated: true,
          loading: false
        }));
      } else {
        // Пользователь есть в Firebase Auth, но нет профиля в Firestore
        setAuthState(prev => ({
          ...prev,
          firebaseUser,
          isAuthenticated: true,
          loading: false
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Ошибка загрузки профиля пользователя',
        loading: false
      }));
    }
  }, []);

  // Обработчик изменения состояния аутентификации
  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      await loadUserProfile(firebaseUser);
    } else {
      setAuthState({
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
    }
  }, [loadUserProfile]);

  // Инициализация слушателя состояния аутентификации
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(handleAuthStateChange);
    return unsubscribe;
  }, [handleAuthStateChange]);

  // Регистрация с email и паролем (с автоматическим входом)
  const registerWithEmail = useCallback(async (data: RegistrationData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.registerWithEmail(data);
      
      if (result.success && result.user) {
        // Автоматически входим после регистрации
        const userWithCurrentRole = {
          ...result.user,
          currentRole: result.user.currentRole || result.user.role
        };
        
        setAuthState(prev => ({
          ...prev,
          user: userWithCurrentRole,
          firebaseUser: authService.getCurrentUser(),
          isAuthenticated: true,
          loading: false
        }));
        
        // Перенаправляем в ЛК после успешной регистрации
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка регистрации',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Вход с email и паролем
  const loginWithEmail = useCallback(async (data: LoginData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.loginWithEmail(data);
      
      if (result.success && result.user) {
        const userWithCurrentRole = {
          ...result.user,
          currentRole: result.user.currentRole || result.user.role
        };
        
        setAuthState(prev => ({
          ...prev,
          user: userWithCurrentRole,
          firebaseUser: authService.getCurrentUser(),
          isAuthenticated: true,
          loading: false
        }));
        
        // Перенаправляем в ЛК после успешного входа
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка входа',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Вход через Google
  const loginWithGoogle = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.loginWithGoogle();
      
      if (result.success && result.user) {
        const userWithCurrentRole = {
          ...result.user,
          currentRole: result.user.currentRole || result.user.role
        };
        
        setAuthState(prev => ({
          ...prev,
          user: userWithCurrentRole,
          firebaseUser: authService.getCurrentUser(),
          isAuthenticated: true,
          loading: false
        }));
        
        // Перенаправляем в ЛК после успешного входа
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка входа через Google',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Регистрация через Google (с автоматическим входом)
  const registerWithGoogle = useCallback(async (role: UserRole) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.registerWithGoogle(role);
      
      if (result.success && result.user) {
        const userWithCurrentRole = {
          ...result.user,
          currentRole: result.user.currentRole || result.user.role
        };
        
        setAuthState(prev => ({
          ...prev,
          user: userWithCurrentRole,
          firebaseUser: authService.getCurrentUser(),
          isAuthenticated: true,
          loading: false
        }));
        
        // Перенаправляем в ЛК после успешной регистрации
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка регистрации через Google',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Переключение ролей
  const switchRole = useCallback(async (newRole: UserRole) => {
    if (!authState.user) return { success: false, error: 'Пользователь не авторизован' };
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.updateUserProfile(authState.user.uid, {
        currentRole: newRole
      });
      
      // Обновляем локальное состояние
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, currentRole: newRole } : null,
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, [authState.user]);

  // Выход
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.logout();
      
      if (result.success) {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
          isAuthenticated: false
        });
        
        // Перенаправляем на главную после выхода
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка выхода',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Сброс пароля
  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          error: result.error || 'Ошибка сброса пароля',
          loading: false
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Обновление профиля
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user) return { success: false, error: 'Пользователь не авторизован' };
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.updateUserProfile(authState.user.uid, updates);
      
      // Обновляем локальное состояние
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setAuthState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return { success: false, error: errorMessage };
    }
  }, [authState.user]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Состояние
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    
    // Методы
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    registerWithGoogle,
    switchRole,
    logout,
    resetPassword,
    updateProfile,
    clearError
  };
} 