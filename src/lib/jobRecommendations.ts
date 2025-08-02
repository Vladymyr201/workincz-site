'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/lib/authContext';
import { useUserPreferences } from '@/lib/userPreferences';

// Интерфейс для вакансии
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  categories: string[];
  skills: string[];
  postedAt: string;
  deadline?: string;
  views: number;
  applications: number;
  featured: boolean;
  score?: number;
}

// Интерфейс для результата рекомендаций
interface RecommendationResult {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Хук для получения рекомендаций вакансий с использованием МПС sequentialthinking
 */
export function useJobRecommendations(limit: number = 10): RecommendationResult {
  const { authState } = useAuthContext();
  const { preferences } = useUserPreferences(authState.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Функция для получения рекомендаций
  const fetchRecommendations = async () => {
    if (!authState.user) {
      setJobs([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Получаем рекомендации через API, которое использует МПС sequentialthinking
      const response = await fetch(`/api/recommendations?limit=${limit}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authState.user.uid,
          preferences: preferences,
          viewHistory: preferences.viewHistory.jobs,
          favoriteJobs: preferences.favorites.jobs
        }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка получения рекомендаций');
      }
      
      const data = await response.json();
      setJobs(data.jobs);
    } catch (err) {
      console.error('Ошибка получения рекомендаций:', err);
      setError('Не удалось загрузить рекомендации');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем рекомендации при монтировании компонента
  // и при изменении пользователя или предпочтений
  useEffect(() => {
    fetchRecommendations();
  }, [authState.user, preferences.jobSearch, limit]);
  
  // Обновление рекомендаций
  const refresh = async () => {
    await fetchRecommendations();
  };
  
  return {
    jobs,
    loading,
    error,
    refresh
  };
}