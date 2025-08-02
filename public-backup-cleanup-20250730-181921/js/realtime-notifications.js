/**
 * Система real-time уведомлений
 * WebSocket соединения для мгновенных уведомлений в браузере
 */

class RealtimeNotificationSystem {
    constructor() {
        this.websocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.notificationQueue = [];
        this.activeNotifications = new Map();
        this.userId = null;
        this.init();
    }

    /**
     * Инициализация системы real-time уведомлений
     */
    init() {
        this.userId = this.getCurrentUserId();
        this.setupEventListeners();
        this.createNotificationContainer();
        console.log('⚡ Система real-time уведомлений инициализирована');
    }

    /**
     * Получение ID текущего пользователя
     */
    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id || 'anonymous';
    }

    /**
     * Создание контейнера для уведомлений
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'realtimeNotificationsContainer';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
        document.body.appendChild(container);
    }

    /**
     * Подключение к WebSocket серверу
     */
    async connect() {
        try {
            // В реальном приложении здесь был бы WebSocket URL
            const wsUrl = `wss://api.workincz.cz/notifications?userId=${this.userId}`;
            
            // Для демонстрации используем симуляцию
            this.simulateWebSocketConnection();
            
            console.log('🔌 Подключение к WebSocket серверу...');
        } catch (error) {
            console.error('Ошибка подключения к WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Симуляция WebSocket соединения для демонстрации
     */
    simulateWebSocketConnection() {
        this.isConnected = true;
        console.log('✅ WebSocket соединение установлено (симуляция)');
        
        // Симуляция получения уведомлений
        this.startNotificationSimulation();
    }

    /**
     * Симуляция получения уведомлений
     */
    startNotificationSimulation() {
        const notificationTypes = [
            {
                type: 'jobMatch',
                title: 'Новая подходящая вакансия',
                message: 'Frontend Developer в TechCorp - 95% соответствие',
                icon: '💼',
                color: 'bg-blue-500'
            },
            {
                type: 'message',
                title: 'Новое сообщение',
                message: 'HR менеджер ответил на вашу заявку',
                icon: '💬',
                color: 'bg-green-500'
            },
            {
                type: 'applicationUpdate',
                title: 'Обновление заявки',
                message: 'Ваша заявка переведена на следующий этап',
                icon: '📋',
                color: 'bg-yellow-500'
            },
            {
                type: 'recommendation',
                title: 'Персональная рекомендация',
                message: '5 новых вакансий специально для вас',
                icon: '🎯',
                color: 'bg-purple-500'
            }
        ];

        // Отправка уведомлений с интервалом
        setInterval(() => {
            if (this.isConnected && Math.random() > 0.7) { // 30% вероятность
                const notification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
                this.receiveNotification({
                    id: `realtime-${Date.now()}`,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    icon: notification.icon,
                    color: notification.color,
                    timestamp: Date.now(),
                    data: {}
                });
            }
        }, 10000); // Каждые 10 секунд
    }

    /**
     * Получение уведомления от сервера
     */
    receiveNotification(notification) {
        console.log('📨 Получено real-time уведомление:', notification);
        
        // Добавление в очередь
        this.notificationQueue.push(notification);
        
        // Отображение уведомления
        this.showNotification(notification);
        
        // Обработка специальных типов уведомлений
        this.handleSpecialNotification(notification);
    }

    /**
     * Отображение уведомления
     */
    showNotification(notification) {
        const container = document.getElementById('realtimeNotificationsContainer');
        if (!container) return;

        const notificationElement = document.createElement('div');
        notificationElement.id = `notification-${notification.id}`;
        notificationElement.className = `notification-item ${notification.color} text-white p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
        notificationElement.dataset.notificationId = notification.id;

        notificationElement.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 text-2xl">${notification.icon}</div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold mb-1">${notification.title}</h4>
                    <p class="text-xs opacity-90">${notification.message}</p>
                    <p class="text-xs opacity-75 mt-1">${this.formatTime(notification.timestamp)}</p>
                </div>
                <button class="notification-close text-white opacity-75 hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(notificationElement);
        this.activeNotifications.set(notification.id, notificationElement);

        // Анимация появления
        setTimeout(() => {
            notificationElement.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            this.hideNotification(notification.id);
        }, 5000);
    }

    /**
     * Скрытие уведомления
     */
    hideNotification(notificationId) {
        const notificationElement = this.activeNotifications.get(notificationId);
        if (!notificationElement) return;

        notificationElement.classList.add('translate-x-full', 'opacity-0');
        
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
            this.activeNotifications.delete(notificationId);
        }, 300);
    }

    /**
     * Обработка специальных типов уведомлений
     */
    handleSpecialNotification(notification) {
        switch (notification.type) {
            case 'jobMatch':
                this.handleJobMatchNotification(notification);
                break;
            case 'message':
                this.handleMessageNotification(notification);
                break;
            case 'applicationUpdate':
                this.handleApplicationUpdateNotification(notification);
                break;
            case 'recommendation':
                this.handleRecommendationNotification(notification);
                break;
            default:
                console.log('Неизвестный тип уведомления:', notification.type);
        }
    }

    /**
     * Обработка уведомления о подходящей вакансии
     */
    handleJobMatchNotification(notification) {
        // Обновление счетчика вакансий
        this.updateJobCounter();
        
        // Уведомление системы рекомендаций
        if (window.recommendationEngine) {
            // Симуляция обновления рекомендаций
            console.log('🔄 Обновление рекомендаций на основе нового уведомления');
        }
    }

    /**
     * Обработка уведомления о сообщении
     */
    handleMessageNotification(notification) {
        // Обновление счетчика сообщений
        this.updateMessageCounter();
        
        // Уведомление системы чата
        if (window.messagingManager) {
            // Симуляция обновления чата
            console.log('💬 Обновление чата на основе нового уведомления');
        }
    }

    /**
     * Обработка уведомления об обновлении заявки
     */
    handleApplicationUpdateNotification(notification) {
        // Обновление счетчика заявок
        this.updateApplicationCounter();
        
        // Уведомление системы заявок
        if (window.applicationsManager) {
            // Симуляция обновления заявок
            console.log('📋 Обновление заявок на основе нового уведомления');
        }
    }

    /**
     * Обработка уведомления о рекомендациях
     */
    handleRecommendationNotification(notification) {
        // Уведомление системы рекомендаций
        if (window.recommendationUI) {
            // Симуляция обновления UI рекомендаций
            console.log('🎯 Обновление UI рекомендаций на основе нового уведомления');
        }
    }

    /**
     * Обновление счетчика вакансий
     */
    updateJobCounter() {
        const jobCounter = document.querySelector('[data-counter="jobs"]');
        if (jobCounter) {
            const currentCount = parseInt(jobCounter.textContent) || 0;
            jobCounter.textContent = currentCount + 1;
            jobCounter.classList.add('animate-pulse');
            setTimeout(() => jobCounter.classList.remove('animate-pulse'), 1000);
        }
    }

    /**
     * Обновление счетчика сообщений
     */
    updateMessageCounter() {
        const messageCounter = document.querySelector('[data-counter="messages"]');
        if (messageCounter) {
            const currentCount = parseInt(messageCounter.textContent) || 0;
            messageCounter.textContent = currentCount + 1;
            messageCounter.classList.add('animate-pulse');
            setTimeout(() => messageCounter.classList.remove('animate-pulse'), 1000);
        }
    }

    /**
     * Обновление счетчика заявок
     */
    updateApplicationCounter() {
        const applicationCounter = document.querySelector('[data-counter="applications"]');
        if (applicationCounter) {
            const currentCount = parseInt(applicationCounter.textContent) || 0;
            applicationCounter.textContent = currentCount + 1;
            applicationCounter.classList.add('animate-pulse');
            setTimeout(() => applicationCounter.classList.remove('animate-pulse'), 1000);
        }
    }

    /**
     * Форматирование времени
     */
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Меньше минуты
            return 'Только что';
        } else if (diff < 3600000) { // Меньше часа
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) { // Меньше дня
            const hours = Math.floor(diff / 3600000);
            return `${hours} ч назад`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString('ru-RU');
        }
    }

    /**
     * Отправка сообщения на сервер
     */
    sendMessage(message) {
        if (this.isConnected && this.websocket) {
            this.websocket.send(JSON.stringify(message));
        } else {
            console.log('📤 Сообщение отправлено (симуляция):', message);
        }
    }

    /**
     * Планирование переподключения
     */
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Превышено максимальное количество попыток переподключения');
        }
    }

    /**
     * Отключение от сервера
     */
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
        }
        this.isConnected = false;
        console.log('🔌 WebSocket соединение закрыто');
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кликов по уведомлениям
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationId = e.target.closest('.notification-item').dataset.notificationId;
                this.handleNotificationClick(notificationId);
            }
            
            if (e.target.closest('.notification-close')) {
                const notificationId = e.target.closest('.notification-item').dataset.notificationId;
                this.hideNotification(notificationId);
            }
        });

        // Обработка видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Страница скрыта - приостановка уведомлений');
            } else {
                console.log('📱 Страница видима - возобновление уведомлений');
            }
        });

        // Обработка фокуса окна
        window.addEventListener('focus', () => {
            console.log('🪟 Окно в фокусе');
        });

        window.addEventListener('blur', () => {
            console.log('🪟 Окно потеряло фокус');
        });
    }

    /**
     * Обработка клика по уведомлению
     */
    handleNotificationClick(notificationId) {
        const notification = this.notificationQueue.find(n => n.id === notificationId);
        if (!notification) return;

        console.log('🔔 Клик по real-time уведомлению:', notification);

        // Обработка различных типов уведомлений
        switch (notification.type) {
            case 'jobMatch':
                this.openJobMatch(notification);
                break;
            case 'message':
                this.openMessage(notification);
                break;
            case 'applicationUpdate':
                this.openApplicationUpdate(notification);
                break;
            case 'recommendation':
                this.openRecommendation(notification);
                break;
            default:
                console.log('Неизвестный тип уведомления:', notification.type);
        }

        // Скрытие уведомления
        this.hideNotification(notificationId);
    }

    /**
     * Открытие подходящей вакансии
     */
    openJobMatch(notification) {
        // В реальном приложении здесь был бы переход к вакансии
        console.log('Открытие подходящей вакансии:', notification);
        // window.location.href = `/jobs/matched`;
    }

    /**
     * Открытие сообщения
     */
    openMessage(notification) {
        // В реальном приложении здесь был бы переход к сообщению
        console.log('Открытие сообщения:', notification);
        // window.location.href = `/messages`;
    }

    /**
     * Открытие обновления заявки
     */
    openApplicationUpdate(notification) {
        // В реальном приложении здесь был бы переход к заявке
        console.log('Открытие обновления заявки:', notification);
        // window.location.href = `/applications`;
    }

    /**
     * Открытие рекомендаций
     */
    openRecommendation(notification) {
        // В реальном приложении здесь был бы переход к рекомендациям
        console.log('Открытие рекомендаций:', notification);
        // window.location.href = `/recommendations`;
    }

    /**
     * Получение статуса системы
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            activeNotifications: this.activeNotifications.size,
            queueLength: this.notificationQueue.length,
            userId: this.userId
        };
    }

    /**
     * Очистка всех уведомлений
     */
    clearAllNotifications() {
        this.activeNotifications.forEach((element, id) => {
            this.hideNotification(id);
        });
        this.notificationQueue = [];
        console.log('🧹 Все уведомления очищены');
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим real-time уведомлений');
        
        // Подключение к WebSocket
        this.connect();
        
        // Создание тестовых счетчиков
        this.createTestCounters();
        
        return {
            status: this.getStatus(),
            testCounters: true
        };
    }

    /**
     * Создание тестовых счетчиков
     */
    createTestCounters() {
        const countersContainer = document.createElement('div');
        countersContainer.className = 'fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-40';
        countersContainer.innerHTML = `
            <h3 class="text-sm font-semibold mb-2">Тестовые счетчики</h3>
            <div class="space-y-1 text-xs">
                <div>Вакансии: <span data-counter="jobs" class="font-bold">0</span></div>
                <div>Сообщения: <span data-counter="messages" class="font-bold">0</span></div>
                <div>Заявки: <span data-counter="applications" class="font-bold">0</span></div>
            </div>
        `;
        
        document.body.appendChild(countersContainer);
    }
}

// Экспорт для использования в других модулях
window.RealtimeNotificationSystem = RealtimeNotificationSystem; 