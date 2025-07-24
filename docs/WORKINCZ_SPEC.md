# WORKINCZ 2.0 - ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ

**Дата создания:** Январь 2025  
**Статус:** Утверждена к реализации  
**Версия:** 2.0  

---

## 🎯 ЦЕЛЬ ПРОЕКТА

Платформа для агентского подбора персонала в Чехии с монетизацией через success-fee (5%) и premium подписки. Фокус на трудовых мигрантах и агентствах по трудоустройству.

---

## 🏗️ АРХИТЕКТУРА СУЩНОСТЕЙ

### 1. USERS (расширенная)
```javascript
users/{userId} {
  // Базовая информация
  email: string,
  phone: string,
  name: string,
  avatar: string,
  language: string, // cs, en, ru, uk, etc.
  
  // Роль и права
  role: 'client' | 'agency' | 'candidate' | 'admin',
  verified: boolean,
  is_premium: boolean,
  subscription_expires: timestamp,
  
  // Для агентств
  agency_id?: string,
  
  // Для кандидатов
  candidate_profile?: {
    skills: string[],
    experience: number,
    desired_salary: number,
    work_permit: boolean
  },
  
  // Статистика и метрики
  stats: {
    jobs_posted: number,
    applications_sent: number,
    contracts_completed: number
  },
  
  // Биллинг
  last_billing_issue: timestamp,
  billing_attempts: number
}
```

### 2. AGENCIES
```javascript
agencies/{agencyId} {
  // Основная информация
  name: string,
  description: string,
  logo: string,
  website: string,
  
  // Лицензия и верификация
  license_number: string,
  verified: boolean,
  verification_date: timestamp,
  
  // Специализации
  specializations: string[], // ['construction', 'it', 'logistics']
  languages: string[], // ['cs', 'en', 'ru', 'uk']
  
  // Финансы
  stripe_connect_id: string,
  success_fee_rate: number, // 5% по умолчанию
  min_contract_value: number,
  
  // Рейтинг и отзывы
  rating: number,
  reviews_count: number,
  completed_contracts: number,
  
  // Контакты
  contact_person: string,
  phone: string,
  email: string,
  address: {
    street: string,
    city: string,
    zip: string,
    country: string
  }
}

// Sub-collection для кандидатов агентства
agencies/{agencyId}/candidates/{candidateId} {
  name: string,
  skills: string[],
  experience: number,
  salary_expectation: number,
  work_permit: boolean,
  status: 'available' | 'assigned' | 'hired',
  created_at: timestamp
}
```

### 3. STAFFING_REQUESTS
```javascript
staffing_requests/{requestId} {
  // Основная информация
  client_id: string,
  title: string,
  description: string,
  requirements: string[],
  
  // Детали позиции
  position_type: 'full_time' | 'part_time' | 'contract' | 'freelance',
  experience_level: 'junior' | 'middle' | 'senior',
  education_required: boolean,
  
  // Локация и условия
  location: {
    city: string,
    remote_possible: boolean,
    relocation_support: boolean
  },
  
  // Бюджет и сроки
  budget_range: {
    min: number,
    max: number,
    currency: string // 'CZK', 'EUR'
  },
  deadline: timestamp,
  start_date: timestamp,
  
  // Статус и метрики
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled',
  bids_count: number,
  bids_per_request: 5,
  bids_submitted: number,
  views_count: number,
  
  // Временные метки
  created_at: timestamp,
  updated_at: timestamp,
  closed_at?: timestamp
}
```

### 4. BIDS
```javascript
bids/{bidId} {
  // Связи
  request_id: string,
  agency_id: string,
  
  // Предложение
  price: number,
  currency: string,
  timeline: number, // дни до начала работы
  proposal: string,
  
  // Кандидаты
  candidates: [{
    id: string,
    name: string,
    experience: number,
    skills: string[],
    salary_expectation: number
  }],
  
  // Статус
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
  
  // Временные метки
  created_at: timestamp,
  responded_at?: timestamp
}
```

### 5. CONTRACTS
```javascript
contracts/{contractId} {
  // Связи
  request_id: string,
  client_id: string,
  agency_id: string,
  bid_id: string,
  
  // Условия контракта
  total_value: number,
  currency: string,
  success_fee: number, // 5% от total_value
  duration: number, // дни
  start_date: timestamp,
  end_date: timestamp,
  
  // Статус
  status: 'draft' | 'signed' | 'active' | 'completed' | 'cancelled',
  
  // Платежи
  payment_schedule: [{
    amount: number,
    due_date: timestamp,
    status: 'pending' | 'paid' | 'overdue'
  }],
  
  // Документы
  contract_pdf: string, // URL к документу
  signed_at?: timestamp,
  
  // Временные метки
  created_at: timestamp,
  updated_at: timestamp
}
```

### 6. CHATS (расширенная)
```javascript
chats/{chatId} {
  // Участники
  participants: [{
    user_id: string,
    role: 'client' | 'agency' | 'candidate',
    joined_at: timestamp
  }],
  
  // Контекст
  request_id?: string,
  contract_id?: string,
  
  // Метаданные
  type: 'direct' | 'request' | 'contract',
  title: string,
  
  // Статус и безопасность
  is_active: boolean,
  is_read_only: boolean, // когда контракт завершён
  last_message_at: timestamp,
  
  // Автоперевод
  auto_translations: {
    enabled: boolean,
    languages: string[]
  }
}

messages/{messageId} {
  chat_id: string,
  sender_id: string,
  content: string,
  type: 'text' | 'file' | 'system',
  file_url?: string,
  created_at: timestamp,
  read_by: string[], // массив user_id
  
  // Автоперевод
  auto_translations?: {
    cs: string,
    uk: string,
    en: string
  }
}
```

---

## 🔌 API ENDPOINTS (Firebase Functions)

### Основные endpoints:
```
POST /createStaffingRequest    - создание заявки на персонал
POST /submitBid               - подача предложения агентством
POST /acceptBid               - принятие предложения клиентом
POST /generateContract        - генерация контракта
GET  /compareBids/:requestId  - сравнение предложений
GET  /downloadContract/:contractId - скачивание контракта
POST /updateUserProfile       - обновление профиля
GET  /getAgencyStats          - статистика агентства
POST /sendMessage             - отправка сообщения в чат
```

### Webhook endpoints:
```
POST /stripe/webhook          - обработка платежей Stripe
POST /deepl/webhook           - обработка переводов
```

---

## 🎨 UI МАРШРУТЫ И КОМПОНЕНТЫ

### Основные страницы:
```
/                 - landing page
/dashboard        - ролевой дашборд
/requests/new     - модальное окно (lazy)
/requests/:id     - детали заявки + bids
/contracts/:id    - предпросмотр + подпись
/agencies         - каталог агентств
/profile          - профиль пользователя
```

### Модальные окна:
```
- CreateStaffingRequest
- AgencyRegistration  
- BidComparison
- ContractPreview
- PaymentModal
```

### Виджеты:
```
- StatisticsWidget (drag & drop)
- NotificationsPanel
- QuickActions
- ChatWidget
```

---

## 🛠️ ТЕХНИЧЕСКИЙ СТЕК

### Frontend:
- **HTML/CSS/JavaScript** (существующее)
- **Tailwind CSS** 3.4.16
- **Service Worker** для офлайн работы
- **IndexedDB** для локального кэша

### Backend:
- **Firebase Hosting** (статика)
- **Firestore Database** (данные)
- **Firebase Functions** (API)
- **Firebase Authentication** (аутентификация)
- **Firebase Cloud Messaging** (уведомления)

### Интеграции:
- **Stripe Connect Express** (платежи)
- **DeepL API** (переводы)
- **OpenAI GPT-4o-mini** (AI помощник)
- **Sentry** (мониторинг ошибок)

### CI/CD:
- **GitHub Actions** (автоматический деплой)
- **Firebase CLI** (развертывание)

---

## 💰 МОНЕТИЗАЦИЯ

### Основные источники дохода:

**1. Success-fee (5% от контракта):**
- Автоматическое списание через Stripe Connect
- При успешном завершении контракта
- Основной источник дохода

**2. Premium подписки:**
- **Client Premium:** 990 Kč/месяц
- **Agency Premium:** 1,990 Kč/месяц  
- **Candidate Premium:** 290 Kč/месяц

**3. Разовые услуги:**
- **Верификация агентства:** 500 Kč
- **Продвижение заявки:** 300 Kč/неделя
- **Срочная заявка:** 200 Kč

### Прогноз доходов (к концу года):
- **Success-fee:** 45,000 Kč/месяц
- **Подписки:** 25,000 Kč/месяц
- **Разовые услуги:** 15,000 Kč/месяц
- **ИТОГО:** 85,000 Kč/месяц

---

## 🔒 GDPR & БЕЗОПАСНОСТЬ

### GDPR Compliance:
- **Cookie banner** + CMP (Cookiebot бесплатный tier)
- **Consent checkboxes** при регистрации
- **DPA шаблон** для агентств
- **Право на забвение** (удаление данных)
- **Экспорт данных** пользователя

### Безопасность:
- **Firebase Security Rules** для Firestore
- **Stripe webhook secret** для защиты
- **Rate limiting** на API endpoints
- **Input validation** на всех формах
- **HTTPS** везде

### Конфигурация безопасности:
```javascript
// config/firebase.js
{
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  deepl_api_key: process.env.DEEPL_API_KEY,
  openai_api_key: process.env.OPENAI_API_KEY
}
```

---

## 📊 МЕТРИКИ И АНАЛИТИКА

### Firebase Analytics события:
```
- request_created
- bid_submitted  
- contract_signed
- payment_success
- user_registered
- premium_subscribed
```

### Ключевые метрики:
- **MRR** (Monthly Recurring Revenue)
- **LTV** (Lifetime Value)
- **CAC** (Customer Acquisition Cost)
- **Churn Rate**
- **Success Rate** контрактов
- **Время от заявки до контракта**

---

## 🚀 ДЕПЛОЙ И МАСШТАБИРОВАНИЕ

### Этапы масштабирования:

**Этап 1 (0-1K DAU):**
- Firebase Spark (бесплатно)
- Базовая функциональность

**Этап 2 (1K-50K DAU):**
- Firebase Blaze (≈500 Kč/месяц)
- Cloudflare CDN
- Оптимизация производительности

**Этап 3 (50K+ DAU):**
- Supabase для сложных запросов
- Микросервисная архитектура
- Автоматическое масштабирование

---

## 🧪 ТЕСТИРОВАНИЕ

### E2E тесты (Cypress):
```javascript
// cypress/e2e/staffing-flow.cy.js
describe('Staffing Request Flow', () => {
  it('should create request, receive bids, and sign contract', () => {
    // 1. Login as client
    // 2. Create staffing request
    // 3. Login as agency
    // 4. Submit bid
    // 5. Client accepts bid
    // 6. Contract signed
  });
});
```

### Unit тесты (Jest):
```javascript
// tests/unit/
- calculateSuccessFee.test.js
- validateContract.test.js  
- translateMessage.test.js
```

---

## 💸 БЮДЖЕТ (месячный)

### Инфраструктура:
- **Firebase Spark:** 0 Kč (начало)
- **Firebase Blaze:** ≈500 Kč (при 1K DAU)
- **Cloudflare CDN:** 0 Kč (до 50K запросов)

### Платежи:
- **Stripe:** 0,3% + 0,25€ за транзакцию
- **Success-fee:** 5% от контрактов

### AI сервисы:
- **DeepL:** 20€ за 1M символов
- **OpenAI:** 5$ за 1M токенов

### Общий бюджет при 1K DAU:
- **Расходы:** ≈800 Kč/месяц
- **Доходы:** ≈15,000 Kč/месяц
- **Прибыль:** ≈14,200 Kč/месяц

---

## 📅 ПЛАН РЕАЛИЗАЦИИ

### Неделя 1-2: Базовая архитектура
- [ ] Схема БД в Firestore
- [ ] Agency registration
- [ ] Базовая аутентификация

### Неделя 3-4: Основной функционал
- [ ] Create Staffing Request
- [ ] Bidding system
- [ ] Базовая чат-система

### Неделя 5-6: Монетизация
- [ ] Stripe Connect интеграция
- [ ] Contract generation
- [ ] Success-fee система

### Неделя 7-8: Оптимизация
- [ ] UI/UX улучшения
- [ ] Тестирование
- [ ] Деплой в production

---

## ✅ КРИТЕРИИ ГОТОВНОСТИ

### MVP готов когда:
- [ ] Agency может зарегистрироваться
- [ ] Client может создать заявку
- [ ] Agency может подать предложение
- [ ] Client может принять предложение
- [ ] Контракт генерируется автоматически
- [ ] Success-fee списывается при завершении

### Production готов когда:
- [ ] Все тесты проходят
- [ ] GDPR compliance проверен
- [ ] Мониторинг настроен
- [ ] Документация готова
- [ ] Безопасность протестирована

---

**Статус:** Готов к реализации  
**Следующий шаг:** Создание Jira задач или начало кодирования 