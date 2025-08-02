/**
 * Система мониторинга производительности
 * Отслеживание скорости работы всех компонентов платформы
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.thresholds = this.initializeThresholds();
        this.alerts = [];
        this.init();
    }

    init() {
        console.log('⚡ Инициализация системы мониторинга производительности');
        this.setupPerformanceObservers();
        this.startMonitoring();
    }

    // Инициализация пороговых значений
    initializeThresholds() {
        return {
            pageLoad: {
                fast: 1000,      // < 1 секунды
                medium: 3000,    // 1-3 секунды
                slow: 5000       // > 5 секунд
            },
            apiResponse: {
                fast: 200,       // < 200ms
                medium: 500,     // 200-500ms
                slow: 1000       // > 1 секунды
            },
            memoryUsage: {
                low: 50,         // < 50MB
                medium: 100,     // 50-100MB
                high: 200        // > 200MB
            },
            cpuUsage: {
                low: 10,         // < 10%
                medium: 30,      // 10-30%
                high: 50         // > 50%
            }
        };
    }

    // Настройка наблюдателей производительности
    setupPerformanceObservers() {
        // Наблюдатель за навигацией
        if ('performance' in window) {
            const navigationObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        this.analyzePageLoad(entry);
                    }
                }
            });
            navigationObserver.observe({ entryTypes: ['navigation'] });

            // Наблюдатель за ресурсами
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'resource') {
                        this.analyzeResourceLoad(entry);
                    }
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });

            // Наблюдатель за длительными задачами
            if ('longtask' in PerformanceObserver.supportedEntryTypes) {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.analyzeLongTask(entry);
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            }
        }

        // Мониторинг памяти
        this.monitorMemoryUsage();

        // Мониторинг CPU
        this.monitorCPUUsage();

        // Мониторинг сетевых запросов
        this.monitorNetworkRequests();
    }

    // Анализ загрузки страницы
    analyzePageLoad(entry) {
        const metrics = {
            totalLoadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            firstPaint: entry.firstPaint,
            firstContentfulPaint: entry.firstContentfulPaint,
            largestContentfulPaint: entry.largestContentfulPaint,
            timestamp: Date.now()
        };

        this.metrics.pageLoad = metrics;
        this.evaluatePageLoadPerformance(metrics);
    }

    // Оценка производительности загрузки страницы
    evaluatePageLoadPerformance(metrics) {
        const loadTime = metrics.totalLoadTime;
        let performance = 'fast';

        if (loadTime > this.thresholds.pageLoad.slow) {
            performance = 'slow';
            this.triggerAlert('page_load_slow', `Медленная загрузка страницы: ${loadTime}ms`);
        } else if (loadTime > this.thresholds.pageLoad.medium) {
            performance = 'medium';
            this.triggerAlert('page_load_medium', `Средняя загрузка страницы: ${loadTime}ms`);
        }

        console.log(`📊 Производительность загрузки страницы: ${performance} (${loadTime}ms)`);
        
        // Сохранение метрики
        this.saveMetric('pageLoad', {
            loadTime,
            performance,
            timestamp: Date.now()
        });
    }

    // Анализ загрузки ресурсов
    analyzeResourceLoad(entry) {
        const resourceMetrics = {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            timestamp: Date.now()
        };

        // Проверка медленных ресурсов
        if (entry.duration > this.thresholds.apiResponse.slow) {
            this.triggerAlert('slow_resource', `Медленный ресурс: ${entry.name} (${entry.duration}ms)`);
        }

        // Сохранение метрики ресурса
        this.saveMetric('resources', resourceMetrics);
    }

    // Анализ длительных задач
    analyzeLongTask(entry) {
        const longTaskMetrics = {
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
        };

        this.triggerAlert('long_task', `Длительная задача: ${entry.duration}ms`);
        this.saveMetric('longTasks', longTaskMetrics);
    }

    // Мониторинг использования памяти
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
                const totalMemory = memoryInfo.totalJSHeapSize / 1024 / 1024; // MB

                const memoryMetrics = {
                    used: usedMemory,
                    total: totalMemory,
                    percentage: (usedMemory / totalMemory) * 100,
                    timestamp: Date.now()
                };

                this.metrics.memory = memoryMetrics;
                this.evaluateMemoryUsage(memoryMetrics);
            }, 5000); // Проверка каждые 5 секунд
        }
    }

    // Оценка использования памяти
    evaluateMemoryUsage(metrics) {
        const usedMemory = metrics.used;
        let status = 'low';

        if (usedMemory > this.thresholds.memoryUsage.high) {
            status = 'high';
            this.triggerAlert('memory_high', `Высокое использование памяти: ${usedMemory.toFixed(2)}MB`);
        } else if (usedMemory > this.thresholds.memoryUsage.medium) {
            status = 'medium';
        }

        console.log(`🧠 Использование памяти: ${status} (${usedMemory.toFixed(2)}MB)`);
    }

    // Мониторинг использования CPU
    monitorCPUUsage() {
        // Симуляция мониторинга CPU (в браузере ограниченный доступ)
        setInterval(() => {
            const startTime = performance.now();
            
            // Выполнение тестовой задачи для измерения CPU
            setTimeout(() => {
                const endTime = performance.now();
                const cpuUsage = (endTime - startTime) / 100; // Примерная оценка

                const cpuMetrics = {
                    usage: cpuUsage,
                    timestamp: Date.now()
                };

                this.metrics.cpu = cpuMetrics;
                this.evaluateCPUUsage(cpuMetrics);
            }, 100);
        }, 10000); // Проверка каждые 10 секунд
    }

    // Оценка использования CPU
    evaluateCPUUsage(metrics) {
        const cpuUsage = metrics.usage;
        let status = 'low';

        if (cpuUsage > this.thresholds.cpuUsage.high) {
            status = 'high';
            this.triggerAlert('cpu_high', `Высокое использование CPU: ${cpuUsage.toFixed(2)}%`);
        } else if (cpuUsage > this.thresholds.cpuUsage.medium) {
            status = 'medium';
        }

        console.log(`🖥️ Использование CPU: ${status} (${cpuUsage.toFixed(2)}%)`);
    }

    // Мониторинг сетевых запросов
    monitorNetworkRequests() {
        // Перехват fetch запросов
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.analyzeNetworkRequest(args[0], duration, response.status);
                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.analyzeNetworkRequest(args[0], duration, 'error');
                throw error;
            }
        };

        // Перехват XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._startTime = performance.now();
            this._url = url;
            return originalXHROpen.call(this, method, url, ...args);
        };

        XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('load', () => {
                const endTime = performance.now();
                const duration = endTime - this._startTime;
                this.analyzeNetworkRequest(this._url, duration, this.status);
            });

            this.addEventListener('error', () => {
                const endTime = performance.now();
                const duration = endTime - this._startTime;
                this.analyzeNetworkRequest(this._url, duration, 'error');
            });

            return originalXHRSend.call(this, ...args);
        };
    }

    // Анализ сетевого запроса
    analyzeNetworkRequest(url, duration, status) {
        const requestMetrics = {
            url: typeof url === 'string' ? url : url.toString(),
            duration,
            status,
            timestamp: Date.now()
        };

        // Проверка медленных запросов
        if (duration > this.thresholds.apiResponse.slow) {
            this.triggerAlert('slow_request', `Медленный запрос: ${url} (${duration}ms)`);
        }

        // Проверка ошибок
        if (status === 'error' || (typeof status === 'number' && status >= 400)) {
            this.triggerAlert('request_error', `Ошибка запроса: ${url} (${status})`);
        }

        this.saveMetric('networkRequests', requestMetrics);
    }

    // Запуск мониторинга
    startMonitoring() {
        console.log('🚀 Запуск мониторинга производительности');

        // Периодический сбор метрик
        setInterval(() => {
            this.collectMetrics();
        }, 30000); // Каждые 30 секунд

        // Периодическая очистка старых данных
        setInterval(() => {
            this.cleanupOldData();
        }, 300000); // Каждые 5 минут
    }

    // Сбор метрик
    collectMetrics() {
        const currentMetrics = {
            timestamp: Date.now(),
            pageLoad: this.metrics.pageLoad,
            memory: this.metrics.memory,
            cpu: this.metrics.cpu,
            resources: this.getResourceMetrics(),
            networkRequests: this.getNetworkMetrics()
        };

        // Сохранение в localStorage
        this.saveMetricsToStorage(currentMetrics);

        // Отправка метрик в аналитику (если доступна)
        if (window.analyticsDashboard) {
            window.analyticsDashboard.updatePerformanceMetrics(currentMetrics);
        }

        console.log('📊 Метрики производительности собраны');
    }

    // Получение метрик ресурсов
    getResourceMetrics() {
        const resources = this.metrics.resources || [];
        return {
            total: resources.length,
            slow: resources.filter(r => r.duration > this.thresholds.apiResponse.slow).length,
            averageDuration: resources.length > 0 ? 
                resources.reduce((sum, r) => sum + r.duration, 0) / resources.length : 0
        };
    }

    // Получение метрик сети
    getNetworkMetrics() {
        const requests = this.metrics.networkRequests || [];
        return {
            total: requests.length,
            errors: requests.filter(r => r.status === 'error' || r.status >= 400).length,
            averageDuration: requests.length > 0 ? 
                requests.reduce((sum, r) => sum + r.duration, 0) / requests.length : 0
        };
    }

    // Сохранение метрики
    saveMetric(type, data) {
        if (!this.metrics[type]) {
            this.metrics[type] = [];
        }
        this.metrics[type].push(data);

        // Ограничение количества записей
        if (this.metrics[type].length > 100) {
            this.metrics[type] = this.metrics[type].slice(-50);
        }
    }

    // Сохранение метрик в localStorage
    saveMetricsToStorage(metrics) {
        const storageKey = 'performance_metrics';
        const existingMetrics = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        existingMetrics.push(metrics);
        
        // Ограничение количества записей в localStorage
        if (existingMetrics.length > 100) {
            existingMetrics.splice(0, existingMetrics.length - 50);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(existingMetrics));
    }

    // Очистка старых данных
    cleanupOldData() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        Object.keys(this.metrics).forEach(key => {
            if (Array.isArray(this.metrics[key])) {
                this.metrics[key] = this.metrics[key].filter(item => 
                    item.timestamp > oneHourAgo
                );
            }
        });

        console.log('🧹 Старые данные производительности очищены');
    }

    // Триггер оповещения
    triggerAlert(type, message) {
        const alert = {
            type,
            message,
            timestamp: Date.now(),
            severity: this.getAlertSeverity(type)
        };

        this.alerts.push(alert);
        console.warn(`⚠️ Оповещение производительности: ${message}`);

        // Отправка в систему оповещений
        if (window.notificationSystem) {
            window.notificationSystem.sendAlert(alert);
        }

        // Ограничение количества оповещений
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(-25);
        }
    }

    // Определение серьезности оповещения
    getAlertSeverity(type) {
        const severityMap = {
            'page_load_slow': 'high',
            'slow_request': 'medium',
            'memory_high': 'high',
            'cpu_high': 'medium',
            'long_task': 'medium',
            'request_error': 'high'
        };
        return severityMap[type] || 'low';
    }

    // Получение отчета о производительности
    getPerformanceReport() {
        const report = {
            timestamp: Date.now(),
            summary: {
                pageLoad: this.getPageLoadSummary(),
                memory: this.getMemorySummary(),
                cpu: this.getCPUSummary(),
                network: this.getNetworkSummary()
            },
            alerts: this.alerts.slice(-10), // Последние 10 оповещений
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    // Получение сводки загрузки страницы
    getPageLoadSummary() {
        const pageLoads = this.metrics.pageLoad || [];
        if (pageLoads.length === 0) return { average: 0, status: 'unknown' };

        const average = pageLoads.reduce((sum, p) => sum + p.loadTime, 0) / pageLoads.length;
        let status = 'fast';
        
        if (average > this.thresholds.pageLoad.slow) status = 'slow';
        else if (average > this.thresholds.pageLoad.medium) status = 'medium';

        return { average, status };
    }

    // Получение сводки памяти
    getMemorySummary() {
        const memory = this.metrics.memory;
        if (!memory) return { current: 0, status: 'unknown' };

        let status = 'low';
        if (memory.used > this.thresholds.memoryUsage.high) status = 'high';
        else if (memory.used > this.thresholds.memoryUsage.medium) status = 'medium';

        return { current: memory.used, status };
    }

    // Получение сводки CPU
    getCPUSummary() {
        const cpu = this.metrics.cpu;
        if (!cpu) return { current: 0, status: 'unknown' };

        let status = 'low';
        if (cpu.usage > this.thresholds.cpuUsage.high) status = 'high';
        else if (cpu.usage > this.thresholds.cpuUsage.medium) status = 'medium';

        return { current: cpu.usage, status };
    }

    // Получение сводки сети
    getNetworkSummary() {
        const requests = this.metrics.networkRequests || [];
        if (requests.length === 0) return { average: 0, errors: 0 };

        const average = requests.reduce((sum, r) => sum + r.duration, 0) / requests.length;
        const errors = requests.filter(r => r.status === 'error' || r.status >= 400).length;

        return { average, errors, total: requests.length };
    }

    // Генерация рекомендаций
    generateRecommendations() {
        const recommendations = [];
        const summary = this.getPerformanceReport().summary;

        if (summary.pageLoad.status === 'slow') {
            recommendations.push({
                priority: 'high',
                title: 'Оптимизировать загрузку страницы',
                description: 'Время загрузки страницы превышает рекомендуемые значения',
                action: 'optimize_page_load'
            });
        }

        if (summary.memory.status === 'high') {
            recommendations.push({
                priority: 'medium',
                title: 'Оптимизировать использование памяти',
                description: 'Высокое использование памяти может влиять на производительность',
                action: 'optimize_memory'
            });
        }

        if (summary.network.errors > 0) {
            recommendations.push({
                priority: 'high',
                title: 'Исправить сетевые ошибки',
                description: `Обнаружено ${summary.network.errors} ошибок в сетевых запросах`,
                action: 'fix_network_errors'
            });
        }

        return recommendations;
    }

    // Получение статистики
    getStats() {
        return {
            metrics: this.metrics,
            alerts: this.alerts,
            thresholds: this.thresholds
        };
    }

    // Сброс метрик
    resetMetrics() {
        this.metrics = {};
        this.alerts = [];
        console.log('🔄 Метрики производительности сброшены');
    }
}

// Инициализация системы мониторинга производительности
const performanceMonitor = new PerformanceMonitor();

// Экспорт для использования в других модулях
window.PerformanceMonitor = PerformanceMonitor; 