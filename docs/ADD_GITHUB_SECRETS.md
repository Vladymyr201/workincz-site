# Добавление необходимых секретов в GitHub Actions

В этом документе приведены пошаговые инструкции по добавлению всех необходимых секретов для работы GitHub Actions workflows в проекте WorkInCZ.

## Необходимые секреты

### 1. FIREBASE_TOKEN

**Описание:** Токен для аутентификации Firebase CLI в CI/CD.

**Значение:** 
```
[Вставьте сюда токен, полученный командой firebase login:ci]
```

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `FIREBASE_TOKEN`
6. В поле "Secret" вставьте значение токена
7. Нажмите "Add secret"

### 2. GCP_PROJECT_ID

**Описание:** ID проекта Google Cloud.

**Значение:**
```
workincz-759c7
```

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `GCP_PROJECT_ID`
6. В поле "Secret" вставьте значение ID проекта
7. Нажмите "Add secret"

### 3. GCS_BUCKET

**Описание:** Имя бакета Google Cloud Storage для хранения бэкапов.

**Рекомендуемое значение:**
```
workincz-backups
```

**Примечание:** Если бакет не существует, его необходимо создать в Google Cloud Console.

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `GCS_BUCKET`
6. В поле "Secret" вставьте имя бакета
7. Нажмите "Add secret"

### 4. GCP_SA_KEY

**Описание:** Ключ сервисного аккаунта Google Cloud в формате JSON.

**Как получить:**
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/) → IAM & Admin → Service Accounts
2. Создайте новый сервисный аккаунт с именем `github-actions-firestore-backup`
3. Добавьте следующие роли:
   - Cloud Datastore Import Export Admin (`roles/datastore.importExportAdmin`)
   - Storage Object Admin (`roles/storage.objectAdmin`)
4. Перейдите в Keys → Add Key → Create new key → JSON
5. Скачайте и сохраните JSON файл

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `GCP_SA_KEY`
6. В поле "Secret" вставьте полное содержимое JSON файла
7. Нажмите "Add secret"

### 5. GCP_SA_EMAIL

**Описание:** Email сервисного аккаунта Google Cloud.

**Как получить:** В файле ключа сервисного аккаунта (JSON) найдите значение поля `client_email`.

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `GCP_SA_EMAIL`
6. В поле "Secret" вставьте email сервисного аккаунта
7. Нажмите "Add secret"

### 6. SLACK_WEBHOOK_URL (опционально)

**Описание:** URL для отправки уведомлений в Slack.

**Как получить:**
1. В настройках Slack создайте новое приложение
2. Активируйте Incoming Webhooks
3. Создайте новый webhook для канала и скопируйте URL

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `SLACK_WEBHOOK_URL`
6. В поле "Secret" вставьте URL webhook
7. Нажмите "Add secret"

### 7. BACKUP_ENCRYPTION_KEY (опционально)

**Описание:** Ключ для шифрования бэкапов Firestore.

**Как создать:**
```bash
# В Linux/macOS
openssl rand -base64 32

# В Windows PowerShell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Как добавить:**
1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Settings"
3. В боковом меню выберите "Secrets and variables" → "Actions"
4. Нажмите "New repository secret"
5. В поле "Name" введите `BACKUP_ENCRYPTION_KEY`
6. В поле "Secret" вставьте сгенерированный ключ
7. Нажмите "Add secret"

## Проверка настройки секретов

После добавления всех необходимых секретов, запустите workflow `firestore-backup` вручную:

1. Перейдите в репозиторий на GitHub
2. Нажмите на вкладку "Actions"
3. В боковом меню выберите "Firestore Backup"
4. Нажмите "Run workflow" → "Run workflow"
5. Дождитесь завершения workflow и проверьте результаты

## Дополнительные рекомендации

1. **Регулярно обновляйте секреты** - рекомендуется ротация секретов каждые 30-90 дней.
2. **Ограничивайте доступ к секретам** - предоставляйте доступ только тем, кому это необходимо.
3. **Используйте принцип наименьших привилегий** - предоставляйте минимально необходимые права для выполнения задач.
4. **Рассмотрите возможность использования OpenID Connect** - для более безопасной аутентификации в облачных сервисах.