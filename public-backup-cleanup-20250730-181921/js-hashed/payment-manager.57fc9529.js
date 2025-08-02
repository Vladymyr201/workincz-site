// PAYMENT MANAGER - Управление платежами Stripe для WorkInCZ
// Гибридная модель: разовые услуги + success-fee + подписки

class PaymentManager {
    constructor() {
        this.stripe = null;
        this.isStripeLoaded = false;
        this.init();
    }

    // Инициализация Stripe
    async init() {
        try {
            // Загружаем Stripe.js
            if (!window.Stripe) {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.onload = () => this.initStripe();
                document.head.appendChild(script);
            } else {
                this.initStripe();
            }
        } catch (error) {
            console.error('Ошибка инициализации Stripe:', error);
        }
    }

    // Настройка Stripe с публичным ключом
    initStripe() {
        // В production замените на реальный публичный ключ
        const publishableKey = 'pk_test_51234567890'; // Заменить на реальный ключ
        this.stripe = Stripe(publishableKey);
        this.isStripeLoaded = true;
        console.log('✅ Stripe успешно инициализирован');
    }

    // ====== РАЗОВЫЕ УСЛУГИ ЭТАПА 1 ======

    // 🔥 Горячее объявление (400 Kč / 7 дней)
    async purchaseFeaturedJob(jobId, jobTitle) {
        if (!this.isStripeLoaded) {
            throw new Error('Stripe не загружен');
        }

        const amount = 40000; // 400 Kč в центах
        const currency = 'czk';
        
        try {
            // Создаем платежный intent на сервере (Firebase Functions)
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    service: 'featured_job',
                    metadata: {
                        jobId: jobId,
                        jobTitle: jobTitle,
                        duration: '7_days'
                    }
                })
            });

            const { clientSecret } = await response.json();

            // Запускаем процесс оплаты
            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: AuthManager.currentUser?.displayName || 'Пользователь WorkInCZ'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Обновляем статус вакансии в Firestore
                await this.updateJobAsFeatured(jobId);
                return { success: true, paymentId: paymentIntent.id };
            }

        } catch (error) {
            console.error('Ошибка покупки горячего объявления:', error);
            throw error;
        }
    }

    // ✅ Верификация профиля (250 Kč)
    async purchaseProfileVerification(userId) {
        if (!this.isStripeLoaded) {
            throw new Error('Stripe не загружен');
        }

        const amount = 25000; // 250 Kč в центах
        const currency = 'czk';
        
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    service: 'profile_verification',
                    metadata: {
                        userId: userId
                    }
                })
            });

            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: AuthManager.currentUser?.displayName || 'Пользователь WorkInCZ'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Запускаем процесс верификации
                await this.initiateProfileVerification(userId);
                return { success: true, paymentId: paymentIntent.id };
            }

        } catch (error) {
            console.error('Ошибка покупки верификации:', error);
            throw error;
        }
    }

    // 📈 Продвижение резюме (200 Kč / 5 дней)
    async purchaseResumePromotion(userId) {
        if (!this.isStripeLoaded) {
            throw new Error('Stripe не загружен');
        }

        const amount = 20000; // 200 Kč в центах
        const currency = 'czk';
        
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    service: 'resume_promotion',
                    metadata: {
                        userId: userId,
                        duration: '5_days'
                    }
                })
            });

            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: AuthManager.currentUser?.displayName || 'Пользователь WorkInCZ'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Активируем продвижение резюме
                await this.activateResumePromotion(userId);
                return { success: true, paymentId: paymentIntent.id };
            }

        } catch (error) {
            console.error('Ошибка покупки продвижения резюме:', error);
            throw error;
        }
    }

    // ====== ГИБРИДНАЯ МОДЕЛЬ: SUCCESS-FEE ПЛАТЕЖИ ======

    // 💰 Success-fee для агентств (5-15% от зарплаты кандидата)
    async processSuccessFeePayment(contractId, candidateId, salaryAmount) {
        if (!this.isStripeLoaded) {
            throw new Error('Stripe не загружен');
        }

        // Рассчитываем success-fee (5-15% от зарплаты)
        const successFeePercentage = 0.10; // 10% по умолчанию
        const successFeeAmount = Math.round(salaryAmount * successFeePercentage);
        const amountInCents = successFeeAmount * 100; // Конвертируем в центы

        try {
            const response = await fetch('/api/create-success-fee-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amountInCents,
                    currency: 'czk',
                    service: 'success_fee',
                    metadata: {
                        contractId: contractId,
                        candidateId: candidateId,
                        agencyId: this.currentUser?.uid,
                        salaryAmount: salaryAmount,
                        successFeeAmount: successFeeAmount,
                        successFeePercentage: successFeePercentage
                    }
                })
            });

            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: AuthManager.currentUser?.displayName || 'Агентство WorkInCZ'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Обновляем статус контракта
                await this.updateContractPaymentStatus(contractId, 'paid');
                return { success: true, paymentId: paymentIntent.id, amount: successFeeAmount };
            }

        } catch (error) {
            console.error('Ошибка обработки success-fee:', error);
            throw error;
        }
    }

    // 🏢 Подписка агентства (Premium Agency - 2,990 Kč/мес)
    async subscribeAgencyPremium(agencyId) {
        if (!this.isStripeLoaded) {
            throw new Error('Stripe не загружен');
        }

        try {
            const response = await fetch('/api/create-agency-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agencyId: agencyId,
                    plan: 'premium_agency',
                    priceId: 'price_premium_agency_monthly', // ID тарифа в Stripe
                    metadata: {
                        agencyId: agencyId,
                        plan: 'premium_agency'
                    }
                })
            });

            const { subscriptionId, clientSecret } = await response.json();

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: this.cardElement,
                    billing_details: {
                        name: AuthManager.currentUser?.displayName || 'Агентство WorkInCZ'
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Активируем подписку агентства
                await this.activateAgencySubscription(agencyId, subscriptionId);
                return { success: true, subscriptionId: subscriptionId };
            }

        } catch (error) {
            console.error('Ошибка подписки агентства:', error);
            throw error;
        }
    }

    // 💳 Stripe Connect для агентств (комиссия с каждой сделки)
    async setupStripeConnectAccount(agencyId) {
        try {
            const response = await fetch('/api/create-connect-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agencyId: agencyId,
                    country: 'CZ',
                    type: 'express'
                })
            });

            const { accountId, accountLink } = await response.json();

            // Сохраняем account ID в профиле агентства
            await this.updateAgencyStripeAccount(agencyId, accountId);

            // Перенаправляем на настройку аккаунта
            window.location.href = accountLink;

        } catch (error) {
            console.error('Ошибка создания Stripe Connect аккаунта:', error);
            throw error;
        }
    }

    // ====== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ======

    // Обновление статуса контракта после оплаты
    async updateContractPaymentStatus(contractId, status) {
        try {
            const contractRef = this.db.collection('contracts').doc(contractId);
            await contractRef.update({
                payment_status: status,
                paid_at: new Date(),
                updated_at: new Date()
            });

            console.log(`✅ Статус контракта ${contractId} обновлен на ${status}`);
        } catch (error) {
            console.error('Ошибка обновления статуса контракта:', error);
            throw error;
        }
    }

    // Активация подписки агентства
    async activateAgencySubscription(agencyId, subscriptionId) {
        try {
            const agencyRef = this.db.collection('users').doc(agencyId);
            await agencyRef.update({
                'subscription.type': 'premium_agency',
                'subscription.stripe_subscription_id': subscriptionId,
                'subscription.expires_at': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
                'is_premium': true,
                updated_at: new Date()
            });

            console.log(`✅ Подписка агентства ${agencyId} активирована`);
        } catch (error) {
            console.error('Ошибка активации подписки агентства:', error);
            throw error;
        }
    }

    // Обновление Stripe Connect аккаунта агентства
    async updateAgencyStripeAccount(agencyId, accountId) {
        try {
            const agencyRef = this.db.collection('users').doc(agencyId);
            await agencyRef.update({
                'stripe_connect.account_id': accountId,
                'stripe_connect.status': 'pending',
                updated_at: new Date()
            });

            console.log(`✅ Stripe Connect аккаунт для агентства ${agencyId} сохранен`);
        } catch (error) {
            console.error('Ошибка сохранения Stripe Connect аккаунта:', error);
            throw error;
        }
    }

    // Обновление статуса вакансии как "горячая"
    async updateJobAsFeatured(jobId) {
        try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7); // +7 дней

            await db.collection('jobs').doc(jobId).update({
                is_featured: true,
                featured_until: expirationDate,
                featured_purchased_at: new Date()
            });

            console.log(`✅ Вакансия ${jobId} помечена как горячая до ${expirationDate}`);
        } catch (error) {
            console.error('Ошибка обновления статуса вакансии:', error);
            throw error;
        }
    }

    // Запуск процесса верификации профиля
    async initiateProfileVerification(userId) {
        try {
            await db.collection('users').doc(userId).update({
                verification_requested: true,
                verification_paid: true,
                verification_status: 'pending',
                verification_requested_at: new Date()
            });

            // Создаем запрос на верификацию для админов
            await db.collection('verification_requests').add({
                userId: userId,
                requestedAt: new Date(),
                status: 'pending',
                type: 'profile_verification'
            });

            console.log(`✅ Запрос на верификацию создан для пользователя ${userId}`);
        } catch (error) {
            console.error('Ошибка запуска верификации:', error);
            throw error;
        }
    }

    // Активация продвижения резюме
    async activateResumePromotion(userId) {
        try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 5); // +5 дней

            await db.collection('users').doc(userId).update({
                resume_promoted: true,
                promoted_until: expirationDate,
                promotion_purchased_at: new Date()
            });

            console.log(`✅ Резюме пользователя ${userId} продвигается до ${expirationDate}`);
        } catch (error) {
            console.error('Ошибка активации продвижения резюме:', error);
            throw error;
        }
    }

    // Создание элемента карты для ввода данных
    createCardElement(containerId) {
        if (!this.stripe) {
                          console.log('🔧 Stripe загружается, ожидаем...');
            return;
        }

        const elements = this.stripe.elements();
        this.cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        this.cardElement.mount(`#${containerId}`);
        
        // Обработка ошибок ввода карты
        this.cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    // Форматирование цены в чешских кронах
    formatPrice(amountInCents, currency = 'CZK') {
        const amount = amountInCents / 100;
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Проверка статуса платежа
    async checkPaymentStatus(paymentIntentId) {
        try {
            const response = await fetch(`/api/payment-status/${paymentIntentId}`);
            const { status } = await response.json();
            return status;
        } catch (error) {
            console.error('Ошибка проверки статуса платежа:', error);
            throw error;
        }
    }
}

// ====== UI КОМПОНЕНТЫ ДЛЯ ПЛАТЕЖЕЙ ======

// Модальное окно покупки горячего объявления
function openFeaturedJobModal(jobId, jobTitle) {
    const modal = `
        <div id="featured-job-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold">🔥 Горячее объявление</h3>
                    <button onclick="closeFeaturedJobModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="ri-close-line text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-red-600 font-medium">⚡ ГОРЯЧАЯ ВАКАНСИЯ</span>
                        </div>
                        <p class="text-sm text-gray-600">Ваше объявление будет:</p>
                        <ul class="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Выделено красной рамкой</li>
                            <li>• Показываться в топе списка</li>
                            <li>• Помечено значком ⚡</li>
                            <li>• Активно 7 дней</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-3xl font-bold text-primary mb-2">400 Kč</div>
                        <div class="text-gray-500">за 7 дней продвижения</div>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Данные карты</label>
                    <div id="card-element" class="border border-gray-300 rounded-lg p-3">
                        <!-- Stripe Elements создаст здесь поле ввода карты -->
                    </div>
                    <div id="card-errors" class="text-red-600 text-sm mt-2"></div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closeFeaturedJobModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Отмена
                    </button>
                    <button onclick="processFeaturedJobPayment('${jobId}', '${jobTitle}')" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                        Оплатить 400 Kč
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Создаем элемент карты
    setTimeout(() => {
        paymentManager.createCardElement('card-element');
    }, 100);
}

// Закрытие модального окна
function closeFeaturedJobModal() {
    const modal = document.getElementById('featured-job-modal');
    if (modal) {
        modal.remove();
    }
}

// Обработка платежа за горячее объявление
async function processFeaturedJobPayment(jobId, jobTitle) {
    try {
        showLoadingState();
        const result = await paymentManager.purchaseFeaturedJob(jobId, jobTitle);
        
        if (result.success) {
            closeFeaturedJobModal();
            showSuccessMessage('🔥 Ваше объявление теперь горячее! Оно будет выделено 7 дней.');
            // Обновляем отображение на странице
            updateJobCardAsFeatured(jobId);
        }
    } catch (error) {
        showErrorMessage('Ошибка оплаты: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Показ сообщений пользователю
function showSuccessMessage(message) {
    const toast = `
        <div id="success-toast" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div class="flex items-center gap-2">
                <i class="ri-check-circle-line"></i>
                <span>${message}</span>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toast);
    
    setTimeout(() => {
        const toastEl = document.getElementById('success-toast');
        if (toastEl) toastEl.remove();
    }, 5000);
}

function showErrorMessage(message) {
    const toast = `
        <div id="error-toast" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div class="flex items-center gap-2">
                <i class="ri-error-warning-line"></i>
                <span>${message}</span>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toast);
    
    setTimeout(() => {
        const toastEl = document.getElementById('error-toast');
        if (toastEl) toastEl.remove();
    }, 5000);
}

function showLoadingState() {
    // Добавляем состояние загрузки к кнопке
    const button = document.querySelector('[onclick*="processFeaturedJobPayment"]');
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Обработка...';
    }
}

function hideLoadingState() {
    const button = document.querySelector('[onclick*="processFeaturedJobPayment"]');
    if (button) {
        button.disabled = false;
        button.innerHTML = 'Оплатить 400 Kč';
    }
}

// Обновление карточки вакансии как "горячая"
function updateJobCardAsFeatured(jobId) {
    const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
    if (jobCard) {
        // Добавляем красную рамку и значок
        jobCard.classList.add('border-red-500', 'border-2');
        
        // Добавляем значок "горячая"
        const titleElement = jobCard.querySelector('h3');
        if (titleElement && !titleElement.querySelector('.featured-badge')) {
            titleElement.insertAdjacentHTML('afterbegin', '<span class="featured-badge mr-2">⚡</span>');
        }
        
        // Перемещаем в топ списка
        const container = jobCard.parentElement;
        container.insertBefore(jobCard, container.firstChild);
    }
}

// Инициализация менеджера платежей
const paymentManager = new PaymentManager();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentManager;
} 