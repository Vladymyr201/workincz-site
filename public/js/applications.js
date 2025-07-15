// 📝 Модуль управления откликами WorkInCZ
class ApplicationsManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.applicationsCache = new Map();
    this.limits = {
      basic: {
        applicationsPerMonth: 5,
        autoApply: false,
        priority: false
      },
      vip: {
        applicationsPerMonth: Infinity,
        autoApply: true,
        priority: true
      },
      premium: {
        applicationsPerMonth: Infinity,
        autoApply: true,
        priority: true
      }
    };
    
    this.init();
  }

  async init() {
    // Подключаемся к AuthManager
    if (window.authManager) {
      await window.authManager.waitForReady();
      this.db = window.authManager.db;
      this.auth = window.authManager.auth;
      
      console.log('🔥 ApplicationsManager подключен к AuthManager');
      
      // Подписываемся на изменения аутентификации через AuthManager
      this.unsubscribeAuth = window.authManager.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          // Используем кешированные данные из AuthManager
          this.currentUser.userData = window.authManager.getUserData(user.uid);
          this.loadUserApplications();
          this.setupAutoApply();
        }
      });
    }
    
    this.setupEventListeners();
    this.createApplicationModal();
  }

  setupEventListeners() {
    // Переопределяем существующие кнопки откликов
    document.addEventListener('click', async (e) => {
      if (e.target.matches('.apply-btn, .apply-btn *')) {
        e.preventDefault();
        const btn = e.target.closest('.apply-btn');
        const jobId = btn.dataset.jobId;
        
        if (jobId) {
          await this.initiateApplication(jobId);
        }
      }

      if (e.target.matches('#quick-apply-btn')) {
        await this.submitQuickApplication();
      }

      if (e.target.matches('#detailed-apply-btn')) {
        await this.submitDetailedApplication();
      }

      if (e.target.matches('#enable-auto-apply')) {
        await this.enableAutoApply();
      }
    });

    // Обработчики фильтров автооткликов
    document.addEventListener('change', (e) => {
      if (e.target.matches('.auto-apply-filter')) {
        this.updateAutoApplyFilters();
      }
    });
  }

  createApplicationModal() {
    const modal = document.createElement('div');
    modal.id = 'applicationModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Отклик на вакансию</h2>
            <button id="close-application-modal" class="text-gray-400 hover:text-gray-600">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>

          <!-- Информация о вакансии -->
          <div id="job-info" class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 id="job-title" class="font-semibold text-lg mb-2"></h3>
            <p id="job-company" class="text-gray-600 mb-2"></p>
            <div class="flex items-center text-sm text-gray-500">
              <i class="ri-map-pin-line mr-1"></i>
              <span id="job-location"></span>
              <span class="mx-2">•</span>
              <i class="ri-money-czech-koruna-circle-line mr-1"></i>
              <span id="job-salary"></span>
            </div>
          </div>

          <!-- Проверка лимитов -->
          <div id="application-limits" class="mb-6">
            <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 class="font-medium text-blue-900">Статус подписки</h4>
                <p id="subscription-status" class="text-sm text-blue-700"></p>
              </div>
              <div class="text-right">
                <div id="applications-left" class="font-bold text-blue-900"></div>
                <div class="text-xs text-blue-600">откликов осталось</div>
              </div>
            </div>
          </div>

          <!-- Быстрый отклик -->
          <div id="quick-apply-section" class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium">Быстрый отклик</h3>
              <span class="text-sm text-gray-500">За 1 клик</span>
            </div>
            <p class="text-gray-600 mb-4">Отправить резюме из профиля без дополнительных сообщений</p>
            <button id="quick-apply-btn" class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
              <i class="ri-send-plane-line"></i>
              Отправить быстрый отклик
            </button>
          </div>

          <!-- Подробный отклик -->
          <div id="detailed-apply-section">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium">Подробный отклик</h3>
              <span class="text-sm text-gray-500">Рекомендуется</span>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Сопроводительное письмо</label>
                <textarea id="cover-letter" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Расскажите, почему вы подходите для этой позиции..."></textarea>
                <div class="text-xs text-gray-500 mt-1">Рекомендуется: 150-300 символов</div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Дополнительные файлы</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i class="ri-upload-2-line text-3xl text-gray-400 mb-2"></i>
                  <p class="text-gray-500 mb-2">Загрузите резюме, портфолио или сертификаты</p>
                  <input type="file" id="application-files" multiple accept=".pdf,.doc,.docx,.jpg,.png" class="hidden">
                  <button type="button" onclick="document.getElementById('application-files').click()" class="text-primary hover:underline">
                    Выбрать файлы
                  </button>
                </div>
                <div id="uploaded-files" class="mt-2 space-y-1"></div>
              </div>

              <div class="flex items-center">
                <input type="checkbox" id="notify-response" class="mr-2" checked>
                <label for="notify-response" class="text-sm text-gray-700">Уведомить об ответе работодателя</label>
              </div>

              <button id="detailed-apply-btn" class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                <i class="ri-send-plane-line"></i>
                Отправить подробный отклик
              </button>
            </div>
          </div>

          <!-- VIP функции -->
          <div id="vip-features" class="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20 hidden">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-primary">
                <i class="ri-vip-crown-line mr-2"></i>
                VIP возможности
              </h3>
              <span class="text-xs bg-primary text-white px-2 py-1 rounded-full">ЭКСКЛЮЗИВ</span>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center">
                <input type="checkbox" id="priority-application" class="mr-2">
                <label for="priority-application" class="text-sm">Приоритетный отклик (показать первым)</label>
              </div>
              
              <div class="flex items-center">
                <input type="checkbox" id="auto-follow-up" class="mr-2">
                <label for="auto-follow-up" class="text-sm">Автоматическое напоминание через 3 дня</label>
              </div>
              
              <div class="flex items-center">
                <input type="checkbox" id="read-receipt" class="mr-2">
                <label for="read-receipt" class="text-sm">Уведомление о прочтении</label>
              </div>
            </div>

            <div class="mt-4 p-3 bg-white rounded border">
              <h4 class="font-medium mb-2">Автоотклик настроен</h4>
              <p class="text-sm text-gray-600 mb-2">Система автоматически откликается на подходящие вакансии</p>
              <button id="configure-auto-apply" class="text-primary hover:underline text-sm">
                Настроить критерии автооткликов
              </button>
            </div>
          </div>

          <!-- Upgrade предложение -->
          <div id="upgrade-offer" class="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/30">
            <div class="text-center">
              <i class="ri-vip-crown-line text-3xl text-primary mb-2"></i>
              <h3 class="font-bold text-lg mb-2">Превышен лимит откликов</h3>
              <p class="text-gray-600 mb-4">Получите VIP подписку и откликайтесь без ограничений</p>
              <button id="upgrade-to-vip" class="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90">
                Получить VIP за 1 Kč
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Обработчики для модального окна
    document.getElementById('close-application-modal').onclick = () => {
      this.closeApplicationModal();
    };

    // Обработчик загрузки файлов
    document.getElementById('application-files').onchange = (e) => {
      this.handleFileUpload(e.target.files);
    };
  }

  async initiateApplication(jobId) {
    try {
      if (!this.currentUser) {
        this.showLoginRequired();
        return;
      }

      // Загружаем информацию о вакансии
      const job = await this.loadJobDetails(jobId);
      if (!job) {
        this.showError('Вакансия не найдена');
        return;
      }

      // Проверяем, не откликался ли уже пользователь
      const existingApplication = await this.checkExistingApplication(jobId);
      if (existingApplication) {
        this.showError('Вы уже откликались на эту вакансию');
        return;
      }

      // Загружаем данные пользователя и проверяем лимиты
      await this.loadUserData();
      const limits = await this.checkApplicationLimits();

      // Показываем модальное окно
      this.showApplicationModal(job, limits);

    } catch (error) {
      console.error('Ошибка инициации отклика:', error);
      this.showError('Не удалось начать процесс отклика');
    }
  }

  async loadJobDetails(jobId) {
    try {
      const jobDoc = await this.db.collection('jobs').doc(jobId).get();
      if (jobDoc.exists) {
        return { id: jobDoc.id, ...jobDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Ошибка загрузки вакансии:', error);
      return null;
    }
  }

  async checkExistingApplication(jobId) {
    try {
      // Оптимизированный запрос - проверяем только отклики конкретного пользователя
      const applications = await this.db.collection('applications')
        .where('applicantId', '==', this.currentUser.uid)
        .where('jobId', '==', jobId)
        .limit(1)
        .get();
      
      return !applications.empty;
    } catch (error) {
      console.error('Ошибка проверки существующих откликов:', error);
      // Fallback на менее эффективный запрос если индекс не создан
      try {
        const applications = await this.db.collection('applications')
          .where('applicantId', '==', this.currentUser.uid)
          .get();
        
        let hasExisting = false;
        applications.forEach(doc => {
          const app = doc.data();
          if (app.jobId === jobId) {
            hasExisting = true;
          }
        });
        
        return hasExisting;
      } catch (fallbackError) {
        console.error('Fallback запрос также не удался:', fallbackError);
        return false;
      }
    }
  }

  async loadUserData() {
    // Используем кешированные данные из AuthManager
    if (!this.currentUser.userData) {
      this.currentUser.userData = window.authManager.getUserData(this.currentUser.uid);
      
      // Если данных нет в кеше, загружаем через AuthManager
      if (!this.currentUser.userData) {
        this.currentUser.userData = await window.authManager.loadUserData(this.currentUser.uid);
      }
    }
  }

  async checkApplicationLimits() {
    const userData = this.currentUser.userData;
    const subscription = userData?.subscription || { type: 'basic' };
    const stats = userData?.stats || { applicationsThisMonth: 0, applicationsLimit: 5 };
    
    const subscriptionLimits = this.limits[subscription.type] || this.limits.basic;
    const remaining = subscriptionLimits.applicationsPerMonth === Infinity 
      ? Infinity 
      : Math.max(0, stats.applicationsLimit - stats.applicationsThisMonth);

    return {
      subscription: subscription.type,
      applicationsUsed: stats.applicationsThisMonth,
      applicationsLimit: stats.applicationsLimit,
      remaining,
      canApply: remaining > 0,
      hasVipFeatures: ['vip', 'premium'].includes(subscription.type)
    };
  }

  showApplicationModal(job, limits) {
    const modal = document.getElementById('applicationModal');
    
    // Заполняем информацию о вакансии
    document.getElementById('job-title').textContent = job.title;
    document.getElementById('job-company').textContent = job.companyName;
    document.getElementById('job-location').textContent = job.location?.city || 'Не указано';
    document.getElementById('job-salary').textContent = this.formatSalary(job.salary);

    // Обновляем информацию о лимитах
    document.getElementById('subscription-status').textContent = 
      `Подписка: ${this.getSubscriptionDisplayName(limits.subscription)}`;
    
    if (limits.remaining === Infinity) {
      document.getElementById('applications-left').textContent = '∞';
    } else {
      document.getElementById('applications-left').textContent = limits.remaining;
    }

    // Показываем/скрываем VIP функции
    const vipFeatures = document.getElementById('vip-features');
    if (limits.hasVipFeatures) {
      vipFeatures.classList.remove('hidden');
    } else {
      vipFeatures.classList.add('hidden');
    }

    // Показываем/скрываем предложение upgrade
    const upgradeOffer = document.getElementById('upgrade-offer');
    if (!limits.canApply) {
      upgradeOffer.classList.remove('hidden');
      document.getElementById('quick-apply-section').style.opacity = '0.5';
      document.getElementById('detailed-apply-section').style.opacity = '0.5';
    } else {
      upgradeOffer.classList.add('hidden');
    }

    // Сохраняем данные для отправки
    this.currentApplication = {
      jobId: job.id,
      job,
      limits
    };

    modal.classList.remove('hidden');
  }

  closeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    modal.classList.add('hidden');
    this.currentApplication = null;
    
    // Очищаем форму
    document.getElementById('cover-letter').value = '';
    document.getElementById('uploaded-files').innerHTML = '';
  }

  async submitQuickApplication() {
    if (!this.currentApplication?.limits.canApply) {
      this.showUpgradeRequired();
      return;
    }

    try {
      const applicationData = {
        jobId: this.currentApplication.jobId,
        applicantId: this.currentUser.uid,
        employerId: this.currentApplication.job.employerId,
        status: 'pending',
        type: 'quick',
        coverLetter: '',
        attachments: [],
        priority: this.currentApplication.limits.hasVipFeatures && 
                 document.getElementById('priority-application')?.checked,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'manual'
      };

      await this.db.collection('applications').add(applicationData);
      await this.updateApplicationStats();

      this.showSuccess('Быстрый отклик отправлен!');
      this.closeApplicationModal();

    } catch (error) {
      console.error('Ошибка быстрого отклика:', error);
      this.showError('Не удалось отправить отклик');
    }
  }

  async submitDetailedApplication() {
    if (!this.currentApplication?.limits.canApply) {
      this.showUpgradeRequired();
      return;
    }

    try {
      const coverLetter = document.getElementById('cover-letter').value;
      
      if (!coverLetter.trim()) {
        this.showError('Добавьте сопроводительное письмо');
        return;
      }

      // Загружаем файлы (заглушка - в реальном проекте нужен Firebase Storage)
      const attachments = []; // TODO: Implement file upload

      const applicationData = {
        jobId: this.currentApplication.jobId,
        applicantId: this.currentUser.uid,
        employerId: this.currentApplication.job.employerId,
        status: 'pending',
        type: 'detailed',
        coverLetter,
        attachments,
        priority: this.currentApplication.limits.hasVipFeatures && 
                 document.getElementById('priority-application')?.checked,
        autoFollowUp: this.currentApplication.limits.hasVipFeatures && 
                     document.getElementById('auto-follow-up')?.checked,
        readReceipt: this.currentApplication.limits.hasVipFeatures && 
                    document.getElementById('read-receipt')?.checked,
        notifications: {
          response: document.getElementById('notify-response').checked
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'manual'
      };

      await this.db.collection('applications').add(applicationData);
      await this.updateApplicationStats();

      this.showSuccess('Подробный отклик отправлен!');
      this.closeApplicationModal();

    } catch (error) {
      console.error('Ошибка подробного отклика:', error);
      this.showError('Не удалось отправить отклик');
    }
  }

  async updateApplicationStats() {
    const userRef = this.db.collection('users').doc(this.currentUser.uid);
    await userRef.update({
      'stats.applicationsThisMonth': firebase.firestore.FieldValue.increment(1),
      'stats.lastApplicationDate': firebase.firestore.FieldValue.serverTimestamp()
    });

    // Обновляем локальные данные
    if (this.currentUser.userData.stats) {
      this.currentUser.userData.stats.applicationsThisMonth++;
    }
  }

  handleFileUpload(files) {
    const container = document.getElementById('uploaded-files');
    container.innerHTML = '';

    Array.from(files).forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
      fileItem.innerHTML = `
        <div class="flex items-center">
          <i class="ri-file-line text-gray-500 mr-2"></i>
          <span class="text-sm">${file.name}</span>
          <span class="text-xs text-gray-500 ml-2">(${this.formatFileSize(file.size)})</span>
        </div>
        <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">
          <i class="ri-close-line"></i>
        </button>
      `;
      container.appendChild(fileItem);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async setupAutoApply() {
    // Настройка автооткликов для VIP пользователей
    if (!this.currentUser?.userData) return;
    
    const subscription = this.currentUser.userData.subscription;
    if (!['vip', 'premium'].includes(subscription?.type)) return;

    // Проверяем настройки автооткликов каждые 30 минут
    setInterval(() => {
      this.processAutoApplications();
    }, 30 * 60 * 1000);
  }

  async processAutoApplications() {
    try {
      // Загружаем настройки автооткликов пользователя
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      const userData = userDoc.data();
      
      if (!userData?.autoApplySettings?.enabled) return;

      const settings = userData.autoApplySettings;
      
      // Упрощенный запрос без сложных where условий
      const jobs = await this.db.collection('jobs')
        .limit(100)
        .get();
      
      for (const jobDoc of jobs.docs) {
        const job = { id: jobDoc.id, ...jobDoc.data() };
        
        // Базовая фильтрация на клиенте
        if (job.status !== 'active') continue;
        
        // Проверяем дату создания (за последние 24 часа)
        const createdAt = job.createdAt?.toDate() || new Date(0);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (createdAt < oneDayAgo) continue;
        
        // Проверяем категории
        if (settings.categories?.length && !settings.categories.includes(job.category)) {
          continue;
        }
        
        // Проверяем, подходит ли вакансия
        if (await this.matchesAutoApplyCriteria(job, settings)) {
          await this.submitAutoApplication(job);
        }
      }

    } catch (error) {
      console.error('Ошибка автооткликов:', error);
    }
  }

  async matchesAutoApplyCriteria(job, settings) {
    // Проверяем критерии автооткликов
    
    // Проверяем зарплату
    if (settings.minSalary && job.salary?.min < settings.minSalary) {
      return false;
    }

    // Проверяем локацию
    if (settings.locations?.length && !settings.locations.includes(job.location?.city)) {
      return false;
    }

    // Проверяем, что еще не откликались
    const existingApplication = await this.checkExistingApplication(job.id);
    if (existingApplication) {
      return false;
    }

    return true;
  }

  async submitAutoApplication(job) {
    try {
      const applicationData = {
        jobId: job.id,
        applicantId: this.currentUser.uid,
        employerId: job.employerId,
        status: 'pending',
        type: 'auto',
        coverLetter: this.currentUser.userData.autoApplySettings?.coverLetter || '',
        attachments: [],
        priority: true, // Автоотклики всегда приоритетные
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'auto'
      };

      await this.db.collection('applications').add(applicationData);
      await this.updateApplicationStats();

      console.log('Автоотклик отправлен на вакансию:', job.title);

    } catch (error) {
      console.error('Ошибка автоотклика:', error);
    }
  }

  async loadUserApplications() {
    try {
      // Упрощенный запрос без where + orderBy
      const applications = await this.db.collection('applications')
        .limit(50)
        .get();

      this.applicationsCache.clear();
      // Фильтруем и сортируем на клиенте
      const userApplications = [];
      applications.forEach(doc => {
        const app = { id: doc.id, ...doc.data() };
        if (app.applicantId === this.currentUser.uid) {
          userApplications.push(app);
        }
      });

      // Сортируем по дате создания (новые первыми)
      userApplications.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      userApplications.forEach(app => {
        this.applicationsCache.set(app.id, app);
      });

    } catch (error) {
      console.error('Ошибка загрузки откликов:', error);
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

  getSubscriptionDisplayName(type) {
    const names = {
      basic: 'Базовая (бесплатно)',
      vip: 'VIP (399 Kč/месяц)', 
      premium: 'Премиум (1999 Kč/месяц)'
    };
    return names[type] || 'Неизвестно';
  }

  showLoginRequired() {
    const modal = document.getElementById('authModal') || document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  showUpgradeRequired() {
    // Показываем предложение обновления подписки
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    toast.innerHTML = `
      <div class="flex items-start">
        <i class="ri-vip-crown-line text-2xl mr-3 mt-1"></i>
        <div>
          <h4 class="font-bold mb-1">Нужна VIP подписка</h4>
          <p class="text-sm mb-3">Превышен лимит бесплатных откликов</p>
          <button onclick="window.location.href='#subscription'" class="bg-white text-primary px-4 py-1 rounded text-sm font-medium hover:bg-gray-100">
            Получить VIP за 1 Kč
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
  }

  showSuccess(message) {
    window.showToast(message, 'success');
  }

  showError(message) {
    window.showToast(message, 'error');
  }

  // --- Унифицированный toast ---
  // Используйте window.showToast(message, type) вместо собственной реализации
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.applicationsManager = new ApplicationsManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApplicationsManager;
} 