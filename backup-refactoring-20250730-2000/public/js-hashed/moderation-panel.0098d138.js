/**
 * Панель модераторов
 * Интерфейс для ручной модерации контента
 */

class ModerationPanel {
    constructor(moderationSystem) {
        this.system = moderationSystem;
        this.currentModerator = null;
        this.currentItem = null;
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация панели модераторов
     */
    init() {
        this.createModerationPanel();
        this.setupEventListeners();
        console.log('👨‍⚖️ Панель модераторов инициализирована');
    }

    /**
     * Создание панели модераторов
     */
    createModerationPanel() {
        const panel = document.createElement('div');
        panel.id = 'moderationPanel';
        panel.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        panel.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                            <span class="mr-2">👨‍⚖️</span>
                            Панель модераторов
                        </h3>
                        <button id="closeModerationPanel" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Статистика -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="text-lg font-semibold mb-4">📊 Статистика</h4>
                                <div id="moderationStats" class="space-y-3">
                                    <div class="flex justify-between">
                                        <span>В очереди:</span>
                                        <span id="queueSize" class="font-semibold">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Обработано:</span>
                                        <span id="processedCount" class="font-semibold">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Жалобы:</span>
                                        <span id="reportsCount" class="font-semibold">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Автомодерация:</span>
                                        <span id="autoModStatus" class="font-semibold">Включена</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Очередь модерации -->
                            <div class="bg-gray-50 rounded-lg p-4 mt-4">
                                <h4 class="text-lg font-semibold mb-4">📋 Очередь модерации</h4>
                                <div id="moderationQueue" class="space-y-2 max-h-64 overflow-y-auto">
                                    <div class="text-center text-gray-500 py-4">
                                        Очередь пуста
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Основная область модерации -->
                        <div class="lg:col-span-2">
                            <div id="moderationContent" class="bg-gray-50 rounded-lg p-4 min-h-96">
                                <div class="text-center text-gray-500 py-20">
                                    <div class="text-4xl mb-4">👨‍⚖️</div>
                                    <p class="text-lg">Выберите элемент из очереди для модерации</p>
                                </div>
                            </div>
                            
                            <!-- Инструменты модерации -->
                            <div id="moderationTools" class="hidden mt-4 bg-white rounded-lg p-4 border">
                                <h4 class="text-lg font-semibold mb-4">🛠️ Инструменты модерации</h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button id="approveBtn" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                                        ✅ Одобрить
                                    </button>
                                    <button id="rejectBtn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                                        ❌ Отклонить
                                    </button>
                                    <button id="flagBtn" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors">
                                        ⚠️ Пометить
                                    </button>
                                    <button id="deleteBtn" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                                        🗑️ Удалить
                                    </button>
                                </div>
                                
                                <div class="mt-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Причина действия:
                                    </label>
                                    <textarea id="moderationReason" class="w-full border border-gray-300 rounded px-3 py-2 text-sm" rows="3" placeholder="Укажите причину действия..."></textarea>
                                </div>
                                
                                <div class="mt-4 flex justify-end space-x-3">
                                    <button id="skipBtn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                        Пропустить
                                    </button>
                                    <button id="applyActionBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Применить действие
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка закрытия панели
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeModerationPanel') {
                this.hidePanel();
            }
        });

        // Закрытие по клику вне панели
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('moderationPanel');
            if (e.target === panel) {
                this.hidePanel();
            }
        });

        // Инструменты модерации
        document.addEventListener('click', (e) => {
            if (e.target.id === 'approveBtn') {
                this.setModerationAction('approve');
            } else if (e.target.id === 'rejectBtn') {
                this.setModerationAction('reject');
            } else if (e.target.id === 'flagBtn') {
                this.setModerationAction('flag');
            } else if (e.target.id === 'deleteBtn') {
                this.setModerationAction('delete');
            } else if (e.target.id === 'skipBtn') {
                this.skipCurrentItem();
            } else if (e.target.id === 'applyActionBtn') {
                this.applyModerationAction();
            }
        });
    }

    /**
     * Показать панель модераторов
     */
    showPanel() {
        const panel = document.getElementById('moderationPanel');
        if (panel) {
            panel.classList.remove('hidden');
            this.isVisible = true;
            this.loadModerationData();
        }
    }

    /**
     * Скрыть панель модераторов
     */
    hidePanel() {
        const panel = document.getElementById('moderationPanel');
        if (panel) {
            panel.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * Загрузка данных модерации
     */
    loadModerationData() {
        this.updateStats();
        this.updateQueue();
    }

    /**
     * Обновление статистики
     */
    updateStats() {
        const stats = this.system.getModerationStats();
        
        document.getElementById('queueSize').textContent = stats.queueSize;
        document.getElementById('processedCount').textContent = stats.processedItems;
        document.getElementById('reportsCount').textContent = stats.activeReports;
        document.getElementById('autoModStatus').textContent = stats.autoModerationEnabled ? 'Включена' : 'Отключена';
    }

    /**
     * Обновление очереди модерации
     */
    updateQueue() {
        const queue = this.system.getModerationQueue(20);
        const queueContainer = document.getElementById('moderationQueue');
        
        if (queue.length === 0) {
            queueContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    Очередь пуста
                </div>
            `;
            return;
        }

        const queueHTML = queue.map((item, index) => {
            const priorityColor = {
                high: 'bg-red-100 border-red-300',
                medium: 'bg-yellow-100 border-yellow-300',
                low: 'bg-green-100 border-green-300'
            }[item.priority] || 'bg-gray-100 border-gray-300';

            const priorityText = {
                high: 'Высокий',
                medium: 'Средний',
                low: 'Низкий'
            }[item.priority] || 'Неизвестно';

            return `
                <div class="queue-item ${priorityColor} border rounded p-3 cursor-pointer hover:opacity-75 transition-opacity" 
                     data-item-id="${item.id}">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium">#${index + 1}</span>
                        <span class="text-xs px-2 py-1 rounded ${priorityColor.replace('100', '200')}">
                            ${priorityText}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600">
                        ${this.getContentPreview(item)}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${this.formatTimestamp(item.timestamp)}
                    </div>
                </div>
            `;
        }).join('');

        queueContainer.innerHTML = queueHTML;

        // Добавление обработчиков кликов
        queueContainer.querySelectorAll('.queue-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemId = item.dataset.itemId;
                this.loadModerationItem(itemId);
            });
        });
    }

    /**
     * Получение превью контента
     */
    getContentPreview(item) {
        if (item.type === 'report') {
            return `Жалоба: ${item.report.reason}`;
        }
        
        const content = item.content || {};
        const text = content.title || content.description || content.message || 'Без текста';
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    }

    /**
     * Форматирование временной метки
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Только что';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
        return date.toLocaleDateString('ru-RU');
    }

    /**
     * Загрузка элемента для модерации
     */
    loadModerationItem(itemId) {
        const item = this.system.moderationQueue.find(i => i.id === itemId);
        if (!item) return;

        this.currentItem = item;
        this.displayModerationContent(item);
        this.showModerationTools();
    }

    /**
     * Отображение контента для модерации
     */
    displayModerationContent(item) {
        const content = document.getElementById('moderationContent');
        
        if (item.type === 'report') {
            this.displayReportContent(item.report, content);
        } else {
            this.displayRegularContent(item, content);
        }
    }

    /**
     * Отображение обычного контента
     */
    displayRegularContent(item, container) {
        const content = item.content || {};
        const flags = item.flags || [];
        
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold">Модерация контента</h4>
                    <div class="flex space-x-2">
                        ${flags.map(flag => `
                            <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                ${flag}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-white rounded-lg p-4 border">
                    <div class="space-y-3">
                        ${content.title ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Заголовок:</label>
                                <div class="text-gray-900">${content.title}</div>
                            </div>
                        ` : ''}
                        
                        ${content.description ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Описание:</label>
                                <div class="text-gray-900">${content.description}</div>
                            </div>
                        ` : ''}
                        
                        ${content.location ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Местоположение:</label>
                                <div class="text-gray-900">${content.location}</div>
                            </div>
                        ` : ''}
                        
                        ${content.salary ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Зарплата:</label>
                                <div class="text-gray-900">${content.salary}</div>
                            </div>
                        ` : ''}
                        
                        ${content.name ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Имя:</label>
                                <div class="text-gray-900">${content.name}</div>
                            </div>
                        ` : ''}
                        
                        ${content.bio ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Биография:</label>
                                <div class="text-gray-900">${content.bio}</div>
                            </div>
                        ` : ''}
                        
                        ${content.skills ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Навыки:</label>
                                <div class="text-gray-900">${Array.isArray(content.skills) ? content.skills.join(', ') : content.skills}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="bg-blue-50 rounded-lg p-3">
                    <div class="text-sm text-blue-800">
                        <strong>Тип контента:</strong> ${item.contentType}<br>
                        <strong>Пользователь:</strong> ${item.userId}<br>
                        <strong>Время:</strong> ${this.formatTimestamp(item.timestamp)}<br>
                        <strong>Счет модерации:</strong> ${item.score || 0}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Отображение жалобы
     */
    displayReportContent(report, container) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold">Жалоба на контент</h4>
                    <span class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                        ${report.priority} приоритет
                    </span>
                </div>
                
                <div class="bg-white rounded-lg p-4 border">
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Причина жалобы:</label>
                            <div class="text-gray-900 font-medium">${this.getReasonText(report.reason)}</div>
                        </div>
                        
                        ${report.description ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Описание:</label>
                                <div class="text-gray-900">${report.description}</div>
                            </div>
                        ` : ''}
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Жалобщик:</label>
                            <div class="text-gray-900">${report.reporterId}</div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Время подачи:</label>
                            <div class="text-gray-900">${this.formatTimestamp(report.timestamp)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-yellow-50 rounded-lg p-3">
                    <div class="text-sm text-yellow-800">
                        <strong>ID контента:</strong> ${report.contentId}<br>
                        <strong>Тип контента:</strong> ${report.contentType}<br>
                        <strong>Статус:</strong> ${this.getStatusText(report.status)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Получение текста причины
     */
    getReasonText(reason) {
        const reasons = {
            spam: 'Спам',
            scam: 'Мошенничество',
            inappropriate: 'Неуместный контент',
            duplicate: 'Дублирование',
            incomplete: 'Неполная информация',
            other: 'Другое'
        };
        return reasons[reason] || reason;
    }

    /**
     * Получение текста статуса
     */
    getStatusText(status) {
        const statuses = {
            pending: 'Ожидает рассмотрения',
            resolved: 'Разрешено',
            rejected: 'Отклонено'
        };
        return statuses[status] || status;
    }

    /**
     * Показать инструменты модерации
     */
    showModerationTools() {
        const tools = document.getElementById('moderationTools');
        if (tools) {
            tools.classList.remove('hidden');
        }
    }

    /**
     * Скрыть инструменты модерации
     */
    hideModerationTools() {
        const tools = document.getElementById('moderationTools');
        if (tools) {
            tools.classList.add('hidden');
        }
    }

    /**
     * Установка действия модерации
     */
    setModerationAction(action) {
        // Сброс всех кнопок
        document.querySelectorAll('#moderationTools button').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });

        // Подсветка выбранной кнопки
        const actionBtn = document.getElementById(`${action}Btn`);
        if (actionBtn) {
            actionBtn.classList.add('ring-2', 'ring-blue-500');
        }

        this.currentAction = action;
    }

    /**
     * Пропустить текущий элемент
     */
    skipCurrentItem() {
        this.currentItem = null;
        this.currentAction = null;
        this.hideModerationTools();
        
        const content = document.getElementById('moderationContent');
        content.innerHTML = `
            <div class="text-center text-gray-500 py-20">
                <div class="text-4xl mb-4">👨‍⚖️</div>
                <p class="text-lg">Выберите элемент из очереди для модерации</p>
            </div>
        `;
    }

    /**
     * Применить действие модерации
     */
    applyModerationAction() {
        if (!this.currentItem || !this.currentAction) {
            alert('Выберите действие модерации');
            return;
        }

        const reason = document.getElementById('moderationReason').value.trim();
        if (!reason) {
            alert('Укажите причину действия');
            return;
        }

        // Применение действия
        const success = this.system.processModerationItem(
            this.currentItem.id,
            this.currentModerator || 'moderator-1',
            this.currentAction,
            reason
        );

        if (success) {
            this.showSuccessMessage(`Действие "${this.currentAction}" применено`);
            this.skipCurrentItem();
            this.loadModerationData(); // Обновление данных
        } else {
            this.showErrorMessage('Ошибка при применении действия');
        }
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
     * Создание кнопки для открытия панели модераторов
     */
    createModerationButton() {
        const button = document.createElement('button');
        button.id = 'openModerationPanel';
        button.className = 'fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors z-50';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        button.title = 'Панель модераторов';

        button.addEventListener('click', () => {
            this.showPanel();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку модерации в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const moderationNavItem = document.createElement('div');
            moderationNavItem.className = 'flex items-center space-x-2';
            moderationNavItem.innerHTML = `
                <button id="navModeration" class="text-gray-600 hover:text-red-500 transition-colors flex items-center space-x-1">
                    <span>🛡️</span>
                    <span class="hidden md:inline">Модерация</span>
                </button>
            `;
            
            nav.appendChild(moderationNavItem);
            
            document.getElementById('navModeration').addEventListener('click', () => {
                this.showPanel();
            });
        }

        // Создаем плавающую кнопку
        this.createModerationButton();
    }

    /**
     * Получение статистики панели
     */
    getStats() {
        return {
            isVisible: this.isVisible,
            currentItem: this.currentItem ? this.currentItem.id : null,
            systemStats: this.system.getModerationStats()
        };
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим панели модераторов');
        
        // Показываем панель
        this.showPanel();
        
        // Загружаем тестовые данные через 2 секунды
        setTimeout(() => {
            this.loadModerationData();
        }, 2000);
        
        return {
            stats: this.getStats(),
            systemStats: this.system.getModerationStats()
        };
    }
}

// Экспорт для использования в других модулях
window.ModerationPanel = ModerationPanel; 