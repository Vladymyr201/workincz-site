/**
 * Система управления вакансиями для WorkInCZ
 * Европейская платформа поиска работы с поддержкой многоязычности и GDPR
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

const db = getFirestore();
const auth = getAuth();

// Структура вакансии
const JobSchema = {
    id: '',
    title: '', // Название вакансии
    description: '', // Описание
    requirements: '', // Требования
    salary: {
        min: 0,
        max: 0,
        currency: 'CZK', // CZK, EUR, USD
        period: 'month' // month, hour, year
    },
    location: {
        city: '',
        country: 'CZ',
        address: '',
        remote: false, // Удаленная работа
        hybrid: false // Гибридная работа
    },
    company: {
        name: '',
        description: '',
        logo: '',
        website: ''
    },
    category: '', // IT, Marketing, Sales, etc.
    type: '', // full-time, part-time, contract, internship
    experience: '', // junior, middle, senior
    languages: [], // Требуемые языки
    benefits: [], // Бонусы и льготы
    contact: {
        email: '',
        phone: '',
        person: ''
    },
    status: 'active', // active, paused, closed
    createdAt: new Date(),
    updatedAt: new Date(),
    employerId: '', // ID работодателя
    views: 0,
    applications: 0,
    isPremium: false, // Премиум размещение
    gdprConsent: true, // Согласие на обработку данных
    languages: {
        cs: { title: '', description: '', requirements: '' },
        en: { title: '', description: '', requirements: '' },
        de: { title: '', description: '', requirements: '' }
    }
};

/**
 * Создание новой вакансии
 * @param {Object} jobData - Данные вакансии
 * @returns {Promise<string>} ID созданной вакансии
 */
export async function createJob(jobData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }

        // Валидация данных
        if (!jobData.title || !jobData.description) {
            throw new Error('Заполните обязательные поля');
        }

        // Подготовка данных
        const job = {
            ...JobSchema,
            ...jobData,
            employerId: user.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            views: 0,
            applications: 0,
            gdprConsent: true
        };

        // Сохранение в Firestore
        const docRef = await addDoc(collection(db, 'jobs'), job);
        
        console.log('Вакансия создана:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Ошибка создания вакансии:', error);
        throw error;
    }
}

/**
 * Получение списка вакансий с фильтрацией
 * @param {Object} filters - Фильтры поиска
 * @param {number} limit - Лимит результатов
 * @returns {Promise<Array>} Список вакансий
 */
export async function getJobs(filters = {}, limitCount = 20) {
    try {
        let q = collection(db, 'jobs');
        
        // Применяем фильтры
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }
        
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }
        
        if (filters.location) {
            q = query(q, where('location.city', '==', filters.location));
        }
        
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        
        if (filters.experience) {
            q = query(q, where('experience', '==', filters.experience));
        }
        
        if (filters.salaryMin) {
            q = query(q, where('salary.min', '>=', filters.salaryMin));
        }
        
        if (filters.remote) {
            q = query(q, where('location.remote', '==', true));
        }
        
        // Сортировка по дате создания
        q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));
        
        const querySnapshot = await getDocs(q);
        const jobs = [];
        
        querySnapshot.forEach((doc) => {
            jobs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return jobs;
    } catch (error) {
        console.error('Ошибка получения вакансий:', error);
        throw error;
    }
}

/**
 * Получение вакансии по ID
 * @param {string} jobId - ID вакансии
 * @returns {Promise<Object>} Данные вакансии
 */
export async function getJobById(jobId) {
    try {
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            throw new Error('Вакансия не найдена');
        }
    } catch (error) {
        console.error('Ошибка получения вакансии:', error);
        throw error;
    }
}

/**
 * Обновление вакансии
 * @param {string} jobId - ID вакансии
 * @param {Object} updates - Обновления
 * @returns {Promise<void>}
 */
export async function updateJob(jobId, updates) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            throw new Error('Вакансия не найдена');
        }
        
        const jobData = docSnap.data();
        if (jobData.employerId !== user.uid) {
            throw new Error('Нет прав на редактирование этой вакансии');
        }
        
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date()
        });
        
        console.log('Вакансия обновлена:', jobId);
    } catch (error) {
        console.error('Ошибка обновления вакансии:', error);
        throw error;
    }
}

/**
 * Удаление вакансии
 * @param {string} jobId - ID вакансии
 * @returns {Promise<void>}
 */
export async function deleteJob(jobId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            throw new Error('Вакансия не найдена');
        }
        
        const jobData = docSnap.data();
        if (jobData.employerId !== user.uid) {
            throw new Error('Нет прав на удаление этой вакансии');
        }
        
        await deleteDoc(docRef);
        console.log('Вакансия удалена:', jobId);
    } catch (error) {
        console.error('Ошибка удаления вакансии:', error);
        throw error;
    }
}

/**
 * Поиск вакансий по тексту
 * @param {string} searchText - Текст для поиска
 * @param {string} language - Язык поиска (cs, en, de)
 * @returns {Promise<Array>} Результаты поиска
 */
export async function searchJobs(searchText, language = 'cs') {
    try {
        const jobs = await getJobs();
        
        // Простой поиск по тексту (в продакшене лучше использовать Algolia или Elasticsearch)
        return jobs.filter(job => {
            const searchLower = searchText.toLowerCase();
            const title = job.languages?.[language]?.title || job.title || '';
            const description = job.languages?.[language]?.description || job.description || '';
            const requirements = job.languages?.[language]?.requirements || job.requirements || '';
            
            return title.toLowerCase().includes(searchLower) ||
                   description.toLowerCase().includes(searchLower) ||
                   requirements.toLowerCase().includes(searchLower) ||
                   job.company.name.toLowerCase().includes(searchLower) ||
                   job.location.city.toLowerCase().includes(searchLower);
        });
    } catch (error) {
        console.error('Ошибка поиска вакансий:', error);
        throw error;
    }
}

/**
 * Увеличение счетчика просмотров
 * @param {string} jobId - ID вакансии
 * @returns {Promise<void>}
 */
export async function incrementJobViews(jobId) {
    try {
        const docRef = doc(db, 'jobs', jobId);
        await updateDoc(docRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Ошибка увеличения просмотров:', error);
    }
}

/**
 * Получение вакансий работодателя
 * @param {string} employerId - ID работодателя
 * @returns {Promise<Array>} Список вакансий
 */
export async function getEmployerJobs(employerId = null) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не авторизован');
        }
        
        const targetEmployerId = employerId || user.uid;
        const q = query(
            collection(db, 'jobs'),
            where('employerId', '==', targetEmployerId),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const jobs = [];
        
        querySnapshot.forEach((doc) => {
            jobs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return jobs;
    } catch (error) {
        console.error('Ошибка получения вакансий работодателя:', error);
        throw error;
    }
}

// Экспорт для использования в других модулях
export { JobSchema };