'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X, AlertTriangle, Ban, Wifi, Server, HelpCircle } from 'lucide-react';
import { ErrorType } from '@/lib/errorHandler';

interface ErrorAlertProps {
  type?: ErrorType;
  title?: string;
  message: string;
  details?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
  className?: string;
}

export function ErrorAlert({
  type = ErrorType.UNKNOWN,
  title,
  message,
  details,
  onClose,
  autoClose = false,
  autoCloseTime = 5000,
  className = ''
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime]);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Определение цвета и иконки в зависимости от типа ошибки
  const getAlertStyles = () => {
    switch (type) {
      case ErrorType.AUTH:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
      case ErrorType.PERMISSION:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: <Ban className="h-5 w-5 text-red-500" />
        };
      case ErrorType.NETWORK:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: <Wifi className="h-5 w-5 text-blue-500" />
        };
      case ErrorType.SERVER:
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          icon: <Server className="h-5 w-5 text-purple-500" />
        };
      case ErrorType.VALIDATION:
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />
        };
      case ErrorType.API:
      case ErrorType.NOT_FOUND:
      case ErrorType.UNKNOWN:
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: <HelpCircle className="h-5 w-5 text-gray-500" />
        };
    }
  };
  
  const styles = getAlertStyles();
  const alertTitle = title || getDefaultTitle();
  
  function getDefaultTitle() {
    switch (type) {
      case ErrorType.AUTH:
        return 'Ошибка аутентификации';
      case ErrorType.PERMISSION:
        return 'Ошибка доступа';
      case ErrorType.NETWORK:
        return 'Ошибка сети';
      case ErrorType.SERVER:
        return 'Ошибка сервера';
      case ErrorType.VALIDATION:
        return 'Ошибка валидации';
      case ErrorType.API:
        return 'Ошибка API';
      case ErrorType.NOT_FOUND:
        return 'Ресурс не найден';
      case ErrorType.UNKNOWN:
      default:
        return 'Ошибка';
    }
  }
  
  return (
    <div className={`${styles.bgColor} ${styles.borderColor} border ${styles.textColor} rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-grow">
          <h3 className="text-sm font-medium">{alertTitle}</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {details && (
              <p className="mt-1 text-xs opacity-75">{details}</p>
            )}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${styles.textColor} hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${styles.bgColor} focus:ring-${styles.borderColor}`}
                onClick={handleClose}
              >
                <span className="sr-only">Закрыть</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}