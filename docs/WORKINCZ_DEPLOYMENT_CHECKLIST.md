# 📁 WORKINCZ_DEPLOYMENT_CHECKLIST.md

**Проект:** WorkInCZ 2.0 - Агентская платформа подбора персонала  
**Дата создания:** Январь 2025  
**Статус:** Утвержден к реализации  
**Главный директор:** AI-агент #1  

---

## 🎯 ОБЩАЯ ИНФОРМАЦИЯ

**Цель:** Запуск платформы для агентского подбора персонала в Чехии  
**Монетизация:** Success-fee 5% + Premium подписки  
**Целевая аудитория:** Трудовые мигранты и агентства по трудоустройству  
**Технический стек:** Firebase + Stripe Connect + HTML/CSS/JS  

---

## 📋 ЧЕК-ЛИСТ РЕАЛИЗАЦИИ

| Раздел | Задача | Статус | Ответственный | Deadline | Приоритет |
|---|---|---|---|---|---|
| **0. Подготовка** | Создать ветку `feat/agency-flow` | ☐ | DevOps | 20.07 | 🔴 |
| **1. Firestore** | Добавить коллекции `agencies`, `staffing_requests`, `bids`, `contracts` + composite-indexes | ☐ | Backend | 21.07 | 🔴 |
| **2. Security Rules** | Раздать права по ролям (client / agency / admin) | ☐ | Backend | 22.07 | 🔴 |
| **3. Functions** | 8 cloud-функций (см. ниже) | ☐ | Backend | 23.07 | 🔴 |
| **4. Stripe** | Создать Connect-приложение, webhook endpoint | ☐ | DevOps | 24.07 | 🔴 |
| **5. Frontend** | 4 новые страницы + 3 модалки (см. ниже) | ☐ | Frontend | 26.07 | 🟡 |
| **6. Cypress** | 1 e2e-flow + 3 unit-теста | ☐ | QA | 27.07 | 🟡 |
| **7. GDPR** | Cookiebot + Privacy/Terms шаблоны | ☐ | Legal | 28.07 | 🟡 |
| **8. CI/CD** | GitHub Actions deploy to Firebase + Sentry release | ☐ | DevOps | 29.07 | 🟡 |
| **9. Soft-launch** | Дать доступ 5 агентствам, собрать фидбек | ☐ | Product | 31.07 | 🟢 |

**Легенда:** 🔴 Критично | 🟡 Важно | 🟢 Желательно

---

## 🔧 CLOUD FUNCTIONS (8 функций)

### 1. `createStaffingRequest`
```javascript
// Создание заявки на персонал
exports.createStaffingRequest = functions.https.onCall(async (data, context) => {
  // Валидация данных
  // Создание в Firestore
  // Уведомления агентствам
  // Аналитика
});
```

### 2. `submitBid`
```javascript
// Подача предложения агентством
exports.submitBid = functions.https.onCall(async (data, context) => {
  // Валидация агентства
  // Создание bid в Firestore
  // Уведомление клиента
  // Обновление счетчика
});
```

### 3. `acceptBid`
```javascript
// Принятие предложения и генерация контракта
exports.acceptBid = functions.https.onCall(async (data, context) => {
  // Обновление статуса bid
  // Создание контракта
  // Генерация PDF
  // Создание чата
});
```

### 4. `generateContractPdf`
```javascript
// Генерация PDF контракта
exports.generateContractPdf = functions.https.onCall(async (data, context) => {
  // Создание PDF с pdf-lib
  // Загрузка в Firebase Storage
  // Возврат URL
});
```

### 5. `createStripeConnectAccount`
```javascript
// Создание Stripe Connect аккаунта для агентства
exports.createStripeConnectAccount = functions.https.onCall(async (data, context) => {
  // Создание Connect account
  // Генерация account link
  // Обновление Firestore
});
```

### 6. `chargeSuccessFee`
```javascript
// Списание success-fee через webhook
exports.chargeSuccessFee = functions.https.onRequest(async (req, res) => {
  // Валидация webhook
  // Создание transfer через Connect
  // Обновление контракта
});
```

### 7. `createSubscription`
```javascript
// Создание Stripe подписки
exports.createSubscription = functions.https.onCall(async (data, context) => {
  // Создание Checkout Session
  // Возврат session URL
});
```

### 8. `validateAgencyLicense`
```javascript
// Валидация лицензии агентства (заглушка MPSV)
exports.validateAgencyLicense = functions.https.onCall(async (data, context) => {
  // Заглушка для MPSV API
  // Возврат mock данных
  // В будущем - реальная интеграция
});
```

---

## 🖥️ FRONTEND КОМПОНЕНТЫ (7 компонентов)

### 1. `dashboard.html` (расширение)
```html
<!-- Добавить таб "Мои заявки" -->
<div class="dashboard-tab" id="myRequestsTab">
  <h3>Мои заявки на персонал</h3>
  <div id="requestsList">
    <!-- Список заявок пользователя -->
  </div>
  <button id="createRequestBtn" class="btn-primary">Создать заявку</button>
</div>
```

### 2. `request-details.html` (новая страница)
```html
<!-- Страница деталей заявки + предложения -->
<div class="request-details-page">
  <div class="request-info">
    <h1 id="requestTitle"></h1>
    <p id="requestDescription"></p>
    <div class="request-meta">
      <span class="budget">Бюджет: <span id="budgetRange"></span></span>
      <span class="deadline">Дедлайн: <span id="deadline"></span></span>
      <span class="bids-count">Предложений: <span id="bidsCount"></span></span>
    </div>
  </div>
  
  <div class="bids-list" id="bidsList">
    <!-- Список предложений -->
  </div>
  
  <div class="submit-bid-form" id="submitBidForm" style="display: none;">
    <!-- Форма подачи предложения -->
  </div>
</div>
```

### 3. `contracts.html` (новая страница)
```html
<!-- Страница контрактов -->
<div class="contracts-page">
  <h2>Мои контракты</h2>
  <div class="contracts-list" id="contractsList">
    <!-- Список контрактов -->
  </div>
  
  <div class="contract-preview" id="contractPreview" style="display: none;">
    <!-- Предпросмотр PDF контракта -->
    <iframe id="contractPdfViewer"></iframe>
  </div>
</div>
```

### 4. `agency-profile.html` (новая страница)
```html
<!-- Публичный профиль агентства -->
<div class="agency-profile-page">
  <div class="agency-header">
    <img id="agencyLogo" class="agency-logo">
    <h1 id="agencyName"></h1>
    <div class="agency-rating">
      <span id="agencyRating"></span> ⭐
      <span id="reviewsCount"></span> отзывов
    </div>
  </div>
  
  <div class="agency-info">
    <p id="agencyDescription"></p>
    <div class="agency-specializations">
      <h3>Специализации:</h3>
      <div id="specializationsList"></div>
    </div>
  </div>
  
  <div class="agency-stats">
    <div class="stat">
      <span class="stat-number" id="completedContracts"></span>
      <span class="stat-label">Завершенных контрактов</span>
    </div>
  </div>
</div>
```

### 5. Modal `createRequestModal`
```html
<!-- Модальное окно создания заявки -->
<div id="createRequestModal" class="modal hidden">
  <div class="modal-content">
    <h2>Создать заявку на персонал</h2>
    <form id="createRequestForm">
      <input type="text" name="title" placeholder="Название позиции" required>
      <textarea name="description" placeholder="Описание требований" required></textarea>
      
      <select name="position_type" required>
        <option value="full_time">Полная занятость</option>
        <option value="part_time">Частичная занятость</option>
        <option value="contract">Контракт</option>
        <option value="freelance">Фриланс</option>
      </select>
      
      <select name="experience_level" required>
        <option value="junior">Junior (0-2 года)</option>
        <option value="middle">Middle (2-5 лет)</option>
        <option value="senior">Senior (5+ лет)</option>
      </select>
      
      <input type="text" name="city" placeholder="Город" required>
      <label>
        <input type="checkbox" name="remote_possible"> Возможна удаленная работа
      </label>
      
      <div class="budget-range">
        <input type="number" name="budget_min" placeholder="Мин. зарплата (Kč)" required>
        <input type="number" name="budget_max" placeholder="Макс. зарплата (Kč)" required>
      </div>
      
      <input type="date" name="deadline" required>
      <input type="date" name="start_date" required>
      
      <button type="submit">Опубликовать заявку</button>
    </form>
  </div>
</div>
```

### 6. Modal `agencyRegistrationModal`
```html
<!-- Модальное окно регистрации агентства -->
<div id="agencyRegistrationModal" class="modal hidden">
  <div class="modal-content">
    <h2>Регистрация агентства</h2>
    <form id="agencyRegistrationForm">
      <input type="text" name="name" placeholder="Название агентства" required>
      <textarea name="description" placeholder="Описание услуг"></textarea>
      
      <input type="text" name="license_number" placeholder="Номер лицензии" required>
      
      <select name="specializations" multiple>
        <option value="construction">Строительство</option>
        <option value="it">IT</option>
        <option value="logistics">Логистика</option>
        <option value="cleaning">Уборка</option>
        <option value="transport">Транспорт</option>
      </select>
      
      <input type="text" name="contact_person" placeholder="Контактное лицо">
      <input type="tel" name="phone" placeholder="Телефон">
      <input type="email" name="email" placeholder="Email">
      
      <button type="submit">Зарегистрировать агентство</button>
    </form>
  </div>
</div>
```

### 7. Widget `compareBidsTable`
```html
<!-- Виджет сравнения предложений -->
<div class="compare-bids-widget" id="compareBidsWidget">
  <h3>Сравнение предложений</h3>
  <div class="bids-table">
    <table id="bidsComparisonTable">
      <thead>
        <tr>
          <th>Агентство</th>
          <th>Цена (Kč)</th>
          <th>Срок (дни)</th>
          <th>Рейтинг</th>
          <th>Кандидаты</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody id="bidsTableBody">
        <!-- Данные загружаются динамически -->
      </tbody>
    </table>
  </div>
</div>
```

---

## ⚙️ ENV-ПЕРЕМЕННЫЕ

### Firebase Functions Environment Variables:
```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services
DEEPL_API_KEY=...
OPENAI_API_KEY=sk-...

# Monitoring
SENTRY_DSN=https://...

# External APIs
MPSV_API_KEY=... # для будущей интеграции
```

### Frontend Environment Variables:
```javascript
// config/firebase.js
const config = {
  apiKey: "your-api-key",
  authDomain: "workincz.firebaseapp.com",
  projectId: "workincz",
  storageBucket: "workincz.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// config/stripe.js
const stripeConfig = {
  publishableKey: 'pk_test_...',
  connectClientId: 'ca_...'
};
```

---

## 📦 ЗАВИСИМОСТИ

### package.json (добавить):
```json
{
  "dependencies": {
    "stripe": "^15.12.0",
    "pdf-lib": "^1.17.1",
    "date-fns": "^3.6.0",
    "firebase": "^10.7.0",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "cypress": "^13.6.0",
    "jest": "^29.7.0",
    "firebase-tools": "^13.0.0"
  }
}
```

### Firebase Extensions:
```bash
# Установка расширений
firebase ext:install firestore-stripe-payments
firebase ext:install firestore-send-email
```

---

## 🧪 ТЕСТИРОВАНИЕ

### E2E тест (Cypress):
```javascript
// cypress/e2e/staffing-flow.cy.js
describe('Complete Staffing Flow', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.login('client@example.com', 'password');
  });

  it('should complete full staffing request flow', () => {
    // 1. Создание заявки
    cy.get('[data-testid="create-request-btn"]').click();
    cy.get('[data-testid="request-title"]').type('Senior Developer');
    cy.get('[data-testid="request-description"]').type('Need experienced developer');
    cy.get('[data-testid="budget-min"]').type('50000');
    cy.get('[data-testid="budget-max"]').type('80000');
    cy.get('[data-testid="submit-request"]').click();
    
    // 2. Переключение на агентство
    cy.login('agency@example.com', 'password');
    cy.visit('/requests');
    cy.get('[data-testid="request-item"]').first().click();
    
    // 3. Подача предложения
    cy.get('[data-testid="submit-bid-btn"]').click();
    cy.get('[data-testid="bid-price"]').type('70000');
    cy.get('[data-testid="bid-proposal"]').type('Great candidate available');
    cy.get('[data-testid="submit-bid"]').click();
    
    // 4. Переключение на клиента
    cy.login('client@example.com', 'password');
    cy.visit('/requests');
    cy.get('[data-testid="request-item"]').first().click();
    
    // 5. Принятие предложения
    cy.get('[data-testid="accept-bid-btn"]').first().click();
    cy.get('[data-testid="confirm-accept"]').click();
    
    // 6. Проверка создания контракта
    cy.visit('/contracts');
    cy.get('[data-testid="contract-item"]').should('exist');
  });
});
```

### Unit тесты (Jest):
```javascript
// tests/unit/calculateSuccessFee.test.js
describe('Success Fee Calculation', () => {
  test('should calculate 5% success fee correctly', () => {
    const contractValue = 100000;
    const successFee = calculateSuccessFee(contractValue);
    expect(successFee).toBe(5000);
  });
});

// tests/unit/validateContract.test.js
describe('Contract Validation', () => {
  test('should validate valid contract data', () => {
    const contractData = {
      client_id: 'client123',
      agency_id: 'agency456',
      total_value: 50000,
      duration: 30
    };
    
    const result = validateContract(contractData);
    expect(result.isValid).toBe(true);
  });
});

// tests/unit/translateMessage.test.js
describe('Message Translation', () => {
  test('should translate message to Czech', async () => {
    const message = 'Hello, I am interested in this position';
    const translation = await translateMessage(message, 'cs');
    expect(translation).toBe('Dobrý den, zajímám se o tuto pozici');
  });
});
```

---

## 🔒 GDPR & БЕЗОПАСНОСТЬ

### Cookie Consent:
```html
<!-- Cookiebot интеграция -->
<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="YOUR-COOKIEBOT-ID" data-blockingmode="auto" type="text/javascript"></script>
```

### Privacy Policy Template:
```html
<!-- privacy-policy.html -->
<div class="privacy-policy">
  <h1>Политика конфиденциальности WorkInCZ</h1>
  
  <h2>1. Сбор данных</h2>
  <p>Мы собираем следующие данные:</p>
  <ul>
    <li>Персональные данные (имя, email, телефон)</li>
    <li>Данные агентства (лицензия, специализации)</li>
    <li>Данные заявок и контрактов</li>
  </ul>
  
  <h2>2. Использование данных</h2>
  <p>Данные используются для:</p>
  <ul>
    <li>Обеспечения работы платформы</li>
    <li>Обработки платежей</li>
    <li>Улучшения сервиса</li>
  </ul>
  
  <h2>3. Права пользователей</h2>
  <p>Вы имеете право:</p>
  <ul>
    <li>Получить копию ваших данных</li>
    <li>Исправить неточные данные</li>
    <li>Удалить ваши данные</li>
    <li>Отозвать согласие</li>
  </ul>
</div>
```

### Terms of Service Template:
```html
<!-- terms-of-service.html -->
<div class="terms-of-service">
  <h1>Условия использования WorkInCZ</h1>
  
  <h2>1. Услуги платформы</h2>
  <p>WorkInCZ предоставляет платформу для:</p>
  <ul>
    <li>Создания заявок на персонал</li>
    <li>Подачи предложений агентствами</li>
    <li>Заключения контрактов</li>
  </ul>
  
  <h2>2. Success-fee</h2>
  <p>При успешном завершении контракта взимается комиссия 5% от стоимости контракта.</p>
  
  <h2>3. Ответственность</h2>
  <p>Платформа не несет ответственности за качество предоставляемых услуг агентствами.</p>
</div>
```

---

## 🚀 CI/CD ПИПЕЛАЙН

### GitHub Actions (.github/workflows/deploy.yml):
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main, feat/agency-flow ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: workincz
          channelId: live
      - name: Deploy Functions
        run: firebase deploy --only functions
      - name: Create Sentry Release
        run: |
          npx @sentry/cli releases new ${{ github.sha }}
          npx @sentry/cli releases set-commits ${{ github.sha }} --auto
```

---

## 📊 МЕТРИКИ УСПЕХА

### Ключевые показатели после релиза:

| Метрика | Цель | Измерение |
|---|---|---|
| **DAU** | ≥ 100 | Firebase Analytics |
| **Заявки/день** | ≥ 10 | Firestore queries |
| **Bids/заявка** | ≥ 3 | Среднее по заявкам |
| **Контракты/день** | ≥ 1 (через 2 недели) | Firestore queries |
| **Success Rate** | ≥ 80% | Контракты/заявки |
| **Время отклика** | ≤ 24 часа | Среднее время ответа агентств |

### Дашборд метрик:
```javascript
// analytics/metrics-dashboard.js
class MetricsDashboard {
  async getKeyMetrics() {
    const metrics = {
      dau: await this.getDAU(),
      requestsPerDay: await this.getRequestsPerDay(),
      avgBidsPerRequest: await this.getAvgBidsPerRequest(),
      contractsPerDay: await this.getContractsPerDay(),
      successRate: await this.getSuccessRate(),
      avgResponseTime: await this.getAvgResponseTime()
    };
    
    return metrics;
  }
}
```

---

## 🎯 ПЛАН СОФТ-ЛАУНЧА

### Неделя 1 (31.07 - 06.08):
- [ ] Пригласить 5 агентств для тестирования
- [ ] Создать тестовые аккаунты
- [ ] Провести демонстрацию функционала
- [ ] Собрать обратную связь

### Неделя 2 (07.08 - 13.08):
- [ ] Исправить выявленные баги
- [ ] Улучшить UX на основе фидбека
- [ ] Подготовить маркетинговые материалы
- [ ] Настроить аналитику

### Неделя 3 (14.08 - 20.08):
- [ ] Публичный запуск
- [ ] Маркетинговая кампания
- [ ] Мониторинг метрик
- [ ] Поддержка пользователей

---

## ✅ КРИТЕРИИ ГОТОВНОСТИ К РЕЛИЗУ

### Технические критерии:
- [ ] Все тесты проходят (E2E + Unit)
- [ ] Нет критических ошибок в Sentry
- [ ] Время загрузки страниц < 3 секунд
- [ ] GDPR compliance проверен
- [ ] Безопасность протестирована

### Бизнес критерии:
- [ ] 5 агентств протестировали платформу
- [ ] Получен положительный фидбек
- [ ] Готовы маркетинговые материалы
- [ ] Настроена поддержка пользователей

### Операционные критерии:
- [ ] CI/CD пайплайн работает
- [ ] Мониторинг настроен
- [ ] Документация готова
- [ ] План поддержки создан

---

## 📞 КОНТАКТЫ И ОТВЕТСТВЕННОСТЬ

### Команда проекта:
- **Главный директор:** AI-агент #1
- **Product Manager:** AI-агент #2
- **Backend Developer:** AI-агент #1
- **Frontend Developer:** AI-агент #1
- **QA Engineer:** AI-агент #2
- **DevOps Engineer:** AI-агент #1

### Контакты для экстренных случаев:
- **Технические проблемы:** Sentry + Firebase Console
- **Бизнес вопросы:** Product Manager
- **Безопасность:** Главный директор

---

**Статус:** Готов к реализации  
**Следующий шаг:** Создание ветки `feat/agency-flow` и начало разработки  
**Дата релиза:** 31.07.2025  

---

*Документ создан: Январь 2025*  
*Последнее обновление: Январь 2025*  
*Версия: 1.0* 