/**
 * Система модерации контента
 * Автоматическая и ручная модерация, фильтрация спама, система жалоб
 */

class ContentModerationSystem {
    constructor() {
        this.moderationQueue = [];
        this.reportedContent = new Map();
        this.userTrustScores = new Map();
        this.employerRatings = new Map();
        this.spamFilters = new Map();
        this.contentRules = new Map();
        this.moderationHistory = new Map();
        this.autoModerationEnabled = true;
        this.init();
    }

    /**
     * Инициализация системы модерации
     */
    init() {
        this.loadData();
        this.initializeFilters();
        this.initializeRules();
        this.setupEventListeners();
        console.log('🛡️ Система модерации контента инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedQueue = localStorage.getItem('moderationQueue');
            const savedReports = localStorage.getItem('reportedContent');
            const savedTrustScores = localStorage.getItem('userTrustScores');
            const savedRatings = localStorage.getItem('employerRatings');
            const savedHistory = localStorage.getItem('moderationHistory');

            if (savedQueue) this.moderationQueue = JSON.parse(savedQueue);
            if (savedReports) this.reportedContent = new Map(JSON.parse(savedReports));
            if (savedTrustScores) this.userTrustScores = new Map(JSON.parse(savedTrustScores));
            if (savedRatings) this.employerRatings = new Map(JSON.parse(savedRatings));
            if (savedHistory) this.moderationHistory = new Map(JSON.parse(savedHistory));
        } catch (error) {
            console.error('Ошибка загрузки данных модерации:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('moderationQueue', JSON.stringify(this.moderationQueue));
            localStorage.setItem('reportedContent', JSON.stringify(Array.from(this.reportedContent.entries())));
            localStorage.setItem('userTrustScores', JSON.stringify(Array.from(this.userTrustScores.entries())));
            localStorage.setItem('employerRatings', JSON.stringify(Array.from(this.employerRatings.entries())));
            localStorage.setItem('moderationHistory', JSON.stringify(Array.from(this.moderationHistory.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных модерации:', error);
        }
    }

    /**
     * Инициализация фильтров спама
     */
    initializeFilters() {
        // Фильтры для спама
        this.spamFilters.set('spam_keywords', [
            'make money fast', 'earn $1000', 'work from home', 'get rich quick',
            'investment opportunity', 'bitcoin investment', 'crypto trading',
            'mlm', 'pyramid scheme', 'multi level marketing', 'get rich',
            'earn money online', 'passive income', 'financial freedom'
        ]);

        this.spamFilters.set('suspicious_patterns', [
            /[A-Z]{5,}/, // Много заглавных букв
            /!{3,}/, // Много восклицательных знаков
            /\${2,}/, // Много знаков доллара
            /[0-9]{10,}/, // Длинные числа
            /(.)\1{4,}/ // Повторяющиеся символы
        ]);

        this.spamFilters.set('suspicious_domains', [
            'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd',
            'v.gd', 'ow.ly', 'su.pr', 'twurl.nl', 'snipurl.com'
        ]);

        this.spamFilters.set('suspicious_emails', [
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
        ]);
    }

    /**
     * Инициализация правил модерации
     */
    initializeRules() {
        // Правила для вакансий
        this.contentRules.set('job_posting', {
            minTitleLength: 10,
            maxTitleLength: 100,
            minDescriptionLength: 50,
            maxDescriptionLength: 2000,
            requiredFields: ['title', 'description', 'location', 'salary'],
            forbiddenWords: ['spam', 'scam', 'fake', 'test'],
            maxImages: 5,
            maxLinks: 3
        });

        // Правила для профилей
        this.contentRules.set('user_profile', {
            minNameLength: 2,
            maxNameLength: 50,
            minBioLength: 10,
            maxBioLength: 500,
            requiredFields: ['name', 'email'],
            maxSkills: 20,
            maxLinks: 5
        });

        // Правила для сообщений
        this.contentRules.set('message', {
            minLength: 5,
            maxLength: 1000,
            maxLinks: 2,
            maxImages: 1,
            forbiddenWords: ['spam', 'scam', 'fake', 'test']
        });

        // Правила для отзывов
        this.contentRules.set('review', {
            minLength: 10,
            maxLength: 500,
            requiredFields: ['rating', 'comment'],
            maxImages: 2,
            forbiddenWords: ['spam', 'scam', 'fake', 'test']
        });
    }

    /**
     * Модерация контента
     */
    async moderateContent(content, contentType, userId) {
        const moderationResult = {
            contentId: content.id || Date.now().toString(),
            contentType: contentType,
            userId: userId,
            timestamp: Date.now(),
            autoModerated: false,
            approved: true,
            rejected: false,
            flags: [],
            score: 0,
            reason: null,
            requiresManualReview: false
        };

        // Автоматическая модерация
        if (this.autoModerationEnabled) {
            const autoResult = this.performAutoModeration(content, contentType);
            moderationResult.autoModerated = true;
            moderationResult.flags = autoResult.flags;
            moderationResult.score = autoResult.score;
            moderationResult.requiresManualReview = autoResult.requiresManualReview;

            if (autoResult.rejected) {
                moderationResult.approved = false;
                moderationResult.rejected = true;
                moderationResult.reason = autoResult.reason;
            }
        }

        // Проверка рейтинга доверия пользователя
        const trustScore = this.getUserTrustScore(userId);
        if (trustScore < 30) {
            moderationResult.requiresManualReview = true;
            moderationResult.flags.push('low_trust_score');
        }

        // Добавление в очередь модерации если требуется ручная проверка
        if (moderationResult.requiresManualReview) {
            this.addToModerationQueue(moderationResult);
        }

        // Сохранение в историю
        this.saveModerationHistory(moderationResult);

        this.saveData();
        return moderationResult;
    }

    /**
     * Выполнение автоматической модерации
     */
    performAutoModeration(content, contentType) {
        const result = {
            flags: [],
            score: 0,
            rejected: false,
            reason: null,
            requiresManualReview: false
        };

        // Проверка на спам
        const spamCheck = this.checkForSpam(content);
        if (spamCheck.isSpam) {
            result.flags.push('spam');
            result.score += 50;
            result.rejected = true;
            result.reason = 'spam_detected';
        }

        // Проверка правил контента
        const rulesCheck = this.checkContentRules(content, contentType);
        result.flags.push(...rulesCheck.flags);
        result.score += rulesCheck.score;

        if (rulesCheck.violations.length > 0) {
            result.requiresManualReview = true;
            result.flags.push('rule_violation');
        }

        // Проверка на дублирование
        const duplicateCheck = this.checkForDuplicates(content, contentType);
        if (duplicateCheck.isDuplicate) {
            result.flags.push('duplicate');
            result.score += 30;
            result.requiresManualReview = true;
        }

        // Проверка качества контента
        const qualityCheck = this.checkContentQuality(content, contentType);
        result.flags.push(...qualityCheck.flags);
        result.score += qualityCheck.score;

        if (qualityCheck.score > 70) {
            result.rejected = true;
            result.reason = 'low_quality';
        }

        // Определение необходимости ручной проверки
        if (result.score > 40 || result.flags.includes('rule_violation')) {
            result.requiresManualReview = true;
        }

        return result;
    }

    /**
     * Проверка на спам
     */
    checkForSpam(content) {
        const result = { isSpam: false, flags: [] };
        const text = this.extractText(content).toLowerCase();

        // Проверка ключевых слов спама
        const spamKeywords = this.spamFilters.get('spam_keywords');
        for (const keyword of spamKeywords) {
            if (text.includes(keyword)) {
                result.isSpam = true;
                result.flags.push(`spam_keyword: ${keyword}`);
            }
        }

        // Проверка подозрительных паттернов
        const suspiciousPatterns = this.spamFilters.get('suspicious_patterns');
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(text)) {
                result.isSpam = true;
                result.flags.push(`suspicious_pattern: ${pattern}`);
            }
        }

        // Проверка подозрительных доменов
        const suspiciousDomains = this.spamFilters.get('suspicious_domains');
        for (const domain of suspiciousDomains) {
            if (text.includes(domain)) {
                result.flags.push(`suspicious_domain: ${domain}`);
            }
        }

        return result;
    }

    /**
     * Проверка правил контента
     */
    checkContentRules(content, contentType) {
        const rules = this.contentRules.get(contentType);
        if (!rules) return { flags: [], score: 0, violations: [] };

        const result = { flags: [], score: 0, violations: [] };

        // Проверка длины заголовка
        if (content.title) {
            if (content.title.length < rules.minTitleLength) {
                result.violations.push('title_too_short');
                result.score += 10;
            }
            if (content.title.length > rules.maxTitleLength) {
                result.violations.push('title_too_long');
                result.score += 5;
            }
        }

        // Проверка длины описания
        if (content.description) {
            if (content.description.length < rules.minDescriptionLength) {
                result.violations.push('description_too_short');
                result.score += 15;
            }
            if (content.description.length > rules.maxDescriptionLength) {
                result.violations.push('description_too_long');
                result.score += 5;
            }
        }

        // Проверка обязательных полей
        for (const field of rules.requiredFields) {
            if (!content[field] || content[field].trim() === '') {
                result.violations.push(`missing_required_field: ${field}`);
                result.score += 20;
            }
        }

        // Проверка запрещенных слов
        const text = this.extractText(content).toLowerCase();
        for (const word of rules.forbiddenWords) {
            if (text.includes(word)) {
                result.violations.push(`forbidden_word: ${word}`);
                result.score += 25;
            }
        }

        // Проверка количества ссылок
        const linkCount = this.countLinks(content);
        if (linkCount > rules.maxLinks) {
            result.violations.push('too_many_links');
            result.score += 15;
        }

        // Проверка количества изображений
        const imageCount = this.countImages(content);
        if (imageCount > rules.maxImages) {
            result.violations.push('too_many_images');
            result.score += 10;
        }

        return result;
    }

    /**
     * Проверка на дублирование
     */
    checkForDuplicates(content, contentType) {
        const result = { isDuplicate: false, similarity: 0 };

        // Простая проверка на дублирование по хешу контента
        const contentHash = this.generateContentHash(content);
        
        // В реальном приложении здесь была бы проверка в базе данных
        // Для демонстрации используем простую проверку
        const recentContent = this.moderationQueue
            .filter(item => item.contentType === contentType)
            .slice(-10);

        for (const item of recentContent) {
            const similarity = this.calculateSimilarity(content, item.content);
            if (similarity > 0.8) {
                result.isDuplicate = true;
                result.similarity = similarity;
                break;
            }
        }

        return result;
    }

    /**
     * Проверка качества контента
     */
    checkContentQuality(content, contentType) {
        const result = { flags: [], score: 0 };
        const text = this.extractText(content);

        // Проверка читаемости
        const readability = this.calculateReadability(text);
        if (readability < 0.3) {
            result.flags.push('low_readability');
            result.score += 20;
        }

        // Проверка структуры
        const structure = this.checkContentStructure(content, contentType);
        result.flags.push(...structure.flags);
        result.score += structure.score;

        // Проверка полноты информации
        const completeness = this.checkContentCompleteness(content, contentType);
        result.flags.push(...completeness.flags);
        result.score += completeness.score;

        return result;
    }

    /**
     * Подача жалобы на контент
     */
    reportContent(contentId, contentType, reporterId, reason, description = '') {
        const report = {
            id: Date.now().toString(),
            contentId: contentId,
            contentType: contentType,
            reporterId: reporterId,
            reason: reason,
            description: description,
            timestamp: Date.now(),
            status: 'pending',
            priority: this.calculateReportPriority(reason),
            moderatorId: null,
            resolution: null,
            resolutionTimestamp: null
        };

        if (!this.reportedContent.has(contentId)) {
            this.reportedContent.set(contentId, []);
        }

        this.reportedContent.get(contentId).push(report);

        // Автоматическая обработка простых жалоб
        if (this.canAutoResolve(reason)) {
            this.autoResolveReport(report);
        } else {
            // Добавление в очередь модерации
            this.addToModerationQueue({
                type: 'report',
                report: report,
                priority: report.priority,
                timestamp: report.timestamp
            });
        }

        this.saveData();
        return report;
    }

    /**
     * Расчет приоритета жалобы
     */
    calculateReportPriority(reason) {
        const priorities = {
            'spam': 'high',
            'scam': 'high',
            'inappropriate': 'medium',
            'duplicate': 'low',
            'incomplete': 'low',
            'other': 'medium'
        };

        return priorities[reason] || 'medium';
    }

    /**
     * Автоматическое разрешение жалоб
     */
    canAutoResolve(reason) {
        return ['duplicate', 'incomplete'].includes(reason);
    }

    /**
     * Автоматическое разрешение жалобы
     */
    autoResolveReport(report) {
        report.status = 'resolved';
        report.resolution = 'auto_resolved';
        report.resolutionTimestamp = Date.now();

        // Применение автоматических действий
        switch (report.reason) {
            case 'duplicate':
                this.hideContent(report.contentId);
                break;
            case 'incomplete':
                this.flagForCompletion(report.contentId);
                break;
        }
    }

    /**
     * Добавление в очередь модерации
     */
    addToModerationQueue(item) {
        this.moderationQueue.push({
            ...item,
            id: Date.now().toString(),
            addedAt: Date.now(),
            status: 'pending'
        });

        // Сортировка по приоритету
        this.moderationQueue.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        });
    }

    /**
     * Получение очереди модерации
     */
    getModerationQueue(limit = 50) {
        return this.moderationQueue
            .filter(item => item.status === 'pending')
            .slice(0, limit);
    }

    /**
     * Обработка элемента модерации
     */
    processModerationItem(itemId, moderatorId, action, reason = '') {
        const item = this.moderationQueue.find(i => i.id === itemId);
        if (!item) return false;

        item.status = 'processed';
        item.moderatorId = moderatorId;
        item.action = action;
        item.reason = reason;
        item.processedAt = Date.now();

        // Применение действия
        switch (action) {
            case 'approve':
                this.approveContent(item.contentId);
                break;
            case 'reject':
                this.rejectContent(item.contentId, reason);
                break;
            case 'flag':
                this.flagContent(item.contentId, reason);
                break;
            case 'delete':
                this.deleteContent(item.contentId);
                break;
        }

        this.saveData();
        return true;
    }

    /**
     * Получение рейтинга доверия пользователя
     */
    getUserTrustScore(userId) {
        if (!this.userTrustScores.has(userId)) {
            this.userTrustScores.set(userId, {
                score: 50,
                history: [],
                lastUpdated: Date.now()
            });
        }
        return this.userTrustScores.get(userId).score;
    }

    /**
     * Обновление рейтинга доверия пользователя
     */
    updateUserTrustScore(userId, action, points) {
        const trustData = this.userTrustScores.get(userId) || {
            score: 50,
            history: [],
            lastUpdated: Date.now()
        };

        trustData.score = Math.max(0, Math.min(100, trustData.score + points));
        trustData.history.push({
            action: action,
            points: points,
            timestamp: Date.now()
        });
        trustData.lastUpdated = Date.now();

        this.userTrustScores.set(userId, trustData);
    }

    /**
     * Получение рейтинга работодателя
     */
    getEmployerRating(employerId) {
        if (!this.employerRatings.has(employerId)) {
            this.employerRatings.set(employerId, {
                rating: 0,
                reviews: [],
                verified: false,
                lastUpdated: Date.now()
            });
        }
        return this.employerRatings.get(employerId);
    }

    /**
     * Добавление отзыва о работодателе
     */
    addEmployerReview(employerId, reviewerId, rating, comment) {
        const employerData = this.getEmployerRating(employerId);
        
        const review = {
            id: Date.now().toString(),
            reviewerId: reviewerId,
            rating: rating,
            comment: comment,
            timestamp: Date.now(),
            moderated: false
        };

        employerData.reviews.push(review);
        
        // Пересчет рейтинга
        const totalRating = employerData.reviews.reduce((sum, r) => sum + r.rating, 0);
        employerData.rating = totalRating / employerData.reviews.length;
        employerData.lastUpdated = Date.now();

        this.employerRatings.set(employerId, employerData);
        this.saveData();
    }

    /**
     * Вспомогательные методы
     */
    extractText(content) {
        if (typeof content === 'string') return content;
        
        const textParts = [];
        if (content.title) textParts.push(content.title);
        if (content.description) textParts.push(content.description);
        if (content.comment) textParts.push(content.comment);
        if (content.message) textParts.push(content.message);
        
        return textParts.join(' ');
    }

    countLinks(content) {
        const text = this.extractText(content);
        const linkRegex = /https?:\/\/[^\s]+/g;
        return (text.match(linkRegex) || []).length;
    }

    countImages(content) {
        if (!content.images) return 0;
        return Array.isArray(content.images) ? content.images.length : 1;
    }

    generateContentHash(content) {
        const text = this.extractText(content);
        return btoa(text).slice(0, 10);
    }

    calculateSimilarity(content1, content2) {
        const text1 = this.extractText(content1);
        const text2 = this.extractText(content2);
        
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return intersection.length / union.length;
    }

    calculateReadability(text) {
        const sentences = text.split(/[.!?]+/).length;
        const words = text.split(/\s+/).length;
        const syllables = this.countSyllables(text);
        
        if (sentences === 0 || words === 0) return 0;
        
        // Flesch Reading Ease
        return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    }

    countSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        let count = 0;
        
        for (const word of words) {
            count += this.countWordSyllables(word);
        }
        
        return count;
    }

    countWordSyllables(word) {
        word = word.toLowerCase();
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    checkContentStructure(content, contentType) {
        const result = { flags: [], score: 0 };
        
        // Проверка структуры в зависимости от типа контента
        switch (contentType) {
            case 'job_posting':
                if (!content.location) {
                    result.flags.push('missing_location');
                    result.score += 10;
                }
                if (!content.salary) {
                    result.flags.push('missing_salary');
                    result.score += 5;
                }
                break;
            case 'user_profile':
                if (!content.skills || content.skills.length === 0) {
                    result.flags.push('missing_skills');
                    result.score += 10;
                }
                break;
        }
        
        return result;
    }

    checkContentCompleteness(content, contentType) {
        const result = { flags: [], score: 0 };
        
        const text = this.extractText(content);
        const wordCount = text.split(/\s+/).length;
        
        if (wordCount < 20) {
            result.flags.push('too_short');
            result.score += 15;
        }
        
        return result;
    }

    // Действия модерации
    approveContent(contentId) {
        console.log(`Контент ${contentId} одобрен`);
        this.updateUserTrustScore(contentId, 'content_approved', 5);
    }

    rejectContent(contentId, reason) {
        console.log(`Контент ${contentId} отклонен: ${reason}`);
        this.updateUserTrustScore(contentId, 'content_rejected', -10);
    }

    flagContent(contentId, reason) {
        console.log(`Контент ${contentId} помечен: ${reason}`);
        this.updateUserTrustScore(contentId, 'content_flagged', -5);
    }

    deleteContent(contentId) {
        console.log(`Контент ${contentId} удален`);
        this.updateUserTrustScore(contentId, 'content_deleted', -20);
    }

    hideContent(contentId) {
        console.log(`Контент ${contentId} скрыт`);
    }

    flagForCompletion(contentId) {
        console.log(`Контент ${contentId} помечен для доработки`);
    }

    saveModerationHistory(result) {
        this.moderationHistory.set(result.contentId, {
            ...result,
            timestamp: Date.now()
        });
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка событий модерации
        document.addEventListener('contentModeration', (e) => {
            const { content, contentType, userId } = e.detail;
            this.moderateContent(content, contentType, userId);
        });

        // Обработка жалоб
        document.addEventListener('reportContent', (e) => {
            const { contentId, contentType, reporterId, reason, description } = e.detail;
            this.reportContent(contentId, contentType, reporterId, reason, description);
        });
    }

    /**
     * Получение статистики модерации
     */
    getModerationStats() {
        const pending = this.moderationQueue.filter(item => item.status === 'pending').length;
        const processed = this.moderationQueue.filter(item => item.status === 'processed').length;
        const reports = Array.from(this.reportedContent.values()).flat().length;
        const activeReports = Array.from(this.reportedContent.values())
            .flat()
            .filter(report => report.status === 'pending').length;

        return {
            queueSize: pending,
            processedItems: processed,
            totalReports: reports,
            activeReports: activeReports,
            autoModerationEnabled: this.autoModerationEnabled
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим модерации контента');
        
        // Создание тестового контента
        const testContent = [
            {
                id: 'test-job-1',
                title: 'Frontend Developer',
                description: 'We are looking for a skilled frontend developer...',
                location: 'Prague',
                salary: '50000 CZK'
            },
            {
                id: 'test-job-2',
                title: 'MAKE MONEY FAST!!! $$$',
                description: 'Earn $1000 per day working from home!',
                location: 'Remote',
                salary: '1000 USD'
            },
            {
                id: 'test-profile-1',
                name: 'John Doe',
                bio: 'Experienced developer with 5 years of experience',
                skills: ['JavaScript', 'React', 'Node.js']
            }
        ];

        // Тестирование модерации
        testContent.forEach((content, index) => {
            setTimeout(() => {
                const contentType = content.title ? 'job_posting' : 'user_profile';
                this.moderateContent(content, contentType, `user-${index + 1}`);
            }, index * 2000);
        });

        // Тестирование жалоб
        setTimeout(() => {
            this.reportContent('test-job-2', 'job_posting', 'user-1', 'spam', 'This looks like spam');
        }, 6000);

        return {
            stats: this.getModerationStats(),
            testContent: testContent.length
        };
    }
}

// Экспорт для использования в других модулях
window.ContentModerationSystem = ContentModerationSystem; 