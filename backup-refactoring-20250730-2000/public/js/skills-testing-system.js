/**
 * Система тестирования и оценки навыков
 * Технические, психологические, языковые тесты с автоматической оценкой
 */

class SkillsTestingSystem {
    constructor() {
        this.tests = new Map();
        this.userResults = new Map();
        this.certificates = new Map();
        this.skillRatings = new Map();
        this.testCategories = new Map();
        this.learningPaths = new Map();
        this.testTemplates = new Map();
        this.analytics = new Map();
        this.init();
    }

    /**
     * Инициализация системы тестирования
     */
    init() {
        this.loadData();
        this.initializeTestCategories();
        this.initializeTestTemplates();
        this.initializeLearningPaths();
        this.setupEventListeners();
        console.log('🧪 Система тестирования навыков инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedResults = localStorage.getItem('skillsTestResults');
            const savedCertificates = localStorage.getItem('skillsCertificates');
            const savedRatings = localStorage.getItem('skillsRatings');
            const savedAnalytics = localStorage.getItem('skillsAnalytics');

            if (savedResults) this.userResults = new Map(JSON.parse(savedResults));
            if (savedCertificates) this.certificates = new Map(JSON.parse(savedCertificates));
            if (savedRatings) this.skillRatings = new Map(JSON.parse(savedRatings));
            if (savedAnalytics) this.analytics = new Map(JSON.parse(savedAnalytics));
        } catch (error) {
            console.error('Ошибка загрузки данных тестирования:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('skillsTestResults', JSON.stringify(Array.from(this.userResults.entries())));
            localStorage.setItem('skillsCertificates', JSON.stringify(Array.from(this.certificates.entries())));
            localStorage.setItem('skillsRatings', JSON.stringify(Array.from(this.skillRatings.entries())));
            localStorage.setItem('skillsAnalytics', JSON.stringify(Array.from(this.analytics.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных тестирования:', error);
        }
    }

    /**
     * Инициализация категорий тестов
     */
    initializeTestCategories() {
        const categories = [
            {
                id: 'technical',
                name: 'Технические навыки',
                description: 'Программирование, дизайн, анализ данных',
                icon: '💻',
                color: 'blue',
                skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS']
            },
            {
                id: 'language',
                name: 'Языковые навыки',
                description: 'Чешский, английский, немецкий языки',
                icon: '🌍',
                color: 'green',
                skills: ['Чешский', 'Английский', 'Немецкий', 'Словацкий', 'Польский']
            },
            {
                id: 'soft_skills',
                name: 'Мягкие навыки',
                description: 'Коммуникация, лидерство, работа в команде',
                icon: '🤝',
                color: 'purple',
                skills: ['Коммуникация', 'Лидерство', 'Работа в команде', 'Тайм-менеджмент', 'Креативность']
            },
            {
                id: 'business',
                name: 'Бизнес навыки',
                description: 'Менеджмент, маркетинг, продажи',
                icon: '📊',
                color: 'orange',
                skills: ['Менеджмент проектов', 'Маркетинг', 'Продажи', 'Аналитика', 'Стратегическое планирование']
            },
            {
                id: 'industry',
                name: 'Отраслевые знания',
                description: 'Специфические знания по отраслям',
                icon: '🏭',
                color: 'red',
                skills: ['Финансы', 'Здравоохранение', 'Образование', 'IT', 'Производство']
            }
        ];

        categories.forEach(category => {
            this.testCategories.set(category.id, category);
        });
    }

    /**
     * Инициализация шаблонов тестов
     */
    initializeTestTemplates() {
        const templates = [
            // Технические тесты
            {
                id: 'javascript_basic',
                name: 'JavaScript - Основы',
                category: 'technical',
                skill: 'JavaScript',
                description: 'Базовые знания JavaScript',
                duration: 15, // минуты
                questions: [
                    {
                        id: 1,
                        type: 'multiple_choice',
                        question: 'Что выведет console.log(typeof null)?',
                        options: ['"object"', '"null"', '"undefined"', '"boolean"'],
                        correct: 0,
                        explanation: 'typeof null возвращает "object" - это известная особенность JavaScript'
                    },
                    {
                        id: 2,
                        type: 'multiple_choice',
                        question: 'Какой метод используется для добавления элемента в конец массива?',
                        options: ['push()', 'pop()', 'shift()', 'unshift()'],
                        correct: 0,
                        explanation: 'push() добавляет элемент в конец массива'
                    },
                    {
                        id: 3,
                        type: 'code',
                        question: 'Напишите функцию, которая возвращает сумму двух чисел',
                        template: 'function sum(a, b) {\n  // Ваш код здесь\n}',
                        testCases: [
                            { input: [2, 3], expected: 5 },
                            { input: [-1, 1], expected: 0 },
                            { input: [0, 0], expected: 0 }
                        ],
                        explanation: 'Функция должна просто сложить два числа'
                    }
                ],
                passingScore: 70
            },
            {
                id: 'react_basic',
                name: 'React - Основы',
                category: 'technical',
                skill: 'React',
                description: 'Базовые знания React',
                duration: 20,
                questions: [
                    {
                        id: 1,
                        type: 'multiple_choice',
                        question: 'Что такое JSX?',
                        options: ['JavaScript XML', 'JavaScript Extension', 'React Syntax', 'HTML в JavaScript'],
                        correct: 0,
                        explanation: 'JSX расшифровывается как JavaScript XML'
                    },
                    {
                        id: 2,
                        type: 'multiple_choice',
                        question: 'Какой хук используется для управления состоянием?',
                        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
                        correct: 0,
                        explanation: 'useState - основной хук для управления состоянием'
                    }
                ],
                passingScore: 70
            },
            // Языковые тесты
            {
                id: 'czech_basic',
                name: 'Чешский язык - Основы',
                category: 'language',
                skill: 'Чешский',
                description: 'Базовые знания чешского языка',
                duration: 25,
                questions: [
                    {
                        id: 1,
                        type: 'multiple_choice',
                        question: 'Как сказать "Здравствуйте" по-чешски?',
                        options: ['Dobrý den', 'Ahoj', 'Děkuji', 'Prosím'],
                        correct: 0,
                        explanation: 'Dobrý den - формальное приветствие'
                    },
                    {
                        id: 2,
                        type: 'translation',
                        question: 'Переведите: "Я ищу работу"',
                        answer: 'Hledám práci',
                        alternatives: ['Hledám práci', 'Hledám zaměstnání', 'Potřebuji práci'],
                        explanation: 'Hledám práci - стандартный способ сказать "ищу работу"'
                    }
                ],
                passingScore: 60
            },
            // Мягкие навыки
            {
                id: 'communication_basic',
                name: 'Коммуникация - Основы',
                category: 'soft_skills',
                skill: 'Коммуникация',
                description: 'Базовые навыки коммуникации',
                duration: 15,
                questions: [
                    {
                        id: 1,
                        type: 'scenario',
                        question: 'Коллега постоянно перебивает вас на совещаниях. Что вы сделаете?',
                        options: [
                            'Начну перебивать его в ответ',
                            'Поговорю с ним наедине о проблеме',
                            'Пожалуюсь начальнику',
                            'Перестану участвовать в совещаниях'
                        ],
                        correct: 1,
                        explanation: 'Лучше решить проблему напрямую, но деликатно'
                    }
                ],
                passingScore: 70
            }
        ];

        templates.forEach(template => {
            this.testTemplates.set(template.id, template);
        });
    }

    /**
     * Инициализация путей обучения
     */
    initializeLearningPaths() {
        const paths = [
            {
                id: 'frontend_developer',
                name: 'Frontend Developer',
                description: 'Путь становления фронтенд разработчиком',
                skills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
                tests: ['html_basic', 'css_basic', 'javascript_basic', 'react_basic'],
                duration: '3-6 месяцев',
                difficulty: 'beginner'
            },
            {
                id: 'backend_developer',
                name: 'Backend Developer',
                description: 'Путь становления бэкенд разработчиком',
                skills: ['Python', 'Node.js', 'SQL', 'Git', 'Docker'],
                tests: ['python_basic', 'nodejs_basic', 'sql_basic', 'git_basic'],
                duration: '4-8 месяцев',
                difficulty: 'beginner'
            },
            {
                id: 'czech_language',
                name: 'Чешский язык',
                description: 'Изучение чешского языка для работы',
                skills: ['Чешский'],
                tests: ['czech_basic', 'czech_intermediate', 'czech_advanced'],
                duration: '6-12 месяцев',
                difficulty: 'beginner'
            }
        ];

        paths.forEach(path => {
            this.learningPaths.set(path.id, path);
        });
    }

    /**
     * Получение доступных тестов для пользователя
     */
    getAvailableTests(userId, category = null) {
        const tests = Array.from(this.testTemplates.values());
        
        if (category) {
            return tests.filter(test => test.category === category);
        }
        
        return tests;
    }

    /**
     * Получение теста по ID
     */
    getTest(testId) {
        return this.testTemplates.get(testId);
    }

    /**
     * Начало теста
     */
    startTest(userId, testId) {
        const test = this.getTest(testId);
        if (!test) {
            throw new Error('Тест не найден');
        }

        const testSession = {
            id: `${userId}_${testId}_${Date.now()}`,
            userId,
            testId,
            startTime: Date.now(),
            endTime: null,
            answers: [],
            score: null,
            status: 'in_progress'
        };

        // Сохраняем сессию
        if (!this.userResults.has(userId)) {
            this.userResults.set(userId, []);
        }
        this.userResults.get(userId).push(testSession);

        this.saveData();
        return testSession;
    }

    /**
     * Отправка ответа на вопрос
     */
    submitAnswer(sessionId, questionId, answer) {
        const session = this.findSession(sessionId);
        if (!session) {
            throw new Error('Сессия не найдена');
        }

        // Находим или создаем ответ
        let existingAnswer = session.answers.find(a => a.questionId === questionId);
        if (existingAnswer) {
            existingAnswer.answer = answer;
            existingAnswer.timestamp = Date.now();
        } else {
            session.answers.push({
                questionId,
                answer,
                timestamp: Date.now()
            });
        }

        this.saveData();
        return session;
    }

    /**
     * Завершение теста
     */
    finishTest(sessionId) {
        const session = this.findSession(sessionId);
        if (!session) {
            throw new Error('Сессия не найдена');
        }

        const test = this.getTest(session.testId);
        const score = this.calculateScore(session, test);
        const passed = score >= test.passingScore;

        session.endTime = Date.now();
        session.score = score;
        session.status = passed ? 'passed' : 'failed';

        // Создаем сертификат если тест пройден
        if (passed) {
            this.createCertificate(session.userId, session.testId, score);
        }

        // Обновляем рейтинг навыка
        this.updateSkillRating(session.userId, test.skill, score);

        this.saveData();
        return { session, passed, score };
    }

    /**
     * Расчет результата теста
     */
    calculateScore(session, test) {
        let correctAnswers = 0;
        let totalQuestions = test.questions.length;

        test.questions.forEach(question => {
            const answer = session.answers.find(a => a.questionId === question.id);
            if (answer && this.isAnswerCorrect(question, answer.answer)) {
                correctAnswers++;
            }
        });

        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    /**
     * Проверка правильности ответа
     */
    isAnswerCorrect(question, answer) {
        switch (question.type) {
            case 'multiple_choice':
                return answer === question.correct;
            case 'translation':
                return question.alternatives.includes(answer.toLowerCase().trim());
            case 'code':
                // Простая проверка для демо
                return answer && answer.length > 10;
            case 'scenario':
                return answer === question.correct;
            default:
                return false;
        }
    }

    /**
     * Создание сертификата
     */
    createCertificate(userId, testId, score) {
        const test = this.getTest(testId);
        const certificate = {
            id: `${userId}_${testId}_${Date.now()}`,
            userId,
            testId,
            testName: test.name,
            skill: test.skill,
            score,
            issuedAt: Date.now(),
            expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 год
            status: 'active'
        };

        if (!this.certificates.has(userId)) {
            this.certificates.set(userId, []);
        }
        this.certificates.get(userId).push(certificate);

        this.saveData();
        return certificate;
    }

    /**
     * Обновление рейтинга навыка
     */
    updateSkillRating(userId, skill, score) {
        if (!this.skillRatings.has(userId)) {
            this.skillRatings.set(userId, new Map());
        }

        const userRatings = this.skillRatings.get(userId);
        const currentRating = userRatings.get(skill) || { score: 0, tests: 0, lastUpdated: 0 };

        // Обновляем рейтинг с учетом нового результата
        const newTests = currentRating.tests + 1;
        const newScore = Math.round((currentRating.score * currentRating.tests + score) / newTests);

        userRatings.set(skill, {
            score: newScore,
            tests: newTests,
            lastUpdated: Date.now()
        });

        this.saveData();
    }

    /**
     * Получение рейтинга навыков пользователя
     */
    getUserSkillRatings(userId) {
        return this.skillRatings.get(userId) || new Map();
    }

    /**
     * Получение сертификатов пользователя
     */
    getUserCertificates(userId) {
        return this.certificates.get(userId) || [];
    }

    /**
     * Получение результатов тестов пользователя
     */
    getUserTestResults(userId) {
        return this.userResults.get(userId) || [];
    }

    /**
     * Поиск сессии по ID
     */
    findSession(sessionId) {
        for (const [userId, sessions] of this.userResults) {
            const session = sessions.find(s => s.id === sessionId);
            if (session) return session;
        }
        return null;
    }

    /**
     * Получение рекомендаций по обучению
     */
    getLearningRecommendations(userId) {
        const userRatings = this.getUserSkillRatings(userId);
        const recommendations = [];

        // Анализируем слабые навыки
        for (const [skill, rating] of userRatings) {
            if (rating.score < 70) {
                const category = this.getSkillCategory(skill);
                const tests = this.getAvailableTests(userId, category.id);
                
                recommendations.push({
                    type: 'improve_skill',
                    skill,
                    currentScore: rating.score,
                    targetScore: 80,
                    tests: tests.filter(t => t.skill === skill),
                    priority: 'high'
                });
            }
        }

        // Рекомендуем новые навыки
        const learnedSkills = Array.from(userRatings.keys());
        const allSkills = this.getAllSkills();
        const newSkills = allSkills.filter(skill => !learnedSkills.includes(skill));

        if (newSkills.length > 0) {
            recommendations.push({
                type: 'learn_new_skill',
                skills: newSkills.slice(0, 3),
                priority: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * Получение категории навыка
     */
    getSkillCategory(skill) {
        for (const [categoryId, category] of this.testCategories) {
            if (category.skills.includes(skill)) {
                return category;
            }
        }
        return null;
    }

    /**
     * Получение всех навыков
     */
    getAllSkills() {
        const skills = [];
        for (const category of this.testCategories.values()) {
            skills.push(...category.skills);
        }
        return skills;
    }

    /**
     * Получение аналитики тестирования
     */
    getAnalytics(userId) {
        const results = this.getUserTestResults(userId);
        const certificates = this.getUserCertificates(userId);
        const ratings = this.getUserSkillRatings(userId);

        const analytics = {
            totalTests: results.length,
            passedTests: results.filter(r => r.status === 'passed').length,
            averageScore: results.length > 0 ? 
                Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) : 0,
            certificates: certificates.length,
            topSkills: Array.from(ratings.entries())
                .sort((a, b) => b[1].score - a[1].score)
                .slice(0, 5)
                .map(([skill, rating]) => ({ skill, score: rating.score })),
            recentActivity: results
                .sort((a, b) => b.startTime - a.startTime)
                .slice(0, 5)
        };

        return analytics;
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Слушаем события от UI
        document.addEventListener('startTest', (e) => {
            const { userId, testId } = e.detail;
            this.startTest(userId, testId);
        });

        document.addEventListener('submitAnswer', (e) => {
            const { sessionId, questionId, answer } = e.detail;
            this.submitAnswer(sessionId, questionId, answer);
        });

        document.addEventListener('finishTest', (e) => {
            const { sessionId } = e.detail;
            this.finishTest(sessionId);
        });
    }

    /**
     * Включение тестового режима
     */
    enableTestMode() {
        console.log('🧪 Тестовый режим системы тестирования включен');
        
        // Добавляем демо данные
        const demoUserId = 'demo_user';
        
        // Демо результаты тестов
        const demoResults = [
            {
                id: 'demo_1',
                userId: demoUserId,
                testId: 'javascript_basic',
                startTime: Date.now() - 86400000,
                endTime: Date.now() - 86300000,
                answers: [
                    { questionId: 1, answer: 0, timestamp: Date.now() - 86350000 },
                    { questionId: 2, answer: 0, timestamp: Date.now() - 86320000 }
                ],
                score: 85,
                status: 'passed'
            }
        ];
        
        this.userResults.set(demoUserId, demoResults);
        
        // Демо сертификаты
        const demoCertificates = [
            {
                id: 'cert_1',
                userId: demoUserId,
                testId: 'javascript_basic',
                testName: 'JavaScript - Основы',
                skill: 'JavaScript',
                score: 85,
                issuedAt: Date.now() - 86400000,
                expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
                status: 'active'
            }
        ];
        
        this.certificates.set(demoUserId, demoCertificates);
        
        // Демо рейтинги навыков
        const demoRatings = new Map();
        demoRatings.set('JavaScript', {
            score: 85,
            tests: 1,
            lastUpdated: Date.now() - 86400000
        });
        
        this.skillRatings.set(demoUserId, demoRatings);
        
        this.saveData();
        console.log('🧪 Демо данные добавлены');
    }

    /**
     * Получение статистики системы
     */
    getSystemStats() {
        const stats = {
            totalTests: this.testTemplates.size,
            totalCategories: this.testCategories.size,
            totalLearningPaths: this.learningPaths.size,
            totalUsers: this.userResults.size,
            totalCertificates: Array.from(this.certificates.values())
                .reduce((sum, certs) => sum + certs.length, 0),
            averageScore: this.calculateAverageScore(),
            mostPopularTests: this.getMostPopularTests(),
            topSkills: this.getTopSkills()
        };

        return stats;
    }

    /**
     * Расчет среднего балла
     */
    calculateAverageScore() {
        let totalScore = 0;
        let totalTests = 0;

        for (const results of this.userResults.values()) {
            for (const result of results) {
                if (result.score !== null) {
                    totalScore += result.score;
                    totalTests++;
                }
            }
        }

        return totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    }

    /**
     * Получение самых популярных тестов
     */
    getMostPopularTests() {
        const testCounts = new Map();

        for (const results of this.userResults.values()) {
            for (const result of results) {
                const count = testCounts.get(result.testId) || 0;
                testCounts.set(result.testId, count + 1);
            }
        }

        return Array.from(testCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([testId, count]) => ({
                testId,
                testName: this.getTest(testId)?.name || 'Неизвестный тест',
                count
            }));
    }

    /**
     * Получение топ навыков
     */
    getTopSkills() {
        const skillScores = new Map();

        for (const ratings of this.skillRatings.values()) {
            for (const [skill, rating] of ratings) {
                const current = skillScores.get(skill) || { totalScore: 0, totalTests: 0 };
                current.totalScore += rating.score * rating.tests;
                current.totalTests += rating.tests;
                skillScores.set(skill, current);
            }
        }

        return Array.from(skillScores.entries())
            .map(([skill, data]) => ({
                skill,
                averageScore: Math.round(data.totalScore / data.totalTests),
                totalTests: data.totalTests
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 10);
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsTestingSystem;
} 