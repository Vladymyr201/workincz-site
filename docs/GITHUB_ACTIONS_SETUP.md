# Настройка GitHub Actions для проекта WorkInCZ

Данное руководство поможет вам настроить GitHub Actions для автоматизации CI/CD, резервного копирования и других задач в проекте WorkInCZ.

## Диагностика проблем

Если вы видите ошибки в выполнении GitHub Actions workflow, выполните следующие шаги для диагностики:

1. Запустите скрипт диагностики:
   ```bash
   node scripts/github-actions-fix.js
   ```

   Скрипт выполнит:
   - Анализ всех workflow файлов на типичные проблемы
   - Исправление обнаруженных проблем (требуется подтверждение)
   - Создание файла с инструкциями по настройке
   - Создание шаблона секретов

2. Проверьте лог диагностики:
   ```
   github-actions-diagnostics.log
   ```

## Настройка секретов

Основная причина ошибок в GitHub Actions - отсутствие необходимых секретов. Выполните следующие шаги:

### 1. Настройка Firebase токена

```bash
node scripts/setup-firebase-token.js
```

Этот скрипт поможет вам:
- Установить Firebase CLI (если не установлен)
- Получить токен Firebase CI
- Сохранить токен в файл шаблонов секретов
- Вывести инструкции по добавлению токена в GitHub Secrets

### 2. Настройка сервисного аккаунта Google Cloud

1. Создайте сервисный аккаунт в [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Создайте ключ для сервисного аккаунта в формате JSON
3. Подготовьте ключ для GitHub Actions:
   ```bash
   node scripts/setup-gcp-service-account.js path/to/key.json
   ```

Этот скрипт поможет вам:
- Закодировать ключ в формат base64
- Извлечь email сервисного аккаунта и ID проекта
- Обновить файл шаблонов секретов
- Вывести инструкции по добавлению секретов в GitHub

### 3. Настройка бакета Google Cloud Storage

1. Создайте бакет в [Google Cloud Console](https://console.cloud.google.com/storage/browser)
2. Добавьте имя бакета как секрет `GCS_BUCKET` в GitHub

### 4. Настройка Slack webhook (опционально)

1. Создайте webhook в Slack: [Incoming Webhooks](https://api.slack.com/messaging/webhooks)
2. Добавьте URL webhook как секрет `SLACK_WEBHOOK_URL` в GitHub

## Добавление секретов в GitHub

1. Перейдите в настройки репозитория на GitHub:
   ```
   Settings → Secrets and variables → Actions
   ```

2. Для каждого секрета нажмите "New repository secret"

3. Добавьте все необходимые секреты:
   - `GCP_PROJECT_ID`
   - `GCP_SA_KEY` (закодированный в base64)
   - `GCP_SA_EMAIL`
   - `GCS_BUCKET`
   - `FIREBASE_TOKEN`
   - `FIREBASE_PROJECT_ID`
   - `SLACK_WEBHOOK_URL` (опционально)
   - `BACKUP_ENCRYPTION_KEY` (опционально)

## Проверка настройки

После добавления всех секретов:

1. Перейдите в раздел "Actions" на GitHub
2. Выберите workflow, который вы хотите запустить (например, "Firestore Backup")
3. Нажмите "Run workflow"
4. Проверьте логи выполнения для выявления возможных ошибок

## Устранение частых ошибок

### Ошибка: "Error: Failed to fetch firebase" или "Error: Unable to create backup"

**Решение**: Проверьте, что:
- Сервисный аккаунт имеет роль `datastore.importExportAdmin`
- Сервисный аккаунт имеет роль `storage.objectAdmin` для бакета
- Секрет `GCP_SA_KEY` содержит правильный закодированный ключ

### Ошибка: "Error: Firebase command failed"

**Решение**: Проверьте, что:
- Токен Firebase действителен
- У пользователя, создавшего токен, есть права на проект

### Ошибка: "Error: Bucket not found"

**Решение**: Проверьте, что:
- Бакет существует в Google Cloud Storage
- Секрет `GCS_BUCKET` содержит правильное имя бакета
- Сервисный аккаунт имеет доступ к бакету

## Дополнительные ресурсы

- [Документация GitHub Actions](https://docs.github.com/en/actions)
- [Документация Firebase CLI](https://firebase.google.com/docs/cli)
- [Google Cloud IAM](https://cloud.google.com/iam/docs)
- [Firestore Export/Import](https://firebase.google.com/docs/firestore/manage-data/export-import)