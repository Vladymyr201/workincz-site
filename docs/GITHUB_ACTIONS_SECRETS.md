# Настройка секретов для GitHub Actions

В этом документе описаны все необходимые секреты, которые должны быть настроены для корректной работы GitHub Actions workflows проекта.

## Необходимые секреты для Firestore Backup

### GCP_PROJECT_ID

**Описание:** ID проекта Google Cloud.

**Где получить:** В консоли Google Cloud или Firebase, это идентификатор вашего проекта, например `workincz-759c7`.

### GCP_SA_KEY

**Описание:** Ключ сервисного аккаунта Google Cloud в формате JSON.

**Как создать:**
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/) > IAM & Admin > Service Accounts
2. Создайте новый сервисный аккаунт или выберите существующий
3. Добавьте следующие роли:
   - Cloud Datastore Import Export Admin (`roles/datastore.importExportAdmin`)
   - Storage Object Admin (`roles/storage.objectAdmin`)
4. Перейдите в Keys > Add Key > Create new key > JSON
5. Скачайте и сохраните JSON файл
6. Добавьте полное содержимое JSON файла как секрет

### GCS_BUCKET

**Описание:** Имя бакета Google Cloud Storage для хранения бэкапов.

**Где получить:** Имя вашего бакета в Google Cloud Storage, например `workincz-backups`.

**Важно:** Сервисный аккаунт (GCP_SA_KEY) должен иметь доступ к этому бакету.

### SLACK_WEBHOOK_URL (опционально)

**Описание:** URL для отправки уведомлений в Slack.

**Как получить:**
1. В настройках Slack создайте новое приложение
2. Активируйте Incoming Webhooks
3. Создайте новый webhook для канала и скопируйте URL

### BACKUP_ENCRYPTION_KEY (опционально)

**Описание:** Ключ для шифрования бэкапов Firestore.

**Рекомендации:** Используйте надежный пароль длиной не менее 16 символов.

## Другие секреты проекта

### FIREBASE_TOKEN

**Описание:** Токен для аутентификации Firebase CLI в CI/CD.

**Как получить:**
1. Запустите локально `firebase login:ci`
2. Скопируйте полученный токен

### GCP_SA_EMAIL

**Описание:** Email сервисного аккаунта Google Cloud.

**Где найти:** В файле ключа сервисного аккаунта (JSON) в поле `client_email`.

## Добавление секретов в GitHub

1. Перейдите в репозиторий на GitHub
2. Settings > Secrets and variables > Actions
3. Нажмите "New repository secret"
4. Введите имя секрета и его значение
5. Нажмите "Add secret"

## Проверка настройки секретов

Для проверки наличия всех необходимых секретов выполните workflow `firestore-backup` вручную и проверьте логи на наличие ошибок, связанных с отсутствующими секретами.