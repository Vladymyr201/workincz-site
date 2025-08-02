/**
 * Система push-уведомлений
 * Поддержка браузерных push-уведомлений, управление подписками и настройками
 */

class PushNotificationSystem {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.subscription = null;
        this.notificationSettings = {
            newJobs: true,
            applicationUpdates: true,
            messages: true,
            recommendations: true,
            promotions: false,
            quietHours: { start: 22, end: 8 },
            frequency: 'immediate' // immediate, daily, weekly
        };
        this.notificationHistory = [];
        this.init();
    }

    /**
     * Инициализация системы push-уведомлений
     */
    async init() {
        if (!this.isSupported) {
            console.log('❌ Push-уведомления не поддерживаются в этом браузере');
            return;
        }

        try {
            await this.registerServiceWorker();
            await this.loadSettings();
            await this.checkSubscription();
            this.setupEventListeners();
            console.log('🔔 Система push-уведомлений инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации push-уведомлений:', error);
        }
    }

    /**
     * Регистрация Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker зарегистрирован:', registration);
            return registration;
        } catch (error) {
            console.error('Ошибка регистрации Service Worker:', error);
            throw error;
        }
    }

    /**
     * Загрузка настроек уведомлений
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('notificationSettings');
            if (savedSettings) {
                this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(savedSettings) };
            }

            const savedHistory = localStorage.getItem('notificationHistory');
            if (savedHistory) {
                this.notificationHistory = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек уведомлений:', error);
        }
    }

    /**
     * Сохранение настроек уведомлений
     */
    saveSettings() {
        try {
            localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
            localStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
        } catch (error) {
            console.error('Ошибка сохранения настроек уведомлений:', error);
        }
    }

    /**
     * Проверка подписки на push-уведомления
     */
    async checkSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
            
            if (this.subscription) {
                console.log('✅ Подписка на push-уведомления активна');
                return true;
            } else {
                console.log('❌ Подписка на push-уведомления не найдена');
                return false;
            }
        } catch (error) {
            console.error('Ошибка проверки подписки:', error);
            return false;
        }
    }

    /**
     * Запрос разрешения на push-уведомления
     */
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('✅ Разрешение на уведомления получено');
                await this.subscribeToPush();
                return true;
            } else if (permission === 'denied') {
                console.log('❌ Разрешение на уведомления отклонено');
                this.showPermissionDeniedMessage();
                return false;
            } else {
                console.log('❓ Разрешение на уведомления не определено');
                return false;
            }
        } catch (error) {
            console.error('Ошибка запроса разрешения:', error);
            return false;
        }
    }

    /**
     * Подписка на push-уведомления
     */
    async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // В реальном приложении здесь был бы VAPID public key
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa1HxFRPz4KbJtS7Ek';
            const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
            
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            console.log('✅ Подписка на push-уведомления создана');
            
            // Отправка подписки на сервер
            await this.sendSubscriptionToServer(this.subscription);
            
            return true;
        } catch (error) {
            console.error('Ошибка подписки на push-уведомления:', error);
            return false;
        }
    }

    /**
     * Отписка от push-уведомлений
     */
    async unsubscribeFromPush() {
        try {
            if (this.subscription) {
                await this.subscription.unsubscribe();
                this.subscription = null;
                console.log('✅ Отписка от push-уведомлений выполнена');
                
                // Уведомление сервера об отписке
                await this.sendUnsubscriptionToServer();
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка отписки от push-уведомлений:', error);
            return false;
        }
    }

    /**
     * Отправка подписки на сервер
     */
    async sendSubscriptionToServer(subscription) {
        try {
            // В реальном приложении здесь был бы API запрос
            console.log('📤 Отправка подписки на сервер:', subscription);
            
            // Симуляция отправки
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return true;
        } catch (error) {
            console.error('Ошибка отправки подписки на сервер:', error);
            return false;
        }
    }

    /**
     * Уведомление сервера об отписке
     */
    async sendUnsubscriptionToServer() {
        try {
            // В реальном приложении здесь был бы API запрос
            console.log('📤 Уведомление сервера об отписке');
            
            // Симуляция отправки
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return true;
        } catch (error) {
            console.error('Ошибка уведомления сервера об отписке:', error);
            return false;
        }
    }

    /**
     * Отправка push-уведомления
     */
    async sendPushNotification(notificationData) {
        try {
            if (!this.subscription) {
                console.log('❌ Нет активной подписки на push-уведомления');
                return false;
            }

            // Проверка настроек уведомлений
            if (!this.shouldSendNotification(notificationData.type)) {
                console.log('❌ Уведомления этого типа отключены');
                return false;
            }

            // Проверка времени тишины
            if (this.isInQuietHours()) {
                console.log('🔇 Время тишины - уведомление отложено');
                return false;
            }

            // В реальном приложении здесь был бы запрос к серверу
            console.log('📤 Отправка push-уведомления:', notificationData);
            
            // Симуляция отправки
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Добавление в историю
            this.addToHistory(notificationData);
            
            return true;
        } catch (error) {
            console.error('Ошибка отправки push-уведомления:', error);
            return false;
        }
    }

    /**
     * Проверка, следует ли отправлять уведомление
     */
    shouldSendNotification(type) {
        return this.notificationSettings[type] !== false;
    }

    /**
     * Проверка времени тишины
     */
    isInQuietHours() {
        const now = new Date();
        const currentHour = now.getHours();
        const { start, end } = this.notificationSettings.quietHours;
        
        if (start > end) {
            // Время тишины переходит через полночь
            return currentHour >= start || currentHour <= end;
        } else {
            return currentHour >= start && currentHour <= end;
        }
    }

    /**
     * Добавление уведомления в историю
     */
    addToHistory(notificationData) {
        const historyItem = {
            ...notificationData,
            timestamp: Date.now(),
            read: false
        };
        
        this.notificationHistory.unshift(historyItem);
        
        // Ограничение истории
        if (this.notificationHistory.length > 100) {
            this.notificationHistory = this.notificationHistory.slice(0, 100);
        }
        
        this.saveSettings();
    }

    /**
     * Отметка уведомления как прочитанного
     */
    markAsRead(notificationId) {
        const notification = this.notificationHistory.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveSettings();
        }
    }

    /**
     * Получение непрочитанных уведомлений
     */
    getUnreadNotifications() {
        return this.notificationHistory.filter(n => !n.read);
    }

    /**
     * Получение количества непрочитанных уведомлений
     */
    getUnreadCount() {
        return this.getUnreadNotifications().length;
    }

    /**
     * Обновление настроек уведомлений
     */
    updateSettings(newSettings) {
        this.notificationSettings = { ...this.notificationSettings, ...newSettings };
        this.saveSettings();
        console.log('✅ Настройки уведомлений обновлены');
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кликов по уведомлениям
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                const notificationId = e.target.closest('.notification-item').dataset.notificationId;
                this.markAsRead(notificationId);
            }
        });

        // Обработка событий от Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
                this.handleNotificationClick(event.data.notification);
            }
        });
    }

    /**
     * Обработка клика по уведомлению
     */
    handleNotificationClick(notification) {
        console.log('🔔 Клик по уведомлению:', notification);
        
        // Обработка различных типов уведомлений
        switch (notification.type) {
            case 'newJob':
                this.openJobDetails(notification.jobId);
                break;
            case 'applicationUpdate':
                this.openApplicationDetails(notification.applicationId);
                break;
            case 'message':
                this.openMessage(notification.messageId);
                break;
            case 'recommendation':
                this.openRecommendation(notification.recommendationId);
                break;
            default:
                console.log('Неизвестный тип уведомления:', notification.type);
        }
    }

    /**
     * Открытие деталей вакансии
     */
    openJobDetails(jobId) {
        // В реальном приложении здесь был бы переход к вакансии
        console.log('Открытие вакансии:', jobId);
        // window.location.href = `/job/${jobId}`;
    }

    /**
     * Открытие деталей заявки
     */
    openApplicationDetails(applicationId) {
        // В реальном приложении здесь был бы переход к заявке
        console.log('Открытие заявки:', applicationId);
        // window.location.href = `/application/${applicationId}`;
    }

    /**
     * Открытие сообщения
     */
    openMessage(messageId) {
        // В реальном приложении здесь был бы переход к сообщению
        console.log('Открытие сообщения:', messageId);
        // window.location.href = `/messages/${messageId}`;
    }

    /**
     * Открытие рекомендации
     */
    openRecommendation(recommendationId) {
        // В реальном приложении здесь был бы переход к рекомендации
        console.log('Открытие рекомендации:', recommendationId);
        // window.location.href = `/recommendations/${recommendationId}`;
    }

    /**
     * Показ сообщения об отклонении разрешений
     */
    showPermissionDeniedMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        message.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">🔔</span>
                <span>Разрешите уведомления в настройках браузера для получения важных обновлений</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 5000);
    }

    /**
     * Конвертация VAPID ключа
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Получение статуса системы
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            hasPermission: Notification.permission === 'granted',
            isSubscribed: !!this.subscription,
            settings: this.notificationSettings,
            unreadCount: this.getUnreadCount(),
            history: this.notificationHistory
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим push-уведомлений');
        
        // Симуляция различных типов уведомлений
        const testNotifications = [
            {
                id: 'test-1',
                type: 'newJob',
                title: 'Новая вакансия',
                body: 'Frontend Developer в TechCorp',
                jobId: 'job-123',
                icon: '/images/job-icon.png'
            },
            {
                id: 'test-2',
                type: 'applicationUpdate',
                title: 'Обновление заявки',
                body: 'Ваша заявка рассмотрена',
                applicationId: 'app-456',
                icon: '/images/application-icon.png'
            },
            {
                id: 'test-3',
                type: 'message',
                title: 'Новое сообщение',
                body: 'Сообщение от HR менеджера',
                messageId: 'msg-789',
                icon: '/images/message-icon.png'
            }
        ];

        // Отправка тестовых уведомлений
        testNotifications.forEach((notification, index) => {
            setTimeout(() => {
                this.sendPushNotification(notification);
            }, index * 2000);
        });

        return testNotifications;
    }
}

// Экспорт для использования в других модулях
window.PushNotificationSystem = PushNotificationSystem; 