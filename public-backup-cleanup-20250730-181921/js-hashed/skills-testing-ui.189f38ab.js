/**
 * UI компоненты для системы тестирования навыков
 * Интерфейс для прохождения тестов, просмотра результатов и сертификатов
 */

class SkillsTestingUI {
    constructor(skillsTestingSystem) {
        this.skillsTestingSystem = skillsTestingSystem;
        this.currentSession = null;
        this.currentQuestionIndex = 0;
        this.testTimer = null;
        this.init();
    }

    /**
     * Инициализация UI
     */
    init() {
        this.createUI();
        this.setupEventListeners();
        console.log('🎨 UI системы тестирования навыков инициализирован');
    }

    /**
     * Создание UI элементов
     */
    createUI() {
        // Создаем панель тестирования
        this.createTestingPanel();
        
        // Создаем модал теста
        this.createTestModal();
        
        // Создаем панель результатов
        this.createResultsPanel();
        
        // Создаем панель сертификатов
        this.createCertificatesPanel();
    }

    /**
     * Создание панели тестирования
     */
    createTestingPanel() {
        const panel = document.createElement('div');
        panel.id = 'skills-testing-panel';
        panel.className = 'fixed inset-0 lg:inset-auto lg:bottom-4 lg:right-4 lg:w-96 lg:h-[600px] bg-white border lg:border-gray-200 lg:rounded-lg lg:shadow-lg flex-col z-50 hidden';
        
        panel.innerHTML = `
            <!-- Заголовок -->
            <div class="testing-header flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white lg:rounded-t-lg">
                <div class="flex items-center gap-2">
                    <i class="ri-test-tube-line text-xl"></i>
                    <h3 class="font-semibold">Тестирование навыков</h3>
                </div>
                <button onclick="skillsTestingUI.closeTestingPanel()" class="text-white hover:text-gray-200">
                    <i class="ri-close-line text-xl"></i>
                </button>
            </div>
            
            <!-- Навигация -->
            <div class="testing-nav flex border-b border-gray-200">
                <button onclick="skillsTestingUI.showTab('tests')" class="flex-1 py-3 px-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600" data-tab="tests">
                    <i class="ri-list-check mr-2"></i>Тесты
                </button>
                <button onclick="skillsTestingUI.showTab('results')" class="flex-1 py-3 px-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600" data-tab="results">
                    <i class="ri-bar-chart-line mr-2"></i>Результаты
                </button>
                <button onclick="skillsTestingUI.showTab('certificates')" class="flex-1 py-3 px-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600" data-tab="certificates">
                    <i class="ri-medal-line mr-2"></i>Сертификаты
                </button>
            </div>
            
            <!-- Контент -->
            <div class="testing-content flex-1 overflow-y-auto">
                <!-- Вкладка тестов -->
                <div id="tests-tab" class="p-4">
                    <div class="mb-4">
                        <h4 class="text-lg font-semibold mb-2">Доступные тесты</h4>
                        <div class="flex gap-2 mb-4">
                            <button onclick="skillsTestingUI.filterTests('all')" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200" data-filter="all">
                                Все
                            </button>
                            <button onclick="skillsTestingUI.filterTests('technical')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200" data-filter="technical">
                                💻 Технические
                            </button>
                            <button onclick="skillsTestingUI.filterTests('language')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200" data-filter="language">
                                🌍 Языки
                            </button>
                            <button onclick="skillsTestingUI.filterTests('soft_skills')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200" data-filter="soft_skills">
                                🤝 Мягкие навыки
                            </button>
                        </div>
                    </div>
                    
                    <div id="tests-list" class="space-y-3">
                        <!-- Тесты загружаются динамически -->
                    </div>
                </div>
                
                <!-- Вкладка результатов -->
                <div id="results-tab" class="p-4 hidden">
                    <div class="mb-4">
                        <h4 class="text-lg font-semibold mb-2">Ваши результаты</h4>
                        <div id="results-summary" class="bg-gray-50 rounded-lg p-4 mb-4">
                            <!-- Сводка результатов -->
                        </div>
                    </div>
                    
                    <div id="results-list" class="space-y-3">
                        <!-- Результаты загружаются динамически -->
                    </div>
                </div>
                
                <!-- Вкладка сертификатов -->
                <div id="certificates-tab" class="p-4 hidden">
                    <div class="mb-4">
                        <h4 class="text-lg font-semibold mb-2">Ваши сертификаты</h4>
                    </div>
                    
                    <div id="certificates-list" class="space-y-3">
                        <!-- Сертификаты загружаются динамически -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    /**
     * Создание модала теста
     */
    createTestModal() {
        const modal = document.createElement('div');
        modal.id = 'test-modal';
        modal.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm hidden';
        
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <!-- Заголовок теста -->
                    <div class="test-header bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 id="test-title" class="text-xl font-bold mb-2">Название теста</h3>
                                <p id="test-description" class="text-blue-100">Описание теста</p>
                            </div>
                            <div class="text-right">
                                <div id="test-timer" class="text-2xl font-mono mb-1">00:00</div>
                                <div class="text-sm text-blue-100">Время</div>
                            </div>
                        </div>
                        
                        <!-- Прогресс -->
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-blue-100 mb-1">
                                <span>Вопрос <span id="current-question">1</span> из <span id="total-questions">10</span></span>
                                <span id="progress-percent">10%</span>
                            </div>
                            <div class="w-full bg-blue-200 rounded-full h-2">
                                <div id="progress-bar" class="bg-white h-2 rounded-full transition-all duration-300" style="width: 10%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Контент теста -->
                    <div class="test-content p-6 flex-1 overflow-y-auto">
                        <div id="question-container">
                            <!-- Вопросы загружаются динамически -->
                        </div>
                    </div>
                    
                    <!-- Навигация -->
                    <div class="test-navigation bg-gray-50 p-4 flex items-center justify-between">
                        <button id="prev-question" onclick="skillsTestingUI.previousQuestion()" class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="ri-arrow-left-line mr-2"></i>Назад
                        </button>
                        
                        <div class="flex gap-2">
                            <button id="save-answer" onclick="skillsTestingUI.saveAnswer()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                Сохранить ответ
                            </button>
                            <button id="finish-test" onclick="skillsTestingUI.finishTest()" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hidden">
                                Завершить тест
                            </button>
                        </div>
                        
                        <button id="next-question" onclick="skillsTestingUI.nextQuestion()" class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            Далее<i class="ri-arrow-right-line ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Создание панели результатов
     */
    createResultsPanel() {
        // Панель результатов интегрирована в основную панель тестирования
    }

    /**
     * Создание панели сертификатов
     */
    createCertificatesPanel() {
        // Панель сертификатов интегрирована в основную панель тестирования
    }

    /**
     * Показать панель тестирования
     */
    showTestingPanel() {
        const panel = document.getElementById('skills-testing-panel');
        if (panel) {
            panel.classList.remove('hidden');
            panel.classList.add('flex');
            this.loadTests();
            console.log('🎨 Панель тестирования показана');
        }
    }

    /**
     * Закрыть панель тестирования
     */
    closeTestingPanel() {
        const panel = document.getElementById('skills-testing-panel');
        if (panel) {
            panel.classList.add('hidden');
            panel.classList.remove('flex');
            console.log('🎨 Панель тестирования закрыта');
        }
    }

    /**
     * Показать вкладку
     */
    showTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('[id$="-tab"]').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Убираем активные классы с кнопок
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('border-blue-600', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-700');
        });
        
        // Показываем нужную вкладку
        const tab = document.getElementById(`${tabName}-tab`);
        if (tab) {
            tab.classList.remove('hidden');
        }
        
        // Активируем кнопку
        const btn = document.querySelector(`[data-tab="${tabName}"]`);
        if (btn) {
            btn.classList.add('border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-700');
        }
        
        // Загружаем данные для вкладки
        switch (tabName) {
            case 'tests':
                this.loadTests();
                break;
            case 'results':
                this.loadResults();
                break;
            case 'certificates':
                this.loadCertificates();
                break;
        }
    }

    /**
     * Фильтрация тестов
     */
    filterTests(category) {
        // Убираем активные классы
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'text-blue-700');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        });
        
        // Активируем выбранную кнопку
        const btn = document.querySelector(`[data-filter="${category}"]`);
        if (btn) {
            btn.classList.add('bg-blue-100', 'text-blue-700');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        }
        
        this.loadTests(category);
    }

    /**
     * Загрузка тестов
     */
    loadTests(category = 'all') {
        const container = document.getElementById('tests-list');
        if (!container) return;

        const userId = this.getCurrentUserId();
        const tests = this.skillsTestingSystem.getAvailableTests(userId, category === 'all' ? null : category);
        const userResults = this.skillsTestingSystem.getUserTestResults(userId);

        container.innerHTML = tests.map(test => {
            const lastResult = userResults
                .filter(r => r.testId === test.id)
                .sort((a, b) => b.startTime - a.startTime)[0];

            const status = lastResult ? 
                (lastResult.status === 'passed' ? 'passed' : 'failed') : 
                'not_taken';

            return `
                <div class="test-card bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h5 class="font-semibold text-gray-900 mb-1">${test.name}</h5>
                            <p class="text-sm text-gray-600 mb-2">${test.description}</p>
                            <div class="flex items-center gap-4 text-xs text-gray-500">
                                <span><i class="ri-time-line mr-1"></i>${test.duration} мин</span>
                                <span><i class="ri-question-line mr-1"></i>${test.questions.length} вопросов</span>
                                <span><i class="ri-target-line mr-1"></i>${test.passingScore}% для прохождения</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            ${this.getStatusBadge(status, lastResult?.score)}
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="skillsTestingUI.startTest('${test.id}')" 
                                class="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                            ${status === 'not_taken' ? 'Начать тест' : 'Пересдать'}
                        </button>
                        ${lastResult ? `
                            <button onclick="skillsTestingUI.showTestResult('${lastResult.id}')" 
                                    class="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                Результат
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-gray-500 text-center py-8">Тесты не найдены</p>';
    }

    /**
     * Получение бейджа статуса
     */
    getStatusBadge(status, score) {
        switch (status) {
            case 'passed':
                return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="ri-check-line mr-1"></i>Пройден ${score}%
                </span>`;
            case 'failed':
                return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <i class="ri-close-line mr-1"></i>Не пройден ${score}%
                </span>`;
            default:
                return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <i class="ri-play-line mr-1"></i>Не пройден
                </span>`;
        }
    }

    /**
     * Загрузка результатов
     */
    loadResults() {
        const container = document.getElementById('results-list');
        const summaryContainer = document.getElementById('results-summary');
        if (!container || !summaryContainer) return;

        const userId = this.getCurrentUserId();
        const results = this.skillsTestingSystem.getUserTestResults(userId);
        const analytics = this.skillsTestingSystem.getAnalytics(userId);

        // Показываем сводку
        summaryContainer.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${analytics.totalTests}</div>
                    <div class="text-sm text-gray-600">Всего тестов</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${analytics.passedTests}</div>
                    <div class="text-sm text-gray-600">Пройдено</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">${analytics.averageScore}%</div>
                    <div class="text-sm text-gray-600">Средний балл</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600">${analytics.certificates}</div>
                    <div class="text-sm text-gray-600">Сертификатов</div>
                </div>
            </div>
        `;

        // Показываем результаты
        container.innerHTML = results.length > 0 ? results.map(result => {
            const test = this.skillsTestingSystem.getTest(result.testId);
            const duration = Math.round((result.endTime - result.startTime) / 60000);
            
            return `
                <div class="result-card bg-white border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h5 class="font-semibold text-gray-900">${test?.name || 'Неизвестный тест'}</h5>
                            <p class="text-sm text-gray-600">${new Date(result.startTime).toLocaleDateString()}</p>
                        </div>
                        <div class="text-right">
                            ${this.getStatusBadge(result.status, result.score)}
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Балл:</span>
                            <span class="font-semibold">${result.score}%</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Время:</span>
                            <span class="font-semibold">${duration} мин</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Статус:</span>
                            <span class="font-semibold">${result.status === 'passed' ? 'Пройден' : 'Не пройден'}</span>
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="text-gray-500 text-center py-8">Результаты не найдены</p>';
    }

    /**
     * Загрузка сертификатов
     */
    loadCertificates() {
        const container = document.getElementById('certificates-list');
        if (!container) return;

        const userId = this.getCurrentUserId();
        const certificates = this.skillsTestingSystem.getUserCertificates(userId);

        container.innerHTML = certificates.length > 0 ? certificates.map(cert => {
            const isExpired = cert.expiresAt < Date.now();
            
            return `
                <div class="certificate-card bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h5 class="font-semibold text-lg">${cert.testName}</h5>
                            <p class="text-yellow-100">${cert.skill}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold">${cert.score}%</div>
                            <div class="text-sm text-yellow-100">Балл</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm">
                        <span>Выдан: ${new Date(cert.issuedAt).toLocaleDateString()}</span>
                        <span class="${isExpired ? 'text-red-200' : 'text-yellow-100'}">
                            ${isExpired ? 'Истек' : `Действует до ${new Date(cert.expiresAt).toLocaleDateString()}`}
                        </span>
                    </div>
                    
                    <div class="mt-3 flex gap-2">
                        <button onclick="skillsTestingUI.downloadCertificate('${cert.id}')" 
                                class="flex-1 px-3 py-2 bg-white text-orange-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="ri-download-line mr-1"></i>Скачать
                        </button>
                        <button onclick="skillsTestingUI.shareCertificate('${cert.id}')" 
                                class="px-3 py-2 bg-white text-orange-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="ri-share-line"></i>
                        </button>
                    </div>
                </div>
            `).join('') : '<p class="text-gray-500 text-center py-8">Сертификаты не найдены</p>';
    }

    /**
     * Начать тест
     */
    startTest(testId) {
        const userId = this.getCurrentUserId();
        const test = this.skillsTestingSystem.getTest(testId);
        
        if (!test) {
            alert('Тест не найден');
            return;
        }

        try {
            this.currentSession = this.skillsTestingSystem.startTest(userId, testId);
            this.currentQuestionIndex = 0;
            
            this.showTestModal(test);
            this.loadQuestion();
            this.startTimer(test.duration);
            
            console.log(`🧪 Начат тест: ${test.name}`);
        } catch (error) {
            console.error('Ошибка начала теста:', error);
            alert('Не удалось начать тест');
        }
    }

    /**
     * Показать модал теста
     */
    showTestModal(test) {
        const modal = document.getElementById('test-modal');
        const title = document.getElementById('test-title');
        const description = document.getElementById('test-description');
        const totalQuestions = document.getElementById('total-questions');
        
        if (modal && title && description && totalQuestions) {
            title.textContent = test.name;
            description.textContent = test.description;
            totalQuestions.textContent = test.questions.length;
            
            modal.classList.remove('hidden');
        }
    }

    /**
     * Загрузить вопрос
     */
    loadQuestion() {
        if (!this.currentSession) return;

        const test = this.skillsTestingSystem.getTest(this.currentSession.testId);
        const question = test.questions[this.currentQuestionIndex];
        
        if (!question) return;

        const container = document.getElementById('question-container');
        const currentQuestionEl = document.getElementById('current-question');
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        
        if (container && currentQuestionEl && progressBar && progressPercent) {
            currentQuestionEl.textContent = this.currentQuestionIndex + 1;
            
            const progress = ((this.currentQuestionIndex + 1) / test.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressPercent.textContent = `${Math.round(progress)}%`;
            
            container.innerHTML = this.renderQuestion(question);
        }
        
        this.updateNavigationButtons();
    }

    /**
     * Рендер вопроса
     */
    renderQuestion(question) {
        switch (question.type) {
            case 'multiple_choice':
                return `
                    <div class="question-container">
                        <h4 class="text-lg font-semibold mb-4">${question.question}</h4>
                        <div class="space-y-3">
                            ${question.options.map((option, index) => `
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name="answer" value="${index}" class="mr-3">
                                    <span>${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            case 'translation':
                return `
                    <div class="question-container">
                        <h4 class="text-lg font-semibold mb-4">${question.question}</h4>
                        <div class="space-y-3">
                            <textarea id="translation-answer" 
                                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                      rows="3" 
                                      placeholder="Введите ваш ответ..."></textarea>
                        </div>
                    </div>
                `;
                
            case 'code':
                return `
                    <div class="question-container">
                        <h4 class="text-lg font-semibold mb-4">${question.question}</h4>
                        <div class="space-y-3">
                            <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">${question.template}</pre>
                            <textarea id="code-answer" 
                                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" 
                                      rows="8" 
                                      placeholder="Напишите ваш код...">${question.template}</textarea>
                        </div>
                    </div>
                `;
                
            case 'scenario':
                return `
                    <div class="question-container">
                        <h4 class="text-lg font-semibold mb-4">${question.question}</h4>
                        <div class="space-y-3">
                            ${question.options.map((option, index) => `
                                <label class="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <input type="radio" name="answer" value="${index}" class="mr-3 mt-1">
                                    <span>${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            default:
                return '<p>Неизвестный тип вопроса</p>';
        }
    }

    /**
     * Обновить кнопки навигации
     */
    updateNavigationButtons() {
        if (!this.currentSession) return;

        const test = this.skillsTestingSystem.getTest(this.currentSession.testId);
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const finishBtn = document.getElementById('finish-test');
        
        if (prevBtn && nextBtn && finishBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
            nextBtn.disabled = this.currentQuestionIndex === test.questions.length - 1;
            
            if (this.currentQuestionIndex === test.questions.length - 1) {
                finishBtn.classList.remove('hidden');
            } else {
                finishBtn.classList.add('hidden');
            }
        }
    }

    /**
     * Следующий вопрос
     */
    nextQuestion() {
        if (!this.currentSession) return;

        const test = this.skillsTestingSystem.getTest(this.currentSession.testId);
        if (this.currentQuestionIndex < test.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
        }
    }

    /**
     * Предыдущий вопрос
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
        }
    }

    /**
     * Сохранить ответ
     */
    saveAnswer() {
        if (!this.currentSession) return;

        const test = this.skillsTestingSystem.getTest(this.currentSession.testId);
        const question = test.questions[this.currentQuestionIndex];
        let answer = null;

        switch (question.type) {
            case 'multiple_choice':
            case 'scenario':
                const radio = document.querySelector('input[name="answer"]:checked');
                answer = radio ? parseInt(radio.value) : null;
                break;
                
            case 'translation':
                const textarea = document.getElementById('translation-answer');
                answer = textarea ? textarea.value : '';
                break;
                
            case 'code':
                const codeTextarea = document.getElementById('code-answer');
                answer = codeTextarea ? codeTextarea.value : '';
                break;
        }

        if (answer !== null) {
            this.skillsTestingSystem.submitAnswer(this.currentSession.id, question.id, answer);
            console.log(`💾 Ответ сохранен для вопроса ${question.id}`);
        }
    }

    /**
     * Завершить тест
     */
    finishTest() {
        if (!this.currentSession) return;

        try {
            const result = this.skillsTestingSystem.finishTest(this.currentSession.id);
            this.stopTimer();
            this.hideTestModal();
            
            this.showTestResult(result);
            
            console.log(`✅ Тест завершен. Результат: ${result.score}%`);
        } catch (error) {
            console.error('Ошибка завершения теста:', error);
            alert('Не удалось завершить тест');
        }
    }

    /**
     * Показать результат теста
     */
    showTestResult(result) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
        
        const isPassed = result.passed;
        const test = this.skillsTestingSystem.getTest(result.session.testId);
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div class="text-center">
                    <div class="text-6xl mb-4">${isPassed ? '🎉' : '😔'}</div>
                    <h3 class="text-xl font-bold mb-2">${isPassed ? 'Поздравляем!' : 'Попробуйте еще раз'}</h3>
                    <p class="text-gray-600 mb-4">${test.name}</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <div class="text-3xl font-bold text-blue-600 mb-1">${result.score}%</div>
                        <div class="text-sm text-gray-600">Ваш результат</div>
                    </div>
                    
                    <div class="text-sm text-gray-600 mb-6">
                        ${isPassed ? 
                            'Вы успешно прошли тест и получили сертификат!' : 
                            `Для прохождения нужно набрать минимум ${test.passingScore}%`
                        }
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="this.closest('.fixed').remove()" 
                                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            Закрыть
                        </button>
                        ${!isPassed ? `
                            <button onclick="skillsTestingUI.retakeTest('${test.id}'); this.closest('.fixed').remove()" 
                                    class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                Пересдать
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Пересдать тест
     */
    retakeTest(testId) {
        this.startTest(testId);
    }

    /**
     * Скрыть модал теста
     */
    hideTestModal() {
        const modal = document.getElementById('test-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Запустить таймер
     */
    startTimer(durationMinutes) {
        let timeLeft = durationMinutes * 60; // в секундах
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timerEl = document.getElementById('test-timer');
            
            if (timerEl) {
                timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (timeLeft <= 0) {
                this.finishTest();
                return;
            }
            
            timeLeft--;
            this.testTimer = setTimeout(updateTimer, 1000);
        };
        
        updateTimer();
    }

    /**
     * Остановить таймер
     */
    stopTimer() {
        if (this.testTimer) {
            clearTimeout(this.testTimer);
            this.testTimer = null;
        }
    }

    /**
     * Скачать сертификат
     */
    downloadCertificate(certificateId) {
        // В реальном приложении здесь была бы генерация PDF
        console.log(`📄 Скачивание сертификата: ${certificateId}`);
        alert('Функция скачивания сертификата будет добавлена позже');
    }

    /**
     * Поделиться сертификатом
     */
    shareCertificate(certificateId) {
        // В реальном приложении здесь была бы интеграция с соцсетями
        console.log(`📤 Поделиться сертификатом: ${certificateId}`);
        alert('Функция публикации сертификата будет добавлена позже');
    }

    /**
     * Получить ID текущего пользователя
     */
    getCurrentUserId() {
        // В реальном приложении здесь была бы интеграция с системой аутентификации
        return 'demo_user';
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработчик ESC для закрытия модалов
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTestModal();
                this.closeTestingPanel();
            }
        });
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsTestingUI;
} 