# 🔒 РЕШЕНИЕ ПРОБЛЕМЫ С SSL СЕРТИФИКАТОМ

## ❌ Проблема
При попытке открыть `https://workclick.cz/test-role-switcher.html` появляется ошибка:
```
NET::ERR_CERT_COMMON_NAME_INVALID
Ваше подключение не является закрытым
```

## ✅ Решение

### 1. 🔗 Используйте правильный URL
Вместо `workclick.cz` используйте Firebase Hosting URL:
```
https://workclick-cz.web.app/test-role-switcher.html
```

### 2. 🌐 Почему это происходит
- Домен `workclick.cz` не настроен в Firebase Hosting
- SSL сертификат недействителен для этого домена
- Firebase использует домен `workclick-cz.web.app`

### 3. 🚀 Правильные ссылки для тестирования

#### Тестовая страница:
```
https://workclick-cz.web.app/test-role-switcher.html
```

#### Основные страницы:
```
https://workclick-cz.web.app/
https://workclick-cz.web.app/dashboard
https://workclick-cz.web.app/employer-dashboard
https://workclick-cz.web.app/agency-dashboard
https://workclick-cz.web.app/admin-dashboard
```

### 4. 🔧 Настройка кастомного домена (опционально)
Для использования `workclick.cz` нужно:
1. Добавить кастомный домен в Firebase Hosting
2. Настроить DNS записи
3. Получить SSL сертификат

### 5. 🎯 Быстрое тестирование
1. Откройте: https://workclick-cz.web.app/test-role-switcher.html
2. Используйте переключатель ролей 🎭
3. Протестируйте функционал

## 🎉 Готово!
Теперь система тестовых аккаунтов работает через правильный домен!