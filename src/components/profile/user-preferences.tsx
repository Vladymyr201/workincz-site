'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/authContext';
import { useUserPreferences } from '@/lib/userPreferences';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, RefreshCw } from 'lucide-react';

export function UserPreferences() {
  const { authState } = useAuthContext();
  const { 
    preferences, 
    loading, 
    error, 
    savePreferences, 
    resetPreferences 
  } = useUserPreferences(authState.user);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Локальное состояние для редактирования предпочтений
  const [editedPreferences, setEditedPreferences] = useState(preferences);
  
  // Обновляем локальное состояние при изменении предпочтений
  useState(() => {
    setEditedPreferences(preferences);
  }, [preferences]);
  
  // Обработчик изменения темы
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setEditedPreferences({
      ...editedPreferences,
      theme
    });
  };
  
  // Обработчик изменения языка
  const handleLanguageChange = (language: string) => {
    setEditedPreferences({
      ...editedPreferences,
      language
    });
  };
  
  // Обработчик изменения настроек уведомлений
  const handleNotificationChange = (type: 'email' | 'push' | 'sms', value: boolean) => {
    setEditedPreferences({
      ...editedPreferences,
      notifications: {
        ...editedPreferences.notifications,
        [type]: value
      }
    });
  };
  
  // Сохранение предпочтений
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const result = await savePreferences(editedPreferences);
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: 'Настройки успешно сохранены'
        });
      } else {
        setSaveMessage({
          type: 'error',
          text: result.error || 'Ошибка сохранения настроек'
        });
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Произошла ошибка при сохранении настроек'
      });
    } finally {
      setIsSaving(false);
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  // Сброс предпочтений
  const handleReset = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const result = await resetPreferences();
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          text: 'Настройки сброшены к значениям по умолчанию'
        });
      } else {
        setSaveMessage({
          type: 'error',
          text: result.error || 'Ошибка сброса настроек'
        });
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Произошла ошибка при сбросе настроек'
      });
    } finally {
      setIsSaving(false);
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p>Ошибка загрузки настроек: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold">Основные настройки</h2>
        
        {/* Тема */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Тема оформления</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                checked={editedPreferences.theme === 'light'}
                onChange={() => handleThemeChange('light')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span>Светлая</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                checked={editedPreferences.theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span>Темная</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                checked={editedPreferences.theme === 'system'}
                onChange={() => handleThemeChange('system')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span>Системная</span>
            </label>
          </div>
        </div>
        
        {/* Язык */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Язык</h3>
          <select
            value={editedPreferences.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="cs">Čeština</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        
        {/* Уведомления */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Уведомления</h3>
          
          <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="text-sm font-medium text-gray-700">
              Email уведомления
            </label>
            <Switch
              id="email-notifications"
              checked={editedPreferences.notifications.email}
              onCheckedChange={(checked) => handleNotificationChange('email', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="push-notifications" className="text-sm font-medium text-gray-700">
              Push уведомления
            </label>
            <Switch
              id="push-notifications"
              checked={editedPreferences.notifications.push}
              onCheckedChange={(checked) => handleNotificationChange('push', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="sms-notifications" className="text-sm font-medium text-gray-700">
              SMS уведомления
            </label>
            <Switch
              id="sms-notifications"
              checked={editedPreferences.notifications.sms}
              onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
            />
          </div>
        </div>
      </div>
      
      {/* Кнопки действий */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Сбросить
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Сохранить
        </Button>
      </div>
      
      {/* Сообщение о сохранении */}
      {saveMessage && (
        <div
          className={`p-4 rounded-md ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {saveMessage.text}
        </div>
      )}
    </div>
  );
}