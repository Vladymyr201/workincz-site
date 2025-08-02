/**
 * UI компоненты для системы геймификации
 * Отображение достижений, бейджей, квестов, лидербордов и наград
 */

class GamificationUI {
    constructor(gamificationSystem) {
        this.system = gamificationSystem;
        this.currentUserId = null;
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация UI компонентов
     */
    init() {
        this.currentUserId = this.getCurrentUserId();
        this.createGamificationWidget();
        this.createGamificationModal();
        this.setupEventListeners();
        console.log('🎨 UI геймификации инициализирован');
    }

    /**
     * Получение ID текущего пользователя
     */
    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id || 'anonymous';
    }

    /**
     * Создание виджета геймификации
     */
    createGamificationWidget() {
        const widget = document.createElement('div');
        widget.id = 'gamificationWidget';
        widget.className = 'fixed bottom-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-xl border border-purple-200 p-4 w-80 max-h-96 overflow-hidden transition-all duration-300 transform translate-y-full';
        widget.style.zIndex = '1000';

        widget.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold flex items-center">
                    <span class="mr-2">🎮</span>
                    Геймификация
                </h3>
                <button id="closeGamification" class="text-white opacity-75 hover:opacity-100 transition-opacity">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div id="gamificationContent" class="space-y-3 max-h-64 overflow-y-auto">
                <div class="text-center text-white opacity-75 py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Загрузка данных...</p>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-purple-300">
                <button id="openGamificationModal" class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md transition-colors text-sm">
                    Открыть полную панель
                </button>
            </div>
        `;

        document.body.appendChild(widget);
    }

    /**
     * Создание модального окна геймификации
     */
    createGamificationModal() {
        const modal = document.createElement('div');
        modal.id = 'gamificationModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                            <span class="mr-2">🎮</span>
                            Панель геймификации
                        </h3>
                        <button id="closeGamificationModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Профиль пользователя -->
                        <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-6">
                            <h4 class="text-xl font-semibold mb-4">Ваш профиль</h4>
                            <div id="userProfileContent" class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span>Уровень:</span>
                                    <span id="userLevel" class="font-bold text-2xl">1</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Очки:</span>
                                    <span id="userPoints" class="font-bold">0</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>Опыт:</span>
                                    <span id="userExperience" class="font-bold">0</span>
                                </div>
                                <div class="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                                    <div id="experienceBar" class="bg-white h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Статистика -->
                        <div class="bg-gray-50 rounded-lg p-6">
                            <h4 class="text-xl font-semibold mb-4">Статистика</h4>
                            <div id="userStatsContent" class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Достижения:</span>
                                    <span id="achievementsCount" class="font-semibold">0</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Бейджи:</span>
                                    <span id="badgesCount" class="font-semibold">0</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Квесты:</span>
                                    <span id="questsCount" class="font-semibold">0</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Рейтинг:</span>
                                    <span id="userRank" class="font-semibold">-</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Вкладки -->
                    <div class="mt-6">
                        <div class="border-b border-gray-200">
                            <nav class="-mb-px flex space-x-8">
                                <button class="tab-button border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium" data-tab="achievements">
                                    🏆 Достижения
                                </button>
                                <button class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium" data-tab="badges">
                                    🎖️ Бейджи
                                </button>
                                <button class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium" data-tab="quests">
                                    📋 Квесты
                                </button>
                                <button class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium" data-tab="leaderboard">
                                    🏅 Лидерборд
                                </button>
                                <button class="tab-button border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium" data-tab="rewards">
                                    🎁 Награды
                                </button>
                            </nav>
                        </div>
                        
                        <!-- Контент вкладок -->
                        <div class="mt-6">
                            <div id="achievementsTab" class="tab-content">
                                <div id="achievementsContent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Достижения будут загружены динамически -->
                                </div>
                            </div>
                            
                            <div id="badgesTab" class="tab-content hidden">
                                <div id="badgesContent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Бейджи будут загружены динамически -->
                                </div>
                            </div>
                            
                            <div id="questsTab" class="tab-content hidden">
                                <div id="questsContent" class="space-y-4">
                                    <!-- Квесты будут загружены динамически -->
                                </div>
                            </div>
                            
                            <div id="leaderboardTab" class="tab-content hidden">
                                <div id="leaderboardContent" class="space-y-4">
                                    <!-- Лидерборд будет загружен динамически -->
                                </div>
                            </div>
                            
                            <div id="rewardsTab" class="tab-content hidden">
                                <div id="rewardsContent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <!-- Награды будут загружены динамически -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка закрытия виджета
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeGamification') {
                this.hideWidget();
            }
        });

        // Кнопка открытия модального окна
        document.addEventListener('click', (e) => {
            if (e.target.id === 'openGamificationModal') {
                this.showModal();
            }
        });

        // Кнопка закрытия модального окна
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeGamificationModal') {
                this.hideModal();
            }
        });

        // Переключение вкладок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Закрытие модального окна по клику вне его
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('gamificationModal');
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    /**
     * Показать виджет геймификации
     */
    showWidget() {
        const widget = document.getElementById('gamificationWidget');
        if (widget) {
            widget.classList.remove('translate-y-full');
            this.isVisible = true;
            this.loadWidgetData();
        }
    }

    /**
     * Скрыть виджет геймификации
     */
    hideWidget() {
        const widget = document.getElementById('gamificationWidget');
        if (widget) {
            widget.classList.add('translate-y-full');
            this.isVisible = false;
        }
    }

    /**
     * Показать модальное окно геймификации
     */
    showModal() {
        const modal = document.getElementById('gamificationModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadModalData();
        }
    }

    /**
     * Скрыть модальное окно геймификации
     */
    hideModal() {
        const modal = document.getElementById('gamificationModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Переключение вкладок
     */
    switchTab(tabName) {
        // Скрыть все вкладки
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Убрать активное состояние у всех кнопок
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('border-blue-500', 'text-blue-600');
            button.classList.add('border-transparent', 'text-gray-500');
        });

        // Показать выбранную вкладку
        const selectedTab = document.getElementById(`${tabName}Tab`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Активировать кнопку
        const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedButton) {
            selectedButton.classList.remove('border-transparent', 'text-gray-500');
            selectedButton.classList.add('border-blue-500', 'text-blue-600');
        }

        // Загрузить данные для вкладки
        this.loadTabData(tabName);
    }

    /**
     * Загрузка данных виджета
     */
    loadWidgetData() {
        const profile = this.system.getUserProfile(this.currentUserId);
        const stats = this.system.getUserStats(this.currentUserId);

        const content = document.getElementById('gamificationContent');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-sm">Уровень:</span>
                    <span class="font-bold">${profile.level}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm">Очки:</span>
                    <span class="font-bold">${profile.points}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm">Достижения:</span>
                    <span class="font-bold">${profile.achievements.size}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm">Бейджи:</span>
                    <span class="font-bold">${profile.badges.size}</span>
                </div>
                <div class="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div class="bg-white h-2 rounded-full transition-all duration-300" 
                         style="width: ${(profile.experience % 100)}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Загрузка данных модального окна
     */
    loadModalData() {
        const profile = this.system.getUserProfile(this.currentUserId);
        const stats = this.system.getUserStats(this.currentUserId);

        // Обновление профиля
        document.getElementById('userLevel').textContent = profile.level;
        document.getElementById('userPoints').textContent = profile.points;
        document.getElementById('userExperience').textContent = profile.experience;
        document.getElementById('experienceBar').style.width = `${(profile.experience % 100)}%`;

        // Обновление статистики
        document.getElementById('achievementsCount').textContent = profile.achievements.size;
        document.getElementById('badgesCount').textContent = profile.badges.size;
        document.getElementById('questsCount').textContent = profile.completedQuests.size;
        document.getElementById('userRank').textContent = stats.rank || '-';

        // Загрузка данных первой вкладки
        this.loadTabData('achievements');
    }

    /**
     * Загрузка данных вкладки
     */
    loadTabData(tabName) {
        switch (tabName) {
            case 'achievements':
                this.loadAchievements();
                break;
            case 'badges':
                this.loadBadges();
                break;
            case 'quests':
                this.loadQuests();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
            case 'rewards':
                this.loadRewards();
                break;
        }
    }

    /**
     * Загрузка достижений
     */
    loadAchievements() {
        const content = document.getElementById('achievementsContent');
        if (!content) return;

        const profile = this.system.getUserProfile(this.currentUserId);
        const achievements = Array.from(this.system.achievements.values());

        const achievementsHTML = achievements.map(achievement => {
            const isUnlocked = profile.achievements.has(achievement.id);
            const opacity = isUnlocked ? 'opacity-100' : 'opacity-50';
            const bgColor = isUnlocked ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300';

            return `
                <div class="achievement-item ${bgColor} border rounded-lg p-4 ${opacity} transition-all duration-300">
                    <div class="flex items-start space-x-3">
                        <div class="text-2xl">${achievement.icon}</div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${achievement.name}</h4>
                            <p class="text-sm text-gray-600 mt-1">${achievement.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-xs text-gray-500">${achievement.category}</span>
                                <span class="text-sm font-semibold text-blue-600">+${achievement.points} очков</span>
                            </div>
                        </div>
                        ${isUnlocked ? '<div class="text-green-500">✓</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = achievementsHTML;
    }

    /**
     * Загрузка бейджей
     */
    loadBadges() {
        const content = document.getElementById('badgesContent');
        if (!content) return;

        const profile = this.system.getUserProfile(this.currentUserId);
        const badges = Array.from(this.system.badges.values());

        const badgesHTML = badges.map(badge => {
            const isEarned = profile.badges.has(badge.id);
            const opacity = isEarned ? 'opacity-100' : 'opacity-50';
            const bgColor = isEarned ? 'bg-purple-100 border-purple-300' : 'bg-gray-100 border-gray-300';

            return `
                <div class="badge-item ${bgColor} border rounded-lg p-4 ${opacity} transition-all duration-300">
                    <div class="flex items-start space-x-3">
                        <div class="text-3xl">${badge.icon}</div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${badge.name}</h4>
                            <p class="text-sm text-gray-600 mt-1">${badge.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-xs px-2 py-1 rounded ${this.getRarityColor(badge.rarity)}">
                                    ${this.getRarityName(badge.rarity)}
                                </span>
                            </div>
                        </div>
                        ${isEarned ? '<div class="text-purple-500">✓</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = badgesHTML;
    }

    /**
     * Загрузка квестов
     */
    loadQuests() {
        const content = document.getElementById('questsContent');
        if (!content) return;

        const profile = this.system.getUserProfile(this.currentUserId);
        const quests = Array.from(this.system.quests.values());

        const questsHTML = quests.map(quest => {
            const isCompleted = profile.completedQuests.has(quest.id);
            const bgColor = isCompleted ? 'bg-green-100 border-green-300' : 'bg-blue-100 border-blue-300';

            return `
                <div class="quest-item ${bgColor} border rounded-lg p-4 transition-all duration-300">
                    <div class="flex items-start space-x-3">
                        <div class="text-2xl">${quest.icon}</div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <h4 class="font-semibold text-gray-800">${quest.name}</h4>
                                <span class="text-xs px-2 py-1 rounded ${quest.type === 'daily' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                                    ${quest.type === 'daily' ? 'Ежедневный' : 'Еженедельный'}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${quest.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-sm font-semibold text-blue-600">+${quest.points} очков</span>
                                ${isCompleted ? '<span class="text-green-500 text-sm">Выполнено ✓</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = questsHTML;
    }

    /**
     * Загрузка лидерборда
     */
    loadLeaderboard() {
        const content = document.getElementById('leaderboardContent');
        if (!content) return;

        const leaderboard = this.system.getLeaderboard('weekly', 10);

        const leaderboardHTML = `
            <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold mb-4">Еженедельный лидерборд</h4>
                <div class="space-y-2">
                    ${leaderboard.map((entry, index) => `
                        <div class="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                    ${index + 1}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800">Пользователь ${entry.userId.slice(-6)}</div>
                                    <div class="text-sm text-gray-500">Уровень ${entry.profile.level}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold text-blue-600">${entry.points} очков</div>
                                <div class="text-xs text-gray-500">${entry.profile.achievements.size} достижений</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        content.innerHTML = leaderboardHTML;
    }

    /**
     * Загрузка наград
     */
    loadRewards() {
        const content = document.getElementById('rewardsContent');
        if (!content) return;

        const profile = this.system.getUserProfile(this.currentUserId);
        const rewards = Array.from(this.system.rewards.values());

        const rewardsHTML = rewards.map(reward => {
            const canAfford = profile.points >= reward.cost;
            const bgColor = canAfford ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300';

            return `
                <div class="reward-item ${bgColor} border rounded-lg p-4 transition-all duration-300">
                    <div class="flex items-start space-x-3">
                        <div class="text-2xl">${reward.icon}</div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${reward.name}</h4>
                            <p class="text-sm text-gray-600 mt-1">${reward.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-sm font-semibold text-blue-600">${reward.cost} очков</span>
                                <button class="buy-reward-btn px-3 py-1 rounded text-sm ${canAfford ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}" 
                                        data-reward-id="${reward.id}" ${!canAfford ? 'disabled' : ''}>
                                    ${canAfford ? 'Купить' : 'Недостаточно очков'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = rewardsHTML;

        // Добавление обработчиков для кнопок покупки
        document.querySelectorAll('.buy-reward-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const rewardId = e.target.dataset.rewardId;
                this.buyReward(rewardId);
            });
        });
    }

    /**
     * Покупка награды
     */
    buyReward(rewardId) {
        const success = this.system.buyReward(this.currentUserId, rewardId);
        
        if (success) {
            this.showSuccessMessage('Награда успешно куплена!');
            this.loadModalData(); // Обновление данных
        } else {
            this.showErrorMessage('Недостаточно очков для покупки награды');
        }
    }

    /**
     * Получение цвета редкости
     */
    getRarityColor(rarity) {
        const colors = {
            common: 'bg-gray-100 text-gray-800',
            uncommon: 'bg-green-100 text-green-800',
            rare: 'bg-blue-100 text-blue-800',
            epic: 'bg-purple-100 text-purple-800',
            legendary: 'bg-orange-100 text-orange-800'
        };
        return colors[rarity] || colors.common;
    }

    /**
     * Получение названия редкости
     */
    getRarityName(rarity) {
        const names = {
            common: 'Обычный',
            uncommon: 'Необычный',
            rare: 'Редкий',
            epic: 'Эпический',
            legendary: 'Легендарный'
        };
        return names[rarity] || rarity;
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
     * Показ сообщения об ошибке
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
     * Создание кнопки для открытия геймификации
     */
    createGamificationButton() {
        const button = document.createElement('button');
        button.id = 'openGamification';
        button.className = 'fixed bottom-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        button.title = 'Геймификация';

        button.addEventListener('click', () => {
            this.showWidget();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку геймификации в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const gamificationNavItem = document.createElement('div');
            gamificationNavItem.className = 'flex items-center space-x-2';
            gamificationNavItem.innerHTML = `
                <button id="navGamification" class="text-gray-600 hover:text-purple-500 transition-colors flex items-center space-x-1">
                    <span>🎮</span>
                    <span class="hidden md:inline">Геймификация</span>
                </button>
            `;
            
            nav.appendChild(gamificationNavItem);
            
            document.getElementById('navGamification').addEventListener('click', () => {
                this.showModal();
            });
        }

        // Создаем плавающую кнопку
        this.createGamificationButton();
    }

    /**
     * Получение статистики UI
     */
    getStats() {
        const profile = this.system.getUserProfile(this.currentUserId);
        return {
            level: profile.level,
            points: profile.points,
            achievements: profile.achievements.size,
            badges: profile.badges.size,
            quests: profile.completedQuests.size
        };
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим UI геймификации');
        
        // Показываем виджет
        this.showWidget();
        
        // Показываем модальное окно через 2 секунды
        setTimeout(() => {
            this.showModal();
        }, 2000);
        
        return {
            stats: this.getStats(),
            systemStats: this.system.getSystemStats()
        };
    }
}

// Экспорт для использования в других модулях
window.GamificationUI = GamificationUI; 