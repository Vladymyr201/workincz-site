# 🔧 НАСТРОЙКА ДОМЕНА WORKCLICK.CZ ДЛЯ FIREBASE HOSTING

## 📋 ТЕКУЩЕЕ СОСТОЯНИЕ

### ✅ Что работает:
- **Firebase проект**: `workincz-759c7` ✅
- **Firebase Hosting сайт**: `workclick-cz` ✅
- **Сайт доступен**: `https://workclick-cz.web.app` ✅
- **Все системы работают**: Auth, Firestore, Demo-вход ✅

### ❌ Проблема:
- **Домен workclick.cz** показывает страницу WEDOS вместо сайта
- **SSL сертификат** не настроен
- **DNS записи** не настроены для Firebase

## 🔧 РЕШЕНИЕ: НАСТРОЙКА DNS

### 📍 Текущие DNS записи (WEDOS):
```
A     workclick.cz    →    151.101.1.195    (IP WEDOS)
AAAA  workclick.cz    →    2a02:2b88:1:4::16 (IPv6 WEDOS)
```

### 🎯 Нужные DNS записи (Firebase):
```
A     workclick.cz    →    199.36.158.100   (IP Firebase)
TXT   workclick.cz    →    hosting-site=workclick-cz
```

## 📝 ПОШАГОВЫЕ ИНСТРУКЦИИ

### 1. Войти в панель WEDOS
- Перейти на: https://client.wedos.com/
- Войти в аккаунт
- Выбрать домен `workclick.cz`

### 2. Удалить старые DNS записи
- Найти и **УДАЛИТЬ**:
  - A запись: `workclick.cz → 151.101.1.195`
  - AAAA запись: `workclick.cz → 2a02:2b88:1:4::16`

### 3. Добавить новые DNS записи
- **ДОБАВИТЬ**:
  - A запись: `workclick.cz → 199.36.158.100`
  - TXT запись: `workclick.cz → hosting-site=workclick-cz`

### 4. Проверить настройки
- Подождать 5-15 минут для распространения DNS
- Проверить: https://workclick.cz
- Должен показывать сайт вместо страницы WEDOS

## 🔍 ПРОВЕРКА НАСТРОЕК

### Firebase Console:
- Проект: https://console.firebase.google.com/project/workincz-759c7/hosting
- Сайт: `workclick-cz`
- Статус домена: `workclick.cz` (Needs setup → Connected)

### Доступные URL:
- ✅ `https://workclick-cz.web.app` (работает)
- ✅ `https://workclick-cz.firebaseapp.com` (работает)
- ⏳ `https://workclick.cz` (после настройки DNS)

## 🚨 ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Время распространения DNS**: 5-15 минут
2. **SSL сертификат**: Автоматически настроится после DNS
3. **Резервные URL**: Всегда доступны через `.web.app` и `.firebaseapp.com`
4. **Мониторинг**: Проверять статус в Firebase Console

## 📞 ПОДДЕРЖКА

Если возникнут проблемы:
1. Проверить DNS записи через: https://dnschecker.org/
2. Обратиться в поддержку WEDOS
3. Проверить статус в Firebase Console

---
**Дата создания**: 29.07.2025
**Статус**: Требует настройки DNS