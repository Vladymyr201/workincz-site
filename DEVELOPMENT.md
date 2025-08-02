# 🛠️ Руководство по разработке WorkInCZ

## 📋 Обзор проекта

WorkInCZ - это статический веб-сайт, построенный на HTML, CSS и JavaScript с использованием Firebase в качестве backend.

## 🏗️ Архитектура

### Frontend
- **HTML5** - структура страниц
- **CSS3 + Tailwind CSS** - стилизация
- **JavaScript (ES6+)** - интерактивность
- **Chart.js** - графики и диаграммы
- **Remix Icons** - иконки

### Backend
- **Firebase Hosting** - хостинг
- **Firebase Firestore** - база данных
- **Firebase Authentication** - аутентификация
- **Firebase Storage** - файловое хранилище

## 📁 Структура файлов

```
public/
├── index.html              # Главная страница
├── dashboard.html          # Личный кабинет соискателя
├── employer-dashboard.html # Дашборд работодателя
├── agency-dashboard.html   # Дашборд агентства
├── admin-dashboard.html    # Админ панель
├── test-demo.html          # Демо-вход для тестирования
├── js/                     # JavaScript модули
│   ├── firebase-init.js    # Инициализация Firebase
│   ├── auth-manager.js     # Управление аутентификацией
│   ├── demo-login-system.js # Система демо-входа
│   ├── role-middleware.js  # Управление ролями
│   ├── jobs.js            # Система вакансий
│   ├── chat-widget.js     # Чат
│   ├── payment-system.js  # Платежи
│   └── ...                # Другие модули
└── css/                   # Стили (если есть)
```

## 🚀 Локальная разработка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск локального сервера
```bash
npm run dev
# или
firebase serve
```

### 3. Открытие в браузере
```
http://localhost:5000
```

## 🔧 Работа с кодом

### Добавление новой страницы
1. Создайте HTML файл в папке `public/`
2. Добавьте редирект в `firebase.json`
3. Подключите необходимые JavaScript модули

### Добавление нового JavaScript модуля
1. Создайте файл в `public/js/`
2. Подключите в HTML файлах где нужно
3. Следуйте паттернам существующих модулей

### Стилизация
- Используйте Tailwind CSS классы
- Для кастомных стилей добавляйте в `<style>` теги
- Следуйте дизайн-системе проекта

## 🔐 Система аутентификации

### Демо-вход
Для тестирования используйте `/demo` или `/test-demo.html`:

- **Соискатель** - полный доступ к поиску работы
- **Работодатель** - управление вакансиями
- **Агентство** - работа с кандидатами

### Роли пользователей
- `candidate` - соискатель
- `employer` - работодатель
- `agency` - кадровое агентство
- `admin` - администратор

## 📊 База данных (Firestore)

### Коллекции
- `users` - пользователи
- `jobs` - вакансии
- `applications` - заявки
- `messages` - сообщения
- `notifications` - уведомления

### Правила безопасности
Настроены в Firebase Console для защиты данных.

## 🧪 Тестирование

### Ручное тестирование
1. Откройте `/demo`
2. Протестируйте все роли
3. Проверьте функциональность

### Автоматическое тестирование
Планируется добавить Jest для unit тестов.

## 📦 Деплой

### Staging
```bash
npm run deploy:staging
```

### Production
```bash
npm run deploy:production
```

### Автоматический деплой
При push в `main` ветку происходит автоматический деплой.

## 🔍 Отладка

### Firebase Console
- [Firebase Console](https://console.firebase.google.com/project/workincz-759c7)
- Проверка логов
- Мониторинг производительности

### Browser DevTools
- Console для JavaScript ошибок
- Network для запросов
- Application для localStorage

## 📝 Стандарты кода

### JavaScript
- Используйте ES6+ синтаксис
- Следуйте camelCase для переменных
- Добавляйте комментарии к сложной логике
- Обрабатывайте ошибки

### HTML
- Семантическая разметка
- Доступность (accessibility)
- SEO оптимизация

### CSS
- Tailwind CSS классы
- Мобильная адаптивность
- Консистентность дизайна

## 🐛 Известные проблемы

1. **Firebase Auth** - иногда требуется перезагрузка страницы
2. **Chart.js** - может не работать в некоторых браузерах
3. **Tailwind CSS** - CDN версия может быть медленной

## 📚 Полезные ссылки

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chart.js](https://www.chartjs.org/docs/)
- [Remix Icons](https://remixicon.com/)

## 🤝 Вклад в проект

1. Создайте issue для багов или feature requests
2. Fork репозитория
3. Создайте feature branch
4. Внесите изменения
5. Создайте Pull Request

## 📞 Поддержка

- **Email**: dev@workincz.com
- **Telegram**: @workincz_dev
- **GitHub Issues**: [Создать issue](https://github.com/workincz/workincz-site/issues)

---

**Удачной разработки!** 🚀 