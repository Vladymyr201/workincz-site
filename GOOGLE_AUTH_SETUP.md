# GOOGLE_AUTH_SETUP.md

## 🔧 **Настройка Google Auth в Firebase Console**

**Проблема:** Google Auth не включен в проекте Firebase, поэтому вход через Google не работает.

---

## 📋 **Пошаговая инструкция**

### 1. **Откройте Firebase Console**
Перейдите на: https://console.firebase.google.com/project/workincz-759c7

### 2. **Перейдите в Authentication**
- В левом меню нажмите "Authentication"
- Перейдите на вкладку "Sign-in method"

### 3. **Включите Google Auth**
- Найдите "Google" в списке провайдеров
- Нажмите на "Google"
- Переключите тумблер "Enable" в положение "ON"
- Введите "Project support email" (ваш email)
- Нажмите "Save"

### 4. **Настройте OAuth consent screen (если нужно)**
- Перейдите в Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Выберите проект "workincz-759c7"
- Перейдите в "OAuth consent screen"
- Настройте приложение (если не настроено)

### 5. **Проверьте настройки**
После включения Google Auth:
- Вернитесь в Firebase Console
- В Authentication > Sign-in method должен быть включен Google
- Статус должен быть "Enabled"

---

## 🧪 **Тестирование**

После настройки Google Auth:

1. **Откройте тестовую страницу:**
   - https://workclick-cz.web.app/simple-test.html
   - https://workclick-cz.web.app/test-auth.html

2. **Нажмите "Войти через Google"**

3. **Должно открыться окно выбора Google аккаунта**

4. **После входа вы должны увидеть информацию о пользователе**

---

## ❌ **Возможные проблемы**

### Проблема: "popup_closed_by_user"
**Решение:** Проверьте, что popup не блокируется браузером

### Проблема: "auth/unauthorized-domain"
**Решение:** Добавьте домен в Firebase Console:
- Authentication > Settings > Authorized domains
- Добавьте: `workclick-cz.web.app`

### Проблема: "auth/operation-not-allowed"
**Решение:** Google Auth не включен в Firebase Console

---

## 📞 **Если не работает**

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что Google Auth включен в Firebase Console
3. Проверьте, что домен добавлен в authorized domains
4. Попробуйте в режиме инкогнито

---

## ✅ **После успешной настройки**

Google Auth будет работать на всех страницах:
- https://workclick-cz.web.app/ (вход)
- https://workclick-cz.web.app/dashboard.html (защищённая страница)