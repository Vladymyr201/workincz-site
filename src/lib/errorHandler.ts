'use client';

import { useState, useCallback } from 'react';

// Типы ошибок
export enum ErrorType {
  AUTH = 'auth',
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Интерфейс ошибки
export interface AppError {
  type: ErrorType;
  code?: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Интерфейс состояния ошибок
export interface ErrorState {
  error: AppError | null;
  hasError: boolean;
}

/**
 * Хук для централизованной обработки ошибок
 * @returns Объект с методами и состоянием ошибок
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false
  });

  /**
   * Обработка ошибок аутентификации Firebase
   * @param error Ошибка Firebase
   * @returns Объект AppError
   */
  const handleAuthError = useCallback((error: any): AppError => {
    const errorCode = error.code || '';
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'Пользователь с таким email не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/email-already-in-use': 'Пользователь с таким email уже существует',
      'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
      'auth/invalid-email': 'Неверный формат email',
      'auth/popup-closed-by-user': 'Окно входа было закрыто',
      'auth/popup-blocked': 'Всплывающее окно было заблокировано браузером',
      'auth/cancelled-popup-request': 'Запрос на вход был отменен',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету',
      'auth/too-many-requests': 'Слишком много попыток входа. Попробуйте позже',
      'auth/user-disabled': 'Аккаунт заблокирован',
      'auth/operation-not-allowed': 'Данный метод входа не разрешен',
      'auth/account-exists-with-different-credential': 'Аккаунт с этим email уже существует с другим методом входа',
      'auth/auth-domain-config-required': 'Требуется настройка домена аутентификации',
      'auth/credential-already-in-use': 'Эти учетные данные уже используются другим аккаунтом',
      'auth/provider-already-linked': 'Аккаунт уже связан с этим провайдером',
      'auth/redirect-cancelled-by-user': 'Перенаправление было отменено пользователем',
      'auth/unauthorized-domain': 'Домен не авторизован для операций OAuth',
      'auth/invalid-credential': 'Предоставленные учетные данные недействительны',
      'auth/requires-recent-login': 'Для выполнения этой операции требуется повторный вход',
      'auth/user-token-expired': 'Сессия истекла. Пожалуйста, войдите снова',
      'auth/web-storage-unsupported': 'Веб-хранилище не поддерживается или отключено',
      'auth/invalid-verification-code': 'Неверный код подтверждения',
      'auth/invalid-verification-id': 'Неверный идентификатор подтверждения',
      'auth/captcha-check-failed': 'Проверка reCAPTCHA не пройдена',
      'auth/missing-verification-code': 'Отсутствует код подтверждения',
      'auth/missing-verification-id': 'Отсутствует идентификатор подтверждения',
      'auth/phone-number-already-exists': 'Номер телефона уже используется другим аккаунтом',
      'auth/invalid-phone-number': 'Неверный формат номера телефона',
      'auth/missing-phone-number': 'Отсутствует номер телефона',
      'auth/quota-exceeded': 'Превышена квота SMS. Попробуйте позже',
      'auth/cancelled-multi-factor-auth': 'Многофакторная аутентификация была отменена',
      'auth/missing-multi-factor-session': 'Отсутствует сессия многофакторной аутентификации',
      'auth/missing-multi-factor-info': 'Отсутствует информация о многофакторной аутентификации',
      'auth/invalid-multi-factor-session': 'Неверная сессия многофакторной аутентификации',
      'auth/multi-factor-info-not-found': 'Информация о многофакторной аутентификации не найдена',
      'auth/multi-factor-auth-required': 'Требуется многофакторная аутентификация',
      'auth/second-factor-already-in-use': 'Второй фактор уже используется',
      'auth/maximum-second-factor-count-exceeded': 'Превышено максимальное количество вторых факторов',
      'auth/unsupported-first-factor': 'Неподдерживаемый первый фактор',
      'auth/unsupported-tenant-operation': 'Неподдерживаемая операция для арендатора',
      'auth/unverified-email': 'Email не подтвержден',
      'auth/tenant-id-mismatch': 'Несоответствие идентификатора арендатора',
      'auth/invalid-tenant-id': 'Неверный идентификатор арендатора',
      'auth/admin-restricted-operation': 'Операция ограничена администратором',
      'auth/invalid-continue-uri': 'Неверный URI продолжения',
      'auth/unauthorized-continue-uri': 'Неавторизованный URI продолжения',
      'auth/email-change-needs-verification': 'Изменение email требует подтверждения'
    };
    
    return {
      type: ErrorType.AUTH,
      code: errorCode,
      message: errorMap[errorCode] || error.message || 'Произошла неизвестная ошибка аутентификации',
      details: error,
      timestamp: Date.now()
    };
  }, []);

  /**
   * Обработка ошибок API
   * @param error Ошибка API
   * @returns Объект AppError
   */
  const handleApiError = useCallback((error: any): AppError => {
    let message = 'Произошла ошибка при обращении к API';
    let code = 'api_error';
    
    if (error.response) {
      // Ошибка от сервера с ответом
      const status = error.response.status;
      
      if (status === 401) {
        return {
          type: ErrorType.AUTH,
          code: 'unauthorized',
          message: 'Требуется авторизация',
          details: error.response.data,
          timestamp: Date.now()
        };
      } else if (status === 403) {
        return {
          type: ErrorType.PERMISSION,
          code: 'forbidden',
          message: 'Доступ запрещен',
          details: error.response.data,
          timestamp: Date.now()
        };
      } else if (status === 404) {
        return {
          type: ErrorType.NOT_FOUND,
          code: 'not_found',
          message: 'Ресурс не найден',
          details: error.response.data,
          timestamp: Date.now()
        };
      } else if (status >= 500) {
        return {
          type: ErrorType.SERVER,
          code: `server_${status}`,
          message: 'Ошибка сервера',
          details: error.response.data,
          timestamp: Date.now()
        };
      }
      
      message = error.response.data?.message || message;
      code = error.response.data?.code || `api_${status}`;
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      return {
        type: ErrorType.NETWORK,
        code: 'network_error',
        message: 'Не удалось получить ответ от сервера',
        details: error.request,
        timestamp: Date.now()
      };
    }
    
    return {
      type: ErrorType.API,
      code,
      message,
      details: error,
      timestamp: Date.now()
    };
  }, []);

  /**
   * Обработка ошибок валидации
   * @param error Ошибка валидации
   * @returns Объект AppError
   */
  const handleValidationError = useCallback((error: any): AppError => {
    return {
      type: ErrorType.VALIDATION,
      code: 'validation_error',
      message: error.message || 'Ошибка валидации данных',
      details: error.errors || error,
      timestamp: Date.now()
    };
  }, []);

  /**
   * Обработка неизвестных ошибок
   * @param error Неизвестная ошибка
   * @returns Объект AppError
   */
  const handleUnknownError = useCallback((error: any): AppError => {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'Произошла неизвестная ошибка',
      details: error,
      timestamp: Date.now()
    };
  }, []);

  /**
   * Установка ошибки
   * @param error Объект ошибки
   */
  const setError = useCallback((error: AppError) => {
    setErrorState({
      error,
      hasError: true
    });
    
    // Логирование ошибки
    console.error(`[${error.type}]${error.code ? ` [${error.code}]` : ''}: ${error.message}`, error.details);
    
    // Здесь можно добавить отправку ошибки в систему мониторинга
    // например, Sentry, LogRocket и т.д.
  }, []);

  /**
   * Обработка ошибки
   * @param error Ошибка
   * @param type Тип ошибки (опционально)
   */
  const handleError = useCallback((error: any, type?: ErrorType) => {
    let appError: AppError;
    
    if (type === ErrorType.AUTH || error.code?.startsWith('auth/')) {
      appError = handleAuthError(error);
    } else if (type === ErrorType.API) {
      appError = handleApiError(error);
    } else if (type === ErrorType.VALIDATION) {
      appError = handleValidationError(error);
    } else {
      appError = handleUnknownError(error);
    }
    
    setError(appError);
    return appError;
  }, [handleAuthError, handleApiError, handleValidationError, handleUnknownError, setError]);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false
    });
  }, []);

  /**
   * Получение сообщения об ошибке
   */
  const getErrorMessage = useCallback(() => {
    return errorState.error?.message || '';
  }, [errorState.error]);

  /**
   * Получение типа ошибки
   */
  const getErrorType = useCallback(() => {
    return errorState.error?.type || null;
  }, [errorState.error]);

  /**
   * Получение кода ошибки
   */
  const getErrorCode = useCallback(() => {
    return errorState.error?.code || '';
  }, [errorState.error]);

  /**
   * Проверка наличия ошибки
   */
  const hasError = useCallback(() => {
    return errorState.hasError;
  }, [errorState.hasError]);

  /**
   * Проверка наличия ошибки определенного типа
   * @param type Тип ошибки
   */
  const hasErrorOfType = useCallback((type: ErrorType) => {
    return errorState.hasError && errorState.error?.type === type;
  }, [errorState.hasError, errorState.error]);

  return {
    // Состояние
    errorState,
    
    // Обработчики ошибок
    handleError,
    handleAuthError,
    handleApiError,
    handleValidationError,
    handleUnknownError,
    
    // Управление ошибками
    setError,
    clearError,
    
    // Получение информации об ошибке
    getErrorMessage,
    getErrorType,
    getErrorCode,
    hasError,
    hasErrorOfType
  };
}