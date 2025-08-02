'use client';

import { useEffect } from 'react';
import { useErrorContext } from '@/contexts/ErrorContext';
import { ErrorAlert } from '@/components/ui/error-alert';
import { ErrorType } from '@/lib/errorHandler';

interface AuthErrorHandlerProps {
  error?: string | null;
  onClearError?: () => void;
  className?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export function AuthErrorHandler({
  error,
  onClearError,
  className = '',
  autoClose = false,
  autoCloseTime = 5000
}: AuthErrorHandlerProps) {
  const { handleAuthError, clearError } = useErrorContext();
  
  // Обрабатываем ошибку при изменении props.error
  useEffect(() => {
    if (error) {
      handleAuthError({ message: error });
    } else {
      clearError();
    }
  }, [error, handleAuthError, clearError]);
  
  // Обработчик закрытия уведомления об ошибке
  const handleClose = () => {
    clearError();
    if (onClearError) {
      onClearError();
    }
  };
  
  // Если нет ошибки, не отображаем компонент
  if (!error) {
    return null;
  }
  
  return (
    <ErrorAlert
      type={ErrorType.AUTH}
      message={error}
      onClose={handleClose}
      className={className}
      autoClose={autoClose}
      autoCloseTime={autoCloseTime}
    />
  );
}