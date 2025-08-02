/**
 * Система платежей
 * Интеграция с Stripe, поддержка валют, автоматические платежи
 */

class PaymentSystem {
    constructor(subscriptionSystem) {
        this.subscriptionSystem = subscriptionSystem;
        this.stripe = null;
        this.paymentMethods = new Map();
        this.paymentIntents = new Map();
        this.refunds = new Map();
        this.webhooks = new Map();
        this.currencies = new Map();
        this.exchangeRates = new Map();
        this.init();
    }

    /**
     * Инициализация системы платежей
     */
    init() {
        this.loadData();
        this.initializeCurrencies();
        this.initializeExchangeRates();
        this.setupStripe();
        this.setupEventListeners();
        console.log('💳 Система платежей инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedPaymentMethods = localStorage.getItem('paymentMethods');
            const savedPaymentIntents = localStorage.getItem('paymentIntents');
            const savedRefunds = localStorage.getItem('refunds');

            if (savedPaymentMethods) this.paymentMethods = new Map(JSON.parse(savedPaymentMethods));
            if (savedPaymentIntents) this.paymentIntents = new Map(JSON.parse(savedPaymentIntents));
            if (savedRefunds) this.refunds = new Map(JSON.parse(savedRefunds));
        } catch (error) {
            console.error('Ошибка загрузки данных платежей:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('paymentMethods', JSON.stringify(Array.from(this.paymentMethods.entries())));
            localStorage.setItem('paymentIntents', JSON.stringify(Array.from(this.paymentIntents.entries())));
            localStorage.setItem('refunds', JSON.stringify(Array.from(this.refunds.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных платежей:', error);
        }
    }

    /**
     * Инициализация валют
     */
    initializeCurrencies() {
        const currencies = [
            {
                code: 'CZK',
                name: 'Чешская крона',
                symbol: 'Kč',
                decimals: 2,
                exchangeRate: 1,
                isDefault: true
            },
            {
                code: 'EUR',
                name: 'Евро',
                symbol: '€',
                decimals: 2,
                exchangeRate: 0.04,
                isDefault: false
            },
            {
                code: 'USD',
                name: 'Доллар США',
                symbol: '$',
                decimals: 2,
                exchangeRate: 0.043,
                isDefault: false
            },
            {
                code: 'GBP',
                name: 'Фунт стерлингов',
                symbol: '£',
                decimals: 2,
                exchangeRate: 0.034,
                isDefault: false
            }
        ];

        currencies.forEach(currency => {
            this.currencies.set(currency.code, currency);
        });
    }

    /**
     * Инициализация курсов валют
     */
    initializeExchangeRates() {
        // Симуляция курсов валют (в реальном приложении получали бы с API)
        this.exchangeRates.set('CZK_EUR', 0.04);
        this.exchangeRates.set('CZK_USD', 0.043);
        this.exchangeRates.set('CZK_GBP', 0.034);
        this.exchangeRates.set('EUR_CZK', 25.0);
        this.exchangeRates.set('USD_CZK', 23.0);
        this.exchangeRates.set('GBP_CZK', 29.0);
    }

    /**
     * Настройка Stripe
     */
    setupStripe() {
        // В реальном приложении здесь была бы инициализация Stripe
        // this.stripe = Stripe('pk_test_your_publishable_key');
        
        // Симуляция Stripe для демонстрации
        this.stripe = {
            createPaymentMethod: this.simulateCreatePaymentMethod.bind(this),
            confirmPayment: this.simulateConfirmPayment.bind(this),
            createPaymentIntent: this.simulateCreatePaymentIntent.bind(this),
            retrievePaymentIntent: this.simulateRetrievePaymentIntent.bind(this)
        };
    }

    /**
     * Создание метода платежа
     */
    async createPaymentMethod(userId, paymentData) {
        try {
            const paymentMethod = await this.stripe.createPaymentMethod(paymentData);
            
            // Сохранение метода платежа
            this.paymentMethods.set(paymentMethod.id, {
                id: paymentMethod.id,
                userId: userId,
                type: paymentMethod.type,
                card: paymentMethod.card,
                billingDetails: paymentMethod.billing_details,
                created: Date.now(),
                isDefault: this.paymentMethods.size === 0
            });

            this.saveData();
            return paymentMethod;
        } catch (error) {
            console.error('Ошибка создания метода платежа:', error);
            throw error;
        }
    }

    /**
     * Симуляция создания метода платежа
     */
    async simulateCreatePaymentMethod(paymentData) {
        // Симуляция задержки
        await new Promise(resolve => setTimeout(resolve, 1000));

        const paymentMethodId = 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
            id: paymentMethodId,
            type: 'card',
            card: {
                brand: paymentData.card.brand || 'visa',
                country: 'CZ',
                exp_month: paymentData.card.exp_month,
                exp_year: paymentData.card.exp_year,
                funding: 'credit',
                last4: paymentData.card.number.slice(-4)
            },
            billing_details: {
                name: paymentData.billing_details.name,
                email: paymentData.billing_details.email,
                address: paymentData.billing_details.address
            }
        };
    }

    /**
     * Создание платежного намерения
     */
    async createPaymentIntent(userId, amount, currency, paymentMethodId = null) {
        try {
            const paymentIntent = await this.stripe.createPaymentIntent({
                amount: this.convertToSmallestUnit(amount, currency),
                currency: currency.toLowerCase(),
                payment_method: paymentMethodId,
                confirmation_method: 'manual',
                confirm: false
            });

            // Сохранение платежного намерения
            this.paymentIntents.set(paymentIntent.id, {
                id: paymentIntent.id,
                userId: userId,
                amount: amount,
                currency: currency,
                status: paymentIntent.status,
                paymentMethodId: paymentMethodId,
                created: Date.now()
            });

            this.saveData();
            return paymentIntent;
        } catch (error) {
            console.error('Ошибка создания платежного намерения:', error);
            throw error;
        }
    }

    /**
     * Симуляция создания платежного намерения
     */
    async simulateCreatePaymentIntent(params) {
        // Симуляция задержки
        await new Promise(resolve => setTimeout(resolve, 1000));

        const paymentIntentId = 'pi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
            id: paymentIntentId,
            amount: params.amount,
            currency: params.currency,
            status: 'requires_confirmation',
            client_secret: 'pi_' + paymentIntentId + '_secret_' + Math.random().toString(36).substr(2, 9)
        };
    }

    /**
     * Подтверждение платежа
     */
    async confirmPayment(paymentIntentId, paymentMethodId = null) {
        try {
            const paymentIntent = await this.stripe.confirmPayment(paymentIntentId, {
                payment_method: paymentMethodId
            });

            // Обновление статуса платежного намерения
            if (this.paymentIntents.has(paymentIntentId)) {
                const intent = this.paymentIntents.get(paymentIntentId);
                intent.status = paymentIntent.status;
                this.paymentIntents.set(paymentIntentId, intent);
            }

            this.saveData();
            return paymentIntent;
        } catch (error) {
            console.error('Ошибка подтверждения платежа:', error);
            throw error;
        }
    }

    /**
     * Симуляция подтверждения платежа
     */
    async simulateConfirmPayment(paymentIntentId, params) {
        // Симуляция задержки
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Симуляция успешного платежа (95% успех)
        const success = Math.random() > 0.05;
        
        return {
            id: paymentIntentId,
            status: success ? 'succeeded' : 'requires_payment_method',
            amount: 1000,
            currency: 'czk',
            payment_method: params.payment_method
        };
    }

    /**
     * Получение платежного намерения
     */
    async retrievePaymentIntent(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.retrievePaymentIntent(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Ошибка получения платежного намерения:', error);
            throw error;
        }
    }

    /**
     * Симуляция получения платежного намерения
     */
    async simulateRetrievePaymentIntent(paymentIntentId) {
        // Симуляция задержки
        await new Promise(resolve => setTimeout(resolve, 500));

        const intent = this.paymentIntents.get(paymentIntentId);
        if (!intent) {
            throw new Error('Платежное намерение не найдено');
        }

        return {
            id: paymentIntentId,
            status: intent.status,
            amount: intent.amount,
            currency: intent.currency
        };
    }

    /**
     * Возврат средств
     */
    async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
        try {
            const refund = await this.simulateCreateRefund(paymentIntentId, amount, reason);
            
            // Сохранение возврата
            this.refunds.set(refund.id, {
                id: refund.id,
                paymentIntentId: paymentIntentId,
                amount: refund.amount,
                currency: refund.currency,
                reason: reason,
                status: refund.status,
                created: Date.now()
            });

            this.saveData();
            return refund;
        } catch (error) {
            console.error('Ошибка создания возврата:', error);
            throw error;
        }
    }

    /**
     * Симуляция создания возврата
     */
    async simulateCreateRefund(paymentIntentId, amount, reason) {
        // Симуляция задержки
        await new Promise(resolve => setTimeout(resolve, 1000));

        const refundId = 're_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return {
            id: refundId,
            payment_intent: paymentIntentId,
            amount: amount,
            currency: 'czk',
            reason: reason,
            status: 'succeeded'
        };
    }

    /**
     * Конвертация в наименьшую единицу валюты
     */
    convertToSmallestUnit(amount, currency) {
        const currencyInfo = this.currencies.get(currency);
        if (!currencyInfo) return amount * 100;

        return Math.round(amount * Math.pow(10, currencyInfo.decimals));
    }

    /**
     * Конвертация валют
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const rateKey = `${fromCurrency}_${toCurrency}`;
        const rate = this.exchangeRates.get(rateKey);
        
        if (rate) {
            return amount * rate;
        }

        // Обратная конвертация
        const reverseRateKey = `${toCurrency}_${fromCurrency}`;
        const reverseRate = this.exchangeRates.get(reverseRateKey);
        
        if (reverseRate) {
            return amount / reverseRate;
        }

        return amount; // Возвращаем исходную сумму если курс не найден
    }

    /**
     * Форматирование цены
     */
    formatPrice(amount, currency) {
        const currencyInfo = this.currencies.get(currency);
        if (!currencyInfo) return `${amount} ${currency}`;

        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currencyInfo.decimals,
            maximumFractionDigits: currencyInfo.decimals
        }).format(amount);
    }

    /**
     * Получение методов платежа пользователя
     */
    getUserPaymentMethods(userId) {
        return Array.from(this.paymentMethods.values())
            .filter(method => method.userId === userId)
            .sort((a, b) => b.created - a.created);
    }

    /**
     * Установка метода платежа по умолчанию
     */
    setDefaultPaymentMethod(userId, paymentMethodId) {
        // Сброс всех методов пользователя
        for (const [id, method] of this.paymentMethods) {
            if (method.userId === userId) {
                method.isDefault = (id === paymentMethodId);
                this.paymentMethods.set(id, method);
            }
        }

        this.saveData();
    }

    /**
     * Удаление метода платежа
     */
    deletePaymentMethod(paymentMethodId) {
        this.paymentMethods.delete(paymentMethodId);
        this.saveData();
    }

    /**
     * Получение платежей пользователя
     */
    getUserPayments(userId, limit = 20) {
        return Array.from(this.paymentIntents.values())
            .filter(payment => payment.userId === userId)
            .sort((a, b) => b.created - a.created)
            .slice(0, limit);
    }

    /**
     * Получение возвратов пользователя
     */
    getUserRefunds(userId, limit = 10) {
        const userPaymentIds = Array.from(this.paymentIntents.values())
            .filter(payment => payment.userId === userId)
            .map(payment => payment.id);

        return Array.from(this.refunds.values())
            .filter(refund => userPaymentIds.includes(refund.paymentIntentId))
            .sort((a, b) => b.created - a.created)
            .slice(0, limit);
    }

    /**
     * Обработка webhook событий
     */
    handleWebhook(event) {
        const eventId = event.id;
        
        // Сохранение webhook события
        this.webhooks.set(eventId, {
            id: eventId,
            type: event.type,
            data: event.data,
            timestamp: Date.now()
        });

        // Обработка различных типов событий
        switch (event.type) {
            case 'payment_intent.succeeded':
                this.handlePaymentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                this.handlePaymentFailed(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                this.handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                this.handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.updated':
                this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                this.handleSubscriptionDeleted(event.data.object);
                break;
        }
    }

    /**
     * Обработка успешного платежа
     */
    handlePaymentSucceeded(paymentIntent) {
        console.log('Платеж успешен:', paymentIntent.id);
        
        // Обновление статуса платежного намерения
        if (this.paymentIntents.has(paymentIntent.id)) {
            const intent = this.paymentIntents.get(paymentIntent.id);
            intent.status = 'succeeded';
            this.paymentIntents.set(paymentIntent.id, intent);
        }

        // Уведомление о успешном платеже
        this.notifyPaymentSuccess(paymentIntent);
    }

    /**
     * Обработка неудачного платежа
     */
    handlePaymentFailed(paymentIntent) {
        console.log('Платеж неудачен:', paymentIntent.id);
        
        // Обновление статуса платежного намерения
        if (this.paymentIntents.has(paymentIntent.id)) {
            const intent = this.paymentIntents.get(paymentIntent.id);
            intent.status = 'requires_payment_method';
            this.paymentIntents.set(paymentIntent.id, intent);
        }

        // Уведомление о неудачном платеже
        this.notifyPaymentFailure(paymentIntent);
    }

    /**
     * Обработка успешной оплаты инвойса
     */
    handleInvoicePaymentSucceeded(invoice) {
        console.log('Инвойс оплачен:', invoice.id);
        // Логика обработки успешной оплаты инвойса
    }

    /**
     * Обработка неудачной оплаты инвойса
     */
    handleInvoicePaymentFailed(invoice) {
        console.log('Оплата инвойса неудачна:', invoice.id);
        // Логика обработки неудачной оплаты инвойса
    }

    /**
     * Обработка обновления подписки
     */
    handleSubscriptionUpdated(subscription) {
        console.log('Подписка обновлена:', subscription.id);
        // Логика обработки обновления подписки
    }

    /**
     * Обработка удаления подписки
     */
    handleSubscriptionDeleted(subscription) {
        console.log('Подписка удалена:', subscription.id);
        // Логика обработки удаления подписки
    }

    /**
     * Уведомление об успешном платеже
     */
    notifyPaymentSuccess(paymentIntent) {
        const event = new CustomEvent('paymentSucceeded', {
            detail: {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Уведомление о неудачном платеже
     */
    notifyPaymentFailure(paymentIntent) {
        const event = new CustomEvent('paymentFailed', {
            detail: {
                paymentIntentId: paymentIntent.id,
                error: paymentIntent.last_payment_error,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка создания метода платежа
        document.addEventListener('createPaymentMethod', (e) => {
            const { userId, paymentData } = e.detail;
            this.createPaymentMethod(userId, paymentData);
        });

        // Обработка создания платежного намерения
        document.addEventListener('createPaymentIntent', (e) => {
            const { userId, amount, currency, paymentMethodId } = e.detail;
            this.createPaymentIntent(userId, amount, currency, paymentMethodId);
        });

        // Обработка подтверждения платежа
        document.addEventListener('confirmPayment', (e) => {
            const { paymentIntentId, paymentMethodId } = e.detail;
            this.confirmPayment(paymentIntentId, paymentMethodId);
        });
    }

    /**
     * Получение статистики платежей
     */
    getPaymentStats() {
        const payments = Array.from(this.paymentIntents.values());
        const successfulPayments = payments.filter(p => p.status === 'succeeded');
        const failedPayments = payments.filter(p => p.status === 'requires_payment_method');

        let totalRevenue = 0;
        for (const payment of successfulPayments) {
            totalRevenue += payment.amount;
        }

        return {
            totalPayments: payments.length,
            successfulPayments: successfulPayments.length,
            failedPayments: failedPayments.length,
            successRate: payments.length > 0 ? 
                (successfulPayments.length / payments.length) * 100 : 0,
            totalRevenue: totalRevenue,
            averagePayment: successfulPayments.length > 0 ? 
                totalRevenue / successfulPayments.length : 0
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим системы платежей');
        
        const testUserId = 'test-user-1';
        
        // Создание тестового метода платежа
        setTimeout(() => {
            this.createPaymentMethod(testUserId, {
                type: 'card',
                card: {
                    number: '4242424242424242',
                    exp_month: 12,
                    exp_year: 2025,
                    cvc: '123'
                },
                billing_details: {
                    name: 'Test User',
                    email: 'test@example.com',
                    address: {
                        country: 'CZ',
                        city: 'Prague',
                        line1: 'Test Street 1'
                    }
                }
            }).then(paymentMethod => {
                console.log('Тестовый метод платежа создан:', paymentMethod);
                
                // Создание тестового платежа
                return this.createPaymentIntent(testUserId, 299, 'CZK', paymentMethod.id);
            }).then(paymentIntent => {
                console.log('Тестовое платежное намерение создано:', paymentIntent);
                
                // Подтверждение платежа
                return this.confirmPayment(paymentIntent.id, paymentIntent.payment_method);
            }).then(result => {
                console.log('Тестовый платеж подтвержден:', result);
            }).catch(error => {
                console.error('Ошибка тестового платежа:', error);
            });
        }, 2000);

        return {
            paymentStats: this.getPaymentStats(),
            currencies: Array.from(this.currencies.values()),
            exchangeRates: Array.from(this.exchangeRates.entries())
        };
    }
}

// Экспорт для использования в других модулях
window.PaymentSystem = PaymentSystem; 