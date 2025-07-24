# 🔐 Настройка секретов в GitHub

## ⚡ Быстрая настройка секретов

### 1. Перейдите в настройки репозитория
1. Откройте ваш репозиторий на GitHub
2. Нажмите **Settings** (вкладка)
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

### 2. Добавьте следующие секреты:

#### FIREBASE_TOKEN
- **Name**: `FIREBASE_TOKEN`
- **Value**: (получите через `firebase login:ci`)
- **Description**: Firebase CI/CD токен

#### FIREBASE_PROJECT_ID
- **Name**: `FIREBASE_PROJECT_ID`
- **Value**: `workincz-759c7`
- **Description**: ID production Firebase проекта

#### FIREBASE_STAGING_PROJECT_ID
- **Name**: `FIREBASE_STAGING_PROJECT_ID`
- **Value**: `workincz-759c7-staging`
- **Description**: ID staging Firebase проекта

### 3. Проверка секретов
После добавления секретов:
- Они будут скрыты звездочками (****)
- Нельзя будет их просмотреть (только обновить)
- GitHub Actions сможет их использовать

## 🚀 Запуск автоматического деплоя

После настройки секретов:

```bash
# Push в main ветку запустит автоматический деплой
git push origin main
```

## 📊 Мониторинг

- **GitHub Actions**: https://github.com/[username]/workincz-site/actions
- **Production сайт**: https://workincz-759c7.web.app
- **Firebase Console**: https://console.firebase.google.com/project/workincz-759c7

## 🔧 Если токен истек

Если токен истек, получите новый:

```bash
firebase login:ci
```

И обновите секрет `FIREBASE_TOKEN` в GitHub.

---

**Готово!** 🎉 После настройки секретов ваш проект будет автоматически деплоиться при каждом push в main ветку. 