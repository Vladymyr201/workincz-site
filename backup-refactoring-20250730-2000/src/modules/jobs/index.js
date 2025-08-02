/**
 * 💼 Jobs Module - Полноценная система управления вакансиями
 * Версия: 2.0.0
 * Дата: 30.07.2025
 * Интеграция: Firebase Firestore + AuthManager
 */

import { validateInput, sanitizeHTML } from '../../utils/validation/index.js';

class JobsManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.jobsCache = new Map();
    this.applicationsCache = new Map();
    
    // Фильтры по умолчанию
    this.filters = {
      category: 'all',
      location: 'all',
      workType: 'all',
      jobType: 'all',
      withHousing: false,
      urgent: false,
      salaryMin: null,
      salaryMax: null,
      status: 'active'
    };
    
    // Состояние пагинации
    this.pagination = {
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      hasMore: true,
      lastDoc: null
    };
    
    // Лимиты для разных типов пользователей
    this.limits = {
      free: {
        applications: 5,
        savedJobs: 10,
        jobPostings: 1
      },
      premium: {
        applications: 50,
        savedJobs: 100,
        jobPostings: 10
      },
      vip: {
        applications: 999,
        savedJobs: 999,
        jobPostings: 999
      }
    };
    
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('💼 JobsManager инициализируется...');
    
    try {
      // Ждем готовности Firebase
      await this.waitForFirebase();
      
      // Подключаемся к Firebase
      this.db = window.firebaseDb;
      this.auth = window.firebaseAuth;
      
      // Подписываемся на изменения аутентификации
      this.setupAuthListener();
      
      // Настраиваем обработчики событий
      this.setupEventListeners();
      
      // Загружаем начальные данные
      await this.loadInitialData();
      
      this.isInitialized = true;
      console.log('✅ JobsManager инициализирован успешно');
      
      // Уведомляем о готовности
      this.dispatchEvent('jobsManagerReady', { manager: this });
      
    } catch (error) {
      console.error('❌ Ошибка инициализации JobsManager:', error);
      this.handleError(error);
    }
  }

  async waitForFirebase() {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!window.firebaseDb && attempts < maxAttempts) {
      console.log(`⏳ Ждем Firebase (попытка ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.firebaseDb) {
      throw new Error('Firebase не инициализирован в течение ожидаемого времени');
    }
  }

  setupAuthListener() {
    if (this.auth) {
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          console.log('👤 Пользователь авторизован в JobsManager:', user.email);
          this.loadUserData();
        } else {
          console.log('👤 Пользователь не авторизован в JobsManager');
          this.clearUserData();
        }
      });
    }
  }

  setupEventListeners() {
    // Обработчики для кнопок откликов
    document.addEventListener('click', (e) => {
      if (e.target.matches('.apply-btn, .apply-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.apply-btn');
        const jobId = btn.dataset.jobId;
        this.applyToJob(jobId);
      }
      
      if (e.target.matches('.bid-btn, .bid-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.bid-btn');
        const jobId = btn.dataset.jobId;
        this.submitBid(jobId);
      }
      
      if (e.target.matches('.save-btn, .save-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.save-btn');
        const jobId = btn.dataset.jobId;
        this.saveJob(jobId);
      }
      
      if (e.target.matches('.share-btn, .share-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.share-btn');
        const jobId = btn.dataset.jobId;
        this.shareJob(jobId);
      }
    });

    // Обработчики фильтров
    document.addEventListener('change', (e) => {
      if (e.target.matches('.job-filter')) {
        this.handleFilterChange(e.target);
      }
    });

    // Обработчики поиска
    document.addEventListener('input', (e) => {
      if (e.target.matches('.job-search')) {
        this.handleSearchInput(e.target);
      }
    });
  }

  async loadInitialData() {
    try {
      // Загружаем вакансии
      await this.loadJobs();
      
      // Загружаем данные пользователя если авторизован
      if (this.currentUser) {
        await this.loadUserData();
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки начальных данных:', error);
    }
  }

  async loadJobs(limit = 20, resetPagination = false) {
    try {
      console.log('📋 Загружаем вакансии...');
      
      if (resetPagination) {
        this.pagination.currentPage = 1;
        this.pagination.lastDoc = null;
        this.pagination.hasMore = true;
      }
      
      // Создаем запрос к Firestore
      let query = this.db.collection('jobs');
      
      // Применяем фильтры
      if (this.filters.status !== 'all') {
        query = query.where('status', '==', this.filters.status);
      }
      if (this.filters.category !== 'all') {
        query = query.where('category', '==', this.filters.category);
      }
      if (this.filters.location !== 'all') {
        query = query.where('location', '==', this.filters.location);
      }
      if (this.filters.workType !== 'all') {
        query = query.where('workType', '==', this.filters.workType);
      }
      if (this.filters.jobType !== 'all') {
        query = query.where('jobType', '==', this.filters.jobType);
      }
      if (this.filters.withHousing) {
        query = query.where('withHousing', '==', true);
      }
      if (this.filters.urgent) {
        query = query.where('urgent', '==', true);
      }
      if (this.filters.salaryMin) {
        query = query.where('salaryMin', '>=', this.filters.salaryMin);
      }
      if (this.filters.salaryMax) {
        query = query.where('salaryMax', '<=', this.filters.salaryMax);
      }
      
      // Сортировка по дате создания (новые сначала)
      query = query.orderBy('createdAt', 'desc');
      
      // Пагинация
      if (this.pagination.lastDoc) {
        query = query.startAfter(this.pagination.lastDoc);
      }
      
      query = query.limit(limit);
      
      const snapshot = await query.get();
      
      const jobs = [];
      snapshot.forEach((doc) => {
        const jobData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        };
        jobs.push(jobData);
        this.jobsCache.set(doc.id, jobData);
      });
      
      // Обновляем пагинацию
      this.pagination.lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      this.pagination.hasMore = snapshot.docs.length === limit;
      this.pagination.totalItems += jobs.length;
      
      console.log(`✅ Загружено ${jobs.length} вакансий`);
      
      // Обновляем UI
      this.updateJobsUI(jobs);
      
      // Уведомляем о загрузке
      this.dispatchEvent('jobsLoaded', { jobs, pagination: this.pagination });
      
      return jobs;
      
    } catch (error) {
      console.error('❌ Ошибка загрузки вакансий:', error);
      this.handleError(error);
      return [];
    }
  }

  async loadUserData() {
    if (!this.currentUser) return;
    
    try {
      console.log('👤 Загружаем данные пользователя...');
      
      // Загружаем заявки пользователя
      const applicationsSnapshot = await this.db
        .collection('applications')
        .where('userId', '==', this.currentUser.uid)
        .get();
      
      const applications = [];
      applicationsSnapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      this.applicationsCache.clear();
      applications.forEach(app => {
        this.applicationsCache.set(app.jobId, app);
      });
      
      // Загружаем сохраненные вакансии
      const savedJobsSnapshot = await this.db
        .collection('users')
        .doc(this.currentUser.uid)
        .collection('savedJobs')
        .get();
      
      const savedJobs = [];
      savedJobsSnapshot.forEach((doc) => {
        savedJobs.push(doc.id);
      });
      
      // Обновляем UI
      this.updateUserUI(applications, savedJobs);
      
      console.log(`✅ Загружено ${applications.length} заявок и ${savedJobs.length} сохраненных вакансий`);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
  }

  clearUserData() {
    this.applicationsCache.clear();
    this.updateUserUI([], []);
  }

  async applyToJob(jobId) {
    try {
      if (!this.currentUser) {
        this.showLoginModal();
        return;
      }
      
      // Проверяем лимиты
      const canApply = await this.checkApplicationLimit();
      if (!canApply) {
        this.showUpgradeModal('Достигнут лимит заявок для бесплатного аккаунта');
        return;
      }
      
      // Проверяем, не подавал ли уже заявку
      if (this.applicationsCache.has(jobId)) {
        this.showError('Вы уже подавали заявку на эту вакансию');
        return;
      }
      
      // Получаем данные вакансии
      const job = this.jobsCache.get(jobId);
      if (!job) {
        this.showError('Вакансия не найдена');
        return;
      }
      
      // Создаем заявку
      const application = {
        jobId,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        jobTitle: job.title,
        employerId: job.employerId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Сохраняем в Firestore
      const docRef = await this.db.collection('applications').add(application);
      application.id = docRef.id;
      
      // Обновляем кеш
      this.applicationsCache.set(jobId, application);
      
      // Обновляем UI
      this.updateJobButton(jobId, 'applied');
      
      this.showSuccess('Заявка успешно подана!');
      
      // Уведомляем о подаче заявки
      this.dispatchEvent('jobApplied', { jobId, application });
      
    } catch (error) {
      console.error('❌ Ошибка подачи заявки:', error);
      this.handleError(error);
    }
  }

  async checkApplicationLimit() {
    if (!this.currentUser) return false;
    
    try {
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      const userData = userDoc.data();
      const userType = userData?.type || 'free';
      
      const currentApplications = this.applicationsCache.size;
      const limit = this.limits[userType].applications;
      
      return currentApplications < limit;
      
    } catch (error) {
      console.error('❌ Ошибка проверки лимита:', error);
      return false;
    }
  }

  async saveJob(jobId) {
    try {
      if (!this.currentUser) {
        this.showLoginModal();
        return;
      }
      
      const job = this.jobsCache.get(jobId);
      if (!job) {
        this.showError('Вакансия не найдена');
        return;
      }
      
      // Проверяем, не сохранена ли уже
      const savedJobRef = this.db
        .collection('users')
        .doc(this.currentUser.uid)
        .collection('savedJobs')
        .doc(jobId);
      
      const savedJobDoc = await savedJobRef.get();
      
      if (savedJobDoc.exists) {
        // Удаляем из сохраненных
        await savedJobRef.delete();
        this.updateJobButton(jobId, 'unsaved');
        this.showSuccess('Вакансия удалена из сохраненных');
      } else {
        // Добавляем в сохраненные
        await savedJobRef.set({
          jobId,
          savedAt: new Date()
        });
        this.updateJobButton(jobId, 'saved');
        this.showSuccess('Вакансия добавлена в сохраненные');
      }
      
    } catch (error) {
      console.error('❌ Ошибка сохранения вакансии:', error);
      this.handleError(error);
    }
  }

  async submitBid(jobId) {
    try {
      if (!this.currentUser) {
        this.showLoginModal();
        return;
      }
      
      // Показываем модальное окно для ввода ставки
      this.showBidModal(jobId);
      
    } catch (error) {
      console.error('❌ Ошибка подачи ставки:', error);
      this.handleError(error);
    }
  }

  async shareJob(jobId) {
    try {
      const job = this.jobsCache.get(jobId);
      if (!job) {
        this.showError('Вакансия не найдена');
        return;
      }
      
      const shareUrl = `${window.location.origin}/job-details.html?id=${jobId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: job.description,
          url: shareUrl
        });
      } else {
        // Копируем в буфер обмена
        await navigator.clipboard.writeText(shareUrl);
        this.showSuccess('Ссылка скопирована в буфер обмена');
      }
      
    } catch (error) {
      console.error('❌ Ошибка шаринга:', error);
      this.handleError(error);
    }
  }

  handleFilterChange(element) {
    const filterName = element.name;
    const filterValue = element.type === 'checkbox' ? element.checked : element.value;
    
    this.filters[filterName] = filterValue;
    
    // Сбрасываем пагинацию и загружаем заново
    this.loadJobs(20, true);
  }

  handleSearchInput(element) {
    const query = element.value.trim();
    
    // Дебаунсинг поиска
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchJobs(query);
    }, 300);
  }

  async searchJobs(query) {
    try {
      if (!query) {
        await this.loadJobs(20, true);
        return;
      }
      
      console.log('🔍 Поиск вакансий:', query);
      
      // Простой поиск по названию и описанию
      const snapshot = await this.db
        .collection('jobs')
        .where('status', '==', 'active')
        .orderBy('title')
        .get();
      
      const jobs = [];
      snapshot.forEach((doc) => {
        const jobData = doc.data();
        const searchText = `${jobData.title} ${jobData.description}`.toLowerCase();
        
        if (searchText.includes(query.toLowerCase())) {
          jobs.push({
            id: doc.id,
            ...jobData
          });
        }
      });
      
      this.updateJobsUI(jobs);
      
    } catch (error) {
      console.error('❌ Ошибка поиска:', error);
      this.handleError(error);
    }
  }

  updateJobsUI(jobs) {
    const jobsContainer = document.getElementById('jobsContainer');
    if (!jobsContainer) return;
    
    if (jobs.length === 0) {
      jobsContainer.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">Вакансии не найдены</h3>
          <p class="text-gray-500">Попробуйте изменить фильтры или поисковый запрос</p>
        </div>
      `;
      return;
    }
    
    const jobsHTML = jobs.map(job => this.renderJobCard(job)).join('');
    jobsContainer.innerHTML = jobsHTML;
  }

  updateUserUI(applications, savedJobs) {
    // Обновляем кнопки заявок
    applications.forEach(app => {
      this.updateJobButton(app.jobId, 'applied');
    });
    
    // Обновляем кнопки сохраненных
    savedJobs.forEach(jobId => {
      this.updateJobButton(jobId, 'saved');
    });
  }

  updateJobButton(jobId, state) {
    const applyBtn = document.querySelector(`[data-job-id="${jobId}"].apply-btn`);
    const saveBtn = document.querySelector(`[data-job-id="${jobId}"].save-btn`);
    
    if (applyBtn) {
      switch (state) {
        case 'applied':
          applyBtn.innerHTML = '<i class="fas fa-check"></i> Заявка подана';
          applyBtn.classList.add('bg-green-500', 'text-white');
          applyBtn.classList.remove('bg-primary-600', 'hover:bg-primary-700');
          applyBtn.disabled = true;
          break;
        default:
          applyBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Откликнуться';
          applyBtn.classList.remove('bg-green-500', 'text-white');
          applyBtn.classList.add('bg-primary-600', 'hover:bg-primary-700');
          applyBtn.disabled = false;
      }
    }
    
    if (saveBtn) {
      switch (state) {
        case 'saved':
          saveBtn.innerHTML = '<i class="fas fa-heart"></i> Сохранено';
          saveBtn.classList.add('text-red-500');
          break;
        default:
          saveBtn.innerHTML = '<i class="far fa-heart"></i> Сохранить';
          saveBtn.classList.remove('text-red-500');
      }
    }
  }

  renderJobCard(job) {
    const isApplied = this.applicationsCache.has(job.id);
    const isSaved = false; // TODO: Проверить сохраненные
    
    return `
      <div class="job-card bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${sanitizeHTML(job.title)}</h3>
            <p class="text-gray-600 mb-2">${sanitizeHTML(job.company)}</p>
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <i class="fas fa-map-marker-alt mr-2"></i>
              ${sanitizeHTML(job.location)}
            </div>
          </div>
          <div class="flex space-x-2">
            <button class="save-btn text-gray-400 hover:text-red-500 transition-colors" data-job-id="${job.id}">
              <i class="far fa-heart"></i>
            </button>
            <button class="share-btn text-gray-400 hover:text-blue-500 transition-colors" data-job-id="${job.id}">
              <i class="fas fa-share"></i>
            </button>
          </div>
        </div>
        
        <p class="text-gray-700 mb-4 line-clamp-3">${sanitizeHTML(job.description)}</p>
        
        <div class="flex flex-wrap gap-2 mb-4">
          ${job.tags ? job.tags.map(tag => `
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${sanitizeHTML(tag)}</span>
          `).join('') : ''}
        </div>
        
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span><i class="fas fa-money-bill-wave mr-1"></i> ${this.formatSalary(job.salary)}</span>
            <span><i class="fas fa-clock mr-1"></i> ${this.formatWorkType(job.workType)}</span>
            ${job.withHousing ? '<span class="text-green-600"><i class="fas fa-home mr-1"></i> Жилье</span>' : ''}
            ${job.urgent ? '<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i> Срочно</span>' : ''}
          </div>
          
          <div class="flex space-x-2">
            <button class="apply-btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors ${isApplied ? 'bg-green-500' : ''}" data-job-id="${job.id}" ${isApplied ? 'disabled' : ''}>
              ${isApplied ? '<i class="fas fa-check"></i> Заявка подана' : '<i class="fas fa-paper-plane"></i> Откликнуться'}
            </button>
            ${job.allowBidding ? `
              <button class="bid-btn bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" data-job-id="${job.id}">
                <i class="fas fa-gavel"></i> Ставка
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  formatSalary(salary) {
    if (!salary) return 'По договоренности';
    
    if (typeof salary === 'object') {
      const { min, max, currency = 'CZK' } = salary;
      if (min && max) {
        return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
      }
      return `${min.toLocaleString()} ${currency}`;
    }
    
    return `${salary.toLocaleString()} CZK`;
  }

  formatWorkType(workType) {
    const types = {
      'full-time': 'Полная занятость',
      'part-time': 'Частичная занятость',
      'contract': 'Контракт',
      'temporary': 'Временная работа',
      'internship': 'Стажировка'
    };
    
    return types[workType] || workType;
  }

  showLoginModal() {
    // Показываем модальное окно входа
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">Войдите в аккаунт</h3>
        <p class="text-gray-600 mb-4">Для подачи заявки необходимо войти в систему</p>
        <div class="flex space-x-2">
          <button class="flex-1 bg-primary-600 text-white py-2 rounded-lg" onclick="window.location.href='/auth/login.html'">
            Войти
          </button>
          <button class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg" onclick="this.closest('.fixed').remove()">
            Отмена
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showUpgradeModal(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">Обновите аккаунт</h3>
        <p class="text-gray-600 mb-4">${message}</p>
        <div class="flex space-x-2">
          <button class="flex-1 bg-primary-600 text-white py-2 rounded-lg" onclick="window.location.href='/pricing.html'">
            Обновить
          </button>
          <button class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg" onclick="this.closest('.fixed').remove()">
            Позже
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showBidModal(jobId) {
    const job = this.jobsCache.get(jobId);
    if (!job) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">Подать ставку</h3>
        <p class="text-gray-600 mb-4">Вакансия: ${sanitizeHTML(job.title)}</p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ваша ставка (CZK)</label>
          <input type="number" id="bidAmount" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Введите сумму">
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
          <textarea id="bidComment" class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24" placeholder="Расскажите о своем опыте..."></textarea>
        </div>
        
        <div class="flex space-x-2">
          <button class="flex-1 bg-primary-600 text-white py-2 rounded-lg" onclick="this.submitBid('${jobId}')">
            Отправить ставку
          </button>
          <button class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg" onclick="this.closest('.fixed').remove()">
            Отмена
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showSuccess(message) {
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      alert(message);
    }
  }

  showError(message) {
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
  }

  handleError(error) {
    console.error('❌ JobsManager Error:', error);
    
    const message = error.message || 'Произошла ошибка при работе с вакансиями';
    this.showError(message);
    
    // Отправляем ошибку в систему мониторинга
    this.dispatchEvent('jobsError', { error, message });
  }

  dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(`jobs:${eventName}`, {
      detail: { manager: this, ...data }
    });
    document.dispatchEvent(event);
  }

  // Публичные методы для внешнего использования
  getJobs() {
    return Array.from(this.jobsCache.values());
  }

  getJobById(jobId) {
    return this.jobsCache.get(jobId);
  }

  getApplications() {
    return Array.from(this.applicationsCache.values());
  }

  isApplied(jobId) {
    return this.applicationsCache.has(jobId);
  }

  getFilters() {
    return { ...this.filters };
  }

  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.loadJobs(20, true);
  }

  getPagination() {
    return { ...this.pagination };
  }

  loadMore() {
    if (this.pagination.hasMore) {
      return this.loadJobs(20, false);
    }
    return Promise.resolve([]);
  }
}

// Создаем экземпляр менеджера
const jobsManager = new JobsManager();

// Экспортируем для использования в других модулях
export default jobsManager;
export { JobsManager }; 