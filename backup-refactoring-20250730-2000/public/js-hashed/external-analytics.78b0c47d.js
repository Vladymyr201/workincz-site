/**
 * Система интеграции с внешними аналитическими сервисами
 * Google Analytics 4, Facebook Pixel, Yandex.Metrica
 */

class ExternalAnalytics {
    constructor() {
        this.config = {
            ga4: {
                measurementId: 'G-XXXXXXXXXX', // Замените на ваш ID
                enabled: true
            },
            facebook: {
                pixelId: 'XXXXXXXXXX', // Замените на ваш ID
                enabled: true
            },
            yandex: {
                counterId: 'XXXXXXXXXX', // Замените на ваш ID
                enabled: false
            }
        };
        
        this.events = [];
        this.init();
    }

    async init() {
        // Загружаем конфигурацию из Firebase
        await this.loadConfig();
        
        // Инициализируем сервисы
        this.initGoogleAnalytics();
        this.initFacebookPixel();
        this.initYandexMetrica();
        
        // Начинаем отслеживание
        this.startTracking();
    }

    async loadConfig() {
        try {
            const configDoc = await firebase.firestore().collection('analytics_config').doc('external').get();
            if (configDoc.exists) {
                this.config = { ...this.config, ...configDoc.data() };
            }
        } catch (error) {
            console.error('Ошибка загрузки конфигурации аналитики:', error);
        }
    }

    initGoogleAnalytics() {
        if (!this.config.ga4.enabled) return;

        // Загружаем Google Analytics 4
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.ga4.measurementId}`;
        document.head.appendChild(script);

        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', this.config.ga4.measurementId, {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'user_role',
                    'custom_parameter_2': 'job_type',
                    'custom_parameter_3': 'conversion_value'
                }
            });

            window.gtag = gtag;
            console.log('Google Analytics 4 инициализирован');
        };
    }

    initFacebookPixel() {
        if (!this.config.facebook.enabled) return;

        // Загружаем Facebook Pixel
        const script = document.createElement('script');
        script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${this.config.facebook.pixelId}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        // Добавляем noscript fallback
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `
            <img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=${this.config.facebook.pixelId}&ev=PageView&noscript=1"/>
        `;
        document.head.appendChild(noscript);

        console.log('Facebook Pixel инициализирован');
    }

    initYandexMetrica() {
        if (!this.config.yandex.enabled) return;

        // Загружаем Yandex.Metrica
        const script = document.createElement('script');
        script.innerHTML = `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${this.config.yandex.counterId}, "init", {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true
            });
        `;
        document.head.appendChild(script);

        // Добавляем noscript fallback
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `
            <div><img src="https://mc.yandex.ru/watch/${this.config.yandex.counterId}" style="position:absolute; left:-9999px;" alt="" /></div>
        `;
        document.head.appendChild(noscript);

        console.log('Yandex.Metrica инициализирована');
    }

    startTracking() {
        // Отслеживаем события страницы
        this.trackPageViews();
        
        // Отслеживаем пользовательские события
        this.trackUserEvents();
        
        // Отслеживаем конверсии
        this.trackConversions();
        
        // Отслеживаем ошибки
        this.trackErrors();
    }

    trackPageViews() {
        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_referrer: document.referrer
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'PageView');
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'hit', window.location.href, {
                title: document.title
            });
        }
    }

    trackUserEvents() {
        // Отслеживаем клики по кнопкам
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, [data-track]');
            if (target) {
                const eventName = target.dataset.track || 'click';
                const eventData = {
                    element: target.tagName.toLowerCase(),
                    text: target.textContent?.trim(),
                    href: target.href,
                    page: window.location.pathname
                };

                this.trackEvent(eventName, eventData);
            }
        });

        // Отслеживаем отправку форм
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const eventData = {
                form_id: form.id,
                form_action: form.action,
                page: window.location.pathname
            };

            this.trackEvent('form_submit', eventData);
        });

        // Отслеживаем скролл
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                if (scrollPercent > 25 && scrollPercent % 25 === 0) {
                    this.trackEvent('scroll', {
                        scroll_percent: scrollPercent,
                        page: window.location.pathname
                    });
                }
            }, 100);
        });
    }

    trackConversions() {
        // Отслеживаем различные типы конверсий
        const conversionTypes = [
            'registration',
            'job_application', 
            'agency_signup',
            'purchase',
            'referral_signup'
        ];

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

    recordConversion(conversionType) {
        const conversionValue = this.getConversionValue(conversionType);
        const userRole = this.getUserRole();

        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'conversion', {
                send_to: `${this.config.ga4.measurementId}/conversion`,
                value: conversionValue,
                currency: 'CZK',
                user_role: userRole,
                conversion_type: conversionType
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'Purchase', {
                value: conversionValue,
                currency: 'CZK',
                content_type: conversionType,
                content_category: userRole
            });
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'reachGoal', conversionType, {
                value: conversionValue,
                user_role: userRole
            });
        }

        console.log(`Конверсия отслежена: ${conversionType}, значение: ${conversionValue}`);
    }

    trackErrors() {
        // Отслеживаем JavaScript ошибки
        window.addEventListener('error', (e) => {
            this.trackEvent('error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                page: window.location.pathname
            });
        });

        // Отслеживаем необработанные Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('promise_rejection', {
                reason: e.reason,
                page: window.location.pathname
            });
        });
    }

    trackEvent(eventName, eventData = {}) {
        const enrichedData = {
            ...eventData,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer
        };

        // Google Analytics 4
        if (window.gtag) {
            gtag('event', eventName, enrichedData);
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'CustomEvent', {
                event_name: eventName,
                ...enrichedData
            });
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'reachGoal', eventName, enrichedData);
        }

        // Сохраняем в локальный массив для отладки
        this.events.push({
            event: eventName,
            data: enrichedData,
            timestamp: new Date()
        });

        // Ограничиваем размер массива
        if (this.events.length > 1000) {
            this.events.splice(0, 500);
        }
    }

    getConversionValue(conversionType) {
        const values = {
            registration: 100,
            job_application: 200,
            agency_signup: 500,
            purchase: 1000,
            referral_signup: 250
        };
        return values[conversionType] || 0;
    }

    getUserRole() {
        // Получаем роль пользователя
        if (firebase.auth().currentUser) {
            return localStorage.getItem('user_role') || 'authenticated';
        }
        return 'anonymous';
    }

    // Методы для настройки пользовательских параметров
    setUserProperties(properties) {
        // Google Analytics 4
        if (window.gtag) {
            gtag('config', this.config.ga4.measurementId, {
                custom_map: properties
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'CustomizeProduct', properties);
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'userParams', properties);
        }
    }

    setUserId(userId) {
        // Google Analytics 4
        if (window.gtag) {
            gtag('config', this.config.ga4.measurementId, {
                user_id: userId
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'CompleteRegistration', {
                user_id: userId
            });
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'userParams', {
                user_id: userId
            });
        }
    }

    // Методы для ecommerce отслеживания
    trackPurchase(orderId, value, currency = 'CZK', items = []) {
        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'purchase', {
                transaction_id: orderId,
                value: value,
                currency: currency,
                items: items
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'Purchase', {
                value: value,
                currency: currency,
                content_ids: items.map(item => item.id),
                content_type: 'product'
            });
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'reachGoal', 'purchase', {
                order_id: orderId,
                value: value,
                currency: currency
            });
        }
    }

    trackAddToCart(itemId, value, currency = 'CZK') {
        // Google Analytics 4
        if (window.gtag) {
            gtag('event', 'add_to_cart', {
                items: [{
                    item_id: itemId,
                    value: value,
                    currency: currency
                }]
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            fbq('track', 'AddToCart', {
                value: value,
                currency: currency,
                content_ids: [itemId],
                content_type: 'product'
            });
        }

        // Yandex.Metrica
        if (window.ym) {
            ym(this.config.yandex.counterId, 'reachGoal', 'add_to_cart', {
                item_id: itemId,
                value: value,
                currency: currency
            });
        }
    }

    // Методы для получения аналитических данных
    async getAnalyticsData(startDate, endDate) {
        // Здесь можно добавить интеграцию с API аналитических сервисов
        // для получения данных о трафике, конверсиях и т.д.
        
        return {
            period: {
                start: startDate,
                end: endDate
            },
            events: this.events.filter(event => {
                const eventDate = new Date(event.timestamp);
                return eventDate >= startDate && eventDate <= endDate;
            }),
            summary: this.generateSummary(startDate, endDate)
        };
    }

    generateSummary(startDate, endDate) {
        const periodEvents = this.events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= startDate && eventDate <= endDate;
        });

        const summary = {
            total_events: periodEvents.length,
            unique_users: new Set(periodEvents.map(e => e.data.user_id)).size,
            conversions: periodEvents.filter(e => e.event.includes('conversion')).length,
            top_events: this.getTopEvents(periodEvents),
            top_pages: this.getTopPages(periodEvents)
        };

        return summary;
    }

    getTopEvents(events) {
        const eventCounts = {};
        events.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([event, count]) => ({ event, count }));
    }

    getTopPages(events) {
        const pageCounts = {};
        events.forEach(event => {
            const page = event.data.page;
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });

        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([page, count]) => ({ page, count }));
    }

    // Методы для экспорта данных
    exportEvents(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.events, null, 2);
            case 'csv':
                return this.convertToCSV(this.events);
            default:
                return this.events;
        }
    }

    convertToCSV(events) {
        if (events.length === 0) return '';

        const headers = ['timestamp', 'event', 'page', 'user_agent'];
        const csv = [headers.join(',')];

        events.forEach(event => {
            const row = [
                event.timestamp,
                event.event,
                event.data.page,
                `"${event.data.user_agent}"`
            ];
            csv.push(row.join(','));
        });

        return csv.join('\n');
    }
}

// Инициализация внешней аналитики
let externalAnalytics;

document.addEventListener('DOMContentLoaded', () => {
    externalAnalytics = new ExternalAnalytics();
});

// Экспорт для использования в других модулях
window.externalAnalytics = externalAnalytics; 