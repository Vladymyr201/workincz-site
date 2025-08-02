# Настройка деплоя Firebase в GitHub Actions

В этом руководстве описывается, как настроить автоматический деплой проекта на Firebase Hosting с использованием GitHub Actions.

## Необходимые секреты в GitHub

Для правильной работы GitHub Actions workflow необходимо настроить следующие секреты в репозитории:

### 1. FIREBASE_SERVICE_ACCOUNT

Это главный секрет, содержащий JSON с сервисным аккаунтом Google Cloud, который имеет доступ к Firebase.

#### Как получить:

1. Перейдите в [Firebase Console](https://console.firebase.google.com/) и выберите свой проект
2. Перейдите в Project Settings → Service accounts
3. Нажмите "Generate new private key" и скачайте JSON-файл
4. **Важно**: Сохраните этот файл в безопасном месте, так как его невозможно загрузить повторно

#### Как добавить в GitHub:

1. В репозитории GitHub перейдите в Settings → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Имя: `FIREBASE_SERVICE_ACCOUNT`
4. Значение: вставьте полное содержимое JSON-файла сервисного аккаунта
5. Нажмите "Add secret"

### 2. FIREBASE_PROJECT_ID

Идентификатор вашего Firebase проекта.

#### Как получить:

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. ID проекта виден в URL или в настройках проекта

#### Как добавить в GitHub:

1. В репозитории GitHub перейдите в Settings → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Имя: `FIREBASE_PROJECT_ID`
4. Значение: идентификатор проекта (например, `workincz-759c7`)
5. Нажмите "Add secret"

### 3. FIREBASE_TOKEN (Опционально)

Этот токен требуется только для старых способов деплоя, которые используют команду CLI вместо официального GitHub Action.

#### Как получить:

1. Установите Firebase CLI локально: `npm install -g firebase-tools`
2. Войдите в аккаунт: `firebase login:ci`
3. Скопируйте токен, который будет выведен в консоли

#### Как добавить в GitHub:

1. В репозитории GitHub перейдите в Settings → Secrets and variables → Actions
2. Нажмите "New repository secret"
3. Имя: `FIREBASE_TOKEN`
4. Значение: токен, полученный с помощью `firebase login:ci`
5. Нажмите "Add secret"

## Проверка настройки

После настройки всех необходимых секретов, ваш GitHub Actions workflow должен работать корректно. При каждом push в ветку `main` (или другую настроенную ветку), проект будет автоматически деплоиться на Firebase Hosting.

Вы также можете запустить деплой вручную через интерфейс GitHub Actions, выбрав workflow "Firebase Deploy" и нажав кнопку "Run workflow".

## Решение проблем

### Ошибка: "Input required and not supplied: firebaseServiceAccount"

- **Причина**: Отсутствует секрет `FIREBASE_SERVICE_ACCOUNT`
- **Решение**: Добавьте секрет, как описано выше

### Ошибка: "Error: HTTP Error: 403, The caller does not have permission"

- **Причина**: Сервисный аккаунт не имеет нужных прав для деплоя
- **Решение**: Убедитесь, что сервисный аккаунт имеет роль "Firebase Hosting Admin" и "Firebase Service Account"

### Ошибка с токеном

- **Причина**: Токен Firebase устарел или неверный
- **Решение**: Сгенерируйте новый токен с помощью команды `firebase login:ci` и обновите секрет `FIREBASE_TOKEN`