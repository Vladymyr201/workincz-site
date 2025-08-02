# Шаблон секретов для GitHub Actions

Этот документ содержит список всех необходимых секретов для GitHub Actions workflows в проекте WorkInCZ. Используйте его как руководство при настройке CI/CD и автоматизации.

## Общие секреты

| Секрет | Описание | Используется в |
|--------|----------|--------------|
| `GITHUB_TOKEN` | Автоматически предоставляется GitHub | Все workflows |
| `FIREBASE_TOKEN` | Токен Firebase CLI для CI/CD | firebase-deploy.yml, secure-deploy.yml |
| `VERCEL_TOKEN` | Токен Vercel для деплоя | deploy.yml |

## Firebase и Google Cloud секреты

| Секрет | Описание | Используется в |
|--------|----------|--------------|
| `GCP_PROJECT_ID` | ID проекта Google Cloud | firestore-backup.yml, firebase-deploy.yml |
| `GCP_SA_KEY` | Ключ сервисного аккаунта Google Cloud (base64) | firestore-backup.yml, ci-cd-pipeline.yml |
| `GCP_SA_EMAIL` | Email сервисного аккаунта | firestore-backup.yml |
| `GCS_BUCKET` | Имя бакета Google Cloud Storage | firestore-backup.yml |
| `FIREBASE_PROJECT_ID` | ID проекта Firebase | firebase-deploy.yml |
| `FIREBASE_SERVICE_ACCOUNT` | Ключ сервисного аккаунта Firebase | firebase-deploy.yml |

## Уведомления и коммуникация

| Секрет | Описание | Используется в |
|--------|----------|--------------|
| `SLACK_WEBHOOK_URL` | Webhook URL для уведомлений в Slack | firestore-backup.yml, ci-cd-pipeline.yml |
| `DISCORD_WEBHOOK` | Webhook URL для уведомлений в Discord | security-scan.yml |
| `TELEGRAM_BOT_TOKEN` | Токен бота Telegram | mcp-automation.yml |
| `TELEGRAM_CHAT_ID` | ID чата Telegram для уведомлений | mcp-automation.yml |

## Безопасность

| Секрет | Описание | Используется в |
|--------|----------|--------------|
| `BACKUP_ENCRYPTION_KEY` | Ключ шифрования для резервных копий | firestore-backup.yml |
| `SONAR_TOKEN` | Токен для SonarCloud | security-scan.yml |
| `SENTRY_AUTH_TOKEN` | Токен для Sentry | ci-cd-pipeline.yml |
| `NPM_TOKEN` | Токен для npm registry | ci-cd-pipeline.yml |

## Тестирование и мониторинг

| Секрет | Описание | Используется в |
|--------|----------|--------------|
| `PLAYWRIGHT_KEY` | API ключ для Playwright | performance-test.yml |
| `CYPRESS_KEY` | API ключ для Cypress | ci-cd.yml |
| `DATADOG_API_KEY` | API ключ для Datadog | ci-cd-pipeline.yml |
| `NEW_RELIC_API_KEY` | API ключ для New Relic | performance-test.yml |

## Как добавить секреты в GitHub

1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковой панели выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. Введите имя и значение секрета
6. Нажмите "Add secret"

## Как генерировать секреты

### Firebase Token

```bash
firebase login:ci
```

### GCP Service Account Key (base64)

```bash
cat path_to_key.json | base64 -w 0
```

### Vercel Token

Создайте токен в настройках аккаунта Vercel:
1. Перейдите на https://vercel.com/account/tokens
2. Нажмите "Create"
3. Укажите название и срок действия токена
4. Скопируйте токен после создания

## Проверка секретов

Для проверки наличия всех необходимых секретов используйте команду:

```bash
node scripts/check-github-secrets.js
```

Скрипт проверит наличие всех секретов, необходимых для работы workflows.