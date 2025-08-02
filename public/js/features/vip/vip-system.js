/**
 * Система VIP/премиум функций для WorkInCZ
 * Поддержка различных уровней подписок и премиум возможностей
 * Европейская система платежей с поддержкой SEPA
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, increment, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const db = getFirestore();
const auth = getAuth();

// Уровни VIP подписок
export const VIPLevel = {
    FREE: 'free',
    BASIC: 'basic',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise'
};

// Типы премиум функций
export const PremiumFeature = {
    // Для соискателей
    PRIORITY_APPLICATIONS: 'priority_applications',
    UNLIMITED_APPLICATIONS: 'unlimited_applications',
    ADVANCED_SEARCH: 'advanced_search',
    RESUME_BUILDER: 'resume_builder',
    INTERVIEW_PREP: 'interview_prep',
    SALARY_INSIGHTS: 'salary_insights',
    DIRECT_MESSAGING: 'direct_messaging',
    PROFILE_BOOST: 'profile_boost',
    
    // Для работодателей
    UNLIMITED_JOBS: 'unlimited_jobs',
    FEATURED_JOBS: 'featured_jobs',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    CANDIDATE_FILTERING: 'candidate_filtering',
    BRANDING_TOOLS: 'branding_tools',
    RECRUITMENT_AI: 'recruitment_ai',
    BULK_MESSAGING: 'bulk_messaging',
    COMPANY_PAGE: 'company_page',
    
    // Для агентств
    AGENCY_DASHBOARD: 'agency_dashboard',
    CLIENT_MANAGEMENT: 'client_management',
    BULK_OPERATIONS: 'bulk_operations',
    WHITE_LABEL: 'white_label',
    API_ACCESS: 'api_access',
    CUSTOM_INTEGRATIONS: 'custom_integrations'
};

// Планы подписок
export const SubscriptionPlans = {
    [VIPLevel.BASIC]: {
        name: 'Basic',
        price: {
            CZK: 299,
            EUR: 12,
            USD: 15
        },
        period: 'month',
        features: [
            PremiumFeature.PRIORITY_APPLICATIONS,
            PremiumFeature.ADVANCED_SEARCH,
            PremiumFeature.RESUME_BUILDER
        ],
        limits: {
            applications: 50,
            jobs: 10,
            messages: 100
        }
    },
    [VIPLevel.PREMIUM]: {
        name: 'Premium',
        price: {
            CZK: 599,
            EUR: 24,
            USD: 30
        },
        period: 'month',
        features: [
            PremiumFeature.PRIORITY_APPLICATIONS,
            PremiumFeature.UNLIMITED_APPLICATIONS,
            PremiumFeature.ADVANCED_SEARCH,
            PremiumFeature.RESUME_BUILDER,
            PremiumFeature.INTERVIEW_PREP,
            PremiumFeature.SALARY_INSIGHTS,
            PremiumFeature.DIRECT_MESSAGING,
            PremiumFeature.PROFILE_BOOST
        ],
        limits: {
            applications: -1, // безлимит
            jobs: 50,
            messages: 500
        }
    },
    [VIPLevel.ENTERPRISE]: {
        name: 'Enterprise',
        price: {
            CZK: 1499,
            EUR: 60,
            USD: 75
        },
        period: 'month',
        features: [
            PremiumFeature.PRIORITY_APPLICATIONS,
            PremiumFeature.UNLIMITED_APPLICATIONS,
            PremiumFeature.ADVANCED_SEARCH,
            PremiumFeature.RESUME_BUILDER,
            PremiumFeature.INTERVIEW_PREP,
            PremiumFeature.SALARY_INSIGHTS,
            PremiumFeature.DIRECT_MESSAGING,
            PremiumFeature.PROFILE_BOOST,
            PremiumFeature.UNLIMITED_JOBS,
            PremiumFeature.FEATURED_JOBS,
            PremiumFeature.ADVANCED_ANALYTICS,
            PremiumFeature.CANDIDATE_FILTERING,
            PremiumFeature.BRANDING_TOOLS,
            PremiumFeature.RECRUITMENT_AI,
            PremiumFeature.BULK_MESSAGING,
            PremiumFeature.COMPANY_PAGE
        ],
        limits: {
            applications: -1,
            jobs: -1,
            messages: -1
        }
    }
};

export class VIPSystem {
    constructor() {
        this.currentUser = null;
        this.userSubscription = null;
        this.userFeatures = new Set();
        this.userLimits = {};
    }

    /**
     * Инициализация системы
     */
    async initialize() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            this.currentUser = user;
            await this.loadUserSubscription();
            await this.loadUserFeatures();
        } catch (error) {
            console.error('Ошибка инициализации VIP системы:', error);
        }
    }

    /**
     * Загрузить подписку пользователя
     */
    async loadUserSubscription() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const subscriptionDoc = await getDocs(query(
                collection(db, 'subscriptions'),
                where('userId', '==', user.uid),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc'),
                limit(1)
            ));

            if (!subscriptionDoc.empty) {
                this.userSubscription = { id: subscriptionDoc.docs[0].id, ...subscriptionDoc.docs[0].data() };
            } else {
                this.userSubscription = {
                    level: VIPLevel.FREE,
                    status: 'active',
                    expiresAt: null
                };
            }
        } catch (error) {
            console.error('Ошибка загрузки подписки:', error);
        }
    }

    /**
     * Загрузить функции пользователя
     */
    async loadUserFeatures() {
        try {
            if (!this.userSubscription) return;

            const plan = SubscriptionPlans[this.userSubscription.level];
            if (plan) {
                this.userFeatures = new Set(plan.features);
                this.userLimits = plan.limits;
            } else {
                this.userFeatures = new Set();
                this.userLimits = {};
            }
        } catch (error) {
            console.error('Ошибка загрузки функций:', error);
        }
    }

    /**
     * Проверить доступ к функции
     */
    hasFeature(feature) {
        return this.userFeatures.has(feature);
    }

    /**
     * Проверить лимит
     */
    async checkLimit(limitType, currentCount = 0) {
        try {
            if (!this.userLimits[limitType]) return true;

            const limit = this.userLimits[limitType];
            if (limit === -1) return true; // безлимит

            return currentCount < limit;
        } catch (error) {
            console.error('Ошибка проверки лимита:', error);
            return false;
        }
    }

    /**
     * Получить текущий лимит
     */
    getLimit(limitType) {
        return this.userLimits[limitType] || 0;
    }

    /**
     * Создать подписку
     */
    async createSubscription(planLevel, paymentMethod, currency = 'CZK') {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            const plan = SubscriptionPlans[planLevel];
            if (!plan) throw new Error('Неверный план подписки');

            // Создать платеж
            const payment = await this.createPayment(plan, paymentMethod, currency);

            if (payment.status === 'success') {
                // Создать подписку
                const subscriptionData = {
                    userId: user.uid,
                    level: planLevel,
                    status: 'active',
                    createdAt: new Date(),
                    expiresAt: this.calculateExpiryDate(plan.period),
                    paymentId: payment.id,
                    currency: currency,
                    amount: plan.price[currency],
                    features: plan.features,
                    limits: plan.limits
                };

                const docRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);

                // Обновить пользователя
                await updateDoc(doc(db, 'users', user.uid), {
                    subscriptionLevel: planLevel,
                    subscriptionId: docRef.id,
                    subscriptionUpdated: new Date()
                });

                // Перезагрузить данные
                await this.loadUserSubscription();
                await this.loadUserFeatures();

                return docRef.id;
            } else {
                throw new Error('Ошибка платежа');
            }
        } catch (error) {
            console.error('Ошибка создания подписки:', error);
            throw error;
        }
    }

    /**
     * Создать платеж
     */
    async createPayment(plan, paymentMethod, currency) {
        try {
            const paymentData = {
                amount: plan.price[currency],
                currency: currency,
                method: paymentMethod,
                status: 'pending',
                createdAt: new Date()
            };

            const docRef = await addDoc(collection(db, 'payments'), paymentData);

            // Интеграция с платежной системой (Stripe, Adyen, etc.)
            const paymentResult = await this.processPayment(paymentData);

            // Обновить статус платежа
            await updateDoc(doc(db, 'payments', docRef.id), {
                status: paymentResult.status,
                transactionId: paymentResult.transactionId,
                updatedAt: new Date()
            });

            return { id: docRef.id, ...paymentResult };
        } catch (error) {
            console.error('Ошибка создания платежа:', error);
            throw error;
        }
    }

    /**
     * Обработать платеж
     */
    async processPayment(paymentData) {
        try {
            // Интеграция с Stripe
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (response.ok) {
                const result = await response.json();
                return {
                    status: 'success',
                    transactionId: result.transactionId
                };
            } else {
                return {
                    status: 'failed',
                    error: 'Payment processing failed'
                };
            }
        } catch (error) {
            console.error('Ошибка обработки платежа:', error);
            return {
                status: 'failed',
                error: error.message
            };
        }
    }

    /**
     * Вычислить дату истечения
     */
    calculateExpiryDate(period) {
        const now = new Date();
        switch (period) {
            case 'month':
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            case 'year':
                return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
    }

    /**
     * Отменить подписку
     */
    async cancelSubscription() {
        try {
            const user = auth.currentUser;
            if (!user || !this.userSubscription) return;

            await updateDoc(doc(db, 'subscriptions', this.userSubscription.id), {
                status: 'cancelled',
                cancelledAt: new Date()
            });

            // Обновить пользователя
            await updateDoc(doc(db, 'users', user.uid), {
                subscriptionLevel: VIPLevel.FREE,
                subscriptionUpdated: new Date()
            });

            // Перезагрузить данные
            await this.loadUserSubscription();
            await this.loadUserFeatures();
        } catch (error) {
            console.error('Ошибка отмены подписки:', error);
            throw error;
        }
    }

    /**
     * Обновить подписку
     */
    async upgradeSubscription(newPlanLevel) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            // Отменить текущую подписку
            if (this.userSubscription && this.userSubscription.id) {
                await this.cancelSubscription();
            }

            // Создать новую подписку
            return await this.createSubscription(newPlanLevel, 'card', 'CZK');
        } catch (error) {
            console.error('Ошибка обновления подписки:', error);
            throw error;
        }
    }

    /**
     * Получить информацию о подписке
     */
    getSubscriptionInfo() {
        if (!this.userSubscription) {
            return {
                level: VIPLevel.FREE,
                status: 'active',
                expiresAt: null,
                features: [],
                limits: {}
            };
        }

        const plan = SubscriptionPlans[this.userSubscription.level];
        return {
            ...this.userSubscription,
            features: plan ? plan.features : [],
            limits: plan ? plan.limits : {}
        };
    }

    /**
     * Получить доступные планы
     */
    getAvailablePlans() {
        return SubscriptionPlans;
    }

    /**
     * Проверить истечение подписки
     */
    async checkSubscriptionExpiry() {
        try {
            if (!this.userSubscription || !this.userSubscription.expiresAt) return;

            const now = new Date();
            const expiryDate = this.userSubscription.expiresAt.toDate();

            if (now > expiryDate) {
                // Подписка истекла
                await updateDoc(doc(db, 'subscriptions', this.userSubscription.id), {
                    status: 'expired',
                    expiredAt: new Date()
                });

                // Обновить пользователя
                const user = auth.currentUser;
                if (user) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        subscriptionLevel: VIPLevel.FREE,
                        subscriptionUpdated: new Date()
                    });
                }

                // Перезагрузить данные
                await this.loadUserSubscription();
                await this.loadUserFeatures();
            }
        } catch (error) {
            console.error('Ошибка проверки истечения подписки:', error);
        }
    }

    /**
     * Создать виджет VIP статуса
     */
    createVIPWidget(container) {
        const widget = document.createElement('div');
        widget.className = 'vip-widget bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white';
        
        const subscriptionInfo = this.getSubscriptionInfo();
        const plan = SubscriptionPlans[subscriptionInfo.level];

        widget.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold">${plan ? plan.name : 'Free'} Plan</h3>
                    <p class="text-sm opacity-90">${subscriptionInfo.status}</p>
                    ${subscriptionInfo.expiresAt ? `<p class="text-xs opacity-75">Истекает: ${subscriptionInfo.expiresAt.toDate().toLocaleDateString()}</p>` : ''}
                </div>
                <div class="text-right">
                    ${subscriptionInfo.level !== VIPLevel.FREE ? 
                        `<button class="bg-white text-orange-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100" onclick="vipSystem.showUpgradeModal()">Обновить</button>` :
                        `<button class="bg-white text-orange-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100" onclick="vipSystem.showUpgradeModal()">Получить VIP</button>`
                    }
                </div>
            </div>
        `;

        container.appendChild(widget);
    }

    /**
     * Показать модальное окно обновления
     */
    showUpgradeModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 class="text-2xl font-bold mb-4">Выберите план</h2>
                <div class="space-y-4">
                    ${Object.entries(SubscriptionPlans).map(([level, plan]) => `
                        <div class="border rounded-lg p-4 ${this.userSubscription?.level === level ? 'border-blue-500 bg-blue-50' : ''}">
                            <h3 class="font-bold">${plan.name}</h3>
                            <p class="text-2xl font-bold text-blue-600">${plan.price.CZK} CZK/мес</p>
                            <ul class="text-sm text-gray-600 mt-2">
                                ${plan.features.slice(0, 3).map(feature => `<li>• ${this.getFeatureName(feature)}</li>`).join('')}
                                ${plan.features.length > 3 ? `<li>• и еще ${plan.features.length - 3} функций</li>` : ''}
                            </ul>
                            <button class="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700" 
                                    onclick="vipSystem.selectPlan('${level}')">
                                ${this.userSubscription?.level === level ? 'Текущий план' : 'Выбрать'}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="w-full mt-4 text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Выбрать план
     */
    async selectPlan(planLevel) {
        try {
            if (this.userSubscription?.level === planLevel) {
                alert('Это ваш текущий план');
                return;
            }

            await this.upgradeSubscription(planLevel);
            alert('Подписка успешно обновлена!');
            location.reload();
        } catch (error) {
            alert('Ошибка обновления подписки: ' + error.message);
        }
    }

    /**
     * Получить название функции
     */
    getFeatureName(feature) {
        const names = {
            [PremiumFeature.PRIORITY_APPLICATIONS]: 'Приоритетные заявки',
            [PremiumFeature.UNLIMITED_APPLICATIONS]: 'Безлимитные заявки',
            [PremiumFeature.ADVANCED_SEARCH]: 'Расширенный поиск',
            [PremiumFeature.RESUME_BUILDER]: 'Конструктор резюме',
            [PremiumFeature.INTERVIEW_PREP]: 'Подготовка к собеседованию',
            [PremiumFeature.SALARY_INSIGHTS]: 'Анализ зарплат',
            [PremiumFeature.DIRECT_MESSAGING]: 'Прямые сообщения',
            [PremiumFeature.PROFILE_BOOST]: 'Продвижение профиля',
            [PremiumFeature.UNLIMITED_JOBS]: 'Безлимитные вакансии',
            [PremiumFeature.FEATURED_JOBS]: 'Рекомендуемые вакансии',
            [PremiumFeature.ADVANCED_ANALYTICS]: 'Расширенная аналитика',
            [PremiumFeature.CANDIDATE_FILTERING]: 'Фильтрация кандидатов',
            [PremiumFeature.BRANDING_TOOLS]: 'Инструменты брендинга',
            [PremiumFeature.RECRUITMENT_AI]: 'AI для рекрутинга',
            [PremiumFeature.BULK_MESSAGING]: 'Массовые сообщения',
            [PremiumFeature.COMPANY_PAGE]: 'Страница компании'
        };
        return names[feature] || feature;
    }
}

// Глобальный экземпляр VIP системы
export const vipSystem = new VIPSystem();