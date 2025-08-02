// 💼 Модуль работы с вакансиями WorkInCZ
class JobsManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.jobsCache = new Map();
    this.filters = {
      category: 'all',
      location: 'all',
      workType: 'all',
      jobType: 'all',
      withHousing: false,
      urgent: false,
      salaryMin: null,
      salaryMax: null
    };
    
    this.init();
  }

  async init() {
    console.log('📋 JobsManager инициализируется...');
    
    // Ждем готовности AuthManager
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!window.authManager && attempts < maxAttempts) {
      console.log(`⏳ Ждем AuthManager (попытка ${attempts + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Подключаемся к AuthManager
    if (window.authManager) {
      try {
        // Проверяем, что метод waitForReady существует
        if (window.authManager && window.authManager.isInitialized) {
          console.log('✅ AuthManager уже инициализирован');
        } else {
          console.log('⏳ Ждем инициализации AuthManager...');
          while (!window.authManager?.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            console.log(`⏳ Попытка ${attempts}/${maxAttempts} - AuthManager: ${window.authManager ? 'найден' : 'не найден'}`);
          }
          
          if (window.authManager?.isInitialized) {
            console.log('✅ AuthManager инициализирован');
          } else {
            console.warn('⚠️ AuthManager не инициализирован в течение ожидаемого времени');
          }
        }
        
        this.db = window.authManager.db;
        this.auth = window.authManager.auth;
        
        console.log('🔥 JobsManager подключен к AuthManager');
        
        // Подписываемся на изменения аутентификации через AuthManager
        if (typeof window.authManager.subscribe === 'function') {
          this.unsubscribeAuth = window.authManager.subscribe((user) => {
            this.currentUser = user;
            if (user) {
              // Используем кешированные данные из AuthManager
              this.currentUser.userData = window.authManager.getUserData(user.uid);
            }
          });
        }
      } catch (error) {
        console.error('❌ Ошибка подключения к AuthManager:', error);
      }
    } else {
      console.warn('⚠️ AuthManager не найден, инициализируем без него');
    }
    
    this.setupEventListeners();
    this.loadJobs();
    console.log('📋 JobsManager инициализирован успешно');
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
    });

    // Интеграция с новой формой поиска
    const searchForm = document.getElementById('jobSearchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.filters.keywords = document.getElementById('searchKeywords')?.value?.trim() || '';
        this.filters.location = document.getElementById('searchLocation')?.value?.trim() || 'all';
        this.filters.category = document.getElementById('searchCategory')?.value || 'all';
        this.filters.workType = document.getElementById('searchWorkType')?.value || 'all';
        this.filters.withHousing = document.getElementById('filterHousing')?.checked || false;
        this.filters.urgent = document.getElementById('filterUrgent')?.checked || false;
        this.filters.noLanguage = document.getElementById('filterNoLanguage')?.checked || false;
        this.loadJobs();
      });
    }
  }

  async loadJobs(limit = 20) {
    try {
      console.log(`📋 Загружаю ${limit} вакансий...`);
      
      // В демо-режиме возвращаем тестовые данные
      const demoJobs = this.getDemoJobs();
      this.jobsCache.clear();
      
      demoJobs.forEach(job => {
        this.jobsCache.set(job.id, job);
      });
      
      console.log(`✅ Загружено ${demoJobs.length} вакансий`);
      return demoJobs;
      
    } catch (error) {
      console.error('Ошибка загрузки вакансий:', error);
      return [];
    }
  }

  // Демо-вакансии
  getDemoJobs() {
    return [
      {
        id: 'demo-1',
        title: 'Строитель',
        companyName: 'Строительная компания "Прага"',
        location: { city: 'Прага' },
        salary: { min: 25000, max: 35000, currency: 'Kč' },
        workType: 'full-time',
        category: 'construction',
        description: 'Требуется опытный строитель для работы в Праге. Жилье предоставляется.',
        requirements: {
          languages: [{ name: 'чешский', level: 'базовый' }],
          experience: '1+ лет'
        },
        isVip: true,
        hasAccommodation: true,
        isUrgent: true
      },
      {
        id: 'demo-2',
        title: 'Водитель-курьер',
        companyName: 'Логистическая компания',
        location: { city: 'Брно' },
        salary: { min: 22000, max: 28000, currency: 'Kč' },
        workType: 'full-time',
        category: 'logistics',
        description: 'Работа водителем-курьером в Брно. Гибкий график.',
        requirements: {
          languages: [{ name: 'чешский', level: 'не требуется' }],
          experience: 'без опыта'
        },
        isVip: false,
        hasAccommodation: false,
        isUrgent: false
      },
      {
        id: 'demo-3',
        title: 'Продавец-консультант',
        companyName: 'Торговый центр',
        location: { city: 'Острава' },
        salary: { min: 20000, max: 25000, currency: 'Kč' },
        workType: 'part-time',
        category: 'sales',
        description: 'Работа в торговом центре. Обучение предоставляется.',
        requirements: {
          languages: [{ name: 'чешский', level: 'базовый' }],
          experience: 'без опыта'
        },
        isVip: false,
        hasAccommodation: false,
        isUrgent: true
      }
    ];
  }

  // Отклик на вакансию
  async applyToJob(jobId) {
    try {
      if (!this.currentUser) {
        console.log('❌ Пользователь не авторизован');
        this.showLoginModal();
        return false;
      }

      console.log(`📋 Отклик на вакансию: ${jobId}`);
      
      // Проверяем лимит откликов
      const canApply = await this.checkApplicationLimit();
      if (!canApply) {
        this.showUpgradeModal('Превышен лимит откликов');
        return false;
      }
      
      // В демо-режиме просто логируем
      const job = this.jobsCache.get(jobId);
      if (job) {
        console.log(`✅ Отклик отправлен на вакансию: ${job.title}`);
        this.showSuccess('Отклик отправлен!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Ошибка отклика на вакансию:', error);
      this.showError('Ошибка отправки отклика');
      return false;
    }
  }

  // Проверка лимита откликов
  async checkApplicationLimit() {
    if (!this.currentUser) return false;
    
    // В демо-режиме всегда разрешаем
    return true;
  }

  // Сохранение вакансии
  async saveJob(jobId) {
    try {
      if (!this.currentUser) {
        console.log('❌ Пользователь не авторизован');
        this.showLoginModal();
        return false;
      }

      console.log(`📋 Сохранение вакансии: ${jobId}`);
      
      // В демо-режиме просто логируем
      const job = this.jobsCache.get(jobId);
      if (job) {
        console.log(`✅ Вакансия сохранена: ${job.title}`);
        this.showSuccess('Вакансия сохранена!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Ошибка сохранения вакансии:', error);
      this.showError('Ошибка сохранения вакансии');
      return false;
    }
  }

  // Подача заявки на бирже услуг
  async submitBid(jobId) {
    try {
      if (!this.currentUser) {
        console.log('❌ Пользователь не авторизован');
        this.showLoginModal();
        return false;
      }

      console.log(`📋 Подача заявки на вакансию: ${jobId}`);
      
      // В демо-режиме просто логируем
      const job = this.jobsCache.get(jobId);
      if (job) {
        console.log(`✅ Заявка подана на вакансию: ${job.title}`);
        this.showSuccess('Заявка подана!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Ошибка подачи заявки:', error);
      this.showError('Ошибка подачи заявки');
      return false;
    }
  }

  // Форматирование зарплаты
  formatSalary(salary) {
    if (!salary) return 'По договоренности';
    
    const { min, max, currency } = salary;
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    } else if (min) {
      return `от ${min.toLocaleString()} ${currency}`;
    } else if (max) {
      return `до ${max.toLocaleString()} ${currency}`;
    }
    
    return 'По договоренности';
  }

  // Форматирование типа работы
  formatWorkType(workType) {
    const types = {
      'full-time': 'Полная занятость',
      'part-time': 'Частичная занятость',
      'contract': 'Контракт',
      'temporary': 'Временная работа'
    };
    return types[workType] || workType;
  }

  // Показать модал входа
  showLoginModal() {
    if (window.enhancedAuthSystem) {
      window.enhancedAuthSystem.showEnhancedLoginModal();
    } else {
      console.log('❌ EnhancedAuthSystem не доступен');
    }
  }

  // Показать модал обновления
  showUpgradeModal(message) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-xl max-w-md w-full mx-4 p-6';
    
    const content = document.createElement('div');
    content.className = 'text-center';
    
    const icon = document.createElement('div');
    icon.className = 'w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4';
    icon.innerHTML = '<i class="ri-vip-crown-line text-primary text-2xl"></i>';
    
    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-gray-900 mb-2';
    title.textContent = 'Обновите статус';
    
    const description = document.createElement('p');
    description.className = 'text-gray-600 mb-6';
    description.textContent = message;
    
    const buttons = document.createElement('div');
    buttons.className = 'flex gap-3';
    
    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'upgrade-btn bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 flex-1';
    upgradeBtn.textContent = 'Обновить';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 flex-1';
    cancelBtn.textContent = 'Отмена';
    
    buttons.appendChild(upgradeBtn);
    buttons.appendChild(cancelBtn);
    
    content.appendChild(icon);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(buttons);
    
    modalContent.appendChild(content);
    modal.appendChild(modalContent);
    
    cancelBtn.onclick = () => modal.remove();
    upgradeBtn.onclick = () => {
      modal.remove();
      window.location.href = '#subscription';
    };

    document.body.appendChild(modal);
  }

  // Показать успех
  showSuccess(message) {
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      console.log('✅', message);
    }
  }

  // Показать ошибку
  showError(message) {
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      console.error('❌', message);
    }
  }

  // Получить вакансию по ID
  getJobById(jobId) {
    return this.jobsCache.get(jobId);
  }

  // Получить все вакансии
  getAllJobs() {
    return Array.from(this.jobsCache.values());
  }

  // Поиск вакансий
  searchJobs(query) {
    const jobs = this.getAllJobs();
    if (!query) return jobs;
    
    const searchTerm = query.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.companyName.toLowerCase().includes(searchTerm) ||
      job.location.city.toLowerCase().includes(searchTerm)
    );
  }

  // Фильтрация вакансий
  filterJobs(filters) {
    let jobs = this.getAllJobs();
    
    if (filters.category && filters.category !== 'all') {
      jobs = jobs.filter(job => job.category === filters.category);
    }
    
    if (filters.city) {
      jobs = jobs.filter(job => job.location.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    
    if (filters.hasAccommodation) {
      jobs = jobs.filter(job => job.hasAccommodation);
    }
    
    if (filters.isUrgent) {
      jobs = jobs.filter(job => job.isUrgent);
    }
    
    if (filters.workType && filters.workType !== 'any') {
      jobs = jobs.filter(job => job.workType === filters.workType);
    }
    
    return jobs;
  }
}

// Экспорт класса
window.JobsManager = JobsManager; 