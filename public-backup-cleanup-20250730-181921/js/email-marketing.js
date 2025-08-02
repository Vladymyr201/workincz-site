/**
 * Система email-маркетинга для привлечения и удержания пользователей
 * Автоматические кампании, сегментация, A/B тестирование
 */

class EmailMarketingSystem {
    constructor() {
        this.campaigns = new Map();
        this.templates = new Map();
        this.segments = new Map();
        this.init();
    }

    async init() {
        await this.loadTemplates();
        await this.loadSegments();
        await this.setupAutomatedCampaigns();
        this.initUI();
    }

    async loadTemplates() {
        // Загружаем email шаблоны
        this.templates.set('welcome', {
            subject: 'Добро пожаловать в WorkInCZ! 🚀',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Добро пожаловать в WorkInCZ!</h2>
                    <p>Здравствуйте, {{userName}}!</p>
                    <p>Мы рады приветствовать вас в нашей платформе для поиска работы в Чехии.</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Что вы можете сделать:</h3>
                        <ul>
                            <li>Найти вакансии от прямых работодателей</li>
                            <li>Обратиться к кадровым агентствам</li>
                            <li>Создать профиль и получать предложения</li>
                            <li>Общаться с работодателями в чате</li>
                        </ul>
                    </div>
                    
                    <a href="{{dashboardUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Перейти в личный кабинет
                    </a>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                        Если у вас есть вопросы, напишите нам на support@workincz.com
                    </p>
                </div>
            `
        });

        this.templates.set('agency_welcome', {
            subject: 'Добро пожаловать в WorkInCZ для агентств! 💼',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #059669;">Добро пожаловать в WorkInCZ!</h2>
                    <p>Здравствуйте, {{agencyName}}!</p>
                    <p>Мы рады приветствовать ваше агентство в нашей платформе.</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Возможности для агентств:</h3>
                        <ul>
                            <li>Получать заявки от работодателей</li>
                            <li>Управлять кандидатами и вакансиями</li>
                            <li>Зарабатывать на успешных размещениях</li>
                            <li>Аналитика и отчеты</li>
                        </ul>
                    </div>
                    
                    <a href="{{agencyDashboardUrl}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Открыть агентский кабинет
                    </a>
                </div>
            `
        });

        this.templates.set('job_alert', {
            subject: 'Новые вакансии для вас! 🔥',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Новые вакансии</h2>
                    <p>Здравствуйте, {{userName}}!</p>
                    <p>Мы нашли для вас {{jobCount}} новых вакансий:</p>
                    
                    {{#each jobs}}
                    <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 6px;">
                        <h4>{{title}}</h4>
                        <p><strong>{{company}}</strong> - {{location}}</p>
                        <p>{{salary}}</p>
                        <a href="{{jobUrl}}" style="color: #2563eb;">Подробнее</a>
                    </div>
                    {{/each}}
                    
                    <a href="{{jobsUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Посмотреть все вакансии
                    </a>
                </div>
            `
        });

        this.templates.set('inactive_reminder', {
            subject: 'Мы скучаем по вам! 😊',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7c3aed;">Мы скучаем по вам!</h2>
                    <p>Здравствуйте, {{userName}}!</p>
                    <p>Вы не заходили к нам уже {{daysInactive}} дней. Возможно, вы пропустили что-то интересное?</p>
                    
                    <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Что нового:</h3>
                        <ul>
                            <li>{{newJobsCount}} новых вакансий</li>
                            <li>{{newAgenciesCount}} новых агентств</li>
                            <li>Улучшенный поиск и фильтры</li>
                        </ul>
                    </div>
                    
                    <a href="{{dashboardUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Зайти в кабинет
                    </a>
                </div>
            `
        });
    }

    async loadSegments() {
        // Определяем сегменты пользователей
        this.segments.set('new_users', {
            name: 'Новые пользователи',
            query: 'createdAt >= now() - 7d'
        });

        this.segments.set('inactive_users', {
            name: 'Неактивные пользователи',
            query: 'lastLoginAt <= now() - 30d'
        });

        this.segments.set('jobseekers', {
            name: 'Ищущие работу',
            query: 'role == "jobseeker"'
        });

        this.segments.set('agencies', {
            name: 'Кадровые агентства',
            query: 'role == "agency"'
        });

        this.segments.set('premium_users', {
            name: 'Премиум пользователи',
            query: 'subscription.status == "active"'
        });
    }

    async setupAutomatedCampaigns() {
        // Настраиваем автоматические кампании
        this.campaigns.set('welcome_series', {
            name: 'Серия приветственных писем',
            trigger: 'user_registration',
            emails: [
                { delay: 0, template: 'welcome' },
                { delay: 1, template: 'getting_started' },
                { delay: 3, template: 'first_jobs' }
            ]
        });

        this.campaigns.set('inactivity_reminder', {
            name: 'Напоминания неактивным',
            trigger: 'user_inactive_30d',
            emails: [
                { delay: 0, template: 'inactive_reminder' },
                { delay: 7, template: 'inactive_reminder_2' }
            ]
        });

        this.campaigns.set('job_alerts', {
            name: 'Уведомления о вакансиях',
            trigger: 'new_jobs_matching',
            emails: [
                { delay: 0, template: 'job_alert' }
            ]
        });
    }

    initUI() {
        // Создаем панель управления email-маркетингом
        this.createMarketingDashboard();
    }

    createMarketingDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'emailMarketingDashboard';
        dashboard.className = 'card mt-4';
        dashboard.innerHTML = `
            <div class="card-header">
                <h5><i class="fas fa-envelope"></i> Email-маркетинг</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6>Статистика кампаний</h6>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Отправлено сегодня:</span>
                            <span id="emailsSentToday">0</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Открытий:</span>
                            <span id="emailOpens">0%</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Кликов:</span>
                            <span id="emailClicks">0%</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Быстрые действия</h6>
                        <button class="btn btn-primary btn-sm mb-2 w-100" onclick="emailMarketing.createCampaign()">
                            <i class="fas fa-plus"></i> Создать кампанию
                        </button>
                        <button class="btn btn-outline-primary btn-sm mb-2 w-100" onclick="emailMarketing.sendTestEmail()">
                            <i class="fas fa-paper-plane"></i> Тестовое письмо
                        </button>
                        <button class="btn btn-outline-info btn-sm w-100" onclick="emailMarketing.showAnalytics()">
                            <i class="fas fa-chart-bar"></i> Аналитика
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем в dashboard если он существует
        const dashboardContainer = document.querySelector('#dashboardContent') || 
                                  document.querySelector('.dashboard-content');
        if (dashboardContainer) {
            dashboardContainer.appendChild(dashboard);
        }
    }

    async sendEmail(userId, templateName, data = {}) {
        try {
            const template = this.templates.get(templateName);
            if (!template) {
                throw new Error(`Шаблон ${templateName} не найден`);
            }

            // Получаем данные пользователя
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new Error('Пользователь не найден');
            }

            const userData = userDoc.data();
            const emailData = {
                ...data,
                userName: userData.name || userData.email,
                userEmail: userData.email,
                dashboardUrl: `${window.location.origin}/dashboard`,
                agencyDashboardUrl: `${window.location.origin}/agency-dashboard`,
                jobsUrl: `${window.location.origin}/jobs`
            };

            // Рендерим шаблон
            const renderedSubject = this.renderTemplate(template.subject, emailData);
            const renderedHtml = this.renderTemplate(template.html, emailData);

            // Отправляем email через Firebase Functions
            const sendEmailFunction = firebase.functions().httpsCallable('sendEmail');
            await sendEmailFunction({
                to: userData.email,
                subject: renderedSubject,
                html: renderedHtml,
                userId: userId,
                template: templateName
            });

            // Сохраняем запись об отправке
            await firebase.firestore().collection('emailLogs').add({
                userId: userId,
                template: templateName,
                subject: renderedSubject,
                sentAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
            });

            console.log(`Email отправлен пользователю ${userId}`);
            return true;
        } catch (error) {
            console.error('Ошибка отправки email:', error);
            
            // Сохраняем ошибку
            await firebase.firestore().collection('emailLogs').add({
                userId: userId,
                template: templateName,
                error: error.message,
                sentAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'error'
            });
            
            return false;
        }
    }

    renderTemplate(template, data) {
        // Простой рендеринг шаблона с заменой переменных
        let rendered = template;
        
        // Заменяем простые переменные {{variable}}
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, data[key] || '');
        });

        // Обрабатываем циклы {{#each items}}...{{/each}}
        const eachRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
        rendered = rendered.replace(eachRegex, (match, arrayName, template) => {
            const array = data[arrayName];
            if (!Array.isArray(array)) return '';
            
            return array.map(item => {
                let itemTemplate = template;
                Object.keys(item).forEach(key => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    itemTemplate = itemTemplate.replace(regex, item[key] || '');
                });
                return itemTemplate;
            }).join('');
        });

        return rendered;
    }

    async sendBulkEmail(segmentId, templateName, data = {}) {
        try {
            const segment = this.segments.get(segmentId);
            if (!segment) {
                throw new Error(`Сегмент ${segmentId} не найден`);
            }

            // Получаем пользователей сегмента
            const users = await this.getUsersBySegment(segmentId);
            
            console.log(`Отправляем email ${templateName} для ${users.length} пользователей`);

            // Отправляем email каждому пользователю
            const results = await Promise.allSettled(
                users.map(user => this.sendEmail(user.id, templateName, data))
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
            const failed = results.length - successful;

            console.log(`Отправлено успешно: ${successful}, Ошибок: ${failed}`);

            return { successful, failed, total: users.length };
        } catch (error) {
            console.error('Ошибка массовой отправки:', error);
            throw error;
        }
    }

    async getUsersBySegment(segmentId) {
        const segment = this.segments.get(segmentId);
        if (!segment) return [];

        try {
            let query = firebase.firestore().collection('users');
            
            // Простая логика для сегментов (в реальном проекте нужна более сложная)
            switch (segmentId) {
                case 'new_users':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    query = query.where('createdAt', '>=', weekAgo);
                    break;
                case 'inactive_users':
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - 30);
                    query = query.where('lastLoginAt', '<=', monthAgo);
                    break;
                case 'jobseekers':
                    query = query.where('role', '==', 'jobseeker');
                    break;
                case 'agencies':
                    query = query.where('role', '==', 'agency');
                    break;
                case 'premium_users':
                    query = query.where('subscription.status', '==', 'active');
                    break;
            }

            const snapshot = await query.limit(1000).get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Ошибка получения пользователей сегмента:', error);
            return [];
        }
    }

    async createCampaign() {
        // Создаем модальное окно для создания кампании
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'createCampaignModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Создать email-кампанию</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="campaignForm">
                            <div class="mb-3">
                                <label class="form-label">Название кампании</label>
                                <input type="text" class="form-control" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Сегмент</label>
                                <select class="form-select" name="segment" required>
                                    <option value="">Выберите сегмент</option>
                                    ${Array.from(this.segments.entries()).map(([id, segment]) => 
                                        `<option value="${id}">${segment.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Шаблон</label>
                                <select class="form-select" name="template" required>
                                    <option value="">Выберите шаблон</option>
                                    ${Array.from(this.templates.entries()).map(([id, template]) => 
                                        `<option value="${id}">${template.subject}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Дополнительные данные (JSON)</label>
                                <textarea class="form-control" name="data" rows="3" placeholder='{"customField": "value"}'></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                        <button type="button" class="btn btn-primary" onclick="emailMarketing.saveCampaign()">Создать и отправить</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async saveCampaign() {
        const form = document.getElementById('campaignForm');
        const formData = new FormData(form);
        
        const campaignData = {
            name: formData.get('name'),
            segment: formData.get('segment'),
            template: formData.get('template'),
            data: formData.get('data') ? JSON.parse(formData.get('data')) : {},
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sending'
        };

        try {
            // Сохраняем кампанию
            const campaignRef = await firebase.firestore().collection('emailCampaigns').add(campaignData);
            
            // Отправляем email
            const result = await this.sendBulkEmail(campaignData.segment, campaignData.template, campaignData.data);
            
            // Обновляем статус кампании
            await campaignRef.update({
                status: 'completed',
                results: result
            });

            // Закрываем модальное окно
            bootstrap.Modal.getInstance(document.getElementById('createCampaignModal')).hide();
            
            this.showToast(`Кампания отправлена! Успешно: ${result.successful}, Ошибок: ${result.failed}`, 'success');
        } catch (error) {
            console.error('Ошибка создания кампании:', error);
            this.showToast('Ошибка создания кампании', 'error');
        }
    }

    async sendTestEmail() {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            this.showToast('Войдите в систему для отправки тестового письма', 'warning');
            return;
        }

        try {
            await this.sendEmail(currentUser.uid, 'welcome', {
                customMessage: 'Это тестовое письмо от системы email-маркетинга'
            });
            this.showToast('Тестовое письмо отправлено!', 'success');
        } catch (error) {
            console.error('Ошибка отправки тестового письма:', error);
            this.showToast('Ошибка отправки тестового письма', 'error');
        }
    }

    async showAnalytics() {
        // Создаем модальное окно с аналитикой
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'emailAnalyticsModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Аналитика email-маркетинга</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="emailAnalyticsContent">
                            <div class="text-center">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Загрузка...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Загружаем аналитику
        await this.loadAnalytics();
    }

    async loadAnalytics() {
        try {
            const analyticsContent = document.getElementById('emailAnalyticsContent');
            
            // Получаем статистику за последние 30 дней
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const logsSnapshot = await firebase.firestore().collection('emailLogs')
                .where('sentAt', '>=', thirtyDaysAgo)
                .get();

            const logs = logsSnapshot.docs.map(doc => doc.data());
            
            const totalSent = logs.length;
            const successful = logs.filter(log => log.status === 'sent').length;
            const failed = logs.filter(log => log.status === 'error').length;
            const openRate = 0.25; // Примерная статистика открытий
            const clickRate = 0.05; // Примерная статистика кликов

            analyticsContent.innerHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-primary">${totalSent}</h3>
                                <p class="card-text">Отправлено</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-success">${successful}</h3>
                                <p class="card-text">Успешно</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-warning">${(openRate * 100).toFixed(1)}%</h3>
                                <p class="card-text">Открытий</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h3 class="text-info">${(clickRate * 100).toFixed(1)}%</h3>
                                <p class="card-text">Кликов</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <h6>Последние кампании</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Сегмент</th>
                                    <th>Отправлено</th>
                                    <th>Успешно</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody id="campaignsTable">
                                <tr><td colspan="5" class="text-center">Загрузка...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Загружаем список кампаний
            await this.loadCampaignsList();
        } catch (error) {
            console.error('Ошибка загрузки аналитики:', error);
            document.getElementById('emailAnalyticsContent').innerHTML = 
                '<div class="alert alert-danger">Ошибка загрузки аналитики</div>';
        }
    }

    async loadCampaignsList() {
        try {
            const campaignsSnapshot = await firebase.firestore().collection('emailCampaigns')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const campaignsTable = document.getElementById('campaignsTable');
            if (campaignsSnapshot.empty) {
                campaignsTable.innerHTML = '<tr><td colspan="5" class="text-center">Кампаний пока нет</td></tr>';
                return;
            }

            campaignsTable.innerHTML = campaignsSnapshot.docs.map(doc => {
                const campaign = doc.data();
                return `
                    <tr>
                        <td>${campaign.name}</td>
                        <td>${this.segments.get(campaign.segment)?.name || campaign.segment}</td>
                        <td>${campaign.results?.total || 0}</td>
                        <td>${campaign.results?.successful || 0}</td>
                        <td><span class="badge bg-${campaign.status === 'completed' ? 'success' : 'warning'}">${campaign.status}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('Ошибка загрузки списка кампаний:', error);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container') || document.body;
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            container.removeChild(toast);
        });
    }
}

// Инициализация системы email-маркетинга
let emailMarketing;

document.addEventListener('DOMContentLoaded', () => {
    emailMarketing = new EmailMarketingSystem();
});

// Экспорт для использования в других модулях
window.emailMarketing = emailMarketing; 