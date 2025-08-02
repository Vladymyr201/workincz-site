'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForms } from '@/components/auth/auth-forms';
import { useAuthContext } from '@/lib/authContext';

export default function ResetPasswordPage() {
  const { authState } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на дашборд
    if (authState.isAuthenticated && !authState.loading) {
      router.push('/dashboard');
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

  // Если пользователь не авторизован, показываем форму сброса пароля
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <AuthForms initialForm="reset-password" onSuccess={() => router.push('/auth/signin')} />
      </div>
    </div>
  );
}