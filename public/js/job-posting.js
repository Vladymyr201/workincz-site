// 💼 Модуль размещения вакансий для работодателей WorkInCZ
class JobPostingManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.jobData = {};
    this.step = 1;
    this.maxSteps = 4;
    this.pricing = {
      basic: {
        jobsPerMonth: 1,
        featured: false,
        urgent: false,
        analytics: false
      },
      premium: {
        jobsPerMonth: 5,
        freelanceOrders: 10,
        featured: true,
        urgent: true,
        analytics: true,
        topPlacement: true
      },
      addons: {
        urgent: 500, // CZK
        featured: 300, // CZK
        topPlacement: 200 // CZK/week
      }
    };
    
    this.init();
  }

  async init() {
    // Инициализация Firebase
    if (typeof firebase !== 'undefined') {
      this.db = firebase.firestore();
      this.auth = firebase.auth();
      
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.loadEmployerData();
        }
      });
    }
    
    this.setupEventListeners();
    this.createJobPostingModal();
  }

  setupEventListeners() {
    // Кнопка "Разместить вакансию"
    document.addEventListener('click', (e) => {
      if (e.target.matches('#post-job-btn, .post-job-btn')) {
        e.preventDefault();
        this.showJobPostingModal();
      }

      if (e.target.matches('#next-job-step')) {
        this.nextStep();
      }

      if (e.target.matches('#prev-job-step')) {
        this.prevStep();
      }

      if (e.target.matches('#publish-job-btn')) {
        this.publishJob();
      }

      if (e.target.matches('#preview-job-btn')) {
        this.previewJob();
      }
    });

    // Обработчики для дополнительных услуг
    document.addEventListener('change', (e) => {
      if (e.target.matches('.addon-checkbox')) {
        this.updatePricing();
      }
    });
  }

  createJobPostingModal() {
    const modal = document.createElement('div');
    modal.id = 'jobPostingModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Заголовок и прогресс -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Разместить вакансию</h2>
            <button id="close-job-modal" class="text-gray-400 hover:text-gray-600">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>

          <!-- Прогресс-бар -->
          <div class="mb-8">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Шаг <span id="current-job-step">1</span> из ${this.maxSteps}</span>
              <span class="text-sm text-gray-500">Создание вакансии</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div id="job-progress-bar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 25%"></div>
            </div>
          </div>

          <!-- Шаг 1: Основная информация -->
          <div id="job-step-1" class="job-step">
            <h3 class="text-xl font-semibold mb-6">Основная информация о вакансии</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название вакансии *</label>
                <input type="text" id="job-title" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                       placeholder="Например: Разнорабочий на стройку" required>
                <div class="text-xs text-gray-500 mt-1">Четкое и понятное название привлекает больше откликов</div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                  <select id="job-category" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                    <option value="">Выберите категорию</option>
                    <option value="construction">Строительство и ремонт</option>
                    <option value="warehouse">Складские работы</option>
                    <option value="cleaning">Клининг и уборка</option>
                    <option value="transport">Транспорт и логистика</option>
                    <option value="it">IT и технологии</option>
                    <option value="healthcare">Медицина</option>
                    <option value="education">Образование</option>
                    <option value="hospitality">Туризм и гостеприимство</option>
                    <option value="manufacturing">Производство</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Тип занятости *</label>
                  <select id="job-work-type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                    <option value="full-time">Полная занятость</option>
                    <option value="part-time">Частичная занятость</option>
                    <option value="contract">Контракт</option>
                    <option value="freelance">Фриланс</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Описание вакансии *</label>
                <textarea id="job-description" rows="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                          placeholder="Опишите обязанности, требования, условия работы..." required></textarea>
                <div class="text-xs text-gray-500 mt-1">Подробное описание поможет найти подходящих кандидатов</div>
              </div>
            </div>
          </div>

          <!-- Шаг 2: Локация и условия -->
          <div id="job-step-2" class="job-step hidden">
            <h3 class="text-xl font-semibold mb-6">Локация и условия работы</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Город *</label>
                  <select id="job-city" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                    <option value="Praha">Прага</option>
                    <option value="Brno">Брно</option>
                    <option value="Ostrava">Острава</option>
                    <option value="Plzen">Пльзень</option>
                    <option value="Liberec">Либерец</option>
                    <option value="České Budějovice">Ческе-Будеёвице</option>
                    <option value="Hradec Králové">Градец-Кралове</option>
                    <option value="Ústí nad Labem">Усти-над-Лабем</option>
                    <option value="Pardubice">Пардубице</option>
                    <option value="other">Другой город</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Адрес (необязательно)</label>
                  <input type="text" id="job-address" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                         placeholder="Улица, дом">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Зарплата от (CZK)</label>
                  <input type="number" id="salary-min" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                         placeholder="25000">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Зарплата до (CZK)</label>
                  <input type="number" id="salary-max" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                         placeholder="45000">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Период</label>
                  <select id="salary-period" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="month">В месяц</option>
                    <option value="hour">В час</option>
                  </select>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="font-medium text-gray-700">Дополнительные условия</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label class="flex items-center">
                    <input type="checkbox" id="housing-provided" class="mr-2">
                    <span class="text-sm">Предоставляется жильё</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="transport-provided" class="mr-2">
                    <span class="text-sm">Предоставляется транспорт</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="work-permit-help" class="mr-2">
                    <span class="text-sm">Помощь с оформлением документов</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="remote-work" class="mr-2">
                    <span class="text-sm">Возможна удаленная работа</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Шаг 3: Требования -->
          <div id="job-step-3" class="job-step hidden">
            <h3 class="text-xl font-semibold mb-6">Требования к кандидатам</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
                  <select id="required-experience" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="no-experience">Без опыта</option>
                    <option value="1-year">До 1 года</option>
                    <option value="1-3-years">1-3 года</option>
                    <option value="3-5-years">3-5 лет</option>
                    <option value="5-plus">Более 5 лет</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Образование</label>
                  <select id="required-education" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="any">Любое</option>
                    <option value="basic">Основное</option>
                    <option value="secondary">Среднее</option>
                    <option value="vocational">Среднее специальное</option>
                    <option value="higher">Высшее</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Навыки и умения</label>
                <textarea id="required-skills" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                          placeholder="Например: Опыт работы с инструментами, внимательность, ответственность..."></textarea>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 mb-3">Знание языков</h4>
                <div id="language-requirements" class="space-y-2">
                  <div class="language-req grid grid-cols-3 gap-3">
                    <select class="language-name border border-gray-300 rounded-lg px-3 py-2">
                      <option value="cz">Чешский</option>
                      <option value="en">Английский</option>
                      <option value="de">Немецкий</option>
                      <option value="ru">Русский</option>
                      <option value="sk">Словацкий</option>
                    </select>
                    <select class="language-level border border-gray-300 rounded-lg px-3 py-2">
                      <option value="basic">Базовый</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                      <option value="native">Родной</option>
                    </select>
                    <label class="flex items-center">
                      <input type="checkbox" class="language-required mr-2">
                      <span class="text-sm">Обязательно</span>
                    </label>
                  </div>
                </div>
                <button type="button" id="add-language-req" class="text-primary hover:underline text-sm mt-2">+ Добавить язык</button>
              </div>

              <div>
                <label class="flex items-center">
                  <input type="checkbox" id="work-permit-required" class="mr-2">
                  <span class="text-sm">Требуется разрешение на работу в ЧР</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Шаг 4: Публикация и дополнительные услуги -->
          <div id="job-step-4" class="job-step hidden">
            <h3 class="text-xl font-semibold mb-6">Публикация вакансии</h3>
            
            <!-- Информация о тарифе -->
            <div id="subscription-info" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-medium">Ваша подписка</h4>
                  <p id="current-subscription" class="text-sm text-gray-600"></p>
                </div>
                <div class="text-right">
                  <div id="jobs-remaining" class="font-bold text-primary"></div>
                  <div class="text-xs text-gray-500">вакансий осталось</div>
                </div>
              </div>
            </div>

            <!-- Дополнительные услуги -->
            <div class="space-y-4">
              <h4 class="font-medium text-gray-700">Дополнительные услуги</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="checkbox" class="addon-checkbox mr-3" id="urgent-posting" data-price="500">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="font-medium">Срочная вакансия</span>
                      <span class="text-primary font-bold">+500 Kč</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Отметка "Срочно" и приоритет в поиске</p>
                  </div>
                </label>

                <label class="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="checkbox" class="addon-checkbox mr-3" id="featured-posting" data-price="300">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="font-medium">Продвижение вакансии</span>
                      <span class="text-primary font-bold">+300 Kč</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Показ в топе результатов поиска</p>
                  </div>
                </label>

                <label class="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="checkbox" class="addon-checkbox mr-3" id="top-placement" data-price="200">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="font-medium">TOP размещение</span>
                      <span class="text-primary font-bold">+200 Kč/неделя</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Закрепление в топе на главной странице</p>
                  </div>
                </label>

                <div class="border border-gray-300 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium">HR-ассистент</span>
                    <span class="text-primary font-bold">1200 Kč</span>
                  </div>
                  <p class="text-sm text-gray-600 mb-3">Персональная помощь в подборе кандидатов</p>
                  <button class="text-primary hover:underline text-sm">Подробнее</button>
                </div>
              </div>

              <!-- Итоговая стоимость -->
              <div class="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">Базовая публикация:</span>
                  <span id="base-price">Бесплатно</span>
                </div>
                <div id="addons-list" class="space-y-1 text-sm"></div>
                <div class="border-t border-primary/20 mt-3 pt-3 flex justify-between items-center">
                  <span class="font-bold text-lg">Итого:</span>
                  <span id="total-price" class="font-bold text-lg text-primary">0 Kč</span>
                </div>
              </div>

              <!-- Срок действия -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Срок действия вакансии</label>
                <select id="job-duration" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="30">30 дней (стандартно)</option>
                  <option value="60">60 дней (+100 Kč)</option>
                  <option value="90">90 дней (+200 Kč)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Навигация -->
          <div class="flex justify-between mt-8 pt-6 border-t">
            <button id="prev-job-step" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hidden">
              Назад
            </button>
            <div class="flex gap-3 ml-auto">
              <button id="preview-job-btn" class="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 hidden">
                Предварительный просмотр
              </button>
              <button id="close-job-modal" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Отмена
              </button>
              <button id="next-job-step" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Далее
              </button>
              <button id="publish-job-btn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 hidden">
                Опубликовать вакансию
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Обработчики для модального окна
    document.getElementById('close-job-modal').onclick = () => {
      this.closeJobModal();
    };

    // Добавление языковых требований
    document.getElementById('add-language-req').onclick = () => {
      this.addLanguageRequirement();
    };
  }

  showJobPostingModal() {
    if (!this.currentUser) {
      this.showLoginRequired();
      return;
    }

    if (this.currentUser.userData?.role !== 'employer') {
      this.showError('Размещение вакансий доступно только работодателям');
      return;
    }

    const modal = document.getElementById('jobPostingModal');
    modal.classList.remove('hidden');
    this.step = 1;
    this.updateJobStep();
    this.loadEmployerSubscription();
  }

  closeJobModal() {
    const modal = document.getElementById('jobPostingModal');
    modal.classList.add('hidden');
    this.step = 1;
    this.jobData = {};
    
    // Очищаем форму
    modal.querySelectorAll('input, textarea, select').forEach(field => {
      if (field.type === 'checkbox') {
        field.checked = false;
      } else {
        field.value = '';
      }
    });
  }

  nextStep() {
    if (this.validateCurrentJobStep()) {
      this.collectJobStepData();
      
      if (this.step < this.maxSteps) {
        this.step++;
        this.updateJobStep();
        this.updateJobProgressBar();
      }
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.updateJobStep();
      this.updateJobProgressBar();
    }
  }

  updateJobStep() {
    // Скрываем все шаги
    document.querySelectorAll('.job-step').forEach(step => {
      step.classList.add('hidden');
    });

    // Показываем текущий шаг
    document.getElementById(`job-step-${this.step}`).classList.remove('hidden');

    // Обновляем кнопки навигации
    const prevBtn = document.getElementById('prev-job-step');
    const nextBtn = document.getElementById('next-job-step');
    const publishBtn = document.getElementById('publish-job-btn');
    const previewBtn = document.getElementById('preview-job-btn');

    prevBtn.classList.toggle('hidden', this.step === 1);
    nextBtn.classList.toggle('hidden', this.step === this.maxSteps);
    publishBtn.classList.toggle('hidden', this.step !== this.maxSteps);
    previewBtn.classList.toggle('hidden', this.step !== this.maxSteps);

    // Обновляем номер шага
    document.getElementById('current-job-step').textContent = this.step;
  }

  updateJobProgressBar() {
    const progress = (this.step / this.maxSteps) * 100;
    document.getElementById('job-progress-bar').style.width = `${progress}%`;
  }

  validateCurrentJobStep() {
    const currentStepEl = document.getElementById(`job-step-${this.step}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
      if (!field.value.trim()) {
        this.showError(`Поле "${field.previousElementSibling?.textContent?.replace('*', '') || 'обязательное'}" не может быть пустым`);
        field.focus();
        return false;
      }
    }

    return true;
  }

  collectJobStepData() {
    if (this.step === 1) {
      this.jobData.basic = {
        title: document.getElementById('job-title').value,
        category: document.getElementById('job-category').value,
        workType: document.getElementById('job-work-type').value,
        description: document.getElementById('job-description').value
      };
    } else if (this.step === 2) {
      const salaryMin = parseInt(document.getElementById('salary-min').value) || null;
      const salaryMax = parseInt(document.getElementById('salary-max').value) || null;
      
      this.jobData.location = {
        city: document.getElementById('job-city').value,
        address: document.getElementById('job-address').value,
        remote: document.getElementById('remote-work').checked
      };

      this.jobData.salary = {
        min: salaryMin,
        max: salaryMax,
        currency: 'CZK',
        period: document.getElementById('salary-period').value,
        negotiable: !salaryMin && !salaryMax
      };

      this.jobData.benefits = {
        housingProvided: document.getElementById('housing-provided').checked,
        transportProvided: document.getElementById('transport-provided').checked,
        workPermitHelp: document.getElementById('work-permit-help').checked
      };
    } else if (this.step === 3) {
      const languages = Array.from(document.querySelectorAll('.language-req')).map(req => ({
        name: req.querySelector('.language-name').value,
        level: req.querySelector('.language-level').value,
        required: req.querySelector('.language-required').checked
      }));

      this.jobData.requirements = {
        experience: document.getElementById('required-experience').value,
        education: document.getElementById('required-education').value,
        skills: document.getElementById('required-skills').value,
        languages,
        workPermit: document.getElementById('work-permit-required').checked
      };
    }
  }

  async loadEmployerSubscription() {
    if (!this.currentUser?.userData) return;

    const subscription = this.currentUser.userData.subscription || { type: 'basic' };
    const employerProfile = this.currentUser.userData.employerProfile || {};

    // Обновляем информацию о подписке
    document.getElementById('current-subscription').textContent = 
      this.getSubscriptionDisplayName(subscription.type);

    // Подсчитываем оставшиеся вакансии
    const jobsThisMonth = await this.getJobsThisMonth();
    const limits = this.pricing[subscription.type] || this.pricing.basic;
    const remaining = Math.max(0, limits.jobsPerMonth - jobsThisMonth);

    document.getElementById('jobs-remaining').textContent = 
      limits.jobsPerMonth === Infinity ? '∞' : remaining;

    // Обновляем базовую стоимость
    if (remaining > 0 || limits.jobsPerMonth === Infinity) {
      document.getElementById('base-price').textContent = 'Бесплатно';
    } else {
      document.getElementById('base-price').textContent = '299 Kč (лимит превышен)';
    }

    this.updatePricing();
  }

  async getJobsThisMonth() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const jobs = await this.db.collection('jobs')
        .where('employerId', '==', this.currentUser.uid)
        .where('createdAt', '>=', startOfMonth)
        .get();

      return jobs.size;
    } catch (error) {
      console.error('Ошибка подсчета вакансий:', error);
      return 0;
    }
  }

  updatePricing() {
    const addons = document.querySelectorAll('.addon-checkbox:checked');
    const addonsList = document.getElementById('addons-list');
    let totalPrice = 0;

    // Очищаем список дополнений
    addonsList.innerHTML = '';

    // Проверяем превышение лимита
    const basePrice = document.getElementById('base-price').textContent;
    if (basePrice.includes('299')) {
      totalPrice += 299;
    }

    // Добавляем стоимость дополнений
    addons.forEach(addon => {
      const price = parseInt(addon.dataset.price);
      const name = addon.parentElement.querySelector('.font-medium').textContent;
      
      totalPrice += price;
      
      const addonItem = document.createElement('div');
      addonItem.className = 'flex justify-between';
      addonItem.innerHTML = `
        <span>${name}:</span>
        <span>+${price} Kč</span>
      `;
      addonsList.appendChild(addonItem);
    });

    document.getElementById('total-price').textContent = `${totalPrice} Kč`;
  }

  addLanguageRequirement() {
    const container = document.getElementById('language-requirements');
    const langReq = document.createElement('div');
    langReq.className = 'language-req grid grid-cols-3 gap-3';
    langReq.innerHTML = `
      <select class="language-name border border-gray-300 rounded-lg px-3 py-2">
        <option value="cz">Чешский</option>
        <option value="en">Английский</option>
        <option value="de">Немецкий</option>
        <option value="ru">Русский</option>
        <option value="sk">Словацкий</option>
      </select>
      <select class="language-level border border-gray-300 rounded-lg px-3 py-2">
        <option value="basic">Базовый</option>
        <option value="intermediate">Средний</option>
        <option value="advanced">Продвинутый</option>
        <option value="native">Родной</option>
      </select>
      <label class="flex items-center">
        <input type="checkbox" class="language-required mr-2">
        <span class="text-sm">Обязательно</span>
      </label>
    `;
    container.appendChild(langReq);
  }

  async publishJob() {
    if (!this.validateCurrentJobStep()) return;
    
    this.collectJobStepData();

    try {
      // Собираем все данные вакансии
      const jobData = {
        // Основная информация
        title: this.jobData.basic.title,
        description: this.jobData.basic.description,
        category: this.jobData.basic.category,
        subcategory: this.getSubcategory(this.jobData.basic.category),
        workType: this.jobData.basic.workType,

        // Работодатель
        employerId: this.currentUser.uid,
        companyName: this.currentUser.userData.employerProfile?.companyName || 'Компания',

        // Локация
        location: this.jobData.location,

        // Зарплата
        salary: this.jobData.salary,

        // Требования
        requirements: this.jobData.requirements,

        // Дополнительные условия
        housingProvided: this.jobData.benefits?.housingProvided || false,
        transportProvided: this.jobData.benefits?.transportProvided || false,
        workPermitHelp: this.jobData.benefits?.workPermitHelp || false,

        // Статус и видимость
        status: 'active',
        visibility: 'public', // 70% public, 30% vip_only (настраивается позже)
        
        // Дополнительные услуги
        urgent: document.getElementById('urgent-posting')?.checked || false,
        featured: document.getElementById('featured-posting')?.checked || false,
        topPlacement: document.getElementById('top-placement')?.checked || false,

        // Статистика
        applications: { count: 0, limit: 50 },
        views: 0,
        clicks: 0,

        // Метаданные
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 дней
      };

      // Создаем вакансию
      const jobRef = await this.db.collection('jobs').add(jobData);

      // Обрабатываем платеж (если нужен)
      const totalPrice = parseInt(document.getElementById('total-price').textContent.replace(/[^\d]/g, ''));
      if (totalPrice > 0) {
        await this.processPayment(jobRef.id, totalPrice);
      }

      this.showSuccess('Вакансия успешно опубликована!');
      this.closeJobModal();

    } catch (error) {
      console.error('Ошибка публикации вакансии:', error);
      this.showError('Не удалось опубликовать вакансию');
    }
  }

  async processPayment(jobId, amount) {
    // Заглушка для обработки платежа
    // В реальном проекте здесь будет интеграция с платежной системой
    const paymentData = {
      userId: this.currentUser.uid,
      type: 'job_posting',
      entityId: jobId,
      amount,
      currency: 'CZK',
      status: 'pending',
      description: `Публикация вакансии: ${this.jobData.basic.title}`,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await this.db.collection('payments').add(paymentData);
  }

  getSubcategory(category) {
    const subcategories = {
      construction: 'general',
      warehouse: 'logistics',
      cleaning: 'services',
      transport: 'logistics',
      it: 'development',
      healthcare: 'medical',
      education: 'teaching',
      hospitality: 'service',
      manufacturing: 'production'
    };
    return subcategories[category] || 'other';
  }

  previewJob() {
    this.collectJobStepData();
    
    // Создаем предварительный просмотр (упрощенная версия)
    const preview = `
      <h3>${this.jobData.basic.title}</h3>
      <p><strong>Компания:</strong> ${this.currentUser.userData.employerProfile?.companyName || 'Ваша компания'}</p>
      <p><strong>Локация:</strong> ${this.jobData.location?.city}</p>
      <p><strong>Тип:</strong> ${this.formatWorkType(this.jobData.basic.workType)}</p>
      <p><strong>Зарплата:</strong> ${this.formatSalary(this.jobData.salary)}</p>
      <p><strong>Описание:</strong> ${this.jobData.basic.description}</p>
    `;

    // Показываем в модальном окне
    alert('Предварительный просмотр:\n\n' + preview.replace(/<[^>]*>/g, ''));
  }

  async loadEmployerData() {
    if (!this.currentUser) return;
    
    try {
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (userDoc.exists) {
        this.currentUser.userData = userDoc.data();
      }
    } catch (error) {
      console.error('Ошибка загрузки данных работодателя:', error);
    }
  }

  formatWorkType(workType) {
    const types = {
      'full-time': 'Полная занятость',
      'part-time': 'Частичная занятость',
      'contract': 'Контракт',
      'freelance': 'Фриланс'
    };
    return types[workType] || workType;
  }

  formatSalary(salary) {
    if (!salary || (!salary.min && !salary.max)) return 'По договоренности';
    
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
      basic: 'Базовая (1 вакансия/месяц)',
      premium: 'Премиум (5 вакансий + 10 фриланс)'
    };
    return names[type] || 'Неизвестно';
  }

  showLoginRequired() {
    const modal = document.getElementById('authModal') || document.getElementById('modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  showSuccess(message) {
    window.showToast(message, 'success');
  }

  showError(message) {
    window.showToast(message, 'error');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.jobPostingManager = new JobPostingManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobPostingManager;
} 