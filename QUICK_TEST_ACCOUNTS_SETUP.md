# 🚀 БЫСТРАЯ НАСТРОЙКА ТЕСТОВЫХ АККАУНТОВ

## ⚡ Создание через Firebase Console (5 минут)

### 1. 🔐 Создание пользователей в Authentication

1. **Откройте Firebase Console:**
   ```
   https://console.firebase.google.com/project/workincz-759c7/authentication/users
   ```

2. **Создайте 4 тестовых аккаунта:**
   - Нажмите "Add User"
   - Введите данные:

   | Email | Пароль | Display Name |
   |-------|--------|--------------|
   | `test-candidate@workclick.cz` | `test1234` | Тестовый Соискатель |
   | `test-employer@workclick.cz` | `test1234` | Тестовый Работодатель |
   | `test-agency@workclick.cz` | `test1234` | Тестовое Агентство |
   | `test-admin@workclick.cz` | `test1234` | Тестовый Админ |

3. **Включите Email verification** для всех аккаунтов

### 2. 📊 Создание профилей в Firestore

1. **Откройте Firestore:**
   ```
   https://console.firebase.google.com/project/workincz-759c7/firestore
   ```

2. **Создайте коллекцию `users`**

3. **Добавьте документы для каждого пользователя:**

#### Соискатель (test-candidate@workclick.cz)
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
  "availability": "Немедленно",
  "createdAt": "2025-01-28T10:00:00Z",
  "updatedAt": "2025-01-28T10:00:00Z"
}
```

#### Работодатель (test-employer@workclick.cz)
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
  "subscriptionPlan": "premium",
  "createdAt": "2025-01-28T10:00:00Z",
  "updatedAt": "2025-01-28T10:00:00Z"
}
```

#### Агентство (test-agency@workclick.cz)
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
  "subscriptionPlan": "premium",
  "createdAt": "2025-01-28T10:00:00Z",
  "updatedAt": "2025-01-28T10:00:00Z"
}
```

#### Админ (test-admin@workclick.cz)
```json
{
  "role": "admin",
  "firstName": "Админ",
  "lastName": "Системный",
  "phone": "+420111222333",
  "permissions": ["all"],
  "isSuperAdmin": true,
  "createdAt": "2025-01-28T10:00:00Z",
  "updatedAt": "2025-01-28T10:00:00Z"
}
```

### 3. 🎯 Тестирование

1. **Откройте тестовую страницу:**
   ```
   https://workclick.cz/test-role-switcher.html
   ```

2. **Используйте переключатель ролей:**
   - Нажмите кнопку 🎭 в левом нижнем углу
   - Выберите роль для переключения
   - Система автоматически войдёт и перенаправит

### 4. ✅ Проверка

Проверьте, что:
- ✅ Все 4 аккаунта созданы в Authentication
- ✅ Все 4 профиля созданы в Firestore
- ✅ Role Switcher работает на странице
- ✅ Переключение между ролями работает
- ✅ Перенаправление на дашборды работает

## 🎉 Готово!

Теперь у вас есть полноценная система тестовых аккаунтов для удобного тестирования функционала между разными ролями!