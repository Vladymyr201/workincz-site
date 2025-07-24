# 🚀 Быстрый старт GitHub Actions

## ⚡ Быстрая настройка (5 минут)

### 1. Настройка Firebase токена
```bash
# Установка Firebase CLI
npm install -g firebase-tools

# Авторизация
firebase login

# Получение токена для CI/CD
firebase login:ci
```

### 2. Добавление секретов в GitHub
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Добавьте секреты:
   - `FIREBASE_TOKEN` = токен из шага 1
   - `FIREBASE_PROJECT_ID` = `workincz-759c7`
   - `FIREBASE_STAGING_PROJECT_ID` = `workincz-759c7-staging`

### 3. Первый деплой
```bash
# Push в main ветку
git add .
git commit -m "feat: initial GitHub Actions setup"
git push origin main
```

## 🔄 Автоматический деплой

### При push в main/master:
- ✅ Запускаются тесты
- ✅ Проверяется безопасность
- ✅ Автоматический деплой на production

### При создании Pull Request:
- ✅ Запускаются тесты
- ✅ Деплой на staging
- ✅ Комментарий с ссылкой на staging

## 🎯 Ручной деплой

1. Перейдите в **Actions** в репозитории
2. Выберите **Manual Deploy**
3. Нажмите **Run workflow**
4. Выберите окружение (staging/production)
5. Нажмите **Run workflow**

## 📊 Мониторинг

- **GitHub Actions**: https://github.com/[username]/workincz-site/actions
- **Production**: https://workincz-759c7.web.app
- **Staging**: https://workincz-759c7-staging.web.app

## 🆘 Устранение проблем

### Ошибка деплоя:
```bash
# Проверка Firebase токена
firebase projects:list

# Проверка проекта
firebase use workincz-site
```

### Ошибка тестов:
```bash
# Локальный запуск тестов
npm test

# Проверка зависимостей
npm audit
```

---

**Готово!** 🎉 Ваш проект теперь автоматически деплоится на Firebase! 