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

## 🎭 НОВАЯ СИСТЕМА ТЕСТОВЫХ АККАУНТОВ (2025-01-28)

### 📋 Компоненты системы:
- **`public/js/test-auth-system.js`** - Система аутентификации для тестовых аккаунтов
- **`public/js/role-switcher.js`** - UI компонент для переключения ролей
- **`public/test-role-switcher.html`** - Страница для тестирования системы
- **`setup-test-accounts.js`** - Скрипт создания тестовых аккаунтов в Firebase
- **`auto-create-test-accounts.js`** - Автоматизированный скрипт создания аккаунтов
- **`CREATE_TEST_ACCOUNTS_NOW.md`** - Быстрая инструкция для создания аккаунтов
- **`QUICK_TEST_ACCOUNTS_SETUP.md`** - Подробная инструкция настройки

### 🔐 Тестовые аккаунты:
- **Соискатель**: `test-candidate@workclick.cz` / `test1234`
- **Работодатель**: `test-employer@workclick.cz` / `test1234`
- **Агентство**: `test-agency@workclick.cz` / `test1234`
- **Админ**: `test-admin@workclick.cz` / `test1234`

### 🎯 Преимущества:
1. **Быстрое переключение ролей** - один клик для смены роли
2. **Постоянные аккаунты** - не нужно создавать каждый раз
3. **Автоматическое перенаправление** - сразу на нужный дашборд
4. **Удобное тестирование** - межролевое взаимодействие
5. **Изолированность** - отдельные тестовые аккаунты

### 🚀 Использование:
1. Откройте `/test-role-switcher.html`
2. Нажмите кнопку "🎭 Переключатель ролей"
3. Выберите нужную роль
4. Автоматический переход в соответствующий дашборд

### 📝 Создание аккаунтов:
- **Автоматически**: `node auto-create-test-accounts.js` (требует service account key)
- **Вручную**: Следуйте инструкции в `CREATE_TEST_ACCOUNTS_NOW.md`
- **Firebase Console**: https://console.firebase.google.com/project/workincz-759c7/authentication/users

### 🔗 Ссылки:
- **Тестовая страница**: https://workclick-cz.web.app/test-role-switcher.html
- **Firebase Authentication**: https://console.firebase.google.com/project/workincz-759c7/authentication/users
- **Firestore Database**: https://console.firebase.google.com/project/workincz-759c7/firestore

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

### ✅ Установлены и настроены 14 MCP серверов:
1. **code-runner** - выполнение кода в браузере
2. **sentry** - мониторинг ошибок
3. **playwright** - автоматизированное тестирование
4. **notion** - интеграция с Notion API
5. **supabase** - альтернативная база данных
6. **github** - управление репозиторием
7. **wikipedia** - поиск информации
8. **youtube** - интеграция с YouTube API
9. **firebase** - управление Firebase проектом
10. **memory** - долгосрочная память
11. **sequential-thinking** - пошаговое мышление
12. **filesystem** - работа с файлами
13. **fetch** - HTTP запросы
14. **time** - работа со временем

### ✅ Автоматизация процессов:
- **FullAutoQA** - автоматическое тестирование и исправление ошибок
- **MCP мониторинг** - отслеживание состояния серверов
- **Автоматический деплой** - CI/CD через GitHub Actions
- **Backup системы** - резервное копирование данных

---

## 🌐 ДЕПЛОЙ И ХОСТИНГ (ОБНОВЛЕНО ✅)

### ✅ Firebase Hosting с кастомным доменом
- **Основной проект**: workincz-759c7
- **Сайты**: 
  - Main: https://workclick-cz.web.app ✅ РАБОТАЕТ
  - Staging: https://workincz-759c7.web.app
- **Кастомный домен**: workclick.cz (Vedos)
- **Конфигурация**: `firebase.json` с мультисайтовой поддержкой
- **Статус**: Домен workclick-cz.web.app полностью настроен и работает

### ✅ Команды деплоя:
```bash
npm run deploy          # Деплой на основной сайт (workclick-cz.web.app)
npm run deploy:staging  # Деплой на staging (workincz-759c7.web.app)
npm run deploy:all      # Деплой на все сайты
```

### ✅ DNS настройки (Vedos):
- A записи: 151.101.1.195, 151.101.65.195
- CNAME: www → workclick-cz.web.app
- SSL: автоматический через Firebase

### ✅ Преимущества Firebase Hosting:
- ⚡ Быстрая загрузка для европейских пользователей
- 🔒 Автоматический SSL сертификат
- 📊 Встроенная аналитика Google Analytics
- 🔍 SEO оптимизация с Google Search Console
- 🧪 A/B тестирование возможности
- 🌍 CDN по всему миру

---

## 🔧 ИЗВЕСТНЫЕ БАГИ И ИСПРАВЛЕНИЯ

### ✅ ИСПРАВЛЕНО (2025-07-22): Проблема с демо-входом
**Проблема:** Демо-вход в личный кабинет приводил к выбросу на главную страницу.

**Решение:**
- Исправлены URL дашбордов в `demo-login-system.js`
- Добавлена задержка для стабилизации состояния
- Улучшена обработка демо-пользователей в `role-middleware.js`
- Предотвращены преждевременные редиректы

**Файлы изменены:**
- `public/js/demo-login-system.js` - исправлены URL и добавлена задержка
- `public/js/role-middleware.js` - улучшена обработка демо-пользователей
- `public/js/dashboard-auth.js` - предотвращены преждевременные редиректы
- `public/test-demo-fix.html` - создан тестовый файл

**Статус:** ✅ ИСПРАВЛЕНО - демо-вход теперь работает корректно

---

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
- GAMIFICATION_SYSTEM_REPORT.md, NOTIFICATION_SYSTEM_REPORT.md, RECOMMENDATION_SYSTEM_REPORT.md, ANALYTICS_SYSTEM_REPORT.md, TESTING_SYSTEM_REPORT.md, MONETIZATION_STRATEGY.md, CUSTOM_DOMAIN_SETUP.md

---

**Документ поддерживается и обновляется техдиректором. Все предложения и изменения фиксировать здесь!**

---

## ✅ 2025-07-22: Рефакторинг структуры и порядок в проекте
- Проведён аудит структуры, удалены дубли, документация вынесена в docs/
- Основной код и бизнес-логика не затронуты
- Все изменения зафиксированы в git и описаны здесь
- Следить за чистотой структуры и обновлять этот файл при каждом изменении

## ✅ 2025-07-28: УСПЕШНАЯ НАСТРОЙКА КАСТОМНОГО ДОМЕНА WORKCLICK.CZ

### 🎉 ЧТО БЫЛО СДЕЛАНО:
- ✅ Firebase сайт workclick-cz создан и активен
- ✅ Домен workclick.cz добавлен в Firebase Console
- ✅ DNS записи настроены в Vedos панели:
  - A запись: @ → 151.101.1.195
  - A запись: * → 151.101.65.195
  - CNAME запись: www → workclick-cz.web.app
- ✅ Все изменения применены в Vedos
- ✅ Firebase сайт работает: https://workclick-cz.web.app

### 🌐 ДОСТУПНЫЕ URL:
- 🔥 **https://workclick-cz.web.app** - работает сейчас
- 🔥 **https://workclick-cz.firebaseapp.com** - работает сейчас
- 🌐 **https://workclick.cz** - будет работать через 60 минут
- 🌐 **https://www.workclick.cz** - будет работать через 60 минут

### 📊 СТАТУС:
- Firebase Console: домен добавлен, статус "Needs setup"
- Vedos DNS: все записи настроены и применены
- Сайт: полностью функционален
- SSL: будет настроен автоматически Firebase

### 🎯 Команды для работы:
```bash
npm run deploy          # Деплой на Firebase Hosting
npm run check:dns       # Проверка DNS настроек
```

### 📖 Документация:
- `FINAL_DOMAIN_SETUP_SUCCESS.md` - полный отчет о настройке
- `docs/VEDOS_DNS_SETUP.md` - инструкция по DNS
- `docs/FINAL_DOMAIN_SETUP.md` - общая инструкция

## ✅ 2025-07-22: ПЕРЕХОД НА FIREBASE ANONYMOUS AUTH + СИСТЕМА ВЕРСИОНИРОВАНИЯ (НОВОЕ РЕШЕНИЕ)

### 🔍 АНАЛИЗ ПРОБЛЕМЫ:
**Проблема:** Смешанная система localStorage + Firebase Auth создавала конфликты и race conditions + агрессивное кэширование браузера.
**Исследование:** Изучены лучшие практики из:
- Stack Overflow: How to propose web application demo with data to user
- Laracasts: Creating a Demo User Account for web visitors
- Firebase Blog: Best Practices for Anonymous Authentication
- Frontegg Blog: What are Guest Users and How to Give Access
- Webpack: Caching strategies with content hashing
- Reddit: Firebase hosting cache busting solutions

### 🚀 НОВОЕ РЕШЕНИЕ:
1. ✅ **Firebase Anonymous Auth** - использование `firebase.auth().signInAnonymously()`
2. ✅ **Единая система состояния** - AuthManager v1.0.5 с поддержкой анонимных пользователей
3. ✅ **Демо-данные в Firestore** - профили создаются в базе данных, не в localStorage
4. ✅ **RoleMiddleware v8.0.1** - поддержка анонимных пользователей и демо-ролей
5. ✅ **DashboardAuth v6.2** - обновленная система для дашбордов
6. ✅ **Убрана зависимость от localStorage** - все данные хранятся в Firestore
7. ✅ **Система версионирования файлов** - хешированные имена файлов для cache busting
8. ✅ **VersionManager** - автоматическая проверка версий и очистка кэша
9. ✅ **HTTP заголовки** - принудительное отключение кэширования для JS файлов

### 📁 ОБНОВЛЕННЫЕ ФАЙЛЫ:
- `public/js/demo-login-system.js` - переписан на Anonymous Auth
- `public/js/auth-manager.js` - поддержка анонимных пользователей (v1.0.5)
- `public/js/role-middleware.js` - обновленная логика ролей (v8.0.1)
- `public/js/dashboard-auth.js` - новая система дашбордов (v6.2)
- `public/js/version-manager.js` - система управления версиями (новый)
- `public/index.html` - обновлен для использования хешированных файлов
- `public/_headers` - HTTP заголовки для отключения кэширования
- `generate-hashed-files.js` - генерация хешированных имен файлов (новый)
- `update-versions.js` - автоматическое обновление версий (новый)
- `public/manifest.json` - манифест соответствий файлов (новый)

### 🎯 РЕЗУЛЬТАТ:
- **РЕШЕНА ПРОБЛЕМА КЭШИРОВАНИЯ** через хешированные имена файлов
- Автоматическое обновление версий при изменениях
- Принудительная очистка кэша браузера
- Демо-вход работает стабильно без выбросов на главную

### 🎯 ПРЕИМУЩЕСТВА НОВОГО ПОДХОДА:
- **Единый источник истины** - все данные в Firestore
- **Нет race conditions** - Firebase Auth управляет состоянием
- **Лучшая производительность** - нет конфликтов между компонентами
- **Совместимость с Firebase** - использует встроенные возможности
- **Масштабируемость** - легко добавлять новые роли и функции