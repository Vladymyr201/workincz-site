/**
 * Движок оптимизации на основе данных
 * Автоматический анализ и улучшение конверсий
 */

class OptimizationEngine {
    constructor() {
        this.rules = new Map();
        this.insights = [];
        this.optimizations = [];
        this.init();
    }

    async init() {
        // Загружаем правила оптимизации
        await this.loadOptimizationRules();
        
        // Инициализируем анализ данных
        this.startDataAnalysis();
        
        // Запускаем автоматическую оптимизацию
        this.startAutoOptimization();
    }

    async loadOptimizationRules() {
        // Загружаем правила из Firebase
        try {
            const rulesSnapshot = await firebase.firestore().collection('optimization_rules')
                .where('status', '==', 'active')
                .get();

            rulesSnapshot.forEach(doc => {
                const rule = doc.data();
                this.rules.set(doc.id, {
                    id: doc.id,
                    ...rule
                });
            });

            console.log(`Загружено ${this.rules.size} правил оптимизации`);
        } catch (error) {
            console.error('Ошибка загрузки правил оптимизации:', error);
        }

        // Добавляем встроенные правила
        this.addBuiltInRules();
    }

    addBuiltInRules() {
        // Правило для оптимизации кнопок CTA
        this.rules.set('cta_optimization', {
            id: 'cta_optimization',
            name: 'Оптимизация кнопок CTA',
            type: 'button_optimization',
            conditions: {
                clickRate: { operator: '<', value: 0.05 },
                conversionRate: { operator: '<', value: 0.02 }
            },
            actions: [
                {
                    type: 'change_text',
                    selector: '.btn-primary, .btn-gradient',
                    suggestions: ['Начать сейчас', 'Получить доступ', 'Попробовать бесплатно']
                },
                {
                    type: 'change_color',
                    selector: '.btn-primary',
                    suggestions: ['#dc2626', '#059669', '#7c3aed']
                }
            ],
            priority: 'high'
        });

        // Правило для оптимизации форм
        this.rules.set('form_optimization', {
            id: 'form_optimization',
            name: 'Оптимизация форм',
            type: 'form_optimization',
            conditions: {
                formAbandonment: { operator: '>', value: 0.7 },
                formFields: { operator: '>', value: 5 }
            },
            actions: [
                {
                    type: 'reduce_fields',
                    selector: 'form',
                    maxFields: 3
                },
                {
                    type: 'add_progress_indicator',
                    selector: 'form'
                }
            ],
            priority: 'medium'
        });

        // Правило для оптимизации цен
        this.rules.set('pricing_optimization', {
            id: 'pricing_optimization',
            name: 'Оптимизация цен',
            type: 'pricing_optimization',
            conditions: {
                conversionRate: { operator: '<', value: 0.01 },
                bounceRate: { operator: '>', value: 0.8 }
            },
            actions: [
                {
                    type: 'adjust_pricing',
                    selector: '.pricing-card',
                    strategy: 'psychological_pricing'
                },
                {
                    type: 'add_discount',
                    selector: '.pricing-card',
                    discount: 0.1
                }
            ],
            priority: 'high'
        });
    }

    startDataAnalysis() {
        // Анализируем данные каждые 6 часов
        setInterval(() => {
            this.analyzeData();
        }, 6 * 60 * 60 * 1000);

        // Первый анализ при запуске
        this.analyzeData();
    }

    async analyzeData() {
        try {
            console.log('Начинаем анализ данных для оптимизации...');

            // Получаем данные за последние 7 дней
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Анализируем конверсии
            const conversionData = await this.getConversionData(sevenDaysAgo);
            
            // Анализируем поведение пользователей
            const behaviorData = await this.getBehaviorData(sevenDaysAgo);
            
            // Анализируем технические метрики
            const technicalData = await this.getTechnicalData(sevenDaysAgo);

            // Генерируем инсайты
            const insights = this.generateInsights(conversionData, behaviorData, technicalData);
            
            // Применяем правила оптимизации
            await this.applyOptimizationRules(insights);

            console.log(`Анализ завершен. Найдено ${insights.length} инсайтов`);

        } catch (error) {
            console.error('Ошибка анализа данных:', error);
        }
    }

    async getConversionData(startDate) {
        try {
            const conversionsSnapshot = await firebase.firestore().collection('analytics_events')
                .where('event', '==', 'conversion')
                .where('properties.timestamp', '>=', startDate.toISOString())
                .get();

            const conversions = conversionsSnapshot.docs.map(doc => doc.data());
            
            return {
                total: conversions.length,
                byType: this.groupBy(conversions, 'properties.conversion_name'),
                byPage: this.groupBy(conversions, 'properties.url'),
                bySource: this.groupBy(conversions, 'properties.referrer')
            };
        } catch (error) {
            console.error('Ошибка получения данных конверсий:', error);
            return {};
        }
    }

    async getBehaviorData(startDate) {
        try {
            const eventsSnapshot = await firebase.firestore().collection('analytics_events')
                .where('properties.timestamp', '>=', startDate.toISOString())
                .get();

            const events = eventsSnapshot.docs.map(doc => doc.data());
            
            return {
                totalEvents: events.length,
                byEvent: this.groupBy(events, 'event'),
                byPage: this.groupBy(events, 'properties.url'),
                sessionData: this.analyzeSessions(events),
                scrollData: this.analyzeScrollBehavior(events)
            };
        } catch (error) {
            console.error('Ошибка получения данных поведения:', error);
            return {};
        }
    }

    async getTechnicalData(startDate) {
        try {
            const errorsSnapshot = await firebase.firestore().collection('analytics_events')
                .where('event', '==', 'error')
                .where('properties.timestamp', '>=', startDate.toISOString())
                .get();

            const errors = errorsSnapshot.docs.map(doc => doc.data());
            
            return {
                totalErrors: errors.length,
                byType: this.groupBy(errors, 'properties.message'),
                byPage: this.groupBy(errors, 'properties.url'),
                performanceData: await this.getPerformanceData(startDate)
            };
        } catch (error) {
            console.error('Ошибка получения технических данных:', error);
            return {};
        }
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const value = this.getNestedValue(item, key);
            if (!groups[value]) {
                groups[value] = [];
            }
            groups[value].push(item);
            return groups;
        }, {});
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : 'unknown';
        }, obj);
    }

    analyzeSessions(events) {
        const sessions = {};
        
        events.forEach(event => {
            const sessionId = event.properties.sessionId;
            if (!sessions[sessionId]) {
                sessions[sessionId] = {
                    start: new Date(event.properties.timestamp),
                    events: [],
                    pages: new Set()
                };
            }
            sessions[sessionId].events.push(event);
            sessions[sessionId].pages.add(event.properties.url);
        });

        const sessionStats = Object.values(sessions).map(session => ({
            duration: (new Date(session.events[session.events.length - 1].properties.timestamp) - session.start) / 1000,
            eventCount: session.events.length,
            pageCount: session.pages.size
        }));

        return {
            total: sessionStats.length,
            avgDuration: sessionStats.reduce((sum, s) => sum + s.duration, 0) / sessionStats.length,
            avgEvents: sessionStats.reduce((sum, s) => sum + s.eventCount, 0) / sessionStats.length,
            avgPages: sessionStats.reduce((sum, s) => sum + s.pageCount, 0) / sessionStats.length
        };
    }

    analyzeScrollBehavior(events) {
        const scrollEvents = events.filter(e => e.event === 'scroll');
        const scrollDepths = scrollEvents.map(e => e.properties.scrollPercent || 0);
        
        return {
            totalScrolls: scrollDepths.length,
            avgScrollDepth: scrollDepths.reduce((sum, depth) => sum + depth, 0) / scrollDepths.length,
            maxScrollDepth: Math.max(...scrollDepths, 0)
        };
    }

    async getPerformanceData(startDate) {
        // Здесь можно добавить анализ производительности
        // Например, время загрузки страниц, Core Web Vitals и т.д.
        return {
            avgLoadTime: 2000, // мс
            avgFirstPaint: 800,
            avgLargestContentfulPaint: 1500
        };
    }

    generateInsights(conversionData, behaviorData, technicalData) {
        const insights = [];

        // Анализ конверсий
        if (conversionData.total < 10) {
            insights.push({
                type: 'low_conversions',
                severity: 'high',
                message: 'Низкое количество конверсий. Рекомендуется оптимизировать воронку.',
                data: conversionData
            });
        }

        // Анализ поведения
        if (behaviorData.sessionData && behaviorData.sessionData.avgDuration < 60) {
            insights.push({
                type: 'low_engagement',
                severity: 'medium',
                message: 'Низкое время на сайте. Рекомендуется улучшить контент.',
                data: behaviorData.sessionData
            });
        }

        // Анализ технических проблем
        if (technicalData.totalErrors > 50) {
            insights.push({
                type: 'high_error_rate',
                severity: 'high',
                message: 'Высокий уровень ошибок. Требуется техническая оптимизация.',
                data: technicalData
            });
        }

        // Анализ производительности
        if (technicalData.performanceData && technicalData.performanceData.avgLoadTime > 3000) {
            insights.push({
                type: 'slow_performance',
                severity: 'medium',
                message: 'Медленная загрузка страниц. Рекомендуется оптимизация.',
                data: technicalData.performanceData
            });
        }

        return insights;
    }

    async applyOptimizationRules(insights) {
        for (const [ruleId, rule] of this.rules) {
            const shouldApply = this.evaluateRule(rule, insights);
            
            if (shouldApply) {
                await this.applyRule(rule);
            }
        }
    }

    evaluateRule(rule, insights) {
        // Проверяем условия правила
        for (const [condition, criteria] of Object.entries(rule.conditions)) {
            const insight = insights.find(i => i.type === condition);
            if (!insight) continue;

            const value = this.extractValue(insight, condition);
            const operator = criteria.operator;
            const threshold = criteria.value;

            if (!this.compareValues(value, operator, threshold)) {
                return false;
            }
        }

        return true;
    }

    extractValue(insight, condition) {
        switch (condition) {
            case 'clickRate':
                return insight.data.clickRate || 0;
            case 'conversionRate':
                return insight.data.conversionRate || 0;
            case 'formAbandonment':
                return insight.data.formAbandonment || 0;
            case 'bounceRate':
                return insight.data.bounceRate || 0;
            default:
                return 0;
        }
    }

    compareValues(value, operator, threshold) {
        switch (operator) {
            case '<':
                return value < threshold;
            case '>':
                return value > threshold;
            case '<=':
                return value <= threshold;
            case '>=':
                return value >= threshold;
            case '==':
                return value === threshold;
            default:
                return false;
        }
    }

    async applyRule(rule) {
        try {
            console.log(`Применяем правило: ${rule.name}`);

            for (const action of rule.actions) {
                await this.executeAction(action);
            }

            // Записываем оптимизацию
            await this.recordOptimization(rule);

        } catch (error) {
            console.error(`Ошибка применения правила ${rule.name}:`, error);
        }
    }

    async executeAction(action) {
        switch (action.type) {
            case 'change_text':
                await this.changeButtonText(action);
                break;
            case 'change_color':
                await this.changeButtonColor(action);
                break;
            case 'reduce_fields':
                await this.reduceFormFields(action);
                break;
            case 'add_progress_indicator':
                await this.addProgressIndicator(action);
                break;
            case 'adjust_pricing':
                await this.adjustPricing(action);
                break;
            case 'add_discount':
                await this.addDiscount(action);
                break;
            default:
                console.warn(`Неизвестный тип действия: ${action.type}`);
        }
    }

    async changeButtonText(action) {
        const elements = document.querySelectorAll(action.selector);
        const suggestion = action.suggestions[Math.floor(Math.random() * action.suggestions.length)];
        
        elements.forEach(element => {
            element.textContent = suggestion;
            element.setAttribute('data-optimized', 'true');
        });

        console.log(`Изменен текст кнопок на: ${suggestion}`);
    }

    async changeButtonColor(action) {
        const elements = document.querySelectorAll(action.selector);
        const color = action.suggestions[Math.floor(Math.random() * action.suggestions.length)];
        
        elements.forEach(element => {
            element.style.backgroundColor = color;
            element.setAttribute('data-optimized', 'true');
        });

        console.log(`Изменен цвет кнопок на: ${color}`);
    }

    async reduceFormFields(action) {
        const forms = document.querySelectorAll(action.selector);
        
        forms.forEach(form => {
            const fields = form.querySelectorAll('input, select, textarea');
            const maxFields = action.maxFields;
            
            if (fields.length > maxFields) {
                // Скрываем лишние поля
                for (let i = maxFields; i < fields.length; i++) {
                    fields[i].style.display = 'none';
                }
            }
        });

        console.log(`Сокращено количество полей в формах до ${action.maxFields}`);
    }

    async addProgressIndicator(action) {
        const forms = document.querySelectorAll(action.selector);
        
        forms.forEach(form => {
            if (!form.querySelector('.progress-indicator')) {
                const progress = document.createElement('div');
                progress.className = 'progress-indicator';
                progress.innerHTML = `
                    <div class="progress">
                        <div class="progress-bar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted">Шаг 1 из 3</small>
                `;
                form.insertBefore(progress, form.firstChild);
            }
        });

        console.log('Добавлены индикаторы прогресса в формы');
    }

    async adjustPricing(action) {
        const pricingCards = document.querySelectorAll(action.selector);
        
        pricingCards.forEach(card => {
            const priceElements = card.querySelectorAll('.price, .display-4');
            
            priceElements.forEach(element => {
                const currentPrice = parseFloat(element.textContent.replace(/[^\d.]/g, ''));
                if (!isNaN(currentPrice)) {
                    // Психологическое ценообразование: 999 вместо 1000
                    const newPrice = Math.floor(currentPrice * 0.99);
                    element.textContent = element.textContent.replace(currentPrice.toString(), newPrice.toString());
                }
            });
        });

        console.log('Применено психологическое ценообразование');
    }

    async addDiscount(action) {
        const pricingCards = document.querySelectorAll(action.selector);
        const discount = action.discount;
        
        pricingCards.forEach(card => {
            const priceElements = card.querySelectorAll('.price, .display-4');
            
            priceElements.forEach(element => {
                const currentPrice = parseFloat(element.textContent.replace(/[^\d.]/g, ''));
                if (!isNaN(currentPrice)) {
                    const discountedPrice = Math.floor(currentPrice * (1 - discount));
                    element.textContent = element.textContent.replace(currentPrice.toString(), discountedPrice.toString());
                    
                    // Добавляем бейдж скидки
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-danger ms-2';
                    badge.textContent = `-${Math.round(discount * 100)}%`;
                    element.appendChild(badge);
                }
            });
        });

        console.log(`Добавлена скидка ${Math.round(discount * 100)}%`);
    }

    async recordOptimization(rule) {
        try {
            await firebase.firestore().collection('optimizations').add({
                ruleId: rule.id,
                ruleName: rule.name,
                appliedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'applied',
                priority: rule.priority
            });
        } catch (error) {
            console.error('Ошибка записи оптимизации:', error);
        }
    }

    startAutoOptimization() {
        // Автоматическая оптимизация каждые 12 часов
        setInterval(() => {
            this.autoOptimize();
        }, 12 * 60 * 60 * 1000);
    }

    async autoOptimize() {
        try {
            console.log('Запуск автоматической оптимизации...');

            // Получаем текущие метрики
            const metrics = await this.getCurrentMetrics();
            
            // Проверяем правила автоматической оптимизации
            await this.checkAutoOptimizationRules(metrics);

        } catch (error) {
            console.error('Ошибка автоматической оптимизации:', error);
        }
    }

    async getCurrentMetrics() {
        // Получаем текущие метрики из аналитики
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const conversionData = await this.getConversionData(dayAgo);
        const behaviorData = await this.getBehaviorData(dayAgo);
        const technicalData = await this.getTechnicalData(dayAgo);

        return {
            conversionRate: this.calculateConversionRate(conversionData),
            bounceRate: this.calculateBounceRate(behaviorData),
            avgSessionDuration: behaviorData.sessionData?.avgDuration || 0,
            errorRate: technicalData.totalErrors || 0
        };
    }

    calculateConversionRate(conversionData) {
        // Упрощенный расчет конверсии
        return conversionData.total > 0 ? conversionData.total / 1000 : 0; // Предполагаем 1000 посетителей
    }

    calculateBounceRate(behaviorData) {
        // Упрощенный расчет отказов
        return behaviorData.sessionData?.avgPages === 1 ? 0.8 : 0.2;
    }

    async checkAutoOptimizationRules(metrics) {
        // Правила для автоматической оптимизации
        const autoRules = [
            {
                condition: metrics.conversionRate < 0.01,
                action: 'increase_cta_visibility',
                message: 'Низкая конверсия - увеличиваем видимость CTA'
            },
            {
                condition: metrics.bounceRate > 0.8,
                action: 'improve_landing_page',
                message: 'Высокий отказ - улучшаем landing page'
            },
            {
                condition: metrics.avgSessionDuration < 60,
                action: 'add_engaging_content',
                message: 'Низкое время на сайте - добавляем контент'
            }
        ];

        for (const rule of autoRules) {
            if (rule.condition) {
                await this.executeAutoAction(rule.action, rule.message);
            }
        }
    }

    async executeAutoAction(action, message) {
        console.log(`Автоматическая оптимизация: ${message}`);

        switch (action) {
            case 'increase_cta_visibility':
                await this.increaseCTAVisibility();
                break;
            case 'improve_landing_page':
                await this.improveLandingPage();
                break;
            case 'add_engaging_content':
                await this.addEngagingContent();
                break;
        }
    }

    async increaseCTAVisibility() {
        const ctaButtons = document.querySelectorAll('.btn-primary, .btn-gradient');
        ctaButtons.forEach(button => {
            button.style.fontSize = '1.2em';
            button.style.padding = '15px 30px';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
    }

    async improveLandingPage() {
        // Добавляем социальные доказательства
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const socialProof = document.createElement('div');
            socialProof.className = 'social-proof mt-3';
            socialProof.innerHTML = `
                <div class="d-flex align-items-center justify-content-center">
                    <span class="text-light me-3">Доверяют более 10,000 пользователей</span>
                    <div class="stars">
                        <i class="fas fa-star text-warning"></i>
                        <i class="fas fa-star text-warning"></i>
                        <i class="fas fa-star text-warning"></i>
                        <i class="fas fa-star text-warning"></i>
                        <i class="fas fa-star text-warning"></i>
                    </div>
                </div>
            `;
            heroSection.appendChild(socialProof);
        }
    }

    async addEngagingContent() {
        // Добавляем интерактивные элементы
        const contentSections = document.querySelectorAll('.card, .feature-card');
        contentSections.forEach(section => {
            if (!section.querySelector('.interactive-element')) {
                const interactive = document.createElement('div');
                interactive.className = 'interactive-element mt-2';
                interactive.innerHTML = `
                    <button class="btn btn-sm btn-outline-primary" onclick="this.parentElement.innerHTML='<span class=\\"text-success\\"><i class=\\"fas fa-check\\"></i> Интересно!</span>'">
                        <i class="fas fa-thumbs-up"></i> Интересно
                    </button>
                `;
                section.appendChild(interactive);
            }
        });
    }

    // Методы для получения отчетов
    async getOptimizationReport(startDate, endDate) {
        try {
            const optimizationsSnapshot = await firebase.firestore().collection('optimizations')
                .where('appliedAt', '>=', startDate)
                .where('appliedAt', '<=', endDate)
                .get();

            const optimizations = optimizationsSnapshot.docs.map(doc => doc.data());

            return {
                period: { start: startDate, end: endDate },
                totalOptimizations: optimizations.length,
                byPriority: this.groupBy(optimizations, 'priority'),
                byRule: this.groupBy(optimizations, 'ruleName'),
                insights: this.insights,
                recommendations: this.generateRecommendations(optimizations)
            };
        } catch (error) {
            console.error('Ошибка получения отчета оптимизации:', error);
            return null;
        }
    }

    generateRecommendations(optimizations) {
        const recommendations = [];

        // Анализируем частоту применения правил
        const ruleFrequency = {};
        optimizations.forEach(opt => {
            ruleFrequency[opt.ruleName] = (ruleFrequency[opt.ruleName] || 0) + 1;
        });

        // Генерируем рекомендации на основе частоты
        Object.entries(ruleFrequency).forEach(([ruleName, frequency]) => {
            if (frequency > 5) {
                recommendations.push({
                    type: 'frequent_optimization',
                    message: `Правило "${ruleName}" применяется часто. Рассмотрите постоянные изменения.`,
                    priority: 'high'
                });
            }
        });

        return recommendations;
    }
}

// Инициализация движка оптимизации
let optimizationEngine;

document.addEventListener('DOMContentLoaded', () => {
    optimizationEngine = new OptimizationEngine();
});

// Экспорт для использования в других модулях
window.optimizationEngine = optimizationEngine; 