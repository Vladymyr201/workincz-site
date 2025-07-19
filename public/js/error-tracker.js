/**
 * Система отслеживания ошибок
 * Мониторинг и анализ ошибок в платформе WorkInCZ
 */

class ErrorTracker {
    constructor() {
        this.errors = [];
        this.errorPatterns = {};
        this.alertThresholds = this.initializeAlertThresholds();
        this.init();
    }

    init() {
        console.log('🚨 Инициализация системы отслеживания ошибок');
        this.setupErrorHandlers();
        this.setupErrorPatterns();
        this.startMonitoring();
    }

    // Инициализация порогов оповещений
    initializeAlertThresholds() {
        return {
            critical: {
                count: 5,        // Критическое количество ошибок
                timeWindow: 60000 // За 1 минуту
            },
            warning: {
                count: 10,       // Предупреждение
                timeWindow: 300000 // За 5 минут
            },
            info: {
                count: 20,       // Информационное
                timeWindow: 900000 // За 15 минут
            }
        };
    }

    // Настройка обработчиков ошибок
    setupErrorHandlers() {
        // Обработчик JavaScript ошибок
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now(),
                severity: 'error'
            });
        });

        // Обработчик необработанных промисов
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise',
                message: event.reason?.message || event.reason?.toString() || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: Date.now(),
                severity: 'error'
            });
        });

        // Обработчик ошибок загрузки ресурсов
        window.addEventListener('error', (event) => {
            if (event.target && event.target !== window) {
                this.trackError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    filename: event.target.src || event.target.href,
                    timestamp: Date.now(),
                    severity: 'warning'
                });
            }
        }, true);

        // Обработчик ошибок сетевых запросов
        this.setupNetworkErrorHandling();
    }

    // Настройка обработки сетевых ошибок
    setupNetworkErrorHandling() {
        // Перехват fetch запросов
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    this.trackError({
                        type: 'network',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        url: args[0],
                        status: response.status,
                        timestamp: Date.now(),
                        severity: response.status >= 500 ? 'error' : 'warning'
                    });
                }
                
                return response;
            } catch (error) {
                this.trackError({
                    type: 'network',
                    message: `Network request failed: ${error.message}`,
                    url: args[0],
                    timestamp: Date.now(),
                    severity: 'error'
                });
                throw error;
            }
        };

        // Перехват XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._url = url;
            this._method = method;
            return originalXHROpen.call(this, method, url, ...args);
        };

        XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('load', () => {
                if (this.status >= 400) {
                    this.trackError({
                        type: 'network',
                        message: `HTTP ${this.status}: ${this.statusText}`,
                        url: this._url,
                        method: this._method,
                        status: this.status,
                        timestamp: Date.now(),
                        severity: this.status >= 500 ? 'error' : 'warning'
                    });
                }
            });

            this.addEventListener('error', () => {
                this.trackError({
                    type: 'network',
                    message: 'Network request failed',
                    url: this._url,
                    method: this._method,
                    timestamp: Date.now(),
                    severity: 'error'
                });
            });

            return originalXHRSend.call(this, ...args);
        };
    }

    // Настройка паттернов ошибок
    setupErrorPatterns() {
        this.errorPatterns = {
            // Паттерны для JavaScript ошибок
            javascript: {
                'TypeError': 'Ошибка типа данных',
                'ReferenceError': 'Ошибка ссылки на переменную',
                'SyntaxError': 'Синтаксическая ошибка',
                'RangeError': 'Ошибка диапазона',
                'URIError': 'Ошибка URI',
                'EvalError': 'Ошибка выполнения'
            },
            
            // Паттерны для сетевых ошибок
            network: {
                '404': 'Ресурс не найден',
                '500': 'Внутренняя ошибка сервера',
                '502': 'Ошибка шлюза',
                '503': 'Сервис недоступен',
                '504': 'Таймаут шлюза',
                'CORS': 'Ошибка CORS',
                'timeout': 'Таймаут запроса',
                'connection': 'Ошибка соединения'
            },
            
            // Паттерны для ресурсов
            resource: {
                'image': 'Ошибка загрузки изображения',
                'script': 'Ошибка загрузки скрипта',
                'stylesheet': 'Ошибка загрузки стилей',
                'font': 'Ошибка загрузки шрифта'
            }
        };
    }

    // Отслеживание ошибки
    trackError(errorData) {
        // Добавление дополнительной информации
        const enrichedError = {
            ...errorData,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userId: this.getCurrentUserId()
        };

        // Определение категории ошибки
        enrichedError.category = this.categorizeError(enrichedError);
        
        // Определение паттерна ошибки
        enrichedError.pattern = this.identifyErrorPattern(enrichedError);

        // Добавление в список ошибок
        this.errors.push(enrichedError);

        // Проверка порогов оповещений
        this.checkAlertThresholds(enrichedError);

        // Сохранение в localStorage
        this.saveErrorToStorage(enrichedError);

        // Логирование ошибки
        this.logError(enrichedError);

        // Отправка в аналитику (если доступна)
        if (window.analyticsDashboard) {
            window.analyticsDashboard.trackError(enrichedError);
        }
    }

    // Категоризация ошибки
    categorizeError(error) {
        if (error.type === 'javascript') {
            return 'client_error';
        } else if (error.type === 'network') {
            return 'network_error';
        } else if (error.type === 'resource') {
            return 'resource_error';
        } else if (error.type === 'promise') {
            return 'async_error';
        }
        return 'unknown_error';
    }

    // Определение паттерна ошибки
    identifyErrorPattern(error) {
        const patterns = this.errorPatterns[error.type] || {};
        
        for (const [pattern, description] of Object.entries(patterns)) {
            if (error.message.includes(pattern) || 
                (error.status && error.status.toString().includes(pattern))) {
                return { pattern, description };
            }
        }
        
        return { pattern: 'unknown', description: 'Неизвестная ошибка' };
    }

    // Проверка порогов оповещений
    checkAlertThresholds(newError) {
        const now = Date.now();
        
        Object.entries(this.alertThresholds).forEach(([level, threshold]) => {
            const recentErrors = this.errors.filter(error => 
                error.timestamp > now - threshold.timeWindow &&
                error.severity === 'error'
            );
            
            if (recentErrors.length >= threshold.count) {
                this.triggerAlert(level, {
                    count: recentErrors.length,
                    timeWindow: threshold.timeWindow,
                    recentErrors: recentErrors.slice(-5)
                });
            }
        });
    }

    // Триггер оповещения
    triggerAlert(level, data) {
        const alert = {
            level,
            message: `Обнаружено ${data.count} ошибок за последние ${data.timeWindow / 1000} секунд`,
            data,
            timestamp: Date.now()
        };

        console.warn(`🚨 ${level.toUpperCase()} ОПОВЕЩЕНИЕ: ${alert.message}`);

        // Отправка в систему оповещений
        if (window.notificationSystem) {
            window.notificationSystem.sendAlert(alert);
        }

        // Отправка в систему мониторинга
        if (window.integrationMonitor) {
            window.integrationMonitor.triggerAlert('error_tracking', level, alert.message);
        }
    }

    // Сохранение ошибки в localStorage
    saveErrorToStorage(error) {
        const storageKey = 'error_logs';
        const existingErrors = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        existingErrors.push(error);
        
        // Ограничение количества ошибок в localStorage
        if (existingErrors.length > 100) {
            existingErrors.splice(0, existingErrors.length - 50);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingErrors));
    }

    // Логирование ошибки
    logError(error) {
        const logMessage = `[${new Date(error.timestamp).toISOString()}] ${error.type.toUpperCase()}: ${error.message}`;
        
        if (error.severity === 'error') {
            console.error(logMessage, error);
        } else if (error.severity === 'warning') {
            console.warn(logMessage, error);
        } else {
            console.log(logMessage, error);
        }
    }

    // Запуск мониторинга
    startMonitoring() {
        console.log('🚨 Запуск мониторинга ошибок');

        // Периодическая проверка состояния
        setInterval(() => {
            this.generateErrorReport();
        }, 60000); // Каждую минуту

        // Периодическая очистка старых ошибок
        setInterval(() => {
            this.cleanupOldErrors();
        }, 300000); // Каждые 5 минут
    }

    // Генерация отчета об ошибках
    generateErrorReport() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo);
        
        const report = {
            timestamp: now,
            period: 'last_hour',
            summary: {
                total: recentErrors.length,
                byType: this.groupErrorsByType(recentErrors),
                bySeverity: this.groupErrorsBySeverity(recentErrors),
                byCategory: this.groupErrorsByCategory(recentErrors)
            },
            topErrors: this.getTopErrors(recentErrors),
            recommendations: this.generateRecommendations(recentErrors)
        };

        // Сохранение отчета
        this.saveReportToStorage(report);

        // Отправка отчета в аналитику
        if (window.analyticsDashboard) {
            window.analyticsDashboard.updateErrorMetrics(report);
        }

        return report;
    }

    // Группировка ошибок по типу
    groupErrorsByType(errors) {
        return errors.reduce((groups, error) => {
            groups[error.type] = (groups[error.type] || 0) + 1;
            return groups;
        }, {});
    }

    // Группировка ошибок по серьезности
    groupErrorsBySeverity(errors) {
        return errors.reduce((groups, error) => {
            groups[error.severity] = (groups[error.severity] || 0) + 1;
            return groups;
        }, {});
    }

    // Группировка ошибок по категории
    groupErrorsByCategory(errors) {
        return errors.reduce((groups, error) => {
            groups[error.category] = (groups[error.category] || 0) + 1;
            return groups;
        }, {});
    }

    // Получение топ ошибок
    getTopErrors(errors) {
        const errorCounts = {};
        
        errors.forEach(error => {
            const key = `${error.type}:${error.message}`;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    // Генерация рекомендаций
    generateRecommendations(errors) {
        const recommendations = [];
        
        const errorTypes = this.groupErrorsByType(errors);
        const errorSeverities = this.groupErrorsBySeverity(errors);

        // Рекомендации по типам ошибок
        if (errorTypes.network > 10) {
            recommendations.push({
                priority: 'high',
                title: 'Исправить сетевые ошибки',
                description: `Обнаружено ${errorTypes.network} сетевых ошибок`,
                action: 'fix_network_errors'
            });
        }

        if (errorTypes.javascript > 5) {
            recommendations.push({
                priority: 'medium',
                title: 'Исправить JavaScript ошибки',
                description: `Обнаружено ${errorTypes.javascript} JavaScript ошибок`,
                action: 'fix_javascript_errors'
            });
        }

        // Рекомендации по серьезности
        if (errorSeverities.error > 5) {
            recommendations.push({
                priority: 'critical',
                title: 'Критические ошибки требуют внимания',
                description: `Обнаружено ${errorSeverities.error} критических ошибок`,
                action: 'fix_critical_errors'
            });
        }

        return recommendations;
    }

    // Сохранение отчета в localStorage
    saveReportToStorage(report) {
        const storageKey = 'error_reports';
        const existingReports = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        existingReports.push(report);
        
        // Ограничение количества отчетов
        if (existingReports.length > 50) {
            existingReports.splice(0, existingReports.length - 25);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingReports));
    }

    // Очистка старых ошибок
    cleanupOldErrors() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.errors = this.errors.filter(error => error.timestamp > oneDayAgo);
        
        console.log('🧹 Старые ошибки очищены');
    }

    // Получение ID сессии
    getSessionId() {
        let sessionId = sessionStorage.getItem('error_tracker_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('error_tracker_session_id', sessionId);
        }
        return sessionId;
    }

    // Получение ID текущего пользователя
    getCurrentUserId() {
        // Здесь можно интегрировать с системой аутентификации
        return localStorage.getItem('current_user_id') || 'anonymous';
    }

    // Получение статистики ошибок
    getErrorStats() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        return {
            total: this.errors.length,
            lastHour: this.errors.filter(e => e.timestamp > oneHourAgo).length,
            lastDay: this.errors.filter(e => e.timestamp > oneDayAgo).length,
            byType: this.groupErrorsByType(this.errors),
            bySeverity: this.groupErrorsBySeverity(this.errors),
            byCategory: this.groupErrorsByCategory(this.errors)
        };
    }

    // Получение всех ошибок
    getAllErrors() {
        return this.errors;
    }

    // Получение ошибок по фильтру
    getErrorsByFilter(filter) {
        return this.errors.filter(error => {
            if (filter.type && error.type !== filter.type) return false;
            if (filter.severity && error.severity !== filter.severity) return false;
            if (filter.category && error.category !== filter.category) return false;
            if (filter.startTime && error.timestamp < filter.startTime) return false;
            if (filter.endTime && error.timestamp > filter.endTime) return false;
            return true;
        });
    }

    // Сброс ошибок
    resetErrors() {
        this.errors = [];
        localStorage.removeItem('error_logs');
        localStorage.removeItem('error_reports');
        console.log('🔄 Ошибки сброшены');
    }

    // Тестовый режим
    runTestMode() {
        console.log('🧪 Запуск тестового режима отслеживания ошибок');
        
        // Симуляция различных типов ошибок
        setTimeout(() => {
            this.trackError({
                type: 'javascript',
                message: 'Test JavaScript error',
                filename: 'test.js',
                lineno: 1,
                colno: 1,
                timestamp: Date.now(),
                severity: 'error'
            });
        }, 1000);

        setTimeout(() => {
            this.trackError({
                type: 'network',
                message: 'Test network error',
                url: 'https://api.test.com/error',
                status: 500,
                timestamp: Date.now(),
                severity: 'error'
            });
        }, 2000);

        setTimeout(() => {
            this.trackError({
                type: 'resource',
                message: 'Test resource error',
                filename: 'https://cdn.test.com/image.png',
                timestamp: Date.now(),
                severity: 'warning'
            });
        }, 3000);
    }
}

// Инициализация системы отслеживания ошибок
const errorTracker = new ErrorTracker();

// Экспорт для использования в других модулях
window.ErrorTracker = ErrorTracker; 