/**
 * Система рейтингов и отзывов для WorkInCZ
 * Поддержка отзывов о работодателях, соискателях и агентствах
 * GDPR-совместимая система с модерацией
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, increment, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const db = getFirestore();
const auth = getAuth();

// Типы отзывов
export const ReviewType = {
    EMPLOYER_TO_APPLICANT: 'employer_to_applicant',
    APPLICANT_TO_EMPLOYER: 'applicant_to_employer',
    APPLICANT_TO_AGENCY: 'applicant_to_agency',
    EMPLOYER_TO_AGENCY: 'employer_to_agency'
};

// Категории оценки
export const RatingCategory = {
    PROFESSIONALISM: 'professionalism',
    COMMUNICATION: 'communication',
    RELIABILITY: 'reliability',
    QUALITY: 'quality',
    OVERALL: 'overall'
};

// Статусы отзывов
export const ReviewStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged'
};

export class ReviewSystem {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
    }

    /**
     * Инициализация системы
     */
    async initialize() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            this.currentUser = user;
            this.userRole = await this.getUserRole(user.uid);
        } catch (error) {
            console.error('Ошибка инициализации системы отзывов:', error);
        }
    }

    /**
     * Создать отзыв
     */
    async createReview(targetUserId, type, ratings, comment, jobId = null) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            // Проверить, можно ли оставить отзыв
            const canReview = await this.canLeaveReview(user.uid, targetUserId, type, jobId);
            if (!canReview) {
                throw new Error('Нельзя оставить отзыв для этого пользователя');
            }

            const reviewData = {
                reviewerId: user.uid,
                reviewerName: user.displayName || user.email,
                reviewerRole: this.userRole,
                targetUserId: targetUserId,
                type: type,
                ratings: ratings,
                comment: comment,
                jobId: jobId,
                status: ReviewStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                helpfulCount: 0,
                reportCount: 0,
                isAnonymous: false,
                metadata: {
                    language: this.detectLanguage(comment),
                    moderationScore: 0,
                    flags: []
                }
            };

            const docRef = await addDoc(collection(db, 'reviews'), reviewData);

            // Обновить общий рейтинг пользователя
            await this.updateUserRating(targetUserId);

            return docRef.id;
        } catch (error) {
            console.error('Ошибка создания отзыва:', error);
            throw error;
        }
    }

    /**
     * Проверить, можно ли оставить отзыв
     */
    async canLeaveReview(reviewerId, targetUserId, type, jobId) {
        try {
            // Нельзя оставить отзыв самому себе
            if (reviewerId === targetUserId) return false;

            // Проверить, есть ли уже отзыв от этого пользователя
            const existingReview = await this.getExistingReview(reviewerId, targetUserId, type, jobId);
            if (existingReview) return false;

            // Проверить, есть ли взаимодействие между пользователями
            const hasInteraction = await this.hasUserInteraction(reviewerId, targetUserId, type, jobId);
            if (!hasInteraction) return false;

            return true;
        } catch (error) {
            console.error('Ошибка проверки возможности отзыва:', error);
            return false;
        }
    }

    /**
     * Получить существующий отзыв
     */
    async getExistingReview(reviewerId, targetUserId, type, jobId) {
        try {
            let q = query(
                collection(db, 'reviews'),
                where('reviewerId', '==', reviewerId),
                where('targetUserId', '==', targetUserId),
                where('type', '==', type)
            );

            if (jobId) {
                q = query(q, where('jobId', '==', jobId));
            }

            const snapshot = await getDocs(q);
            return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } catch (error) {
            console.error('Ошибка получения существующего отзыва:', error);
            return null;
        }
    }

    /**
     * Проверить взаимодействие между пользователями
     */
    async hasUserInteraction(userId1, userId2, type, jobId) {
        try {
            switch (type) {
                case ReviewType.EMPLOYER_TO_APPLICANT:
                case ReviewType.APPLICANT_TO_EMPLOYER:
                    // Проверить, есть ли заявка на работу
                    if (jobId) {
                        const application = await this.getJobApplication(jobId, userId1, userId2);
                        return application !== null;
                    }
                    break;
                case ReviewType.APPLICANT_TO_AGENCY:
                case ReviewType.EMPLOYER_TO_AGENCY:
                    // Проверить, есть ли чат или взаимодействие
                    const chat = await this.getChatBetweenUsers(userId1, userId2);
                    return chat !== null;
            }
            return false;
        } catch (error) {
            console.error('Ошибка проверки взаимодействия:', error);
            return false;
        }
    }

    /**
     * Получить заявку на работу
     */
    async getJobApplication(jobId, applicantId, employerId) {
        try {
            const q = query(
                collection(db, 'applications'),
                where('jobId', '==', jobId),
                where('applicantId', '==', applicantId)
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;

            const application = snapshot.docs[0].data();
            const job = await this.getJob(jobId);
            
            return job && job.employerId === employerId ? application : null;
        } catch (error) {
            console.error('Ошибка получения заявки:', error);
            return null;
        }
    }

    /**
     * Получить вакансию
     */
    async getJob(jobId) {
        try {
            const jobDoc = await getDocs(query(
                collection(db, 'jobs'),
                where('id', '==', jobId)
            ));

            return jobDoc.empty ? null : jobDoc.docs[0].data();
        } catch (error) {
            console.error('Ошибка получения вакансии:', error);
            return null;
        }
    }

    /**
     * Получить чат между пользователями
     */
    async getChatBetweenUsers(userId1, userId2) {
        try {
            const q = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', userId1)
            );

            const snapshot = await getDocs(q);
            for (const doc of snapshot.docs) {
                const chat = doc.data();
                if (chat.participants.includes(userId2)) {
                    return chat;
                }
            }
            return null;
        } catch (error) {
            console.error('Ошибка получения чата:', error);
            return null;
        }
    }

    /**
     * Получить отзывы пользователя
     */
    async getUserReviews(userId, type = null, limit = 20) {
        try {
            let q = query(
                collection(db, 'reviews'),
                where('targetUserId', '==', userId),
                where('status', '==', ReviewStatus.APPROVED),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            if (type) {
                q = query(q, where('type', '==', type));
            }

            const snapshot = await getDocs(q);
            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            return reviews;
        } catch (error) {
            console.error('Ошибка получения отзывов:', error);
            return [];
        }
    }

    /**
     * Получить рейтинг пользователя
     */
    async getUserRating(userId) {
        try {
            const reviews = await this.getUserReviews(userId);
            if (reviews.length === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    categoryRatings: {},
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            const totalRatings = {};
            const categoryRatings = {};
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

            reviews.forEach(review => {
                // Общий рейтинг
                const overallRating = review.ratings[RatingCategory.OVERALL] || 0;
                distribution[Math.round(overallRating)]++;

                // Рейтинги по категориям
                Object.keys(review.ratings).forEach(category => {
                    if (!categoryRatings[category]) {
                        categoryRatings[category] = { sum: 0, count: 0 };
                    }
                    categoryRatings[category].sum += review.ratings[category];
                    categoryRatings[category].count++;
                });
            });

            // Вычислить средние значения
            Object.keys(categoryRatings).forEach(category => {
                categoryRatings[category] = categoryRatings[category].sum / categoryRatings[category].count;
            });

            const averageRating = categoryRatings[RatingCategory.OVERALL] || 0;

            return {
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: reviews.length,
                categoryRatings,
                distribution
            };
        } catch (error) {
            console.error('Ошибка получения рейтинга:', error);
            return {
                averageRating: 0,
                totalReviews: 0,
                categoryRatings: {},
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }
    }

    /**
     * Обновить рейтинг пользователя
     */
    async updateUserRating(userId) {
        try {
            const rating = await this.getUserRating(userId);
            
            await updateDoc(doc(db, 'users', userId), {
                rating: rating,
                ratingUpdated: new Date()
            });
        } catch (error) {
            console.error('Ошибка обновления рейтинга:', error);
        }
    }

    /**
     * Отметить отзыв как полезный
     */
    async markReviewHelpful(reviewId) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            await updateDoc(doc(db, 'reviews', reviewId), {
                helpfulCount: increment(1)
            });
        } catch (error) {
            console.error('Ошибка отметки полезности:', error);
            throw error;
        }
    }

    /**
     * Пожаловаться на отзыв
     */
    async reportReview(reviewId, reason) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            await updateDoc(doc(db, 'reviews', reviewId), {
                reportCount: increment(1),
                'metadata.flags': increment(1)
            });

            // Создать жалобу
            const reportData = {
                reviewId: reviewId,
                reporterId: user.uid,
                reason: reason,
                createdAt: new Date(),
                status: 'pending'
            };

            await addDoc(collection(db, 'review_reports'), reportData);
        } catch (error) {
            console.error('Ошибка жалобы на отзыв:', error);
            throw error;
        }
    }

    /**
     * Получить отзывы для модерации
     */
    async getReviewsForModeration(limit = 50) {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('status', '==', ReviewStatus.PENDING),
                orderBy('createdAt', 'asc'),
                limit(limit)
            );

            const snapshot = await getDocs(q);
            const reviews = [];
            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            return reviews;
        } catch (error) {
            console.error('Ошибка получения отзывов для модерации:', error);
            return [];
        }
    }

    /**
     * Одобрить отзыв
     */
    async approveReview(reviewId) {
        try {
            await updateDoc(doc(db, 'reviews', reviewId), {
                status: ReviewStatus.APPROVED,
                updatedAt: new Date()
            });

            // Обновить рейтинг пользователя
            const review = await this.getReview(reviewId);
            if (review) {
                await this.updateUserRating(review.targetUserId);
            }
        } catch (error) {
            console.error('Ошибка одобрения отзыва:', error);
            throw error;
        }
    }

    /**
     * Отклонить отзыв
     */
    async rejectReview(reviewId, reason) {
        try {
            await updateDoc(doc(db, 'reviews', reviewId), {
                status: ReviewStatus.REJECTED,
                'metadata.rejectionReason': reason,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Ошибка отклонения отзыва:', error);
            throw error;
        }
    }

    /**
     * Получить отзыв по ID
     */
    async getReview(reviewId) {
        try {
            const reviewDoc = await getDocs(query(
                collection(db, 'reviews'),
                where('id', '==', reviewId)
            ));

            return reviewDoc.empty ? null : { id: reviewDoc.docs[0].id, ...reviewDoc.docs[0].data() };
        } catch (error) {
            console.error('Ошибка получения отзыва:', error);
            return null;
        }
    }

    /**
     * Определить язык комментария
     */
    detectLanguage(text) {
        const czechChars = /[áčďéěíňóřšťúůýž]/i;
        const germanChars = /[äöüß]/i;
        
        if (czechChars.test(text)) return 'cs';
        if (germanChars.test(text)) return 'de';
        return 'en';
    }

    /**
     * Получить роль пользователя
     */
    async getUserRole(userId) {
        try {
            const userDoc = await getDocs(query(
                collection(db, 'users'),
                where('uid', '==', userId)
            ));

            if (!userDoc.empty) {
                return userDoc.docs[0].data().role || 'applicant';
            }
            return 'applicant';
        } catch (error) {
            console.error('Ошибка получения роли пользователя:', error);
            return 'applicant';
        }
    }

    /**
     * Создать виджет рейтинга
     */
    createRatingWidget(userId, container) {
        const widget = document.createElement('div');
        widget.className = 'rating-widget bg-white rounded-lg p-4 shadow-sm';
        widget.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-600" id="average-rating">-</div>
                    <div class="text-sm text-gray-500">средний рейтинг</div>
                    <div class="text-xs text-gray-400" id="total-reviews">0 отзывов</div>
                </div>
                <div class="flex-1">
                    <div class="space-y-1" id="rating-distribution"></div>
                </div>
            </div>
        `;

        container.appendChild(widget);
        this.loadRatingData(userId, widget);
    }

    /**
     * Загрузить данные рейтинга в виджет
     */
    async loadRatingData(userId, widget) {
        try {
            const rating = await this.getUserRating(userId);
            
            const averageElement = widget.querySelector('#average-rating');
            const totalElement = widget.querySelector('#total-reviews');
            const distributionElement = widget.querySelector('#rating-distribution');

            averageElement.textContent = rating.averageRating.toFixed(1);
            totalElement.textContent = `${rating.totalReviews} отзывов`;

            // Создать распределение рейтингов
            distributionElement.innerHTML = '';
            for (let i = 5; i >= 1; i--) {
                const percentage = rating.totalReviews > 0 ? (rating.distribution[i] / rating.totalReviews) * 100 : 0;
                const bar = document.createElement('div');
                bar.className = 'flex items-center space-x-2';
                bar.innerHTML = `
                    <span class="text-xs text-gray-500 w-4">${i}</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-xs text-gray-500 w-8">${rating.distribution[i]}</span>
                `;
                distributionElement.appendChild(bar);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных рейтинга:', error);
        }
    }
}

// Глобальный экземпляр системы отзывов
export const reviewSystem = new ReviewSystem();