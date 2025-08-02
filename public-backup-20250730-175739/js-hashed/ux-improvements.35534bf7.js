/**
 * МОДУЛЬ УЛУЧШЕНИЯ UX
 * Немедленные улучшения на основе анализа обратной связи
 */

class UXImprovements {
    constructor() {
        this.improvements = {
            simplifiedNavigation: false,
            performanceOptimization: false,
            mobileOptimization: false,
            searchImprovement: false,
            feedbackIntegration: false
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] UX: ${message}`);
    }

    // Инициализация всех улучшений
    init() {
        this.log('🚀 Инициализация улучшений UX...');
        
        // Применяем все улучшения
        this.simplifyNavigation();
        this.optimizePerformance();
        this.improveMobileExperience();
        this.enhanceSearch();
        this.addQuickActions();
        this.improveAccessibility();
        this.addProgressIndicators();
        
        this.log('✅ Все улучшения UX применены', 'success');
    }

    // Упрощение навигации
    simplifyNavigation() {
        this.log('🧭 Упрощение навигации...');
        
        // Создаем упрощенную навигацию
        const simplifiedNav = `
            <div class="simplified-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
                <div class="flex justify-around items-center py-2">
                    <button onclick="window.location.href='#'" class="flex flex-col items-center text-blue-600">
                        <i class="fas fa-home text-lg"></i>
                        <span class="text-xs mt-1">Главная</span>
                    </button>
                    <button onclick="openJobsPanel()" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
                        <i class="fas fa-briefcase text-lg"></i>
                        <span class="text-xs mt-1">Вакансии</span>
                    </button>
                    <button onclick="openMessagesPanel()" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
                        <i class="fas fa-comments text-lg"></i>
                        <span class="text-xs mt-1">Сообщения</span>
                    </button>
                    <button onclick="openUserProfile()" class="flex flex-col items-center text-gray-600 hover:text-blue-600">
                        <i class="fas fa-user text-lg"></i>
                        <span class="text-xs mt-1">Профиль</span>
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем в body
        document.body.insertAdjacentHTML('beforeend', simplifiedNav);
        
        // Упрощаем основную навигацию
        const mainNav = document.querySelector('nav');
        if (mainNav) {
            mainNav.classList.add('simplified');
            this.addSimplifiedStyles();
        }
        
        this.improvements.simplifiedNavigation = true;
        this.log('✅ Навигация упрощена', 'success');
    }

    // Добавление упрощенных стилей
    addSimplifiedStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .simplified-nav {
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            }
            
            .simplified-nav button {
                transition: all 0.2s ease;
            }
            
            .simplified-nav button:active {
                transform: scale(0.95);
            }
            
            .simplified nav {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .simplified .nav-item {
                border-radius: 8px;
                margin: 0 4px;
                transition: all 0.3s ease;
            }
            
            .simplified .nav-item:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    // Оптимизация производительности
    optimizePerformance() {
        this.log('⚡ Оптимизация производительности...');
        
        // Ленивая загрузка изображений
        this.lazyLoadImages();
        
        // Оптимизация анимаций
        this.optimizeAnimations();
        
        // Кэширование данных
        this.setupCaching();
        
        this.improvements.performanceOptimization = true;
        this.log('✅ Производительность оптимизирована', 'success');
    }

    // Ленивая загрузка изображений
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Оптимизация анимаций
    optimizeAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                will-change: auto;
            }
            
            .animate-optimized {
                will-change: transform, opacity;
                transform: translateZ(0);
            }
            
            .smooth-transition {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
    }

    // Настройка кэширования
    setupCaching() {
        // Кэширование в localStorage
        if (!localStorage.getItem('ux_cache_version')) {
            localStorage.setItem('ux_cache_version', Date.now().toString());
        }
        
        // Кэширование часто используемых данных
        this.cacheFrequentlyUsedData();
    }

    // Кэширование часто используемых данных
    cacheFrequentlyUsedData() {
        const cacheData = {
            userPreferences: {
                theme: 'light',
                language: 'cs',
                notifications: true
            },
            recentSearches: [],
            favoriteJobs: []
        };
        
        localStorage.setItem('ux_cache_data', JSON.stringify(cacheData));
    }

    // Улучшение мобильного опыта
    improveMobileExperience() {
        this.log('📱 Улучшение мобильного опыта...');
        
        // Добавляем мобильные жесты
        this.addMobileGestures();
        
        // Оптимизируем размеры кнопок
        this.optimizeTouchTargets();
        
        // Улучшаем скроллинг
        this.improveScrolling();
        
        this.improvements.mobileOptimization = true;
        this.log('✅ Мобильный опыт улучшен', 'success');
    }

    // Добавление мобильных жестов
    addMobileGestures() {
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const deltaY = startY - endY;
            const deltaX = startX - endX;
            
            // Свайп вверх для поиска
            if (deltaY > 50 && Math.abs(deltaX) < 50) {
                this.showQuickSearch();
            }
            
            // Свайп вниз для обновления
            if (deltaY < -50 && Math.abs(deltaX) < 50) {
                this.refreshContent();
            }
        });
    }

    // Оптимизация размеров кнопок для касания
    optimizeTouchTargets() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                button, .btn, .nav-item {
                    min-height: 44px;
                    min-width: 44px;
                    padding: 12px 16px;
                }
                
                input, select, textarea {
                    min-height: 44px;
                    font-size: 16px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Улучшение скроллинга
    improveScrolling() {
        const style = document.createElement('style');
        style.textContent = `
            html {
                scroll-behavior: smooth;
            }
            
            .smooth-scroll {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(style);
    }

    // Улучшение поиска
    enhanceSearch() {
        this.log('🔍 Улучшение поиска...');
        
        // Добавляем автодополнение
        this.addAutocomplete();
        
        // Улучшаем фильтры
        this.improveFilters();
        
        // Добавляем умный поиск
        this.addSmartSearch();
        
        this.improvements.searchImprovement = true;
        this.log('✅ Поиск улучшен', 'success');
    }

    // Добавление автодополнения
    addAutocomplete() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="поиск"], input[placeholder*="search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    this.showAutocompleteSuggestions(input, query);
                }
            });
        });
    }

    // Показ автодополнения
    showAutocompleteSuggestions(input, query) {
        const suggestions = this.getSearchSuggestions(query);
        
        // Удаляем старые подсказки
        const oldSuggestions = document.querySelector('.autocomplete-suggestions');
        if (oldSuggestions) oldSuggestions.remove();
        
        if (suggestions.length > 0) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'autocomplete-suggestions absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto';
            
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
                item.textContent = suggestion;
                item.onclick = () => {
                    input.value = suggestion;
                    suggestionsDiv.remove();
                };
                suggestionsDiv.appendChild(item);
            });
            
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(suggestionsDiv);
        }
    }

    // Получение предложений для поиска
    getSearchSuggestions(query) {
        const commonSearches = [
            'Разработчик JavaScript',
            'Менеджер проекта',
            'Дизайнер UI/UX',
            'Аналитик данных',
            'Маркетолог',
            'Продавец',
            'Водитель',
            'Повар',
            'Учитель',
            'Врач'
        ];
        
        return commonSearches.filter(search => 
            search.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    // Улучшение фильтров
    improveFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn, .filter-button');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFilter(button.dataset.filter);
            });
        });
    }

    // Применение фильтра
    applyFilter(filterType) {
        this.log(`🔧 Применение фильтра: ${filterType}`);
        
        // Показываем индикатор загрузки
        this.showLoadingIndicator();
        
        // Симуляция применения фильтра
        setTimeout(() => {
            this.hideLoadingIndicator();
            this.showSuccessMessage('Фильтр применен');
        }, 500);
    }

    // Добавление умного поиска
    addSmartSearch() {
        const searchForm = document.querySelector('form[role="search"]');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchForm.querySelector('input').value;
                this.performSmartSearch(query);
            });
        }
    }

    // Выполнение умного поиска
    performSmartSearch(query) {
        this.log(`🧠 Умный поиск: ${query}`);
        
        // Анализируем запрос
        const analysis = this.analyzeSearchQuery(query);
        
        // Выполняем поиск с учетом контекста
        this.executeContextualSearch(query, analysis);
    }

    // Анализ поискового запроса
    analyzeSearchQuery(query) {
        const analysis = {
            type: 'job',
            location: null,
            experience: null,
            salary: null
        };
        
        // Простой анализ ключевых слов
        if (query.includes('Прага') || query.includes('Praha')) {
            analysis.location = 'Прага';
        }
        
        if (query.includes('senior') || query.includes('опыт')) {
            analysis.experience = 'senior';
        }
        
        if (query.includes('€') || query.includes('CZK')) {
            analysis.salary = 'specified';
        }
        
        return analysis;
    }

    // Выполнение контекстного поиска
    executeContextualSearch(query, analysis) {
        this.log(`🔍 Контекстный поиск: ${JSON.stringify(analysis)}`);
        
        // Показываем результаты с учетом контекста
        this.showSearchResults(query, analysis);
    }

    // Показ результатов поиска
    showSearchResults(query, analysis) {
        // В реальном проекте здесь был бы API запрос
        this.log(`📋 Результаты поиска для: ${query}`);
        
        // Показываем уведомление
        this.showSuccessMessage(`Найдено результатов для "${query}"`);
    }

    // Добавление быстрых действий
    addQuickActions() {
        this.log('⚡ Добавление быстрых действий...');
        
        // Создаем панель быстрых действий
        const quickActions = `
            <div class="quick-actions fixed top-4 right-4 z-50">
                <div class="flex flex-col space-y-2">
                    <button onclick="uxImprovements.showQuickSearch()" 
                            class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                        <i class="fas fa-search"></i>
                    </button>
                    <button onclick="uxImprovements.showQuickFilters()" 
                            class="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-110">
                        <i class="fas fa-filter"></i>
                    </button>
                    <button onclick="uxImprovements.showQuickFeedback()" 
                            class="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 hover:scale-110">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', quickActions);
        
        this.log('✅ Быстрые действия добавлены', 'success');
    }

    // Показ быстрого поиска
    showQuickSearch() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-96">
                <h3 class="text-lg font-semibold mb-4">Быстрый поиск</h3>
                <input type="text" placeholder="Что ищете?" 
                       class="w-full p-3 border border-gray-300 rounded-lg mb-4" 
                       autofocus>
                <div class="flex justify-end space-x-2">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Отмена
                    </button>
                    <button onclick="uxImprovements.performQuickSearch(this.previousElementSibling.value)" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Найти
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Автозакрытие при клике вне модала
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Выполнение быстрого поиска
    performQuickSearch(query) {
        this.log(`🔍 Быстрый поиск: ${query}`);
        this.performSmartSearch(query);
        
        // Закрываем модал
        document.querySelector('.fixed').remove();
    }

    // Показ быстрых фильтров
    showQuickFilters() {
        const filters = [
            { name: 'Новые вакансии', icon: 'fas fa-star' },
            { name: 'Высокая зарплата', icon: 'fas fa-euro-sign' },
            { name: 'Удаленная работа', icon: 'fas fa-home' },
            { name: 'Полная занятость', icon: 'fas fa-clock' }
        ];
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-80">
                <h3 class="text-lg font-semibold mb-4">Быстрые фильтры</h3>
                <div class="space-y-2">
                    ${filters.map(filter => `
                        <button onclick="uxImprovements.applyQuickFilter('${filter.name}')" 
                                class="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center">
                            <i class="${filter.icon} mr-3 text-blue-600"></i>
                            ${filter.name}
                        </button>
                    `).join('')}
                </div>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Закрыть
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Применение быстрого фильтра
    applyQuickFilter(filterName) {
        this.log(`🔧 Быстрый фильтр: ${filterName}`);
        this.applyFilter(filterName.toLowerCase().replace(' ', '_'));
        
        // Закрываем модал
        document.querySelector('.fixed').remove();
    }

    // Показ быстрой обратной связи
    showQuickFeedback() {
        if (window.feedbackSystem) {
            window.feedbackSystem.showFeedbackModal('quick_action');
        } else {
            this.showSuccessMessage('Система обратной связи загружается...');
        }
    }

    // Улучшение доступности
    improveAccessibility() {
        this.log('♿ Улучшение доступности...');
        
        // Добавляем ARIA-атрибуты
        this.addARIAAttributes();
        
        // Улучшаем навигацию с клавиатуры
        this.improveKeyboardNavigation();
        
        // Добавляем высокий контраст
        this.addHighContrast();
        
        this.log('✅ Доступность улучшена', 'success');
    }

    // Добавление ARIA-атрибутов
    addARIAAttributes() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const text = button.textContent.trim();
                if (text) {
                    button.setAttribute('aria-label', text);
                }
            }
        });
        
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                const text = link.textContent.trim();
                if (text) {
                    link.setAttribute('aria-label', text);
                }
            }
        });
    }

    // Улучшение навигации с клавиатуры
    improveKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + S для поиска
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.showQuickSearch();
            }
            
            // Alt + F для фильтров
            if (e.altKey && e.key === 'f') {
                e.preventDefault();
                this.showQuickFilters();
            }
            
            // Alt + H для помощи
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }

    // Добавление высокого контраста
    addHighContrast() {
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast {
                background: #000 !important;
                color: #fff !important;
            }
            
            .high-contrast * {
                background: #000 !important;
                color: #fff !important;
                border-color: #fff !important;
            }
            
            .high-contrast button {
                background: #fff !important;
                color: #000 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Добавляем переключатель
        const toggle = document.createElement('button');
        toggle.innerHTML = '🌙';
        toggle.className = 'fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-full';
        toggle.onclick = () => document.body.classList.toggle('high-contrast');
        document.body.appendChild(toggle);
    }

    // Добавление индикаторов прогресса
    addProgressIndicators() {
        this.log('📊 Добавление индикаторов прогресса...');
        
        // Индикатор загрузки страницы
        this.addPageLoadIndicator();
        
        // Индикатор прогресса действий
        this.addActionProgressIndicator();
        
        this.log('✅ Индикаторы прогресса добавлены', 'success');
    }

    // Индикатор загрузки страницы
    addPageLoadIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'page-load-indicator fixed top-0 left-0 w-full h-1 bg-blue-600 z-50';
        indicator.style.transform = 'scaleX(0)';
        indicator.style.transformOrigin = 'left';
        indicator.style.transition = 'transform 0.3s ease';
        
        document.body.appendChild(indicator);
        
        // Анимация загрузки
        setTimeout(() => {
            indicator.style.transform = 'scaleX(1)';
        }, 100);
        
        setTimeout(() => {
            indicator.style.transform = 'scaleX(0)';
            setTimeout(() => indicator.remove(), 300);
        }, 1000);
    }

    // Индикатор прогресса действий
    addActionProgressIndicator() {
        this.showLoadingIndicator = () => {
            const indicator = document.createElement('div');
            indicator.className = 'action-progress fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg z-50';
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Загрузка...';
            indicator.id = 'action-progress';
            
            document.body.appendChild(indicator);
        };
        
        this.hideLoadingIndicator = () => {
            const indicator = document.getElementById('action-progress');
            if (indicator) {
                indicator.remove();
            }
        };
    }

    // Показ сообщений
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-50 animate-slideIn';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Показ помощи
    showHelp() {
        const helpContent = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Горячие клавиши</h3>
                    <div class="space-y-2 text-sm">
                        <div><kbd class="bg-gray-100 px-2 py-1 rounded">Alt + S</kbd> - Быстрый поиск</div>
                        <div><kbd class="bg-gray-100 px-2 py-1 rounded">Alt + F</kbd> - Быстрые фильтры</div>
                        <div><kbd class="bg-gray-100 px-2 py-1 rounded">Alt + H</kbd> - Помощь</div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', helpContent);
    }

    // Обновление контента
    refreshContent() {
        this.log('🔄 Обновление контента...');
        
        // Показываем индикатор обновления
        this.showSuccessMessage('Контент обновляется...');
        
        // Симуляция обновления
        setTimeout(() => {
            this.showSuccessMessage('Контент обновлен!');
        }, 1000);
    }

    // Открытие профиля пользователя
    openUserProfile() {
        this.log('👤 Открытие профиля пользователя...');
        
        // В реальном проекте здесь была бы навигация к профилю
        this.showSuccessMessage('Профиль пользователя');
    }
}

// Глобальный экземпляр
window.uxImprovements = new UXImprovements();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.uxImprovements.init();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXImprovements;
} 