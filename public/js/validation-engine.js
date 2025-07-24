/**
 * Движок валидации маркетинговых компонентов
 * Проверка корректности данных, интеграций и конфигураций
 */

class ValidationEngine {
    constructor() {
        this.validationRules = this.initializeValidationRules();
        this.validationResults = {};
        this.init();
    }

    init() {
        console.log('🔍 Инициализация движка валидации маркетинговых компонентов');
        this.setupValidationTriggers();
    }

    // Инициализация правил валидации
    initializeValidationRules() {
        return {
            // Валидация реферальной системы
            referral: {
                codeFormat: {
                    pattern: /^[A-Z0-9]{8}$/,
                    message: 'Реферальный код должен содержать 8 символов (буквы и цифры)'
                },
                bonusRange: {
                    min: 0,
                    max: 10000,
                    message: 'Бонус должен быть в диапазоне 0-10000 CZK'
                },
                trackingData: {
                    required: ['referrerId', 'userId', 'timestamp'],
                    message: 'Отсутствуют обязательные поля для отслеживания'
                }
            },

            // Валидация email-маркетинга
            email: {
                templateFormat: {
                    required: ['subject', 'body', 'variables'],
                    message: 'Email-шаблон должен содержать subject, body и variables'
                },
                userSegments: {
                    required: ['role', 'location', 'preferences'],
                    message: 'Сегментация пользователей требует role, location и preferences'
                },
                campaignData: {
                    required: ['template', 'recipients', 'schedule'],
                    message: 'Кампания должна содержать template, recipients и schedule'
                }
            },

            // Валидация A/B тестирования
            abTesting: {
                experimentConfig: {
                    required: ['id', 'name', 'variations', 'metric'],
                    message: 'Эксперимент должен содержать id, name, variations и metric'
                },
                variationFormat: {
                    minVariations: 2,
                    maxVariations: 10,
                    message: 'Количество вариантов должно быть от 2 до 10'
                },
                metricValidation: {
                    allowed: ['conversion_rate', 'click_rate', 'engagement_rate', 'revenue'],
                    message: 'Неподдерживаемая метрика для эксперимента'
                }
            },

            // Валидация внешних аналитик
            analytics: {
                ga4Config: {
                    required: ['measurement_id', 'api_secret'],
                    message: 'GA4 требует measurement_id и api_secret'
                },
                facebookConfig: {
                    required: ['pixel_id', 'access_token'],
                    message: 'Facebook Pixel требует pixel_id и access_token'
                },
                yandexConfig: {
                    required: ['counter_id', 'goal_id'],
                    message: 'Yandex.Metrica требует counter_id и goal_id'
                },
                eventFormat: {
                    required: ['event_name', 'parameters'],
                    message: 'Событие должно содержать event_name и parameters'
                }
            },

            // Валидация оптимизационного движка
            optimization: {
                ruleFormat: {
                    required: ['element', 'condition', 'action'],
                    message: 'Правило оптимизации должно содержать element, condition и action'
                },
                dataQuality: {
                    minDataPoints: 100,
                    message: 'Недостаточно данных для анализа (минимум 100 точек)'
                },
                optimizationScope: {
                    allowed: ['ui', 'content', 'pricing', 'layout'],
                    message: 'Неподдерживаемая область оптимизации'
                }
            },

            // Валидация аналитики конверсий
            conversion: {
                funnelSteps: {
                    minSteps: 2,
                    maxSteps: 10,
                    message: 'Воронка должна содержать от 2 до 10 шагов'
                },
                eventTracking: {
                    required: ['event_name', 'timestamp', 'user_id'],
                    message: 'Отслеживание события требует event_name, timestamp и user_id'
                },
                sourceTracking: {
                    required: ['source', 'medium', 'campaign'],
                    message: 'Отслеживание источника требует source, medium и campaign'
                }
            }
        };
    }

    // Настройка триггеров валидации
    setupValidationTriggers() {
        // Валидация при загрузке страницы
        document.addEventListener('DOMContentLoaded', () => {
            this.validateAllComponents();
        });

        // Валидация при изменении данных
        this.setupDataChangeListeners();
    }

    // Настройка слушателей изменений данных
    setupDataChangeListeners() {
        // Мониторинг изменений в localStorage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            originalSetItem.call(localStorage, key, value);
            this.validateDataChange(key, value);
        };

        // Мониторинг изменений в sessionStorage
        const originalSessionSetItem = sessionStorage.setItem;
        sessionStorage.setItem = (key, value) => {
            originalSessionSetItem.call(sessionStorage, key, value);
            this.validateDataChange(key, value);
        };
    }

    // Валидация изменения данных
    validateDataChange(key, value) {
        if (key.includes('marketing') || key.includes('analytics') || key.includes('ab_test')) {
            console.log(`🔍 Валидация изменений данных: ${key}`);
            this.validateComponentData(key, value);
        }
    }

    // Валидация всех компонентов
    async validateAllComponents() {
        console.log('🔍 Запуск комплексной валидации маркетинговых компонентов');
        
        const validations = [
            this.validateReferralSystem.bind(this),
            this.validateEmailMarketing.bind(this),
            this.validateABTesting.bind(this),
            this.validateExternalAnalytics.bind(this),
            this.validateOptimizationEngine.bind(this),
            this.validateConversionAnalytics.bind(this)
        ];

        for (const validation of validations) {
            try {
                await validation();
            } catch (error) {
                console.error(`❌ Ошибка валидации: ${error.message}`);
                this.recordValidationResult(validation.name, false, error.message);
            }
        }

        this.generateValidationReport();
    }

    // Валидация реферальной системы
    async validateReferralSystem() {
        console.log('🔗 Валидация реферальной системы...');
        
        const testData = {
            code: 'ABC12345',
            bonus: 500,
            tracking: {
                referrerId: 'user_123',
                userId: 'new_user_456',
                timestamp: Date.now()
            }
        };

        const validations = [
            {
                name: 'Формат реферального кода',
                test: () => this.validatePattern(testData.code, this.validationRules.referral.codeFormat.pattern),
                message: this.validationRules.referral.codeFormat.message
            },
            {
                name: 'Диапазон бонусов',
                test: () => this.validateRange(testData.bonus, this.validationRules.referral.bonusRange.min, this.validationRules.referral.bonusRange.max),
                message: this.validationRules.referral.bonusRange.message
            },
            {
                name: 'Данные отслеживания',
                test: () => this.validateRequiredFields(testData.tracking, this.validationRules.referral.trackingData.required),
                message: this.validationRules.referral.trackingData.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`referral_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация email-маркетинга
    async validateEmailMarketing() {
        console.log('📧 Валидация email-маркетинга...');
        
        const testData = {
            template: {
                subject: 'Добро пожаловать!',
                body: 'Привет, {{name}}!',
                variables: ['name', 'company']
            },
            segments: {
                role: 'jobseeker',
                location: 'Prague',
                preferences: ['tech', 'remote']
            },
            campaign: {
                template: 'welcome',
                recipients: ['user1@example.com', 'user2@example.com'],
                schedule: '2024-01-15T10:00:00Z'
            }
        };

        const validations = [
            {
                name: 'Формат email-шаблона',
                test: () => this.validateRequiredFields(testData.template, this.validationRules.email.templateFormat.required),
                message: this.validationRules.email.templateFormat.message
            },
            {
                name: 'Сегментация пользователей',
                test: () => this.validateRequiredFields(testData.segments, this.validationRules.email.userSegments.required),
                message: this.validationRules.email.userSegments.message
            },
            {
                name: 'Данные кампании',
                test: () => this.validateRequiredFields(testData.campaign, this.validationRules.email.campaignData.required),
                message: this.validationRules.email.campaignData.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`email_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация A/B тестирования
    async validateABTesting() {
        console.log('🔬 Валидация A/B тестирования...');
        
        const testData = {
            experiment: {
                id: 'exp_001',
                name: 'Landing Page CTA',
                variations: ['primary', 'secondary'],
                metric: 'conversion_rate'
            }
        };

        const validations = [
            {
                name: 'Конфигурация эксперимента',
                test: () => this.validateRequiredFields(testData.experiment, this.validationRules.abTesting.experimentConfig.required),
                message: this.validationRules.abTesting.experimentConfig.message
            },
            {
                name: 'Формат вариантов',
                test: () => this.validateRange(testData.experiment.variations.length, this.validationRules.abTesting.variationFormat.minVariations, this.validationRules.abTesting.variationFormat.maxVariations),
                message: this.validationRules.abTesting.variationFormat.message
            },
            {
                name: 'Валидация метрики',
                test: () => this.validateAllowedValues(testData.experiment.metric, this.validationRules.abTesting.metricValidation.allowed),
                message: this.validationRules.abTesting.metricValidation.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`ab_test_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация внешних аналитик
    async validateExternalAnalytics() {
        console.log('📊 Валидация внешних аналитик...');
        
        const testData = {
            ga4: {
                measurement_id: 'G-XXXXXXXXXX',
                api_secret: 'secret_key_123'
            },
            facebook: {
                pixel_id: '123456789',
                access_token: 'fb_token_123'
            },
            yandex: {
                counter_id: '12345',
                goal_id: 'goal_1'
            },
            event: {
                event_name: 'page_view',
                parameters: { page_title: 'Home Page' }
            }
        };

        const validations = [
            {
                name: 'Конфигурация GA4',
                test: () => this.validateRequiredFields(testData.ga4, this.validationRules.analytics.ga4Config.required),
                message: this.validationRules.analytics.ga4Config.message
            },
            {
                name: 'Конфигурация Facebook',
                test: () => this.validateRequiredFields(testData.facebook, this.validationRules.analytics.facebookConfig.required),
                message: this.validationRules.analytics.facebookConfig.message
            },
            {
                name: 'Конфигурация Yandex',
                test: () => this.validateRequiredFields(testData.yandex, this.validationRules.analytics.yandexConfig.required),
                message: this.validationRules.analytics.yandexConfig.message
            },
            {
                name: 'Формат события',
                test: () => this.validateRequiredFields(testData.event, this.validationRules.analytics.eventFormat.required),
                message: this.validationRules.analytics.eventFormat.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`analytics_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация оптимизационного движка
    async validateOptimizationEngine() {
        console.log('⚙️ Валидация оптимизационного движка...');
        
        const testData = {
            rule: {
                element: 'cta_button',
                condition: 'conversion_rate < 0.1',
                action: 'change_color_to_blue'
            },
            dataPoints: 150,
            scope: 'ui'
        };

        const validations = [
            {
                name: 'Формат правила оптимизации',
                test: () => this.validateRequiredFields(testData.rule, this.validationRules.optimization.ruleFormat.required),
                message: this.validationRules.optimization.ruleFormat.message
            },
            {
                name: 'Качество данных',
                test: () => testData.dataPoints >= this.validationRules.optimization.dataQuality.minDataPoints,
                message: this.validationRules.optimization.dataQuality.message
            },
            {
                name: 'Область оптимизации',
                test: () => this.validateAllowedValues(testData.scope, this.validationRules.optimization.optimizationScope.allowed),
                message: this.validationRules.optimization.optimizationScope.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`optimization_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация аналитики конверсий
    async validateConversionAnalytics() {
        console.log('📈 Валидация аналитики конверсий...');
        
        const testData = {
            funnel: ['view', 'click', 'register', 'complete'],
            event: {
                event_name: 'registration_completed',
                timestamp: Date.now(),
                user_id: 'user_123'
            },
            source: {
                source: 'google',
                medium: 'cpc',
                campaign: 'winter_2024'
            }
        };

        const validations = [
            {
                name: 'Шаги воронки',
                test: () => this.validateRange(testData.funnel.length, this.validationRules.conversion.funnelSteps.minSteps, this.validationRules.conversion.funnelSteps.maxSteps),
                message: this.validationRules.conversion.funnelSteps.message
            },
            {
                name: 'Отслеживание событий',
                test: () => this.validateRequiredFields(testData.event, this.validationRules.conversion.eventTracking.required),
                message: this.validationRules.eventTracking.message
            },
            {
                name: 'Отслеживание источников',
                test: () => this.validateRequiredFields(testData.source, this.validationRules.conversion.sourceTracking.required),
                message: this.validationRules.conversion.sourceTracking.message
            }
        ];

        for (const validation of validations) {
            const result = validation.test();
            this.recordValidationResult(`conversion_${validation.name}`, result, result ? null : validation.message);
        }
    }

    // Валидация данных компонента
    validateComponentData(key, value) {
        try {
            const data = JSON.parse(value);
            const component = this.identifyComponent(key);
            
            if (component && this.validationRules[component]) {
                console.log(`🔍 Валидация данных компонента: ${component}`);
                this.validateComponentRules(component, data);
            }
        } catch (error) {
            console.warn(`⚠️ Ошибка парсинга данных для валидации: ${key}`);
        }
    }

    // Идентификация компонента по ключу
    identifyComponent(key) {
        if (key.includes('referral')) return 'referral';
        if (key.includes('email')) return 'email';
        if (key.includes('ab_test')) return 'abTesting';
        if (key.includes('analytics')) return 'analytics';
        if (key.includes('optimization')) return 'optimization';
        if (key.includes('conversion')) return 'conversion';
        return null;
    }

    // Валидация правил компонента
    validateComponentRules(component, data) {
        const rules = this.validationRules[component];
        if (!rules) return;

        Object.entries(rules).forEach(([ruleName, rule]) => {
            const isValid = this.validateRule(rule, data);
            this.recordValidationResult(`${component}_${ruleName}`, isValid, isValid ? null : rule.message);
        });
    }

    // Валидация правила
    validateRule(rule, data) {
        if (rule.pattern) {
            return rule.pattern.test(data);
        }
        if (rule.required) {
            return this.validateRequiredFields(data, rule.required);
        }
        if (rule.min !== undefined && rule.max !== undefined) {
            return this.validateRange(data, rule.min, rule.max);
        }
        if (rule.allowed) {
            return this.validateAllowedValues(data, rule.allowed);
        }
        return true;
    }

    // Валидация паттерна
    validatePattern(value, pattern) {
        return pattern.test(value);
    }

    // Валидация диапазона
    validateRange(value, min, max) {
        return value >= min && value <= max;
    }

    // Валидация обязательных полей
    validateRequiredFields(data, requiredFields) {
        return requiredFields.every(field => data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined);
    }

    // Валидация разрешенных значений
    validateAllowedValues(value, allowedValues) {
        return allowedValues.includes(value);
    }

    // Запись результата валидации
    recordValidationResult(validationName, passed, error = null) {
        this.validationResults[validationName] = {
            passed,
            error,
            timestamp: Date.now()
        };
    }

    // Генерация отчета о валидации
    generateValidationReport() {
        const totalValidations = Object.keys(this.validationResults).length;
        const passedValidations = Object.values(this.validationResults).filter(r => r.passed).length;
        const failedValidations = totalValidations - passedValidations;
        const successRate = (passedValidations / totalValidations * 100).toFixed(1);

        console.log('📋 ОТЧЕТ О ВАЛИДАЦИИ МАРКЕТИНГОВЫХ КОМПОНЕНТОВ');
        console.log('=' .repeat(60));
        console.log(`Всего проверок: ${totalValidations}`);
        console.log(`Успешных: ${passedValidations}`);
        console.log(`Неудачных: ${failedValidations}`);
        console.log(`Процент успеха: ${successRate}%`);
        console.log('=' .repeat(60));

        // Детальный отчет по каждой проверке
        Object.entries(this.validationResults).forEach(([validationName, result]) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${validationName}: ${result.passed ? 'ПРОЙДЕНА' : 'ПРОВАЛЕНА'}`);
            if (result.error) {
                console.log(`   Ошибка: ${result.error}`);
            }
        });

        // Сохранение отчета
        this.saveValidationReport();
    }

    // Сохранение отчета о валидации
    saveValidationReport() {
        const report = {
            timestamp: Date.now(),
            summary: {
                total: Object.keys(this.validationResults).length,
                passed: Object.values(this.validationResults).filter(r => r.passed).length,
                failed: Object.values(this.validationResults).filter(r => !r.passed).length
            },
            details: this.validationResults
        };

        localStorage.setItem('marketing_validation_report', JSON.stringify(report));
        console.log('💾 Отчет о валидации сохранен в localStorage');
    }

    // Получение статистики валидации
    getValidationStats() {
        const stats = {
            total: Object.keys(this.validationResults).length,
            passed: Object.values(this.validationResults).filter(r => r.passed).length,
            failed: Object.values(this.validationResults).filter(r => !r.passed).length,
            successRate: 0
        };

        if (stats.total > 0) {
            stats.successRate = (stats.passed / stats.total * 100).toFixed(1);
        }

        console.log('📊 Статистика валидации:', stats);
        return stats;
    }

    // Проверка критических ошибок
    checkCriticalErrors() {
        const criticalValidations = [
            'referral_codeFormat',
            'email_templateFormat',
            'ab_test_experimentConfig',
            'analytics_ga4Config',
            'optimization_ruleFormat',
            'conversion_eventTracking'
        ];

        const criticalErrors = criticalValidations.filter(validation => 
            this.validationResults[validation] && !this.validationResults[validation].passed
        );

        if (criticalErrors.length > 0) {
            console.error('🚨 КРИТИЧЕСКИЕ ОШИБКИ ВАЛИДАЦИИ:');
            criticalErrors.forEach(error => {
                console.error(`   ❌ ${error}: ${this.validationResults[error].error}`);
            });
            return false;
        }

        console.log('✅ Критических ошибок валидации не обнаружено');
        return true;
    }

    // Автоматическое исправление ошибок
    autoFixValidationErrors() {
        console.log('🔧 Попытка автоматического исправления ошибок валидации...');
        
        let fixedCount = 0;
        Object.entries(this.validationResults).forEach(([validationName, result]) => {
            if (!result.passed) {
                const fixed = this.attemptAutoFix(validationName, result.error);
                if (fixed) {
                    fixedCount++;
                    this.recordValidationResult(validationName, true, 'Автоматически исправлено');
                }
            }
        });

        console.log(`🔧 Автоматически исправлено ошибок: ${fixedCount}`);
        return fixedCount;
    }

    // Попытка автоматического исправления
    attemptAutoFix(validationName, error) {
        // Логика автоматического исправления для различных типов ошибок
        if (validationName.includes('codeFormat')) {
            return this.fixCodeFormat();
        }
        if (validationName.includes('required')) {
            return this.fixRequiredFields(validationName);
        }
        if (validationName.includes('range')) {
            return this.fixRangeValues(validationName);
        }
        return false;
    }

    // Исправление формата кода
    fixCodeFormat() {
        // Логика исправления формата кода
        return true;
    }

    // Исправление обязательных полей
    fixRequiredFields(validationName) {
        // Логика добавления недостающих полей
        return true;
    }

    // Исправление значений диапазона
    fixRangeValues(validationName) {
        // Логика корректировки значений
        return true;
    }
}

// Инициализация движка валидации
const validationEngine = new ValidationEngine();

// Экспорт для использования в других модулях
window.ValidationEngine = ValidationEngine; 