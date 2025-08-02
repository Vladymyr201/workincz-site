/**
 * UI компоненты для системы отзывов
 * Интерфейс отзывов, рейтингов и их создания
 */

class ReviewsUI {
    constructor(reviewsSystem) {
        this.system = reviewsSystem;
        this.currentTarget = null;
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация UI отзывов
     */
    init() {
        this.createReviewsUI();
        this.setupEventListeners();
        console.log('⭐ UI отзывов инициализирован');
    }

    /**
     * Создание UI компонентов отзывов
     */
    createReviewsUI() {
        // Создание модального окна отзывов
        const modal = document.createElement('div');
        modal.id = 'reviewsModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                            <span class="mr-2">⭐</span>
                            Отзывы и рейтинги
                        </h3>
                        <button id="closeReviewsModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Рейтинг -->
                        <div class="lg:col-span-1">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="text-lg font-semibold mb-4">📊 Рейтинг</h4>
                                <div id="ratingDisplay" class="space-y-4">
                                    <div class="text-center text-gray-500 py-8">
                                        Выберите компанию или кандидата
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Топ рейтинги -->
                            <div class="bg-gray-50 rounded-lg p-4 mt-4">
                                <h4 class="text-lg font-semibold mb-4">🏆 Топ рейтинги</h4>
                                <div class="space-y-2">
                                    <button id="showTopEmployers" class="w-full text-left p-2 hover:bg-gray-100 rounded">
                                        Лучшие работодатели
                                    </button>
                                    <button id="showTopCandidates" class="w-full text-left p-2 hover:bg-gray-100 rounded">
                                        Лучшие кандидаты
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Отзывы -->
                        <div class="lg:col-span-2">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-lg font-semibold">💬 Отзывы</h4>
                                <button id="addReviewBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    + Написать отзыв
                                </button>
                            </div>
                            <div id="reviewsList" class="space-y-4">
                                <div class="text-center text-gray-500 py-8">
                                    Выберите компанию или кандидата для просмотра отзывов
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Создание модального окна для добавления отзыва
        const reviewModal = document.createElement('div');
        reviewModal.id = 'addReviewModal';
        reviewModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        reviewModal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-800">Написать отзыв</h3>
                        <button id="closeAddReviewModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="reviewForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Заголовок отзыва</label>
                            <input type="text" id="reviewTitle" class="w-full border border-gray-300 rounded px-3 py-2" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Содержание отзыва</label>
                            <textarea id="reviewContent" class="w-full border border-gray-300 rounded px-3 py-2" rows="5" required></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Общий рейтинг</label>
                            <div id="overallRating" class="flex space-x-2">
                                <button type="button" class="rating-star text-2xl" data-rating="1">☆</button>
                                <button type="button" class="rating-star text-2xl" data-rating="2">☆</button>
                                <button type="button" class="rating-star text-2xl" data-rating="3">☆</button>
                                <button type="button" class="rating-star text-2xl" data-rating="4">☆</button>
                                <button type="button" class="rating-star text-2xl" data-rating="5">☆</button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Рейтинги по категориям</label>
                            <div id="categoryRatings" class="space-y-2">
                                <!-- Категории будут добавлены динамически -->
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Плюсы</label>
                                <div id="prosList" class="space-y-2">
                                    <div class="flex space-x-2">
                                        <input type="text" class="pro-input flex-1 border border-gray-300 rounded px-3 py-2" placeholder="Добавить плюс">
                                        <button type="button" id="addPro" class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">+</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Минусы</label>
                                <div id="consList" class="space-y-2">
                                    <div class="flex space-x-2">
                                        <input type="text" class="con-input flex-1 border border-gray-300 rounded px-3 py-2" placeholder="Добавить минус">
                                        <button type="button" id="addCon" class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Рекомендации</label>
                            <textarea id="reviewRecommendations" class="w-full border border-gray-300 rounded px-3 py-2" rows="3" placeholder="Ваши рекомендации..."></textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                                <input type="text" id="reviewPosition" class="w-full border border-gray-300 rounded px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Локация</label>
                                <input type="text" id="reviewLocation" class="w-full border border-gray-300 rounded px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Период работы</label>
                                <select id="reviewEmploymentPeriod" class="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="">Выберите период</option>
                                    <option value="0-6">Менее 6 месяцев</option>
                                    <option value="6-12">6-12 месяцев</option>
                                    <option value="12-24">1-2 года</option>
                                    <option value="24+">Более 2 лет</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="reviewAnonymous" class="mr-2">
                            <label for="reviewAnonymous" class="text-sm text-gray-700">Опубликовать анонимно</label>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" id="cancelReview" class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                Отмена
                            </button>
                            <button type="submit" id="submitReview" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Опубликовать отзыв
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(reviewModal);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeReviewsModal') {
                this.hideModal();
            }
            if (e.target.id === 'closeAddReviewModal') {
                this.hideAddReviewModal();
            }
            if (e.target.id === 'cancelReview') {
                this.hideAddReviewModal();
            }
        });

        // Закрытие по клику вне модального окна
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('reviewsModal');
            if (e.target === modal) {
                this.hideModal();
            }
            
            const reviewModal = document.getElementById('addReviewModal');
            if (e.target === reviewModal) {
                this.hideAddReviewModal();
            }
        });

        // Добавление отзыва
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addReviewBtn') {
                this.showAddReviewModal();
            }
        });

        // Форма отзыва
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'reviewForm') {
                e.preventDefault();
                this.handleAddReview();
            }
        });

        // Рейтинги по звездам
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.setOverallRating(rating);
            }
        });

        // Добавление плюсов/минусов
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addPro') {
                this.addPro();
            }
            if (e.target.id === 'addCon') {
                this.addCon();
            }
        });

        // Топ рейтинги
        document.addEventListener('click', (e) => {
            if (e.target.id === 'showTopEmployers') {
                this.showTopEmployers();
            }
            if (e.target.id === 'showTopCandidates') {
                this.showTopCandidates();
            }
        });
    }

    /**
     * Показать модальное окно отзывов
     */
    showModal(targetId = null, targetType = null) {
        this.currentTarget = targetId ? { id: targetId, type: targetType } : null;
        const modal = document.getElementById('reviewsModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isVisible = true;
            this.loadReviewsData();
        }
    }

    /**
     * Скрыть модальное окно отзывов
     */
    hideModal() {
        const modal = document.getElementById('reviewsModal');
        if (modal) {
            modal.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * Показать модальное окно добавления отзыва
     */
    showAddReviewModal() {
        const modal = document.getElementById('addReviewModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.initializeReviewForm();
        }
    }

    /**
     * Скрыть модальное окно добавления отзыва
     */
    hideAddReviewModal() {
        const modal = document.getElementById('addReviewModal');
        if (modal) {
            modal.classList.add('hidden');
            this.resetReviewForm();
        }
    }

    /**
     * Инициализация формы отзыва
     */
    initializeReviewForm() {
        this.setOverallRating(0);
        this.initializeCategoryRatings();
        this.resetProsCons();
    }

    /**
     * Сброс формы отзыва
     */
    resetReviewForm() {
        document.getElementById('reviewForm').reset();
        this.setOverallRating(0);
        this.resetProsCons();
    }

    /**
     * Установка общего рейтинга
     */
    setOverallRating(rating) {
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add('text-yellow-400');
            } else {
                star.textContent = '☆';
                star.classList.remove('text-yellow-400');
            }
        });
    }

    /**
     * Инициализация рейтингов по категориям
     */
    initializeCategoryRatings() {
        const container = document.getElementById('categoryRatings');
        container.innerHTML = '';

        for (const [categoryId, category] of this.system.categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'flex items-center justify-between';
            categoryDiv.innerHTML = `
                <label class="text-sm font-medium text-gray-700">${category.icon} ${category.name}</label>
                <div class="flex space-x-1">
                    <button type="button" class="category-star text-lg" data-category="${categoryId}" data-rating="1">☆</button>
                    <button type="button" class="category-star text-lg" data-category="${categoryId}" data-rating="2">☆</button>
                    <button type="button" class="category-star text-lg" data-category="${categoryId}" data-rating="3">☆</button>
                    <button type="button" class="category-star text-lg" data-category="${categoryId}" data-rating="4">☆</button>
                    <button type="button" class="category-star text-lg" data-category="${categoryId}" data-rating="5">☆</button>
                </div>
            `;
            container.appendChild(categoryDiv);
        }

        // Добавление обработчиков для категорийных звезд
        document.querySelectorAll('.category-star').forEach(star => {
            star.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const rating = parseInt(e.target.dataset.rating);
                this.setCategoryRating(category, rating);
            });
        });
    }

    /**
     * Установка рейтинга по категории
     */
    setCategoryRating(category, rating) {
        const stars = document.querySelectorAll(`[data-category="${category}"]`);
        stars.forEach((star, index) => {
            if (index < rating) {
                star.textContent = '★';
                star.classList.add('text-yellow-400');
            } else {
                star.textContent = '☆';
                star.classList.remove('text-yellow-400');
            }
        });
    }

    /**
     * Добавление плюса
     */
    addPro() {
        const input = document.querySelector('.pro-input');
        const value = input.value.trim();
        if (!value) return;

        const prosList = document.getElementById('prosList');
        const proDiv = document.createElement('div');
        proDiv.className = 'flex items-center space-x-2';
        proDiv.innerHTML = `
            <span class="text-sm text-green-600">✓ ${value}</span>
            <button type="button" class="remove-pro text-red-500 hover:text-red-700">×</button>
        `;
        
        prosList.appendChild(proDiv);
        input.value = '';

        // Добавление обработчика удаления
        proDiv.querySelector('.remove-pro').addEventListener('click', () => {
            proDiv.remove();
        });
    }

    /**
     * Добавление минуса
     */
    addCon() {
        const input = document.querySelector('.con-input');
        const value = input.value.trim();
        if (!value) return;

        const consList = document.getElementById('consList');
        const conDiv = document.createElement('div');
        conDiv.className = 'flex items-center space-x-2';
        conDiv.innerHTML = `
            <span class="text-sm text-red-600">✗ ${value}</span>
            <button type="button" class="remove-con text-red-500 hover:text-red-700">×</button>
        `;
        
        consList.appendChild(conDiv);
        input.value = '';

        // Добавление обработчика удаления
        conDiv.querySelector('.remove-con').addEventListener('click', () => {
            conDiv.remove();
        });
    }

    /**
     * Сброс плюсов и минусов
     */
    resetProsCons() {
        document.getElementById('prosList').innerHTML = `
            <div class="flex space-x-2">
                <input type="text" class="pro-input flex-1 border border-gray-300 rounded px-3 py-2" placeholder="Добавить плюс">
                <button type="button" id="addPro" class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">+</button>
            </div>
        `;
        
        document.getElementById('consList').innerHTML = `
            <div class="flex space-x-2">
                <input type="text" class="con-input flex-1 border border-gray-300 rounded px-3 py-2" placeholder="Добавить минус">
                <button type="button" id="addCon" class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">+</button>
            </div>
        `;
    }

    /**
     * Загрузка данных отзывов
     */
    loadReviewsData() {
        if (this.currentTarget) {
            this.updateRatingDisplay();
            this.updateReviewsList();
        } else {
            this.showTopEmployers();
        }
    }

    /**
     * Обновление отображения рейтинга
     */
    updateRatingDisplay() {
        const container = document.getElementById('ratingDisplay');
        const rating = this.system.getRating(this.currentTarget.id, this.currentTarget.type);

        const ratingHtml = `
            <div class="text-center">
                <div class="text-4xl font-bold text-blue-600">${rating.overallRating}</div>
                <div class="flex justify-center space-x-1 my-2">
                    ${this.generateStars(rating.overallRating)}
                </div>
                <div class="text-sm text-gray-600">${rating.totalReviews} отзывов</div>
                ${rating.verifiedReviews > 0 ? `
                    <div class="text-xs text-green-600 mt-1">${rating.verifiedReviews} верифицированных</div>
                ` : ''}
            </div>
            
            <div class="space-y-2 mt-4">
                ${Object.entries(rating.categoryRatings).map(([categoryId, score]) => {
                    const category = this.system.categories.get(categoryId);
                    return `
                        <div class="flex items-center justify-between text-sm">
                            <span>${category.icon} ${category.name}</span>
                            <div class="flex items-center space-x-1">
                                <span class="font-medium">${score}</span>
                                <div class="flex space-x-1">
                                    ${this.generateStars(score, 'text-xs')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = ratingHtml;
    }

    /**
     * Обновление списка отзывов
     */
    updateReviewsList() {
        const container = document.getElementById('reviewsList');
        const reviews = this.system.getReviews(this.currentTarget.id, this.currentTarget.type, {
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-4">⭐</div>
                    <p>Отзывов пока нет</p>
                    <p class="text-sm mt-2">Будьте первым, кто оставит отзыв!</p>
                </div>
            `;
            return;
        }

        const reviewsHtml = reviews.map(review => {
            const badges = review.badges.map(badgeId => {
                const badge = this.system.badges.get(badgeId);
                return badge ? `
                    <span class="inline-block px-2 py-1 text-xs rounded" style="background-color: ${badge.color}; color: white;">
                        ${badge.icon} ${badge.name}
                    </span>
                ` : '';
            }).join('');

            return `
                <div class="border rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex items-start justify-between mb-2">
                        <div>
                            <h5 class="font-medium text-gray-800">${review.title}</h5>
                            <div class="flex items-center space-x-2 mt-1">
                                <div class="flex space-x-1">
                                    ${this.generateStars(review.rating)}
                                </div>
                                <span class="text-sm text-gray-500">${new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                                ${review.isVerified ? '<span class="text-green-600 text-sm">✅ Верифицирован</span>' : ''}
                            </div>
                        </div>
                        <div class="flex space-x-1">
                            ${badges}
                        </div>
                    </div>
                    
                    <p class="text-gray-600 mb-3">${review.content}</p>
                    
                    ${review.pros.length > 0 ? `
                        <div class="mb-2">
                            <span class="text-sm font-medium text-green-600">Плюсы:</span>
                            <div class="text-sm text-gray-600">
                                ${review.pros.map(pro => `• ${pro}`).join('<br>')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${review.cons.length > 0 ? `
                        <div class="mb-2">
                            <span class="text-sm font-medium text-red-600">Минусы:</span>
                            <div class="text-sm text-gray-600">
                                ${review.cons.map(con => `• ${con}`).join('<br>')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${review.recommendations.length > 0 ? `
                        <div class="mb-3">
                            <span class="text-sm font-medium text-blue-600">Рекомендации:</span>
                            <div class="text-sm text-gray-600">
                                ${review.recommendations.map(rec => `• ${rec}`).join('<br>')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="flex items-center justify-between text-sm text-gray-500">
                        <div class="flex space-x-4">
                            <button class="helpful-btn hover:text-blue-600" data-review-id="${review.id}">
                                👍 Полезно (${review.isHelpful})
                            </button>
                            <button class="not-helpful-btn hover:text-red-600" data-review-id="${review.id}">
                                👎 Не полезно (${review.isNotHelpful})
                            </button>
                        </div>
                        <button class="report-btn hover:text-red-600" data-review-id="${review.id}">
                            ⚠️ Пожаловаться
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = reviewsHtml;

        // Добавление обработчиков для кнопок
        this.setupReviewButtons();
    }

    /**
     * Настройка кнопок отзывов
     */
    setupReviewButtons() {
        document.querySelectorAll('.helpful-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reviewId = e.target.dataset.reviewId;
                this.voteHelpful(reviewId, true);
            });
        });

        document.querySelectorAll('.not-helpful-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reviewId = e.target.dataset.reviewId;
                this.voteHelpful(reviewId, false);
            });
        });

        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reviewId = e.target.dataset.reviewId;
                this.reportReview(reviewId);
            });
        });
    }

    /**
     * Голосование за полезность
     */
    voteHelpful(reviewId, isHelpful) {
        const userId = 'current-user'; // В реальном приложении получали бы из системы аутентификации
        this.system.voteHelpful(reviewId, userId, isHelpful);
        this.updateReviewsList();
        this.showSuccessMessage(isHelpful ? 'Отмечено как полезное' : 'Отмечено как не полезное');
    }

    /**
     * Жалоба на отзыв
     */
    reportReview(reviewId) {
        const reason = prompt('Укажите причину жалобы:');
        if (!reason) return;

        const description = prompt('Опишите подробнее:');
        const reporterId = 'current-user';

        this.system.reportReview(reviewId, reporterId, reason, description || '');
        this.showSuccessMessage('Жалоба отправлена на рассмотрение');
    }

    /**
     * Показать топ работодателей
     */
    showTopEmployers() {
        const employers = this.system.getTopEmployers(10);
        this.displayTopList(employers, 'employer', 'Лучшие работодатели');
    }

    /**
     * Показать топ кандидатов
     */
    showTopCandidates() {
        const candidates = this.system.getTopCandidates(10);
        this.displayTopList(candidates, 'candidate', 'Лучшие кандидаты');
    }

    /**
     * Отображение топ списка
     */
    displayTopList(items, type, title) {
        const container = document.getElementById('reviewsList');
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <p>Нет данных для отображения</p>
                </div>
            `;
            return;
        }

        const itemsHtml = `
            <h4 class="text-lg font-semibold mb-4">${title}</h4>
            <div class="space-y-3">
                ${items.map((item, index) => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" 
                         data-target-id="${item.targetId}" data-target-type="${type}">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="text-2xl font-bold text-gray-400">#${index + 1}</div>
                                <div>
                                    <h5 class="font-medium">${type === 'employer' ? 'Компания' : 'Кандидат'} ${item.targetId}</h5>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <div class="flex space-x-1">
                                            ${this.generateStars(item.overallRating)}
                                        </div>
                                        <span class="text-sm text-gray-500">${item.overallRating}</span>
                                        <span class="text-sm text-gray-500">(${item.totalReviews} отзывов)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-gray-500">${item.verifiedReviews} верифицированных</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = itemsHtml;

        // Добавление обработчиков для выбора элемента
        document.querySelectorAll('[data-target-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.targetId;
                const targetType = e.currentTarget.dataset.targetType;
                this.currentTarget = { id: targetId, type: targetType };
                this.loadReviewsData();
            });
        });
    }

    /**
     * Генерация звезд
     */
    generateStars(rating, className = 'text-lg') {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += `<span class="${className} text-yellow-400">★</span>`;
        }
        if (hasHalfStar) {
            stars += `<span class="${className} text-yellow-400">☆</span>`;
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += `<span class="${className} text-gray-300">☆</span>`;
        }
        return stars;
    }

    /**
     * Обработка добавления отзыва
     */
    handleAddReview() {
        if (!this.currentTarget) {
            this.showErrorMessage('Выберите компанию или кандидата');
            return;
        }

        const title = document.getElementById('reviewTitle').value;
        const content = document.getElementById('reviewContent').value;
        const recommendations = document.getElementById('reviewRecommendations').value;
        const position = document.getElementById('reviewPosition').value;
        const location = document.getElementById('reviewLocation').value;
        const employmentPeriod = document.getElementById('reviewEmploymentPeriod').value;
        const isAnonymous = document.getElementById('reviewAnonymous').checked;

        if (!title || !content) {
            this.showErrorMessage('Заполните обязательные поля');
            return;
        }

        // Получение общего рейтинга
        const overallRating = document.querySelectorAll('.rating-star.text-yellow-400').length;

        // Получение рейтингов по категориям
        const categoryRatings = {};
        document.querySelectorAll('.category-star.text-yellow-400').forEach(star => {
            const category = star.dataset.category;
            const rating = parseInt(star.dataset.rating);
            if (!categoryRatings[category]) {
                categoryRatings[category] = 0;
            }
            categoryRatings[category] = Math.max(categoryRatings[category], rating);
        });

        // Получение плюсов и минусов
        const pros = Array.from(document.querySelectorAll('#prosList span')).map(span => 
            span.textContent.replace('✓ ', '')
        ).filter(text => text !== '✓');

        const cons = Array.from(document.querySelectorAll('#consList span')).map(span => 
            span.textContent.replace('✗ ', '')
        ).filter(text => text !== '✗');

        const reviewData = {
            authorId: 'current-user',
            targetId: this.currentTarget.id,
            targetType: this.currentTarget.type,
            title: title,
            content: content,
            rating: overallRating,
            categoryRatings: categoryRatings,
            pros: pros,
            cons: cons,
            recommendations: recommendations ? [recommendations] : [],
            isAnonymous: isAnonymous,
            position: position,
            location: location,
            employmentPeriod: employmentPeriod ? { duration: parseInt(employmentPeriod) } : null
        };

        this.system.createReview(reviewData);
        this.hideAddReviewModal();
        this.loadReviewsData();
        this.showSuccessMessage('Отзыв добавлен и отправлен на модерацию');
    }

    /**
     * Показать сообщение об успехе
     */
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Показать сообщение об ошибке
     */
    showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Создание кнопки для открытия отзывов
     */
    createReviewsButton() {
        const button = document.createElement('button');
        button.id = 'openReviewsModal';
        button.className = 'fixed bottom-4 right-44 bg-yellow-600 text-white p-3 rounded-full shadow-lg hover:bg-yellow-700 transition-colors z-50';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
        `;
        button.title = 'Отзывы и рейтинги';

        button.addEventListener('click', () => {
            this.showModal();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку отзывов в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const reviewsNavItem = document.createElement('div');
            reviewsNavItem.className = 'flex items-center space-x-2';
            reviewsNavItem.innerHTML = `
                <button id="navReviews" class="text-gray-600 hover:text-yellow-500 transition-colors flex items-center space-x-1">
                    <span>⭐</span>
                    <span class="hidden md:inline">Отзывы</span>
                </button>
            `;
            
            nav.appendChild(reviewsNavItem);
            
            document.getElementById('navReviews').addEventListener('click', () => {
                this.showModal();
            });
        }

        // Создаем плавающую кнопку
        this.createReviewsButton();
    }

    /**
     * Получение статистики UI
     */
    getStats() {
        return {
            isVisible: this.isVisible,
            currentTarget: this.currentTarget,
            systemStats: this.system.getReviewsStats()
        };
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим UI отзывов');
        
        // Показываем модальное окно
        this.showModal('employer-1', 'employer');
        
        return {
            stats: this.getStats(),
            systemStats: this.system.getReviewsStats()
        };
    }
}

// Экспорт для использования в других модулях
window.ReviewsUI = ReviewsUI; 