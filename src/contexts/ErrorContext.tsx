'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorHandler, ErrorType, AppError } from '@/lib/errorHandler';

// Интерфейс контекста ошибок
interface ErrorContextType {
  // Состояние
  error: AppError | null;
  hasError: boolean;
  
  // Обработчики ошибок
  handleError: (error: any, type?: ErrorType) => AppError;
  handleAuthError: (error: any) => AppError;
  handleApiError: (error: any) => AppError;
  handleValidationError: (error: any) => AppError;
  
  // Управление ошибками
  setError: (error: AppError) => void;
  clearError: () => void;
  
  // Получение информации об ошибке
  getErrorMessage: () => string;
  getErrorType: () => ErrorType | null;
  getErrorCode: () => string;
  hasErrorOfType: (type: ErrorType) => boolean;
}

// Создаем контекст
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Хук для использования контекста ошибок
export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext должен использоваться внутри ErrorProvider');
  }
  return context;
};

// Провайдер контекста ошибок
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    errorState,
    handleError,
    handleAuthError,
    handleApiError,
    handleValidationError,
    setError,
    clearError,
    getErrorMessage,
    getErrorType,
    getErrorCode,
    hasError,
    hasErrorOfType
  } = useErrorHandler();
  
  // Значение контекста
  const contextValue: ErrorContextType = {
    error: errorState.error,
    hasError: errorState.hasError,
    
    handleError,
    handleAuthError,
    handleApiError,
    handleValidationError,
    
    setError,
    clearError,
    
    getErrorMessage,
    getErrorType,
    getErrorCode,
    hasErrorOfType
  };
  
  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;