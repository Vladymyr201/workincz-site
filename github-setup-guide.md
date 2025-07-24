# 🐙 ПОШАГОВАЯ НАСТРОЙКА GITHUB

## Шаг 1: Получение GitHub Personal Access Token

### 1.1 Перейдите на GitHub Settings
- Откройте: https://github.com/settings/tokens
- Войдите в свой аккаунт GitHub

### 1.2 Создайте новый токен
- Нажмите "Generate new token (classic)"
- Выберите "Generate new token (classic)"

### 1.3 Настройте права доступа
Выберите следующие права:
- ✅ `repo` - Полный доступ к репозиториям
- ✅ `workflow` - Управление GitHub Actions
- ✅ `admin:org` - Управление организациями (если нужно)

### 1.4 Создайте токен
- Нажмите "Generate token"
- **ВАЖНО:** Скопируйте токен сразу! Он больше не будет показан

### 1.5 Сохраните токен
Скопируйте токен в безопасное место. Он понадобится для настройки GitHub Secrets.

---

## Шаг 2: Создание GitHub репозитория

### 2.1 Создайте новый репозиторий
- Перейдите на: https://github.com/new
- Repository name: `workincz-site`
- Description: `WorkInCZ - платформа поиска работы для мигрантов в Чехии`
- Выберите: Public или Private
- **НЕ** ставьте галочки на README, .gitignore, license
- Нажмите "Create repository"

### 2.2 Скопируйте URL репозитория
После создания вы увидите URL вида:
```
https://github.com/[ваш-username]/workincz-site.git
```

---

## Шаг 3: Настройка локального Git

### 3.1 Инициализируйте Git (если еще не сделано)
```bash
git init
```

### 3.2 Добавьте remote
```bash
git remote add origin https://github.com/[ваш-username]/workincz-site.git
```

### 3.3 Проверьте remote
```bash
git remote -v
```

---

## Шаг 4: Настройка GitHub Secrets

### 4.1 Перейдите в Settings репозитория
- Откройте ваш репозиторий на GitHub
- Перейдите в Settings > Secrets and variables > Actions

### 4.2 Добавьте FIREBASE_TOKEN
- Нажмите "New repository secret"
- Name: `FIREBASE_TOKEN`
- Value: `[ВАШ_FIREBASE_TOKEN]`
- Нажмите "Add secret"

### 4.3 Добавьте GITHUB_TOKEN
- Нажмите "New repository secret"
- Name: `GITHUB_TOKEN`
- Value: `[ваш GitHub Personal Access Token]`
- Нажмите "Add secret"

---

## Шаг 5: Первый коммит и push

### 5.1 Добавьте все файлы
```bash
git add .
```

### 5.2 Создайте первый коммит
```bash
git commit -m "Initial setup with Firebase and GitHub integration"
```

### 5.3 Переименуйте ветку в main (если нужно)
```bash
git branch -M main
```

### 5.4 Отправьте в GitHub
```bash
git push -u origin main
```

---

## Шаг 6: Проверка настройки

### 6.1 Проверьте GitHub Actions
- Перейдите в ваш репозиторий на GitHub
- Нажмите на вкладку "Actions"
- Вы должны увидеть запущенный workflow "CI/CD Pipeline"

### 6.2 Проверьте Secrets
- Перейдите в Settings > Secrets and variables > Actions
- Убедитесь, что оба секрета добавлены:
  - ✅ FIREBASE_TOKEN
  - ✅ GITHUB_TOKEN

### 6.3 Проверьте автоматический деплой
- После успешного выполнения CI/CD pipeline
- Сайт должен автоматически обновиться на: https://workincz-759c7.web.app

---

## 🎯 РЕЗУЛЬТАТ:

После выполнения всех шагов у вас будет:
- ✅ GitHub репозиторий с кодом
- ✅ Автоматический CI/CD pipeline
- ✅ Автоматический деплой в Firebase
- ✅ Ежедневные проверки безопасности
- ✅ Ежедневные тесты производительности

---

## 🆘 ЕСЛИ ЧТО-ТО ПОШЛО НЕ ТАК:

### Проблема: "Permission denied"
**Решение:** Проверьте правильность GitHub токена

### Проблема: "Repository not found"
**Решение:** Проверьте правильность URL репозитория

### Проблема: "Workflow failed"
**Решение:** Проверьте настройку GitHub Secrets

---

**Готовы начать? Начните с Шага 1!** 🚀 