'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useJobRecommendations } from '@/lib/jobRecommendations';
import { useUserPreferences } from '@/lib/userPreferences';
import { useAuthContext } from '@/lib/authContext';
import { Loader2, MapPin, Building, Clock, Star, StarOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface JobRecommendationsProps {
  limit?: number;
  showTitle?: boolean;
}

export function JobRecommendations({ limit = 5, showTitle = true }: JobRecommendationsProps) {
  const { authState } = useAuthContext();
  const { jobs, loading, error, refresh } = useJobRecommendations(limit);
  const { toggleFavorite, isFavorite } = useUserPreferences(authState.user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Обработчик обновления рекомендаций
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };
  
  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = async (jobId: string) => {
    await toggleFavorite('jobs', jobId);
  };
  
  // Если пользователь не авторизован, не показываем рекомендации
  if (!authState.isAuthenticated) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {/* Заголовок */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Рекомендуемые вакансии</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center"
          >
            {(loading || isRefreshing) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            <span className="ml-1">Обновить</span>
          </Button>
        </div>
      )}
      
      {/* Состояние загрузки */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      )}
      
      {/* Ошибка */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {/* Список вакансий */}
      {!loading && !error && jobs.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-center">
          <p>Нет рекомендуемых вакансий</p>
        </div>
      )}
      
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <Link href={`/jobs/${job.id}`} className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    {job.title}
                  </h3>
                </Link>
                <button
                  onClick={() => handleToggleFavorite(job.id)}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100"
                >
                  {isFavorite('jobs', job.id) ? (
                    <Star className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-y-1">
                <div className="flex items-center text-gray-600 text-sm mr-4">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm mr-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(job.postedAt), {
                      addSuffix: true,
                      locale: ru
                    })}
                  </span>
                </div>
              </div>
              
              {/* Зарплата */}
              {job.salary && (
                <div className="mt-2 text-sm font-medium">
                  {job.salary.min === job.salary.max ? (
                    <span>{job.salary.min.toLocaleString()} {job.salary.currency}</span>
                  ) : (
                    <span>
                      {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}
                    </span>
                  )}
                </div>
              )}
              
              {/* Теги */}
              <div className="mt-3 flex flex-wrap gap-2">
                {job.remote && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Удаленно
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.type === 'full-time' && 'Полная занятость'}
                  {job.type === 'part-time' && 'Частичная занятость'}
                  {job.type === 'contract' && 'Контракт'}
                  {job.type === 'internship' && 'Стажировка'}
                </span>
                {job.score !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Релевантность: {Math.round(job.score * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {/* Ссылка на все вакансии */}
          <div className="text-center mt-4">
            <Link
              href="/jobs"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              Смотреть все вакансии
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
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}