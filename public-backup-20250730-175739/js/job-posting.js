// 💼 Модуль управления размещением вакансий WorkInCZ
// Поддержка двойной модели: прямые вакансии + staffing requests

class JobPostingManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Ждем инициализации AuthManager
    if (window.authManager) {
      // Ждем инициализации AuthManager
    if (window.authManager && !window.authManager.isInitialized) {
      let attempts = 0;
      const maxAttempts = 30;
      while (!window.authManager?.isInitialized && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }
      this.db = window.authManager.db;
      this.auth = window.authManager.auth;
      
      console.log('🔥 JobPostingManager подключен к AuthManager');
      
      // Подписываемся на изменения аутентификации
      this.unsubscribeAuth = window.authManager.subscribe(async (user) => {
        this.currentUser = user;
        if (user) {
          console.log('🔐 Пользователь вошел в систему:', user.email);
          this.setupJobPostingForm();
        }
      });
    } else {
      console.log('🔧 AuthManager не найден, используем прямую инициализацию Firebase');
      if (typeof firebase !== 'undefined') {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        this.auth.onAuthStateChanged(async (user) => {
          this.currentUser = user;
          if (user) {
            console.log('🔐 Пользователь вошел в систему:', user.email);
            this.setupJobPostingForm();
          }
        });
      }
    }
  }

  setupJobPostingForm() {
    // Создаем форму размещения вакансий если её нет
    if (!document.getElementById('jobPostingForm')) {
      this.createJobPostingForm();
    }
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  createJobPostingForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'jobPostingForm';
    formContainer.className = 'bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto';
    formContainer.innerHTML = `
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Разместить вакансию</h2>
        
        <!-- Выбор типа вакансии -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Тип размещения *</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="job-type-option border-2 border-primary rounded-lg p-4 cursor-pointer hover:border-primary transition-colors bg-primary/5" data-type="direct">
              <input type="radio" name="job_type" value="direct" class="sr-only" checked>
              <div class="text-center">
                <i class="ri-user-line text-3xl text-primary mb-2"></i>
                <h3 class="font-medium">Прямая вакансия</h3>
                <p class="text-sm text-gray-500 mt-1">Напрямую к соискателям</p>
              </div>
            </label>
            <label class="job-type-option border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors" data-type="staffing_request">
              <input type="radio" name="job_type" value="staffing_request" class="sr-only">
              <div class="text-center">
                <i class="ri-team-line text-3xl text-primary mb-2"></i>
                <h3 class="font-medium">Заявка на персонал</h3>
                <p class="text-sm text-gray-500 mt-1">Через агентства</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Основные поля -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Название позиции *</label>
            <input type="text" name="title" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание *</label>
            <textarea name="description" rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Локация *</label>
            <select name="location" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
              <option value="">Выберите город</option>
              <option value="Praha">Прага</option>
              <option value="Brno">Брно</option>
              <option value="Ostrava">Острава</option>
              <option value="Plzen">Пльзень</option>
              <option value="Liberec">Либерец</option>
              <option value="other">Другой город</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Зарплата (CZK/месяц)</label>
            <input type="number" name="salary" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="25000">
          </div>
        </div>

        <!-- Поля для staffing requests -->
        <div id="staffingFields" class="hidden">
          <div class="border-t pt-4 mb-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Детали заявки на персонал</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Минимальный бюджет (Kč)</label>
                <input type="number" name="budget_min" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="20000">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Максимальный бюджет (Kč)</label>
                <input type="number" name="budget_max" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="50000">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Дедлайн</label>
                <input type="date" name="deadline" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Количество кандидатов</label>
                <select name="candidates_count" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="1">1 кандидат</option>
                  <option value="3">3 кандидата</option>
                  <option value="5">5 кандидатов</option>
                  <option value="10">10 кандидатов</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительные поля для прямых вакансий -->
        <div id="directFields">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Тип занятости</label>
              <select name="employment_type" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="full-time">Полная занятость</option>
                <option value="part-time">Частичная занятость</option>
                <option value="contract">Контракт</option>
                <option value="freelance">Фриланс</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
              <select name="experience" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="no-experience">Без опыта</option>
                <option value="1-year">До 1 года</option>
                <option value="1-3-years">1-3 года</option>
                <option value="3-5-years">3-5 лет</option>
                <option value="5-plus">Более 5 лет</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button type="button" id="cancelJobPosting" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Отмена
          </button>
          <button type="submit" id="submitJobPosting" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Разместить вакансию
          </button>
        </div>
      </div>
    `;

    // Добавляем форму на страницу
    const mainContainer = document.querySelector('main') || document.body;
    mainContainer.appendChild(formContainer);
  }

  setupEventListeners() {
    // Обработчик переключения типа вакансии
    document.querySelectorAll('input[name="job_type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleJobTypeChange(e.target.value);
      });
    });

    // Обработчик клика по опциям типа
    document.querySelectorAll('.job-type-option').forEach(option => {
      option.addEventListener('click', () => {
        const radio = option.querySelector('input[type="radio"]');
        radio.checked = true;
        this.handleJobTypeChange(radio.value);
      });
    });

    // Обработчик отправки формы
    const form = document.getElementById('jobPostingForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit(e);
      });
    }

    // Обработчик отмены
    const cancelBtn = document.getElementById('cancelJobPosting');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideJobPostingForm();
      });
    }
  }

  handleJobTypeChange(jobType) {
    console.log('🔄 Переключение типа вакансии:', jobType);
    
    // Обновляем визуальное выделение
    document.querySelectorAll('.job-type-option').forEach(option => {
      option.classList.remove('border-primary', 'bg-primary/5');
      option.classList.add('border-gray-300');
    });
    
    const selectedOption = document.querySelector(`[data-type="${jobType}"]`);
    if (selectedOption) {
      selectedOption.classList.remove('border-gray-300');
      selectedOption.classList.add('border-primary', 'bg-primary/5');
    }

    // Показываем/скрываем поля
    const staffingFields = document.getElementById('staffingFields');
    const directFields = document.getElementById('directFields');
    
    if (jobType === 'staffing_request') {
      staffingFields.classList.remove('hidden');
      directFields.classList.add('hidden');
    } else {
      staffingFields.classList.add('hidden');
      directFields.classList.remove('hidden');
    }
  }

  async handleSubmit(event) {
    console.log('🚀 Отправка формы вакансии...');
    
    if (!this.currentUser) {
      alert('Необходимо войти в систему');
      return;
    }

    const formData = new FormData(event.target);
    const jobType = formData.get('job_type');
    
    // Показываем индикатор загрузки
    const submitBtn = document.getElementById('submitJobPosting');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Размещаем...';

    try {
      if (jobType === 'direct') {
        await this.createDirectJob(formData);
      } else {
        await this.createStaffingRequest(formData);
      }
      
      this.showSuccess('Вакансия успешно размещена!');
      this.hideJobPostingForm();
      
    } catch (error) {
      console.error('Ошибка при размещении вакансии:', error);
      this.showError('Ошибка при размещении вакансии: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async createDirectJob(formData) {
    console.log('📝 Создание прямой вакансии...');
    
    const jobData = {
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      salary: parseInt(formData.get('salary')) || null,
      employment_type: formData.get('employment_type'),
      experience: formData.get('experience'),
      
      // Метаданные
      job_type: 'direct',
      employer_id: this.currentUser.uid,
      status: 'active',
      is_featured: false,
      bids_count: 0,
      
      // Временные метки
      created_at: new Date(),
      updated_at: new Date()
    };

    const docRef = await this.db.collection('jobs').add(jobData);
    console.log('✅ Прямая вакансия создана:', docRef.id);
    
    // 🔥 Sentry: отслеживаем создание вакансии
    if (typeof Sentry !== 'undefined') {
      Sentry.captureMessage('Direct job created', {
        level: 'info',
        tags: {
          job_id: docRef.id,
          employer_id: this.currentUser.uid,
          job_type: 'direct'
        }
      });
    }
  }

  async createStaffingRequest(formData) {
    console.log('📝 Создание заявки на персонал...');
    
    const requestData = {
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      
      // Бюджет и условия
      budget_range: {
        min: parseInt(formData.get('budget_min')) || null,
        max: parseInt(formData.get('budget_max')) || null
      },
      deadline: formData.get('deadline') ? new Date(formData.get('deadline')) : null,
      candidates_count: parseInt(formData.get('candidates_count')) || 3,
      
      // Метаданные
      job_type: 'staffing_request',
      client_id: this.currentUser.uid,
      status: 'open',
      bids_count: 0,
      agencies_count: 0,
      
      // Временные метки
      created_at: new Date(),
      updated_at: new Date()
    };

    const docRef = await this.db.collection('jobs').add(requestData);
    console.log('✅ Заявка на персонал создана:', docRef.id);
    
    // 🔥 Sentry: отслеживаем создание заявки
    if (typeof Sentry !== 'undefined') {
      Sentry.captureMessage('Staffing request created', {
        level: 'info',
        tags: {
          job_id: docRef.id,
          client_id: this.currentUser.uid,
          job_type: 'staffing_request'
        }
      });
    }
  }

  showJobPostingForm() {
    const form = document.getElementById('jobPostingForm');
    if (form) {
      form.style.display = 'block';
    } else {
      this.createJobPostingForm();
      this.setupEventListeners();
    }
  }

  hideJobPostingForm() {
    const form = document.getElementById('jobPostingForm');
    if (form) {
      form.style.display = 'none';
    }
  }

  showSuccess(message) {
    // Показываем уведомление об успехе
    if (window.userProfileManager && window.userProfileManager.showToast) {
      window.userProfileManager.showToast(message, 'success');
    } else {
      alert(message);
    }
  }

  showError(message) {
    // Показываем уведомление об ошибке
    if (window.userProfileManager && window.userProfileManager.showToast) {
      window.userProfileManager.showToast(message, 'error');
    } else {
      alert(message);
    }
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