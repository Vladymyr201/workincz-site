# СХЕМА БАЗЫ ДАННЫХ FIRESTORE - WorkInCZ

## Коллекции и их структура

### 🔥 chats
Основная коллекция для хранения чатов между пользователями
```js
{
  // ID документа: "userId1_userId2" (отсортированные ID)
  participants: ["userId1", "userId2"], // Массив участников
  participantIds: ["userId1", "userId2"], // Дубликат для запросов
  createdAt: Timestamp,
  lastMessage: "Последнее сообщение...",
  lastMessageTime: Timestamp,
  lastMessageBy: "userId",
  jobId: "job_456", // ID вакансии (если чат создан из-за вакансии)
  isActive: true,
  
  // Метаданные участников (для быстрого доступа)
  participant_userId1: {
    name: "Владимир Петров",
    email: "vladimir@example.com",
    role: "worker"
  },
  participant_userId2: {
    name: "ООО Стройком",
    email: "hr@stroikom.cz",
    role: "employer"
  },
  
  // Счетчики непрочитанных сообщений
  unread_userId1: 0,
  unread_userId2: 3
}
```

### 💬 chats/{chatId}/messages
Подколлекция сообщений для каждого чата
```js
{
  content: "Здравствуйте! Меня заинтересовала ваша вакансия.",
  type: "text", // "text", "image", "file", "system"
  senderId: "userId1",
  timestamp: Timestamp,
  isRead: false,
  attachments: [], // Массив URL файлов
  edited: false,
  editedAt: null
}
```

### 🔔 notifications
Система уведомлений
```js
{
  userId: "userId1", // Кому предназначено
  type: "new_message", // "new_message", "job_application", "system"
  title: "Новое сообщение от Владимира",
  body: "Здравствуйте! Меня заинтересовала...",
  chatId: "chatId", // Связанный чат (если есть)
  senderId: "userId2", // Кто отправил (если есть)
  isRead: false,
  createdAt: Timestamp,
  metadata: {} // Дополнительные данные
}
```

### 👁 presence
Статус присутствия пользователей (онлайн/оффлайн)
```js
{
  // ID документа: userId
  isOnline: true,
  lastSeen: Timestamp,
  userId: "userId1"
}
```

### 👤 users
Основная информация о пользователях
```js
{
  name: "Владимир Петров",
  email: "vladimir@example.com",
  role: "worker", // "worker" или "employer"
  createdAt: Timestamp,
  
  // Поля для системы сообщений
  messagingEnabled: true,
  lastActiveAt: Timestamp,
  
  // Поля для верификации (этап 1 монетизации)
  verification_requested: false,
  verification_paid: false,
  verification_status: "pending", // "pending", "approved", "rejected"
  verification_requested_at: Timestamp,
  verified: false,
  
  // Поля для продвижения резюме (этап 1 монетизации)
  resume_promoted: false,
  promoted_until: Timestamp,
  promotion_purchased_at: Timestamp,
  
  // Профиль пользователя
  phone: "+420123456789",
  location: "Praha",
  experience: "2 года",
  skills: ["строительство", "водитель"],
  bio: "Опыт работы в строительстве...",
  avatar: "https://...",
  
  // Настройки уведомлений
  emailNotifications: true,
  pushNotifications: true,
  chatNotifications: true
}
```

### 💼 jobs
Вакансии с поддержкой системы сообщений
```js
{
  title: "Разнорабочий на стройку",
  company: "Stavební firma Novák",
  location: "Praha",
  salary: "130 Kč/час",
  description: "Работа на складе...",
  requirements: ["Опыт работы", "Знание чешского"],
  employerId: "employerUserId",
  createdAt: Timestamp,
  isActive: true,
  
  // Поля для монетизации
  is_featured: false, // Горячее объявление
  featured_until: Timestamp,
  featured_purchased_at: Timestamp,
  
  // Статистика для чатов
  chatCount: 5, // Количество чатов по этой вакансии
  applicationsCount: 12,
  
  // Настройки чатов
  allowDirectMessages: true,
  autoReplyEnabled: false,
  autoReplyMessage: "Спасибо за интерес к нашей вакансии..."
}
```

### 📝 job_applications
Отклики на вакансии (связано с чатами)
```js
{
  jobId: "job123",
  applicantId: "worker456",
  employerId: "employer789",
  appliedAt: Timestamp,
  status: "pending", // "pending", "accepted", "rejected", "withdrawn"
  
  // Связь с чатом
  chatId: "worker456_employer789",
  hasChat: true,
  
  // Дополнительная информация
  coverLetter: "Здравствуйте! Я заинтересован...",
  resumeUrl: "https://...",
  
  message: "Сообщение от соискателя",
  employerMessage: "Ответ работодателя"
}
```

### ✅ verification_requests
Запросы на верификацию профилей (этап 1 монетизации)
```js
{
  userId: "userId1",
  requestedAt: Timestamp,
  status: "pending", // "pending", "approved", "rejected"
  type: "profile_verification",
  
  // Загруженные документы
  documents: [
    {
      type: "passport",
      url: "https://...",
      uploadedAt: Timestamp
    },
    {
      type: "residence_permit",
      url: "https://...",
      uploadedAt: Timestamp
    }
  ],
  
  // Результат проверки
  reviewedBy: "adminUserId",
  reviewedAt: Timestamp,
  rejectionReason: "",
  notes: "Примечания администратора"
}
```

## Индексы Firestore

### Составные индексы для оптимизации запросов

#### chats
- `participantIds` (ascending) + `isActive` (ascending) + `lastMessageTime` (descending)
- `participantIds` (array-contains) + `lastMessageTime` (descending)

#### messages
- `timestamp` (descending) + `chatId` (ascending)
- `senderId` (ascending) + `isRead` (ascending) + `timestamp` (descending)

#### notifications
- `userId` (ascending) + `isRead` (ascending) + `createdAt` (descending)
- `userId` (ascending) + `type` (ascending) + `createdAt` (descending)

#### jobs
- `isActive` (ascending) + `is_featured` (descending) + `createdAt` (descending)
- `employerId` (ascending) + `isActive` (ascending) + `createdAt` (descending)
- `allowDirectMessages` (ascending) + `isActive` (ascending)

#### job_applications
- `jobId` (ascending) + `status` (ascending) + `appliedAt` (descending)
- `applicantId` (ascending) + `status` (ascending) + `appliedAt` (descending)
- `employerId` (ascending) + `status` (ascending) + `appliedAt` (descending)

#### presence
- `isOnline` (ascending) + `lastSeen` (descending)

## Правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Чаты - доступ только участникам
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participantIds;
      
      // Сообщения в чате
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participantIds;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participantIds &&
          request.auth.uid == request.resource.data.senderId;
        allow update: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
      }
    }
    
    // Уведомления - только для владельца
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Статус присутствия - читать всем, писать только владельцу
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Пользователи - базовые правила
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Вакансии - читать всем, писать работодателям
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        request.auth.uid == resource.data.employerId;
    }
    
    // Отклики - доступ участникам
    match /job_applications/{applicationId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.applicantId || 
         request.auth.uid == resource.data.employerId);
    }
    
    // Запросы на верификацию - только владельцу
    match /verification_requests/{requestId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Cloud Functions

### Функции для системы сообщений

#### onMessageCreate
Триггер при создании нового сообщения:
- Отправка push-уведомления
- Обновление счетчиков непрочитанных
- Обновление lastMessage в чате

#### onChatCreate
Триггер при создании нового чата:
- Создание записи в системе аналитики
- Отправка welcome сообщения

#### sendPushNotification
HTTP функция для отправки push-уведомлений:
- Поддержка FCM (Firebase Cloud Messaging)
- Персонализированные уведомления
- Группировка уведомлений

#### moderateMessage
Автоматическая модерация сообщений:
- Фильтрация спама
- Проверка на нецензурную лексику
- Автоматическое скрытие подозрительных сообщений

## Миграции данных

### Миграция v1.0 → v1.1 (Добавление системы сообщений)
```javascript
// Добавление полей messagingEnabled в существующие профили
const users = await db.collection('users').get();
const batch = db.batch();

users.docs.forEach(doc => {
  batch.update(doc.ref, {
    messagingEnabled: true,
    lastActiveAt: new Date(),
    emailNotifications: true,
    pushNotifications: true,
    chatNotifications: true
  });
});

await batch.commit();
```

### Миграция v1.1 → v1.2 (Добавление монетизации)
```javascript
// Добавление полей для монетизации в вакансии и пользователей
const jobs = await db.collection('jobs').get();
const batch1 = db.batch();

jobs.docs.forEach(doc => {
  batch1.update(doc.ref, {
    is_featured: false,
    featured_until: null,
    featured_purchased_at: null,
    chatCount: 0,
    allowDirectMessages: true,
    autoReplyEnabled: false
  });
});

await batch1.commit();
```

## Резервное копирование

### Ежедневное резервное копирование
- Автоматический экспорт коллекций в Cloud Storage
- Сохранение последних 30 дней
- Уведомления об успехе/ошибках

### Критические коллекции для резервного копирования
1. `users` - профили пользователей
2. `chats` - история чатов
3. `jobs` - вакансии
4. `job_applications` - отклики
5. `notifications` - история уведомлений

Последнее обновление: Декабрь 2024 - добавлена система сообщений и подготовка к монетизации 