# 🌐 Настройка кастомного домена workclick.cz

## 📋 Текущее состояние

✅ **Firebase проект**: workincz-759c7  
✅ **Сайт создан**: workclick-cz  
✅ **Временный URL**: https://workclick-cz.web.app  
✅ **Домен**: workclick.cz (Vedos)  

## 🔧 Настройка DNS в Vedos

### Шаг 1: Войдите в панель Vedos
1. Перейдите на https://www.vedos.cz
2. Войдите в свой аккаунт
3. Найдите домен `workclick.cz`

### Шаг 2: Настройте DNS записи

Добавьте следующие записи:

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | @ | 151.101.1.195 | 3600 |
| A | @ | 151.101.65.195 | 3600 |
| CNAME | www | workclick-cz.web.app | 3600 |

### Шаг 3: Добавьте домен в Firebase Console

1. Перейдите в [Firebase Console](https://console.firebase.google.com/project/workincz-759c7/hosting)
2. Выберите сайт `workclick-cz`
3. Нажмите "Add custom domain"
4. Введите `workclick.cz`
5. Следуйте инструкциям по верификации

## 🚀 Команды для деплоя

```bash
# Деплой на staging (workincz-759c7.web.app)
npm run deploy

# Деплой на production (workclick.cz)
npm run deploy:production

# Деплой на все сайты
npm run deploy:all
```

## 🔍 Проверка настройки

После настройки DNS проверьте:

1. **DNS Propagation**: https://www.whatsmydns.net/
2. **SSL Certificate**: https://www.ssllabs.com/ssltest/
3. **Site Performance**: https://pagespeed.web.dev/

## 📊 Мониторинг

- **Firebase Console**: https://console.firebase.google.com/project/workincz-759c7/hosting
- **Analytics**: https://analytics.google.com/
- **Search Console**: https://search.google.com/search-console

## 🛠️ Устранение проблем

### Если домен не работает:
1. Проверьте DNS записи в Vedos
2. Подождите 24-48 часов для распространения DNS
3. Проверьте статус в Firebase Console

### Если SSL не работает:
1. Убедитесь, что DNS настроен правильно
2. Подождите до 24 часов для выпуска сертификата
3. Проверьте в Firebase Console статус SSL

## 📈 Преимущества Firebase Hosting

- ⚡ **Быстрая загрузка** для европейских пользователей
- 🔒 **Автоматический SSL** сертификат
- 📊 **Встроенная аналитика** Google Analytics
- 🔍 **SEO оптимизация** с Google Search Console
- 🧪 **A/B тестирование** возможности
- 🌍 **CDN** по всему миру

## 🎯 Следующие шаги

1. ✅ Настроить DNS в Vedos
2. ✅ Добавить домен в Firebase Console
3. 🔄 Настроить Google Analytics
4. 🔄 Настроить Google Search Console
5. 🔄 Настроить email на домене
6. 🔄 Настроить мониторинг

---

**Статус**: 🟡 Ожидает настройки DNS в Vedos 