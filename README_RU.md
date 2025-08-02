# 🚀 WorkInCZ - Платформа поиска работы для мигрантов в Чехии

## 📋 Описание проекта

WorkInCZ - это современная платформа для поиска работы, специально разработанная для трудовых мигрантов в Чехии. Проект включает в себя полный набор функций для соискателей и работодателей с соответствием европейским стандартам.

## 🎯 Целевая аудитория

- **~500k мигрантов** в Чехии
- **Средняя зарплата:** 25-35k Kč/мес
- **Цель:** 85,000+ Kč/мес к концу 2024

## 🛠️ Технологии

### Текущий стек
- **Frontend:** HTML, JavaScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Functions, Hosting)
- **CI/CD:** GitHub Actions
- **Хостинг:** Firebase Hosting

### Модернизированный стек
- **Frontend:** Next.js 14+, TypeScript, React
- **UI Framework:** Shadcn UI + Radix UI
- **Styling:** Tailwind CSS с системой дизайна
- **State Management:** TanStack Query + Zustand
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + React Testing Library + Playwright
- **Payments:** Stripe с поддержкой ЕС
- **Internationalization:** Next.js i18n

## 🚀 Быстрый старт

### Локальная разработка
```bash
# Клонировать репозиторий
git clone https://github.com/Vladymyr201/workincz-site.git
cd workincz-site

# Установить зависимости
npm install

# Запустить локально
npm run dev
```

### Деплой
```bash
# Автоматический деплой при push в main
git push origin main

# Ручной деплой
npm run deploy
```

## 🏗️ Архитектура проекта

### Структура файлов
```
workincz-site/
├── src/                    # Next.js приложение
│   ├── app/               # App Router
│   ├── components/        # React компоненты
│   ├── lib/              # Утилиты и конфигурации
│   ├── types/            # TypeScript определения
│   └── hooks/            # Пользовательские хуки
├── public/               # Статические ресурсы
├── tests/                # Тестовые файлы
├── docs/                 # Документация
└── configs/              # Конфигурационные файлы
```

### Ключевые компоненты
- **Аутентификация:** Firebase Auth с ролевым доступом
- **Поиск работы:** Расширенный поиск с фильтрами
- **Чат:** Real-time обмен сообщениями
- **Платежи:** Stripe интеграция с ЕС поддержкой
- **Уведомления:** Push, email, SMS уведомления
- **Аналитика:** Firebase Analytics + Google Analytics

## 🌍 Европейское соответствие

### GDPR Соответствие
- ✅ Управление согласием на cookies
- ✅ Право на забвение
- ✅ Переносимость данных
- ✅ Прозрачная обработка данных
- ✅ Шифрование данных

### Многоязычность
- 🇨🇿 Чешский (основной)
- 🇬🇧 Английский
- 🇩🇪 Немецкий
- 💰 Мультивалютность (CZK, EUR)

### Платежи ЕС
- 💳 SEPA платежи
- 🏦 Локальные платежные процессоры
- 📊 НДС соответствие
- 🛡️ PCI DSS безопасность

## 📊 Статус проекта

### ✅ Завершено
- [x] **GitHub репозиторий настроен**
- [x] **Firebase интеграция готова**
- [x] **CI/CD pipeline работает**
- [x] **Автоматический деплой активен**
- [x] **Next.js основа настроена**
- [x] **TypeScript конфигурация**
- [x] **Система дизайна**

### 🔄 В процессе
- [ ] Миграция компонентов
- [ ] Система аутентификации
- [ ] Поиск работы
- [ ] Панели управления
- [ ] Real-time функции

### 📋 Планируется
- [ ] GDPR полное соответствие
- [ ] Многоязычность
- [ ] Платежная интеграция
- [ ] Тестирование
- [ ] Оптимизация производительности

## 🎨 Дизайн система

### Цветовая палитра
```css
/* Основные цвета */
--primary: #4F46E5;      /* Основной синий */
--secondary: #F59E0B;    /* Оранжевый акцент */
--success: #10B981;      /* Зеленый успех */

/* Чешские цвета */
--czech-red: #D7141A;    /* Чешский красный */
--czech-blue: #11457E;   /* Чешский синий */

/* Цвета ЕС */
--eu-blue: #003399;      /* ЕС синий */
--eu-gold: #FFCC00;      /* ЕС золотой */
```

### Типографика
- **Шрифт:** Inter (Google Fonts)
- **Начертания:** 300, 400, 500, 600, 700
- **Подход:** Mobile-first responsive

## 🔒 Безопасность

### Аутентификация
- Firebase Auth
- Многофакторная аутентификация
- OAuth интеграция (Google, Facebook)
- Ролевой доступ (User, Employer, Agency, Admin)

### Защита данных
- HTTPS принудительно
- CSP заголовки
- XSS защита
- CSRF защита
- Валидация ввода

## 📱 Адаптивность

### Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+
- **Large Desktop:** 1440px+

### Особенности
- Mobile-first подход
- Touch-friendly интерфейс
- Оптимизированные изображения
- Быстрая загрузка

## 🧪 Тестирование

### Стратегия тестирования
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** API тестирование
- **E2E Tests:** Playwright
- **Accessibility:** Screen reader тестирование
- **Performance:** Lighthouse CI

### Покрытие
- Цель: 80%+ покрытие кода
- Автоматизированные тесты в CI/CD
- Регулярные тестирования

## 📈 Производительность

### Целевые метрики
- **Lighthouse Score:** 90+
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **TTFB:** < 600ms

### Оптимизации
- Server-side rendering (SSR)
- Static site generation (SSG)
- Code splitting
- Image optimization
- Bundle analysis

## 🚀 Развертывание

### Окружения
- **Development:** `http://localhost:3000`
- **Staging:** `https://staging.workincz.cz`
- **Production:** `https://workincz.cz`

### CI/CD Pipeline
```yaml
# GitHub Actions
1. Code Quality Check
2. Unit Tests
3. Build
4. E2E Tests
5. Deploy to Firebase
6. Post-deployment Tests
```

## 📊 Аналитика

### Отслеживание
- **Google Analytics 4:** Пользовательское поведение
- **Firebase Analytics:** События приложения
- **Error Tracking:** Мониторинг ошибок
- **Performance Monitoring:** Core Web Vitals

### Метрики
- Пользовательская активность
- Конверсии
- Производительность
- Ошибки

## 🌐 Ссылки

- **Сайт:** https://workincz.cz
- **GitHub:** https://github.com/Vladymyr201/workincz-site
- **Firebase Console:** https://console.firebase.google.com/project/workincz-759c7
- **Документация:** https://docs.workincz.cz

## 📞 Поддержка

### Контакты
- **Email:** support@workincz.cz
- **Telegram:** @workincz_support
- **Discord:** WorkInCZ Community

### Документация
- [План модернизации](MODERNIZATION_PLAN_RU.md)
- [Быстрый старт](QUICK_START_RU.md)
- [API документация](docs/api.md)
- [Руководство пользователя](docs/user-guide.md)

## 🤝 Вклад в проект

### Как внести вклад
1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

### Стандарты кода
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Code review обязателен

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🎉 Благодарности

- Команда разработчиков
- Сообщество мигрантов в Чехии
- Firebase команда
- Next.js команда
- Tailwind CSS команда

---

**Статус:** 🟢 ГОТОВ К МОДЕРНИЗАЦИИ  
**Последнее обновление:** 24.07.2025  
**Версия:** 2.0.0 (Next.js модернизация) 