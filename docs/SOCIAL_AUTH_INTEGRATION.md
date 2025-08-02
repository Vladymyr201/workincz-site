# Интеграция социальной аутентификации в WorkInCZ

## Обзор

В данном документе описана интеграция дополнительных методов социальной аутентификации в проект WorkInCZ. Реализована поддержка входа через Google, Facebook, Apple и GitHub с использованием Firebase Authentication.

## Реализованные методы аутентификации

1. **Google** - Вход через аккаунт Google
2. **Facebook** - Вход через аккаунт Facebook
3. **Apple** - Вход через Apple ID
4. **GitHub** - Вход через аккаунт GitHub

## Архитектура

Интеграция социальной аутентификации включает следующие компоненты:

1. **AuthContext** (`src/lib/authContext.tsx`) - Контекст аутентификации с методами для входа через социальные сети
2. **useAuth** (`src/hooks/useAuth.ts`) - React-хук для работы с аутентификацией
3. **SocialAuthButtons** (`src/components/auth/social-auth-buttons.tsx`) - Компонент с кнопками для входа через социальные сети
4. **Формы аутентификации** - Обновленные формы входа и регистрации с поддержкой социальной аутентификации

## Методы аутентификации в AuthContext

В контексте аутентификации реализованы следующие методы:

### Google Authentication

```typescript
const loginWithGoogle = async () => {
  try {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    await signInWithPopup(auth, provider);
    
    // Профиль будет загружен автоматически через onAuthStateChanged
    return { success: true };
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  }
};
```

### Facebook Authentication

```typescript
const loginWithFacebook = async () => {
  try {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { FacebookAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({ display: 'popup' });
    provider.addScope('email');
    provider.addScope('public_profile');
    
    await signInWithPopup(auth, provider);
    
    // Профиль будет загружен автоматически через onAuthStateChanged
    return { success: true };
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  }
};
```

### Apple Authentication

```typescript
const loginWithApple = async () => {
  try {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { OAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    
    await signInWithPopup(auth, provider);
    
    // Профиль будет загружен автоматически через onAuthStateChanged
    return { success: true };
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  }
};
```

### GitHub Authentication

```typescript
const loginWithGithub = async () => {
  try {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { GithubAuthProvider, signInWithPopup } = await import('firebase/auth');
    const provider = new GithubAuthProvider();
    provider.addScope('read:user');
    provider.addScope('user:email');
    
    await signInWithPopup(auth, provider);
    
    // Профиль будет загружен автоматически через onAuthStateChanged
    return { success: true };
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
    return { success: false, error: errorMessage };
  }
};
```

## Компонент SocialAuthButtons

Компонент `SocialAuthButtons` предоставляет единый интерфейс для отображения кнопок входа через социальные сети:

```tsx
interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  className?: string;
  showApple?: boolean;
  showFacebook?: boolean;
  showGithub?: boolean;
  showGoogle?: boolean;
  vertical?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SocialAuthButtons({
  onSuccess,
  className = '',
  showApple = true,
  showFacebook = true,
  showGithub = true,
  showGoogle = true,
  vertical = false,
  size = 'default'
}: SocialAuthButtonsProps) {
  // ...
}
```

Компонент поддерживает следующие параметры:
- `onSuccess` - Функция обратного вызова при успешной аутентификации
- `className` - Дополнительные CSS классы
- `showApple`, `showFacebook`, `showGithub`, `showGoogle` - Флаги для отображения конкретных кнопок
- `vertical` - Флаг для вертикального расположения кнопок
- `size` - Размер кнопок

## Интеграция с формами аутентификации

Компонент `SocialAuthButtons` интегрирован в формы входа и регистрации:

```tsx
// Форма входа
export function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  // ...
  
  // Обработчик успешного входа через социальные сети
  const handleSocialAuthSuccess = () => {
    onSuccess?.() || router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ... */}
      </form>

      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Или</span>
        </div>
      </div>

      {/* Кнопки входа через социальные сети */}
      <SocialAuthButtons 
        onSuccess={handleSocialAuthSuccess} 
        vertical={true}
      />

      {/* ... */}
    </div>
  );
}
```

## Обработка ошибок

Для обработки ошибок аутентификации через социальные сети добавлены новые коды ошибок в функцию `handleAuthError`:

```typescript
const handleAuthError = (error: any): string => {
  const errorCode = error.code || '';
  const errorMap: Record<string, string> = {
    // ...
    'auth/account-exists-with-different-credential': 'Аккаунт с этим email уже существует с другим методом входа',
    'auth/auth-domain-config-required': 'Требуется настройка домена аутентификации',
    'auth/credential-already-in-use': 'Эти учетные данные уже используются другим аккаунтом',
    'auth/provider-already-linked': 'Аккаунт уже связан с этим провайдером',
    'auth/redirect-cancelled-by-user': 'Перенаправление было отменено пользователем',
    'auth/unauthorized-domain': 'Домен не авторизован для операций OAuth',
    'auth/invalid-credential': 'Предоставленные учетные данные недействительны'
  };
  
  return errorMap[errorCode] || error.message || 'Произошла неизвестная ошибка';
};
```

## Дополнительные методы в useAuth

В хук `useAuth` добавлены новые методы для работы с социальной аутентификацией:

```typescript
/**
 * Вход через Facebook
 */
signInWithFacebook: async () => {
  return await loginWithFacebook();
},

/**
 * Вход через Apple
 */
signInWithApple: async () => {
  return await loginWithApple();
},

/**
 * Вход через GitHub
 */
signInWithGithub: async () => {
  return await loginWithGithub();
},

/**
 * Проверка, авторизован ли пользователь через социальную сеть
 */
isSocialAuth: () => {
  if (!authState.firebaseUser) return false;
  
  const providerData = authState.firebaseUser.providerData;
  if (!providerData || providerData.length === 0) return false;
  
  // Проверяем, есть ли провайдеры, отличные от email/password
  return providerData.some(provider => 
    provider.providerId !== 'password' && 
    provider.providerId !== 'firebase'
  );
},

/**
 * Получение списка провайдеров аутентификации пользователя
 */
getAuthProviders: () => {
  if (!authState.firebaseUser) return [];
  
  const providerData = authState.firebaseUser.providerData;
  if (!providerData || providerData.length === 0) return [];
  
  return providerData.map(provider => provider.providerId);
}
```

## Настройка Firebase

Для поддержки социальной аутентификации необходимо настроить соответствующие провайдеры в Firebase Console:

1. **Google**:
   - Включить провайдер в Firebase Console > Authentication > Sign-in method
   - Настроить OAuth redirect URI

2. **Facebook**:
   - Создать приложение Facebook на [developers.facebook.com](https://developers.facebook.com)
   - Настроить OAuth redirect URI
   - Добавить App ID и App Secret в Firebase Console

3. **Apple**:
   - Зарегистрировать приложение в [Apple Developer Portal](https://developer.apple.com)
   - Настроить Sign in with Apple
   - Добавить Services ID, Team ID и Key ID в Firebase Console

4. **GitHub**:
   - Создать OAuth App на [github.com/settings/developers](https://github.com/settings/developers)
   - Настроить OAuth redirect URI
   - Добавить Client ID и Client Secret в Firebase Console

## Использование

### Добавление кнопок социальной аутентификации

```tsx
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';

export function MyComponent() {
  const handleAuthSuccess = () => {
    console.log('Успешная аутентификация');
  };
  
  return (
    <div>
      <h2>Войти через социальные сети</h2>
      <SocialAuthButtons 
        onSuccess={handleAuthSuccess} 
        showApple={true}
        showFacebook={true}
        showGithub={true}
        showGoogle={true}
        vertical={false}
        size="default"
      />
    </div>
  );
}
```

### Проверка метода аутентификации

```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { isSocialAuth, getAuthProviders } = useAuth();
  
  if (isSocialAuth()) {
    const providers = getAuthProviders();
    console.log('Пользователь авторизован через:', providers);
  }
  
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

## Дальнейшие улучшения

1. **Связывание аккаунтов** - Добавление возможности связывать разные методы аутентификации с одним аккаунтом
2. **Редирект вместо всплывающего окна** - Реализация аутентификации через редирект для лучшей совместимости с мобильными устройствами
3. **Дополнительные провайдеры** - Добавление поддержки других провайдеров (Twitter, LinkedIn, и т.д.)
4. **Кастомизация UI** - Расширение возможностей настройки внешнего вида кнопок
5. **Обработка особых случаев** - Улучшение обработки случаев, когда email уже используется другим методом аутентификации