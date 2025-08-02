/**
 * Система отзывов и рейтингов
 * Управление отзывами, рейтингами, верификацией и модерацией
 */

class ReviewsSystem {
    constructor() {
        this.reviews = new Map();
        this.ratings = new Map();
        this.employerRatings = new Map();
        this.candidateRatings = new Map();
        this.verifications = new Map();
        this.reports = new Map();
        this.categories = new Map();
        this.badges = new Map();
        this.init();
    }

    /**
     * Инициализация системы отзывов
     */
    init() {
        this.loadData();
        this.initializeCategories();
        this.initializeBadges();
        this.setupEventListeners();
        console.log('⭐ Система отзывов и рейтингов инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedReviews = localStorage.getItem('reviews');
            const savedRatings = localStorage.getItem('ratings');
            const savedEmployerRatings = localStorage.getItem('employerRatings');
            const savedCandidateRatings = localStorage.getItem('candidateRatings');
            const savedVerifications = localStorage.getItem('verifications');
            const savedReports = localStorage.getItem('reports');

            if (savedReviews) this.reviews = new Map(JSON.parse(savedReviews));
            if (savedRatings) this.ratings = new Map(JSON.parse(savedRatings));
            if (savedEmployerRatings) this.employerRatings = new Map(JSON.parse(savedEmployerRatings));
            if (savedCandidateRatings) this.candidateRatings = new Map(JSON.parse(savedCandidateRatings));
            if (savedVerifications) this.verifications = new Map(JSON.parse(savedVerifications));
            if (savedReports) this.reports = new Map(JSON.parse(savedReports));
        } catch (error) {
            console.error('Ошибка загрузки данных отзывов:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('reviews', JSON.stringify(Array.from(this.reviews.entries())));
            localStorage.setItem('ratings', JSON.stringify(Array.from(this.ratings.entries())));
            localStorage.setItem('employerRatings', JSON.stringify(Array.from(this.employerRatings.entries())));
            localStorage.setItem('candidateRatings', JSON.stringify(Array.from(this.candidateRatings.entries())));
            localStorage.setItem('verifications', JSON.stringify(Array.from(this.verifications.entries())));
            localStorage.setItem('reports', JSON.stringify(Array.from(this.reports.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных отзывов:', error);
        }
    }

    /**
     * Инициализация категорий рейтингов
     */
    initializeCategories() {
        const categories = [
            {
                id: 'salary',
                name: 'Зарплата',
                description: 'Конкурентоспособность зарплаты',
                icon: '💰',
                weight: 0.25
            },
            {
                id: 'work_environment',
                name: 'Рабочая среда',
                description: 'Условия работы и атмосфера',
                icon: '🏢',
                weight: 0.20
            },
            {
                id: 'career_growth',
                name: 'Карьерный рост',
                description: 'Возможности развития',
                icon: '📈',
                weight: 0.20
            },
            {
                id: 'work_life_balance',
                name: 'Work-Life Balance',
                description: 'Баланс работы и личной жизни',
                icon: '⚖️',
                weight: 0.15
            },
            {
                id: 'management',
                name: 'Менеджмент',
                description: 'Качество руководства',
                icon: '👥',
                weight: 0.10
            },
            {
                id: 'benefits',
                name: 'Бенефиты',
                description: 'Дополнительные преимущества',
                icon: '🎁',
                weight: 0.10
            }
        ];

        categories.forEach(category => {
            this.categories.set(category.id, category);
        });
    }

    /**
     * Инициализация бейджей
     */
    initializeBadges() {
        const badges = [
            {
                id: 'verified_reviewer',
                name: 'Верифицированный рецензент',
                description: 'Отзыв подтвержден как реальный',
                icon: '✅',
                color: '#10b981'
            },
            {
                id: 'top_reviewer',
                name: 'Топ рецензент',
                description: 'Один из лучших рецензентов',
                icon: '🏆',
                color: '#f59e0b'
            },
            {
                id: 'helpful_reviewer',
                name: 'Полезный рецензент',
                description: 'Отзывы часто отмечают как полезные',
                icon: '👍',
                color: '#3b82f6'
            },
            {
                id: 'detailed_reviewer',
                name: 'Детальный рецензент',
                description: 'Пишет подробные отзывы',
                icon: '📝',
                color: '#8b5cf6'
            },
            {
                id: 'recent_experience',
                name: 'Недавний опыт',
                description: 'Работал в компании недавно',
                icon: '🕒',
                color: '#06b6d4'
            },
            {
                id: 'long_term_employee',
                name: 'Долгосрочный сотрудник',
                description: 'Работал в компании более 2 лет',
                icon: '⏰',
                color: '#ec4899'
            }
        ];

        badges.forEach(badge => {
            this.badges.set(badge.id, badge);
        });
    }

    /**
     * Создание отзыва
     */
    createReview(reviewData) {
        const reviewId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const review = {
            id: reviewId,
            authorId: reviewData.authorId,
            targetId: reviewData.targetId,
            targetType: reviewData.targetType, // 'employer', 'candidate', 'job'
            title: reviewData.title,
            content: reviewData.content,
            rating: reviewData.rating,
            categoryRatings: reviewData.categoryRatings || {},
            pros: reviewData.pros || [],
            cons: reviewData.cons || [],
            recommendations: reviewData.recommendations || [],
            isAnonymous: reviewData.isAnonymous || false,
            isVerified: false,
            isHelpful: 0,
            isNotHelpful: 0,
            helpfulVotes: new Set(),
            notHelpfulVotes: new Set(),
            badges: [],
            status: 'pending', // pending, approved, rejected, flagged
            createdAt: Date.now(),
            updatedAt: Date.now(),
            employmentPeriod: reviewData.employmentPeriod || null,
            position: reviewData.position || null,
            location: reviewData.location || null
        };

        // Автоматическая верификация
        this.verifyReview(reviewId);

        this.reviews.set(reviewId, review);
        this.updateRatings(reviewData.targetId, reviewData.targetType);
        this.saveData();

        return review;
    }

    /**
     * Верификация отзыва
     */
    verifyReview(reviewId) {
        const review = this.reviews.get(reviewId);
        if (!review) return;

        const verificationScore = this.calculateVerificationScore(review);
        const isVerified = verificationScore >= 0.7;

        review.isVerified = isVerified;
        review.verificationScore = verificationScore;

        // Добавление бейджей
        const badges = [];
        
        if (isVerified) {
            badges.push('verified_reviewer');
        }

        if (review.employmentPeriod && review.employmentPeriod.duration > 24) {
            badges.push('long_term_employee');
        } else if (review.employmentPeriod && review.employmentPeriod.duration < 6) {
            badges.push('recent_experience');
        }

        if (review.content.length > 500) {
            badges.push('detailed_reviewer');
        }

        review.badges = badges;
        this.reviews.set(reviewId, review);

        // Сохранение верификации
        this.verifications.set(reviewId, {
            reviewId: reviewId,
            score: verificationScore,
            isVerified: isVerified,
            badges: badges,
            verifiedAt: Date.now()
        });
    }

    /**
     * Расчет скора верификации
     */
    calculateVerificationScore(review) {
        let score = 0;
        let factors = 0;

        // Длина отзыва
        if (review.content.length > 200) {
            score += 0.2;
        }
        factors++;

        // Детализация
        if (review.pros.length > 0 || review.cons.length > 0) {
            score += 0.2;
        }
        factors++;

        // Период работы
        if (review.employmentPeriod) {
            score += 0.2;
        }
        factors++;

        // Позиция
        if (review.position) {
            score += 0.1;
        }
        factors++;

        // Локация
        if (review.location) {
            score += 0.1;
        }
        factors++;

        // Категорийные рейтинги
        if (Object.keys(review.categoryRatings).length > 0) {
            score += 0.2;
        }
        factors++;

        return factors > 0 ? score / factors : 0;
    }

    /**
     * Обновление рейтингов
     */
    updateRatings(targetId, targetType) {
        const targetReviews = Array.from(this.reviews.values())
            .filter(review => review.targetId === targetId && 
                             review.targetType === targetType && 
                             review.status === 'approved');

        if (targetReviews.length === 0) return;

        const overallRating = this.calculateOverallRating(targetReviews);
        const categoryRatings = this.calculateCategoryRatings(targetReviews);

        const rating = {
            targetId: targetId,
            targetType: targetType,
            overallRating: overallRating,
            categoryRatings: categoryRatings,
            totalReviews: targetReviews.length,
            verifiedReviews: targetReviews.filter(r => r.isVerified).length,
            lastUpdated: Date.now()
        };

        this.ratings.set(`${targetType}_${targetId}`, rating);

        // Сохранение в соответствующие коллекции
        if (targetType === 'employer') {
            this.employerRatings.set(targetId, rating);
        } else if (targetType === 'candidate') {
            this.candidateRatings.set(targetId, rating);
        }
    }

    /**
     * Расчет общего рейтинга
     */
    calculateOverallRating(reviews) {
        if (reviews.length === 0) return 0;

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return Math.round((totalRating / reviews.length) * 10) / 10;
    }

    /**
     * Расчет рейтингов по категориям
     */
    calculateCategoryRatings(reviews) {
        const categoryRatings = {};

        for (const [categoryId, category] of this.categories) {
            const categoryReviews = reviews.filter(review => 
                review.categoryRatings && review.categoryRatings[categoryId]
            );

            if (categoryReviews.length > 0) {
                const totalRating = categoryReviews.reduce((sum, review) => 
                    sum + review.categoryRatings[categoryId], 0
                );
                categoryRatings[categoryId] = Math.round((totalRating / categoryReviews.length) * 10) / 10;
            }
        }

        return categoryRatings;
    }

    /**
     * Получение рейтинга
     */
    getRating(targetId, targetType) {
        return this.ratings.get(`${targetType}_${targetId}`) || {
            targetId: targetId,
            targetType: targetType,
            overallRating: 0,
            categoryRatings: {},
            totalReviews: 0,
            verifiedReviews: 0,
            lastUpdated: Date.now()
        };
    }

    /**
     * Получение отзывов
     */
    getReviews(targetId, targetType, options = {}) {
        let reviews = Array.from(this.reviews.values())
            .filter(review => review.targetId === targetId && 
                             review.targetType === targetType);

        // Фильтрация по статусу
        if (options.status) {
            reviews = reviews.filter(review => review.status === options.status);
        } else {
            reviews = reviews.filter(review => review.status === 'approved');
        }

        // Фильтрация по верификации
        if (options.verifiedOnly) {
            reviews = reviews.filter(review => review.isVerified);
        }

        // Сортировка
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';

        reviews.sort((a, b) => {
            if (sortOrder === 'desc') {
                return b[sortBy] - a[sortBy];
            } else {
                return a[sortBy] - b[sortBy];
            }
        });

        // Пагинация
        if (options.limit) {
            reviews = reviews.slice(0, options.limit);
        }

        return reviews;
    }

    /**
     * Голосование за полезность отзыва
     */
    voteHelpful(reviewId, userId, isHelpful) {
        const review = this.reviews.get(reviewId);
        if (!review) return false;

        if (isHelpful) {
            if (review.helpfulVotes.has(userId)) {
                review.helpfulVotes.delete(userId);
                review.isHelpful--;
            } else {
                review.helpfulVotes.add(userId);
                review.isHelpful++;
                review.notHelpfulVotes.delete(userId);
                review.isNotHelpful = Math.max(0, review.isNotHelpful - 1);
            }
        } else {
            if (review.notHelpfulVotes.has(userId)) {
                review.notHelpfulVotes.delete(userId);
                review.isNotHelpful--;
            } else {
                review.notHelpfulVotes.add(userId);
                review.isNotHelpful++;
                review.helpfulVotes.delete(userId);
                review.isHelpful = Math.max(0, review.isHelpful - 1);
            }
        }

        // Обновление бейджей
        if (review.isHelpful >= 10) {
            if (!review.badges.includes('helpful_reviewer')) {
                review.badges.push('helpful_reviewer');
            }
        }

        this.reviews.set(reviewId, review);
        this.saveData();

        return true;
    }

    /**
     * Создание жалобы на отзыв
     */
    reportReview(reviewId, reporterId, reason, description) {
        const reportId = 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const report = {
            id: reportId,
            reviewId: reviewId,
            reporterId: reporterId,
            reason: reason,
            description: description,
            status: 'pending', // pending, reviewed, resolved, dismissed
            createdAt: Date.now(),
            reviewedAt: null,
            reviewedBy: null,
            resolution: null
        };

        this.reports.set(reportId, report);

        // Автоматическая проверка на множественные жалобы
        this.checkMultipleReports(reviewId);

        this.saveData();
        return report;
    }

    /**
     * Проверка множественных жалоб
     */
    checkMultipleReports(reviewId) {
        const reports = Array.from(this.reports.values())
            .filter(report => report.reviewId === reviewId && report.status === 'pending');

        if (reports.length >= 3) {
            // Автоматическая блокировка отзыва при множественных жалобах
            const review = this.reviews.get(reviewId);
            if (review) {
                review.status = 'flagged';
                this.reviews.set(reviewId, review);
            }
        }
    }

    /**
     * Модерация отзыва
     */
    moderateReview(reviewId, moderatorId, action, reason = '') {
        const review = this.reviews.get(reviewId);
        if (!review) return false;

        review.status = action;
        review.moderatedBy = moderatorId;
        review.moderatedAt = Date.now();
        review.moderationReason = reason;

        this.reviews.set(reviewId, review);

        // Обновление рейтингов если отзыв отклонен
        if (action === 'rejected') {
            this.updateRatings(review.targetId, review.targetType);
        }

        this.saveData();
        return true;
    }

    /**
     * Создание отзыва о работодателе
     */
    createEmployerReview(employerId, authorId, reviewData) {
        const data = {
            ...reviewData,
            targetId: employerId,
            targetType: 'employer',
            authorId: authorId
        };

        return this.createReview(data);
    }

    /**
     * Создание отзыва о кандидате
     */
    createCandidateReview(candidateId, authorId, reviewData) {
        const data = {
            ...reviewData,
            targetId: candidateId,
            targetType: 'candidate',
            authorId: authorId
        };

        return this.createReview(data);
    }

    /**
     * Создание отзыва о вакансии
     */
    createJobReview(jobId, authorId, reviewData) {
        const data = {
            ...reviewData,
            targetId: jobId,
            targetType: 'job',
            authorId: authorId
        };

        return this.createReview(data);
    }

    /**
     * Получение топ работодателей
     */
    getTopEmployers(limit = 10) {
        const employers = Array.from(this.employerRatings.values())
            .filter(rating => rating.totalReviews >= 5)
            .sort((a, b) => b.overallRating - a.overallRating)
            .slice(0, limit);

        return employers;
    }

    /**
     * Получение топ кандидатов
     */
    getTopCandidates(limit = 10) {
        const candidates = Array.from(this.candidateRatings.values())
            .filter(rating => rating.totalReviews >= 3)
            .sort((a, b) => b.overallRating - a.overallRating)
            .slice(0, limit);

        return candidates;
    }

    /**
     * Получение статистики отзывов
     */
    getReviewsStats() {
        const reviews = Array.from(this.reviews.values());
        const approvedReviews = reviews.filter(r => r.status === 'approved');
        const verifiedReviews = reviews.filter(r => r.isVerified);

        return {
            totalReviews: reviews.length,
            approvedReviews: approvedReviews.length,
            verifiedReviews: verifiedReviews.length,
            pendingReviews: reviews.filter(r => r.status === 'pending').length,
            flaggedReviews: reviews.filter(r => r.status === 'flagged').length,
            totalReports: Array.from(this.reports.values()).length,
            pendingReports: Array.from(this.reports.values()).filter(r => r.status === 'pending').length,
            averageRating: approvedReviews.length > 0 ? 
                approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length : 0
        };
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка создания отзыва
        document.addEventListener('createReview', (e) => {
            const { reviewData } = e.detail;
            this.createReview(reviewData);
        });

        // Обработка голосования
        document.addEventListener('voteReview', (e) => {
            const { reviewId, userId, isHelpful } = e.detail;
            this.voteHelpful(reviewId, userId, isHelpful);
        });

        // Обработка жалобы
        document.addEventListener('reportReview', (e) => {
            const { reviewId, reporterId, reason, description } = e.detail;
            this.reportReview(reviewId, reporterId, reason, description);
        });
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим системы отзывов');
        
        // Создание тестовых отзывов
        const testReviews = [
            {
                authorId: 'user-1',
                targetId: 'employer-1',
                targetType: 'employer',
                title: 'Отличная компания для развития',
                content: 'Работал в компании 2 года. Очень доволен условиями работы, возможностями для роста и командой. Зарплата конкурентоспособная, бенефиты отличные.',
                rating: 4.5,
                categoryRatings: {
                    salary: 4.0,
                    work_environment: 5.0,
                    career_growth: 4.5,
                    work_life_balance: 4.0,
                    management: 4.5,
                    benefits: 5.0
                },
                pros: ['Отличная команда', 'Возможности роста', 'Хорошие бенефиты'],
                cons: ['Иногда много работы'],
                recommendations: ['Рекомендую для карьерного роста'],
                employmentPeriod: { start: '2022-01-01', end: '2024-01-01', duration: 24 },
                position: 'Frontend Developer',
                location: 'Prague'
            },
            {
                authorId: 'user-2',
                targetId: 'employer-1',
                targetType: 'employer',
                title: 'Хорошо, но есть нюансы',
                content: 'Компания в целом хорошая, но есть проблемы с менеджментом. Зарплата достойная, но work-life balance мог бы быть лучше.',
                rating: 3.5,
                categoryRatings: {
                    salary: 4.0,
                    work_environment: 3.5,
                    career_growth: 3.0,
                    work_life_balance: 2.5,
                    management: 3.0,
                    benefits: 4.0
                },
                pros: ['Хорошая зарплата', 'Интересные проекты'],
                cons: ['Проблемы с менеджментом', 'Плохой work-life balance'],
                recommendations: ['Подходит для получения опыта'],
                employmentPeriod: { start: '2023-06-01', end: '2024-01-01', duration: 7 },
                position: 'Backend Developer',
                location: 'Prague'
            }
        ];

        testReviews.forEach(reviewData => {
            this.createReview(reviewData);
        });

        return {
            stats: this.getReviewsStats(),
            topEmployers: this.getTopEmployers(),
            topCandidates: this.getTopCandidates(),
            categories: Array.from(this.categories.values()),
            badges: Array.from(this.badges.values())
        };
    }
}

// Экспорт для использования в других модулях
window.ReviewsSystem = ReviewsSystem; 