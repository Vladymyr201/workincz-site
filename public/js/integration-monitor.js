/**
 * Система мониторинга интеграций
 * Отслеживание состояния внешних сервисов, API и интеграций
 */

class IntegrationMonitor {
    constructor() {
        this.integrations = this.initializeIntegrations();
        this.monitoringData = {};
        this.healthChecks = {};
        this.init();
    }

    init() {
        console.log('🔌 Инициализация системы мониторинга интеграций');
        this.setupMonitoring();
        this.startPeriodicChecks();
    }

    // Инициализация интеграций
    initializeIntegrations() {
        return {
            // Платежные системы
            stripe: {
                name: 'Stripe',
                type: 'payment',
                endpoints: ['https://api.stripe.com/v1/charges', 'https://api.stripe.com/v1/webhook_endpoints'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            adyen: {
                name: 'Adyen',
                type: 'payment',
                endpoints: ['https://checkout-test.adyen.com/v70/payments', 'https://checkout-test.adyen.com/v70/webhooks'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },

            // Аналитические сервисы
            googleAnalytics: {
                name: 'Google Analytics 4',
                type: 'analytics',
                endpoints: ['https://www.google-analytics.com/g/collect', 'https://analytics.google.com/analytics/web/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            facebookPixel: {
                name: 'Facebook Pixel',
                type: 'analytics',
                endpoints: ['https://www.facebook.com/tr', 'https://graph.facebook.com/v18.0/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            yandexMetrica: {
                name: 'Yandex.Metrica',
                type: 'analytics',
                endpoints: ['https://mc.yandex.ru/watch/', 'https://api-metrika.yandex.net/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },

            // Email-сервисы
            sendgrid: {
                name: 'SendGrid',
                type: 'email',
                endpoints: ['https://api.sendgrid.com/v3/mail/send', 'https://api.sendgrid.com/v3/status'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            mailgun: {
                name: 'Mailgun',
                type: 'email',
                endpoints: ['https://api.mailgun.net/v3/messages', 'https://api.mailgun.net/v3/domains'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },

            // База данных и хранилище
            firebase: {
                name: 'Firebase',
                type: 'database',
                endpoints: ['https://firestore.googleapis.com/v1/projects/', 'https://firebase.google.com/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            cloudStorage: {
                name: 'Cloud Storage',
                type: 'storage',
                endpoints: ['https://storage.googleapis.com/', 'https://console.cloud.google.com/storage'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },

            // Мониторинг и логирование
            sentry: {
                name: 'Sentry',
                type: 'monitoring',
                endpoints: ['https://o450000000000000.ingest.sentry.io/', 'https://sentry.io/api/0/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            },
            loggly: {
                name: 'Loggly',
                type: 'logging',
                endpoints: ['https://logs-01.loggly.com/inputs/', 'https://www.loggly.com/api/'],
                status: 'unknown',
                lastCheck: null,
                responseTime: null,
                errorCount: 0
            }
        };
    }

    // Настройка мониторинга
    setupMonitoring() {
        // Мониторинг сетевых запросов
        this.monitorNetworkRequests();
        
        // Мониторинг ошибок API
        this.monitorAPIErrors();
        
        // Мониторинг производительности
        this.monitorPerformance();
    }

    // Мониторинг сетевых запросов
    monitorNetworkRequests() {
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        this.analyzeNetworkRequest(entry);
                    }
                }
            });
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    // Анализ сетевого запроса
    analyzeNetworkRequest(entry) {
        const url = entry.name;
        const responseTime = entry.responseEnd - entry.startTime;
        const status = entry.transferSize > 0 ? 'success' : 'error';

        // Определение интеграции по URL
        const integration = this.identifyIntegrationByURL(url);
        if (integration) {
            this.updateIntegrationStatus(integration, status, responseTime);
        }

        // Сохранение данных о запросе
        this.monitoringData.networkRequests = this.monitoringData.networkRequests || [];
        this.monitoringData.networkRequests.push({
            url,
            responseTime,
            status,
            timestamp: Date.now(),
            integration
        });
    }

    // Определение интеграции по URL
    identifyIntegrationByURL(url) {
        const urlLower = url.toLowerCase();
        
        if (urlLower.includes('stripe.com')) return 'stripe';
        if (urlLower.includes('adyen.com')) return 'adyen';
        if (urlLower.includes('google-analytics.com') || urlLower.includes('analytics.google.com')) return 'googleAnalytics';
        if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebookPixel';
        if (urlLower.includes('yandex.ru') || urlLower.includes('mc.yandex.ru')) return 'yandexMetrica';
        if (urlLower.includes('sendgrid.com')) return 'sendgrid';
        if (urlLower.includes('mailgun.net')) return 'mailgun';
        if (urlLower.includes('firebase') || urlLower.includes('firestore')) return 'firebase';
        if (urlLower.includes('storage.googleapis.com')) return 'cloudStorage';
        if (urlLower.includes('sentry.io')) return 'sentry';
        if (urlLower.includes('loggly.com')) return 'loggly';
        
        return null;
    }

    // Обновление статуса интеграции
    updateIntegrationStatus(integrationKey, status, responseTime) {
        const integration = this.integrations[integrationKey];
        if (!integration) return;

        integration.status = status;
        integration.lastCheck = Date.now();
        integration.responseTime = responseTime;

        if (status === 'error') {
            integration.errorCount++;
        } else {
            integration.errorCount = Math.max(0, integration.errorCount - 1);
        }

        // Проверка критических ошибок
        if (integration.errorCount >= 5) {
            this.triggerAlert(integrationKey, 'critical', `Критическое количество ошибок: ${integration.errorCount}`);
        }
    }

    // Мониторинг ошибок API
    monitorAPIErrors() {
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason;
            this.handleAPIError(error);
        });

        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('api')) {
                this.handleAPIError(event);
            }
        });
    }

    // Обработка ошибки API
    handleAPIError(error) {
        const errorData = {
            message: error.message || error.toString(),
            stack: error.stack,
            timestamp: Date.now(),
            url: window.location.href
        };

        this.monitoringData.apiErrors = this.monitoringData.apiErrors || [];
        this.monitoringData.apiErrors.push(errorData);

        // Определение интеграции по ошибке
        const integration = this.identifyIntegrationByError(error);
        if (integration) {
            this.updateIntegrationStatus(integration, 'error', null);
        }

        console.error('🚨 Ошибка API:', errorData);
    }

    // Определение интеграции по ошибке
    identifyIntegrationByError(error) {
        const errorMessage = error.message || error.toString();
        const errorLower = errorMessage.toLowerCase();

        if (errorLower.includes('stripe')) return 'stripe';
        if (errorLower.includes('adyen')) return 'adyen';
        if (errorLower.includes('google') || errorLower.includes('analytics')) return 'googleAnalytics';
        if (errorLower.includes('facebook') || errorLower.includes('pixel')) return 'facebookPixel';
        if (errorLower.includes('yandex')) return 'yandexMetrica';
        if (errorLower.includes('sendgrid')) return 'sendgrid';
        if (errorLower.includes('mailgun')) return 'mailgun';
        if (errorLower.includes('firebase')) return 'firebase';
        if (errorLower.includes('storage')) return 'cloudStorage';
        if (errorLower.includes('sentry')) return 'sentry';
        if (errorLower.includes('loggly')) return 'loggly';

        return null;
    }

    // Мониторинг производительности
    monitorPerformance() {
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.analyzePagePerformance(entry);
                    }
                }
            });
            observer.observe({ entryTypes: ['navigation'] });
        }
    }

    // Анализ производительности страницы
    analyzePagePerformance(entry) {
        const performanceData = {
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            firstPaint: entry.firstPaint,
            firstContentfulPaint: entry.firstContentfulPaint,
            timestamp: Date.now()
        };

        this.monitoringData.performance = performanceData;

        // Проверка производительности
        if (performanceData.loadTime > 5000) {
            this.triggerAlert('performance', 'warning', `Медленная загрузка страницы: ${performanceData.loadTime}ms`);
        }
    }

    // Запуск периодических проверок
    startPeriodicChecks() {
        // Проверка каждые 30 секунд
        setInterval(() => {
            this.runHealthChecks();
        }, 30000);

        // Полная проверка каждые 5 минут
        setInterval(() => {
            this.runFullHealthCheck();
        }, 300000);
    }

    // Запуск проверок здоровья
    async runHealthChecks() {
        console.log('🔍 Запуск проверок здоровья интеграций...');
        
        const criticalIntegrations = ['stripe', 'firebase', 'googleAnalytics'];
        
        for (const integrationKey of criticalIntegrations) {
            await this.checkIntegrationHealth(integrationKey);
        }
    }

    // Полная проверка здоровья
    async runFullHealthCheck() {
        console.log('🔍 Запуск полной проверки здоровья всех интеграций...');
        
        for (const integrationKey of Object.keys(this.integrations)) {
            await this.checkIntegrationHealth(integrationKey);
        }

        this.generateHealthReport();
    }

    // Проверка здоровья интеграции
    async checkIntegrationHealth(integrationKey) {
        const integration = this.integrations[integrationKey];
        if (!integration) return;

        try {
            const startTime = Date.now();
            
            // Проверка доступности эндпоинта
            const response = await this.pingEndpoint(integration.endpoints[0]);
            
            const responseTime = Date.now() - startTime;
            const status = response ? 'healthy' : 'unhealthy';

            this.updateIntegrationStatus(integrationKey, status, responseTime);
            
            // Сохранение данных проверки
            this.healthChecks[integrationKey] = {
                status,
                responseTime,
                timestamp: Date.now(),
                error: response ? null : 'Endpoint недоступен'
            };

        } catch (error) {
            console.error(`❌ Ошибка проверки здоровья ${integration.name}:`, error);
            this.updateIntegrationStatus(integrationKey, 'error', null);
            
            this.healthChecks[integrationKey] = {
                status: 'error',
                responseTime: null,
                timestamp: Date.now(),
                error: error.message
            };
        }
    }

    // Пинг эндпоинта
    async pingEndpoint(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors'
            });

            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Генерация отчета о здоровье
    generateHealthReport() {
        const totalIntegrations = Object.keys(this.integrations).length;
        const healthyIntegrations = Object.values(this.integrations).filter(i => i.status === 'healthy').length;
        const unhealthyIntegrations = totalIntegrations - healthyIntegrations;
        const healthRate = (healthyIntegrations / totalIntegrations * 100).toFixed(1);

        console.log('📊 ОТЧЕТ О ЗДОРОВЬЕ ИНТЕГРАЦИЙ');
        console.log('=' .repeat(50));
        console.log(`Всего интеграций: ${totalIntegrations}`);
        console.log(`Здоровых: ${healthyIntegrations}`);
        console.log(`Проблемных: ${unhealthyIntegrations}`);
        console.log(`Процент здоровья: ${healthRate}%`);
        console.log('=' .repeat(50));

        // Детальный отчет по каждой интеграции
        Object.entries(this.integrations).forEach(([key, integration]) => {
            const status = integration.status === 'healthy' ? '✅' : '❌';
            const responseTime = integration.responseTime ? `${integration.responseTime}ms` : 'N/A';
            console.log(`${status} ${integration.name}: ${integration.status} (${responseTime})`);
            
            if (integration.errorCount > 0) {
                console.log(`   Ошибок: ${integration.errorCount}`);
            }
        });

        // Сохранение отчета
        this.saveHealthReport();
    }

    // Сохранение отчета о здоровье
    saveHealthReport() {
        const report = {
            timestamp: Date.now(),
            summary: {
                total: Object.keys(this.integrations).length,
                healthy: Object.values(this.integrations).filter(i => i.status === 'healthy').length,
                unhealthy: Object.values(this.integrations).filter(i => i.status !== 'healthy').length
            },
            integrations: this.integrations,
            healthChecks: this.healthChecks,
            monitoring: this.monitoringData
        };

        localStorage.setItem('integration_health_report', JSON.stringify(report));
        console.log('💾 Отчет о здоровье интеграций сохранен');
    }

    // Триггер оповещения
    triggerAlert(integrationKey, level, message) {
        const alert = {
            integration: integrationKey,
            level,
            message,
            timestamp: Date.now()
        };

        this.monitoringData.alerts = this.monitoringData.alerts || [];
        this.monitoringData.alerts.push(alert);

        console.log(`🚨 ОПОВЕЩЕНИЕ [${level.toUpperCase()}]: ${message}`);

        // Отправка оповещения в систему мониторинга
        if (level === 'critical') {
            this.sendCriticalAlert(alert);
        }
    }

    // Отправка критического оповещения
    sendCriticalAlert(alert) {
        // Интеграция с системой оповещений
        if (window.notificationSystem) {
            window.notificationSystem.sendAlert(alert);
        }

        // Сохранение в localStorage для отслеживания
        const criticalAlerts = JSON.parse(localStorage.getItem('critical_alerts') || '[]');
        criticalAlerts.push(alert);
        localStorage.setItem('critical_alerts', JSON.stringify(criticalAlerts));
    }

    // Получение статистики мониторинга
    getMonitoringStats() {
        const stats = {
            integrations: Object.keys(this.integrations).length,
            healthy: Object.values(this.integrations).filter(i => i.status === 'healthy').length,
            errors: this.monitoringData.apiErrors?.length || 0,
            alerts: this.monitoringData.alerts?.length || 0,
            networkRequests: this.monitoringData.networkRequests?.length || 0
        };

        console.log('📈 Статистика мониторинга интеграций:', stats);
        return stats;
    }

    // Получение статуса интеграции
    getIntegrationStatus(integrationKey) {
        return this.integrations[integrationKey] || null;
    }

    // Получение всех статусов
    getAllIntegrationStatuses() {
        return this.integrations;
    }

    // Сброс счетчиков ошибок
    resetErrorCounters() {
        Object.values(this.integrations).forEach(integration => {
            integration.errorCount = 0;
        });
        console.log('🔄 Счетчики ошибок сброшены');
    }

    // Тестовый режим
    runTestMode() {
        console.log('🧪 Запуск тестового режима мониторинга интеграций');
        
        // Симуляция различных состояний интеграций
        setTimeout(() => {
            this.updateIntegrationStatus('stripe', 'healthy', 150);
        }, 1000);

        setTimeout(() => {
            this.updateIntegrationStatus('googleAnalytics', 'error', null);
        }, 2000);

        setTimeout(() => {
            this.updateIntegrationStatus('firebase', 'healthy', 200);
        }, 3000);

        // Генерация отчета через 5 секунд
        setTimeout(() => {
            this.generateHealthReport();
        }, 5000);
    }
}

// Инициализация системы мониторинга интеграций
const integrationMonitor = new IntegrationMonitor();

// Экспорт для использования в других модулях
window.IntegrationMonitor = IntegrationMonitor; 