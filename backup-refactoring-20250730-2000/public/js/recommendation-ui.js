/**
 * UI компоненты для системы рекомендаций
 * Отображение персонализированных рекомендаций с интерактивными элементами
 */

class RecommendationUI {
    constructor(recommendationEngine) {
        this.engine = recommendationEngine;
        this.currentRecommendations = [];
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация UI компонентов
     */
    init() {
        this.createRecommendationWidget();
        this.setupEventListeners();
        console.log('🎨 UI рекомендаций инициализирован');
    }

    /**
     * Создание виджета рекомендаций
     */
    createRecommendationWidget() {
        const widget = document.createElement('div');
        widget.id = 'recommendationWidget';
        widget.className = 'fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-hidden transition-all duration-300 transform translate-y-full';
        widget.style.zIndex = '1000';

        widget.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                    <span class="mr-2">🎯</span>
                    Персональные рекомендации
                </h3>
                <button id="closeRecommendations" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div id="recommendationContent" class="space-y-3 max-h-64 overflow-y-auto">
                <div class="text-center text-gray-500 py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p>Анализируем ваши предпочтения...</p>
                </div>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-200">
                <button id="refreshRecommendations" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors text-sm">
                    Обновить рекомендации
                </button>
            </div>
        `;

        document.body.appendChild(widget);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка закрытия
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeRecommendations') {
                this.hide();
            }
        });

        // Кнопка обновления
        document.addEventListener('click', (e) => {
            if (e.target.id === 'refreshRecommendations') {
                this.refreshRecommendations();
            }
        });

        // Обратная связь по рекомендациям
        document.addEventListener('click', (e) => {
            if (e.target.closest('.recommendation-feedback')) {
                const button = e.target.closest('.recommendation-feedback');
                const jobId = button.dataset.jobId;
                const feedback = button.dataset.feedback;
                this.handleFeedback(jobId, feedback);
            }
        });

        // Клики по карточкам вакансий
        document.addEventListener('click', (e) => {
            if (e.target.closest('.recommendation-job-card')) {
                const card = e.target.closest('.recommendation-job-card');
                const jobId = card.dataset.jobId;
                this.handleJobClick(jobId);
            }
        });
    }

    /**
     * Показать виджет рекомендаций
     */
    show() {
        const widget = document.getElementById('recommendationWidget');
        if (widget) {
            widget.classList.remove('translate-y-full');
            this.isVisible = true;
            this.loadRecommendations();
        }
    }

    /**
     * Скрыть виджет рекомендаций
     */
    hide() {
        const widget = document.getElementById('recommendationWidget');
        if (widget) {
            widget.classList.add('translate-y-full');
            this.isVisible = false;
        }
    }

    /**
     * Загрузка рекомендаций
     */
    async loadRecommendations() {
        const content = document.getElementById('recommendationContent');
        if (!content) return;

        // Показываем индикатор загрузки
        content.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p>Анализируем ваши предпочтения...</p>
            </div>
        `;

        try {
            // Получаем рекомендации
            const userId = this.engine.getCurrentUserId();
            const recommendations = this.engine.generateRecommendations(userId, 5);
            
            // Получаем данные вакансий
            const jobData = await this.getJobData(recommendations.map(r => r.jobId));
            
            this.currentRecommendations = recommendations;
            this.renderRecommendations(recommendations, jobData);
        } catch (error) {
            console.error('Ошибка загрузки рекомендаций:', error);
            content.innerHTML = `
                <div class="text-center text-red-500 py-8">
                    <p>Ошибка загрузки рекомендаций</p>
                    <button onclick="recommendationUI.refreshRecommendations()" class="mt-2 text-blue-500 hover:underline">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    /**
     * Получение данных вакансий
     */
    async getJobData(jobIds) {
        // В реальном приложении здесь был бы API запрос
        // Для демонстрации используем моковые данные
        const mockJobs = {
            'job-1': {
                id: 'job-1',
                title: 'Frontend Developer',
                company: 'TechCorp',
                location: 'Prague',
                salary: '50,000 CZK',
                skills: ['JavaScript', 'React', 'TypeScript'],
                matchScore: 0.95
            },
            'job-2': {
                id: 'job-2',
                title: 'Backend Developer',
                company: 'DataSoft',
                location: 'Brno',
                salary: '45,000 CZK',
                skills: ['Node.js', 'Python', 'PostgreSQL'],
                matchScore: 0.87
            },
            'job-3': {
                id: 'job-3',
                title: 'UX Designer',
                company: 'DesignLab',
                location: 'Prague',
                salary: '40,000 CZK',
                skills: ['Figma', 'Adobe XD', 'User Research'],
                matchScore: 0.78
            }
        };

        return jobIds.reduce((acc, jobId) => {
            if (mockJobs[jobId]) {
                acc[jobId] = mockJobs[jobId];
            }
            return acc;
        }, {});
    }

    /**
     * Отображение рекомендаций
     */
    renderRecommendations(recommendations, jobData) {
        const content = document.getElementById('recommendationContent');
        if (!content) return;

        if (recommendations.length === 0) {
            content.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <p>Пока нет рекомендаций</p>
                    <p class="text-sm mt-1">Просматривайте вакансии для получения персонализированных предложений</p>
                </div>
            `;
            return;
        }

        const recommendationsHTML = recommendations.map(rec => {
            const job = jobData[rec.jobId];
            if (!job) return '';

            const matchPercentage = Math.round(rec.matchScore * 100);
            const matchColor = matchPercentage >= 80 ? 'text-green-600' : 
                              matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-600';

            return `
                <div class="recommendation-job-card bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors" data-job-id="${job.id}">
                    <div class="flex items-start justify-between mb-2">
                        <h4 class="font-medium text-gray-800 text-sm leading-tight">${job.title}</h4>
                        <span class="text-xs font-semibold ${matchColor}">${matchPercentage}%</span>
                    </div>
                    
                    <p class="text-xs text-gray-600 mb-2">${job.company} • ${job.location}</p>
                    
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${job.skills.slice(0, 3).map(skill => 
                            `<span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${skill}</span>`
                        ).join('')}
                        ${job.skills.length > 3 ? `<span class="text-xs text-gray-500">+${job.skills.length - 3}</span>` : ''}
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-medium text-gray-700">${job.salary}</span>
                        
                        <div class="flex space-x-1">
                            <button class="recommendation-feedback text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors" 
                                    data-job-id="${job.id}" data-feedback="positive" title="Нравится">
                                👍
                            </button>
                            <button class="recommendation-feedback text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors" 
                                    data-job-id="${job.id}" data-feedback="negative" title="Не нравится">
                                👎
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = recommendationsHTML;
    }

    /**
     * Обновление рекомендаций
     */
    refreshRecommendations() {
        this.loadRecommendations();
    }

    /**
     * Обработка обратной связи
     */
    handleFeedback(jobId, feedback) {
        const userId = this.engine.getCurrentUserId();
        this.engine.recordFeedback(userId, jobId, feedback);

        // Визуальная обратная связь
        const button = document.querySelector(`[data-job-id="${jobId}"][data-feedback="${feedback}"]`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = feedback === 'positive' ? '✅' : '❌';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }

        // Показываем уведомление
        this.showNotification(
            feedback === 'positive' ? 'Спасибо! Мы учтем ваши предпочтения' : 'Понятно, будем учитывать это в будущем',
            feedback === 'positive' ? 'success' : 'info'
        );
    }

    /**
     * Обработка клика по вакансии
     */
    handleJobClick(jobId) {
        // В реальном приложении здесь был бы переход к детальной странице вакансии
        console.log('Клик по вакансии:', jobId);
        
        // Показываем уведомление
        this.showNotification('Переход к вакансии...', 'info');
        
        // Здесь можно добавить логику перехода к вакансии
        // window.location.href = `/job/${jobId}`;
    }

    /**
     * Показ уведомления
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white text-sm z-50 transition-all duration-300 transform translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.className += ' bg-green-500';
                break;
            case 'error':
                notification.className += ' bg-red-500';
                break;
            default:
                notification.className += ' bg-blue-500';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Создание кнопки для открытия рекомендаций
     */
    createRecommendationButton() {
        const button = document.createElement('button');
        button.id = 'openRecommendations';
        button.className = 'fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
        `;
        button.title = 'Персональные рекомендации';

        button.addEventListener('click', () => {
            this.show();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку рекомендаций в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const recommendationNavItem = document.createElement('div');
            recommendationNavItem.className = 'flex items-center space-x-2';
            recommendationNavItem.innerHTML = `
                <button id="navRecommendations" class="text-gray-600 hover:text-blue-500 transition-colors flex items-center space-x-1">
                    <span>🎯</span>
                    <span class="hidden md:inline">Рекомендации</span>
                </button>
            `;
            
            nav.appendChild(recommendationNavItem);
            
            document.getElementById('navRecommendations').addEventListener('click', () => {
                this.show();
            });
        }

        // Создаем плавающую кнопку
        this.createRecommendationButton();
    }

    /**
     * Получение статистики рекомендаций
     */
    getStats() {
        return this.engine.getRecommendationStats();
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим UI рекомендаций');
        
        // Генерируем тестовые рекомендации
        const testRecommendations = this.engine.enableTestMode();
        
        // Создаем тестовые данные вакансий
        const testJobData = {
            'job-1': {
                id: 'job-1',
                title: 'Frontend Developer',
                company: 'TechCorp',
                location: 'Prague',
                salary: '50,000 CZK',
                skills: ['JavaScript', 'React', 'TypeScript'],
                matchScore: 0.95
            },
            'job-2': {
                id: 'job-2',
                title: 'Backend Developer',
                company: 'DataSoft',
                location: 'Brno',
                salary: '45,000 CZK',
                skills: ['Node.js', 'Python', 'PostgreSQL'],
                matchScore: 0.87
            },
            'job-3': {
                id: 'job-3',
                title: 'UX Designer',
                company: 'DesignLab',
                location: 'Prague',
                salary: '40,000 CZK',
                skills: ['Figma', 'Adobe XD', 'User Research'],
                matchScore: 0.78
            }
        };

        this.currentRecommendations = testRecommendations;
        this.renderRecommendations(testRecommendations, testJobData);
        
        // Показываем виджет
        this.show();
    }
}

// Экспорт для использования в других модулях
window.RecommendationUI = RecommendationUI; 