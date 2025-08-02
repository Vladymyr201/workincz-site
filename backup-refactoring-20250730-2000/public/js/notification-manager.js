/**
 * Центральный менеджер уведомлений
 * Управление настройками, категориями и интеграция всех систем уведомлений
 */

class NotificationManager {
    constructor() {
        this.pushSystem = null;
        this.realtimeSystem = null;
        this.settings = {
            enabled: true,
            categories: {
                newJobs: { enabled: true, priority: 'high', frequency: 'immediate' },
                applicationUpdates: { enabled: true, priority: 'high', frequency: 'immediate' },
                messages: { enabled: true, priority: 'medium', frequency: 'immediate' },
                recommendations: { enabled: true, priority: 'medium', frequency: 'daily' },
                promotions: { enabled: false, priority: 'low', frequency: 'weekly' },
                system: { enabled: true, priority: 'high', frequency: 'immediate' }
            },
            quietHours: { enabled: true, start: 22, end: 8 },
            frequency: 'immediate', // immediate, daily, weekly
            sound: true,
            vibration: true,
            desktop: true,
            mobile: true
        };
        this.notificationHistory = [];
        this.stats = {
            totalSent: 0,
            totalRead: 0,
            totalClicked: 0,
            categoryStats: {}
        };
        this.init();
    }

    /**
     * Инициализация менеджера уведомлений
     */
    async init() {
        await this.loadSettings();
        await this.initializeSystems();
        this.setupEventListeners();
        this.createSettingsUI();
        console.log('🎛️ Менеджер уведомлений инициализирован');
    }

    /**
     * Загрузка настроек
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('notificationManagerSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }

            const savedHistory = localStorage.getItem('notificationHistory');
            if (savedHistory) {
                this.notificationHistory = JSON.parse(savedHistory);
            }

            const savedStats = localStorage.getItem('notificationStats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек уведомлений:', error);
        }
    }

    /**
     * Сохранение настроек
     */
    saveSettings() {
        try {
            localStorage.setItem('notificationManagerSettings', JSON.stringify(this.settings));
            localStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
            localStorage.setItem('notificationStats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Ошибка сохранения настроек уведомлений:', error);
        }
    }

    /**
     * Инициализация систем уведомлений
     */
    async initializeSystems() {
        // Инициализация push-уведомлений
        if (window.PushNotificationSystem) {
            this.pushSystem = new PushNotificationSystem();
        }

        // Инициализация real-time уведомлений
        if (window.RealtimeNotificationSystem) {
            this.realtimeSystem = new RealtimeNotificationSystem();
        }
    }

    /**
     * Создание UI настроек
     */
    createSettingsUI() {
        const settingsButton = document.createElement('button');
        settingsButton.id = 'notificationSettingsBtn';
        settingsButton.className = 'fixed bottom-4 left-4 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50';
        settingsButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h10v-2H4v2zM4 11h14v-2H4v2zM4 7h18v-2H4v2z"></path>
            </svg>
        `;
        settingsButton.title = 'Настройки уведомлений';

        document.body.appendChild(settingsButton);

        // Создание модального окна настроек
        this.createSettingsModal();
    }

    /**
     * Создание модального окна настроек
     */
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'notificationSettingsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800">Настройки уведомлений</h3>
                        <button id="closeNotificationSettings" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <!-- Общие настройки -->
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Общие настройки</h4>
                            <div class="space-y-3">
                                <label class="flex items-center">
                                    <input type="checkbox" id="notificationsEnabled" class="mr-3" ${this.settings.enabled ? 'checked' : ''}>
                                    <span>Включить уведомления</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="notificationSound" class="mr-3" ${this.settings.sound ? 'checked' : ''}>
                                    <span>Звуковые уведомления</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="notificationVibration" class="mr-3" ${this.settings.vibration ? 'checked' : ''}>
                                    <span>Вибрация</span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Время тишины -->
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Время тишины</h4>
                            <div class="space-y-3">
                                <label class="flex items-center">
                                    <input type="checkbox" id="quietHoursEnabled" class="mr-3" ${this.settings.quietHours.enabled ? 'checked' : ''}>
                                    <span>Включить время тишины</span>
                                </label>
                                <div class="flex items-center space-x-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Начало</label>
                                        <input type="time" id="quietHoursStart" class="border border-gray-300 rounded px-3 py-2" 
                                               value="${this.settings.quietHours.start.toString().padStart(2, '0')}:00">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Конец</label>
                                        <input type="time" id="quietHoursEnd" class="border border-gray-300 rounded px-3 py-2" 
                                               value="${this.settings.quietHours.end.toString().padStart(2, '0')}:00">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Категории уведомлений -->
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Категории уведомлений</h4>
                            <div class="space-y-3">
                                ${Object.entries(this.settings.categories).map(([key, category]) => `
                                    <div class="border border-gray-200 rounded-lg p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <label class="flex items-center">
                                                <input type="checkbox" id="category_${key}" class="mr-3" ${category.enabled ? 'checked' : ''}>
                                                <span class="font-medium">${this.getCategoryName(key)}</span>
                                            </label>
                                            <span class="text-xs px-2 py-1 rounded ${this.getPriorityColor(category.priority)}">
                                                ${this.getPriorityName(category.priority)}
                                            </span>
                                        </div>
                                        <div class="flex items-center space-x-4">
                                            <div>
                                                <label class="block text-xs text-gray-600 mb-1">Частота</label>
                                                <select id="frequency_${key}" class="text-xs border border-gray-300 rounded px-2 py-1">
                                                    <option value="immediate" ${category.frequency === 'immediate' ? 'selected' : ''}>Сразу</option>
                                                    <option value="daily" ${category.frequency === 'daily' ? 'selected' : ''}>Ежедневно</option>
                                                    <option value="weekly" ${category.frequency === 'weekly' ? 'selected' : ''}>Еженедельно</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Статистика -->
                        <div>
                            <h4 class="text-lg font-semibold mb-4">Статистика</h4>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="bg-gray-50 p-3 rounded">
                                    <div class="font-medium">Всего отправлено</div>
                                    <div class="text-2xl font-bold text-blue-600">${this.stats.totalSent}</div>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <div class="font-medium">Прочитано</div>
                                    <div class="text-2xl font-bold text-green-600">${this.stats.totalRead}</div>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <div class="font-medium">Кликов</div>
                                    <div class="text-2xl font-bold text-purple-600">${this.stats.totalClicked}</div>
                                </div>
                                <div class="bg-gray-50 p-3 rounded">
                                    <div class="font-medium">CTR</div>
                                    <div class="text-2xl font-bold text-orange-600">
                                        ${this.stats.totalSent > 0 ? ((this.stats.totalClicked / this.stats.totalSent) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6">
                        <button id="resetNotificationSettings" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                            Сбросить
                        </button>
                        <button id="saveNotificationSettings" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Получение названия категории
     */
    getCategoryName(key) {
        const names = {
            newJobs: 'Новые вакансии',
            applicationUpdates: 'Обновления заявок',
            messages: 'Сообщения',
            recommendations: 'Рекомендации',
            promotions: 'Промо-акции',
            system: 'Системные уведомления'
        };
        return names[key] || key;
    }

    /**
     * Получение названия приоритета
     */
    getPriorityName(priority) {
        const names = {
            high: 'Высокий',
            medium: 'Средний',
            low: 'Низкий'
        };
        return names[priority] || priority;
    }

    /**
     * Получение цвета приоритета
     */
    getPriorityColor(priority) {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка настроек
        document.addEventListener('click', (e) => {
            if (e.target.id === 'notificationSettingsBtn') {
                this.showSettingsModal();
            }
        });

        // Закрытие модального окна
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeNotificationSettings') {
                this.hideSettingsModal();
            }
        });

        // Сохранение настроек
        document.addEventListener('click', (e) => {
            if (e.target.id === 'saveNotificationSettings') {
                this.saveNotificationSettings();
            }
        });

        // Сброс настроек
        document.addEventListener('click', (e) => {
            if (e.target.id === 'resetNotificationSettings') {
                this.resetNotificationSettings();
            }
        });

        // Закрытие модального окна по клику вне его
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('notificationSettingsModal');
            if (e.target === modal) {
                this.hideSettingsModal();
            }
        });
    }

    /**
     * Показ модального окна настроек
     */
    showSettingsModal() {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Скрытие модального окна настроек
     */
    hideSettingsModal() {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Сохранение настроек уведомлений
     */
    saveNotificationSettings() {
        // Общие настройки
        this.settings.enabled = document.getElementById('notificationsEnabled').checked;
        this.settings.sound = document.getElementById('notificationSound').checked;
        this.settings.vibration = document.getElementById('notificationVibration').checked;

        // Время тишины
        this.settings.quietHours.enabled = document.getElementById('quietHoursEnabled').checked;
        const startTime = document.getElementById('quietHoursStart').value;
        const endTime = document.getElementById('quietHoursEnd').value;
        this.settings.quietHours.start = parseInt(startTime.split(':')[0]);
        this.settings.quietHours.end = parseInt(endTime.split(':')[0]);

        // Категории
        Object.keys(this.settings.categories).forEach(key => {
            const enabled = document.getElementById(`category_${key}`).checked;
            const frequency = document.getElementById(`frequency_${key}`).value;
            
            this.settings.categories[key].enabled = enabled;
            this.settings.categories[key].frequency = frequency;
        });

        this.saveSettings();
        this.hideSettingsModal();
        
        // Показ уведомления о сохранении
        this.showSuccessMessage('Настройки уведомлений сохранены');
        
        console.log('✅ Настройки уведомлений сохранены');
    }

    /**
     * Сброс настроек уведомлений
     */
    resetNotificationSettings() {
        if (confirm('Вы уверены, что хотите сбросить все настройки уведомлений?')) {
            // Сброс к значениям по умолчанию
            this.settings = {
                enabled: true,
                categories: {
                    newJobs: { enabled: true, priority: 'high', frequency: 'immediate' },
                    applicationUpdates: { enabled: true, priority: 'high', frequency: 'immediate' },
                    messages: { enabled: true, priority: 'medium', frequency: 'immediate' },
                    recommendations: { enabled: true, priority: 'medium', frequency: 'daily' },
                    promotions: { enabled: false, priority: 'low', frequency: 'weekly' },
                    system: { enabled: true, priority: 'high', frequency: 'immediate' }
                },
                quietHours: { enabled: true, start: 22, end: 8 },
                frequency: 'immediate',
                sound: true,
                vibration: true,
                desktop: true,
                mobile: true
            };

            this.saveSettings();
            this.hideSettingsModal();
            this.showSuccessMessage('Настройки уведомлений сброшены');
            
            console.log('🔄 Настройки уведомлений сброшены');
        }
    }

    /**
     * Отправка уведомления
     */
    sendNotification(notification) {
        // Проверка общих настроек
        if (!this.settings.enabled) {
            console.log('❌ Уведомления отключены');
            return false;
        }

        // Проверка категории
        const category = this.settings.categories[notification.category];
        if (!category || !category.enabled) {
            console.log(`❌ Категория ${notification.category} отключена`);
            return false;
        }

        // Проверка времени тишины
        if (this.settings.quietHours.enabled && this.isInQuietHours()) {
            console.log('🔇 Время тишины - уведомление отложено');
            return false;
        }

        // Проверка частоты
        if (!this.shouldSendByFrequency(notification.category)) {
            console.log(`⏰ Уведомление отложено по частоте для категории ${notification.category}`);
            return false;
        }

        // Отправка push-уведомления
        if (this.pushSystem) {
            this.pushSystem.sendPushNotification(notification);
        }

        // Отправка real-time уведомления
        if (this.realtimeSystem) {
            this.realtimeSystem.receiveNotification(notification);
        }

        // Обновление статистики
        this.updateStats(notification);

        // Добавление в историю
        this.addToHistory(notification);

        console.log('📤 Уведомление отправлено:', notification);
        return true;
    }

    /**
     * Проверка времени тишины
     */
    isInQuietHours() {
        const now = new Date();
        const currentHour = now.getHours();
        const { start, end } = this.settings.quietHours;
        
        if (start > end) {
            return currentHour >= start || currentHour <= end;
        } else {
            return currentHour >= start && currentHour <= end;
        }
    }

    /**
     * Проверка частоты отправки
     */
    shouldSendByFrequency(category) {
        const categorySettings = this.settings.categories[category];
        if (!categorySettings) return true;

        const lastSent = this.getLastSentTime(category);
        const now = Date.now();

        switch (categorySettings.frequency) {
            case 'immediate':
                return true;
            case 'daily':
                return !lastSent || (now - lastSent) > 24 * 60 * 60 * 1000;
            case 'weekly':
                return !lastSent || (now - lastSent) > 7 * 24 * 60 * 60 * 1000;
            default:
                return true;
        }
    }

    /**
     * Получение времени последней отправки
     */
    getLastSentTime(category) {
        const categoryHistory = this.notificationHistory
            .filter(n => n.category === category)
            .sort((a, b) => b.timestamp - a.timestamp);
        
        return categoryHistory.length > 0 ? categoryHistory[0].timestamp : null;
    }

    /**
     * Обновление статистики
     */
    updateStats(notification) {
        this.stats.totalSent++;
        
        if (!this.stats.categoryStats[notification.category]) {
            this.stats.categoryStats[notification.category] = {
                sent: 0,
                read: 0,
                clicked: 0
            };
        }
        
        this.stats.categoryStats[notification.category].sent++;
        this.saveSettings();
    }

    /**
     * Добавление в историю
     */
    addToHistory(notification) {
        const historyItem = {
            ...notification,
            timestamp: Date.now(),
            read: false,
            clicked: false
        };
        
        this.notificationHistory.unshift(historyItem);
        
        // Ограничение истории
        if (this.notificationHistory.length > 1000) {
            this.notificationHistory = this.notificationHistory.slice(0, 1000);
        }
        
        this.saveSettings();
    }

    /**
     * Отметка уведомления как прочитанного
     */
    markAsRead(notificationId) {
        const notification = this.notificationHistory.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.stats.totalRead++;
            
            if (this.stats.categoryStats[notification.category]) {
                this.stats.categoryStats[notification.category].read++;
            }
            
            this.saveSettings();
        }
    }

    /**
     * Отметка клика по уведомлению
     */
    markAsClicked(notificationId) {
        const notification = this.notificationHistory.find(n => n.id === notificationId);
        if (notification && !notification.clicked) {
            notification.clicked = true;
            this.stats.totalClicked++;
            
            if (this.stats.categoryStats[notification.category]) {
                this.stats.categoryStats[notification.category].clicked++;
            }
            
            this.saveSettings();
        }
    }

    /**
     * Показ сообщения об успехе
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
     * Получение статуса системы
     */
    getStatus() {
        return {
            enabled: this.settings.enabled,
            pushSystem: this.pushSystem ? this.pushSystem.getStatus() : null,
            realtimeSystem: this.realtimeSystem ? this.realtimeSystem.getStatus() : null,
            stats: this.stats,
            historyLength: this.notificationHistory.length
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим менеджера уведомлений');
        
        // Включение тестового режима для подсистем
        if (this.pushSystem) {
            this.pushSystem.enableTestMode();
        }
        
        if (this.realtimeSystem) {
            this.realtimeSystem.enableTestMode();
        }
        
        // Отправка тестовых уведомлений
        const testNotifications = [
            {
                id: 'test-1',
                category: 'newJobs',
                title: 'Новая вакансия',
                body: 'Frontend Developer в TechCorp - 95% соответствие',
                icon: '💼',
                priority: 'high'
            },
            {
                id: 'test-2',
                category: 'messages',
                title: 'Новое сообщение',
                body: 'HR менеджер ответил на вашу заявку',
                icon: '💬',
                priority: 'medium'
            },
            {
                id: 'test-3',
                category: 'recommendations',
                title: 'Персональные рекомендации',
                body: '5 новых вакансий специально для вас',
                icon: '🎯',
                priority: 'medium'
            }
        ];

        testNotifications.forEach((notification, index) => {
            setTimeout(() => {
                this.sendNotification(notification);
            }, index * 3000);
        });

        return {
            status: this.getStatus(),
            testNotifications: testNotifications.length
        };
    }
}

// Экспорт для использования в других модулях
window.NotificationManager = NotificationManager; 