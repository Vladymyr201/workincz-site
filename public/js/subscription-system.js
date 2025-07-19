/**
 * Система подписок и платежей
 * Управление подписками, премиум функциями, платежами и промокодами
 */

class SubscriptionSystem {
    constructor() {
        this.subscriptions = new Map();
        this.paymentMethods = new Map();
        this.promoCodes = new Map();
        this.invoices = new Map();
        this.subscriptionPlans = new Map();
        this.premiumFeatures = new Map();
        this.paymentHistory = new Map();
        this.init();
    }

    /**
     * Инициализация системы подписок
     */
    init() {
        this.loadData();
        this.initializePlans();
        this.initializeFeatures();
        this.initializePromoCodes();
        this.setupEventListeners();
        console.log('💳 Система подписок инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedSubscriptions = localStorage.getItem('subscriptions');
            const savedPaymentMethods = localStorage.getItem('paymentMethods');
            const savedInvoices = localStorage.getItem('invoices');
            const savedPaymentHistory = localStorage.getItem('paymentHistory');

            if (savedSubscriptions) this.subscriptions = new Map(JSON.parse(savedSubscriptions));
            if (savedPaymentMethods) this.paymentMethods = new Map(JSON.parse(savedPaymentMethods));
            if (savedInvoices) this.invoices = new Map(JSON.parse(savedInvoices));
            if (savedPaymentHistory) this.paymentHistory = new Map(JSON.parse(savedPaymentHistory));
        } catch (error) {
            console.error('Ошибка загрузки данных подписок:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('subscriptions', JSON.stringify(Array.from(this.subscriptions.entries())));
            localStorage.setItem('paymentMethods', JSON.stringify(Array.from(this.paymentMethods.entries())));
            localStorage.setItem('invoices', JSON.stringify(Array.from(this.invoices.entries())));
            localStorage.setItem('paymentHistory', JSON.stringify(Array.from(this.paymentHistory.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных подписок:', error);
        }
    }

    /**
     * Инициализация планов подписок
     */
    initializePlans() {
        const plans = [
            {
                id: 'free',
                name: 'Базовый',
                description: 'Бесплатный план для всех пользователей',
                price: 0,
                currency: 'CZK',
                interval: 'month',
                features: [
                    '5 заявок в месяц',
                    'Базовый поиск вакансий',
                    'Профиль пользователя',
                    'Базовые уведомления',
                    'Система отзывов и рейтингов',
                    'Календарь событий',
                    'Базовые сообщения',
                    'Система геймификации',
                    'Базовые достижения',
                    'Доступ к вакансиям',
                    'Создание резюме',
                    'Базовые фильтры поиска'
                ],
                limits: {
                    applications: 5,
                    messages: 10,
                    profileViews: 100,
                    searchFilters: 3,
                    reviews: 10,
                    calendarEvents: 50
                }
            },
            {
                id: 'premium',
                name: 'Премиум',
                description: 'Расширенные возможности для активных соискателей',
                price: 299,
                currency: 'CZK',
                interval: 'month',
                features: [
                    'Неограниченные заявки',
                    'Расширенный поиск',
                    'Приоритетная поддержка',
                    'Расширенная аналитика',
                    'Кастомные бейджи',
                    'Буст профиля',
                    'Продвинутые фильтры',
                    'Экспорт данных'
                ],
                limits: {
                    applications: -1, // безлимит
                    messages: 100,
                    profileViews: 1000,
                    searchFilters: 10
                }
            },
            {
                id: 'business',
                name: 'Бизнес',
                description: 'Для работодателей и HR-специалистов',
                price: 999,
                currency: 'CZK',
                interval: 'month',
                features: [
                    'Все функции Премиум',
                    'Публикация вакансий',
                    'Управление кандидатами',
                    'HR аналитика',
                    'Интеграции с ATS',
                    'API доступ',
                    'Белый лейбл',
                    'Приоритетное размещение'
                ],
                limits: {
                    applications: -1,
                    messages: 500,
                    profileViews: 5000,
                    searchFilters: 20,
                    jobPostings: 10
                }
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                description: 'Корпоративные решения для крупных компаний',
                price: 2999,
                currency: 'CZK',
                interval: 'month',
                features: [
                    'Все функции Бизнес',
                    'Неограниченные вакансии',
                    'Корпоративная поддержка',
                    'Индивидуальная настройка',
                    'SLA гарантии',
                    'Обучение команды',
                    'Интеграции с HR системами',
                    'Детальная отчетность'
                ],
                limits: {
                    applications: -1,
                    messages: -1,
                    profileViews: -1,
                    searchFilters: -1,
                    jobPostings: -1
                }
            }
        ];

        plans.forEach(plan => {
            this.subscriptionPlans.set(plan.id, plan);
        });
    }

    /**
     * Инициализация премиум функций
     */
    initializeFeatures() {
        const features = [
            // БАЗОВЫЕ БЕСПЛАТНЫЕ ФУНКЦИИ
            {
                id: 'basic_search',
                name: 'Базовый поиск вакансий',
                description: 'Поиск вакансий с базовыми фильтрами',
                icon: '🔍',
                category: 'search',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_profile',
                name: 'Базовый профиль',
                description: 'Создание и редактирование профиля',
                icon: '👤',
                category: 'profile',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_notifications',
                name: 'Базовые уведомления',
                description: 'Уведомления о новых вакансиях и сообщениях',
                icon: '🔔',
                category: 'notifications',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_messaging',
                name: 'Базовые сообщения',
                description: 'Общение с работодателями',
                icon: '💬',
                category: 'messaging',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_reviews',
                name: 'Базовые отзывы',
                description: 'Оставление отзывов о работодателях',
                icon: '⭐',
                category: 'reviews',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_calendar',
                name: 'Базовый календарь',
                description: 'Планирование собеседований и встреч',
                icon: '📅',
                category: 'calendar',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_gamification',
                name: 'Базовая геймификация',
                description: 'Достижения и бейджи',
                icon: '🏆',
                category: 'gamification',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_achievements',
                name: 'Базовые достижения',
                description: 'Система достижений и наград',
                icon: '🎖️',
                category: 'achievements',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_resume',
                name: 'Базовое резюме',
                description: 'Создание и редактирование резюме',
                icon: '📄',
                category: 'resume',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            {
                id: 'basic_filters',
                name: 'Базовые фильтры',
                description: 'Базовые фильтры поиска вакансий',
                icon: '🔧',
                category: 'search',
                plans: ['free', 'premium', 'business', 'enterprise']
            },
            
            // ПРЕМИУМ ФУНКЦИИ
            {
                id: 'unlimited_applications',
                name: 'Неограниченные заявки',
                description: 'Подавайте неограниченное количество заявок на работу',
                icon: '📝',
                category: 'applications',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'advanced_search',
                name: 'Расширенный поиск',
                description: 'Доступ к продвинутым фильтрам поиска вакансий',
                icon: '🔍',
                category: 'search',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'priority_support',
                name: 'Приоритетная поддержка',
                description: 'Быстрая поддержка с приоритетом',
                icon: '🎯',
                category: 'support',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'advanced_analytics',
                name: 'Расширенная аналитика',
                description: 'Детальная аналитика вашей активности',
                icon: '📊',
                category: 'analytics',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'custom_badges',
                name: 'Кастомные бейджи',
                description: 'Создавайте свои уникальные бейджи',
                icon: '🎨',
                category: 'customization',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'profile_boost',
                name: 'Буст профиля',
                description: 'Ваш профиль показывается первым в результатах',
                icon: '🚀',
                category: 'visibility',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'export_data',
                name: 'Экспорт данных',
                description: 'Экспортируйте ваши данные в различных форматах',
                icon: '📤',
                category: 'data',
                plans: ['premium', 'business', 'enterprise']
            },
            {
                id: 'job_posting',
                name: 'Публикация вакансий',
                description: 'Публикуйте вакансии на платформе',
                icon: '📋',
                category: 'employer',
                plans: ['business', 'enterprise']
            },
            {
                id: 'candidate_management',
                name: 'Управление кандидатами',
                description: 'Управляйте кандидатами и их заявками',
                icon: '👥',
                category: 'employer',
                plans: ['business', 'enterprise']
            },
            {
                id: 'hr_analytics',
                name: 'HR аналитика',
                description: 'Специальная аналитика для HR-специалистов',
                icon: '📈',
                category: 'analytics',
                plans: ['business', 'enterprise']
            },
            {
                id: 'api_access',
                name: 'API доступ',
                description: 'Доступ к API платформы',
                icon: '🔌',
                category: 'integration',
                plans: ['business', 'enterprise']
            }
        ];

        features.forEach(feature => {
            this.premiumFeatures.set(feature.id, feature);
        });
    }

    /**
     * Инициализация промокодов
     */
    initializePromoCodes() {
        const promoCodes = [
            {
                code: 'WELCOME2024',
                description: 'Скидка 20% на первый месяц',
                discount: 20,
                type: 'percentage',
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                maxUses: 1000,
                usedCount: 0,
                applicablePlans: ['premium', 'business'],
                minSubscriptionDuration: 1
            },
            {
                code: 'FREEMONTH',
                description: 'Первый месяц бесплатно',
                discount: 100,
                type: 'percentage',
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                maxUses: 500,
                usedCount: 0,
                applicablePlans: ['premium'],
                minSubscriptionDuration: 3
            },
            {
                code: 'BUSINESS50',
                description: 'Скидка 50% на бизнес план',
                discount: 50,
                type: 'percentage',
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-06-30'),
                maxUses: 100,
                usedCount: 0,
                applicablePlans: ['business'],
                minSubscriptionDuration: 6
            },
            {
                code: 'ENTERPRISE25',
                description: 'Скидка 25% на enterprise план',
                discount: 25,
                type: 'percentage',
                validFrom: new Date('2024-01-01'),
                validTo: new Date('2024-12-31'),
                maxUses: 50,
                usedCount: 0,
                applicablePlans: ['enterprise'],
                minSubscriptionDuration: 12
            }
        ];

        promoCodes.forEach(promoCode => {
            this.promoCodes.set(promoCode.code, promoCode);
        });
    }

    /**
     * Получение или создание подписки пользователя
     */
    getUserSubscription(userId) {
        if (!this.subscriptions.has(userId)) {
            const subscription = {
                userId: userId,
                planId: 'free',
                status: 'active',
                startDate: Date.now(),
                endDate: null,
                autoRenew: false,
                paymentMethodId: null,
                promoCode: null,
                features: this.getPlanFeatures('free'),
                limits: this.getPlanLimits('free'),
                usage: {
                    applications: 0,
                    messages: 0,
                    profileViews: 0,
                    searchFilters: 0
                }
            };
            this.subscriptions.set(userId, subscription);
        }
        return this.subscriptions.get(userId);
    }

    /**
     * Получение функций плана
     */
    getPlanFeatures(planId) {
        const plan = this.subscriptionPlans.get(planId);
        if (!plan) return [];

        return Array.from(this.premiumFeatures.values())
            .filter(feature => feature.plans.includes(planId))
            .map(feature => feature.id);
    }

    /**
     * Получение лимитов плана
     */
    getPlanLimits(planId) {
        const plan = this.subscriptionPlans.get(planId);
        return plan ? plan.limits : {};
    }

    /**
     * Проверка доступности функции для пользователя
     */
    hasFeature(userId, featureId) {
        const subscription = this.getUserSubscription(userId);
        const feature = this.premiumFeatures.get(featureId);
        
        // Базовые функции всегда доступны бесплатно
        const freeFeatures = [
            'basic_search',
            'basic_profile',
            'basic_notifications',
            'basic_messaging',
            'basic_reviews',
            'basic_calendar',
            'basic_gamification',
            'basic_achievements',
            'basic_resume',
            'basic_filters'
        ];
        
        if (freeFeatures.includes(featureId)) {
            return true; // Базовые функции всегда бесплатны
        }
        
        if (!feature || !subscription) {
            return false;
        }
        
        return feature.plans.includes(subscription.planId);
    }

    /**
     * Проверка лимитов
     */
    checkLimit(userId, limitType) {
        const subscription = this.getUserSubscription(userId);
        const limit = subscription.limits[limitType];
        const usage = subscription.usage[limitType] || 0;

        if (limit === -1) return true; // безлимит
        return usage < limit;
    }

    /**
     * Увеличение использования
     */
    incrementUsage(userId, limitType) {
        const subscription = this.getUserSubscription(userId);
        if (!subscription.usage[limitType]) {
            subscription.usage[limitType] = 0;
        }
        subscription.usage[limitType]++;
        this.saveData();
    }

    /**
     * Подписка на план
     */
    async subscribeToPlan(userId, planId, paymentMethodId = null, promoCode = null) {
        const plan = this.subscriptionPlans.get(planId);
        if (!plan) {
            throw new Error('План не найден');
        }

        const subscription = this.getUserSubscription(userId);
        const oldPlanId = subscription.planId;

        // Проверка промокода
        let finalPrice = plan.price;
        let appliedPromoCode = null;

        if (promoCode) {
            const promoResult = this.validatePromoCode(promoCode, planId);
            if (promoResult.valid) {
                finalPrice = this.calculateDiscountedPrice(plan.price, promoResult.promoCode);
                appliedPromoCode = promoCode;
            }
        }

        // Симуляция платежа
        const paymentResult = await this.processPayment(userId, finalPrice, plan.currency, paymentMethodId);
        
        if (paymentResult.success) {
            // Обновление подписки
            subscription.planId = planId;
            subscription.status = 'active';
            subscription.startDate = Date.now();
            subscription.endDate = this.calculateEndDate(plan.interval);
            subscription.autoRenew = true;
            subscription.paymentMethodId = paymentMethodId;
            subscription.promoCode = appliedPromoCode;
            subscription.features = this.getPlanFeatures(planId);
            subscription.limits = this.getPlanLimits(planId);

            // Сброс использования
            subscription.usage = {
                applications: 0,
                messages: 0,
                profileViews: 0,
                searchFilters: 0
            };

            // Создание инвойса
            this.createInvoice(userId, planId, finalPrice, plan.currency, appliedPromoCode);

            // Обновление использования промокода
            if (appliedPromoCode) {
                this.updatePromoCodeUsage(appliedPromoCode);
            }

            this.saveData();

            // Уведомление об изменении подписки
            this.notifySubscriptionChange(userId, oldPlanId, planId);

            return {
                success: true,
                subscription: subscription,
                payment: paymentResult
            };
        } else {
            throw new Error('Ошибка платежа: ' + paymentResult.error);
        }
    }

    /**
     * Отмена подписки
     */
    cancelSubscription(userId) {
        const subscription = this.getUserSubscription(userId);
        
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        subscription.endDate = Date.now();

        this.saveData();

        // Уведомление об отмене подписки
        this.notifySubscriptionCancellation(userId);

        return subscription;
    }

    /**
     * Возобновление подписки
     */
    async renewSubscription(userId) {
        const subscription = this.getUserSubscription(userId);
        
        if (subscription.status !== 'cancelled') {
            throw new Error('Подписка не отменена');
        }

        const plan = this.subscriptionPlans.get(subscription.planId);
        const paymentResult = await this.processPayment(userId, plan.price, plan.currency, subscription.paymentMethodId);

        if (paymentResult.success) {
            subscription.status = 'active';
            subscription.autoRenew = true;
            subscription.startDate = Date.now();
            subscription.endDate = this.calculateEndDate(plan.interval);

            this.saveData();

            // Уведомление о возобновлении подписки
            this.notifySubscriptionRenewal(userId);

            return subscription;
        } else {
            throw new Error('Ошибка платежа: ' + paymentResult.error);
        }
    }

    /**
     * Валидация промокода
     */
    validatePromoCode(code, planId) {
        const promoCode = this.promoCodes.get(code);
        
        if (!promoCode) {
            return { valid: false, error: 'Промокод не найден' };
        }

        if (promoCode.usedCount >= promoCode.maxUses) {
            return { valid: false, error: 'Промокод больше не действителен' };
        }

        if (Date.now() < promoCode.validFrom.getTime() || Date.now() > promoCode.validTo.getTime()) {
            return { valid: false, error: 'Промокод истек или еще не действителен' };
        }

        if (!promoCode.applicablePlans.includes(planId)) {
            return { valid: false, error: 'Промокод не применим к данному плану' };
        }

        return { valid: true, promoCode: promoCode };
    }

    /**
     * Расчет цены со скидкой
     */
    calculateDiscountedPrice(originalPrice, promoCode) {
        if (promoCode.type === 'percentage') {
            return originalPrice * (1 - promoCode.discount / 100);
        } else if (promoCode.type === 'fixed') {
            return Math.max(0, originalPrice - promoCode.discount);
        }
        return originalPrice;
    }

    /**
     * Обновление использования промокода
     */
    updatePromoCodeUsage(code) {
        const promoCode = this.promoCodes.get(code);
        if (promoCode) {
            promoCode.usedCount++;
            this.promoCodes.set(code, promoCode);
        }
    }

    /**
     * Расчет даты окончания подписки
     */
    calculateEndDate(interval) {
        const now = new Date();
        
        switch (interval) {
            case 'month':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).getTime();
            case 'year':
                return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime();
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).getTime();
        }
    }

    /**
     * Симуляция обработки платежа
     */
    async processPayment(userId, amount, currency, paymentMethodId) {
        // Симуляция задержки платежа
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Симуляция успешного платежа (90% успех)
        const success = Math.random() > 0.1;

        if (success) {
            const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Сохранение истории платежей
            this.paymentHistory.set(paymentId, {
                id: paymentId,
                userId: userId,
                amount: amount,
                currency: currency,
                status: 'succeeded',
                timestamp: Date.now(),
                paymentMethodId: paymentMethodId
            });

            return {
                success: true,
                paymentId: paymentId,
                amount: amount,
                currency: currency
            };
        } else {
            return {
                success: false,
                error: 'Недостаточно средств на карте'
            };
        }
    }

    /**
     * Создание инвойса
     */
    createInvoice(userId, planId, amount, currency, promoCode = null) {
        const invoiceId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const invoice = {
            id: invoiceId,
            userId: userId,
            planId: planId,
            amount: amount,
            currency: currency,
            promoCode: promoCode,
            status: 'paid',
            createdAt: Date.now(),
            dueDate: Date.now()
        };

        this.invoices.set(invoiceId, invoice);
        return invoice;
    }

    /**
     * Получение инвойсов пользователя
     */
    getUserInvoices(userId, limit = 10) {
        return Array.from(this.invoices.values())
            .filter(invoice => invoice.userId === userId)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);
    }

    /**
     * Получение истории платежей
     */
    getPaymentHistory(userId, limit = 10) {
        return Array.from(this.paymentHistory.values())
            .filter(payment => payment.userId === userId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Уведомление об изменении подписки
     */
    notifySubscriptionChange(userId, oldPlanId, newPlanId) {
        const event = new CustomEvent('subscriptionChanged', {
            detail: {
                userId: userId,
                oldPlanId: oldPlanId,
                newPlanId: newPlanId,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Уведомление об отмене подписки
     */
    notifySubscriptionCancellation(userId) {
        const event = new CustomEvent('subscriptionCancelled', {
            detail: {
                userId: userId,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Уведомление о возобновлении подписки
     */
    notifySubscriptionRenewal(userId) {
        const event = new CustomEvent('subscriptionRenewed', {
            detail: {
                userId: userId,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка подписки на план
        document.addEventListener('subscribeToPlan', (e) => {
            const { userId, planId, paymentMethodId, promoCode } = e.detail;
            this.subscribeToPlan(userId, planId, paymentMethodId, promoCode);
        });

        // Обработка отмены подписки
        document.addEventListener('cancelSubscription', (e) => {
            const { userId } = e.detail;
            this.cancelSubscription(userId);
        });

        // Обработка возобновления подписки
        document.addEventListener('renewSubscription', (e) => {
            const { userId } = e.detail;
            this.renewSubscription(userId);
        });
    }

    /**
     * Получение статистики системы
     */
    getSystemStats() {
        const subscriptions = Array.from(this.subscriptions.values());
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
        const premiumSubscriptions = activeSubscriptions.filter(sub => sub.planId !== 'free');

        return {
            totalUsers: subscriptions.length,
            activeSubscriptions: activeSubscriptions.length,
            premiumSubscriptions: premiumSubscriptions.length,
            conversionRate: subscriptions.length > 0 ? 
                (premiumSubscriptions.length / subscriptions.length) * 100 : 0,
            totalRevenue: this.calculateTotalRevenue(),
            averageRevenuePerUser: this.calculateARPU()
        };
    }

    /**
     * Расчет общего дохода
     */
    calculateTotalRevenue() {
        let total = 0;
        
        for (const payment of this.paymentHistory.values()) {
            if (payment.status === 'succeeded') {
                // Конвертация в CZK для упрощения
                if (payment.currency === 'EUR') {
                    total += payment.amount * 25; // Примерный курс
                } else if (payment.currency === 'USD') {
                    total += payment.amount * 23; // Примерный курс
                } else {
                    total += payment.amount;
                }
            }
        }
        
        return total;
    }

    /**
     * Расчет среднего дохода на пользователя
     */
    calculateARPU() {
        const totalRevenue = this.calculateTotalRevenue();
        const activeSubscriptions = Array.from(this.subscriptions.values())
            .filter(sub => sub.status === 'active').length;
        
        return activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим системы подписок');
        
        const testUserId = 'test-user-1';
        
        // Создание тестовой подписки
        const subscription = this.getUserSubscription(testUserId);
        
        // Симуляция подписки на премиум план
        setTimeout(() => {
            this.subscribeToPlan(testUserId, 'premium', 'test-payment-method', 'WELCOME2024')
                .then(result => {
                    console.log('Тестовая подписка создана:', result);
                })
                .catch(error => {
                    console.error('Ошибка тестовой подписки:', error);
                });
        }, 2000);

        return {
            subscription: this.getUserSubscription(testUserId),
            systemStats: this.getSystemStats(),
            availablePlans: Array.from(this.subscriptionPlans.values()),
            premiumFeatures: Array.from(this.premiumFeatures.values())
        };
    }
}

// Экспорт для использования в других модулях
window.SubscriptionSystem = SubscriptionSystem; 