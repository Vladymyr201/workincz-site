/**
 * Аналитический модуль для системы модерации
 * Отслеживание эффективности, метрик и генерация отчетов
 */

class ModerationAnalytics {
    constructor(moderationSystem) {
        this.system = moderationSystem;
        this.metrics = {
            totalModerated: 0,
            totalApproved: 0,
            totalRejected: 0,
            totalFlagged: 0,
            totalDeleted: 0,
            totalReports: 0,
            totalResolved: 0,
            averageResponseTime: 0,
            moderatorPerformance: new Map(),
            contentTypeStats: new Map(),
            reasonStats: new Map(),
            dailyStats: new Map(),
            weeklyStats: new Map(),
            monthlyStats: new Map(),
            spamDetectionRate: 0,
            falsePositiveRate: 0,
            userTrustDistribution: new Map(),
            employerRatingDistribution: new Map()
        };
        this.init();
    }

    /**
     * Инициализация аналитики
     */
    init() {
        this.loadMetrics();
        this.setupTracking();
        console.log('📊 Аналитика модерации инициализирована');
    }

    /**
     * Загрузка метрик из localStorage
     */
    loadMetrics() {
        try {
            const savedMetrics = localStorage.getItem('moderationAnalytics');
            if (savedMetrics) {
                const parsed = JSON.parse(savedMetrics);
                this.metrics = { ...this.metrics, ...parsed };
                
                // Восстанавливаем Map объекты
                this.metrics.moderatorPerformance = new Map(parsed.moderatorPerformance || []);
                this.metrics.contentTypeStats = new Map(parsed.contentTypeStats || []);
                this.metrics.reasonStats = new Map(parsed.reasonStats || []);
                this.metrics.dailyStats = new Map(parsed.dailyStats || []);
                this.metrics.weeklyStats = new Map(parsed.weeklyStats || []);
                this.metrics.monthlyStats = new Map(parsed.monthlyStats || []);
                this.metrics.userTrustDistribution = new Map(parsed.userTrustDistribution || []);
                this.metrics.employerRatingDistribution = new Map(parsed.employerRatingDistribution || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки метрик модерации:', error);
        }
    }

    /**
     * Сохранение метрик в localStorage
     */
    saveMetrics() {
        try {
            const metricsToSave = {
                ...this.metrics,
                moderatorPerformance: Array.from(this.metrics.moderatorPerformance.entries()),
                contentTypeStats: Array.from(this.metrics.contentTypeStats.entries()),
                reasonStats: Array.from(this.metrics.reasonStats.entries()),
                dailyStats: Array.from(this.metrics.dailyStats.entries()),
                weeklyStats: Array.from(this.metrics.weeklyStats.entries()),
                monthlyStats: Array.from(this.metrics.monthlyStats.entries()),
                userTrustDistribution: Array.from(this.metrics.userTrustDistribution.entries()),
                employerRatingDistribution: Array.from(this.metrics.employerRatingDistribution.entries())
            };
            localStorage.setItem('moderationAnalytics', JSON.stringify(metricsToSave));
        } catch (error) {
            console.error('Ошибка сохранения метрик модерации:', error);
        }
    }

    /**
     * Настройка отслеживания событий
     */
    setupTracking() {
        // Отслеживание действий модерации
        document.addEventListener('moderationAction', (e) => {
            this.trackModerationAction(e.detail);
        });

        // Отслеживание жалоб
        document.addEventListener('contentReported', (e) => {
            this.trackContentReport(e.detail);
        });

        // Отслеживание автоматической модерации
        document.addEventListener('autoModeration', (e) => {
            this.trackAutoModeration(e.detail);
        });
    }

    /**
     * Отслеживание действия модерации
     */
    trackModerationAction(detail) {
        const { itemId, moderatorId, action, reason, timestamp } = detail;
        
        // Обновление общей статистики
        this.metrics.totalModerated++;
        
        switch (action) {
            case 'approve':
                this.metrics.totalApproved++;
                break;
            case 'reject':
                this.metrics.totalRejected++;
                break;
            case 'flag':
                this.metrics.totalFlagged++;
                break;
            case 'delete':
                this.metrics.totalDeleted++;
                break;
        }

        // Обновление статистики модератора
        this.updateModeratorPerformance(moderatorId, action);

        // Обновление статистики по типам контента
        this.updateContentTypeStats(detail);

        // Обновление статистики по причинам
        this.updateReasonStats(reason);

        // Обновление временной статистики
        this.updateTimeStats(timestamp, action);

        this.saveMetrics();
    }

    /**
     * Отслеживание жалобы на контент
     */
    trackContentReport(detail) {
        const { contentId, contentType, reason, timestamp } = detail;
        
        this.metrics.totalReports++;
        
        // Обновление статистики по причинам жалоб
        if (!this.metrics.reasonStats.has(reason)) {
            this.metrics.reasonStats.set(reason, {
                count: 0,
                resolved: 0,
                averageResolutionTime: 0
            });
        }
        
        const reasonStats = this.metrics.reasonStats.get(reason);
        reasonStats.count++;
        this.metrics.reasonStats.set(reason, reasonStats);

        // Обновление временной статистики
        this.updateTimeStats(timestamp, 'report');
    }

    /**
     * Отслеживание автоматической модерации
     */
    trackAutoModeration(detail) {
        const { contentId, action, score, flags } = detail;
        
        // Обновление статистики обнаружения спама
        if (flags.includes('spam')) {
            this.metrics.spamDetectionRate = this.calculateSpamDetectionRate();
        }

        // Обновление статистики ложных срабатываний
        if (action === 'reject' && score < 30) {
            this.metrics.falsePositiveRate = this.calculateFalsePositiveRate();
        }
    }

    /**
     * Обновление производительности модератора
     */
    updateModeratorPerformance(moderatorId, action) {
        if (!this.metrics.moderatorPerformance.has(moderatorId)) {
            this.metrics.moderatorPerformance.set(moderatorId, {
                totalActions: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                averageResponseTime: 0,
                lastAction: null
            });
        }
        
        const performance = this.metrics.moderatorPerformance.get(moderatorId);
        performance.totalActions++;
        performance.lastAction = Date.now();
        
        switch (action) {
            case 'approve':
                performance.approved++;
                break;
            case 'reject':
                performance.rejected++;
                break;
            case 'flag':
                performance.flagged++;
                break;
            case 'delete':
                performance.deleted++;
                break;
        }
        
        this.metrics.moderatorPerformance.set(moderatorId, performance);
    }

    /**
     * Обновление статистики по типам контента
     */
    updateContentTypeStats(detail) {
        const contentType = detail.contentType || 'unknown';
        
        if (!this.metrics.contentTypeStats.has(contentType)) {
            this.metrics.contentTypeStats.set(contentType, {
                total: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                averageScore: 0
            });
        }
        
        const stats = this.metrics.contentTypeStats.get(contentType);
        stats.total++;
        
        switch (detail.action) {
            case 'approve':
                stats.approved++;
                break;
            case 'reject':
                stats.rejected++;
                break;
            case 'flag':
                stats.flagged++;
                break;
            case 'delete':
                stats.deleted++;
                break;
        }
        
        // Обновление среднего счета
        if (detail.score !== undefined) {
            stats.averageScore = (stats.averageScore * (stats.total - 1) + detail.score) / stats.total;
        }
        
        this.metrics.contentTypeStats.set(contentType, stats);
    }

    /**
     * Обновление статистики по причинам
     */
    updateReasonStats(reason) {
        if (!reason) return;
        
        if (!this.metrics.reasonStats.has(reason)) {
            this.metrics.reasonStats.set(reason, {
                count: 0,
                resolved: 0,
                averageResolutionTime: 0
            });
        }
        
        const stats = this.metrics.reasonStats.get(reason);
        stats.count++;
        this.metrics.reasonStats.set(reason, stats);
    }

    /**
     * Обновление временной статистики
     */
    updateTimeStats(timestamp, action) {
        const date = new Date(timestamp);
        const dayKey = date.toDateString();
        const weekKey = this.getWeekStart(date);
        const monthKey = this.getMonthStart(date);
        
        // Дневная статистика
        if (!this.metrics.dailyStats.has(dayKey)) {
            this.metrics.dailyStats.set(dayKey, {
                total: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                reports: 0
            });
        }
        
        const dailyStats = this.metrics.dailyStats.get(dayKey);
        dailyStats.total++;
        
        if (action === 'report') {
            dailyStats.reports++;
        } else {
            switch (action) {
                case 'approve':
                    dailyStats.approved++;
                    break;
                case 'reject':
                    dailyStats.rejected++;
                    break;
                case 'flag':
                    dailyStats.flagged++;
                    break;
                case 'delete':
                    dailyStats.deleted++;
                    break;
            }
        }
        
        this.metrics.dailyStats.set(dayKey, dailyStats);
        
        // Аналогично для недельной и месячной статистики
        this.updateWeeklyStats(weekKey, action);
        this.updateMonthlyStats(monthKey, action);
    }

    /**
     * Обновление недельной статистики
     */
    updateWeeklyStats(weekKey, action) {
        if (!this.metrics.weeklyStats.has(weekKey)) {
            this.metrics.weeklyStats.set(weekKey, {
                total: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                reports: 0
            });
        }
        
        const weeklyStats = this.metrics.weeklyStats.get(weekKey);
        weeklyStats.total++;
        
        if (action === 'report') {
            weeklyStats.reports++;
        } else {
            switch (action) {
                case 'approve':
                    weeklyStats.approved++;
                    break;
                case 'reject':
                    weeklyStats.rejected++;
                    break;
                case 'flag':
                    weeklyStats.flagged++;
                    break;
                case 'delete':
                    weeklyStats.deleted++;
                    break;
            }
        }
        
        this.metrics.weeklyStats.set(weekKey, weeklyStats);
    }

    /**
     * Обновление месячной статистики
     */
    updateMonthlyStats(monthKey, action) {
        if (!this.metrics.monthlyStats.has(monthKey)) {
            this.metrics.monthlyStats.set(monthKey, {
                total: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                reports: 0
            });
        }
        
        const monthlyStats = this.metrics.monthlyStats.get(monthKey);
        monthlyStats.total++;
        
        if (action === 'report') {
            monthlyStats.reports++;
        } else {
            switch (action) {
                case 'approve':
                    monthlyStats.approved++;
                    break;
                case 'reject':
                    monthlyStats.rejected++;
                    break;
                case 'flag':
                    monthlyStats.flagged++;
                    break;
                case 'delete':
                    monthlyStats.deleted++;
                    break;
            }
        }
        
        this.metrics.monthlyStats.set(monthKey, monthlyStats);
    }

    /**
     * Получение начала недели
     */
    getWeekStart(date) {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        return monday.toDateString();
    }

    /**
     * Получение начала месяца
     */
    getMonthStart(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstDay.toDateString();
    }

    /**
     * Расчет статистики доверия пользователей
     */
    updateUserTrustDistribution() {
        const trustScores = Array.from(this.system.userTrustScores.values());
        
        const distribution = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        };
        
        trustScores.forEach(user => {
            const score = user.score;
            if (score <= 20) distribution['0-20']++;
            else if (score <= 40) distribution['21-40']++;
            else if (score <= 60) distribution['41-60']++;
            else if (score <= 80) distribution['61-80']++;
            else distribution['81-100']++;
        });
        
        this.metrics.userTrustDistribution = new Map(Object.entries(distribution));
    }

    /**
     * Расчет статистики рейтингов работодателей
     */
    updateEmployerRatingDistribution() {
        const employerRatings = Array.from(this.system.employerRatings.values());
        
        const distribution = {
            '0-1': 0,
            '1-2': 0,
            '2-3': 0,
            '3-4': 0,
            '4-5': 0
        };
        
        employerRatings.forEach(employer => {
            const rating = employer.rating;
            if (rating <= 1) distribution['0-1']++;
            else if (rating <= 2) distribution['1-2']++;
            else if (rating <= 3) distribution['2-3']++;
            else if (rating <= 4) distribution['3-4']++;
            else distribution['4-5']++;
        });
        
        this.metrics.employerRatingDistribution = new Map(Object.entries(distribution));
    }

    /**
     * Расчет эффективности обнаружения спама
     */
    calculateSpamDetectionRate() {
        const totalSpam = this.metrics.reasonStats.get('spam')?.count || 0;
        const totalRejected = this.metrics.totalRejected;
        
        return totalRejected > 0 ? (totalSpam / totalRejected) * 100 : 0;
    }

    /**
     * Расчет ложных срабатываний
     */
    calculateFalsePositiveRate() {
        // Упрощенный расчет - в реальном приложении нужна более сложная логика
        const lowScoreRejections = this.metrics.totalRejected * 0.1; // Предполагаем 10% ложных срабатываний
        return this.metrics.totalRejected > 0 ? (lowScoreRejections / this.metrics.totalRejected) * 100 : 0;
    }

    /**
     * Получение общей статистики
     */
    getOverallStats() {
        this.updateUserTrustDistribution();
        this.updateEmployerRatingDistribution();
        
        return {
            totalModerated: this.metrics.totalModerated,
            totalApproved: this.metrics.totalApproved,
            totalRejected: this.metrics.totalRejected,
            totalFlagged: this.metrics.totalFlagged,
            totalDeleted: this.metrics.totalDeleted,
            totalReports: this.metrics.totalReports,
            approvalRate: this.metrics.totalModerated > 0 ? 
                (this.metrics.totalApproved / this.metrics.totalModerated) * 100 : 0,
            rejectionRate: this.metrics.totalModerated > 0 ? 
                (this.metrics.totalRejected / this.metrics.totalModerated) * 100 : 0,
            spamDetectionRate: this.metrics.spamDetectionRate,
            falsePositiveRate: this.metrics.falsePositiveRate,
            averageResponseTime: this.metrics.averageResponseTime
        };
    }

    /**
     * Получение топ модераторов
     */
    getTopModerators(limit = 10) {
        return Array.from(this.metrics.moderatorPerformance.entries())
            .map(([moderatorId, performance]) => ({
                moderatorId,
                totalActions: performance.totalActions,
                approvalRate: performance.totalActions > 0 ? 
                    (performance.approved / performance.totalActions) * 100 : 0,
                averageResponseTime: performance.averageResponseTime,
                lastAction: performance.lastAction
            }))
            .sort((a, b) => b.totalActions - a.totalActions)
            .slice(0, limit);
    }

    /**
     * Получение статистики по типам контента
     */
    getContentTypeStats() {
        return Array.from(this.metrics.contentTypeStats.entries())
            .map(([contentType, stats]) => ({
                contentType,
                total: stats.total,
                approved: stats.approved,
                rejected: stats.rejected,
                flagged: stats.flagged,
                deleted: stats.deleted,
                approvalRate: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
                averageScore: stats.averageScore
            }))
            .sort((a, b) => b.total - a.total);
    }

    /**
     * Получение статистики по причинам
     */
    getReasonStats() {
        return Array.from(this.metrics.reasonStats.entries())
            .map(([reason, stats]) => ({
                reason,
                count: stats.count,
                resolved: stats.resolved,
                resolutionRate: stats.count > 0 ? (stats.resolved / stats.count) * 100 : 0,
                averageResolutionTime: stats.averageResolutionTime
            }))
            .sort((a, b) => b.count - a.count);
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
                total: 0,
                approved: 0,
                rejected: 0,
                flagged: 0,
                deleted: 0,
                reports: 0
            };
            
            stats.push({
                date: dateString,
                ...dayStats
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
        const topModerators = this.getTopModerators(5);
        const contentTypeStats = this.getContentTypeStats();
        const dailyStats = this.getDailyStats(7);
        
        report.innerHTML = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">🛡️ Отчет по модерации контента</h2>
                <p class="text-gray-600">Обновлено: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-blue-800">Всего модераций</h3>
                    <p class="text-2xl font-bold text-blue-600">${overallStats.totalModerated}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-green-800">Одобрено</h3>
                    <p class="text-2xl font-bold text-green-600">${overallStats.approvalRate.toFixed(1)}%</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-red-800">Отклонено</h3>
                    <p class="text-2xl font-bold text-red-600">${overallStats.rejectionRate.toFixed(1)}%</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-yellow-800">Жалобы</h3>
                    <p class="text-2xl font-bold text-yellow-600">${overallStats.totalReports}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">👨‍⚖️ Топ модераторов</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${topModerators.map((moderator, index) => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        ${index + 1}
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-800">${moderator.moderatorId}</div>
                                        <div class="text-sm text-gray-500">${moderator.totalActions} действий</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-green-600">${moderator.approvalRate.toFixed(1)}%</div>
                                    <div class="text-xs text-gray-500">одобрений</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">📊 Статистика по типам контента</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${contentTypeStats.map(stat => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                <div>
                                    <div class="font-medium text-gray-800">${stat.contentType}</div>
                                    <div class="text-sm text-gray-500">${stat.total} элементов</div>
                                </div>
                                <div class="text-right">
                                    <div class="font-semibold text-blue-600">${stat.approvalRate.toFixed(1)}%</div>
                                    <div class="text-xs text-gray-500">одобрений</div>
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
                                    ${day.total}
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
            topModerators: this.getTopModerators(20),
            contentTypeStats: this.getContentTypeStats(),
            reasonStats: this.getReasonStats(),
            dailyStats: this.getDailyStats(30),
            rawMetrics: this.metrics
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим аналитики модерации');
        
        // Генерируем тестовые данные
        const testModerators = ['moderator-1', 'moderator-2', 'moderator-3'];
        const testActions = ['approve', 'reject', 'flag', 'delete'];
        const testContentTypes = ['job_posting', 'user_profile', 'message', 'review'];
        
        // Симулируем действия модерации
        for (let i = 0; i < 20; i++) {
            const moderator = testModerators[Math.floor(Math.random() * testModerators.length)];
            const action = testActions[Math.floor(Math.random() * testActions.length)];
            const contentType = testContentTypes[Math.floor(Math.random() * testContentTypes.length)];
            
            this.trackModerationAction({
                itemId: `test-item-${i}`,
                moderatorId: moderator,
                action: action,
                reason: 'test_reason',
                timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                contentType: contentType,
                score: Math.random() * 100
            });
        }
        
        // Симулируем жалобы
        for (let i = 0; i < 10; i++) {
            this.trackContentReport({
                contentId: `test-content-${i}`,
                contentType: testContentTypes[Math.floor(Math.random() * testContentTypes.length)],
                reason: ['spam', 'inappropriate', 'duplicate'][Math.floor(Math.random() * 3)],
                timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            });
        }
        
        // Показываем отчет
        const report = this.createVisualReport();
        document.body.appendChild(report);
        
        return {
            overallStats: this.getOverallStats(),
            topModerators: this.getTopModerators(5),
            contentTypeStats: this.getContentTypeStats()
        };
    }
}

// Экспорт для использования в других модулях
window.ModerationAnalytics = ModerationAnalytics; 