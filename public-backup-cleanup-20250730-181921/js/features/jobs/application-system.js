/**
 * Система подачи заявок на вакансии для WorkInCZ
 * Поддержка GDPR, многоязычности и отслеживания статусов
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, increment } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

// Статусы заявок
export const ApplicationStatus = {
    PENDING: 'pending',      // Ожидает рассмотрения
    REVIEWING: 'reviewing',  // Рассматривается
    INTERVIEW: 'interview',  // Приглашен на собеседование
    ACCEPTED: 'accepted',    // Принят
    REJECTED: 'rejected',    // Отклонен
    WITHDRAWN: 'withdrawn'   // Отозвана кандидатом
};

// Структура заявки
const ApplicationSchema = {
    id: '',
    jobId: '', // ID вакансии
    candidateId: '', // ID кандидата
    employerId: '', // ID работодателя
    status: ApplicationStatus.PENDING,
    coverLetter: '', // Сопроводительное письмо
    resume: {
        url: '',
        filename: '',
        size: 0
    },
    portfolio: {
        url: '',
        description: ''
    },
    experience: {
        years: 0,
        description: ''
    },
    languages: [], // Знание языков
    skills: [], // Навыки
    availability: {
        startDate: null,
        noticePeriod: 0, // Срок отработки в днях
        flexible: false
    },
    salary: {
        expected: 0,
        currency: 'CZK',
        negotiable: true
    },
    contact: {
        email: '',
        phone: '',
        preferredMethod: 'email' // email, phone, any
    },
    gdprConsent: {
        dataProcessing: false,
        marketing: false,
        thirdParty: false,
        timestamp: null
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    viewedByEmployer: false,
    employerNotes: '', // Заметки работодателя
    interviewDate: null,
    feedback: {
        candidate: '',
        employer: ''
    }
};

/**
 * Подача заявки на вакансию
 * @param {string} jobId - ID вакансии
 * @param {Object} applicationData - Данные заявки
 * @returns {Promise<string>} ID созданной заявки
 */
export async function submitApplication(jobId, applicationData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        // Проверяем, не подавал ли уже заявку
        const existingApplication = await checkExistingApplication(jobId, user.uid);
        if (existingApplication) {
            throw new Error('Вы уже подавали заявку на эту вакансию');
        }

        // Получаем данные вакансии
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (!jobDoc.exists()) {
            throw new Error('Вакансия не найдена');
        }

        const jobData = jobDoc.data();

        // Проверяем GDPR согласие
        if (!applicationData.gdprConsent?.dataProcessing) {
            throw new Error('Необходимо согласие на обработку персональных данных');
        }

        // Подготовка данных заявки
        const application = {
            ...ApplicationSchema,
            ...applicationData,
            jobId,
            candidateId: user.uid,
            employerId: jobData.employerId,
            status: ApplicationStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
            gdprConsent: {
                ...applicationData.gdprConsent,
                timestamp: new Date()
            }
        };

        // Сохранение заявки
        const docRef = await addDoc(collection(db, 'applications'), application);

        // Увеличиваем счетчик заявок на вакансии
        await updateDoc(doc(db, 'jobs', jobId), {
            applications: increment(1)
        });

        console.log('Заявка подана:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Ошибка подачи заявки:', error);
        throw error;
    }
}

/**
 * Проверка существующей заявки
 * @param {string} jobId - ID вакансии
 * @param {string} candidateId - ID кандидата
 * @returns {Promise<Object|null>} Существующая заявка или null
 */
async function checkExistingApplication(jobId, candidateId) {
    try {
        const q = query(
            collection(db, 'applications'),
            where('jobId', '==', jobId),
            where('candidateId', '==', candidateId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Ошибка проверки существующей заявки:', error);
        return null;
    }
}

/**
 * Получение заявок кандидата
 * @param {string} candidateId - ID кандидата (опционально)
 * @returns {Promise<Array>} Список заявок
 */
export async function getCandidateApplications(candidateId = null) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        const targetCandidateId = candidateId || user.uid;
        const q = query(
            collection(db, 'applications'),
            where('candidateId', '==', targetCandidateId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const applications = [];

        for (const doc of querySnapshot.docs) {
            const application = {
                id: doc.id,
                ...doc.data()
            };

            // Получаем данные вакансии
            try {
                const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
                if (jobDoc.exists()) {
                    application.job = {
                        id: jobDoc.id,
                        ...jobDoc.data()
                    };
                }
            } catch (error) {
                console.error('Ошибка получения данных вакансии:', error);
            }

            applications.push(application);
        }

        return applications;
    } catch (error) {
        console.error('Ошибка получения заявок кандидата:', error);
        throw error;
    }
}

/**
 * Получение заявок на вакансии работодателя
 * @param {string} employerId - ID работодателя (опционально)
 * @returns {Promise<Array>} Список заявок
 */
export async function getEmployerApplications(employerId = null) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        const targetEmployerId = employerId || user.uid;
        const q = query(
            collection(db, 'applications'),
            where('employerId', '==', targetEmployerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const applications = [];

        for (const doc of querySnapshot.docs) {
            const application = {
                id: doc.id,
                ...doc.data()
            };

            // Получаем данные вакансии и кандидата
            try {
                const [jobDoc, candidateDoc] = await Promise.all([
                    getDoc(doc(db, 'jobs', application.jobId)),
                    getDoc(doc(db, 'users', application.candidateId))
                ]);

                if (jobDoc.exists()) {
                    application.job = {
                        id: jobDoc.id,
                        ...jobDoc.data()
                    };
                }

                if (candidateDoc.exists()) {
                    application.candidate = {
                        id: candidateDoc.id,
                        ...candidateDoc.data()
                    };
                }
            } catch (error) {
                console.error('Ошибка получения дополнительных данных:', error);
            }

            applications.push(application);
        }

        return applications;
    } catch (error) {
        console.error('Ошибка получения заявок работодателя:', error);
        throw error;
    }
}

/**
 * Обновление статуса заявки
 * @param {string} applicationId - ID заявки
 * @param {string} status - Новый статус
 * @param {string} notes - Заметки (опционально)
 * @returns {Promise<void>}
 */
export async function updateApplicationStatus(applicationId, status, notes = '') {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        const docRef = doc(db, 'applications', applicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Заявка не найдена');
        }

        const application = docSnap.data();

        // Проверяем права (только работодатель может менять статус)
        if (application.employerId !== user.uid) {
            throw new Error('Нет прав на изменение статуса заявки');
        }

        const updates = {
            status,
            updatedAt: new Date(),
            viewedByEmployer: true
        };

        if (notes) {
            updates.employerNotes = notes;
        }

        if (status === ApplicationStatus.INTERVIEW) {
            updates.interviewDate = new Date();
        }

        await updateDoc(docRef, updates);

        console.log('Статус заявки обновлен:', applicationId, status);
    } catch (error) {
        console.error('Ошибка обновления статуса заявки:', error);
        throw error;
    }
}

/**
 * Отзыв заявки кандидатом
 * @param {string} applicationId - ID заявки
 * @returns {Promise<void>}
 */
export async function withdrawApplication(applicationId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        const docRef = doc(db, 'applications', applicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Заявка не найдена');
        }

        const application = docSnap.data();

        // Проверяем права (только кандидат может отозвать свою заявку)
        if (application.candidateId !== user.uid) {
            throw new Error('Нет прав на отзыв заявки');
        }

        // Проверяем, что заявка еще не принята
        if (application.status === ApplicationStatus.ACCEPTED) {
            throw new Error('Нельзя отозвать принятую заявку');
        }

        await updateDoc(docRef, {
            status: ApplicationStatus.WITHDRAWN,
            updatedAt: new Date()
        });

        console.log('Заявка отозвана:', applicationId);
    } catch (error) {
        console.error('Ошибка отзыва заявки:', error);
        throw error;
    }
}

/**
 * Загрузка резюме
 * @param {File} file - Файл резюме
 * @returns {Promise<string>} URL загруженного файла
 */
export async function uploadResume(file) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        // Проверяем тип файла
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Поддерживаются только файлы PDF и Word');
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Размер файла не должен превышать 5MB');
        }

        const fileName = `resumes/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Ошибка загрузки резюме:', error);
        throw error;
    }
}

/**
 * Получение статистики заявок
 * @param {string} userId - ID пользователя
 * @param {string} role - Роль (candidate/employer)
 * @returns {Promise<Object>} Статистика
 */
export async function getApplicationStats(userId, role) {
    try {
        const field = role === 'candidate' ? 'candidateId' : 'employerId';
        const q = query(
            collection(db, 'applications'),
            where(field, '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const stats = {
            total: 0,
            pending: 0,
            reviewing: 0,
            interview: 0,
            accepted: 0,
            rejected: 0,
            withdrawn: 0
        };

        querySnapshot.forEach((doc) => {
            const application = doc.data();
            stats.total++;
            stats[application.status]++;
        });

        return stats;
    } catch (error) {
        console.error('Ошибка получения статистики заявок:', error);
        throw error;
    }
}

// Экспорт для использования в других модулях
export { ApplicationSchema };