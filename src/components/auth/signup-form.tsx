'use client';

import { useState } from 'react';
import { useAuthContext } from './auth-provider';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'candidate' as 'candidate' | 'employer' | 'agency',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName,
      role: formData.role,
    });
    
    if (result.success) {
      onSuccess?.();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Имя
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ваше имя"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Роль
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="candidate">Кандидат</option>
            <option value="employer">Работодатель</option>
            <option value="agency">Агентство</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Подтвердите пароль
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="••••••••"
          />
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">Пароли не совпадают</p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.password !== formData.confirmPassword}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        {onSwitchToSignIn && (
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-primary-600 hover:text-primary-500 text-sm"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 