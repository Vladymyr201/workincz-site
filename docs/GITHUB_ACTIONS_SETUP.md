# Настройка GitHub Actions для автоматического деплоя на Firebase

## 🚀 Обзор

Этот проект настроен для автоматического деплоя на Firebase через GitHub Actions. Система включает:

- ✅ **Автоматический деплой** при push в main/master ветку
- ✅ **Staging деплой** для pull requests
- ✅ **Ручной деплой** с выбором окружения
- ✅ **Проверка безопасности** кода и зависимостей
- ✅ **Тестирование** перед деплоем
- ✅ **Уведомления** о статусе деплоя

## 📋 Требования

1. **GitHub репозиторий** с кодом проекта
2. **Firebase проект** (production и staging)
3. **Firebase CLI** токен для деплоя
4. **Node.js 18+** для сборки

## 🔧 Настройка Firebase

### 1. Создание Firebase проектов

```bash
# Создание production проекта
firebase projects:create workincz-site

# Создание staging проекта
firebase projects:create workincz-site-staging
```

### 2. Инициализация Firebase в проекте

```bash
# Инициализация для production
firebase use workincz-site

# Инициализация для staging
firebase use workincz-site-staging
```

### 3. Получение Firebase токена

```bash
# Авторизация в Firebase
firebase login

# Получение токена для CI/CD
firebase login:ci
```

## 🔐 Настройка GitHub Secrets

Добавьте следующие секреты в настройках репозитория:

### Обязательные секреты:

1. **FIREBASE_TOKEN** - токен Firebase для деплоя
   - Получить: `firebase login:ci`
   - Формат: длинная строка токена

2. **FIREBASE_PROJECT_ID** - ID production проекта
   - Значение: `workincz-759c7`

3. **FIREBASE_STAGING_PROJECT_ID** - ID staging проекта
   - Значение: `workincz-759c7-staging`

### Как добавить секреты:

1. Перейдите в репозиторий на GitHub
2. Нажмите **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте каждый секрет с соответствующим именем и значением

## 📁 Структура файлов

```
.github/
├── workflows/
│   ├── deploy.yml              # Основной workflow деплоя
│   ├── manual-deploy.yml       # Ручной деплой
│   └── security-check.yml      # Проверка безопасности
├── firebase.json               # Конфигурация Firebase
├── .firebaserc                 # Настройки проектов Firebase
├── package.json                # Скрипты и зависимости
└── .gitignore                  # Исключения из Git
```

## 🔄 Workflows

### 1. Основной деплой (`deploy.yml`)

**Триггеры:**
- Push в main/master ветку
- Pull request в main/master ветку

**Этапы:**
1. **Test** - тестирование и линтинг
2. **Deploy** - деплой на production (только для main/master)
3. **Deploy Staging** - деплой на staging (для PR)

### 2. Ручной деплой (`manual-deploy.yml`)

**Триггеры:**
- Ручной запуск через GitHub Actions

**Опции:**
- Выбор окружения (staging/production)
- Пропуск тестов (force deploy)

### 3. Проверка безопасности (`security-check.yml`)

**Триггеры:**
- Push в main/master ветку
- Pull request в main/master ветку
- Еженедельно по понедельникам

**Проверки:**
- npm audit
- CodeQL анализ
- Проверка уязвимостей

## 🚀 Команды для локальной разработки

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Локальная разработка
npm run dev

# Сборка проекта
npm run build

# Деплой на staging
npm run deploy:staging

# Деплой на production
npm run deploy:production
```

## 📊 Мониторинг деплоев

### GitHub Actions Dashboard
- Перейдите в **Actions** в репозитории
- Просматривайте статус всех workflow
- Проверяйте логи выполнения

### Firebase Console
- **Production**: https://console.firebase.google.com/project/workincz-759c7
- **Staging**: https://console.firebase.google.com/project/workincz-759c7-staging

### URL деплоев
- **Production**: https://workincz-759c7.web.app
- **Staging**: https://workincz-759c7-staging.web.app

## 🔧 Устранение неполадок

### Ошибка деплоя
1. Проверьте правильность Firebase токена
2. Убедитесь, что проект существует в Firebase
3. Проверьте права доступа к проекту

### Ошибка тестов
1. Проверьте логи в GitHub Actions
2. Убедитесь, что все зависимости установлены
3. Проверьте конфигурацию тестов

### Ошибка безопасности
1. Обновите зависимости с уязвимостями
2. Проверьте код на потенциальные проблемы
3. Рассмотрите использование `npm audit fix`

## 📈 Расширенные возможности

### Добавление уведомлений
Можно добавить уведомления в Slack, Discord или email:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Добавление мониторинга
Интеграция с внешними сервисами мониторинга:

```yaml
- name: Ping monitoring service
  run: |
    curl -X POST ${{ secrets.MONITORING_URL }} \
      -H "Content-Type: application/json" \
      -d '{"status":"deployed"}'
```

### Добавление резервного копирования
Автоматическое создание резервных копий перед деплоем:

```yaml
- name: Backup current deployment
  run: |
    firebase hosting:clone live:backup-${{ github.sha }}
```

## 🎯 Лучшие практики

1. **Всегда тестируйте** перед деплоем
2. **Используйте staging** для проверки изменений
3. **Мониторьте логи** деплоев
4. **Регулярно обновляйте** зависимости
5. **Проверяйте безопасность** кода
6. **Документируйте** изменения
7. **Используйте семантические** коммиты

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в GitHub Actions
2. Убедитесь в правильности конфигурации
3. Проверьте статус Firebase сервисов
4. Обратитесь к документации Firebase

---

**Готово!** 🎉 Ваш проект настроен для автоматического деплоя на Firebase через GitHub Actions. 