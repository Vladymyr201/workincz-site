/**
 * Система аналитики конверсий для отслеживания эффективности маркетинговых кампаний
 * Отслеживает воронку конверсии, источники трафика, поведение пользователей
 */

class ConversionAnalytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.init();
    }

    async init() {
        // Инициализируем отслеживание
        this.setupEventTracking();
        this.setupConversionTracking();
        this.setupFunnelTracking();
        
        // Загружаем существующие данные пользователя
        await this.loadUserData();
        
        // Инициализируем UI
        this.initAnalyticsUI();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventTracking() {
        // Отслеживаем клики по кнопкам
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, [data-track]');
            if (target) {
                this.trackEvent('click', {
                    element: target.tagName.toLowerCase(),
                    text: target.textContent?.trim(),
                    href: target.href,
                    dataTrack: target.dataset.track,
                    position: this.getElementPosition(target)
                });
            }
        });

        // Отслеживаем отправку форм
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                formId: e.target.id,
                formAction: e.target.action,
                formMethod: e.target.method
            });
        });

        // Отслеживаем скролл
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackEvent('scroll', {
                    scrollY: window.scrollY,
                    scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
                });
            }, 100);
        });

        // Отслеживаем время на странице
        setInterval(() => {
            this.trackEvent('time_on_page', {
                seconds: Math.floor((Date.now() - this.pageLoadTime) / 1000)
            });
        }, 30000); // каждые 30 секунд
    }

    setupConversionTracking() {
        // Отслеживаем регистрации
        this.trackConversion('registration', () => {
            return document.querySelector('[data-conversion="registration"]') !== null;
        });

        // Отслеживаем создание вакансий
        this.trackConversion('job_created', () => {
            return document.querySelector('[data-conversion="job_created"]') !== null;
        });

        // Отслеживаем подачу заявок
        this.trackConversion('application_submitted', () => {
            return document.querySelector('[data-conversion="application_submitted"]') !== null;
        });

        // Отслеживаем покупки
        this.trackConversion('purchase', () => {
            return document.querySelector('[data-conversion="purchase"]') !== null;
        });
    }

    setupFunnelTracking() {
        // Определяем этапы воронки
        this.funnelSteps = [
            { name: 'visit', selector: 'body' },
            { name: 'view_jobs', selector: '.jobs-list, #jobsSection' },
            { name: 'click_job', selector: '[data-job-id]' },
            { name: 'view_job_details', selector: '.job-details' },
            { name: 'start_application', selector: '.apply-button, [data-action="apply"]' },
            { name: 'complete_application', selector: '[data-conversion="application_submitted"]' }
        ];

        // Отслеживаем прохождение воронки
        this.funnelSteps.forEach((step, index) => {
            this.trackFunnelStep(step.name, step.selector, index);
        });
    }

    async loadUserData() {
        // Получаем данные пользователя из localStorage или Firebase
        const userData = localStorage.getItem('analytics_user');
        if (userData) {
            const parsed = JSON.parse(userData);
            this.userId = parsed.userId;
            this.userProperties = parsed.properties;
        }

        // Если пользователь авторизован в Firebase
        if (firebase.auth().currentUser) {
            this.userId = firebase.auth().currentUser.uid;
            this.userProperties = {
                email: firebase.auth().currentUser.email,
                role: localStorage.getItem('user_role') || 'unknown'
            };
        }
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`
            }
        };

        this.events.push(event);
        
        // Отправляем событие в Firebase
        this.sendEventToFirebase(event);
        
        // Сохраняем в localStorage для офлайн режима
        this.saveEventToStorage(event);
    }

    async sendEventToFirebase(event) {
        try {
            await firebase.firestore().collection('analytics_events').add({
                ...event,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Ошибка отправки события в Firebase:', error);
        }
    }

    saveEventToStorage(event) {
        const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
        storedEvents.push(event);
        
        // Ограничиваем количество событий в localStorage
        if (storedEvents.length > 1000) {
            storedEvents.splice(0, 500);
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(storedEvents));
    }

    trackConversion(conversionName, condition) {
        const checkConversion = () => {
            if (condition() && !this.conversions.includes(conversionName)) {
                this.conversions.push(conversionName);
                this.trackEvent('conversion', {
                    conversion_name: conversionName,
                    value: this.getConversionValue(conversionName)
                });
            }
        };

        // Проверяем сразу
        checkConversion();
        
        // Проверяем при изменениях DOM
        const observer = new MutationObserver(checkConversion);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    trackFunnelStep(stepName, selector, stepIndex) {
        const checkStep = () => {
            const element = document.querySelector(selector);
            if (element && !this.funnelStepsCompleted.includes(stepName)) {
                this.funnelStepsCompleted.push(stepName);
                this.trackEvent('funnel_step', {
                    step_name: stepName,
                    step_index: stepIndex,
                    funnel_name: 'main_conversion'
                });
            }
        };

        // Проверяем сразу
        checkStep();
        
        // Проверяем при изменениях DOM
        const observer = new MutationObserver(checkStep);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    getConversionValue(conversionName) {
        const values = {
            registration: 100,
            job_created: 500,
            application_submitted: 200,
            purchase: 1000
        };
        return values[conversionName] || 0;
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    initAnalyticsUI() {
        // Создаем панель аналитики для администраторов
        if (this.isAdmin()) {
            this.createAnalyticsDashboard();
        }
    }

    isAdmin() {
        return localStorage.getItem('user_role') === 'admin' || 
               (firebase.auth().currentUser && firebase.auth().currentUser.email?.includes('admin'));
    }

    createAnalyticsDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'analyticsDashboard';
        dashboard.className = 'card mt-4';
        dashboard.innerHTML = `
            <div class="card-header">
                <h5><i class="fas fa-chart-line"></i> Аналитика конверсий</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <div class="text-center">
                            <h3 class="text-primary" id="totalVisitors">0</h3>
                            <p class="text-muted">Посетителей сегодня</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h3 class="text-success" id="conversionRate">0%</h3>
                            <p class="text-muted">Конверсия</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h3 class="text-warning" id="avgSessionTime">0м</h3>
                            <p class="text-muted">Время сессии</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="text-center">
                            <h3 class="text-info" id="bounceRate">0%</h3>
                            <p class="text-muted">Отказы</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h6>Воронка конверсии</h6>
                    <div id="funnelChart" style="height: 300px;"></div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h6>Топ источники трафика</h6>
                        <div id="trafficSources"></div>
                    </div>
                    <div class="col-md-6">
                        <h6>Топ страницы</h6>
                        <div id="topPages"></div>
                    </div>
                </div>
            </div>
        `;

        // Добавляем в dashboard
        const dashboardContainer = document.querySelector('#dashboardContent') || 
                                  document.querySelector('.dashboard-content');
        if (dashboardContainer) {
            dashboardContainer.appendChild(dashboard);
        }

        // Загружаем данные
        this.loadAnalyticsData();
    }

    async loadAnalyticsData() {
        try {
            // Получаем данные за последние 7 дней
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const eventsSnapshot = await firebase.firestore().collection('analytics_events')
                .where('properties.timestamp', '>=', sevenDaysAgo.toISOString())
                .get();

            const events = eventsSnapshot.docs.map(doc => doc.data());
            
            // Анализируем данные
            this.analyzeEvents(events);
            
        } catch (error) {
            console.error('Ошибка загрузки аналитики:', error);
        }
    }

    analyzeEvents(events) {
        // Подсчитываем метрики
        const visitors = new Set(events.filter(e => e.event === 'page_view').map(e => e.properties.sessionId)).size;
        const conversions = events.filter(e => e.event === 'conversion').length;
        const conversionRate = visitors > 0 ? ((conversions / visitors) * 100).toFixed(1) : 0;
        
        // Время сессии
        const sessionTimes = this.calculateSessionTimes(events);
        const avgSessionTime = sessionTimes.length > 0 ? 
            Math.round(sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length / 60) : 0;
        
        // Отказы
        const bounceRate = this.calculateBounceRate(events);
        
        // Обновляем UI
        document.getElementById('totalVisitors').textContent = visitors;
        document.getElementById('conversionRate').textContent = conversionRate + '%';
        document.getElementById('avgSessionTime').textContent = avgSessionTime + 'м';
        document.getElementById('bounceRate').textContent = bounceRate + '%';
        
        // Строим воронку
        this.buildFunnelChart(events);
        
        // Анализируем источники трафика
        this.analyzeTrafficSources(events);
        
        // Анализируем топ страницы
        this.analyzeTopPages(events);
    }

    calculateSessionTimes(events) {
        const sessions = {};
        const sessionTimes = [];
        
        events.forEach(event => {
            const sessionId = event.properties.sessionId;
            if (!sessions[sessionId]) {
                sessions[sessionId] = {
                    start: new Date(event.properties.timestamp),
                    end: new Date(event.properties.timestamp)
                };
            } else {
                sessions[sessionId].end = new Date(event.properties.timestamp);
            }
        });
        
        Object.values(sessions).forEach(session => {
            const duration = (session.end - session.start) / 1000; // в секундах
            if (duration > 0 && duration < 3600) { // исключаем слишком короткие и длинные сессии
                sessionTimes.push(duration);
            }
        });
        
        return sessionTimes;
    }

    calculateBounceRate(events) {
        const sessions = {};
        
        events.forEach(event => {
            const sessionId = event.properties.sessionId;
            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
            }
            sessions[sessionId].push(event);
        });
        
        const bouncedSessions = Object.values(sessions).filter(sessionEvents => 
            sessionEvents.length === 1 && sessionEvents[0].event === 'page_view'
        ).length;
        
        const totalSessions = Object.keys(sessions).length;
        
        return totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100) : 0;
    }

    buildFunnelChart(events) {
        const funnelSteps = ['visit', 'view_jobs', 'click_job', 'view_job_details', 'start_application', 'complete_application'];
        const funnelData = [];
        
        funnelSteps.forEach(step => {
            const stepEvents = events.filter(e => e.event === 'funnel_step' && e.properties.step_name === step);
            funnelData.push({
                step: step,
                count: stepEvents.length
            });
        });
        
        // Создаем простую визуализацию воронки
        const funnelContainer = document.getElementById('funnelChart');
        funnelContainer.innerHTML = funnelData.map((data, index) => `
            <div class="d-flex align-items-center mb-2">
                <div class="me-3" style="width: 100px;">${data.step}</div>
                <div class="flex-grow-1">
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" style="width: ${(data.count / funnelData[0].count) * 100}%">
                            ${data.count}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    analyzeTrafficSources(events) {
        const sources = {};
        
        events.filter(e => e.event === 'page_view').forEach(event => {
            const referrer = event.properties.referrer;
            const source = this.getSourceFromReferrer(referrer);
            sources[source] = (sources[source] || 0) + 1;
        });
        
        const sortedSources = Object.entries(sources)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const container = document.getElementById('trafficSources');
        container.innerHTML = sortedSources.map(([source, count]) => `
            <div class="d-flex justify-content-between mb-2">
                <span>${source}</span>
                <span class="badge bg-primary">${count}</span>
            </div>
        `).join('');
    }

    getSourceFromReferrer(referrer) {
        if (!referrer) return 'Прямой переход';
        if (referrer.includes('google')) return 'Google';
        if (referrer.includes('facebook')) return 'Facebook';
        if (referrer.includes('linkedin')) return 'LinkedIn';
        if (referrer.includes('yandex')) return 'Yandex';
        return 'Другие';
    }

    analyzeTopPages(events) {
        const pages = {};
        
        events.filter(e => e.event === 'page_view').forEach(event => {
            const url = new URL(event.properties.url);
            const page = url.pathname;
            pages[page] = (pages[page] || 0) + 1;
        });
        
        const sortedPages = Object.entries(pages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const container = document.getElementById('topPages');
        container.innerHTML = sortedPages.map(([page, count]) => `
            <div class="d-flex justify-content-between mb-2">
                <span>${page}</span>
                <span class="badge bg-success">${count}</span>
            </div>
        `).join('');
    }

    // Методы для экспорта данных
    async exportAnalyticsData(startDate, endDate) {
        try {
            const eventsSnapshot = await firebase.firestore().collection('analytics_events')
                .where('properties.timestamp', '>=', startDate.toISOString())
                .where('properties.timestamp', '<=', endDate.toISOString())
                .get();

            const events = eventsSnapshot.docs.map(doc => doc.data());
            
            // Формируем отчет
            const report = {
                period: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                },
                metrics: this.calculateMetrics(events),
                funnel: this.calculateFunnel(events),
                traffic: this.calculateTraffic(events),
                events: events
            };
            
            return report;
        } catch (error) {
            console.error('Ошибка экспорта данных:', error);
            throw error;
        }
    }

    calculateMetrics(events) {
        const visitors = new Set(events.filter(e => e.event === 'page_view').map(e => e.properties.sessionId)).size;
        const conversions = events.filter(e => e.event === 'conversion').length;
        const conversionValue = events.filter(e => e.event === 'conversion')
            .reduce((sum, e) => sum + (e.properties.value || 0), 0);
        
        return {
            visitors,
            conversions,
            conversionRate: visitors > 0 ? (conversions / visitors) * 100 : 0,
            conversionValue,
            avgOrderValue: conversions > 0 ? conversionValue / conversions : 0
        };
    }

    calculateFunnel(events) {
        const funnelSteps = ['visit', 'view_jobs', 'click_job', 'view_job_details', 'start_application', 'complete_application'];
        const funnel = {};
        
        funnelSteps.forEach(step => {
            const stepEvents = events.filter(e => e.event === 'funnel_step' && e.properties.step_name === step);
            funnel[step] = stepEvents.length;
        });
        
        return funnel;
    }

    calculateTraffic(events) {
        const sources = {};
        
        events.filter(e => e.event === 'page_view').forEach(event => {
            const source = this.getSourceFromReferrer(event.properties.referrer);
            sources[source] = (sources[source] || 0) + 1;
        });
        
        return sources;
    }
}

// Инициализация системы аналитики
let conversionAnalytics;

document.addEventListener('DOMContentLoaded', () => {
    conversionAnalytics = new ConversionAnalytics();
});

// Экспорт для использования в других модулях
window.conversionAnalytics = conversionAnalytics; 