'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/authContext';
import { JobRecommendations } from '@/components/jobs/job-recommendations';

export default function DashboardPage() {
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
      <h1 className="text-2xl font-bold mb-6">Личный кабинет</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - информация о пользователе */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                {authState.user?.photoURL ? (
                  <img
                    src={authState.user.photoURL}
                    alt={authState.user.displayName || 'Пользователь'}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {authState.user?.displayName?.charAt(0) || authState.user?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {authState.user?.displayName || 'Пользователь'}
                </h2>
                <p className="text-gray-600">{authState.user?.email}</p>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Роль</h3>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {authState.user?.role === 'candidate' && 'Соискатель'}
                  {authState.user?.role === 'employer' && 'Работодатель'}
                  {authState.user?.role === 'agency' && 'Агентство'}
                  {authState.user?.role === 'admin' && 'Администратор'}
                </span>
              </div>
            </div>
            
            {/* Статус VIP/Premium */}
            {(authState.user?.vipStatus?.isActive || authState.user?.premiumStatus?.isActive) && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Статус</h3>
                <div className="flex flex-wrap gap-2">
                  {authState.user?.vipStatus?.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      VIP до {new Date(authState.user.vipStatus.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  {authState.user?.premiumStatus?.isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Premium до {new Date(authState.user.premiumStatus.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <a
                href="/profile"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                Редактировать профиль
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Быстрые ссылки */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/profile/preferences"
                  className="text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Настройки
                </a>
              </li>
              <li>
                <a
                  href="/jobs/favorites"
                  className="text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Избранные вакансии
                </a>
              </li>
              <li>
                <a
                  href="/applications"
                  className="text-gray-700 hover:text-primary-600 flex items-center"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Мои отклики
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Правая колонка - рекомендации вакансий */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <JobRecommendations limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}