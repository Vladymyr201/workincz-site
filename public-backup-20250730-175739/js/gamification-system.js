/**
 * Система геймификации
 * Достижения, бейджи, очки, награды, соревнования и социальные элементы
 */

class GamificationSystem {
    constructor() {
        this.userProfiles = new Map();
        this.achievements = new Map();
        this.badges = new Map();
        this.quests = new Map();
        this.leaderboards = new Map();
        this.rewards = new Map();
        this.events = new Map();
        this.userStats = new Map();
        this.init();
    }

    /**
     * Инициализация системы геймификации
     */
    init() {
        this.loadData();
        this.initializeAchievements();
        this.initializeBadges();
        this.initializeQuests();
        this.initializeRewards();
        this.setupEventListeners();
        console.log('🎮 Система геймификации инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedProfiles = localStorage.getItem('gamificationProfiles');
            const savedStats = localStorage.getItem('gamificationStats');
            const savedEvents = localStorage.getItem('gamificationEvents');

            if (savedProfiles) this.userProfiles = new Map(JSON.parse(savedProfiles));
            if (savedStats) this.userStats = new Map(JSON.parse(savedStats));
            if (savedEvents) this.events = new Map(JSON.parse(savedEvents));
        } catch (error) {
            console.error('Ошибка загрузки данных геймификации:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('gamificationProfiles', JSON.stringify(Array.from(this.userProfiles.entries())));
            localStorage.setItem('gamificationStats', JSON.stringify(Array.from(this.userStats.entries())));
            localStorage.setItem('gamificationEvents', JSON.stringify(Array.from(this.events.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных геймификации:', error);
        }
    }

    /**
     * Инициализация достижений
     */
    initializeAchievements() {
        const achievements = [
            {
                id: 'first-job-application',
                name: 'Первая заявка',
                description: 'Подайте свою первую заявку на работу',
                icon: '📝',
                points: 50,
                category: 'applications',
                requirement: { type: 'applications', count: 1 }
            },
            {
                id: 'job-hunter',
                name: 'Охотник за работой',
                description: 'Подайте 10 заявок на работу',
                icon: '🎯',
                points: 200,
                category: 'applications',
                requirement: { type: 'applications', count: 10 }
            },
            {
                id: 'profile-complete',
                name: 'Полный профиль',
                description: 'Заполните профиль на 100%',
                icon: '👤',
                points: 100,
                category: 'profile',
                requirement: { type: 'profile_completion', percentage: 100 }
            },
            {
                id: 'network-builder',
                name: 'Строитель сети',
                description: 'Добавьте 5 контактов в сеть',
                icon: '🌐',
                points: 150,
                category: 'social',
                requirement: { type: 'contacts', count: 5 }
            },
            {
                id: 'skill-master',
                name: 'Мастер навыков',
                description: 'Добавьте 10 навыков в профиль',
                icon: '⚡',
                points: 120,
                category: 'skills',
                requirement: { type: 'skills', count: 10 }
            },
            {
                id: 'message-king',
                name: 'Король сообщений',
                description: 'Отправьте 50 сообщений',
                icon: '💬',
                points: 180,
                category: 'communication',
                requirement: { type: 'messages', count: 50 }
            },
            {
                id: 'recommendation-expert',
                name: 'Эксперт рекомендаций',
                description: 'Получите 5 рекомендаций от работодателей',
                icon: '⭐',
                points: 300,
                category: 'reputation',
                requirement: { type: 'recommendations', count: 5 }
            },
            {
                id: 'interview-pro',
                name: 'Профессионал интервью',
                description: 'Пройдите 3 интервью',
                icon: '🎤',
                points: 250,
                category: 'interviews',
                requirement: { type: 'interviews', count: 3 }
            },
            {
                id: 'early-bird',
                name: 'Ранняя пташка',
                description: 'Войдите в систему 7 дней подряд',
                icon: '🌅',
                points: 100,
                category: 'activity',
                requirement: { type: 'consecutive_days', count: 7 }
            },
            {
                id: 'helpful-community',
                name: 'Полезный участник',
                description: 'Помогите 10 другим пользователям',
                icon: '🤝',
                points: 200,
                category: 'community',
                requirement: { type: 'help_others', count: 10 }
            }
        ];

        achievements.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    /**
     * Инициализация бейджей
     */
    initializeBadges() {
        const badges = [
            {
                id: 'newcomer',
                name: 'Новичок',
                description: 'Добро пожаловать в сообщество',
                icon: '🆕',
                rarity: 'common',
                requirement: { type: 'registration' }
            },
            {
                id: 'active-user',
                name: 'Активный пользователь',
                description: 'Регулярно использует платформу',
                icon: '🔥',
                rarity: 'uncommon',
                requirement: { type: 'activity_streak', days: 30 }
            },
            {
                id: 'job-finder',
                name: 'Искатель работы',
                description: 'Нашел работу через платформу',
                icon: '🎉',
                rarity: 'rare',
                requirement: { type: 'job_found' }
            },
            {
                id: 'mentor',
                name: 'Ментор',
                description: 'Помог 20 пользователям',
                icon: '👨‍🏫',
                rarity: 'epic',
                requirement: { type: 'mentor_help', count: 20 }
            },
            {
                id: 'legend',
                name: 'Легенда',
                description: 'Достиг максимального уровня',
                icon: '👑',
                rarity: 'legendary',
                requirement: { type: 'max_level' }
            }
        ];

        badges.forEach(badge => {
            this.badges.set(badge.id, badge);
        });
    }

    /**
     * Инициализация квестов
     */
    initializeQuests() {
        const quests = [
            {
                id: 'daily-login',
                name: 'Ежедневный вход',
                description: 'Войдите в систему сегодня',
                icon: '📅',
                points: 10,
                type: 'daily',
                requirement: { type: 'login', count: 1 },
                reward: { type: 'points', amount: 10 }
            },
            {
                id: 'apply-jobs',
                name: 'Подача заявок',
                description: 'Подайте 3 заявки сегодня',
                icon: '📝',
                points: 30,
                type: 'daily',
                requirement: { type: 'applications', count: 3 },
                reward: { type: 'points', amount: 30 }
            },
            {
                id: 'update-profile',
                name: 'Обновление профиля',
                description: 'Обновите свой профиль',
                icon: '👤',
                points: 20,
                type: 'weekly',
                requirement: { type: 'profile_update' },
                reward: { type: 'points', amount: 20 }
            },
            {
                id: 'connect-network',
                name: 'Расширение сети',
                description: 'Добавьте 2 новых контакта',
                icon: '🌐',
                points: 25,
                type: 'weekly',
                requirement: { type: 'new_contacts', count: 2 },
                reward: { type: 'points', amount: 25 }
            },
            {
                id: 'skill-improvement',
                name: 'Улучшение навыков',
                description: 'Добавьте новый навык',
                icon: '⚡',
                points: 15,
                type: 'weekly',
                requirement: { type: 'new_skill' },
                reward: { type: 'points', amount: 15 }
            }
        ];

        quests.forEach(quest => {
            this.quests.set(quest.id, quest);
        });
    }

    /**
     * Инициализация наград
     */
    initializeRewards() {
        const rewards = [
            {
                id: 'premium-week',
                name: 'Неделя премиум',
                description: '7 дней премиум-доступа',
                icon: '⭐',
                cost: 500,
                type: 'premium',
                effect: { type: 'premium_access', duration: 7 }
            },
            {
                id: 'profile-boost',
                name: 'Буст профиля',
                description: 'Ваш профиль будет показан первым в течение 24 часов',
                icon: '🚀',
                cost: 200,
                type: 'boost',
                effect: { type: 'profile_boost', duration: 24 }
            },
            {
                id: 'extra-applications',
                name: 'Дополнительные заявки',
                description: 'Возможность подать 5 дополнительных заявок',
                icon: '📋',
                cost: 150,
                type: 'feature',
                effect: { type: 'extra_applications', count: 5 }
            },
            {
                id: 'custom-badge',
                name: 'Кастомный бейдж',
                description: 'Создайте свой уникальный бейдж',
                icon: '🎨',
                cost: 1000,
                type: 'customization',
                effect: { type: 'custom_badge' }
            },
            {
                id: 'priority-support',
                name: 'Приоритетная поддержка',
                description: 'Приоритет в очереди поддержки',
                icon: '🎯',
                cost: 300,
                type: 'support',
                effect: { type: 'priority_support', duration: 30 }
            }
        ];

        rewards.forEach(reward => {
            this.rewards.set(reward.id, reward);
        });
    }

    /**
     * Получение или создание профиля пользователя
     */
    getUserProfile(userId) {
        if (!this.userProfiles.has(userId)) {
            const profile = {
                userId,
                level: 1,
                experience: 0,
                points: 0,
                achievements: new Set(),
                badges: new Set(),
                completedQuests: new Set(),
                activeQuests: new Set(),
                rewards: new Set(),
                friends: new Set(),
                stats: {
                    applications: 0,
                    messages: 0,
                    profileViews: 0,
                    recommendations: 0,
                    interviews: 0,
                    consecutiveDays: 0,
                    lastLogin: null
                },
                createdAt: Date.now(),
                lastUpdated: Date.now()
            };
            this.userProfiles.set(userId, profile);
        }
        return this.userProfiles.get(userId);
    }

    /**
     * Получение статистики пользователя
     */
    getUserStats(userId) {
        if (!this.userStats.has(userId)) {
            const stats = {
                totalPoints: 0,
                totalAchievements: 0,
                totalBadges: 0,
                totalQuests: 0,
                level: 1,
                rank: 0,
                weeklyPoints: 0,
                monthlyPoints: 0,
                lastReset: Date.now()
            };
            this.userStats.set(userId, stats);
        }
        return this.userStats.get(userId);
    }

    /**
     * Обработка действия пользователя
     */
    processAction(userId, actionType, actionData = {}) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        // Обновление статистики
        this.updateUserStats(profile, actionType, actionData);

        // Проверка достижений
        this.checkAchievements(userId, actionType, actionData);

        // Проверка бейджей
        this.checkBadges(userId, actionType, actionData);

        // Проверка квестов
        this.checkQuests(userId, actionType, actionData);

        // Обновление уровня
        this.updateLevel(userId);

        // Обновление лидерборда
        this.updateLeaderboard(userId);

        this.saveData();
    }

    /**
     * Обновление статистики пользователя
     */
    updateUserStats(profile, actionType, actionData) {
        const stats = profile.stats;

        switch (actionType) {
            case 'application_submitted':
                stats.applications++;
                this.addPoints(profile.userId, 10);
                break;
            case 'message_sent':
                stats.messages++;
                this.addPoints(profile.userId, 5);
                break;
            case 'profile_viewed':
                stats.profileViews++;
                this.addPoints(profile.userId, 2);
                break;
            case 'recommendation_received':
                stats.recommendations++;
                this.addPoints(profile.userId, 25);
                break;
            case 'interview_completed':
                stats.interviews++;
                this.addPoints(profile.userId, 50);
                break;
            case 'daily_login':
                stats.consecutiveDays++;
                this.addPoints(profile.userId, 5);
                break;
            case 'profile_updated':
                this.addPoints(profile.userId, 15);
                break;
            case 'skill_added':
                this.addPoints(profile.userId, 8);
                break;
            case 'contact_added':
                this.addPoints(profile.userId, 12);
                break;
        }

        profile.lastUpdated = Date.now();
    }

    /**
     * Добавление очков пользователю
     */
    addPoints(userId, points) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        profile.points += points;
        profile.experience += points;
        stats.totalPoints += points;
        stats.weeklyPoints += points;
        stats.monthlyPoints += points;

        // Уведомление о получении очков
        this.showPointsNotification(points);
    }

    /**
     * Проверка достижений
     */
    checkAchievements(userId, actionType, actionData) {
        const profile = this.getUserProfile(userId);

        this.achievements.forEach(achievement => {
            if (profile.achievements.has(achievement.id)) return;

            if (this.isAchievementCompleted(profile, achievement, actionType, actionData)) {
                this.unlockAchievement(userId, achievement);
            }
        });
    }

    /**
     * Проверка завершения достижения
     */
    isAchievementCompleted(profile, achievement, actionType, actionData) {
        const requirement = achievement.requirement;

        switch (requirement.type) {
            case 'applications':
                return profile.stats.applications >= requirement.count;
            case 'profile_completion':
                return this.getProfileCompletion(profile) >= requirement.percentage;
            case 'contacts':
                return profile.friends.size >= requirement.count;
            case 'skills':
                return profile.stats.skills >= requirement.count;
            case 'messages':
                return profile.stats.messages >= requirement.count;
            case 'recommendations':
                return profile.stats.recommendations >= requirement.count;
            case 'interviews':
                return profile.stats.interviews >= requirement.count;
            case 'consecutive_days':
                return profile.stats.consecutiveDays >= requirement.count;
            case 'help_others':
                return profile.stats.helpOthers >= requirement.count;
            default:
                return false;
        }
    }

    /**
     * Разблокировка достижения
     */
    unlockAchievement(userId, achievement) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        profile.achievements.add(achievement.id);
        stats.totalAchievements++;

        this.addPoints(userId, achievement.points);

        // Показ уведомления о достижении
        this.showAchievementNotification(achievement);

        // Проверка специальных достижений
        this.checkSpecialAchievements(userId);
    }

    /**
     * Проверка бейджей
     */
    checkBadges(userId, actionType, actionData) {
        const profile = this.getUserProfile(userId);

        this.badges.forEach(badge => {
            if (profile.badges.has(badge.id)) return;

            if (this.isBadgeEarned(profile, badge, actionType, actionData)) {
                this.unlockBadge(userId, badge);
            }
        });
    }

    /**
     * Проверка получения бейджа
     */
    isBadgeEarned(profile, badge, actionType, actionData) {
        const requirement = badge.requirement;

        switch (requirement.type) {
            case 'registration':
                return true;
            case 'activity_streak':
                return profile.stats.consecutiveDays >= requirement.days;
            case 'job_found':
                return profile.stats.jobsFound > 0;
            case 'mentor_help':
                return profile.stats.helpOthers >= requirement.count;
            case 'max_level':
                return profile.level >= 100;
            default:
                return false;
        }
    }

    /**
     * Разблокировка бейджа
     */
    unlockBadge(userId, badge) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        profile.badges.add(badge.id);
        stats.totalBadges++;

        // Показ уведомления о бейдже
        this.showBadgeNotification(badge);
    }

    /**
     * Проверка квестов
     */
    checkQuests(userId, actionType, actionData) {
        const profile = this.getUserProfile(userId);

        this.quests.forEach(quest => {
            if (profile.completedQuests.has(quest.id)) return;

            if (this.isQuestCompleted(profile, quest, actionType, actionData)) {
                this.completeQuest(userId, quest);
            }
        });
    }

    /**
     * Проверка завершения квеста
     */
    isQuestCompleted(profile, quest, actionType, actionData) {
        const requirement = quest.requirement;

        switch (requirement.type) {
            case 'login':
                return actionType === 'daily_login';
            case 'applications':
                return profile.stats.applications >= requirement.count;
            case 'profile_update':
                return actionType === 'profile_updated';
            case 'new_contacts':
                return profile.stats.newContacts >= requirement.count;
            case 'new_skill':
                return actionType === 'skill_added';
            default:
                return false;
        }
    }

    /**
     * Завершение квеста
     */
    completeQuest(userId, quest) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        profile.completedQuests.add(quest.id);
        stats.totalQuests++;

        this.addPoints(userId, quest.points);

        // Выдача награды
        if (quest.reward) {
            this.giveReward(userId, quest.reward);
        }

        // Показ уведомления о квесте
        this.showQuestNotification(quest);
    }

    /**
     * Выдача награды
     */
    giveReward(userId, reward) {
        const profile = this.getUserProfile(userId);

        switch (reward.type) {
            case 'points':
                this.addPoints(userId, reward.amount);
                break;
            case 'premium_access':
                // Активация премиум-доступа
                break;
            case 'profile_boost':
                // Активация буста профиля
                break;
            case 'extra_applications':
                // Добавление дополнительных заявок
                break;
        }
    }

    /**
     * Обновление уровня пользователя
     */
    updateLevel(userId) {
        const profile = this.getUserProfile(userId);
        const newLevel = Math.floor(profile.experience / 100) + 1;

        if (newLevel > profile.level) {
            const oldLevel = profile.level;
            profile.level = newLevel;

            // Показ уведомления о повышении уровня
            this.showLevelUpNotification(oldLevel, newLevel);

            // Проверка достижений уровня
            this.checkLevelAchievements(userId, newLevel);
        }
    }

    /**
     * Обновление лидерборда
     */
    updateLeaderboard(userId) {
        const profile = this.getUserProfile(userId);
        const stats = this.getUserStats(userId);

        // Обновление рейтинга пользователя
        this.calculateUserRank(userId);

        // Обновление еженедельного лидерборда
        this.updateWeeklyLeaderboard(userId, stats.weeklyPoints);

        // Обновление месячного лидерборда
        this.updateMonthlyLeaderboard(userId, stats.monthlyPoints);
    }

    /**
     * Расчет рейтинга пользователя
     */
    calculateUserRank(userId) {
        const allUsers = Array.from(this.userProfiles.values())
            .sort((a, b) => b.points - a.points);

        const userIndex = allUsers.findIndex(user => user.userId === userId);
        const stats = this.getUserStats(userId);
        stats.rank = userIndex + 1;
    }

    /**
     * Обновление еженедельного лидерборда
     */
    updateWeeklyLeaderboard(userId, points) {
        if (!this.leaderboards.has('weekly')) {
            this.leaderboards.set('weekly', new Map());
        }

        const weeklyBoard = this.leaderboards.get('weekly');
        weeklyBoard.set(userId, points);
    }

    /**
     * Обновление месячного лидерборда
     */
    updateMonthlyLeaderboard(userId, points) {
        if (!this.leaderboards.has('monthly')) {
            this.leaderboards.set('monthly', new Map());
        }

        const monthlyBoard = this.leaderboards.get('monthly');
        monthlyBoard.set(userId, points);
    }

    /**
     * Получение лидерборда
     */
    getLeaderboard(type = 'weekly', limit = 10) {
        if (!this.leaderboards.has(type)) {
            return [];
        }

        const board = this.leaderboards.get(type);
        return Array.from(board.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([userId, points], index) => ({
                rank: index + 1,
                userId,
                points,
                profile: this.getUserProfile(userId)
            }));
    }

    /**
     * Покупка награды
     */
    buyReward(userId, rewardId) {
        const profile = this.getUserProfile(userId);
        const reward = this.rewards.get(rewardId);

        if (!reward) {
            console.error('Награда не найдена:', rewardId);
            return false;
        }

        if (profile.points < reward.cost) {
            console.error('Недостаточно очков для покупки награды');
            return false;
        }

        profile.points -= reward.cost;
        profile.rewards.add(rewardId);

        // Активация эффекта награды
        this.activateRewardEffect(userId, reward);

        this.saveData();
        return true;
    }

    /**
     * Активация эффекта награды
     */
    activateRewardEffect(userId, reward) {
        const effect = reward.effect;

        switch (effect.type) {
            case 'premium_access':
                this.activatePremiumAccess(userId, effect.duration);
                break;
            case 'profile_boost':
                this.activateProfileBoost(userId, effect.duration);
                break;
            case 'extra_applications':
                this.addExtraApplications(userId, effect.count);
                break;
            case 'custom_badge':
                this.createCustomBadge(userId);
                break;
            case 'priority_support':
                this.activatePrioritySupport(userId, effect.duration);
                break;
        }
    }

    /**
     * Показ уведомления о получении очков
     */
    showPointsNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">🎯</span>
                <span>+${points} очков</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Показ уведомления о достижении
     */
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">🏆</span>
                <div>
                    <div class="font-semibold">${achievement.name}</div>
                    <div class="text-sm opacity-90">+${achievement.points} очков</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Показ уведомления о бейдже
     */
    showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${badge.icon}</span>
                <div>
                    <div class="font-semibold">Новый бейдж: ${badge.name}</div>
                    <div class="text-sm opacity-90">${badge.description}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Показ уведомления о квесте
     */
    showQuestNotification(quest) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">📋</span>
                <div>
                    <div class="font-semibold">Квест выполнен: ${quest.name}</div>
                    <div class="text-sm opacity-90">+${quest.points} очков</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Показ уведомления о повышении уровня
     */
    showLevelUpNotification(oldLevel, newLevel) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">🚀</span>
                <div>
                    <div class="font-semibold">Повышение уровня!</div>
                    <div class="text-sm opacity-90">Уровень ${oldLevel} → ${newLevel}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка действий пользователя
        document.addEventListener('gamificationAction', (e) => {
            const { userId, actionType, actionData } = e.detail;
            this.processAction(userId, actionType, actionData);
        });

        // Обработка покупки наград
        document.addEventListener('buyReward', (e) => {
            const { userId, rewardId } = e.detail;
            this.buyReward(userId, rewardId);
        });
    }

    /**
     * Получение статистики системы
     */
    getSystemStats() {
        return {
            totalUsers: this.userProfiles.size,
            totalAchievements: this.achievements.size,
            totalBadges: this.badges.size,
            totalQuests: this.quests.size,
            totalRewards: this.rewards.size,
            activeEvents: this.events.size
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим геймификации');
        
        const testUserId = 'test-user-1';
        
        // Создание тестового профиля
        const profile = this.getUserProfile(testUserId);
        
        // Симуляция различных действий
        const testActions = [
            { actionType: 'application_submitted', actionData: {} },
            { actionType: 'message_sent', actionData: {} },
            { actionType: 'profile_updated', actionData: {} },
            { actionType: 'skill_added', actionData: {} },
            { actionType: 'daily_login', actionData: {} }
        ];

        // Выполнение тестовых действий
        testActions.forEach((action, index) => {
            setTimeout(() => {
                this.processAction(testUserId, action.actionType, action.actionData);
            }, index * 2000);
        });

        return {
            profile: this.getUserProfile(testUserId),
            stats: this.getUserStats(testUserId),
            systemStats: this.getSystemStats()
        };
    }
}

// Экспорт для использования в других модулях
window.GamificationSystem = GamificationSystem; 