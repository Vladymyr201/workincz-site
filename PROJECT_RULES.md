# 🚀 WORKINCZ PROJECT RULES
## Основные правила и принципы проекта

---

## 📋 КРАТКИЙ ОБЗОР ПРОЕКТА

**WorkInCZ** - платформа поиска работы для трудовых мигрантов в Чехии

### Ключевые факты:
- **Целевая аудитория:** ~500,000 мигрантов в Чехии
- **Средняя зарплата ЦА:** 25,000-35,000 Kč/мес
- **Готовность платить:** 1-3% от зарплаты (250-1,000 Kč/мес)
- **Технологический стек:** HTML/JS, Firebase, Tailwind CSS
- **Хостинг:** Firebase Hosting
- **Главная цель 2024:** 85,000+ Kč/мес выручки

---

## 📁 КЛЮЧЕВЫЕ ДОКУМЕНТЫ ПРОЕКТА

| Документ | Описание | Статус |
|----------|----------|--------|
| **MONETIZATION_STRATEGY.md** | Полный план монетизации (47 страниц) | ✅ Создан |
| **PROJECT_KNOWLEDGE.md** | Архитектура и накопленные знания | ✅ Обновлен |
| **PROJECT_RULES.md** | Этот файл - основные правила | ✅ Текущий |
| **TODO система** | Отслеживание задач по этапам | ✅ Активна |

---

## 💰 СТРАТЕГИЯ МОНЕТИЗАЦИИ (3 ЭТАПА)

### 🎯 Этап 1: "Быстрые деньги" (Месяцы 1-2)
**Цель:** 16,000 Kč/мес
- **Горячие объявления:** 400 Kč/7 дней
- **Верификация профилей:** 250 Kč одноразово
- **Продвижение резюме:** 200 Kč/5 дней

### 🚀 Этап 2: "Подписки" (Месяцы 3-4)  
**Цель:** 26,500 Kč/мес
- **VIP для соискателей:** 490 Kč/мес
- **Business Pro для работодателей:** 1,990 Kč/мес

### 💎 Этап 3: "Реклама" (Месяцы 5-6)
**Цель:** 54,000 Kč/мес
- **Нативные карточки** для бесплатных пользователей
- **Партнерские программы** с курсами и сервисами

---

## 🛠 ТЕХНИЧЕСКИЕ ПРИНЦИПЫ

### ⚡ Основные правила разработки:
1. **Простота превыше всего** - минимум сложности, максимум результата
2. **Firebase-центричность** - все через Firestore + Cloud Functions
3. **Mobile-first подход** - 70%+ трафика с мобильных устройств
4. **GDPR compliance** - обязательно для европейского рынка
5. **Автоматический деплой** - `firebase deploy --only hosting` после изменений

### 🔧 Архитектурные решения:
- **Frontend:** Vanilla JS + Tailwind CSS (текущая архитектура)
- **Backend:** Firebase Firestore + Cloud Functions
- **Платежи:** Stripe (международные карты + SEPA)
- **Аналитика:** Firebase Analytics + Google Analytics 4
- **Мониторинг:** Sentry для отслеживания ошибок

---

## 🎯 КЛЮЧЕВЫЕ МЕТРИКИ И KPI

### 💰 Финансовые метрики:
- **Конверсия в платежи:** минимум 3%
- **LTV/CAC соотношение:** > 3:1
- **Churn Rate:** максимум 5% в месяц
- **ARPU:** минимум 300 Kč/мес
- **MRR рост:** 20% в месяц

### 📊 Операционные метрики:
- **Uptime платформы:** минимум 99.5%
- **Время ответа поддержки:** максимум 4 часа
- **NPS (Net Promoter Score):** минимум 40
- **Время верификации:** максимум 24 часа

---

## ⚡ ПРИОРИТЕТЫ РАЗРАБОТКИ

### 🔥 P1 - Критический приоритет (Этап 1):
- Stripe интеграция для платежей
- Система "Горячих объявлений"
- Верификация профилей
- Продвижение резюме

### 🚀 P2 - Высокий приоритет (Этап 2):
- Подписочная система и биллинг
- Ограничения функций по тарифам
- Email уведомления о платежах

### 💎 P3 - Средний приоритет (Этап 3):
- Рекламная экосистема
- Партнерские интеграции
- A/B тестирование

---

## 🚫 ОГРАНИЧЕНИЯ И ПРИНЦИПЫ

### 💰 Ценовая политика:
- **Цены на 30-40% ниже** конкурентов (Jobs.cz, Prace.cz)
- **Доступность для мигрантов** - учет ограниченного бюджета
- **Прозрачность** - никаких скрытых комиссий

### 🎨 Рекламная политика для Premium:
- **Только в разделе "Партнеры"** в личном кабинете
- **Максимум 1-2 карточки** в день
- **Строгий запрет:** popup, автоплей, реклама в чатах

### 🎯 Фокус на уникальности:
- **Специализация на мигрантах** vs общие job-порталы
- **Уникальные услуги:** переводы, визовая поддержка, адаптация
- **Мультиязычность:** 9 языков интерфейса

---

## 🔄 ПРОЦЕССЫ И УПРАВЛЕНИЕ

### 📅 Регулярные процессы:
- **Еженедельные ревью:** понедельники, анализ метрик
- **Месячные отчеты:** dashboard с ключевыми KPI
- **Обновление rules:** при значительных изменениях стратегии

### 🚦 Критерии перехода между этапами:

**Этап 1 → Этап 2:**
- ✅ Минимум 15,000 Kč дохода в месяц
- ✅ Конверсия >= 3%
- ✅ 80%+ положительных отзывов
- ✅ Техническая стабильность 99%+

**Этап 2 → Этап 3:**
- ✅ 50+ активных подписчиков
- ✅ LTV/CAC > 3:1
- ✅ Churn < 8% в месяц

### ⚠️ Управление рисками:
- **План Б для каждого этапа** - фоллback стратегии
- **Еженедельный мониторинг** ключевых метрик
- **Escalation процедуры** при отклонении > 20%

---

## 🏆 КОНКУРЕНТНЫЕ ПРЕИМУЩЕСТВА

### 🎯 Уникальная позиция:
1. **Фокус на мигрантах** - недооцененная ниша
2. **Доступные цены** - конкурентное преимущество
3. **Специализированные услуги** - переводы, юр.поддержка
4. **Быстрая адаптация** - agile подход vs крупные порталы

### 🛡 Защита от конкурентов:
- **Network effect** - чем больше пользователей, тем ценнее платформа
- **Brand loyalty** - доверие мигрантского сообщества
- **Партнерская экосистема** - курсы, консультации, сервисы

---

## 📞 КОНТАКТЫ И ОТВЕТСТВЕННОСТЬ

**Структура команды:**
- **Руководитель проекта:** AI Team Lead
- **Разработчик:** TBD (в процессе найма)
- **Маркетинг:** TBD (планирование)
- **Финансы:** Консультации по необходимости

**Процедуры escalation:**
- **Критические проблемы:** немедленно
- **Отклонения от плана:** еженедельно
- **Стратегические решения:** ежемесячно

---

## 🔄 ОБНОВЛЕНИЕ ПРАВИЛ

### Когда обновлять:
- ✅ Значительные изменения в стратегии
- ✅ Новые этапы развития
- ✅ Изменения в команде или процессах
- ✅ Обновления технологического стека

### Как обновлять:
1. Обновить `PROJECT_RULES.md`
2. Синхронизировать с `PROJECT_KNOWLEDGE.md`
3. Обновить memory rules в системе
4. Уведомить команду об изменениях

---

## 🎉 ЗАКЛЮЧЕНИЕ

Эти правила служат **северной звездой** для всей команды WorkInCZ. Они обеспечивают:

- ✅ **Единое понимание** целей и принципов
- ✅ **Четкие критерии** принятия решений
- ✅ **Управляемые риски** с планами Б
- ✅ **Фокус на результат** через конкретные метрики

**Принцип:** Эти правила живые - они развиваются вместе с проектом!

---

*Последнее обновление: Декабрь 2024*  
*Следующий ревью: При переходе к Этапу 1 реализации*