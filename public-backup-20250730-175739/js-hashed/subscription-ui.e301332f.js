/**
 * UI компоненты для системы подписок
 * Интерфейс управления подписками, выбора планов и платежей
 */

class SubscriptionUI {
    constructor(subscriptionSystem, paymentSystem) {
        this.subscriptionSystem = subscriptionSystem;
        this.paymentSystem = paymentSystem;
        this.currentUser = null;
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация UI подписок
     */
    init() {
        this.createSubscriptionUI();
        this.setupEventListeners();
        console.log('💳 UI подписок инициализирован');
    }

    /**
     * Создание UI компонентов подписок
     */
    createSubscriptionUI() {
        // Создание модального окна подписок
        const modal = document.createElement('div');
        modal.id = 'subscriptionModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                            <span class="mr-2">💳</span>
                            Управление подпиской
                        </h3>
                        <button id="closeSubscriptionModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Текущая подписка -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="text-lg font-semibold mb-4">📋 Текущая подписка</h4>
                                <div id="currentSubscription" class="space-y-3">
                                    <div class="text-center text-gray-500 py-8">
                                        Загрузка...
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Методы платежей -->
                            <div class="bg-gray-50 rounded-lg p-4 mt-4">
                                <h4 class="text-lg font-semibold mb-4">💳 Методы платежей</h4>
                                <div id="paymentMethods" class="space-y-2">
                                    <div class="text-center text-gray-500 py-4">
                                        Загрузка...
                                    </div>
                                </div>
                                <button id="addPaymentMethod" class="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                    + Добавить карту
                                </button>
                            </div>
                        </div>
                        
                        <!-- Планы подписок -->
                        <div class="lg:col-span-2">
                            <h4 class="text-lg font-semibold mb-4">📦 Доступные планы</h4>
                            <div id="subscriptionPlans" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="text-center text-gray-500 py-8">
                                    Загрузка планов...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Создание модального окна для добавления метода платежа
        const paymentModal = document.createElement('div');
        paymentModal.id = 'paymentMethodModal';
        paymentModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        paymentModal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-800">💳 Добавить карту</h3>
                        <button id="closePaymentMethodModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="paymentMethodForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Номер карты</label>
                            <input type="text" id="cardNumber" class="w-full border border-gray-300 rounded px-3 py-2" 
                                   placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Месяц/Год</label>
                                <input type="text" id="cardExpiry" class="w-full border border-gray-300 rounded px-3 py-2" 
                                       placeholder="MM/YY" maxlength="5">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                <input type="text" id="cardCvc" class="w-full border border-gray-300 rounded px-3 py-2" 
                                       placeholder="123" maxlength="4">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Имя владельца</label>
                            <input type="text" id="cardholderName" class="w-full border border-gray-300 rounded px-3 py-2" 
                                   placeholder="John Doe">
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" id="cancelPaymentMethod" class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                Отмена
                            </button>
                            <button type="submit" id="savePaymentMethod" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Сохранить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(paymentModal);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeSubscriptionModal') {
                this.hideModal();
            }
            if (e.target.id === 'closePaymentMethodModal') {
                this.hidePaymentMethodModal();
            }
            if (e.target.id === 'cancelPaymentMethod') {
                this.hidePaymentMethodModal();
            }
        });

        // Закрытие по клику вне модального окна
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('subscriptionModal');
            if (e.target === modal) {
                this.hideModal();
            }
            
            const paymentModal = document.getElementById('paymentMethodModal');
            if (e.target === paymentModal) {
                this.hidePaymentMethodModal();
            }
        });

        // Добавление метода платежа
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addPaymentMethod') {
                this.showPaymentMethodModal();
            }
        });

        // Форма добавления метода платежа
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'paymentMethodForm') {
                e.preventDefault();
                this.handleAddPaymentMethod();
            }
        });

        // Обработка событий подписок
        document.addEventListener('subscriptionChanged', (e) => {
            this.updateCurrentSubscription();
        });

        document.addEventListener('subscriptionCancelled', (e) => {
            this.updateCurrentSubscription();
        });

        document.addEventListener('subscriptionRenewed', (e) => {
            this.updateCurrentSubscription();
        });
    }

    /**
     * Показать модальное окно подписок
     */
    showModal(userId = null) {
        this.currentUser = userId || 'current-user';
        const modal = document.getElementById('subscriptionModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isVisible = true;
            this.loadSubscriptionData();
        }
    }

    /**
     * Скрыть модальное окно подписок
     */
    hideModal() {
        const modal = document.getElementById('subscriptionModal');
        if (modal) {
            modal.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * Показать модальное окно метода платежа
     */
    showPaymentMethodModal() {
        const modal = document.getElementById('paymentMethodModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Скрыть модальное окно метода платежа
     */
    hidePaymentMethodModal() {
        const modal = document.getElementById('paymentMethodModal');
        if (modal) {
            modal.classList.add('hidden');
            this.resetPaymentMethodForm();
        }
    }

    /**
     * Сброс формы метода платежа
     */
    resetPaymentMethodForm() {
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvc').value = '';
        document.getElementById('cardholderName').value = '';
    }

    /**
     * Загрузка данных подписки
     */
    loadSubscriptionData() {
        this.updateCurrentSubscription();
        this.updateSubscriptionPlans();
        this.updatePaymentMethods();
    }

    /**
     * Обновление текущей подписки
     */
    updateCurrentSubscription() {
        if (!this.currentUser) return;

        const subscription = this.subscriptionSystem.getUserSubscription(this.currentUser);
        const plan = this.subscriptionSystem.subscriptionPlans.get(subscription.planId);
        const container = document.getElementById('currentSubscription');

        if (!container) return;

        const statusColor = {
            active: 'text-green-600',
            cancelled: 'text-red-600',
            expired: 'text-yellow-600'
        }[subscription.status] || 'text-gray-600';

        const statusText = {
            active: 'Активна',
            cancelled: 'Отменена',
            expired: 'Истекла'
        }[subscription.status] || subscription.status;

        container.innerHTML = `
            <div class="bg-white rounded-lg p-4 border">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-semibold text-gray-800">${plan.name}</h5>
                    <span class="text-sm px-2 py-1 rounded ${statusColor} bg-gray-100">
                        ${statusText}
                    </span>
                </div>
                
                <div class="text-sm text-gray-600 mb-3">
                    ${plan.description}
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Цена:</span>
                        <span class="font-medium">${this.paymentSystem.formatPrice(plan.price, plan.currency)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Период:</span>
                        <span class="font-medium">${this.getIntervalText(plan.interval)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Начало:</span>
                        <span class="font-medium">${new Date(subscription.startDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    ${subscription.endDate ? `
                        <div class="flex justify-between">
                            <span>Окончание:</span>
                            <span class="font-medium">${new Date(subscription.endDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between">
                        <span>Автопродление:</span>
                        <span class="font-medium">${subscription.autoRenew ? 'Включено' : 'Отключено'}</span>
                    </div>
                </div>
                
                <div class="mt-4 space-y-2">
                    ${subscription.status === 'active' ? `
                        <button id="cancelSubscriptionBtn" class="w-full px-3 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors">
                            Отменить подписку
                        </button>
                    ` : subscription.status === 'cancelled' ? `
                        <button id="renewSubscriptionBtn" class="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Возобновить подписку
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Добавление обработчиков для кнопок
        const cancelBtn = document.getElementById('cancelSubscriptionBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancelSubscription();
            });
        }

        const renewBtn = document.getElementById('renewSubscriptionBtn');
        if (renewBtn) {
            renewBtn.addEventListener('click', () => {
                this.handleRenewSubscription();
            });
        }
    }

    /**
     * Обновление планов подписок
     */
    updateSubscriptionPlans() {
        const container = document.getElementById('subscriptionPlans');
        if (!container) return;

        const currentSubscription = this.subscriptionSystem.getUserSubscription(this.currentUser);
        const plans = Array.from(this.subscriptionSystem.subscriptionPlans.values());

        const plansHTML = plans.map(plan => {
            const isCurrentPlan = plan.id === currentSubscription.planId;
            const isUpgrade = this.isUpgrade(currentSubscription.planId, plan.id);
            const isDowngrade = this.isDowngrade(currentSubscription.planId, plan.id);

            return `
                <div class="bg-white rounded-lg border p-6 ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}">
                    <div class="text-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${plan.name}</h3>
                        <div class="text-3xl font-bold text-blue-600 mt-2">
                            ${this.paymentSystem.formatPrice(plan.price, plan.currency)}
                            <span class="text-sm text-gray-500">/${this.getIntervalText(plan.interval)}</span>
                        </div>
                        <p class="text-gray-600 mt-2">${plan.description}</p>
                    </div>
                    
                    <div class="space-y-2 mb-6">
                        ${plan.features.map(feature => `
                            <div class="flex items-center text-sm">
                                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                ${feature}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="space-y-2">
                        ${isCurrentPlan ? `
                            <button class="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">
                                Текущий план
                            </button>
                        ` : isUpgrade ? `
                            <button class="upgrade-plan-btn w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
                                    data-plan-id="${plan.id}">
                                Перейти на ${plan.name}
                            </button>
                        ` : isDowngrade ? `
                            <button class="downgrade-plan-btn w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors" 
                                    data-plan-id="${plan.id}">
                                Перейти на ${plan.name}
                            </button>
                        ` : `
                            <button class="subscribe-plan-btn w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors" 
                                    data-plan-id="${plan.id}">
                                Выбрать ${plan.name}
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = plansHTML;

        // Добавление обработчиков для кнопок планов
        container.querySelectorAll('.upgrade-plan-btn, .downgrade-plan-btn, .subscribe-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const planId = e.target.dataset.planId;
                this.handlePlanSelection(planId);
            });
        });
    }

    /**
     * Обновление методов платежей
     */
    updatePaymentMethods() {
        const container = document.getElementById('paymentMethods');
        if (!container) return;

        const paymentMethods = this.paymentSystem.getUserPaymentMethods(this.currentUser);

        if (paymentMethods.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    Нет сохраненных карт
                </div>
            `;
            return;
        }

        const methodsHTML = paymentMethods.map(method => `
            <div class="flex items-center justify-between p-3 bg-white rounded border">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span class="text-blue-600 font-bold">${method.card.brand.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-800">
                            ${method.card.brand} •••• ${method.card.last4}
                        </div>
                        <div class="text-sm text-gray-500">
                            Истекает ${method.card.exp_month}/${method.card.exp_year}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${method.isDefault ? `
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">По умолчанию</span>
                    ` : ''}
                    <button class="delete-payment-method text-red-500 hover:text-red-700" data-method-id="${method.id}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = methodsHTML;

        // Добавление обработчиков для удаления методов платежей
        container.querySelectorAll('.delete-payment-method').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const methodId = e.target.closest('button').dataset.methodId;
                this.handleDeletePaymentMethod(methodId);
            });
        });
    }

    /**
     * Обработка выбора плана
     */
    async handlePlanSelection(planId) {
        try {
            const plan = this.subscriptionSystem.subscriptionPlans.get(planId);
            if (!plan) return;

            // Проверка наличия методов платежей
            const paymentMethods = this.paymentSystem.getUserPaymentMethods(this.currentUser);
            
            if (paymentMethods.length === 0) {
                alert('Сначала добавьте метод платежа');
                this.showPaymentMethodModal();
                return;
            }

            const defaultPaymentMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];

            // Подписка на план
            await this.subscriptionSystem.subscribeToPlan(
                this.currentUser,
                planId,
                defaultPaymentMethod.id
            );

            this.showSuccessMessage(`Успешно подписались на план ${plan.name}`);
            this.updateCurrentSubscription();
            this.updateSubscriptionPlans();
        } catch (error) {
            this.showErrorMessage('Ошибка при подписке: ' + error.message);
        }
    }

    /**
     * Обработка отмены подписки
     */
    handleCancelSubscription() {
        if (confirm('Вы уверены, что хотите отменить подписку?')) {
            this.subscriptionSystem.cancelSubscription(this.currentUser);
            this.showSuccessMessage('Подписка отменена');
            this.updateCurrentSubscription();
            this.updateSubscriptionPlans();
        }
    }

    /**
     * Обработка возобновления подписки
     */
    async handleRenewSubscription() {
        try {
            await this.subscriptionSystem.renewSubscription(this.currentUser);
            this.showSuccessMessage('Подписка возобновлена');
            this.updateCurrentSubscription();
            this.updateSubscriptionPlans();
        } catch (error) {
            this.showErrorMessage('Ошибка при возобновлении подписки: ' + error.message);
        }
    }

    /**
     * Обработка добавления метода платежа
     */
    async handleAddPaymentMethod() {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvc = document.getElementById('cardCvc').value;
        const cardholderName = document.getElementById('cardholderName').value;

        if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
            this.showErrorMessage('Заполните все поля');
            return;
        }

        try {
            const [expMonth, expYear] = cardExpiry.split('/');
            
            const paymentData = {
                type: 'card',
                card: {
                    number: cardNumber.replace(/\s/g, ''),
                    exp_month: parseInt(expMonth),
                    exp_year: parseInt('20' + expYear),
                    cvc: cardCvc
                },
                billing_details: {
                    name: cardholderName,
                    email: 'user@example.com'
                }
            };

            await this.paymentSystem.createPaymentMethod(this.currentUser, paymentData);
            
            this.showSuccessMessage('Метод платежа добавлен');
            this.hidePaymentMethodModal();
            this.updatePaymentMethods();
        } catch (error) {
            this.showErrorMessage('Ошибка при добавлении карты: ' + error.message);
        }
    }

    /**
     * Обработка удаления метода платежа
     */
    handleDeletePaymentMethod(methodId) {
        if (confirm('Удалить этот метод платежа?')) {
            this.paymentSystem.deletePaymentMethod(methodId);
            this.showSuccessMessage('Метод платежа удален');
            this.updatePaymentMethods();
        }
    }

    /**
     * Проверка является ли переход апгрейдом
     */
    isUpgrade(currentPlanId, newPlanId) {
        const planOrder = ['free', 'premium', 'business', 'enterprise'];
        const currentIndex = planOrder.indexOf(currentPlanId);
        const newIndex = planOrder.indexOf(newPlanId);
        return newIndex > currentIndex;
    }

    /**
     * Проверка является ли переход даунгрейдом
     */
    isDowngrade(currentPlanId, newPlanId) {
        const planOrder = ['free', 'premium', 'business', 'enterprise'];
        const currentIndex = planOrder.indexOf(currentPlanId);
        const newIndex = planOrder.indexOf(newPlanId);
        return newIndex < currentIndex;
    }

    /**
     * Получение текста интервала
     */
    getIntervalText(interval) {
        const intervals = {
            month: 'месяц',
            year: 'год'
        };
        return intervals[interval] || interval;
    }

    /**
     * Показать сообщение об успехе
     */
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Показать сообщение об ошибке
     */
    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Создание кнопки для открытия подписок
     */
    createSubscriptionButton() {
        const button = document.createElement('button');
        button.id = 'openSubscriptionModal';
        button.className = 'fixed bottom-4 right-20 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
        `;
        button.title = 'Управление подпиской';

        button.addEventListener('click', () => {
            this.showModal();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку подписок в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const subscriptionNavItem = document.createElement('div');
            subscriptionNavItem.className = 'flex items-center space-x-2';
            subscriptionNavItem.innerHTML = `
                <button id="navSubscription" class="text-gray-600 hover:text-blue-500 transition-colors flex items-center space-x-1">
                    <span>💳</span>
                    <span class="hidden md:inline">Подписка</span>
                </button>
            `;
            
            nav.appendChild(subscriptionNavItem);
            
            document.getElementById('navSubscription').addEventListener('click', () => {
                this.showModal();
            });
        }

        // Создаем плавающую кнопку
        this.createSubscriptionButton();
    }

    /**
     * Получение статистики UI
     */
    getStats() {
        return {
            isVisible: this.isVisible,
            currentUser: this.currentUser,
            subscriptionSystemStats: this.subscriptionSystem.getSystemStats(),
            paymentSystemStats: this.paymentSystem.getPaymentStats()
        };
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим UI подписок');
        
        // Показываем модальное окно
        this.showModal('test-user-1');
        
        return {
            stats: this.getStats(),
            subscriptionSystemStats: this.subscriptionSystem.getSystemStats(),
            paymentSystemStats: this.paymentSystem.getPaymentStats()
        };
    }
}

// Экспорт для использования в других модулях
window.SubscriptionUI = SubscriptionUI; 