# 🔐 Руководство по системе аутентификации WorkInCZ

## 🚀 Demo-вход 1-клик

### Для пользователей
1. **Откройте главную страницу** - https://workincz-759c7.web.app
2. **Нажмите кнопку "🚀 Demo-вход"** рядом с кнопкой "Войти"
3. **Выберите роль:**
   - 👤 **Соискатель** - доступ к поиску работы, заявкам, профилю
   - 🏢 **Работодатель** - доступ к размещению вакансий, управлению заявками
   - 👥 **Агентство** - доступ к подбору персонала, контрактам
4. **Система автоматически:**
   - Создаст демо-аккаунт с тестовыми данными
   - Выполнит вход
   - Перенаправит на соответствующий дашборд

### Magic-Link вход
1. В модале Demo-входа введите свой email
2. Нажмите "Отправить Magic-Link"
3. Проверьте почту и перейдите по ссылке
4. Система автоматически создаст профиль и войдет в систему

---

## 🛠️ Dev Tools (только для разработчиков)

### Доступ
- Работает только на `localhost`, `127.0.0.1` или с параметром `?dev=true`
- Dev-панель появляется в правом нижнем углу

### Быстрый вход
- **Кнопки в панели:** 👤 Соискатель, 🏢 Работодатель, 👥 Агентство, 🔧 Админ
- **Горячие клавиши:**
  - `Ctrl+Shift+1` - Соискатель
  - `Ctrl+Shift+2` - Работодатель  
  - `Ctrl+Shift+3` - Агентство
  - `Ctrl+Shift+4` - Админ
  - `Ctrl+Shift+D` - показать/скрыть панель

### Консольные команды
```javascript
// Быстрый вход
devQuickLogin('candidate')  // Соискатель
devQuickLogin('client')     // Работодатель
devQuickLogin('agency')     // Агентство
devQuickLogin('admin')      // Админ

// Управление данными
devCreateData()             // Создать тестовые данные
devClearData()              // Очистить все данные
devLogout()                 // Выйти из системы
```

---

## 🛡️ Role Middleware

### Автоматические редиректы
- **Неавторизованные пользователи** → главная страница
- **Соискатели** → `/dashboard.html`
- **Работодатели** → `/employer-dashboard.html`
- **Агентства** → `/agency-dashboard.html`
- **Админы** → `/admin-dashboard.html`

### Защита страниц
```html
<!-- Показывать только соискателям -->
<div data-role-only="candidate">Контент для соискателей</div>

<!-- Показывать только работодателям и агентствам -->
<div data-role-content="client">Контент для работодателей</div>
<div data-role-content="agency">Контент для агентств</div>
```

### JavaScript проверки
```javascript
// Проверка роли
if (hasRole('candidate')) {
    // Код для соискателей
}

// Обязательная проверка с редиректом
if (requireRole('admin', '/dashboard.html')) {
    // Код только для админов
}
```

---

## 📁 Структура файлов

```
public/
├── js/
│   ├── demo-login-system.js    # Demo-вход 1-клик
│   ├── role-middleware.js      # Middleware ролей
│   ├── dev-login.js           # Dev инструменты
│   └── enhanced-auth-system.js # Существующая система
├── auth/
│   └── confirm.html           # Magic-Link подтверждение
└── index.html                 # Главная страница с кнопкой Demo-входа
```

---

## 🔧 Настройка Firebase

### Magic-Link
1. В Firebase Console → Authentication → Settings
2. Добавьте домен в "Authorized domains"
3. Настройте email templates для Magic-Link

### Security Rules
```javascript
// Firestore Rules для ролей
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать только свой профиль
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Работодатели могут создавать вакансии
    match /jobs/{jobId} {
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'client';
    }
  }
}
```

---

## 🎯 Тестирование

### Demo-аккаунты
- **Соискатель:** `demo-candidate@workincz.cz` / `demo123456`
- **Работодатель:** `demo-client@workincz.cz` / `demo123456`
- **Агентство:** `demo-agency@workincz.cz` / `demo123456`

### Dev-аккаунты (только localhost)
- **Соискатель:** `dev-candidate@workincz.cz` / `dev123456`
- **Работодатель:** `dev-client@workincz.cz` / `dev123456`
- **Агентство:** `dev-agency@workincz.cz` / `dev123456`
- **Админ:** `dev-admin@workincz.cz` / `dev123456`

---

## 🚨 Безопасность

### Ограничения
- Demo-аккаунты работают только с тестовыми данными
- Dev-инструменты доступны только в режиме разработки
- Magic-Link имеет ограниченное время действия
- Автоматические редиректы предотвращают доступ к чужим дашбордам

### Рекомендации
- Регулярно очищайте тестовые данные
- Используйте разные email для demo и dev аккаунтов
- Не используйте demo-аккаунты в продакшене
- Настройте Firebase Security Rules для защиты данных

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Firebase правильно настроен
3. Проверьте, что все скрипты загружены
4. Очистите кэш браузера при необходимости

**URL для тестирования:** https://workincz-759c7.web.app 