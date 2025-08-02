/**
 * 🚨 Error Monitor - Система мониторинга ошибок
 * Версия: 1.0.0
 * Дата: 30.07.2025
 * 
 * Отслеживает ошибки JavaScript, Firebase и производительности
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.init();
    }

    init() {
        // Перехват ошибок JavaScript
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        });

        // Перехват необработанных Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
        });

        // Мониторинг производительности
        this.monitorPerformance();

        // Мониторинг Firebase ошибок
        this.monitorFirebase();

        console.log('🚨 Error Monitor инициализирован');
    }

    logError(type, details) {
        const error = {
            id: this.generateId(),
            type,
            details,
            timestamp: new Date().toISOString()
        };

        this.errors.push(error);

        // Ограничиваем количество ошибок
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Логируем в консоль для разработки
        console.error(`🚨 ${type}:`, details);

        // Отправляем критичные ошибки на сервер
        if (this.isCriticalError(type, details)) {
            this.sendToServer(error);
        }

        // Сохраняем в localStorage для анализа
        this.saveToStorage();
    }

    isCriticalError(type, details) {
        // Критичные ошибки для отправки на сервер
        const criticalPatterns = [
            'Firebase',
            'Authentication',
            'Network',
            'SyntaxError',
            'ReferenceError'
        ];

        return criticalPatterns.some(pattern => 
            type.includes(pattern) || 
            details.message?.includes(pattern) ||
            details.reason?.includes(pattern)
        );
    }

    async sendToServer(error) {
        try {
            // Отправляем ошибку на сервер для анализа
            const response = await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(error)
            });

            if (!response.ok) {
                console.warn('Не удалось отправить ошибку на сервер');
            }
        } catch (err) {
            console.warn('Ошибка при отправке ошибки на сервер:', err);
        }
    }

    monitorPerformance() {
        // Мониторинг времени загрузки страницы
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            
            if (loadTime > 3000) { // Больше 3 секунд
                this.logError('Performance Warning', {
                    message: 'Медленная загрузка страницы',
                    loadTime: Math.round(loadTime),
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Мониторинг памяти
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

                if (usedMB > 100) { // Больше 100MB
                    this.logError('Memory Warning', {
                        message: 'Высокое потребление памяти',
                        usedMB,
                        totalMB,
                        url: window.location.href,
                        timestamp: new Date().toISOString()
                    });
                }
            }, 30000); // Проверяем каждые 30 секунд
        }
    }

    monitorFirebase() {
        // Перехватываем Firebase ошибки
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            
            if (message.includes('Firebase') || message.includes('firebase')) {
                this.logError('Firebase Error', {
                    message,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                });
            }

            // Вызываем оригинальный console.error
            originalConsoleError.apply(console, args);
        };
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToStorage() {
        try {
            localStorage.setItem('workincz-errors', JSON.stringify(this.errors));
        } catch (err) {
            console.warn('Не удалось сохранить ошибки в localStorage:', err);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('workincz-errors');
            if (stored) {
                this.errors = JSON.parse(stored);
            }
        } catch (err) {
            console.warn('Не удалось загрузить ошибки из localStorage:', err);
        }
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('workincz-errors');
    }

    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10)
        };

        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        });

        return stats;
    }
}

// Создаем глобальный экземпляр
window.errorMonitor = new ErrorMonitor();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorMonitor;
} 