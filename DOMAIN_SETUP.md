# 🌐 Настройка кастомного домена workclick.cz

## 📋 Текущий статус
- ✅ Firebase проект: workincz-759c7
- ✅ Firebase Hosting сайт: workclick-cz
- ✅ URL по умолчанию: https://workclick-cz.web.app
- ✅ Деплой выполнен успешно
- ⏳ Ожидает настройки кастомного домена

## 🔧 Шаги для настройки домена workclick.cz

### 1. Настройка в Firebase Console
1. Перейдите в [Firebase Console](https://console.firebase.google.com/project/workincz-759c7)
2. Выберите проект `workincz-759c7`
3. Перейдите в раздел **Hosting**
4. Выберите сайт `workclick-cz`
5. Нажмите **Add custom domain**
6. Введите домен: `workclick.cz`
7. Следуйте инструкциям по настройке DNS

### 2. Настройка DNS записей
Добавьте следующие DNS записи у вашего регистратора доменов:

#### Для домена workclick.cz:
```
Type: A
Name: @
Value: 151.101.1.195
TTL: 3600

Type: A
Name: @
Value: 151.101.65.195
TTL: 3600
```

#### Для www.workclick.cz:
```
Type: CNAME
Name: www
Value: workclick-cz.web.app
TTL: 3600
```

### 3. Проверка SSL сертификата
После настройки DNS Firebase автоматически:
- ✅ Проверит владение доменом
- ✅ Выдаст SSL сертификат
- ✅ Настроит HTTPS редирект

### 4. Время активации
- DNS изменения: 24-48 часов
- SSL сертификат: 24-72 часа
- Общее время: до 3 дней

## 🚀 Альтернативный способ через CLI

### Добавление домена через Firebase CLI:
```bash
# Добавить кастомный домен
firebase hosting:sites:add workclick-cz

# Проверить статус
firebase hosting:sites:get workclick-cz

# Деплой на кастомный домен
firebase deploy --only hosting:workclick-cz
```

## 📊 Мониторинг
После настройки домена проверьте:
- ✅ https://workclick.cz (основной домен)
- ✅ https://www.workclick.cz (с www)
- ✅ SSL сертификат активен
- ✅ Редирект с HTTP на HTTPS работает

## 🔍 Полезные команды
```bash
# Проверить статус деплоя
firebase hosting:sites:list

# Посмотреть логи
firebase hosting:releases:list

# Проверить конфигурацию
firebase hosting:sites:get workclick-cz
```

## 📞 Поддержка
- Firebase Console: https://console.firebase.google.com/project/workincz-759c7
- Firebase Docs: https://firebase.google.com/docs/hosting/custom-domain
- Статус проекта: Активный деплой ✅ 