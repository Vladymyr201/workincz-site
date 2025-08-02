/**
 * Система машинного обучения для персонализированных рекомендаций вакансий
 * Включает алгоритмы сопоставления, ранжирования и обратную связь
 */

class RecommendationEngine {
    constructor() {
        this.userProfiles = new Map();
        this.jobFeatures = new Map();
        this.userBehavior = new Map();
        this.recommendationHistory = new Map();
        this.algorithmWeights = {
            skills: 0.4,
            location: 0.2,
            salary: 0.15,
            experience: 0.15,
            behavior: 0.1
        };
        this.init();
    }

    /**
     * Инициализация системы рекомендаций
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        console.log('🎯 Система рекомендаций инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedProfiles = localStorage.getItem('userProfiles');
            const savedFeatures = localStorage.getItem('jobFeatures');
            const savedBehavior = localStorage.getItem('userBehavior');
            const savedHistory = localStorage.getItem('recommendationHistory');

            if (savedProfiles) this.userProfiles = new Map(JSON.parse(savedProfiles));
            if (savedFeatures) this.jobFeatures = new Map(JSON.parse(savedFeatures));
            if (savedBehavior) this.userBehavior = new Map(JSON.parse(savedBehavior));
            if (savedHistory) this.recommendationHistory = new Map(JSON.parse(savedHistory));
        } catch (error) {
            console.error('Ошибка загрузки данных рекомендаций:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('userProfiles', JSON.stringify(Array.from(this.userProfiles.entries())));
            localStorage.setItem('jobFeatures', JSON.stringify(Array.from(this.jobFeatures.entries())));
            localStorage.setItem('userBehavior', JSON.stringify(Array.from(this.userBehavior.entries())));
            localStorage.setItem('recommendationHistory', JSON.stringify(Array.from(this.recommendationHistory.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных рекомендаций:', error);
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Отслеживание кликов по вакансиям
        document.addEventListener('click', (e) => {
            if (e.target.closest('.job-card')) {
                const jobId = e.target.closest('.job-card').dataset.jobId;
                this.recordJobClick(jobId);
            }
        });

        // Отслеживание поисковых запросов
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                const searchQuery = e.target.querySelector('input[name="query"]')?.value;
                if (searchQuery) {
                    this.recordSearchQuery(searchQuery);
                }
            });
        }
    }

    /**
     * Анализ профиля пользователя
     */
    analyzeUserProfile(userId) {
        const profile = {
            skills: new Set(),
            preferredLocations: new Set(),
            salaryRange: { min: 0, max: 0 },
            experienceLevel: 'entry',
            jobTypes: new Set(),
            industries: new Set(),
            lastActivity: Date.now()
        };

        // Анализ истории поиска
        const searchHistory = this.userBehavior.get(userId)?.searches || [];
        searchHistory.forEach(search => {
            profile.preferredLocations.add(search.location);
            profile.salaryRange.min = Math.min(profile.salaryRange.min, search.salaryMin || 0);
            profile.salaryRange.max = Math.max(profile.salaryRange.max, search.salaryMax || 0);
        });

        // Анализ кликов по вакансиям
        const clickHistory = this.userBehavior.get(userId)?.clicks || [];
        clickHistory.forEach(click => {
            const jobFeatures = this.jobFeatures.get(click.jobId);
            if (jobFeatures) {
                jobFeatures.skills.forEach(skill => profile.skills.add(skill));
                profile.jobTypes.add(jobFeatures.jobType);
                profile.industries.add(jobFeatures.industry);
            }
        });

        this.userProfiles.set(userId, profile);
        this.saveData();
        return profile;
    }

    /**
     * Извлечение признаков вакансии
     */
    extractJobFeatures(job) {
        const features = {
            skills: new Set(job.skills || []),
            location: job.location,
            salary: job.salary || 0,
            experience: job.experience || 'entry',
            jobType: job.jobType || 'full-time',
            industry: job.industry || 'other',
            company: job.company,
            remote: job.remote || false,
            benefits: new Set(job.benefits || []),
            requirements: job.requirements || ''
        };

        this.jobFeatures.set(job.id, features);
        this.saveData();
        return features;
    }

    /**
     * Алгоритм сопоставления вакансий с пользователем
     */
    calculateJobMatch(userId, jobId) {
        const userProfile = this.userProfiles.get(userId);
        const jobFeatures = this.jobFeatures.get(jobId);

        if (!userProfile || !jobFeatures) return 0;

        let totalScore = 0;
        let maxScore = 0;

        // Сопоставление навыков (40% веса)
        const skillScore = this.calculateSkillMatch(userProfile.skills, jobFeatures.skills);
        totalScore += skillScore * this.algorithmWeights.skills;
        maxScore += this.algorithmWeights.skills;

        // Сопоставление локации (20% веса)
        const locationScore = this.calculateLocationMatch(userProfile.preferredLocations, jobFeatures.location);
        totalScore += locationScore * this.algorithmWeights.location;
        maxScore += this.algorithmWeights.location;

        // Сопоставление зарплаты (15% веса)
        const salaryScore = this.calculateSalaryMatch(userProfile.salaryRange, jobFeatures.salary);
        totalScore += salaryScore * this.algorithmWeights.salary;
        maxScore += this.algorithmWeights.salary;

        // Сопоставление опыта (15% веса)
        const experienceScore = this.calculateExperienceMatch(userProfile.experienceLevel, jobFeatures.experience);
        totalScore += experienceScore * this.algorithmWeights.experience;
        maxScore += this.algorithmWeights.experience;

        // Поведенческий анализ (10% веса)
        const behaviorScore = this.calculateBehaviorScore(userId, jobId);
        totalScore += behaviorScore * this.algorithmWeights.behavior;
        maxScore += this.algorithmWeights.behavior;

        return maxScore > 0 ? totalScore / maxScore : 0;
    }

    /**
     * Расчет соответствия навыков
     */
    calculateSkillMatch(userSkills, jobSkills) {
        if (userSkills.size === 0 || jobSkills.size === 0) return 0.5;

        const intersection = new Set([...userSkills].filter(skill => jobSkills.has(skill)));
        const union = new Set([...userSkills, ...jobSkills]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }

    /**
     * Расчет соответствия локации
     */
    calculateLocationMatch(userLocations, jobLocation) {
        if (userLocations.size === 0) return 0.5;
        return userLocations.has(jobLocation) ? 1 : 0;
    }

    /**
     * Расчет соответствия зарплаты
     */
    calculateSalaryMatch(userSalaryRange, jobSalary) {
        if (userSalaryRange.max === 0 || jobSalary === 0) return 0.5;

        const userMid = (userSalaryRange.min + userSalaryRange.max) / 2;
        const difference = Math.abs(userMid - jobSalary) / userMid;

        return Math.max(0, 1 - difference);
    }

    /**
     * Расчет соответствия опыта
     */
    calculateExperienceMatch(userExperience, jobExperience) {
        const experienceLevels = ['entry', 'junior', 'middle', 'senior', 'lead'];
        const userIndex = experienceLevels.indexOf(userExperience);
        const jobIndex = experienceLevels.indexOf(jobExperience);

        if (userIndex === -1 || jobIndex === -1) return 0.5;

        const difference = Math.abs(userIndex - jobIndex);
        return Math.max(0, 1 - difference / experienceLevels.length);
    }

    /**
     * Расчет поведенческого скора
     */
    calculateBehaviorScore(userId, jobId) {
        const behavior = this.userBehavior.get(userId);
        if (!behavior) return 0.5;

        let score = 0.5;
        let count = 0;

        // Анализ похожих вакансий
        const similarJobs = this.findSimilarJobs(jobId);
        similarJobs.forEach(similarJob => {
            const clicks = behavior.clicks?.filter(click => click.jobId === similarJob.id) || [];
            if (clicks.length > 0) {
                score += 0.1;
                count++;
            }
        });

        return count > 0 ? score / count : 0.5;
    }

    /**
     * Поиск похожих вакансий
     */
    findSimilarJobs(jobId, limit = 5) {
        const targetFeatures = this.jobFeatures.get(jobId);
        if (!targetFeatures) return [];

        const similarities = [];
        this.jobFeatures.forEach((features, id) => {
            if (id === jobId) return;

            const similarity = this.calculateJobSimilarity(targetFeatures, features);
            similarities.push({ id, similarity });
        });

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => ({ id: item.id, similarity: item.similarity }));
    }

    /**
     * Расчет схожести вакансий
     */
    calculateJobSimilarity(features1, features2) {
        let score = 0;
        let maxScore = 0;

        // Схожесть навыков
        const skillSimilarity = this.calculateSkillMatch(features1.skills, features2.skills);
        score += skillSimilarity * 0.4;
        maxScore += 0.4;

        // Схожесть индустрии
        const industryMatch = features1.industry === features2.industry ? 1 : 0;
        score += industryMatch * 0.3;
        maxScore += 0.3;

        // Схожесть типа работы
        const jobTypeMatch = features1.jobType === features2.jobType ? 1 : 0;
        score += jobTypeMatch * 0.2;
        maxScore += 0.2;

        // Схожесть локации
        const locationMatch = features1.location === features2.location ? 1 : 0;
        score += locationMatch * 0.1;
        maxScore += 0.1;

        return maxScore > 0 ? score / maxScore : 0;
    }

    /**
     * Генерация персонализированных рекомендаций
     */
    generateRecommendations(userId, limit = 10) {
        const userProfile = this.userProfiles.get(userId);
        if (!userProfile) {
            this.analyzeUserProfile(userId);
        }

        const recommendations = [];
        this.jobFeatures.forEach((features, jobId) => {
            const matchScore = this.calculateJobMatch(userId, jobId);
            recommendations.push({ jobId, matchScore, features });
        });

        // Сортировка по релевантности
        recommendations.sort((a, b) => b.matchScore - a.matchScore);

        // Применение разнообразия (diversity)
        const diverseRecommendations = this.applyDiversity(recommendations.slice(0, limit * 2), limit);

        // Сохранение истории рекомендаций
        this.recommendationHistory.set(userId, {
            timestamp: Date.now(),
            recommendations: diverseRecommendations.slice(0, limit)
        });

        this.saveData();
        return diverseRecommendations.slice(0, limit);
    }

    /**
     * Применение разнообразия к рекомендациям
     */
    applyDiversity(recommendations, limit) {
        if (recommendations.length <= limit) return recommendations;

        const diverse = [recommendations[0]];
        const usedIndustries = new Set([recommendations[0].features.industry]);
        const usedLocations = new Set([recommendations[0].features.location]);

        for (let i = 1; i < recommendations.length && diverse.length < limit; i++) {
            const rec = recommendations[i];
            const industryDiversity = !usedIndustries.has(rec.features.industry);
            const locationDiversity = !usedLocations.has(rec.features.location);

            if (industryDiversity || locationDiversity) {
                diverse.push(rec);
                usedIndustries.add(rec.features.industry);
                usedLocations.add(rec.features.location);
            }
        }

        // Дополнение до лимита
        while (diverse.length < limit && recommendations.length > diverse.length) {
            const remaining = recommendations.filter(r => !diverse.includes(r));
            if (remaining.length > 0) {
                diverse.push(remaining[0]);
            } else {
                break;
            }
        }

        return diverse;
    }

    /**
     * Запись клика по вакансии
     */
    recordJobClick(jobId) {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        if (!this.userBehavior.has(userId)) {
            this.userBehavior.set(userId, { clicks: [], searches: [] });
        }

        const behavior = this.userBehavior.get(userId);
        behavior.clicks.push({
            jobId,
            timestamp: Date.now()
        });

        // Ограничение истории
        if (behavior.clicks.length > 100) {
            behavior.clicks = behavior.clicks.slice(-50);
        }

        this.saveData();
        this.updateUserProfile(userId);
    }

    /**
     * Запись поискового запроса
     */
    recordSearchQuery(query) {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        if (!this.userBehavior.has(userId)) {
            this.userBehavior.set(userId, { clicks: [], searches: [] });
        }

        const behavior = this.userBehavior.get(userId);
        behavior.searches.push({
            query,
            timestamp: Date.now()
        });

        // Ограничение истории
        if (behavior.searches.length > 50) {
            behavior.searches = behavior.searches.slice(-25);
        }

        this.saveData();
        this.updateUserProfile(userId);
    }

    /**
     * Обновление профиля пользователя
     */
    updateUserProfile(userId) {
        const profile = this.userProfiles.get(userId);
        if (profile) {
            profile.lastActivity = Date.now();
            this.analyzeUserProfile(userId);
        }
    }

    /**
     * Получение ID текущего пользователя
     */
    getCurrentUserId() {
        // Интеграция с существующей системой аутентификации
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return user?.id || 'anonymous';
    }

    /**
     * Обратная связь для улучшения рекомендаций
     */
    recordFeedback(userId, jobId, feedback) {
        const history = this.recommendationHistory.get(userId);
        if (history) {
            const recommendation = history.recommendations.find(r => r.jobId === jobId);
            if (recommendation) {
                recommendation.feedback = feedback;
                recommendation.feedbackTimestamp = Date.now();
            }
        }

        // Адаптация весов алгоритма на основе обратной связи
        this.adaptAlgorithmWeights(feedback);
        this.saveData();
    }

    /**
     * Адаптация весов алгоритма
     */
    adaptAlgorithmWeights(feedback) {
        const learningRate = 0.01;
        
        if (feedback === 'positive') {
            // Увеличиваем веса успешных факторов
            this.algorithmWeights.skills += learningRate;
            this.algorithmWeights.behavior += learningRate;
        } else if (feedback === 'negative') {
            // Уменьшаем веса неуспешных факторов
            this.algorithmWeights.skills -= learningRate;
            this.algorithmWeights.behavior -= learningRate;
        }

        // Нормализация весов
        const totalWeight = Object.values(this.algorithmWeights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(this.algorithmWeights).forEach(key => {
            this.algorithmWeights[key] /= totalWeight;
        });
    }

    /**
     * Получение статистики рекомендаций
     */
    getRecommendationStats() {
        const stats = {
            totalUsers: this.userProfiles.size,
            totalJobs: this.jobFeatures.size,
            totalRecommendations: 0,
            averageMatchScore: 0,
            topSkills: new Map(),
            topIndustries: new Map()
        };

        let totalScore = 0;
        let totalRecs = 0;

        this.recommendationHistory.forEach(history => {
            totalRecs += history.recommendations.length;
            history.recommendations.forEach(rec => {
                totalScore += rec.matchScore;
                
                // Статистика навыков
                rec.features.skills.forEach(skill => {
                    stats.topSkills.set(skill, (stats.topSkills.get(skill) || 0) + 1);
                });

                // Статистика индустрий
                const industry = rec.features.industry;
                stats.topIndustries.set(industry, (stats.topIndustries.get(industry) || 0) + 1);
            });
        });

        stats.totalRecommendations = totalRecs;
        stats.averageMatchScore = totalRecs > 0 ? totalScore / totalRecs : 0;

        return stats;
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим системы рекомендаций');
        
        // Создание тестовых данных
        const testUserId = 'test-user-1';
        const testJobs = [
            {
                id: 'job-1',
                title: 'Frontend Developer',
                skills: ['JavaScript', 'React', 'TypeScript'],
                location: 'Prague',
                salary: 50000,
                experience: 'middle',
                jobType: 'full-time',
                industry: 'technology'
            },
            {
                id: 'job-2',
                title: 'Backend Developer',
                skills: ['Node.js', 'Python', 'PostgreSQL'],
                location: 'Brno',
                salary: 45000,
                experience: 'senior',
                jobType: 'full-time',
                industry: 'technology'
            },
            {
                id: 'job-3',
                title: 'UX Designer',
                skills: ['Figma', 'Adobe XD', 'User Research'],
                location: 'Prague',
                salary: 40000,
                experience: 'middle',
                jobType: 'full-time',
                industry: 'design'
            }
        ];

        // Добавление тестовых вакансий
        testJobs.forEach(job => this.extractJobFeatures(job));

        // Создание тестового профиля
        const testProfile = {
            skills: new Set(['JavaScript', 'React', 'TypeScript']),
            preferredLocations: new Set(['Prague', 'Brno']),
            salaryRange: { min: 40000, max: 60000 },
            experienceLevel: 'middle',
            jobTypes: new Set(['full-time']),
            industries: new Set(['technology']),
            lastActivity: Date.now()
        };

        this.userProfiles.set(testUserId, testProfile);

        // Генерация тестовых рекомендаций
        const recommendations = this.generateRecommendations(testUserId, 5);
        console.log('📊 Тестовые рекомендации:', recommendations);

        return recommendations;
    }
}

// Экспорт для использования в других модулях
window.RecommendationEngine = RecommendationEngine; 