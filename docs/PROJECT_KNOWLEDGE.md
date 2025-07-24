# PROJECT_KNOWLEDGE.md

---

## 🏆 ЦЕЛЬ ПРОЕКТА

Платформа для агентского подбора персонала в Чехии с гибридной моделью (агентства + прямые вакансии), монетизацией через success-fee (5%) и premium подписки. Фокус: трудовые мигранты, агентства, работодатели. 

---

## 🏗️ АРХИТЕКТУРА И СУЩНОСТИ

### Основные сущности (Firestore)
- **users**: email, name, role ('client' | 'agency' | 'candidate' | 'admin'), verified, is_premium, stats, billing, ...
- **agencies**: name, license, verified, specializations, rating, stripe_connect_id, ...
- **staffing_requests**: client_id, title, requirements, budget, status, ...
- **bids**: request_id, agency_id, price, candidates, status, ...
- **contracts**: request_id, client_id, agency_id, bid_id, total_value, status, payment_schedule, ...
- **chats**: participants, context, type, is_active, auto_translations, ...
- **messages**: chat_id, sender_id, content, type, created_at, ...
- **jobs**: title, description, employer_id, salary, location, job_type ('direct' | 'staffing_request'), ...

### Миграции и совместимость
- Расширение ролей пользователей (добавлены agency, admin)
- Двойная модель вакансий (direct + staffing_request)
- Миграция данных пользователей и вакансий без потери доступа
- Чаты и история сообщений сохраняются

---

## ⚙️ ТЕХНИЧЕСКИЙ СТЕК
- **Frontend**: HTML/CSS/JS (Tailwind), Service Worker, IndexedDB
- **Backend**: Firebase Hosting, Firestore, Functions, Auth, Cloud Messaging
- **Интеграции**: Stripe Connect, DeepL, OpenAI, Sentry
- **CI/CD**: GitHub Actions, Firebase CLI
- **MCP Серверы**: 14 серверов для автоматизации (code-runner, sentry, playwright, notion, supabase, github, wikipedia, youtube)

---

## 🔒 БЕЗОПАСНОСТЬ И GDPR
- Cookie banner (Cookiebot), consent при регистрации
- DPA шаблон для агентств, право на забвение, экспорт данных
- Firebase Security Rules, Stripe webhook secret, rate limiting, input validation, HTTPS

---

## 💸 МОНЕТИЗАЦИЯ
- **Success-fee**: 5% от контракта (Stripe Connect)
- **Premium подписки**: Client/Agency/Candidate
- **Разовые услуги**: верификация, продвижение, срочные заявки

---

## 🧩 UI/UX И КОМПОНЕНТЫ
- /, /dashboard, /requests/new, /requests/:id, /contracts/:id, /agencies, /profile
- Модальные окна: CreateStaffingRequest, AgencyRegistration, BidComparison, ContractPreview, PaymentModal
- Виджеты: StatisticsWidget, NotificationsPanel, QuickActions, ChatWidget

## 🔐 СИСТЕМА АУТЕНТИФИКАЦИИ (ЗАВЕРШЕНА ✅)

### ✅ Demo-вход 1-клик (РАБОТАЕТ)
- **DemoLoginSystem** - быстрый вход для 3 ролей (candidate, client, agency)
- Автоматическое создание демо-аккаунтов с тестовыми данными
- Magic-Link аутентификация через Firebase
- Страница подтверждения `/auth/confirm.html`

### ✅ Role Middleware (РАБОТАЕТ)
- **RoleMiddleware** - проверка ролей и редиректы на клиентской стороне
- Автоматическое перенаправление на соответствующие дашборды
- Защита страниц по ролям
- Обработка URL параметров (demo, magic_link)

### ✅ Dev Tools (РАБОТАЕТ)
- **DevLogin** - headless вход для разработки (только localhost)
- Dev-панель с быстрыми командами
- Горячие клавиши: Ctrl+Shift+D (панель), Ctrl+Shift+1-4 (вход)
- Создание/очистка тестовых данных
- Консольные команды: devQuickLogin(), devCreateData(), devClearData()

### ✅ Файлы системы (СОЗДАНЫ)
- `public/js/demo-login-system.js` - Demo-вход ✅
- `public/js/role-middleware.js` - Middleware ролей ✅
- `public/js/dev-login.js` - Dev инструменты ✅
- `public/auth/confirm.html` - Magic-Link подтверждение ✅
- `public/js/firebase-init.js` - Единая инициализация Firebase ✅

### ✅ Дашборды (ВСЕ РАБОТАЮТ)
- **Соискатель**: `/dashboard.html` - личный кабинет с резюме, заявками, чатами ✅
- **Работодатель**: `/employer-dashboard.html` - управление вакансиями, кандидатами ✅
- **Агентство**: `/agency-dashboard.html` - управление заявками, контрактами, доходом ✅

### ✅ Исправленные ошибки
- Устранены синтаксические ошибки в дашбордах
- Удалена дублированная конфигурация Firebase
- Исправлена инициализация DashboardAuth
- Все дашборды загружаются без ошибок

---

## 🤖 MCP СЕРВЕРЫ И АВТОМАТИЗАЦИЯ (НОВОЕ ✅)

### ✅ Установлено 14 MCP серверов
- **code-runner** - Автоматическое тестирование кода
- **sentry** - Мониторинг ошибок и безопасности
- **playwright** - Автоматизированное тестирование UI
- **notion** - Интеграция с Notion для документации
- **supabase** - Работа с Supabase (альтернатива Firebase)
- **github** - Автоматизация GitHub операций
- **wikipedia** - Поиск информации и документации
- **youtube** - Работа с YouTube API
- **filesystem** - Управление файловой системой
- **sequential-thinking** - Последовательное решение задач
- **context7** - Интеграция с Context7
- **time** - Работа со временем
- **memory** - Управление памятью
- **firebase-mcp** - Интеграция с Firebase

### ✅ Автоматические правила
- **Code Review** при изменении файлов (14 пунктов проверки)
- **Performance Testing** при деплое
- **Security Scanning** при изменении критических файлов
- **Documentation Updates** при изменении API

### ✅ Файлы системы
- `mcp.json` - Конфигурация всех серверов ✅
- `install-mcp-servers.js` - Автоматическая установка ✅
- `MCP_SETUP_GUIDE.md` - Подробное руководство ✅
- `start-mcp-servers.sh` - Скрипт быстрого запуска ✅

### ✅ Code Review Checklist (14 пунктов)
1. Firebase авторизация и безопасность
2. Оптимальность структуры базы данных
3. Проверки ошибок на всех уровнях
4. Мультиязычность (i18n)
5. Авто-перевод сообщений
6. Безопасность Stripe интеграции
7. Адаптивность верстки (Tailwind CSS)
8. Firebase Cloud Functions
9. VIP/Premium статусы
10. SEO и соцсети мета-теги
11. Производительность операций
12. Авто-тесты (code-runner)
13. Документация кода
14. Security review (XSS, инъекции)

---

## 🚀 ДЕПЛОЙ, CI/CD, ЧЕК-ЛИСТЫ

### ✅ Завершенные этапы
- [x] Система аутентификации (Demo + Magic-Link)
- [x] Role Middleware и переключение ролей
- [x] 3 дашборда для всех ролей
- [x] Firebase интеграция
- [x] Исправление всех синтаксических ошибок
- [x] Деплой на Firebase Hosting

### Следующие этапы
- [ ] Создать ветку feat/agency-flow
- [ ] Добавить коллекции Firestore и индексы
- [ ] Security Rules по ролям
- [ ] 8 cloud-функций (см. ниже)
- [ ] Stripe Connect + webhook
- [ ] 4 новые страницы + 3 модалки
- [ ] E2E + unit тесты (Cypress, Jest)
- [ ] Cookiebot + Privacy/Terms
- [ ] GitHub Actions deploy + Sentry release
- [ ] Soft-launch: доступ 5 агентствам, сбор фидбека

### Cloud Functions (8 функций)
- createStaffingRequest, submitBid, acceptBid, generateContractPdf, createStripeConnectAccount, chargeSuccessFee, createSubscription, validateAgencyLicense

### GitHub Actions pipeline
- Тесты → билд → deploy на Firebase → deploy функций → Sentry release

### Критерии готовности
- Все тесты проходят (E2E + Unit)
- Нет критических ошибок в Sentry
- Время загрузки < 3 сек
- GDPR compliance
- Безопасность протестирована
- 5 агентств протестировали платформу
- CI/CD пайплайн работает
- Документация готова

---

## 🔄 ПЛАН МИГРАЦИИ И СОВМЕСТИМОСТИ
- Этап 1: расширение ролей, миграция пользователей
- Этап 2: двойная модель вакансий, обновление UI
- Этап 3: расширение чатов, поддержка новых типов
- Этап 4: двойная монетизация, поддержка всех типов платежей
- Этап 5: обновление UI/UX, финальное тестирование

---

## 📊 МЕТРИКИ И АНАЛИТИКА
- DAU ≥ 100, заявки/день ≥ 10, bids/заявка ≥ 3, success rate ≥ 80%, avg response ≤ 24ч
- Dashboard: dau, requestsPerDay, avgBidsPerRequest, contractsPerDay, successRate, avgResponseTime

---

## 🧪 ТЕСТИРОВАНИЕ
- E2E: полный flow (создание заявки, отклик, контракт)
- Unit: success-fee, валидация контрактов, перевод сообщений
- Тестирование совместимости: старые пользователи, вакансии, чаты
- Тестирование новых функций: регистрация агентства, заявки, отклики

---

## 🛡️ ОПТИМИЗАЦИИ И ПАТТЕРНЫ
- Code splitting, lazy loading, caching, performance monitoring
- Event-driven, observer, factory, strategy
- Кэширование профилей, рекомендаций, уведомлений
- Ленивая загрузка данных, ограничение истории

---

## 🏁 ROADMAP (WBS)
- ✅ Неделя 1: Обновление дизайна под JobBridge, система регистрации
- 🔄 Неделя 2-3: Интеграция Firebase, двойная модель вакансий, UI
- ⏳ Неделя 4: чаты, поддержка новых типов
- ⏳ Неделя 5-6: монетизация, платежи
- ⏳ Неделя 7-8: UI/UX, тесты, деплой
- ⏳ Soft-launch: 5 агентств, сбор фидбека
- ⏳ Публичный запуск: маркетинг, поддержка

---

## 🗂️ АКТУАЛЬНАЯ СТРУКТУРА ПРОЕКТА (2025-07-22)

- **public/** — клиентский код (HTML, JS, Tailwind)
- **public/js/** — все клиентские модули (без дублей)
- **servers/** — серверная логика (TypeScript, Node.js)
- **docs/** — вся документация и отчёты (.md, .txt)
- **configs/** — конфигурационные файлы (по мере необходимости)
- **.github/**, **workflows-templates/** — CI/CD и шаблоны
- В корне только package.json, deploy.js, firebase.json, LICENSE и минимальный набор служебных файлов

**Удалено:**
- Дублирующие js-файлы (auth-manager-simple.js, jobs-simple.js)
- Неиспользуемые html и пустые папки (site-index.html, quick-deploy.html, D/, design-template.html/)
- Лишние конфиги (correct-mcp.json, mcp-config-example.json)

**Документация теперь только в docs/**, основной код не тронут, структура стала чище и прозрачнее для команды и CI/CD.

---

## 👥 КОМАНДА И КОНТАКТЫ
- Главный директор: AI-агент #1
- Product Manager: AI-агент #2
- Backend/DevOps: AI-агент #1
- Frontend/QA: AI-агент #1
- Контакты: Sentry, Firebase Console

---

## 🏅 ЛУЧШИЕ ПРАКТИКИ
- Модульная архитектура, event-driven, progressive enhancement
- Mobile-first, performance monitoring, error tracking
- Документирование всех изменений

---

## 🐞 ИЗВЕСТНЫЕ БАГИ
- Критических багов нет, все функции протестированы в демо-режиме
- Системы стабильно работают

## ✅ ПРОДЕЛАННАЯ РАБОТА (2024-12-19)

### 🎨 Обновление дизайна
- ✅ Полностью обновлен дизайн сайта под JobBridge
- ✅ Добавлен логотип Pacifico и цветовая схема (primary: #4F46E5, secondary: #F59E0B, success: #10B981)
- ✅ Интегрированы Remix Icons вместо Font Awesome
- ✅ Добавлена живая статистика пользователей
- ✅ Реализована многоязычность (RU, CZ, UA, BY, VN)
- ✅ Добавлены анимации и 3D-эффекты
- ✅ Обновлена структура навигации и футера

### 🔐 Система регистрации и аутентификации
- ✅ Создана полноценная система регистрации с модальными окнами
- ✅ Поддержка 3 ролей: Соискатель (candidate), Работодатель (client), Кадровое агентство (agency)
- ✅ Пошаговая регистрация с валидацией
- ✅ Интеграция с Firebase Auth и Firestore
- ✅ Подтверждение email
- ✅ Специальные поля для агентств (компания, лицензия, специализация)
- ✅ Обработка ошибок и уведомления

### 🔄 Улучшенная система аутентификации с переключением ролей
- ✅ Создана `enhanced-auth-system.js` с улучшенным интерфейсом входа
- ✅ Тестовые аккаунты для каждой роли (candidate, client, agency)
- ✅ Переключатель ролей в навигации для авторизованных пользователей
- ✅ Быстрый вход для тестирования всех ролей
- ✅ Автоматическое создание тестовых пользователей в Firebase
- ✅ Интеграция с существующей системой регистрации

### 📊 Личные кабинеты для всех ролей
- ✅ `dashboard.html` - личный кабинет соискателя (обновлен)
- ✅ `employer-dashboard.html` - личный кабинет работодателя (новый)
- ✅ `agency-dashboard.html` - личный кабинет агентства (обновлен)
- ✅ Современный дизайн с Tailwind CSS и Remix Icons
- ✅ Интерактивные графики с Chart.js
- ✅ Статистика и аналитика для каждой роли
- ✅ Переключатель ролей во всех кабинетах

### 📁 Новые файлы
- ✅ `public/js/enhanced-auth-system.js` - улучшенная система аутентификации
- ✅ `public/employer-dashboard.html` - личный кабинет работодателя
- ✅ Обновлен `public/agency-dashboard.html` - личный кабинет агентства
- ✅ Обновлен `public/dashboard.html` - личный кабинет соискателя
- ✅ Обновлен `public/index.html` - интеграция новой системы
- ✅ Обновлен `PROJECT_KNOWLEDGE.md`

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ ДОКУМЕНТЫ
- GAMIFICATION_SYSTEM_REPORT.md, NOTIFICATION_SYSTEM_REPORT.md, RECOMMENDATION_SYSTEM_REPORT.md, ANALYTICS_SYSTEM_REPORT.md, TESTING_SYSTEM_REPORT.md, MONETIZATION_STRATEGY.md

---

**Документ поддерживается и обновляется техдиректором. Все предложения и изменения фиксировать здесь!**

---

## ✅ 2025-07-22: Рефакторинг структуры и порядок в проекте
- Проведён аудит структуры, удалены дубли, документация вынесена в docs/
- Основной код и бизнес-логика не затронуты
- Все изменения зафиксированы в git и описаны здесь
- Следить за чистотой структуры и обновлять этот файл при каждом изменении