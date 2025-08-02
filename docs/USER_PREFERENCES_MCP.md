# Система предпочтений пользователя с использованием МПС memory

## Обзор

Система предпочтений пользователя предоставляет механизм для хранения и управления пользовательскими настройками и предпочтениями с использованием МПС (Model Context Protocol) memory. Это позволяет сохранять и синхронизировать пользовательские настройки между сессиями и устройствами.

## Архитектура

Система предпочтений состоит из следующих компонентов:

1. **Хук `useUserPreferences`** - React-хук для работы с предпочтениями пользователя
2. **API-маршруты** - Серверные функции для взаимодействия с МПС memory
3. **Компонент `UserPreferences`** - UI-компонент для отображения и редактирования настроек
4. **МПС memory** - Внешний сервис для хранения данных в виде графа знаний

## Структура данных

Предпочтения пользователя хранятся в виде структурированного объекта `UserPreferences`:

```typescript
interface UserPreferences {
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
```

## Интеграция с МПС memory

Предпочтения хранятся в МПС memory в виде сущностей и наблюдений:

1. **Сущность пользователя** - Создается для каждого пользователя с именем `User_{userId}`
2. **Наблюдения** - Предпочтения хранятся как наблюдение с префиксом `preferences:` и JSON-строкой

Пример структуры в МПС memory:

```json
{
  "name": "User_123456",
  "entityType": "user",
  "observations": [
    "userId:123456",
    "preferences:{\"theme\":\"dark\",\"language\":\"ru\",...}"
  ]
}
```

## API-маршруты

### GET `/api/preferences/[userId]`

Получает предпочтения пользователя из МПС memory.

**Параметры URL:**
- `userId` - ID пользователя

**Ответ:**
- `200 OK` - Возвращает объект предпочтений
- `401 Unauthorized` - Если пользователь не авторизован
- `403 Forbidden` - Если пользователь пытается получить чужие предпочтения
- `500 Internal Server Error` - При ошибке сервера

### PUT `/api/preferences/[userId]`

Обновляет предпочтения пользователя в МПС memory.

**Параметры URL:**
- `userId` - ID пользователя

**Тело запроса:**
- Объект `UserPreferences`

**Ответ:**
- `200 OK` - Возвращает `{ success: true }`
- `400 Bad Request` - При некорректных данных
- `401 Unauthorized` - Если пользователь не авторизован
- `403 Forbidden` - Если пользователь пытается обновить чужие предпочтения
- `500 Internal Server Error` - При ошибке сервера

## Хук useUserPreferences

React-хук `useUserPreferences` предоставляет интерфейс для работы с предпочтениями пользователя:

```typescript
const {
  preferences,     // Текущие предпочтения
  loading,         // Состояние загрузки
  error,           // Ошибка (если есть)
  savePreferences, // Функция для сохранения предпочтений
  updatePreference, // Функция для обновления отдельного поля
  resetPreferences, // Функция для сброса предпочтений
  addToViewHistory, // Функция для добавления элемента в историю просмотров
  toggleFavorite,   // Функция для добавления/удаления из избранного
  isFavorite        // Функция для проверки наличия в избранном
} = useUserPreferences(user);
```

## Компонент UserPreferences

Компонент `UserPreferences` предоставляет пользовательский интерфейс для управления предпочтениями:

- Выбор темы оформления (светлая/темная/системная)
- Выбор языка интерфейса
- Настройки уведомлений (email, push, SMS)
- Кнопки сохранения и сброса настроек

## Использование

### Подключение хука

```tsx
import { useUserPreferences } from '@/lib/userPreferences';
import { useAuthContext } from '@/lib/authContext';

function MyComponent() {
  const { authState } = useAuthContext();
  const { preferences, updatePreference } = useUserPreferences(authState.user);
  
  // Использование предпочтений
  const theme = preferences.theme;
  
  // Обновление предпочтений
  const handleThemeChange = async (newTheme) => {
    await updatePreference('theme', newTheme);
  };
  
  // ...
}
```

### Добавление в историю просмотров

```tsx
const { addToViewHistory } = useUserPreferences(user);

// При просмотре вакансии
const handleViewJob = async (jobId) => {
  await addToViewHistory('jobs', jobId);
};
```

### Работа с избранным

```tsx
const { toggleFavorite, isFavorite } = useUserPreferences(user);

// Проверка, находится ли вакансия в избранном
const isJobFavorite = isFavorite('jobs', jobId);

// Добавление/удаление из избранного
const handleToggleFavorite = async () => {
  await toggleFavorite('jobs', jobId);
};
```

## Безопасность

Система предпочтений включает следующие меры безопасности:

1. **Проверка авторизации** - Доступ к API-маршрутам только для авторизованных пользователей
2. **Проверка прав доступа** - Пользователи могут получать и изменять только свои предпочтения
3. **Валидация данных** - Проверка структуры и типов данных перед сохранением

## Дальнейшие улучшения

1. **Кэширование** - Добавить локальное кэширование предпочтений для улучшения производительности
2. **Синхронизация в реальном времени** - Реализовать синхронизацию предпочтений между устройствами
3. **Расширение типов предпочтений** - Добавить дополнительные настройки для разных типов пользователей
4. **Экспорт/импорт настроек** - Добавить возможность экспорта и импорта настроек
5. **Аналитика предпочтений** - Собирать анонимную статистику по популярным настройкам