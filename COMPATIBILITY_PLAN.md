# 🔄 ПЛАН СОВМЕСТИМОСТИ И МИГРАЦИИ WORKINCZ

**Дата создания:** Январь 2025  
**Статус:** Критически важно для реализации  
**Главный директор:** AI-агент #1  

---

## 🎯 ЦЕЛЬ

Объединить существующий функционал (поиск вакансий, чаты, аутентификация) с новой агентской моделью без нарушения работы сайта.

---

## 📊 АНАЛИЗ СУЩЕСТВУЮЩЕГО КОДА

### Текущая структура данных:
```javascript
// Существующие коллекции Firestore
users/{userId} {
  email: string,
  name: string,
  role: 'employer' | 'jobseeker', // СУЩЕСТВУЕТ
  // ... другие поля
}

jobs/{jobId} {
  title: string,
  description: string,
  employer_id: string, // СУЩЕСТВУЕТ
  salary: string,
  location: string,
  // ... другие поля
}

chats/{chatId} {
  participants: [{
    user_id: string,
    role: string // СУЩЕСТВУЕТ
  }],
  messages: [...],
  // ... другие поля
}
```

### Существующий функционал:
- ✅ Поиск вакансий с фильтрами
- ✅ Размещение вакансий работодателями
- ✅ Система аутентификации
- ✅ Real-time чаты
- ✅ Drag & drop интерфейс
- ✅ Многоязычность
- ✅ Базовая Stripe интеграция

---

## 🔄 ПЛАН МИГРАЦИИ (ГИБРИДНАЯ МОДЕЛЬ)

### ЭТАП 1: РАСШИРЕНИЕ РОЛЕЙ (Неделя 1)

**1.1 Обновление структуры пользователей:**
```javascript
// Расширение существующей коллекции users
users/{userId} {
  // Существующие поля
  email: string,
  name: string,
  role: 'employer' | 'jobseeker' | 'agency' | 'admin', // РАСШИРЯЕМ
  
  // Новые поля для агентств
  agency_id?: string, // ID агентства (если пользователь - агентство)
  is_premium: boolean, // Для подписок
  subscription_expires?: timestamp,
  
  // Существующие поля остаются
  avatar: string,
  language: string,
  // ... другие поля
}
```

**1.2 Миграция существующих данных:**
```javascript
// Firebase Function для миграции
exports.migrateUserRoles = functions.https.onCall(async (data, context) => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  
  const batch = writeBatch(db);
  
  usersSnapshot.forEach((doc) => {
    const userData = doc.data();
    
    // Добавляем новые поля с дефолтными значениями
    batch.update(doc.ref, {
      is_premium: false,
      subscription_expires: null,
      agency_id: null
    });
  });
  
  await batch.commit();
});
```

### ЭТАП 2: ДВОЙНАЯ МОДЕЛЬ ВАКАНСИЙ (Неделя 2-3)

**2.1 Расширение коллекции jobs:**
```javascript
// Расширение существующей коллекции jobs
jobs/{jobId} {
  // Существующие поля
  title: string,
  description: string,
  employer_id: string,
  salary: string,
  location: string,
  
  // Новые поля для агентской модели
  job_type: 'direct' | 'staffing_request', // ПРЯМАЯ ВАКАНСИЯ ИЛИ ЗАЯВКА НА ПЕРСОНАЛ
  agency_id?: string, // Если размещено через агентство
  is_featured: boolean, // Для горячих объявлений
  bids_count: number, // Количество предложений (для staffing requests)
  
  // Существующие поля остаются
  created_at: timestamp,
  updated_at: timestamp,
  // ... другие поля
}
```

**2.2 Обновление UI для поддержки двух типов:**
```html
<!-- Обновленный интерфейс размещения вакансий -->
<div class="job-posting-form">
  <div class="job-type-selector">
    <label>
      <input type="radio" name="job_type" value="direct" checked>
      Прямая вакансия (как раньше)
    </label>
    <label>
      <input type="radio" name="job_type" value="staffing_request">
      Заявка на подбор персонала (через агентства)
    </label>
  </div>
  
  <!-- Существующие поля формы -->
  <input type="text" name="title" placeholder="Название позиции" required>
  <textarea name="description" placeholder="Описание" required></textarea>
  
  <!-- Новые поля для staffing requests -->
  <div id="staffingFields" style="display: none;">
    <input type="number" name="budget_min" placeholder="Мин. бюджет (Kč)">
    <input type="number" name="budget_max" placeholder="Макс. бюджет (Kč)">
    <input type="date" name="deadline" placeholder="Дедлайн">
  </div>
</div>
```

**2.3 JavaScript логика переключения:**
```javascript
// js/job-posting.js (обновление существующего файла)
class JobPostingManager {
  constructor() {
    this.init();
  }

  init() {
    // Существующая логика
    this.form = document.getElementById('jobPostingForm');
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Новая логика переключения типов
    this.jobTypeRadios = document.querySelectorAll('input[name="job_type"]');
    this.staffingFields = document.getElementById('staffingFields');
    
    this.jobTypeRadios.forEach(radio => {
      radio.addEventListener('change', this.handleJobTypeChange.bind(this));
    });
  }

  handleJobTypeChange(event) {
    if (event.target.value === 'staffing_request') {
      this.staffingFields.style.display = 'block';
    } else {
      this.staffingFields.style.display = 'none';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(this.form);
    const jobType = formData.get('job_type');
    
    if (jobType === 'direct') {
      // Существующая логика для прямых вакансий
      await this.createDirectJob(formData);
    } else {
      // Новая логика для staffing requests
      await this.createStaffingRequest(formData);
    }
  }

  async createDirectJob(formData) {
    // Существующая логика создания вакансий
    const jobData = {
      title: formData.get('title'),
      description: formData.get('description'),
      employer_id: auth.currentUser.uid,
      job_type: 'direct',
      // ... остальные поля
    };
    
    await addDoc(collection(db, 'jobs'), jobData);
  }

  async createStaffingRequest(formData) {
    // Новая логика создания заявок на персонал
    const requestData = {
      title: formData.get('title'),
      description: formData.get('description'),
      client_id: auth.currentUser.uid,
      job_type: 'staffing_request',
      budget_range: {
        min: parseInt(formData.get('budget_min')),
        max: parseInt(formData.get('budget_max'))
      },
      deadline: new Date(formData.get('deadline')),
      status: 'open',
      bids_count: 0,
      created_at: new Date()
    };
    
    await addDoc(collection(db, 'jobs'), requestData);
  }
}
```

### ЭТАП 3: РАСШИРЕНИЕ ЧАТ-СИСТЕМЫ (Неделя 4)

**3.1 Обновление структуры чатов:**
```javascript
// Расширение существующей коллекции chats
chats/{chatId} {
  // Существующие поля
  participants: [{
    user_id: string,
    role: 'employer' | 'jobseeker' | 'agency' | 'admin' // РАСШИРЯЕМ
  }],
  messages: [...],
  
  // Новые поля для агентской модели
  chat_type: 'direct' | 'job' | 'staffing_request' | 'contract',
  job_id?: string, // Связь с вакансией или заявкой
  contract_id?: string, // Связь с контрактом
  is_read_only: boolean, // Для завершенных контрактов
  
  // Существующие поля остаются
  created_at: timestamp,
  last_message_at: timestamp
}
```

**3.2 Обновление UI чатов:**
```javascript
// js/messaging-manager.js (обновление существующего файла)
class MessagingManager {
  constructor() {
    // Существующая логика
    this.init();
  }

  async createChat(participants, chatType, jobId = null) {
    const chatData = {
      participants: participants.map(p => ({
        user_id: p.user_id,
        role: p.role
      })),
      chat_type: chatType,
      job_id: jobId,
      is_read_only: false,
      created_at: new Date(),
      last_message_at: new Date()
    };
    
    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    return chatRef.id;
  }

  // Новый метод для создания чатов агентств
  async createAgencyChat(clientId, agencyId, jobId) {
    const participants = [
      { user_id: clientId, role: 'employer' },
      { user_id: agencyId, role: 'agency' }
    ];
    
    return await this.createChat(participants, 'staffing_request', jobId);
  }
}
```

### ЭТАП 4: ДВОЙНАЯ МОНЕТИЗАЦИЯ (Неделя 5-6)

**4.1 Объединение планов монетизации:**

**Для прямых вакансий (существующий план):**
- Горячие объявления: 400 Kč/7 дней
- Верификация профилей: 250 Kč
- Premium подписки: 990 Kč/мес (работодатели), 290 Kč/мес (соискатели)

**Для агентской модели (новый план):**
- Success-fee: 5% от контракта
- Agency Premium: 1,990 Kč/мес
- Верификация агентств: 500 Kč

**4.2 Обновление платежной системы:**
```javascript
// js/payment-manager.js (обновление существующего файла)
class PaymentManager {
  constructor() {
    this.init();
  }

  async processPayment(paymentType, data) {
    switch (paymentType) {
      case 'featured_job':
        return await this.processFeaturedJob(data);
      case 'profile_verification':
        return await this.processProfileVerification(data);
      case 'agency_verification':
        return await this.processAgencyVerification(data);
      case 'success_fee':
        return await this.processSuccessFee(data);
      case 'subscription':
        return await this.processSubscription(data);
    }
  }

  // Существующие методы
  async processFeaturedJob(data) {
    // Логика горячих объявлений
  }

  async processProfileVerification(data) {
    // Логика верификации профилей
  }

  // Новые методы
  async processAgencyVerification(data) {
    // Логика верификации агентств
  }

  async processSuccessFee(data) {
    // Логика success-fee через Stripe Connect
  }
}
```

### ЭТАП 5: ОБНОВЛЕНИЕ UI/UX (Неделя 7-8)

**5.1 Обновление dashboard:**
```html
<!-- Обновленный dashboard.html -->
<div class="dashboard-container">
  <!-- Существующие табы -->
  <div class="dashboard-tab" id="myJobsTab">
    <h3>Мои вакансии</h3>
    <div class="job-type-filter">
      <button class="filter-btn active" data-type="all">Все</button>
      <button class="filter-btn" data-type="direct">Прямые вакансии</button>
      <button class="filter-btn" data-type="staffing">Заявки на персонал</button>
    </div>
    <div id="jobsList">
      <!-- Список вакансий -->
    </div>
  </div>
  
  <!-- Новый таб для агентств -->
  <div class="dashboard-tab" id="agencyTab" style="display: none;">
    <h3>Агентские услуги</h3>
    <div id="agencyDashboard">
      <!-- Интерфейс агентства -->
    </div>
  </div>
</div>
```

**5.2 JavaScript для переключения интерфейса:**
```javascript
// js/dashboard-manager.js (новый файл)
class DashboardManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadUserRole();
    this.setupRoleBasedUI();
  }

  async loadUserRole() {
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    this.userRole = userDoc.data().role;
  }

  setupRoleBasedUI() {
    // Скрываем/показываем элементы в зависимости от роли
    const agencyTab = document.getElementById('agencyTab');
    const agencyFeatures = document.querySelectorAll('.agency-feature');
    
    if (this.userRole === 'agency') {
      agencyTab.style.display = 'block';
      agencyFeatures.forEach(el => el.style.display = 'block');
    } else {
      agencyTab.style.display = 'none';
      agencyFeatures.forEach(el => el.style.display = 'none');
    }
  }
}
```

---

## 🚨 КРИТИЧЕСКИЕ ТОЧКИ ВНИМАНИЯ

### 1. ОБРАТНАЯ СОВМЕСТИМОСТЬ:
- ✅ Все существующие функции должны работать
- ✅ Существующие пользователи не должны потерять доступ
- ✅ Существующие вакансии должны отображаться

### 2. МИГРАЦИЯ ДАННЫХ:
- ✅ Автоматическая миграция существующих пользователей
- ✅ Сохранение всех существующих вакансий
- ✅ Сохранение истории чатов

### 3. ПРОИЗВОДИТЕЛЬНОСТЬ:
- ✅ Не должно быть замедления существующих функций
- ✅ Новые функции не должны влиять на старые
- ✅ Оптимизация запросов к Firestore

### 4. БЕЗОПАСНОСТЬ:
- ✅ Обновление Firebase Security Rules
- ✅ Проверка прав доступа для новых ролей
- ✅ Защита от несанкционированного доступа

---

## 📋 ПЛАН ТЕСТИРОВАНИЯ

### 1. ТЕСТИРОВАНИЕ СОВМЕСТИМОСТИ:
```javascript
// tests/compatibility.test.js
describe('Backward Compatibility', () => {
  test('existing users can still post jobs', async () => {
    // Тест существующего функционала
  });
  
  test('existing jobs are still visible', async () => {
    // Тест отображения существующих вакансий
  });
  
  test('existing chats still work', async () => {
    // Тест существующих чатов
  });
});
```

### 2. ТЕСТИРОВАНИЕ НОВОГО ФУНКЦИОНАЛА:
```javascript
// tests/agency-flow.test.js
describe('Agency Flow', () => {
  test('agency can register and create profile', async () => {
    // Тест регистрации агентства
  });
  
  test('client can create staffing request', async () => {
    // Тест создания заявки
  });
  
  test('agency can submit bid', async () => {
    // Тест подачи предложения
  });
});
```

---

## 🎯 КРИТЕРИИ УСПЕХА

### Технические критерии:
- [ ] Все существующие тесты проходят
- [ ] Новые тесты проходят
- [ ] Время загрузки не увеличилось
- [ ] Нет критических ошибок в Sentry

### Функциональные критерии:
- [ ] Существующие пользователи могут использовать все функции
- [ ] Новые агентские функции работают корректно
- [ ] Два типа вакансий отображаются правильно
- [ ] Чат-система работает для всех типов

### Бизнес критерии:
- [ ] Оба плана монетизации работают
- [ ] Пользователи могут выбирать тип вакансии
- [ ] Агентства могут регистрироваться и работать
- [ ] Доходы растут по обоим направлениям

---

## 📅 ПЛАН РЕАЛИЗАЦИИ

### Неделя 1: Расширение ролей
- [ ] Обновление структуры users
- [ ] Миграция существующих данных
- [ ] Тестирование обратной совместимости

### Неделя 2-3: Двойная модель вакансий
- [ ] Расширение коллекции jobs
- [ ] Обновление UI для выбора типа
- [ ] Обновление логики создания вакансий

### Неделя 4: Расширение чат-системы
- [ ] Обновление структуры chats
- [ ] Поддержка новых типов чатов
- [ ] Тестирование чатов агентств

### Неделя 5-6: Двойная монетизация
- [ ] Объединение платежных систем
- [ ] Поддержка всех типов платежей
- [ ] Тестирование платежей

### Неделя 7-8: Обновление UI/UX
- [ ] Ролевой интерфейс
- [ ] Фильтры по типам вакансий
- [ ] Финальное тестирование

---

**Статус:** Готов к реализации  
**Приоритет:** Критически важно  
**Следующий шаг:** Начать с этапа 1 - расширение ролей 