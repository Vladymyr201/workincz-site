# 🏗️ ПРАВИЛА ОРГАНИЗАЦИИ ПРОЕКТА

## 📋 ОСНОВНЫЕ ПРИНЦИПЫ

### 1. АРХИТЕКТУРА
- **ЕДИНАЯ ТЕХНОЛОГИЯ**: Только Next.js 14 + TypeScript + React
- **ЗАПРЕЩЕНО**: Создавать статические HTML/JS файлы вне Next.js
- **ОБЯЗАТЕЛЬНО**: Использовать App Router для всех страниц

### 2. СТРУКТУРА ФАЙЛОВ
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── (routes)/          # Страницы приложения
│   ├── globals.css        # ЕДИНСТВЕННЫЙ CSS файл
│   └── layout.tsx         # Корневой layout
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── forms/            # Формы
│   └── features/         # Функциональные компоненты
├── lib/                  # Утилиты и конфигурации
│   ├── firebase.ts       # ЕДИНСТВЕННАЯ конфигурация Firebase
│   └── utils.ts          # Общие утилиты
├── hooks/                # React хуки
├── types/                # TypeScript типы
└── services/             # Сервисы и API
```

### 3. ПРАВИЛА СОЗДАНИЯ ФАЙЛОВ

#### 🚫 ЗАПРЕЩЕНО:
- Создавать файлы в `public/js/` (кроме статических ресурсов)
- Создавать отдельные CSS файлы
- Создавать дублирующие конфигурации
- Использовать vanilla JavaScript

#### ✅ ОБЯЗАТЕЛЬНО:
- Все компоненты в `src/components/`
- Все API в `src/app/api/`
- Все типы в `src/types/`
- Все хуки в `src/hooks/`

### 4. ИМЕНОВАНИЕ
- **Файлы**: kebab-case (`user-profile.tsx`)
- **Компоненты**: PascalCase (`UserProfile`)
- **Функции**: camelCase (`getUserData`)
- **Типы**: PascalCase с префиксом (`UserData`)

### 5. ИМПОРТЫ
```typescript
// ✅ ПРАВИЛЬНО
import { UserProfile } from '@/components/features/UserProfile'
import { useAuth } from '@/hooks/useAuth'
import { UserData } from '@/types/auth'

// ❌ НЕПРАВИЛЬНО
import UserProfile from '../../../components/UserProfile'
```

## 🔧 АВТОМАТИЗАЦИЯ

### Линтеры и проверки:
- ESLint: проверка структуры импортов
- Prettier: единый стиль кода
- Husky: pre-commit проверки
- TypeScript: строгая типизация

### CI/CD правила:
- Проверка структуры проекта
- Валидация архитектуры
- Автоматические тесты

## 📝 ШАБЛОНЫ

### Компонент:
```typescript
// src/components/features/ComponentName.tsx
'use client'

import { ComponentProps } from '@/types/component'

interface ComponentNameProps {
  // типы пропсов
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### API маршрут:
```typescript
// src/app/api/endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/validation'

export async function GET(request: NextRequest) {
  // логика
}
```

### Хук:
```typescript
// src/hooks/useHookName.ts
import { useState, useEffect } from 'react'

export function useHookName() {
  // логика хука
}
```

## 🚨 КРИТИЧЕСКИЕ ПРАВИЛА

1. **НЕ СОЗДАВАТЬ** файлы вне установленной структуры
2. **НЕ ДУБЛИРОВАТЬ** конфигурации
3. **НЕ СМЕШИВАТЬ** технологии (только Next.js + TypeScript)
4. **ОБЯЗАТЕЛЬНО** использовать типизацию
5. **ОБЯЗАТЕЛЬНО** следовать принципам React Server Components

## 📊 МОНИТОРИНГ

### Автоматические проверки:
- Структура проекта
- Импорты и зависимости
- Типизация
- Производительность

### Отчеты:
- Еженедельный анализ архитектуры
- Отчет о дублирующихся файлах
- Анализ производительности

---

**ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ**: 30.07.2025  
**СТАТУС**: АКТИВНЫЕ ПРАВИЛА  
**СЛЕДУЮЩИЙ АУДИТ**: 06.08.2025 