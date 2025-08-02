/**
 * Система A/B тестирования для оптимизации конверсий
 * Поддерживает эксперименты, вариации, статистику и автоматические решения
 */

class ABTestingSystem {
    constructor() {
        this.experiments = new Map();
        this.currentUser = null;
        this.userVariations = new Map();
        this.init();
    }

    async init() {
        // Загружаем эксперименты
        await this.loadExperiments();
        
        // Инициализируем эксперименты для текущего пользователя
        await this.initializeUserExperiments();
        
        // Начинаем отслеживание
        this.startTracking();
    }

    async loadExperiments() {
        // Загружаем активные эксперименты из Firebase
        try {
            const experimentsSnapshot = await firebase.firestore().collection('ab_experiments')
                .where('status', '==', 'active')
                .get();

            experimentsSnapshot.forEach(doc => {
                const experiment = doc.data();
                this.experiments.set(doc.id, {
                    id: doc.id,
                    ...experiment
                });
            });

            console.log(`Загружено ${this.experiments.size} активных экспериментов`);
        } catch (error) {
            console.error('Ошибка загрузки экспериментов:', error);
        }
    }

    async initializeUserExperiments() {
        // Получаем или создаем ID пользователя
        this.currentUser = this.getUserId();
        
        // Загружаем вариации пользователя
        await this.loadUserVariations();
        
        // Применяем вариации к UI
        this.applyVariations();
    }

    getUserId() {
        // Используем Firebase Auth или создаем анонимный ID
        if (firebase.auth().currentUser) {
            return firebase.auth().currentUser.uid;
        }
        
        // Создаем анонимный ID для неавторизованных пользователей
        let anonymousId = localStorage.getItem('ab_anonymous_id');
        if (!anonymousId) {
            anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ab_anonymous_id', anonymousId);
        }
        
        return anonymousId;
    }

    async loadUserVariations() {
        try {
            const userDoc = await firebase.firestore().collection('ab_user_variations')
                .doc(this.currentUser)
                .get();

            if (userDoc.exists) {
                const data = userDoc.data();
                Object.keys(data.variations).forEach(experimentId => {
                    this.userVariations.set(experimentId, data.variations[experimentId]);
                });
            } else {
                // Создаем новые вариации для пользователя
                await this.createUserVariations();
            }
        } catch (error) {
            console.error('Ошибка загрузки вариаций пользователя:', error);
        }
    }

    async createUserVariations() {
        const variations = {};
        
        // Для каждого эксперимента назначаем вариацию
        for (const [experimentId, experiment] of this.experiments) {
            const variation = this.assignVariation(experiment);
            variations[experimentId] = variation;
            this.userVariations.set(experimentId, variation);
        }

        // Сохраняем в Firebase
        try {
            await firebase.firestore().collection('ab_user_variations').doc(this.currentUser).set({
                userId: this.currentUser,
                variations: variations,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Ошибка сохранения вариаций пользователя:', error);
        }
    }

    assignVariation(experiment) {
        // Простое распределение по весам
        const weights = experiment.variations.map(v => v.weight || 1);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const random = Math.random() * totalWeight;
        
        let currentWeight = 0;
        for (let i = 0; i < experiment.variations.length; i++) {
            currentWeight += weights[i];
            if (random <= currentWeight) {
                return experiment.variations[i].id;
            }
        }
        
        // Fallback на первую вариацию
        return experiment.variations[0].id;
    }

    applyVariations() {
        // Применяем вариации к UI
        for (const [experimentId, variationId] of this.userVariations) {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) continue;

            const variation = experiment.variations.find(v => v.id === variationId);
            if (!variation) continue;

            this.applyVariationToUI(experiment, variation);
        }
    }

    applyVariationToUI(experiment, variation) {
        switch (experiment.type) {
            case 'button_text':
                this.applyButtonTextVariation(experiment, variation);
                break;
            case 'page_layout':
                this.applyLayoutVariation(experiment, variation);
                break;
            case 'pricing':
                this.applyPricingVariation(experiment, variation);
                break;
            case 'cta_position':
                this.applyCTAPositionVariation(experiment, variation);
                break;
            case 'color_scheme':
                this.applyColorVariation(experiment, variation);
                break;
            default:
                console.warn(`Неизвестный тип эксперимента: ${experiment.type}`);
        }
    }

    applyButtonTextVariation(experiment, variation) {
        const elements = document.querySelectorAll(experiment.selector);
        elements.forEach(element => {
            element.textContent = variation.value;
            element.setAttribute('data-ab-variation', variation.id);
        });
    }

    applyLayoutVariation(experiment, variation) {
        const container = document.querySelector(experiment.selector);
        if (!container) return;

        // Применяем CSS классы или стили
        if (variation.cssClass) {
            container.className += ' ' + variation.cssClass;
        }
        if (variation.styles) {
            Object.assign(container.style, variation.styles);
        }
    }

    applyPricingVariation(experiment, variation) {
        const priceElements = document.querySelectorAll(experiment.selector);
        priceElements.forEach(element => {
            element.textContent = variation.value;
            element.setAttribute('data-ab-variation', variation.id);
        });
    }

    applyCTAPositionVariation(experiment, variation) {
        const ctaElement = document.querySelector(experiment.selector);
        if (!ctaElement) return;

        const newPosition = document.querySelector(variation.value);
        if (newPosition) {
            newPosition.appendChild(ctaElement);
        }
    }

    applyColorVariation(experiment, variation) {
        const elements = document.querySelectorAll(experiment.selector);
        elements.forEach(element => {
            if (variation.backgroundColor) {
                element.style.backgroundColor = variation.backgroundColor;
            }
            if (variation.color) {
                element.style.color = variation.color;
            }
            if (variation.borderColor) {
                element.style.borderColor = variation.borderColor;
            }
        });
    }

    startTracking() {
        // Отслеживаем конверсии
        this.trackConversions();
        
        // Отслеживаем клики по элементам с вариациями
        this.trackClicks();
        
        // Отслеживаем время на странице
        this.trackEngagement();
    }

    trackConversions() {
        // Отслеживаем различные типы конверсий
        const conversionTypes = ['registration', 'job_application', 'agency_signup', 'purchase'];
        
        conversionTypes.forEach(type => {
            this.trackConversion(type, () => {
                return document.querySelector(`[data-conversion="${type}"]`) !== null;
            });
        });
    }

    trackConversion(conversionType, condition) {
        const checkConversion = () => {
            if (condition() && !this.conversions.includes(conversionType)) {
                this.conversions.push(conversionType);
                this.recordConversion(conversionType);
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

    async recordConversion(conversionType) {
        try {
            // Записываем конверсию в Firebase
            await firebase.firestore().collection('ab_conversions').add({
                userId: this.currentUser,
                conversionType: conversionType,
                experiments: Array.from(this.userVariations.entries()).map(([experimentId, variationId]) => ({
                    experimentId: experimentId,
                    variationId: variationId
                })),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });

            // Отправляем в Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ab_conversion', {
                    'experiment_id': Array.from(this.userVariations.keys()).join(','),
                    'conversion_type': conversionType
                });
            }

            // Отправляем в Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Purchase', {
                    value: this.getConversionValue(conversionType),
                    currency: 'CZK',
                    experiment_id: Array.from(this.userVariations.keys()).join(',')
                });
            }

        } catch (error) {
            console.error('Ошибка записи конверсии:', error);
        }
    }

    getConversionValue(conversionType) {
        const values = {
            registration: 100,
            job_application: 200,
            agency_signup: 500,
            purchase: 1000
        };
        return values[conversionType] || 0;
    }

    trackClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-ab-variation]');
            if (target) {
                const variationId = target.getAttribute('data-ab-variation');
                const experimentId = this.findExperimentByVariation(variationId);
                
                if (experimentId) {
                    this.recordClick(experimentId, variationId, target);
                }
            }
        });
    }

    findExperimentByVariation(variationId) {
        for (const [experimentId, experiment] of this.experiments) {
            if (experiment.variations.some(v => v.id === variationId)) {
                return experimentId;
            }
        }
        return null;
    }

    async recordClick(experimentId, variationId, element) {
        try {
            await firebase.firestore().collection('ab_clicks').add({
                userId: this.currentUser,
                experimentId: experimentId,
                variationId: variationId,
                elementText: element.textContent,
                elementTag: element.tagName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                url: window.location.href
            });
        } catch (error) {
            console.error('Ошибка записи клика:', error);
        }
    }

    trackEngagement() {
        let startTime = Date.now();
        
        // Отслеживаем время на странице
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - startTime;
            this.recordEngagement(timeOnPage);
        });

        // Отслеживаем скролл
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }
        });

        // Записываем engagement при уходе со страницы
        window.addEventListener('beforeunload', () => {
            this.recordEngagement(null, maxScroll);
        });
    }

    async recordEngagement(timeOnPage, scrollPercent) {
        try {
            await firebase.firestore().collection('ab_engagement').add({
                userId: this.currentUser,
                experiments: Array.from(this.userVariations.entries()).map(([experimentId, variationId]) => ({
                    experimentId: experimentId,
                    variationId: variationId
                })),
                timeOnPage: timeOnPage,
                scrollPercent: scrollPercent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                url: window.location.href
            });
        } catch (error) {
            console.error('Ошибка записи engagement:', error);
        }
    }

    // Методы для создания экспериментов
    async createExperiment(experimentData) {
        try {
            const docRef = await firebase.firestore().collection('ab_experiments').add({
                ...experimentData,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Обновляем локальный кэш
            this.experiments.set(docRef.id, {
                id: docRef.id,
                ...experimentData,
                status: 'active'
            });

            return docRef.id;
        } catch (error) {
            console.error('Ошибка создания эксперимента:', error);
            throw error;
        }
    }

    // Методы для анализа результатов
    async getExperimentResults(experimentId) {
        try {
            const experiment = this.experiments.get(experimentId);
            if (!experiment) return null;

            // Получаем данные о конверсиях
            const conversionsSnapshot = await firebase.firestore().collection('ab_conversions')
                .where('experiments', 'array-contains', { experimentId: experimentId })
                .get();

            const conversions = conversionsSnapshot.docs.map(doc => doc.data());

            // Получаем данные о кликах
            const clicksSnapshot = await firebase.firestore().collection('ab_clicks')
                .where('experimentId', '==', experimentId)
                .get();

            const clicks = clicksSnapshot.docs.map(doc => doc.data());

            // Анализируем результаты
            return this.analyzeResults(experiment, conversions, clicks);
        } catch (error) {
            console.error('Ошибка получения результатов эксперимента:', error);
            return null;
        }
    }

    analyzeResults(experiment, conversions, clicks) {
        const results = {
            experimentId: experiment.id,
            experimentName: experiment.name,
            totalUsers: 0,
            variations: {}
        };

        // Инициализируем структуру для вариаций
        experiment.variations.forEach(variation => {
            results.variations[variation.id] = {
                name: variation.name,
                users: 0,
                conversions: 0,
                clicks: 0,
                conversionRate: 0,
                clickRate: 0
            };
        });

        // Подсчитываем пользователей
        const userVariationsSnapshot = firebase.firestore().collection('ab_user_variations')
            .where(`variations.${experiment.id}`, '!=', null)
            .get();

        // Анализируем конверсии
        conversions.forEach(conversion => {
            const variation = conversion.experiments.find(e => e.experimentId === experiment.id);
            if (variation) {
                results.variations[variation.variationId].conversions++;
            }
        });

        // Анализируем клики
        clicks.forEach(click => {
            results.variations[click.variationId].clicks++;
        });

        // Вычисляем метрики
        Object.values(results.variations).forEach(variation => {
            if (variation.users > 0) {
                variation.conversionRate = (variation.conversions / variation.users) * 100;
                variation.clickRate = (variation.clicks / variation.users) * 100;
            }
        });

        return results;
    }

    // Методы для автоматических решений
    async getWinningVariation(experimentId) {
        const results = await this.getExperimentResults(experimentId);
        if (!results) return null;

        let winningVariation = null;
        let bestConversionRate = 0;

        Object.values(results.variations).forEach(variation => {
            if (variation.conversionRate > bestConversionRate && variation.users >= 100) {
                bestConversionRate = variation.conversionRate;
                winningVariation = variation;
            }
        });

        return winningVariation;
    }

    async autoOptimize() {
        for (const [experimentId, experiment] of this.experiments) {
            const winningVariation = await this.getWinningVariation(experimentId);
            
            if (winningVariation && winningVariation.conversionRate > 5) {
                // Автоматически применяем выигрышную вариацию
                await this.applyWinningVariation(experimentId, winningVariation);
            }
        }
    }

    async applyWinningVariation(experimentId, winningVariation) {
        try {
            // Обновляем эксперимент
            await firebase.firestore().collection('ab_experiments').doc(experimentId).update({
                winningVariation: winningVariation.name,
                optimizedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'optimized'
            });

            console.log(`Эксперимент ${experimentId} оптимизирован: ${winningVariation.name}`);
        } catch (error) {
            console.error('Ошибка применения выигрышной вариации:', error);
        }
    }
}

// Инициализация системы A/B тестирования
let abTesting;

document.addEventListener('DOMContentLoaded', () => {
    abTesting = new ABTestingSystem();
});

// Экспорт для использования в других модулях
window.abTesting = abTesting; 