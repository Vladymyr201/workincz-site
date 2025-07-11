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
      withHousing: false,
      urgent: false,
      salaryMin: null,
      salaryMax: null
    };
    
    this.init();
  }

  async init() {
    // Подключаемся к AuthManager
    if (window.authManager) {
      await window.authManager.waitForReady();
      this.db = window.authManager.db;
      this.auth = window.authManager.auth;
      
      console.log('🔥 JobsManager подключен к AuthManager');
      
      // Подписываемся на изменения аутентификации через AuthManager
      this.unsubscribeAuth = window.authManager.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          // Используем кешированные данные из AuthManager
          this.currentUser.userData = window.authManager.getUserData(user.uid);
        }
      });
    }
    
    this.setupEventListeners();
    this.loadJobs();
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
      
      if (e.target.matches('.save-btn, .save-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.save-btn');
        const jobId = btn.dataset.jobId;
        this.saveJob(jobId);
      }
    });

    // Фильтры категорий
    document.querySelectorAll('[data-category]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.filters.category = e.target.dataset.category;
        this.loadJobs();
      });
    });
  }

  async loadJobs(limit = 20) {
    try {
      if (!this.db) {
        console.log('Firebase не инициализирован, показываем демо-вакансии');
        this.renderDemoJobs();
        return;
      }

      // Упрощенный запрос без сложных where условий, чтобы избежать ошибок с индексами
      let query = this.db.collection('jobs')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      // Фильтрацию делаем на клиенте, чтобы избежать проблем с индексами
      // В продакшене лучше создать соответствующие индексы в Firebase Console

      const snapshot = await query.get();
      const allJobs = [];
      
      snapshot.forEach(doc => {
        const job = { id: doc.id, ...doc.data() };
        allJobs.push(job);
        this.jobsCache.set(doc.id, job);
      });

      // Применяем фильтры на клиенте
      const filteredJobs = allJobs.filter(job => {
        // Фильтр по статусу (активные вакансии)
        if (job.status !== 'active') return false;
        
        // Фильтр по категории
        if (this.filters.category !== 'all' && job.category !== this.filters.category) {
          return false;
        }
        
        // Фильтр по срочности
        if (this.filters.urgent && !job.urgent) {
          return false;
        }
        
        // Фильтр по жилью
        if (this.filters.withHousing && !job.housingProvided) {
          return false;
        }
        
        return true;
      });

      this.renderJobs(filteredJobs);
      return filteredJobs;

    } catch (error) {
      console.error('Ошибка загрузки вакансий:', error);
      // Показываем демо-вакансии в случае ошибки
      this.renderDemoJobs();
    }
  }

  renderDemoJobs() {
    // Демо-вакансии для случаев когда Firebase недоступен
    const demoJobs = [
      {
        id: 'demo-1',
        title: 'Разнорабочий на стройку',
        companyName: 'Stavební firma Novák',
        location: { city: 'Прага' },
        salary: { min: 140, max: 160, currency: 'CZK', period: 'hour' },
        workType: 'full-time',
        description: 'Требуются разнорабочие на строительный объект в Праге. Опыт работы не обязателен. Предоставляем жильё и помощь с документами.',
        urgent: true,
        housingProvided: true,
        requirements: { languages: [{ name: 'Русский' }, { name: 'Базовый чешский' }] }
      },
      {
        id: 'demo-2',
        title: 'Оператор производства',
        companyName: 'Škoda Auto a.s.',
        location: { city: 'Млада-Болеслав' },
        salary: { min: 32000, max: 38000, currency: 'CZK', period: 'month' },
        workType: 'full-time',
        description: 'Работа на автомобильном производстве. Сборка компонентов, контроль качества. Предоставляем общежитие, транспорт до работы и социальный пакет.',
        urgent: true,
        housingProvided: true,
        requirements: { languages: [{ name: 'Базовый чешский' }] }
      },
      {
        id: 'demo-3',
        title: 'Кладовщик-комплектовщик',
        companyName: 'Alza.cz a.s.',
        location: { city: 'Прага' },
        salary: { min: 130, currency: 'CZK', period: 'hour' },
        workType: 'full-time',
        description: 'Работа на складе интернет-магазина. Комплектация заказов, сортировка товаров. Требуется внимательность и ответственность. Бонусы за выполнение плана.',
        urgent: true,
        housingProvided: false,
        requirements: { languages: [{ name: 'Русский' }, { name: 'Английский' }] }
      }
    ];

    this.renderJobs(demoJobs);
  }

  renderJobs(jobs) {
    const container = document.querySelector('.jobs-container');
    if (!container) return;

    if (jobs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="ri-briefcase-line text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-medium text-gray-500 mb-2">Вакансии не найдены</h3>
          <p class="text-gray-400">Попробуйте изменить фильтры поиска</p>
        </div>
      `;
      return;
    }

    container.innerHTML = jobs.map(job => this.renderJobCard(job)).join('');
  }

  renderJobCard(job) {
    const hasHousing = job.housingProvided;
    const isUrgent = job.urgent;
    const isVipOnly = job.visibility === 'vip_only';
    
    // Проверяем доступ к VIP вакансиям
    const canViewJob = !isVipOnly || (this.currentUser && this.currentUser.subscription?.type === 'vip');
    
    if (isVipOnly && !canViewJob) {
      return this.renderVipJobCard(job);
    }

    return `
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 card-3d">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-semibold mb-1">${job.title}</h3>
              <p class="text-gray-600 mb-1">${job.companyName}</p>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <i class="ri-map-pin-line"></i>
                <span>${job.location.city}</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              ${isUrgent ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-secondary/80 to-secondary text-white">Срочно</span>` : ''}
              ${hasHousing ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">С жильём</span>` : ''}
              ${isVipOnly ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">VIP</span>` : ''}
            </div>
          </div>
          
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="ri-money-czech-koruna-circle-line text-gray-500"></i>
              <span class="font-medium">${this.formatSalary(job.salary)}</span>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <i class="ri-time-line text-gray-500"></i>
              <span>${this.formatWorkType(job.workType)}</span>
            </div>
            ${job.requirements?.languages?.length ? `
              <div class="flex items-center gap-2">
                <i class="ri-translate-2 text-gray-500"></i>
                <span>${job.requirements.languages.map(lang => lang.name).join(', ')}</span>
              </div>
            ` : ''}
          </div>
          
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">${job.description}</p>
          
          <div class="flex justify-between gap-2">
            <button class="apply-btn bg-primary text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-primary/90 whitespace-nowrap flex items-center gap-2 button-ripple" data-job-id="${job.id}">
              <i class="ri-send-plane-line"></i>
              Откликнуться
            </button>
            <button class="message-btn bg-green-500/10 text-green-600 border border-green-200 px-3 py-2 rounded-button text-sm font-medium hover:bg-green-500/20 whitespace-nowrap flex items-center gap-2" onclick="startChatWithUser('${job.employerId || job.companyId || 'demo-employer'}', 'Здравствуйте! Меня интересует вакансия ${job.title}', '${job.id}')" data-job-id="${job.id}">
              <i class="ri-message-3-line"></i>
              Написать
            </button>
            <button class="save-btn bg-secondary/10 text-secondary border-none px-3 py-2 rounded-button text-sm font-medium hover:bg-secondary/20 whitespace-nowrap flex items-center gap-2" data-job-id="${job.id}">
              <i class="ri-bookmark-line"></i>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderVipJobCard(job) {
    return `
      <div class="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg overflow-hidden shadow-sm relative">
        <div class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div class="text-center p-8">
            <i class="ri-vip-crown-line text-4xl text-primary mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">VIP Вакансия</h3>
            <p class="text-gray-600 mb-4">Для просмотра эксклюзивных вакансий нужна VIP подписка</p>
            <div class="flex gap-3">
              <button class="bg-primary text-white px-6 py-3 rounded-button font-medium hover:bg-primary/90 flex-1">
              Получить VIP за 1 Kč
            </button>
              <button class="bg-green-500/10 text-green-600 border border-green-200 px-4 py-3 rounded-button font-medium hover:bg-green-500/20 flex items-center gap-2" onclick="startChatWithUser('${job.employerId || job.companyId || 'demo-employer'}', 'Здравствуйте! Меня интересует VIP вакансия ${job.title}', '${job.id}')">
                <i class="ri-message-3-line"></i>
                Написать
              </button>
            </div>
          </div>
        </div>
        <div class="p-6 blur-sm">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold mb-1">${job.title}</h3>
              <p class="text-gray-600 mb-1">${job.companyName}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async applyToJob(jobId) {
    try {
      if (!this.currentUser) {
        this.showLoginModal();
        return;
      }

      // Проверяем лимиты на отклики
      const canApply = await this.checkApplicationLimit();
      if (!canApply) {
        this.showUpgradeModal('Превышен лимит откликов');
        return;
      }

      // Проверяем, не откликался ли уже пользователь
      const existingApplication = await this.db.collection('applications')
        .where('jobId', '==', jobId)
        .where('applicantId', '==', this.currentUser.uid)
        .get();

      if (!existingApplication.empty) {
        this.showError('Вы уже откликались на эту вакансию');
        return;
      }

      // Создаем отклик
      const applicationData = {
        jobId,
        applicantId: this.currentUser.uid,
        employerId: this.jobsCache.get(jobId)?.employerId,
        status: 'pending',
        coverLetter: '', // Можно добавить форму для сопроводительного письма
        attachments: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'manual'
      };

      await this.db.collection('applications').add(applicationData);

      // Обновляем счетчик откликов пользователя
      await this.updateApplicationCount();

      this.showSuccess('Отклик отправлен!');
      
    } catch (error) {
      console.error('Ошибка при отклике:', error);
      this.showError('Не удалось отправить отклик');
    }
  }

  async checkApplicationLimit() {
    if (!this.currentUser) return false;

    const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
    const userData = userDoc.data();
    
    if (!userData) return false;

    const subscription = userData.subscription || { type: 'basic' };
    const stats = userData.stats || { applicationsThisMonth: 0, applicationsLimit: 5 };

    // VIP пользователи имеют безлимитные отклики
    if (subscription.type === 'vip' || subscription.type === 'premium') {
      return true;
    }

    // Базовые пользователи ограничены 5 откликами в месяц
    return stats.applicationsThisMonth < stats.applicationsLimit;
  }

  async updateApplicationCount() {
    if (!this.currentUser) return;

    const userRef = this.db.collection('users').doc(this.currentUser.uid);
    await userRef.update({
      'stats.applicationsThisMonth': firebase.firestore.FieldValue.increment(1),
      'stats.lastApplicationDate': firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  async saveJob(jobId) {
    if (!this.currentUser) {
      this.showLoginModal();
      return;
    }

    try {
      const userRef = this.db.collection('users').doc(this.currentUser.uid);
      await userRef.update({
        savedJobs: firebase.firestore.FieldValue.arrayUnion(jobId)
      });

      this.showSuccess('Вакансия сохранена!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      this.showError('Не удалось сохранить вакансию');
    }
  }

  formatSalary(salary) {
    if (!salary) return 'По договоренности';
    
    const { min, max, currency = 'CZK', period = 'month' } = salary;
    const periodText = period === 'hour' ? '/час' : '/месяц';
    
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}${periodText}`;
    } else if (min) {
      return `от ${min.toLocaleString()} ${currency}${periodText}`;
    } else if (max) {
      return `до ${max.toLocaleString()} ${currency}${periodText}`;
    }
    
    return 'По договоренности';
  }

  formatWorkType(workType) {
    const types = {
      'full-time': 'Полный рабочий день',
      'part-time': 'Частичная занятость',
      'contract': 'По договору',
      'freelance': 'Фриланс'
    };
    
    return types[workType] || workType;
  }

  // Функция удалена - используем кешированные данные из AuthManager

  showLoginModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  showUpgradeModal(message) {
    // Создаем модальное окно для upgrade
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-md mx-4">
        <div class="text-center">
          <i class="ri-vip-crown-line text-4xl text-primary mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Нужна VIP подписка</h3>
          <p class="text-gray-600 mb-6">${message}</p>
          <div class="flex gap-3">
            <button class="upgrade-btn bg-primary text-white px-6 py-3 rounded-button font-medium hover:bg-primary/90 flex-1">
              Получить VIP за 1 Kč
            </button>
            <button class="cancel-btn bg-gray-100 text-gray-700 px-6 py-3 rounded-button font-medium hover:bg-gray-200">
              Отмена
            </button>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('.cancel-btn').onclick = () => modal.remove();
    modal.querySelector('.upgrade-btn').onclick = () => {
      modal.remove();
      // Перенаправляем на страницу подписки
      window.location.href = '#subscription';
    };

    document.body.appendChild(modal);
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.jobsManager = new JobsManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobsManager;
} 