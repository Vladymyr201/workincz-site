/**
 * СИСТЕМА ОБРАТНОЙ СВЯЗИ
 * Анализ причин оттока пользователей и улучшение UX
 */

class FeedbackSystem {
    constructor() {
        this.feedbackData = [];
        this.surveyQuestions = [
            {
                id: 'satisfaction',
                question: 'Насколько вы довольны нашим сервисом?',
                type: 'rating',
                options: ['1 - Очень плохо', '2 - Плохо', '3 - Удовлетворительно', '4 - Хорошо', '5 - Отлично']
            },
            {
                id: 'ease_of_use',
                question: 'Насколько легко использовать наш сайт?',
                type: 'rating',
                options: ['1 - Очень сложно', '2 - Сложно', '3 - Нормально', '4 - Легко', '5 - Очень легко']
            },
            {
                id: 'job_search',
                question: 'Нашли ли вы подходящую вакансию?',
                type: 'choice',
                options: ['Да, нашел работу', 'Да, есть подходящие варианты', 'Нет, мало вакансий', 'Нет, не подходят условия']
            },
            {
                id: 'missing_features',
                question: 'Каких функций вам не хватает?',
                type: 'multiselect',
                options: ['Уведомления о новых вакансиях', 'Фильтры по зарплате', 'Отзывы о работодателях', 'Мобильное приложение', 'Чат с работодателем', 'Ничего не хватает']
            },
            {
                id: 'improvement_suggestions',
                question: 'Что бы вы хотели улучшить?',
                type: 'text',
                placeholder: 'Ваши предложения...'
            },
            {
                id: 'leaving_reason',
                question: 'Почему вы решили покинуть сайт?',
                type: 'choice',
                options: ['Нашел работу', 'Не подходящие вакансии', 'Сложный интерфейс', 'Медленная работа', 'Другое']
            }
        ];
    }

    // Показ модального окна обратной связи
    showFeedbackModal(trigger = 'auto') {
        const modal = this.createFeedbackModal();
        document.body.appendChild(modal);
        
        // Аналитика
        this.trackFeedbackEvent('modal_opened', { trigger });
        
        // Автоматическое закрытие через 30 секунд
        setTimeout(() => {
            if (document.body.contains(modal)) {
                this.closeFeedbackModal(modal);
            }
        }, 30000);
    }

    // Создание модального окна
    createFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Помогите нам стать лучше!</h3>
                        <button onclick="feedbackSystem.closeFeedbackModal(this.closest('.fixed'))" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="feedbackForm" class="space-y-4">
                        ${this.surveyQuestions.map((q, index) => this.renderQuestion(q, index)).join('')}
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="feedbackSystem.closeFeedbackModal(this.closest('.fixed'))" 
                                    class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                Пропустить
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Отправить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Обработка отправки формы
        const form = modal.querySelector('#feedbackForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFeedbackSubmit(form);
        });

        return modal;
    }

    // Рендеринг вопроса
    renderQuestion(question, index) {
        let inputHtml = '';
        
        switch (question.type) {
            case 'rating':
                inputHtml = `
                    <div class="flex space-x-2">
                        ${question.options.map((option, i) => `
                            <label class="flex items-center">
                                <input type="radio" name="${question.id}" value="${i + 1}" class="mr-1">
                                <span class="text-sm">${i + 1}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'choice':
                inputHtml = `
                    <div class="space-y-2">
                        ${question.options.map(option => `
                            <label class="flex items-center">
                                <input type="radio" name="${question.id}" value="${option}" class="mr-2">
                                <span class="text-sm">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'multiselect':
                inputHtml = `
                    <div class="space-y-2">
                        ${question.options.map(option => `
                            <label class="flex items-center">
                                <input type="checkbox" name="${question.id}" value="${option}" class="mr-2">
                                <span class="text-sm">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'text':
                inputHtml = `
                    <textarea name="${question.id}" placeholder="${question.placeholder}" 
                              class="w-full p-2 border border-gray-300 rounded-lg resize-none" rows="3"></textarea>
                `;
                break;
        }
        
        return `
            <div class="question-block" data-question-id="${question.id}">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    ${question.question}
                </label>
                ${inputHtml}
            </div>
        `;
    }

    // Обработка отправки обратной связи
    async handleFeedbackSubmit(form) {
        const formData = new FormData(form);
        const feedback = {
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            pageUrl: window.location.href,
            answers: {}
        };

        // Собираем ответы
        this.surveyQuestions.forEach(question => {
            if (question.type === 'multiselect') {
                const checkboxes = form.querySelectorAll(`input[name="${question.id}"]:checked`);
                feedback.answers[question.id] = Array.from(checkboxes).map(cb => cb.value);
            } else {
                const input = form.querySelector(`[name="${question.id}"]`);
                if (input) {
                    feedback.answers[question.id] = input.value;
                }
            }
        });

        // Анализ ответов
        const analysis = this.analyzeFeedback(feedback);
        feedback.analysis = analysis;

        // Сохранение
        await this.saveFeedback(feedback);
        
        // Показ благодарности
        this.showThankYouMessage(form.closest('.fixed'));
        
        // Аналитика
        this.trackFeedbackEvent('feedback_submitted', { analysis });
    }

    // Анализ обратной связи
    analyzeFeedback(feedback) {
        const analysis = {
            satisfaction: 0,
            issues: [],
            suggestions: [],
            retentionRisk: 'low',
            priority: 'low'
        };

        // Анализ удовлетворенности
        if (feedback.answers.satisfaction) {
            analysis.satisfaction = parseInt(feedback.answers.satisfaction);
            if (analysis.satisfaction <= 2) {
                analysis.retentionRisk = 'high';
                analysis.priority = 'high';
            } else if (analysis.satisfaction <= 3) {
                analysis.retentionRisk = 'medium';
                analysis.priority = 'medium';
            }
        }

        // Анализ проблем
        if (feedback.answers.leaving_reason) {
            const reason = feedback.answers.leaving_reason;
            if (reason === 'Сложный интерфейс' || reason === 'Медленная работа') {
                analysis.issues.push('usability');
                analysis.priority = 'high';
            } else if (reason === 'Не подходящие вакансии') {
                analysis.issues.push('content');
                analysis.priority = 'medium';
            }
        }

        // Анализ предложений
        if (feedback.answers.improvement_suggestions) {
            analysis.suggestions.push(feedback.answers.improvement_suggestions);
        }

        // Анализ недостающих функций
        if (feedback.answers.missing_features) {
            analysis.issues.push(...feedback.answers.missing_features);
        }

        return analysis;
    }

    // Сохранение обратной связи
    async saveFeedback(feedback) {
        try {
            // Сохранение в localStorage для демонстрации
            const existingFeedback = JSON.parse(localStorage.getItem('feedbackData') || '[]');
            existingFeedback.push(feedback);
            localStorage.setItem('feedbackData', JSON.stringify(existingFeedback));
            
            // В реальном проекте здесь был бы API запрос
            console.log('Обратная связь сохранена:', feedback);
            
            // Отправка в аналитику
            this.sendToAnalytics(feedback);
            
        } catch (error) {
            console.error('Ошибка сохранения обратной связи:', error);
        }
    }

    // Отправка в аналитику
    sendToAnalytics(feedback) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'feedback_submitted', {
                event_category: 'user_feedback',
                event_label: feedback.analysis.retentionRisk,
                value: feedback.analysis.satisfaction
            });
        }
        
        // Firebase Analytics
        if (typeof firebase !== 'undefined' && firebase.analytics) {
            firebase.analytics().logEvent('feedback_submitted', {
                satisfaction_score: feedback.analysis.satisfaction,
                retention_risk: feedback.analysis.retentionRisk,
                issues_count: feedback.analysis.issues.length
            });
        }
    }

    // Показ сообщения благодарности
    showThankYouMessage(modal) {
        const content = modal.querySelector('.bg-white');
        content.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-green-500 text-4xl mb-4">✅</div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Спасибо за обратную связь!</h3>
                <p class="text-gray-600 mb-4">Ваше мнение поможет нам стать лучше.</p>
                <button onclick="feedbackSystem.closeFeedbackModal(this.closest('.fixed'))" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Закрыть
                </button>
            </div>
        `;
    }

    // Закрытие модального окна
    closeFeedbackModal(modal) {
        if (modal && document.body.contains(modal)) {
            modal.remove();
        }
    }

    // Получение ID пользователя
    getCurrentUserId() {
        // В реальном проекте здесь была бы проверка авторизации
        return localStorage.getItem('userId') || 'anonymous';
    }

    // Получение ID сессии
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    // Отслеживание событий
    trackFeedbackEvent(event, data = {}) {
        console.log('Feedback Event:', event, data);
        
        // В реальном проекте здесь была бы отправка в аналитику
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
    }

    // Автоматический показ через определенное время
    scheduleFeedbackModal() {
        // Показываем через 2 минуты после загрузки страницы
        setTimeout(() => {
            // Проверяем, не показывали ли уже сегодня
            const lastShown = localStorage.getItem('feedbackLastShown');
            const today = new Date().toDateString();
            
            if (lastShown !== today) {
                this.showFeedbackModal('scheduled');
                localStorage.setItem('feedbackLastShown', today);
            }
        }, 120000); // 2 минуты
    }

    // Показ при попытке покинуть страницу
    setupExitIntent() {
        let showExitIntent = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !showExitIntent) {
                showExitIntent = true;
                this.showFeedbackModal('exit_intent');
            }
        });
    }

    // Инициализация системы
    init() {
        // Автоматический показ
        this.scheduleFeedbackModal();
        
        // Exit intent
        this.setupExitIntent();
        
        // Добавляем кнопку обратной связи в навигацию
        this.addFeedbackButton();
        
        console.log('✅ Система обратной связи инициализирована');
    }

    // Добавление кнопки обратной связи
    addFeedbackButton() {
        const nav = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('header');
        if (nav) {
            const button = document.createElement('button');
            button.innerHTML = '💬 Обратная связь';
            button.className = 'px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700';
            button.onclick = () => this.showFeedbackModal('manual');
            
            nav.appendChild(button);
        }
    }
}

// Глобальный экземпляр
window.feedbackSystem = new FeedbackSystem();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackSystem.init();
}); 