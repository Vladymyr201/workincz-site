# Руководство по интеграции МПС (Model Context Protocol) в проект WorkInCZ

## Обзор

Данное руководство описывает интеграцию МПС (Model Context Protocol) серверов в проект WorkInCZ. МПС предоставляет мощные инструменты для расширения возможностей приложения, включая хранение данных в виде графа знаний и пошаговое мышление для сложных задач.

## Используемые МПС серверы

В проекте WorkInCZ используются следующие МПС серверы:

1. **МПС memory** - Сервер для хранения данных в виде графа знаний
2. **МПС sequentialthinking** - Сервер для пошагового мышления и анализа

## Настройка МПС серверов

### Установка и запуск

МПС серверы можно запустить несколькими способами:

#### Через NPX

```bash
# Запуск МПС memory
npx -y @modelcontextprotocol/server-memory

# Запуск МПС sequentialthinking
npx -y @modelcontextprotocol/server-sequential-thinking
```

#### Через Docker

```bash
# Запуск МПС memory
docker run --rm -i -p 3001:3000 mcp/memory

# Запуск МПС sequentialthinking
docker run --rm -i -p 3002:3000 mcp/sequentialthinking
```

### Конфигурация в проекте

Для использования МПС серверов в проекте необходимо настроить соответствующие URL-адреса в конфигурационных файлах:

```typescript
// src/config/mcp.ts
export const mcpConfig = {
  memory: {
    url: process.env.MCP_MEMORY_URL || 'http://localhost:3001/api/memory'
  },
  sequentialthinking: {
    url: process.env.MCP_SEQUENTIALTHINKING_URL || 'http://localhost:3002/api/sequentialthinking'
  }
};
```

## МПС memory

### Структура данных

МПС memory хранит данные в виде графа знаний, состоящего из:

1. **Сущности (Entities)** - Узлы графа с уникальным именем, типом и набором наблюдений
2. **Отношения (Relations)** - Направленные связи между сущностями
3. **Наблюдения (Observations)** - Атомарные факты о сущностях

### API для работы с МПС memory

#### Создание сущностей

```typescript
// Создание сущностей
const response = await fetch('http://localhost:3001/api/memory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'create_entities',
    entities: [{
      name: 'User_123',
      entityType: 'user',
      observations: ['email:user@example.com', 'role:candidate']
    }]
  }),
});
```

#### Создание отношений

```typescript
// Создание отношений
const response = await fetch('http://localhost:3001/api/memory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'create_relations',
    relations: [{
      from: 'User_123',
      to: 'Job_456',
      relationType: 'applied_to'
    }]
  }),
});
```

#### Добавление наблюдений

```typescript
// Добавление наблюдений
const response = await fetch('http://localhost:3001/api/memory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'add_observations',
    observations: [{
      entityName: 'User_123',
      contents: ['lastLogin:2023-07-30T12:00:00Z']
    }]
  }),
});
```

#### Поиск сущностей

```typescript
// Поиск сущностей
const response = await fetch('http://localhost:3001/api/memory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'search_nodes',
    query: 'User_123'
  }),
});
```

### Использование МПС memory в проекте

В проекте WorkInCZ МПС memory используется для:

1. **Хранения предпочтений пользователей**
   - Настройки интерфейса (тема, язык)
   - Настройки уведомлений
   - Параметры поиска вакансий
   - История просмотров
   - Избранное

2. **API для работы с предпочтениями**
   - `GET /api/preferences/[userId]` - Получение предпочтений
   - `PUT /api/preferences/[userId]` - Обновление предпочтений

3. **Хук useUserPreferences**
   - Интерфейс для работы с предпочтениями в React-компонентах

## МПС sequentialthinking

### Принцип работы

МПС sequentialthinking предоставляет инструмент для пошагового мышления и анализа сложных задач. Он позволяет:

1. Разбивать проблемы на управляемые шаги
2. Пересматривать и уточнять решения
3. Ветвиться для исследования альтернатив
4. Генерировать и проверять гипотезы

### API для работы с МПС sequentialthinking

```typescript
// Пример использования МПС sequentialthinking
const response = await fetch('http://localhost:3002/api/sequentialthinking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    thought: 'Анализирую предпочтения пользователя для подбора вакансий',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }),
});
```

### Использование МПС sequentialthinking в проекте

В проекте WorkInCZ МПС sequentialthinking используется для:

1. **Системы рекомендаций вакансий**
   - Анализ предпочтений пользователя
   - Ранжирование вакансий по релевантности
   - Объяснение рекомендаций

2. **API для получения рекомендаций**
   - `POST /api/recommendations` - Получение персонализированных рекомендаций

3. **Хук useJobRecommendations**
   - Интерфейс для работы с рекомендациями в React-компонентах

## Интеграция в компоненты

### Компонент UserPreferences

Компонент `UserPreferences` использует хук `useUserPreferences` для работы с предпочтениями пользователя, хранящимися в МПС memory:

```tsx
import { useUserPreferences } from '@/lib/userPreferences';
import { useAuthContext } from '@/lib/authContext';

export function UserPreferences() {
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

### Компонент JobRecommendations

Компонент `JobRecommendations` использует хук `useJobRecommendations` для получения рекомендаций вакансий, ранжированных с помощью МПС sequentialthinking:

```tsx
import { useJobRecommendations } from '@/lib/jobRecommendations';

export function JobRecommendations({ limit = 5 }) {
  const { jobs, loading, error, refresh } = useJobRecommendations(limit);
  
  // Отображение рекомендаций
  return (
    <div>
      {jobs.map(job => (
        <div key={job.id}>
          <h3>{job.title}</h3>
          <p>Релевантность: {Math.round(job.score * 100)}%</p>
        </div>
      ))}
    </div>
  );
}
```

## Безопасность

При использовании МПС серверов необходимо соблюдать следующие меры безопасности:

1. **Аутентификация и авторизация**
   - Проверка авторизации пользователя перед доступом к API
   - Проверка прав доступа к данным

2. **Валидация данных**
   - Проверка входных данных перед отправкой в МПС
   - Проверка данных, полученных от МПС

3. **Ограничение доступа**
   - Запуск МПС серверов в изолированной среде
   - Ограничение доступа к МПС серверам только с доверенных источников

## Развертывание

### Локальная разработка

Для локальной разработки МПС серверы можно запустить через NPX или Docker, как описано выше.

### Продакшн

Для продакшн-окружения рекомендуется:

1. Развернуть МПС серверы в контейнерах Docker
2. Настроить постоянное хранилище для МПС memory
3. Настроить балансировку нагрузки для обеспечения высокой доступности
4. Настроить мониторинг и логирование

## Примеры использования

### Сохранение предпочтений пользователя

```typescript
// API-маршрут для сохранения предпочтений
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Получаем данные из запроса
  const preferences = await request.json();
  
  // Создаем или обновляем сущность пользователя в МПС memory
  const response = await fetch('http://localhost:3001/api/memory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create_entities',
      entities: [{
        name: `User_${params.userId}`,
        entityType: 'user',
        observations: [
          `preferences:${JSON.stringify(preferences)}`
        ]
      }]
    }),
  });
  
  // Возвращаем результат
  return NextResponse.json({ success: true });
}
```

### Получение рекомендаций вакансий

```typescript
// API-маршрут для получения рекомендаций
export async function POST(request: NextRequest) {
  // Получаем данные из запроса
  const { userId, preferences } = await request.json();
  
  // Получаем вакансии из базы данных
  const jobs = await getJobsFromDatabase();
  
  // Используем МПС sequentialthinking для ранжирования вакансий
  const response = await fetch('http://localhost:3002/api/sequentialthinking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'analyze',
      data: {
        jobs,
        userPreferences: preferences
      }
    }),
  });
  
  // Получаем результат анализа
  const result = await response.json();
  
  // Возвращаем ранжированные вакансии
  return NextResponse.json({ jobs: result.rankedJobs });
}
```

## Заключение

Интеграция МПС серверов в проект WorkInCZ позволяет расширить функциональность приложения, добавив персонализированные рекомендации вакансий и хранение предпочтений пользователей. МПС memory обеспечивает гибкое хранение данных в виде графа знаний, а МПС sequentialthinking предоставляет мощный инструмент для анализа и ранжирования информации.

## Дополнительные ресурсы

- [Документация по МПС memory](docs/USER_PREFERENCES_MCP.md)
- [Документация по системе рекомендаций](docs/JOB_RECOMMENDATIONS_SYSTEM.md)