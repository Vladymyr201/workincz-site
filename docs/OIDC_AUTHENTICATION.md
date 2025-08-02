# Настройка OpenID Connect (OIDC) для GitHub Actions

## Что такое OpenID Connect (OIDC)?

OpenID Connect (OIDC) позволяет GitHub Actions аутентифицироваться напрямую в облачных сервисах без необходимости хранить долгоживущие секреты в GitHub. Вместо этого, GitHub генерирует короткоживущие токены для каждого запуска workflow.

## Преимущества OIDC

1. **Безопасность**: Не нужно хранить долгоживущие учетные данные в GitHub
2. **Автоматическая ротация**: Токены генерируются автоматически для каждого запуска workflow
3. **Детальный контроль**: Можно ограничить доступ по репозиторию, ветке или окружению
4. **Аудит**: Лучшая отслеживаемость использования учетных данных

## Настройка OIDC для Google Cloud

### 1. Создание Workload Identity Pool и Provider

```bash
# Создание Workload Identity Pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Получение ID пула
POOL_ID=$(gcloud iam workload-identity-pools describe "github-actions-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)")

# Создание Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### 2. Настройка IAM политик

```bash
# Создание сервисного аккаунта
gcloud iam service-accounts create "github-actions-sa" \
  --project="${PROJECT_ID}" \
  --display-name="GitHub Actions Service Account"

# Добавление необходимых ролей сервисному аккаунту
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.importExportAdmin"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Привязка сервисного аккаунта к Workload Identity
gcloud iam service-accounts add-iam-policy-binding "github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/Vladymyr201/workincz-site"
```

### 3. Обновление GitHub Actions Workflow

```yaml
name: Firestore Backup with OIDC

on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write' # Необходимо для аутентификации через OIDC

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: 'Authenticate to Google Cloud'
        id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider'
          service_account: 'github-actions-sa@your-project-id.iam.gserviceaccount.com'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'

      # Остальные шаги workflow...
```

## Настройка OIDC для AWS

### 1. Создание Identity Provider в AWS

1. Перейдите в IAM консоль AWS
2. Выберите "Identity providers" > "Add provider"
3. Выберите "OpenID Connect"
4. Введите URL провайдера: `https://token.actions.githubusercontent.com`
5. Введите Audience: `sts.amazonaws.com`
6. Нажмите "Add provider"

### 2. Создание роли IAM

1. Перейдите в IAM консоль AWS > "Roles" > "Create role"
2. Выберите "Web identity"
3. Выберите провайдер: `token.actions.githubusercontent.com`
4. Выберите Audience: `sts.amazonaws.com`
5. Добавьте условие для ограничения доступа:
   - Condition: `StringLike`
   - Key: `token.actions.githubusercontent.com:sub`
   - Value: `repo:Vladymyr201/workincz-site:*`
6. Добавьте необходимые политики (например, `AmazonS3FullAccess`)
7. Назовите роль (например, `GitHubActionsRole`)

### 3. Обновление GitHub Actions Workflow

```yaml
name: AWS Workflow with OIDC

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Необходимо для аутентификации через OIDC
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1

      # Остальные шаги workflow...
```

## Настройка OIDC для Firebase

К сожалению, Firebase CLI пока не поддерживает аутентификацию через OIDC напрямую. Однако, вы можете использовать OIDC для аутентификации в Google Cloud, а затем использовать gcloud для получения токена Firebase:

```yaml
name: Firebase Deploy with OIDC

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: 'Authenticate to Google Cloud'
        id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider'
          service_account: 'github-actions-sa@your-project-id.iam.gserviceaccount.com'
          token_format: 'access_token'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'

      - name: 'Get Firebase token'
        id: firebase-token
        run: |
          TOKEN=$(gcloud auth print-access-token)
          echo "::add-mask::$TOKEN"
          echo "FIREBASE_TOKEN=$TOKEN" >> $GITHUB_ENV

      - name: 'Deploy to Firebase'
        run: |
          npm install -g firebase-tools
          firebase deploy --token "${{ env.FIREBASE_TOKEN }}" --project your-project-id
```

## Заключение

Использование OIDC для аутентификации в облачных сервисах значительно повышает безопасность вашего CI/CD процесса. Это устраняет необходимость хранить долгоживущие секреты в GitHub и обеспечивает более детальный контроль над доступом.