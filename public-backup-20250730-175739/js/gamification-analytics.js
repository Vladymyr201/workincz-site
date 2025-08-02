/**
 * Аналитический модуль для системы геймификации
 * Отслеживание эффективности, метрик и генерация отчетов
 */

class GamificationAnalytics {
    constructor(gamificationSystem) {
        this.system = gamificationSystem;
        this.metrics = {
            totalUsers: 0,
            totalAchievements: 0,
            totalBadges: 0,
            totalQuests: 0,
            totalRewards: 0,
            averageLevel: 0,
            averagePoints: 0,
            engagementRate: 0,
            retentionRate: 0,
            conversionRate: 0,
            userActivity: new Map(),
            achievementStats: new Map(),
            badgeStats: new Map(),
            questStats: new Map(),
            rewardStats: new Map(),
            dailyStats: new Map(),
            weeklyStats: new Map(),
            monthlyStats: new Map()
        };
        this.init();
    }

    /**
     * Инициализация аналитики
     */
    init() {
        this.loadMetrics();
        this.setupTracking();
        console.log('📊 Аналитика геймификации инициализирована');
    }

    /**
     * Загрузка метрик из localStorage
     */
    loadMetrics() {
        try {
            const savedMetrics = localStorage.getItem('gamificationAnalytics');
            if (savedMetrics) {
                const parsed = JSON.parse(savedMetrics);
                this.metrics = { ...this.metrics, ...parsed };
                
                // Восстанавливаем Map объекты
                this.metrics.userActivity = new Map(parsed.userActivity || []);
                this.metrics.achievementStats = new Map(parsed.achievementStats || []);
                this.metrics.badgeStats = new Map(parsed.badgeStats || []);
                this.metrics.questStats = new Map(parsed.questStats || []);
                this.metrics.rewardStats = new Map(parsed.rewardStats || []);
                this.metrics.dailyStats = new Map(parsed.dailyStats || []);
                this.metrics.weeklyStats = new Map(parsed.weeklyStats || []);
                this.metrics.monthlyStats = new Map(parsed.monthlyStats || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки метрик геймификации:', error);
        }
    }

    /**
     * Сохранение метрик в localStorage
     */
    saveMetrics() {
        try {
            const metricsToSave = {
                ...this.metrics,
                userActivity: Array.from(this.metrics.userActivity.entries()),
                achievementStats: Array.from(this.metrics.achievementStats.entries()),
                badgeStats: Array.from(this.metrics.badgeStats.entries()),
                questStats: Array.from(this.metrics.questStats.entries()),
                rewardStats: Array.from(this.metrics.rewardStats.entries()),
                dailyStats: Array.from(this.metrics.dailyStats.entries()),
                weeklyStats: Array.from(this.metrics.weeklyStats.entries()),
                monthlyStats: Array.from(this.metrics.monthlyStats.entries())
            };
            localStorage.setItem('gamificationAnalytics', JSON.stringify(metricsToSave));
        } catch (error) {
            console.error('Ошибка сохранения метрик геймификации:', error);
        }
    }

    /**
     * Настройка отслеживания событий
     */
    setupTracking() {
        // Отслеживание действий пользователей
        document.addEventListener('gamificationAction', (e) => {
            this.trackUserAction(e.detail);
        });

        // Отслеживание достижений
        document.addEventListener('achievementUnlocked', (e) => {
            this.trackAchievement(e.detail);
        });

        // Отслеживание бейджей
        document.addEventListener('badgeEarned', (e) => {
            this.trackBadge(e.detail);
        });

        // Отслеживание квестов
        document.addEventListener('questCompleted', (e) => {
            this.trackQuest(e.detail);
        });

        // Отслеживание покупок наград
        document.addEventListener('rewardPurchased', (e) => {
            this.trackReward(e.detail);
        });
    }

    /**
     * Отслеживание действий пользователя
     */
    trackUserAction(detail) {
        const { userId, actionType, actionData } = detail;
        
        // Обновление общей статистики
        this.updateOverallStats();
        
        // Обновление активности пользователя
        this.updateUserActivity(userId, actionType);
        
        // Обновление дневной статистики
        this.updateDailyStats(actionType);
        
        // Обновление еженедельной статистики
        this.updateWeeklyStats(actionType);
        
        // Обновление месячной статистики
        this.updateMonthlyStats(actionType);
        
        this.saveMetrics();
    }

    /**
     * Отслеживание достижения
     */
    trackAchievement(detail) {
        const { userId, achievement } = detail;
        
        // Обновление статистики достижений
        if (!this.metrics.achievementStats.has(achievement.id)) {
            this.metrics.achievementStats.set(achievement.id, {
                unlocked: 0,
                totalPoints: 0,
                averageUnlockTime: 0,
                firstUnlock: null,
                lastUnlock: null
            });
        }
        
        const stats = this.metrics.achievementStats.get(achievement.id);
        stats.unlocked++;
        stats.totalPoints += achievement.points;
        stats.lastUnlock = Date.now();
        
        if (!stats.firstUnlock) {
            stats.firstUnlock = Date.now();
        }
        
        // Обновление общей статистики
        this.metrics.totalAchievements++;
        
        this.saveMetrics();
    }

    /**
     * Отслеживание бейджа
     */
    trackBadge(detail) {
        const { userId, badge } = detail;
        
        // Обновление статистики бейджей
        if (!this.metrics.badgeStats.has(badge.id)) {
            this.metrics.badgeStats.set(badge.id, {
                earned: 0,
                rarity: badge.rarity,
                firstEarned: null,
                lastEarned: null
            });
        }
        
        const stats = this.metrics.badgeStats.get(badge.id);
        stats.earned++;
        stats.lastEarned = Date.now();
        
        if (!stats.firstEarned) {
            stats.firstEarned = Date.now();
        }
        
        // Обновление общей статистики
        this.metrics.totalBadges++;
        
        this.saveMetrics();
    }

    /**
     * Отслеживание квеста
     */
    trackQuest(detail) {
        const { userId, quest } = detail;
        
        // Обновление статистики квестов
        if (!this.metrics.questStats.has(quest.id)) {
            this.metrics.questStats.set(quest.id, {
                completed: 0,
                totalPoints: 0,
                averageCompletionTime: 0,
                firstCompletion: null,
                lastCompletion: null
            });
        }
        
        const stats = this.metrics.questStats.get(quest.id);
        stats.completed++;
        stats.totalPoints += quest.points;
        stats.lastCompletion = Date.now();
        
        if (!stats.firstCompletion) {
            stats.firstCompletion = Date.now();
        }
        
        // Обновление общей статистики
        this.metrics.totalQuests++;
        
        this.saveMetrics();
    }

    /**
     * Отслеживание награды
     */
    trackReward(detail) {
        const { userId, reward } = detail;
        
        // Обновление статистики наград
        if (!this.metrics.rewardStats.has(reward.id)) {
            this.metrics.rewardStats.set(reward.id, {
                purchased: 0,
                totalCost: 0,
                averagePurchaseTime: 0,
                firstPurchase: null,
                lastPurchase: null
            });
        }
        
        const stats = this.metrics.rewardStats.get(reward.id);
        stats.purchased++;
        stats.totalCost += reward.cost;
        stats.lastPurchase = Date.now();
        
        if (!stats.firstPurchase) {
            stats.firstPurchase = Date.now();
        }
        
        // Обновление общей статистики
        this.metrics.totalRewards++;
        
        this.saveMetrics();
    }

    /**
     * Обновление общей статистики
     */
    updateOverallStats() {
        const profiles = Array.from(this.system.userProfiles.values());
        
        this.metrics.totalUsers = profiles.length;
        this.metrics.averageLevel = profiles.length > 0 ? 
            profiles.reduce((sum, p) => sum + p.level, 0) / profiles.length : 0;
        this.metrics.averagePoints = profiles.length > 0 ? 
            profiles.reduce((sum, p) => sum + p.points, 0) / profiles.length : 0;
        
        // Расчет вовлеченности
        const activeUsers = profiles.filter(p => {
            const lastActivity = Date.now() - p.lastUpdated;
            return lastActivity < 7 * 24 * 60 * 60 * 1000; // Активны за последнюю неделю
        }).length;
        
        this.metrics.engagementRate = this.metrics.totalUsers > 0 ? 
            (activeUsers / this.metrics.totalUsers) * 100 : 0;
    }

    /**
     * Обновление активности пользователя
     */
    updateUserActivity(userId, actionType) {
        if (!this.metrics.userActivity.has(userId)) {
            this.metrics.userActivity.set(userId, {
                totalActions: 0,
                lastAction: null,
                actionTypes: new Map(),
                totalPoints: 0,
                achievements: 0,
                badges: 0,
                quests: 0
            });
        }
        
        const activity = this.metrics.userActivity.get(userId);
        activity.totalActions++;
        activity.lastAction = Date.now();
        
        if (!activity.actionTypes.has(actionType)) {
            activity.actionTypes.set(actionType, 0);
        }
        activity.actionTypes.set(actionType, activity.actionTypes.get(actionType) + 1);
        
        // Обновление данных из профиля
        const profile = this.system.getUserProfile(userId);
        activity.totalPoints = profile.points;
        activity.achievements = profile.achievements.size;
        activity.badges = profile.badges.size;
        activity.quests = profile.completedQuests.size;
    }

    /**
     * Обновление дневной статистики
     */
    updateDailyStats(actionType) {
        const today = new Date().toDateString();
        
        if (!this.metrics.dailyStats.has(today)) {
            this.metrics.dailyStats.set(today, {
                totalActions: 0,
                actionTypes: new Map(),
                newUsers: 0,
                achievements: 0,
                badges: 0,
                quests: 0,
                rewards: 0
            });
        }
        
        const dailyStats = this.metrics.dailyStats.get(today);
        dailyStats.totalActions++;
        
        if (!dailyStats.actionTypes.has(actionType)) {
            dailyStats.actionTypes.set(actionType, 0);
        }
        dailyStats.actionTypes.set(actionType, dailyStats.actionTypes.get(actionType) + 1);
    }

    /**
     * Обновление еженедельной статистики
     */
    updateWeeklyStats(actionType) {
        const weekStart = this.getWeekStart();
        
        if (!this.metrics.weeklyStats.has(weekStart)) {
            this.metrics.weeklyStats.set(weekStart, {
                totalActions: 0,
                actionTypes: new Map(),
                activeUsers: 0,
                achievements: 0,
                badges: 0,
                quests: 0,
                rewards: 0
            });
        }
        
        const weeklyStats = this.metrics.weeklyStats.get(weekStart);
        weeklyStats.totalActions++;
        
        if (!weeklyStats.actionTypes.has(actionType)) {
            weeklyStats.actionTypes.set(actionType, 0);
        }
        weeklyStats.actionTypes.set(actionType, weeklyStats.actionTypes.get(actionType) + 1);
    }

    /**
     * Обновление месячной статистики
     */
    updateMonthlyStats(actionType) {
        const monthStart = this.getMonthStart();
        
        if (!this.metrics.monthlyStats.has(monthStart)) {
            this.metrics.monthlyStats.set(monthStart, {
                totalActions: 0,
                actionTypes: new Map(),
                activeUsers: 0,
                achievements: 0,
                badges: 0,
                quests: 0,
                rewards: 0
            });
        }
        
        const monthlyStats = this.metrics.monthlyStats.get(monthStart);
        monthlyStats.totalActions++;
        
        if (!monthlyStats.actionTypes.has(actionType)) {
            monthlyStats.actionTypes.set(actionType, 0);
        }
        monthlyStats.actionTypes.set(actionType, monthlyStats.actionTypes.get(actionType) + 1);
    }

    /**
     * Получение начала недели
     */
    getWeekStart() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toDateString();
    }

    /**
     * Получение начала месяца
     */
    getMonthStart() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return firstDay.toDateString();
    }

    /**
     * Получение общей статистики
     */
    getOverallStats() {
        return {
            totalUsers: this.metrics.totalUsers,
            totalAchievements: this.metrics.totalAchievements,
            totalBadges: this.metrics.totalBadges,
            totalQuests: this.metrics.totalQuests,
            totalRewards: this.metrics.totalRewards,
            averageLevel: Math.round(this.metrics.averageLevel * 100) / 100,
            averagePoints: Math.round(this.metrics.averagePoints * 100) / 100,
            engagementRate: Math.round(this.metrics.engagementRate * 100) / 100,
            retentionRate: this.calculateRetentionRate(),
            conversionRate: this.calculateConversionRate()
        };
    }

    /**
     * Расчет retention rate
     */
    calculateRetentionRate() {
        const profiles = Array.from(this.system.userProfiles.values());
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        const activeThisWeek = profiles.filter(p => p.lastUpdated > weekAgo).length;
        const activeThisMonth = profiles.filter(p => p.lastUpdated > monthAgo).length;
        
        return {
            weekly: this.metrics.totalUsers > 0 ? Math.round((activeThisWeek / this.metrics.totalUsers) * 10000) / 100 : 0,
            monthly: this.metrics.totalUsers > 0 ? Math.round((activeThisMonth / this.metrics.totalUsers) * 10000) / 100 : 0
        };
    }

    /**
     * Расчет conversion rate
     */
    calculateConversionRate() {
        const profiles = Array.from(this.system.userProfiles.values());
        const usersWithAchievements = profiles.filter(p => p.achievements.size > 0).length;
        const usersWithBadges = profiles.filter(p => p.badges.size > 0).length;
        const usersWithQuests = profiles.filter(p => p.completedQuests.size > 0).length;
        
        return {
            achievements: this.metrics.totalUsers > 0 ? Math.round((usersWithAchievements / this.metrics.totalUsers) * 10000) / 100 : 0,
            badges: this.metrics.totalUsers > 0 ? Math.round((usersWithBadges / this.metrics.totalUsers) * 10000) / 100 : 0,
            quests: this.metrics.totalUsers > 0 ? Math.round((usersWithQuests / this.metrics.totalUsers) * 10000) / 100 : 0
        };
    }

    /**
     * Получение топ пользователей
     */
    getTopUsers(limit = 10) {
        const profiles = Array.from(this.system.userProfiles.values())
            .sort((a, b) => b.points - a.points)
            .slice(0, limit)
            .map((profile, index) => ({
                rank: index + 1,
                userId: profile.userId,
                level: profile.level,
                points: profile.points,
                achievements: profile.achievements.size,
                badges: profile.badges.size,
                quests: profile.completedQuests.size
            }));
        
        return profiles;
    }

    /**
     * Получение топ достижений
     */
    getTopAchievements(limit = 10) {
        return Array.from(this.metrics.achievementStats.entries())
            .map(([id, stats]) => ({
                id,
                achievement: this.system.achievements.get(id),
                unlocked: stats.unlocked,
                totalPoints: stats.totalPoints
            }))
            .sort((a, b) => b.unlocked - a.unlocked)
            .slice(0, limit);
    }

    /**
     * Получение топ бейджей
     */
    getTopBadges(limit = 10) {
        return Array.from(this.metrics.badgeStats.entries())
            .map(([id, stats]) => ({
                id,
                badge: this.system.badges.get(id),
                earned: stats.earned,
                rarity: stats.rarity
            }))
            .sort((a, b) => b.earned - a.earned)
            .slice(0, limit);
    }

    /**
     * Получение топ квестов
     */
    getTopQuests(limit = 10) {
        return Array.from(this.metrics.questStats.entries())
            .map(([id, stats]) => ({
                id,
                quest: this.system.quests.get(id),
                completed: stats.completed,
                totalPoints: stats.totalPoints
            }))
            .sort((a, b) => b.completed - a.completed)
            .slice(0, limit);
    }

    /**
     * Получение статистики по дням
     */
    getDailyStats(days = 7) {
        const stats = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const dayStats = this.metrics.dailyStats.get(dateString) || {
                totalActions: 0,
                actionTypes: new Map(),
                newUsers: 0,
                achievements: 0,
                badges: 0,
                quests: 0,
                rewards: 0
            };
            
            stats.push({
                date: dateString,
                totalActions: dayStats.totalActions,
                newUsers: dayStats.newUsers,
                achievements: dayStats.achievements,
                badges: dayStats.badges,
                quests: dayStats.quests,
                rewards: dayStats.rewards
            });
        }
        
        return stats;
    }

    /**
     * Создание визуального отчета
     */
    createVisualReport() {
        const report = document.createElement('div');
        report.className = 'bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto';
        
        const overallStats = this.getOverallStats();
        const topUsers = this.getTopUsers(5);
        const topAchievements = this.getTopAchievements(5);
        const dailyStats = this.getDailyStats(7);
        
        report.innerHTML = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 Отчет по системе геймификации</h2>
                <p class="text-gray-600">Обновлено: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-blue-800">Пользователи</h3>
                    <p class="text-2xl font-bold text-blue-600">${overallStats.totalUsers}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-green-800">Вовлеченность</h3>
                    <p class="text-2xl font-bold text-green-600">${overallStats.engagementRate}%</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-yellow-800">Средний уровень</h3>
                    <p class="text-2xl font-bold text-yellow-600">${overallStats.averageLevel}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-purple-800">Средние очки</h3>
                    <p class="text-2xl font-bold text-purple-600">${overallStats.averagePoints}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🏆 Топ пользователей</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${topUsers.map(user => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                        ${user.rank}
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-800">Пользователь ${user.userId.slice(-6)}</div>
                                        <div class="text-sm text-gray-500">Уровень ${user.level}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-blue-600">${user.points} очков</div>
                                    <div class="text-xs text-gray-500">${user.achievements} достижений</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">🏅 Топ достижений</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${topAchievements.map(achievement => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                <div class="flex items-center space-x-3">
                                    <div class="text-2xl">${achievement.achievement.icon}</div>
                                    <div>
                                        <div class="font-medium text-gray-800">${achievement.achievement.name}</div>
                                        <div class="text-sm text-gray-500">${achievement.achievement.category}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-green-600">${achievement.unlocked}</div>
                                    <div class="text-xs text-gray-500">разблокировано</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-xl font-semibold text-gray-800 mb-4">📈 Активность за неделю</h3>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="grid grid-cols-7 gap-2">
                        ${dailyStats.map(day => `
                            <div class="text-center">
                                <div class="text-xs text-gray-500 mb-1">${new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                                <div class="bg-blue-500 text-white text-xs rounded px-1 py-1">
                                    ${day.totalActions}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return report;
    }

    /**
     * Экспорт данных для отчетов
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            overallStats: this.getOverallStats(),
            topUsers: this.getTopUsers(20),
            topAchievements: this.getTopAchievements(20),
            topBadges: this.getTopBadges(20),
            topQuests: this.getTopQuests(20),
            dailyStats: this.getDailyStats(30),
            rawMetrics: this.metrics
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим аналитики геймификации');
        
        // Генерируем тестовые данные
        const testUsers = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
        
        testUsers.forEach((userId, index) => {
            // Создаем тестовые профили
            const profile = this.system.getUserProfile(userId);
            profile.level = Math.floor(Math.random() * 20) + 1;
            profile.points = Math.floor(Math.random() * 1000) + 100;
            profile.achievements = new Set(['first-job-application', 'profile-complete']);
            profile.badges = new Set(['newcomer']);
            profile.completedQuests = new Set(['daily-login']);
            
            // Симулируем действия
            const actions = ['application_submitted', 'message_sent', 'profile_updated', 'skill_added'];
            actions.forEach(action => {
                this.trackUserAction({ userId, actionType: action, actionData: {} });
            });
        });
        
        // Показываем отчет
        const report = this.createVisualReport();
        document.body.appendChild(report);
        
        return {
            overallStats: this.getOverallStats(),
            topUsers: this.getTopUsers(5),
            topAchievements: this.getTopAchievements(5)
        };
    }
}

// Экспорт для использования в других модулях
window.GamificationAnalytics = GamificationAnalytics; 