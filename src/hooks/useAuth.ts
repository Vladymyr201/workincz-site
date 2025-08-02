'use client';

import { useAuthContext } from '@/lib/authContext';
import { UserProfile, UserRole } from '@/types/auth';

/**
 * Хук для работы с аутентификацией
 * Предоставляет простой интерфейс для работы с аутентификацией в компонентах
 * 
 * @returns Объект с методами и состоянием аутентификации
 */
export function useAuth() {
  const { 
    authState, 
    login, 
    loginWithGoogle, 
    loginWithFacebook,
    loginWithApple,
    loginWithGithub,
    register, 
    logout, 
    resetPassword, 
    updateProfile, 
    switchRole, 
    clearError 
  } = useAuthContext();

  return {
    // Состояние аутентификации
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    
    // Методы аутентификации
    /**
     * Вход пользователя с email и паролем
     * @param email Email пользователя
     * @param password Пароль пользователя
     */
    signIn: async (email: string, password: string) => {
      return await login(email, password);
    },
    
    /**
     * Вход через Google
     */
    signInWithGoogle: async () => {
      return await loginWithGoogle();
    },
    
    /**
     * Вход через Facebook
     */
    signInWithFacebook: async () => {
      return await loginWithFacebook();
    },
    
    /**
     * Вход через Apple
     */
    signInWithApple: async () => {
      return await loginWithApple();
    },
    
    /**
     * Вход через GitHub
     */
    signInWithGithub: async () => {
      return await loginWithGithub();
    },
    
    /**
     * Регистрация нового пользователя
     * @param data Данные для регистрации
     */
    signUp: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      phone?: string;
      company?: string;
      position?: string;
    }) => {
      return await register(data);
    },
    
    /**
     * Выход из системы
     */
    signOut: async () => {
      return await logout();
    },
    
    /**
     * Сброс пароля
     * @param email Email пользователя
     */
    forgotPassword: async (email: string) => {
      return await resetPassword(email);
    },
    
    /**
     * Обновление профиля пользователя
     * @param updates Обновления для профиля
     */
    updateUserProfile: async (updates: Partial<UserProfile>) => {
      return await updateProfile(updates);
    },
    
    /**
     * Переключение роли пользователя
     * @param role Новая роль
     */
    switchUserRole: async (role: UserRole) => {
      return await switchRole(role);
    },
    
    /**
     * Очистка ошибки аутентификации
     */
    clearAuthError: () => {
      clearError();
    },
    
    /**
     * Получение текущей роли пользователя
     */
    getUserRole: () => {
      return authState.user?.currentRole || 'candidate';
    },
    
    /**
     * Проверка, имеет ли пользователь указанную роль
     * @param role Роль для проверки
     */
    hasRole: (role: UserRole) => {
      if (!authState.user) return false;
      
      // Проверяем основную роль
      if (authState.user.currentRole === role) return true;
      
      // Проверяем VIP статус
      if (role === 'vip' && authState.user.vipStatus?.isActive) return true;
      
      // Проверяем Premium статус
      if (role === 'premium' && authState.user.premiumStatus?.isActive) return true;
      
      return false;
    },
    
    /**
     * Проверка, имеет ли пользователь VIP статус
     */
    isVip: () => {
      return !!authState.user?.vipStatus?.isActive;
    },
    
    /**
     * Проверка, имеет ли пользователь Premium статус
     */
    isPremium: () => {
      return !!authState.user?.premiumStatus?.isActive;
    },
    
    /**
     * Проверка, авторизован ли пользователь через социальную сеть
     */
    isSocialAuth: () => {
      if (!authState.firebaseUser) return false;
      
      const providerData = authState.firebaseUser.providerData;
      if (!providerData || providerData.length === 0) return false;
      
      // Проверяем, есть ли провайдеры, отличные от email/password
      return providerData.some(provider => 
        provider.providerId !== 'password' && 
        provider.providerId !== 'firebase'
      );
    },
    
    /**
     * Получение списка провайдеров аутентификации пользователя
     */
    getAuthProviders: () => {
      if (!authState.firebaseUser) return [];
      
      const providerData = authState.firebaseUser.providerData;
      if (!providerData || providerData.length === 0) return [];
      
      return providerData.map(provider => provider.providerId);
    }
  };
}