'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/auth';

// Типы предпочтений пользователя
export interface UserPreferences {
  // Общие настройки
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  
  // Настройки поиска работы
  jobSearch?: {
    locations: string[];
    categories: string[];
    jobTypes: string[];
    salaryRange: {
      min: number;
      max: number;
    };
    remoteOnly: boolean;
    recentSearches: string[];
    savedFilters: Array<{
      id: string;
      name: string;
      filter: any;
    }>;
  };
  
  // Настройки для работодателей
  employer?: {
    defaultJobTemplate: any;
    candidateFilters: any;
    notificationSettings: {
      newApplications: boolean;
      applicationUpdates: boolean;
      premiumFeatures: boolean;
    };
  };
  
  // История просмотров
  viewHistory: {
    jobs: Array<{
      id: string;
      timestamp: number;
    }>;
    profiles: Array<{
      id: string;
      timestamp: number;
    }>;
    companies: Array<{
      id: string;
      timestamp: number;
    }>;
  };
  
  // Избранное
  favorites: {
    jobs: string[];
    profiles: string[];
    companies: string[];
  };
}

// Значения по умолчанию
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'ru',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  jobSearch: {
    locations: [],
    categories: [],
    jobTypes: [],
    salaryRange: {
      min: 0,
      max: 1000000,
    },
    remoteOnly: false,
    recentSearches: [],
    savedFilters: [],
  },
  viewHistory: {
    jobs: [],
    profiles: [],
    companies: [],
  },
  favorites: {
    jobs: [],
    profiles: [],
    companies: [],
  },
};

/**
 * Хук для работы с предпочтениями пользователя
 * Использует МПС memory для хранения и синхронизации предпочтений
 */
export function useUserPreferences(user: UserProfile | null) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка предпочтений из МПС memory при изменении пользователя
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setPreferences(defaultPreferences);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Получаем предпочтения из МПС memory
        const response = await fetch(`/api/preferences/${user.uid}`);
        
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            ...defaultPreferences,
            ...data
          });
        } else {
          // Если предпочтений нет, используем значения по умолчанию
          setPreferences(defaultPreferences);
        }
      } catch (err) {
        console.error('Ошибка загрузки предпочтений:', err);
        setError('Не удалось загрузить предпочтения пользователя');
        setPreferences(defaultPreferences);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, [user]);
  
  // Сохранение предпочтений в МПС memory
  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return { success: false, error: 'Пользователь не авторизован' };
    
    try {
      setLoading(true);
      setError(null);
      
      // Обновляем локальное состояние
      const updatedPreferences = {
        ...preferences,
        ...newPreferences
      };
      
      setPreferences(updatedPreferences);
      
      // Сохраняем в МПС memory через API
      const response = await fetch(`/api/preferences/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка сохранения предпочтений');
      }
      
      return { success: true };
    } catch (err) {
      console.error('Ошибка сохранения предпочтений:', err);
      setError('Не удалось сохранить предпочтения пользователя');
      return { success: false, error: 'Не удалось сохранить предпочтения' };
    } finally {
      setLoading(false);
    }
  };
  
  // Обновление отдельного поля предпочтений
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    return await savePreferences({ [key]: value } as Partial<UserPreferences>);
  };
  
  // Сброс предпочтений к значениям по умолчанию
  const resetPreferences = async () => {
    return await savePreferences(defaultPreferences);
  };
  
  // Добавление элемента в историю просмотров
  const addToViewHistory = async (
    type: 'jobs' | 'profiles' | 'companies',
    id: string
  ) => {
    const newHistory = [...preferences.viewHistory[type]];
    
    // Удаляем элемент, если он уже есть в истории
    const existingIndex = newHistory.findIndex(item => item.id === id);
    if (existingIndex !== -1) {
      newHistory.splice(existingIndex, 1);
    }
    
    // Добавляем элемент в начало истории
    newHistory.unshift({
      id,
      timestamp: Date.now()
    });
    
    // Ограничиваем историю до 50 элементов
    const limitedHistory = newHistory.slice(0, 50);
    
    return await savePreferences({
      viewHistory: {
        ...preferences.viewHistory,
        [type]: limitedHistory
      }
    });
  };
  
  // Добавление/удаление элемента из избранного
  const toggleFavorite = async (
    type: 'jobs' | 'profiles' | 'companies',
    id: string
  ) => {
    const favorites = [...preferences.favorites[type]];
    const index = favorites.indexOf(id);
    
    if (index === -1) {
      // Добавляем в избранное
      favorites.push(id);
    } else {
      // Удаляем из избранного
      favorites.splice(index, 1);
    }
    
    return await savePreferences({
      favorites: {
        ...preferences.favorites,
        [type]: favorites
      }
    });
  };
  
  // Проверка, находится ли элемент в избранном
  const isFavorite = (type: 'jobs' | 'profiles' | 'companies', id: string) => {
    return preferences.favorites[type].includes(id);
  };
  
  return {
    preferences,
    loading,
    error,
    savePreferences,
    updatePreference,
    resetPreferences,
    addToViewHistory,
    toggleFavorite,
    isFavorite
  };
}