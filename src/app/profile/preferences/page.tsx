'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/authContext';
import { UserPreferences } from '@/components/profile/user-preferences';

export default function PreferencesPage() {
  const { authState } = useAuthContext();
  const router = useRouter();
  
  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!authState.isAuthenticated && !authState.loading) {
      router.push('/auth/signin');
    }
  }, [authState.isAuthenticated, authState.loading, router]);
  
  // Если идет загрузка состояния аутентификации, показываем индикатор загрузки
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Если пользователь не авторизован, ничего не показываем
  // (редирект будет выполнен в useEffect)
  if (!authState.isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <UserPreferences />
      </div>
    </div>
  );
}