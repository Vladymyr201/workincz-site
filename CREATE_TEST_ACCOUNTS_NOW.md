# 🚀 СОЗДАЙТЕ ТЕСТОВЫЕ АККАУНТЫ ПРЯМО СЕЙЧАС

## ⚡ Быстрые шаги (5 минут)

### 1. 🔐 Создание пользователей в Authentication

**Откройте:** https://console.firebase.google.com/project/workincz-759c7/authentication/users

**Создайте 4 аккаунта:**

1. **Нажмите "Add User"**
2. **Введите данные:**

| Email | Пароль | Display Name |
|-------|--------|--------------|
| `test-candidate@workclick.cz` | `test1234` | Тестовый Соискатель |
| `test-employer@workclick.cz` | `test1234` | Тестовый Работодатель |
| `test-agency@workclick.cz` | `test1234` | Тестовое Агентство |
| `test-admin@workclick.cz` | `test1234` | Тестовый Админ |

3. **Включите "Email verified"** для всех

### 2. 📊 Создание профилей в Firestore

**Откройте:** https://console.firebase.google.com/project/workincz-759c7/firestore

**Создайте коллекцию `users` и добавьте документы:**

#### Для каждого пользователя:
1. **Нажмите "Start collection"** (если коллекции нет)
2. **Collection ID:** `users`
3. **Document ID:** используйте UID из Authentication
4. **Добавьте поля:**

**Соискатель:**
```json
{
  "role": "candidate",
  "firstName": "Иван",
  "lastName": "Петров",
  "phone": "+420123456789",
  "location": "Прага",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": "3 года",
  "education": "Высшее техническое",
  "languages": ["Русский", "Чешский", "Английский"],
  "visaStatus": "Рабочая виза",
  "salaryExpectation": "45000 CZK",
  "availability": "Немедленно"
}
```

**Работодатель:**
```json
{
  "role": "employer",
  "companyName": "TechCorp s.r.o.",
  "firstName": "Анна",
  "lastName": "Новакова",
  "phone": "+420987654321",
  "location": "Прага",
  "industry": "IT и разработка",
  "companySize": "50-100 сотрудников",
  "website": "https://techcorp.cz",
  "description": "Инновационная IT компания",
  "verificationStatus": "verified",
  "subscriptionPlan": "premium"
}
```

**Агентство:**
```json
{
  "role": "agency",
  "companyName": "WorkBridge Agency s.r.o.",
  "firstName": "Петр",
  "lastName": "Смирнов",
  "phone": "+420555666777",
  "location": "Брно",
  "industry": "Рекрутинг и HR",
  "companySize": "10-25 сотрудников",
  "website": "https://workbridge.cz",
  "description": "Профессиональное агентство по трудоустройству",
  "licenseNumber": "CZ123456789",
  "verificationStatus": "verified",
  "subscriptionPlan": "premium"
}
```

**Админ:**
```json
{
  "role": "admin",
  "firstName": "Админ",
  "lastName": "Системный",
  "phone": "+420111222333",
  "permissions": ["all"],
  "isSuperAdmin": true
}
```

### 3. 🎯 Тестирование

**Откройте:** https://workclick-cz.web.app/test-role-switcher.html

**Используйте переключатель ролей:**
1. Нажмите кнопку 🎭 в левом нижнем углу
2. Выберите роль для переключения
3. Система автоматически войдёт и перенаправит

## ✅ Проверка

После создания проверьте:
- ✅ Все 4 аккаунта в Authentication
- ✅ Все 4 профиля в Firestore
- ✅ Role Switcher работает
- ✅ Переключение между ролями работает

## 🎉 Готово!

Теперь у вас есть полноценная система тестовых аккаунтов!