# 🔐 НАСТРОЙКА БЕЗОПАСНОСТИ - УСТРАНЕНИЕ УТЕЧКИ API КЛЮЧА

## ⚠️ ПРОБЛЕМА
Обнаружена утечка Firebase API Key в публичном репозитории:
- **Ключ:** `AIzaSyAo34JvPwyqjwzjhd-d-qEKh7HqAAWsIiM`
- **Место:** `public/js/firebase-init.js`
- **Статус:** Публично доступен 12 дней

## 🔧 РЕШЕНИЕ

### 1. **Создать новый API Key в Firebase Console**
1. Перейдите в [Firebase Console](https://console.firebase.google.com/project/workincz-759c7)
2. Настройки проекта → Общие → Ваши приложения
3. Создайте новый API Key
4. **Удалите старый ключ**

### 2. **Добавить секреты в GitHub**
В настройках репозитория → Secrets and variables → Actions:

#### `FIREBASE_API_KEY`
```
[НОВЫЙ_API_КЛЮЧ_ИЗ_FIREBASE]
```

#### `FIREBASE_SERVICE_ACCOUNT`
```
[СЕРВИСНЫЙ_АККАУНТ_FIREBASE_JSON]
```

### 3. **Настроить Dependabot alerts**
1. Перейдите в Security → Dependabot alerts
2. Нажмите "Enable Dependabot alerts"

### 4. **Закрыть уведомление о секрете**
1. Security → Secret scanning alerts
2. Нажмите "Close as" → "Revoked"

## 🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ

После настройки секретов:
1. Push в main ветку
2. GitHub Actions автоматически:
   - Проверит на утечку секретов
   - Заменит API ключ на переменную окружения
   - Задеплоит в Firebase

## ✅ ПРОВЕРКА

После деплоя:
- [ ] API ключ не виден в исходном коде
- [ ] Сайт работает корректно
- [ ] Уведомление о секрете закрыто
- [ ] Dependabot alerts включены

## 🔄 ПРОЦЕСС ОБНОВЛЕНИЯ

В будущем для обновления API ключа:
1. Создать новый ключ в Firebase
2. Обновить `FIREBASE_API_KEY` в GitHub Secrets
3. Push в main → автоматический деплой

---
**Статус:** 🔴 ТРЕБУЕТ НАСТРОЙКИ  
**Приоритет:** КРИТИЧЕСКИЙ 