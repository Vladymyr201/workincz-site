# Система обработки ошибок в WorkInCZ

## Обзор

Данный документ описывает централизованную систему обработки ошибок, реализованную в проекте WorkInCZ. Система обеспечивает единый подход к обработке, отображению и логированию ошибок различных типов.

## Архитектура

Система обработки ошибок состоит из следующих компонентов:

1. **ErrorHandler** (`src/lib/errorHandler.ts`) - Основной модуль для обработки ошибок
2. **ErrorContext** (`src/contexts/ErrorContext.tsx`) - React Context для глобального доступа к обработчику ошибок
3. **ErrorAlert** (`src/components/ui/error-alert.tsx`) - Компонент для отображения ошибок
4. **AuthErrorHandler** (`src/components/auth/auth-error-handler.tsx`) - Специализированный компонент для обработки ошибок аутентификации

## Типы ошибок

Система поддерживает следующие типы ошибок:

```typescript
export enum ErrorType {
  AUTH = 'auth',           // Ошибки аутентификации
  API = 'api',             // Ошибки API
  VALIDATION = 'validation', // Ошибки валидации
  NETWORK = 'network',     // Ошибки сети
  PERMISSION = 'permission', // Ошибки доступа
  NOT_FOUND = 'not_found', // Ресурс не найден
  SERVER = 'server',       // Ошибки сервера
  UNKNOWN = 'unknown'      // Неизвестные ошибки
}
```

## Структура ошибки

Ошибки представлены в виде объектов `AppError`:

```typescript
export interface AppError {
  type: ErrorType;         // Тип ошибки
  code?: string;           // Код ошибки (опционально)
  message: string;         // Сообщение об ошибке
  details?: any;           // Дополнительные детали (опционально)
  timestamp: number;       // Временная метка
}
```

## Хук useErrorHandler

Хук `useErrorHandler` предоставляет методы для обработки различных типов ошибок:

```typescript
const {
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
} = useErrorHandler();
```

### Обработка ошибок аутентификации

```typescript
const handleAuthError = useCallback((error: any): AppError => {
  const errorCode = error.code || '';
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'Пользователь с таким email не найден',
    'auth/wrong-password': 'Неверный пароль',
    // ... другие коды ошибок
  };
  
  return {
    type: ErrorType.AUTH,
    code: errorCode,
    message: errorMap[errorCode] || error.message || 'Произошла неизвестная ошибка аутентификации',
    details: error,
    timestamp: Date.now()
  };
}, []);
```

### Обработка ошибок API

```typescript
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
    }
    // ... другие коды статусов
  }
  // ... обработка других случаев
  
  return {
    type: ErrorType.API,
    code,
    message,
    details: error,
    timestamp: Date.now()
  };
}, []);
```

## Контекст ошибок

`ErrorContext` предоставляет глобальный доступ к функциям обработки ошибок:

```tsx
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
```

## Компонент ErrorAlert

Компонент `ErrorAlert` отображает ошибки с соответствующим стилем и иконкой в зависимости от типа ошибки:

```tsx
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
  // ... логика компонента
  
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
      // ... другие типы ошибок
    }
  };
  
  // ... рендеринг компонента
}
```

## Специализированные обработчики ошибок

### AuthErrorHandler

Компонент `AuthErrorHandler` специализирован для обработки ошибок аутентификации:

```tsx
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
  
  // ... логика компонента
  
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
```

## Интеграция с формами

Пример интеграции системы обработки ошибок с формой входа:

```tsx
export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { login, authState, clearError } = useAuthContext();
  const { handleError } = useErrorContext();
  
  // ... остальной код
  
  // Обработчик отправки формы
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    clearError();
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        reset();
        onSuccess?.() || router.push("/dashboard");
      } else if (result.error) {
        handleError({ message: result.error }, ErrorType.AUTH);
      }
    } catch (error) {
      handleError(error, ErrorType.AUTH);
      console.error("Ошибка входа:", error);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ... поля формы */}
        
        {/* Ошибка аутентификации */}
        <AuthErrorHandler error={authState.error} onClearError={clearError} />
        
        {/* ... остальные элементы формы */}
      </form>
    </div>
  );
}
```

## Логирование ошибок

Система автоматически логирует ошибки в консоль:

```typescript
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
```

## Использование

### Подключение провайдера

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <ErrorProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
```

### Использование контекста ошибок

```tsx
import { useErrorContext } from '@/contexts/ErrorContext';
import { ErrorType } from '@/lib/errorHandler';

function MyComponent() {
  const { handleError, clearError } = useErrorContext();
  
  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('API error');
      }
      // ... обработка ответа
    } catch (error) {
      handleError(error, ErrorType.API);
    }
  };
  
  return (
    <div>
      <button onClick={handleApiCall}>Загрузить данные</button>
      <button onClick={clearError}>Очистить ошибку</button>
    </div>
  );
}
```

### Отображение ошибок

```tsx
import { ErrorAlert } from '@/components/ui/error-alert';
import { ErrorType } from '@/lib/errorHandler';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = () => {
    setError('Произошла ошибка при загрузке данных');
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return (
    <div>
      {error && (
        <ErrorAlert
          type={ErrorType.API}
          message={error}
          onClose={clearError}
          autoClose={true}
          autoCloseTime={5000}
        />
      )}
      <button onClick={handleError}>Вызвать ошибку</button>
    </div>
  );
}
```

## Дальнейшие улучшения

1. **Интеграция с системами мониторинга** - Добавление интеграции с Sentry, LogRocket или другими системами мониторинга ошибок
2. **Глобальный обработчик ошибок** - Реализация глобального обработчика для перехвата необработанных ошибок
3. **Локализация сообщений об ошибках** - Добавление поддержки многоязычности для сообщений об ошибках
4. **Расширенная аналитика ошибок** - Сбор дополнительной информации о контексте ошибок для улучшения диагностики
5. **Автоматическое восстановление** - Реализация механизмов автоматического восстановления после определенных типов ошибок