/**
 * Аналитический модуль для системы рекомендаций
 * Отслеживание эффективности, метрик и генерация отчетов
 */

class RecommendationAnalytics {
    constructor(recommendationEngine) {
        this.engine = recommendationEngine;
        this.metrics = {
            impressions: 0,
            clicks: 0,
            positiveFeedback: 0,
            negativeFeedback: 0,
            conversions: 0,
            averageMatchScore: 0,
            userEngagement: new Map(),
            jobPerformance: new Map(),
            algorithmPerformance: new Map()
        };
        this.init();
    }

    /**
     * Инициализация аналитики
     */
    init() {
        this.loadMetrics();
        this.setupTracking();
        console.log('📊 Аналитика рекомендаций инициализирована');
    }

    /**
     * Загрузка метрик из localStorage
     */
    loadMetrics() {
        try {
            const savedMetrics = localStorage.getItem('recommendationMetrics');
            if (savedMetrics) {
                const parsed = JSON.parse(savedMetrics);
                this.metrics = { ...this.metrics, ...parsed };
                
                // Восстанавливаем Map объекты
                this.metrics.userEngagement = new Map(parsed.userEngagement || []);
                this.metrics.jobPerformance = new Map(parsed.jobPerformance || []);
                this.metrics.algorithmPerformance = new Map(parsed.algorithmPerformance || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки метрик рекомендаций:', error);
        }
    }

    /**
     * Сохранение метрик в localStorage
     */
    saveMetrics() {
        try {
            const metricsToSave = {
                ...this.metrics,
                userEngagement: Array.from(this.metrics.userEngagement.entries()),
                jobPerformance: Array.from(this.metrics.jobPerformance.entries()),
                algorithmPerformance: Array.from(this.metrics.algorithmPerformance.entries())
            };
            localStorage.setItem('recommendationMetrics', JSON.stringify(metricsToSave));
        } catch (error) {
            console.error('Ошибка сохранения метрик рекомендаций:', error);
        }
    }

    /**
     * Настройка отслеживания событий
     */
    setupTracking() {
        // Отслеживание показов рекомендаций
        document.addEventListener('recommendationShown', (e) => {
            this.trackImpression(e.detail);
        });

        // Отслеживание кликов по рекомендациям
        document.addEventListener('recommendationClicked', (e) => {
            this.trackClick(e.detail);
        });

        // Отслеживание обратной связи
        document.addEventListener('recommendationFeedback', (e) => {
            this.trackFeedback(e.detail);
        });

        // Отслеживание конверсий
        document.addEventListener('recommendationConversion', (e) => {
            this.trackConversion(e.detail);
        });
    }

    /**
     * Отслеживание показа рекомендации
     */
    trackImpression(detail) {
        this.metrics.impressions++;
        
        const { userId, jobId, matchScore } = detail;
        
        // Обновляем статистику пользователя
        if (!this.metrics.userEngagement.has(userId)) {
            this.metrics.userEngagement.set(userId, {
                impressions: 0,
                clicks: 0,
                positiveFeedback: 0,
                negativeFeedback: 0,
                conversions: 0,
                averageMatchScore: 0,
                lastActivity: Date.now()
            });
        }
        
        const userStats = this.metrics.userEngagement.get(userId);
        userStats.impressions++;
        userStats.lastActivity = Date.now();
        
        // Обновляем статистику вакансии
        if (!this.metrics.jobPerformance.has(jobId)) {
            this.metrics.jobPerformance.set(jobId, {
                impressions: 0,
                clicks: 0,
                positiveFeedback: 0,
                negativeFeedback: 0,
                conversions: 0,
                averageMatchScore: 0
            });
        }
        
        const jobStats = this.metrics.jobPerformance.get(jobId);
        jobStats.impressions++;
        
        // Обновляем средний match score
        this.updateAverageMatchScore(jobId, matchScore);
        
        this.saveMetrics();
    }

    /**
     * Отслеживание клика по рекомендации
     */
    trackClick(detail) {
        this.metrics.clicks++;
        
        const { userId, jobId } = detail;
        
        // Обновляем статистику пользователя
        if (this.metrics.userEngagement.has(userId)) {
            const userStats = this.metrics.userEngagement.get(userId);
            userStats.clicks++;
        }
        
        // Обновляем статистику вакансии
        if (this.metrics.jobPerformance.has(jobId)) {
            const jobStats = this.metrics.jobPerformance.get(jobId);
            jobStats.clicks++;
        }
        
        this.saveMetrics();
    }

    /**
     * Отслеживание обратной связи
     */
    trackFeedback(detail) {
        const { userId, jobId, feedback } = detail;
        
        if (feedback === 'positive') {
            this.metrics.positiveFeedback++;
        } else if (feedback === 'negative') {
            this.metrics.negativeFeedback++;
        }
        
        // Обновляем статистику пользователя
        if (this.metrics.userEngagement.has(userId)) {
            const userStats = this.metrics.userEngagement.get(userId);
            if (feedback === 'positive') {
                userStats.positiveFeedback++;
            } else {
                userStats.negativeFeedback++;
            }
        }
        
        // Обновляем статистику вакансии
        if (this.metrics.jobPerformance.has(jobId)) {
            const jobStats = this.metrics.jobPerformance.get(jobId);
            if (feedback === 'positive') {
                jobStats.positiveFeedback++;
            } else {
                jobStats.negativeFeedback++;
            }
        }
        
        this.saveMetrics();
    }

    /**
     * Отслеживание конверсии
     */
    trackConversion(detail) {
        this.metrics.conversions++;
        
        const { userId, jobId } = detail;
        
        // Обновляем статистику пользователя
        if (this.metrics.userEngagement.has(userId)) {
            const userStats = this.metrics.userEngagement.get(userId);
            userStats.conversions++;
        }
        
        // Обновляем статистику вакансии
        if (this.metrics.jobPerformance.has(jobId)) {
            const jobStats = this.metrics.jobPerformance.get(jobId);
            jobStats.conversions++;
        }
        
        this.saveMetrics();
    }

    /**
     * Обновление среднего match score
     */
    updateAverageMatchScore(jobId, newScore) {
        const jobStats = this.metrics.jobPerformance.get(jobId);
        if (jobStats) {
            const totalScore = jobStats.averageMatchScore * (jobStats.impressions - 1) + newScore;
            jobStats.averageMatchScore = totalScore / jobStats.impressions;
        }
    }

    /**
     * Получение общих метрик
     */
    getOverallMetrics() {
        const totalImpressions = this.metrics.impressions;
        const totalClicks = this.metrics.clicks;
        const totalFeedback = this.metrics.positiveFeedback + this.metrics.negativeFeedback;
        
        return {
            impressions: totalImpressions,
            clicks: totalClicks,
            clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
            positiveFeedback: this.metrics.positiveFeedback,
            negativeFeedback: this.metrics.negativeFeedback,
            feedbackRate: totalImpressions > 0 ? (totalFeedback / totalImpressions * 100).toFixed(2) : 0,
            positiveFeedbackRate: totalFeedback > 0 ? (this.metrics.positiveFeedback / totalFeedback * 100).toFixed(2) : 0,
            conversions: this.metrics.conversions,
            conversionRate: totalClicks > 0 ? (this.metrics.conversions / totalClicks * 100).toFixed(2) : 0,
            averageMatchScore: this.calculateOverallAverageMatchScore()
        };
    }

    /**
     * Расчет общего среднего match score
     */
    calculateOverallAverageMatchScore() {
        let totalScore = 0;
        let totalJobs = 0;
        
        this.metrics.jobPerformance.forEach(jobStats => {
            if (jobStats.impressions > 0) {
                totalScore += jobStats.averageMatchScore * jobStats.impressions;
                totalJobs += jobStats.impressions;
            }
        });
        
        return totalJobs > 0 ? (totalScore / totalJobs * 100).toFixed(2) : 0;
    }

    /**
     * Получение топ пользователей по вовлеченности
     */
    getTopUsers(limit = 10) {
        const users = Array.from(this.metrics.userEngagement.entries())
            .map(([userId, stats]) => ({
                userId,
                ...stats,
                engagementScore: this.calculateUserEngagementScore(stats)
            }))
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, limit);
        
        return users;
    }

    /**
     * Расчет скора вовлеченности пользователя
     */
    calculateUserEngagementScore(stats) {
        const clickWeight = 1;
        const feedbackWeight = 2;
        const conversionWeight = 5;
        
        return stats.clicks * clickWeight + 
               (stats.positiveFeedback + stats.negativeFeedback) * feedbackWeight +
               stats.conversions * conversionWeight;
    }

    /**
     * Получение топ вакансий по производительности
     */
    getTopJobs(limit = 10) {
        const jobs = Array.from(this.metrics.jobPerformance.entries())
            .map(([jobId, stats]) => ({
                jobId,
                ...stats,
                performanceScore: this.calculateJobPerformanceScore(stats)
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore)
            .slice(0, limit);
        
        return jobs;
    }

    /**
     * Расчет скора производительности вакансии
     */
    calculateJobPerformanceScore(stats) {
        const ctrWeight = 0.3;
        const feedbackWeight = 0.4;
        const conversionWeight = 0.3;
        
        const ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
        const feedbackRate = stats.impressions > 0 ? (stats.positiveFeedback + stats.negativeFeedback) / stats.impressions : 0;
        const conversionRate = stats.clicks > 0 ? stats.conversions / stats.clicks : 0;
        
        return ctr * ctrWeight + feedbackRate * feedbackWeight + conversionRate * conversionWeight;
    }

    /**
     * Анализ эффективности алгоритма
     */
    analyzeAlgorithmPerformance() {
        const analysis = {
            overallEffectiveness: 0,
            userSegmentPerformance: new Map(),
            jobCategoryPerformance: new Map(),
            recommendations: []
        };

        // Общая эффективность
        const overallMetrics = this.getOverallMetrics();
        analysis.overallEffectiveness = (
            parseFloat(overallMetrics.clickThroughRate) * 0.4 +
            parseFloat(overallMetrics.positiveFeedbackRate) * 0.4 +
            parseFloat(overallMetrics.conversionRate) * 0.2
        );

        // Анализ по сегментам пользователей
        this.metrics.userEngagement.forEach((stats, userId) => {
            const engagementLevel = this.getUserEngagementLevel(stats);
            if (!analysis.userSegmentPerformance.has(engagementLevel)) {
                analysis.userSegmentPerformance.set(engagementLevel, {
                    users: 0,
                    avgCtr: 0,
                    avgFeedbackRate: 0,
                    avgConversionRate: 0
                });
            }
            
            const segment = analysis.userSegmentPerformance.get(engagementLevel);
            segment.users++;
            segment.avgCtr += stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
            segment.avgFeedbackRate += stats.impressions > 0 ? (stats.positiveFeedback + stats.negativeFeedback) / stats.impressions : 0;
            segment.avgConversionRate += stats.clicks > 0 ? stats.conversions / stats.clicks : 0;
        });

        // Нормализация средних значений
        analysis.userSegmentPerformance.forEach(segment => {
            if (segment.users > 0) {
                segment.avgCtr = (segment.avgCtr / segment.users * 100).toFixed(2);
                segment.avgFeedbackRate = (segment.avgFeedbackRate / segment.users * 100).toFixed(2);
                segment.avgConversionRate = (segment.avgConversionRate / segment.users * 100).toFixed(2);
            }
        });

        // Рекомендации по улучшению
        analysis.recommendations = this.generateRecommendations(overallMetrics);

        return analysis;
    }

    /**
     * Определение уровня вовлеченности пользователя
     */
    getUserEngagementLevel(stats) {
        const engagementScore = this.calculateUserEngagementScore(stats);
        
        if (engagementScore >= 20) return 'high';
        if (engagementScore >= 10) return 'medium';
        return 'low';
    }

    /**
     * Генерация рекомендаций по улучшению
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        
        const ctr = parseFloat(metrics.clickThroughRate);
        const feedbackRate = parseFloat(metrics.feedbackRate);
        const positiveRate = parseFloat(metrics.positiveFeedbackRate);
        const conversionRate = parseFloat(metrics.conversionRate);
        
        if (ctr < 5) {
            recommendations.push({
                type: 'ctr',
                priority: 'high',
                message: 'Низкий CTR рекомендаций. Рекомендуется улучшить алгоритм сопоставления и качество рекомендаций.',
                action: 'Оптимизировать алгоритм ранжирования и добавить больше персонализации'
            });
        }
        
        if (feedbackRate < 10) {
            recommendations.push({
                type: 'feedback',
                priority: 'medium',
                message: 'Низкая обратная связь от пользователей. Рекомендуется упростить процесс оставления отзывов.',
                action: 'Добавить более заметные кнопки обратной связи и упростить интерфейс'
            });
        }
        
        if (positiveRate < 60) {
            recommendations.push({
                type: 'quality',
                priority: 'high',
                message: 'Низкий процент положительных отзывов. Рекомендуется улучшить качество рекомендаций.',
                action: 'Пересмотреть алгоритм сопоставления и добавить больше факторов'
            });
        }
        
        if (conversionRate < 2) {
            recommendations.push({
                type: 'conversion',
                priority: 'medium',
                message: 'Низкая конверсия. Рекомендуется улучшить качество вакансий и упростить процесс подачи заявки.',
                action: 'Добавить быструю подачу заявки и улучшить качество вакансий'
            });
        }
        
        return recommendations;
    }

    /**
     * Экспорт данных для отчетов
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            overallMetrics: this.getOverallMetrics(),
            topUsers: this.getTopUsers(20),
            topJobs: this.getTopJobs(20),
            algorithmAnalysis: this.analyzeAlgorithmPerformance(),
            rawMetrics: this.metrics
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Создание визуального отчета
     */
    createVisualReport() {
        const report = document.createElement('div');
        report.className = 'bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto';
        
        const metrics = this.getOverallMetrics();
        const analysis = this.analyzeAlgorithmPerformance();
        
        report.innerHTML = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 Отчет по системе рекомендаций</h2>
                <p class="text-gray-600">Обновлено: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-blue-800">Показы</h3>
                    <p class="text-2xl font-bold text-blue-600">${metrics.impressions.toLocaleString()}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-green-800">CTR</h3>
                    <p class="text-2xl font-bold text-green-600">${metrics.clickThroughRate}%</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-yellow-800">Положительные отзывы</h3>
                    <p class="text-2xl font-bold text-yellow-600">${metrics.positiveFeedbackRate}%</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-purple-800">Конверсия</h3>
                    <p class="text-2xl font-bold text-purple-600">${metrics.conversionRate}%</p>
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">🎯 Рекомендации по улучшению</h3>
                <div class="space-y-3">
                    ${analysis.recommendations.map(rec => `
                        <div class="bg-${rec.priority === 'high' ? 'red' : 'yellow'}-50 border-l-4 border-${rec.priority === 'high' ? 'red' : 'yellow'}-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <span class="text-${rec.priority === 'high' ? 'red' : 'yellow'}-400">⚠️</span>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-${rec.priority === 'high' ? 'red' : 'yellow'}-700">
                                        ${rec.message}
                                    </p>
                                    <p class="text-sm text-${rec.priority === 'high' ? 'red' : 'yellow'}-600 mt-1">
                                        <strong>Действие:</strong> ${rec.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">👥 Топ пользователей</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${this.getTopUsers(5).map((user, index) => `
                            <div class="flex items-center justify-between py-2 ${index > 0 ? 'border-t border-gray-200' : ''}">
                                <div>
                                    <p class="font-medium text-gray-800">Пользователь ${user.userId.slice(-6)}</p>
                                    <p class="text-sm text-gray-600">CTR: ${user.impressions > 0 ? (user.clicks / user.impressions * 100).toFixed(1) : 0}%</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium text-gray-800">${user.engagementScore}</p>
                                    <p class="text-xs text-gray-500">баллов</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">💼 Топ вакансий</h3>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        ${this.getTopJobs(5).map((job, index) => `
                            <div class="flex items-center justify-between py-2 ${index > 0 ? 'border-t border-gray-200' : ''}">
                                <div>
                                    <p class="font-medium text-gray-800">Вакансия ${job.jobId.slice(-6)}</p>
                                    <p class="text-sm text-gray-600">CTR: ${job.impressions > 0 ? (job.clicks / job.impressions * 100).toFixed(1) : 0}%</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium text-gray-800">${job.performanceScore.toFixed(2)}</p>
                                    <p class="text-xs text-gray-500">баллов</p>
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
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим аналитики рекомендаций');
        
        // Генерируем тестовые данные
        const testData = [
            { userId: 'user-1', jobId: 'job-1', matchScore: 0.95, feedback: 'positive' },
            { userId: 'user-1', jobId: 'job-2', matchScore: 0.87, feedback: 'positive' },
            { userId: 'user-2', jobId: 'job-1', matchScore: 0.78, feedback: 'negative' },
            { userId: 'user-2', jobId: 'job-3', matchScore: 0.92, feedback: 'positive' },
            { userId: 'user-3', jobId: 'job-2', matchScore: 0.85, feedback: 'positive' }
        ];
        
        // Симулируем события
        testData.forEach(data => {
            this.trackImpression(data);
            this.trackClick(data);
            this.trackFeedback(data);
        });
        
        // Показываем отчет
        const report = this.createVisualReport();
        document.body.appendChild(report);
        
        return report;
    }
}

// Экспорт для использования в других модулях
window.RecommendationAnalytics = RecommendationAnalytics; 