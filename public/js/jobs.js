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
      console.log('🔧 Firebase не доступен, показываем демо-вакансии');
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

  // 🟢 Рендер вакансий с skeleton
  renderJobs(jobs) {
    const container = document.querySelector('.jobs-container');
    if (!container) return;
    // Skeleton при загрузке
    if (!jobs) { showJobsSkeleton(container, 3); return; }
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
    window.showToast(message, 'success');
  }

  showError(message) {
    window.showToast(message, 'error');
  }

  // --- Унифицированный toast ---
  // Используйте window.showToast(message, type) вместо собственной реализации

  // 🟢 Рекомендации вакансий (Вам может понравиться)
  showJobRecommendations() {
    const recBlock = document.getElementById('jobRecommendations');
    const recList = document.getElementById('jobRecommendationsList');
    if (!recBlock || !recList) return;

    // История Lucky Job (последние 5 показов)
    this._luckyJobHistory = this._luckyJobHistory || [];
    // История откликов (заглушка)
    this._appliedJobs = this._appliedJobs || [];

    // Собираем все вакансии
    let jobs = Array.from(this.jobsCache.values());
    if (!jobs.length) {
      // Демо-режим: 3 случайные вакансии
      recList.innerHTML = [
        { title: 'Демо-вакансия A', companyName: 'DemoCo', location: { city: 'Прага' } },
        { title: 'Демо-вакансия B', companyName: 'DemoCo', location: { city: 'Брно' } },
        { title: 'Демо-вакансия C', companyName: 'DemoCo', location: { city: 'Острава' } }
      ].map(j => `<div class='border rounded p-3'><b>${j.title}</b><br><span class='text-gray-500'>${j.companyName}, ${j.location.city}</span></div>`).join('');
      recBlock.classList.remove('hidden');
      return;
    }

    // Собираем интересы пользователя по истории
    const lastJobs = this._luckyJobHistory.slice(-5).concat(this._appliedJobs);
    const cats = new Set(lastJobs.map(j => j.category).filter(Boolean));
    const locs = new Set(lastJobs.map(j => j.location?.city).filter(Boolean));
    const langs = new Set((lastJobs.flatMap(j => (j.requirements?.languages||[]).map(l => l.name))).filter(Boolean));

    // Фильтруем вакансии по интересам
    let recs = jobs.filter(j =>
      (cats.size === 0 || cats.has(j.category)) ||
      (locs.size === 0 || locs.has(j.location?.city)) ||
      (langs.size === 0 || (j.requirements?.languages||[]).some(l => langs.has(l.name)))
    );
    // Исключаем уже показанные/откликнутые
    const shownIds = new Set(lastJobs.map(j => j.id));
    recs = recs.filter(j => !shownIds.has(j.id));
    // Оставляем максимум 6
    recs = recs.slice(0, 6);

    if (!recs.length) {
      recBlock.classList.add('hidden');
      return;
    }
    recList.innerHTML = recs.map(j => `<div class='border rounded p-3'><b>${j.title}</b><br><span class='text-gray-500'>${j.companyName}, ${j.location?.city||''}</span></div>`).join('');
    recBlock.classList.remove('hidden');
    // После показа обычных рекомендаций — AI-подбор
    this.showAIJobRecommendations();
  }

  // 🟢 AI-подбор вакансий (AI-рекомендации)
  async showAIJobRecommendations() {
    const aiBlock = document.getElementById('aiJobRecommendations');
    const aiList = document.getElementById('aiJobRecommendationsList');
    if (!aiBlock || !aiList) return;
    // Показываем skeleton
    showAISkeleton();
    // Firestore: user_recommendations
    if (this.db && this.currentUser) {
      try {
        const recDoc = await this.db.collection('user_recommendations').doc(this.currentUser.uid).get();
        const rec = recDoc.data();
        if (rec?.jobIds?.length) {
          // Получаем вакансии по id
          const jobs = [];
          for (const jobId of rec.jobIds) {
            const jobDoc = await this.db.collection('jobs').doc(jobId).get();
            if (jobDoc.exists) jobs.push(jobDoc.data());
          }
          if (jobs.length) {
            aiList.innerHTML = jobs.map(j => `<div class='border rounded p-3'><b>${j.title}</b><br><span class='text-gray-500'>${j.companyName}, ${j.location?.city||''}</span></div>`).join('');
            aiBlock.classList.remove('hidden');
            return;
          }
        }
      } catch (e) {
        if (window.Sentry) Sentry.captureException(e);
      }
    }
    // Демо-режим: 2 случайные вакансии
    aiList.innerHTML = [
      { title: 'AI-вакансия A', companyName: 'AI-DemoCo', location: { city: 'Прага' } },
      { title: 'AI-вакансия B', companyName: 'AI-DemoCo', location: { city: 'Брно' } }
    ].map(j => `<div class='border rounded p-3'><b>${j.title}</b><br><span class='text-gray-500'>${j.companyName}, ${j.location.city}</span></div>`).join('');
    aiBlock.classList.remove('hidden');
  }

  // 🟢 Показ баннера обратной связи Lucky Job
  showLuckyJobFeedbackBanner() {
    const banner = document.getElementById('luckyJobFeedback');
    if (banner) banner.classList.remove('hidden');
  }

  // 🟢 Скрыть баннер обратной связи
  hideLuckyJobFeedbackBanner() {
    const banner = document.getElementById('luckyJobFeedback');
    if (banner) banner.classList.add('hidden');
  }

  // 🟢 Отправка отзыва в Firestore
  sendLuckyJobFeedback(type, comment = '') {
    // Firestore
    if (this.db && window.firebase) {
      try {
        this.db.collection('feedback_luckyjob').add({
          type,
          comment,
          userId: this.currentUser?.uid || null,
          timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
          userAgent: navigator.userAgent
        });
      } catch (e) {
        if (window.Sentry) Sentry.captureException(e);
      }
    }
    // UX: скрыть баннер и модалку, показать благодарность
    this.hideLuckyJobFeedbackBanner();
    document.getElementById('luckyJobFeedbackModal')?.classList.add('hidden');
    alert('Спасибо за ваш отзыв!');
  }

  // 🟢 Lucky Job: показать случайную вакансию
  showLuckyJob() {
    // Получаем список вакансий из кэша или демо-данных
    let jobs = Array.from(this.jobsCache.values());
    if (!jobs.length) {
      // Если нет кэша — используем демо-данные (структура как в renderDemoJobs)
      jobs = [
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
          requirements: { languages: [{ name: 'Русский' }, { name: 'Базовый чешский' }] },
          status: 'active',
          visibility: 'public',
        },
        // ... можно добавить еще демо-вакансии ...
      ];
    }
    // Фильтруем только активные и публичные вакансии
    jobs = jobs.filter(j => j.status === 'active' && (j.visibility === 'public' || !j.visibility));
    if (!jobs.length) {
      this.showError('Нет доступных вакансий для рандома');
      return;
    }
    // Выбираем случайную вакансию
    const luckyJob = jobs[Math.floor(Math.random() * jobs.length)];
    // Логируем событие показа
    this.logLuckyJobEvent('show', luckyJob);
    // Добавляем в историю
    this._luckyJobHistory = this._luckyJobHistory || [];
    this._luckyJobHistory.push(luckyJob);
    // После 3+ нажатий показываем рекомендации
    if (this._luckyJobHistory.length >= 3) this.showJobRecommendations();
    // После 5+ нажатий показываем баннер обратной связи (один раз)
    if (this._luckyJobHistory.length === 5) this.showLuckyJobFeedbackBanner();
    this.renderLuckyJobModal(luckyJob);
  }

  // 🟢 Модальное окно с Lucky Job (минималистично)
  renderLuckyJobModal(job) {
    // Удаляем старое модальное окно, если есть
    document.getElementById('luckyJobModal')?.remove();
    // Формируем share-ссылку
    const shareUrl = window.location.origin + '/?job=' + encodeURIComponent(job.id);
    // Модальное окно
    const modal = document.createElement('div');
    modal.id = 'luckyJobModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-fade-in">
        <button aria-label="Закрыть" tabIndex="0" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" id="closeLuckyJobModal">&times;</button>
        <div class="flex items-center gap-2 mb-2">
          <i class="ri-dice-5-line text-2xl text-primary"></i>
          <span class="font-bold text-lg">Мне повезет!</span>
        </div>
        <div class="mb-2 font-semibold text-primary">${job.title}</div>
        <div class="mb-1 text-gray-700">${job.companyName} — ${job.location?.city || ''}</div>
        <div class="mb-2 text-sm text-gray-500">${job.description || ''}</div>
        <div class="mb-2 text-sm">💸 <b>Зарплата:</b> ${this.formatSalary(job.salary)}</div>
        <div class="flex gap-2 mt-4">
          <button class="apply-btn px-4 py-2 bg-success text-white rounded focus:outline-none" data-job-id="${job.id}" aria-label="Откликнуться" tabIndex="0">Откликнуться</button>
          <a href="${shareUrl}" target="_blank" class="px-4 py-2 bg-primary text-white rounded focus:outline-none" aria-label="Поделиться" tabIndex="0">Поделиться</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    // Закрытие по кнопке
    modal.querySelector('#closeLuckyJobModal').onclick = () => modal.remove();
    // Закрытие по клику вне окна
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
    // Фокусировка для доступности
    modal.querySelector('button, a')?.focus();
  }

  // 🟢 Логирование события Lucky Job
  logLuckyJobEvent(eventType, job) {
    // Sentry breadcrumb
    if (window.Sentry) {
      Sentry.addBreadcrumb({
        message: `Lucky Job: ${eventType}`,
        category: 'user.luckyjob',
        data: { jobId: job?.id || null, title: job?.title || null },
        level: 'info'
      });
    }
    // Firestore event log (production)
    if (this.db && window.firebase) {
      try {
        this.db.collection('analytics_luckyjob').add({
          eventType,
          jobId: job?.id || null,
          title: job?.title || null,
          userId: this.currentUser?.uid || null,
          timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
          userAgent: navigator.userAgent
        });
      } catch (e) {
        // Не критично, просто лог
        if (window.Sentry) Sentry.captureException(e);
      }
    }
  }

  // 🟢 Обновление мини-дашборда обратной связи Lucky Job
  async updateLuckyJobFeedbackDashboard() {
    const dash = document.getElementById('luckyJobFeedbackDashboard');
    const posEl = document.getElementById('luckyJobFeedbackPositive');
    const totalEl = document.getElementById('luckyJobFeedbackTotal');
    const issuesEl = document.getElementById('luckyJobFeedbackTopIssues');
    const trendsEl = document.getElementById('luckyJobFeedbackTrends');
    if (!dash || !posEl || !totalEl || !issuesEl || !trendsEl) return;

    // Если нет Firestore — демо-режим
    if (!this.db || !window.firebase) {
      dash.classList.remove('hidden');
      posEl.textContent = '80%';
      totalEl.textContent = '25';
      issuesEl.innerHTML = '<li>Мало вакансий</li><li>Нет фильтра по городу</li><li>Добавьте больше IT</li>';
      trendsEl.textContent = 'Пн: 3, Вт: 5, Ср: 7, Чт: 4, Пт: 6, Сб: 0, Вс: 0';
      return;
    }

    try {
      const snapshot = await this.db.collection('feedback_luckyjob').get();
      let total = 0, positive = 0;
      const comments = [];
      const trends = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        total++;
        if (d.type === 'yes') positive++;
        if (d.type === 'comment' && d.comment) comments.push(d.comment);
        // Динамика по дням
        const date = d.timestamp?.toDate ? d.timestamp.toDate() : (d.timestamp instanceof Date ? d.timestamp : null);
        if (date) {
          const day = date.toLocaleDateString('ru-RU', { weekday: 'short' });
          trends[day] = (trends[day] || 0) + 1;
        }
      });
      dash.classList.remove('hidden');
      posEl.textContent = total ? Math.round((positive/total)*100) + '%' : '0%';
      totalEl.textContent = total;
      // Топ-3 проблемы/пожелания (по словам)
      const wordCounts = {};
      comments.forEach(txt => {
        txt.toLowerCase().split(/\W+/).forEach(w => {
          if (w.length > 3) wordCounts[w] = (wordCounts[w]||0)+1;
        });
      });
      const top = Object.entries(wordCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([w,c])=>`<li>${w} <span class='text-gray-400'>(${c})</span></li>`).join('');
      issuesEl.innerHTML = top || '<li>Нет данных</li>';
      // Динамика по дням
      const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
      const trendStr = days.map(d=>`${d}: ${trends[d]||0}`).join(', ');
      trendsEl.textContent = trendStr;
    } catch (e) {
      dash.classList.remove('hidden');
      posEl.textContent = '—';
      totalEl.textContent = '—';
      issuesEl.innerHTML = '<li>Ошибка загрузки</li>';
      trendsEl.textContent = '';
      if (window.Sentry) Sentry.captureException(e);
    }
  }

  // 🟢 Обновление статистики Lucky Job для админов
  async updateLuckyJobAnalytics() {
    // DOM-элементы
    const clicksEl = document.getElementById('luckyJobClicks');
    const showsEl = document.getElementById('luckyJobShows');
    const topJobsEl = document.getElementById('luckyJobTopJobs');
    if (!clicksEl || !showsEl || !topJobsEl) return;

    // Если нет Firestore — демо-режим
    if (!this.db || !window.firebase) {
      clicksEl.textContent = Math.floor(Math.random() * 100);
      showsEl.textContent = Math.floor(Math.random() * 200);
      topJobsEl.innerHTML = '<li>Демо-вакансия 1</li><li>Демо-вакансия 2</li>';
      return;
    }

    // Собираем статистику из Firestore
    try {
      const snapshot = await this.db.collection('analytics_luckyjob').get();
      let clicks = 0, shows = 0;
      const jobStats = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.eventType === 'click') clicks++;
        if (d.eventType === 'show') {
          shows++;
          if (d.jobId) {
            jobStats[d.jobId] = jobStats[d.jobId] || { count: 0, title: d.title || d.jobId };
            jobStats[d.jobId].count++;
          }
        }
      });
      clicksEl.textContent = clicks;
      showsEl.textContent = shows;
      // Топ-5 вакансий
      const top = Object.values(jobStats).sort((a, b) => b.count - a.count).slice(0, 5);
      topJobsEl.innerHTML = top.length ? top.map(j => `<li>${j.title} <span class='text-gray-400'>(${j.count})</span></li>`).join('') : '<li>Нет данных</li>';
    } catch (e) {
      clicksEl.textContent = '—';
      showsEl.textContent = '—';
      topJobsEl.innerHTML = '<li>Ошибка загрузки</li>';
      if (window.Sentry) Sentry.captureException(e);
    }
    // Обновляем мини-дашборд обратной связи
    this.updateLuckyJobFeedbackDashboard();
  }
}

/**
 * Фиксирует дату отклика для автоматизации карьерного челленджа недели (MVP: localStorage).
 */
function trackWeeklyChallengeApplication() {
  let dates = [];
  try {
    dates = JSON.parse(localStorage.getItem('careerWeeklyChallengeDates') || '[]');
    if (!Array.isArray(dates)) dates = [];
  } catch { dates = []; }
  dates.push(Date.now());
  localStorage.setItem('careerWeeklyChallengeDates', JSON.stringify(dates));
}

// 🟢 Skeleton loading для вакансий (вне класса)
function showJobsSkeleton(container, count = 3) {
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class='border rounded p-3 animate-pulse bg-gray-100'>
      <div class='h-4 w-2/3 bg-gray-300 rounded mb-2'></div>
      <div class='h-3 w-1/2 bg-gray-200 rounded mb-1'></div>
      <div class='h-3 w-1/3 bg-gray-200 rounded'></div>
    </div>
  `).join('');
}
// 🟢 Skeleton loading для AI-рекомендаций (вне класса)
function showAISkeleton() {
  const aiBlock = document.getElementById('aiJobRecommendations');
  const aiList = document.getElementById('aiJobRecommendationsList');
  if (!aiBlock || !aiList) return;
  aiList.innerHTML = Array(2).fill(0).map(() => `
    <div class='border rounded p-3 animate-pulse bg-gray-100'>
      <div class='h-4 w-2/3 bg-gray-300 rounded mb-2'></div>
      <div class='h-3 w-1/2 bg-gray-200 rounded mb-1'></div>
      <div class='h-3 w-1/3 bg-gray-200 rounded'></div>
    </div>
  `).join('');
  aiBlock.classList.remove('hidden');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.jobsManager = new JobsManager();
});

// 🟢 Инициализация Lucky Job кнопки
window.addEventListener('DOMContentLoaded', () => {
  const luckyBtn = document.getElementById('luckyJobBtn');
  if (luckyBtn && window.jobsManager) {
    luckyBtn.addEventListener('click', () => {
      window.jobsManager.logLuckyJobEvent('click');
      window.jobsManager.showLuckyJob();
    });
    luckyBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        window.jobsManager.logLuckyJobEvent('click');
        window.jobsManager.showLuckyJob();
      }
    });
  }
});

// 🟢 Инициализация баннера и модалки Lucky Job Feedback
window.addEventListener('DOMContentLoaded', () => {
  // Feedback: обработка кнопок
  const yesBtn = document.getElementById('luckyJobFeedbackYes');
  const noBtn = document.getElementById('luckyJobFeedbackNo');
  const commentBtn = document.getElementById('luckyJobFeedbackComment');
  const modal = document.getElementById('luckyJobFeedbackModal');
  const closeModal = document.getElementById('closeLuckyJobFeedbackModal');
  const sendBtn = document.getElementById('luckyJobFeedbackSend');
  const textArea = document.getElementById('luckyJobFeedbackText');
  if (yesBtn) yesBtn.onclick = () => window.jobsManager?.sendLuckyJobFeedback('yes');
  if (noBtn) noBtn.onclick = () => window.jobsManager?.sendLuckyJobFeedback('no');
  if (commentBtn) commentBtn.onclick = () => { modal?.classList.remove('hidden'); textArea?.focus(); };
  if (closeModal) closeModal.onclick = () => modal?.classList.add('hidden');
  if (sendBtn) sendBtn.onclick = () => {
    const val = textArea?.value?.trim() || '';
    if (val.length < 3) { alert('Пожалуйста, напишите чуть подробнее.'); return; }
    window.jobsManager?.sendLuckyJobFeedback('comment', val);
  };
});

// 🟢 Настройки рекомендаций: загрузка и сохранение
window.addEventListener('DOMContentLoaded', () => {
  const aiToggle = document.getElementById('toggleAIRecs');
  const emailToggle = document.getElementById('toggleEmailRecs');
  const statusEl = document.getElementById('recSettingsStatus');
  // Проверяем наличие пользователя и Firestore
  if (!window.authManager?.currentUser || !window.jobsManager?.db) return;
  const uid = window.authManager.currentUser.uid;
  const db = window.jobsManager.db;
  // Загрузка настроек
  db.collection('user_profiles').doc(uid).get().then(doc => {
    const d = doc.data()||{};
    aiToggle.checked = d.aiRecommendations !== false; // по умолчанию true
    emailToggle.checked = d.emailConsent !== false; // по умолчанию true
  });
  // Сохранение настроек
  function saveSettings() {
    statusEl.textContent = 'Сохраняем...';
    db.collection('user_profiles').doc(uid).update({
      aiRecommendations: aiToggle.checked,
      emailConsent: emailToggle.checked
    }).then(() => {
      statusEl.textContent = 'Настройки сохранены.';
      setTimeout(()=>statusEl.textContent='', 2000);
    }).catch(()=>{
      statusEl.textContent = 'Ошибка сохранения.';
    });
  }
  aiToggle.onchange = saveSettings;
  emailToggle.onchange = saveSettings;
});

// 🟢 Push-уведомления: регистрация и сохранение
window.addEventListener('DOMContentLoaded', () => {
  const pushToggle = document.getElementById('togglePushRecs');
  const statusEl = document.getElementById('recSettingsStatus');
  if (!pushToggle) return;
  // Проверяем наличие пользователя и Firestore
  if (!window.authManager?.currentUser || !window.jobsManager?.db) return;
  const uid = window.authManager.currentUser.uid;
  const db = window.jobsManager.db;
  // Загрузка статуса push
  db.collection('user_profiles').doc(uid).get().then(doc => {
    const d = doc.data()||{};
    pushToggle.checked = !!d.pushEnabled;
  });
  // Сохранение push-настройки
  pushToggle.onchange = async function() {
    if (pushToggle.checked) {
      // Проверка поддержки
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        statusEl.textContent = 'Push-уведомления не поддерживаются в вашем браузере.';
        pushToggle.checked = false;
        return;
      }
      statusEl.textContent = 'Запрашиваем разрешение на push...';
      try {
        // Регистрация Service Worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') throw new Error('Нет разрешения');
        // Подписка на push
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: '<YOUR_VAPID_PUBLIC_KEY>' // TODO: заменить на реальный ключ
        });
        // Сохраняем токен в Firestore
        await db.collection('user_profiles').doc(uid).update({
          pushEnabled: true,
          pushSubscription: JSON.parse(JSON.stringify(sub))
        });
        statusEl.textContent = 'Push-уведомления включены.';
      } catch (e) {
        statusEl.textContent = 'Не удалось включить push: ' + (e.message||e);
        pushToggle.checked = false;
      }
    } else {
      // Отключение push
      await db.collection('user_profiles').doc(uid).update({
        pushEnabled: false,
        pushSubscription: null
      });
      statusEl.textContent = 'Push-уведомления отключены.';
    }
    setTimeout(()=>statusEl.textContent='', 3000);
  };
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobsManager;
} 