// 👤 Модуль управления профилями пользователей WorkInCZ
class UserProfileManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.registrationStep = 1;
    this.maxSteps = 3;
    this.userData = {
      basic: {},
      profile: {},
      preferences: {}
    };
    
    this.init();
  }

  async init() {
    // Ждем инициализации AuthManager с fallback
    if (window.authManager) {
      await window.authManager.waitForReady();
      this.db = window.authManager.db;
      this.auth = window.authManager.auth;
      
      console.log('🔥 UserProfileManager подключен к AuthManager');
      
      // Подписываемся на изменения аутентификации через AuthManager
      this.unsubscribeAuth = window.authManager.subscribe(async (user) => {
        this.currentUser = user;
        if (user) {
          console.log('🔐 Пользователь вошел в систему:', user.email);
          // Проверяем, заполнен ли профиль пользователя
          await this.checkUserProfileCompleteness(user);
        } else {
          // Очищаем сохраненные данные при выходе
          this.clearSavedUserData();
        }
      });
    } else {
      // Fallback на прямую инициализацию Firebase
      console.log('🔧 AuthManager не найден, используем прямую инициализацию Firebase');
      if (typeof firebase !== 'undefined') {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        console.log('🔥 Firebase инициализирован напрямую в UserProfileManager');
        
        // Слушаем изменения аутентификации напрямую
        this.auth.onAuthStateChanged(async (user) => {
          this.currentUser = user;
          if (user) {
            console.log('🔐 Пользователь вошел в систему:', user.email);
            // Проверяем, заполнен ли профиль пользователя
            await this.checkUserProfileCompleteness(user);
          } else {
            // Очищаем сохраненные данные при выходе
            this.clearSavedUserData();
          }
        });
      } else {
        console.log('🔧 Firebase не доступен в UserProfileManager');
      }
    }
    
    // Проверяем сохраненные данные пользователя
    this.checkSavedUserData();
    
    this.setupEventListeners();
    this.createExtendedRegistrationModal();
  }

  setupEventListeners() {
    // НЕ переопределяем форму входа - она должна работать как есть
    // Форма входа уже имеет правильную логику в index.html

    // Обработчики для расширенной регистрации
    document.addEventListener('click', (e) => {
      if (e.target.matches('#next-step-btn')) {
        this.nextRegistrationStep();
      }
      
      if (e.target.matches('#prev-step-btn')) {
        this.prevRegistrationStep();
      }
      
      if (e.target.matches('#complete-registration-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.completeRegistration();
      }
    });
  }

  createExtendedRegistrationModal() {
    const modal = document.createElement('div');
    modal.id = 'extendedRegistrationModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center hidden z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <!-- Заголовок и кнопка закрытия -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Заполните профиль</h2>
            <button id="close-modal-header" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>

          <!-- Прогресс-бар -->
          <div class="mb-8">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Шаг <span id="current-step">1</span> из ${this.maxSteps}</span>
              <span class="text-sm text-gray-500">Создание аккаунта</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div id="progress-bar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 33.33%"></div>
            </div>
          </div>

          <!-- Шаг 1: Основная информация -->
          <div id="step-1" class="registration-step">
            <h2 class="text-2xl font-bold mb-6 text-center">Основная информация</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                <input type="text" id="firstName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
                <input type="text" id="lastName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" id="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                <input type="tel" id="phone" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="+420" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
                <div class="relative">
                  <input type="password" id="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                  <button type="button" id="toggle-registration-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                    <i class="ri-eye-off-line" id="registration-password-icon"></i>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Язык интерфейса</label>
                <select id="language" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="ru">Русский</option>
                  <option value="cz">Čeština</option>
                  <option value="ua">Українська</option>
                  <option value="by">Беларуская</option>
                  <option value="vn">Tiếng Việt</option>
                  <option value="pl">Polski</option>
                  <option value="sk">Slovenčina</option>
                  <option value="ro">Română</option>
                  <option value="bg">Български</option>
                </select>
              </div>
            </div>
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Тип аккаунта *</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="role-option border-2 border-primary rounded-lg p-4 cursor-pointer hover:border-primary transition-colors bg-primary/5" data-role="worker">
                  <input type="radio" name="role" value="worker" class="sr-only" checked>
                  <div class="text-center">
                    <i class="ri-user-line text-3xl text-primary mb-2"></i>
                    <h3 class="font-medium">Я ищу работу</h3>
                    <p class="text-sm text-gray-500 mt-1">Соискатель, фрилансер</p>
                  </div>
                </label>
                <label class="role-option border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors" data-role="employer">
                  <input type="radio" name="role" value="employer" class="sr-only">
                  <div class="text-center">
                    <i class="ri-building-line text-3xl text-primary mb-2"></i>
                    <h3 class="font-medium">Я ищу сотрудников</h3>
                    <p class="text-sm text-gray-500 mt-1">Работодатель, HR</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Шаг 2: Профессиональная информация -->
          <div id="step-2" class="registration-step hidden">
            <!-- Для соискателей -->
            <div id="worker-profile" class="worker-profile">
              <h2 class="text-2xl font-bold mb-6 text-center">Ваш профессиональный профиль</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Специализация *</label>
                  <select id="specialization" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" required>
                    <option value="">Выберите специализацию</option>
                    <option value="construction">Строительство и ремонт</option>
                    <option value="warehouse">Складские работы</option>
                    <option value="cleaning">Клининг и уборка</option>
                    <option value="transport">Транспорт и логистика</option>
                    <option value="it">IT и технологии</option>
                    <option value="healthcare">Медицина и здравоохранение</option>
                    <option value="education">Образование</option>
                    <option value="hospitality">Туризм и гостеприимство</option>
                    <option value="manufacturing">Производство</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
                  <select id="experience" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="no-experience">Без опыта</option>
                    <option value="1-year">До 1 года</option>
                    <option value="1-3-years">1-3 года</option>
                    <option value="3-5-years">3-5 лет</option>
                    <option value="5-plus">Более 5 лет</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Город поиска</label>
                  <select id="location" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="Praha">Прага</option>
                    <option value="Brno">Брно</option>
                    <option value="Ostrava">Острава</option>
                    <option value="Plzen">Пльзень</option>
                    <option value="Liberec">Либерец</option>
                    <option value="other">Другой город</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Желаемая зарплата (CZK/месяц)</label>
                  <input type="number" id="salaryMin" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="25000">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Максимальная зарплата</label>
                  <input type="number" id="salaryMax" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="45000">
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Тип занятости</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <label class="flex items-center">
                    <input type="checkbox" value="full-time" class="work-type-checkbox mr-2">
                    <span class="text-sm">Полная</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" value="part-time" class="work-type-checkbox mr-2">
                    <span class="text-sm">Частичная</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" value="contract" class="work-type-checkbox mr-2">
                    <span class="text-sm">Договор</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" value="freelance" class="work-type-checkbox mr-2">
                    <span class="text-sm">Фриланс</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Для работодателей -->
            <div id="employer-profile" class="employer-profile hidden">
              <h2 class="text-2xl font-bold mb-6 text-center">Информация о компании</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Название компании *</label>
                  <input type="text" id="companyName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">IČO (чешский номер)</label>
                  <input type="text" id="ico" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="12345678">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Отрасль</label>
                  <select id="industry" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="construction">Строительство</option>
                    <option value="manufacturing">Производство</option>
                    <option value="it">IT и технологии</option>
                    <option value="retail">Торговля</option>
                    <option value="logistics">Логистика</option>
                    <option value="healthcare">Медицина</option>
                    <option value="education">Образование</option>
                    <option value="hospitality">Гостеприимство</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Размер компании</label>
                  <select id="companySize" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="1-10">1-10 сотрудников</option>
                    <option value="11-50">11-50 сотрудников</option>
                    <option value="51-200">51-200 сотрудников</option>
                    <option value="201-1000">201-1000 сотрудников</option>
                    <option value="1000+">Более 1000 сотрудников</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Веб-сайт</label>
                  <input type="url" id="website" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://example.com">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Описание компании</label>
                  <textarea id="companyDescription" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Расскажите о вашей компании..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Шаг 3: Языки и предпочтения -->
          <div id="step-3" class="registration-step hidden">
            <h2 class="text-2xl font-bold mb-6 text-center">Языки и предпочтения</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-4">Знание языков</label>
                <div id="languages-container" class="space-y-3">
                  <div class="language-item grid grid-cols-2 gap-3">
                    <select class="language-select border border-gray-300 rounded-lg px-3 py-2">
                      <option value="ru">Русский</option>
                      <option value="cz">Чешский</option>
                      <option value="en">Английский</option>
                      <option value="de">Немецкий</option>
                      <option value="ua">Украинский</option>
                      <option value="sk">Словацкий</option>
                    </select>
                    <select class="language-level border border-gray-300 rounded-lg px-3 py-2">
                      <option value="basic">Базовый</option>
                      <option value="intermediate">Средний</option>
                      <option value="advanced">Продвинутый</option>
                      <option value="native">Родной</option>
                    </select>
                  </div>
                </div>
                <button type="button" id="add-language" class="mt-3 text-primary hover:underline text-sm">+ Добавить язык</button>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Уведомления</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input type="checkbox" id="emailNotifications" class="mr-2" checked>
                    <span class="text-sm">Email уведомления о новых вакансиях</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="smsNotifications" class="mr-2">
                    <span class="text-sm">SMS уведомления (важные)</span>
                  </label>
                  <label class="flex items-center">
                    <input type="checkbox" id="weeklyDigest" class="mr-2" checked>
                    <span class="text-sm">Еженедельная сводка новых вакансий</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="flex items-center">
                  <input type="checkbox" id="agreeTerms" class="mr-2" required>
                  <span class="text-sm">Я согласен с <a href="#" class="text-primary hover:underline">условиями использования</a> и <a href="#" class="text-primary hover:underline">политикой конфиденциальности</a></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Навигация -->
          <div class="flex justify-between mt-8 pt-6 border-t">
            <button id="prev-step-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hidden">
              Назад
            </button>
            <div class="flex gap-3 ml-auto">
              <button id="close-extended-modal" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Отмена
              </button>
              <button id="next-step-btn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Далее
              </button>
              <button id="complete-registration-btn" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 hidden">
                Завершить регистрацию
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Обработчики для модального окна
    document.getElementById('close-extended-modal').onclick = () => {
      this.closeExtendedRegistration();
    };

    document.getElementById('close-modal-header').onclick = () => {
      this.closeExtendedRegistration();
    };

    // Закрытие по клику вне модального окна
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeExtendedRegistration();
      }
    };

    // Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.closeExtendedRegistration();
      }
    });

    // Обработчик переключения роли
    document.querySelectorAll('input[name="role"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.toggleProfileType(radio.value);
        this.updateRoleSelection(radio.value);
      });
    });

    // Обработчик клика по label роли
    document.querySelectorAll('.role-option').forEach(option => {
      option.addEventListener('click', () => {
        const radio = option.querySelector('input[type="radio"]');
        radio.checked = true;
        this.toggleProfileType(radio.value);
        this.updateRoleSelection(radio.value);
      });
    });

    // Добавление языков
    document.getElementById('add-language').onclick = () => {
      this.addLanguageField();
    };

    // Обработчик кнопки показа/скрытия пароля в расширенной форме
    const toggleRegPassword = document.getElementById('toggle-registration-password');
    const regPasswordField = document.getElementById('password');
    const regPasswordIcon = document.getElementById('registration-password-icon');
    
    if (toggleRegPassword && regPasswordField && regPasswordIcon) {
      toggleRegPassword.addEventListener('click', function() {
        const type = regPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        regPasswordField.setAttribute('type', type);
        
        // Меняем иконку
        if (type === 'text') {
          regPasswordIcon.className = 'ri-eye-line';
        } else {
          regPasswordIcon.className = 'ri-eye-off-line';
        }
      });
    }

    // Обработчики навигации убираем - они уже есть в setupEventListeners()
  }

  showExtendedRegistration() {
    const modal = document.getElementById('extendedRegistrationModal');
    modal.classList.remove('hidden');
    this.registrationStep = 1;
    this.updateStep();
    this.updateProgressBar();
  }

  closeExtendedRegistration() {
    const modal = document.getElementById('extendedRegistrationModal');
    modal.classList.add('hidden');
    this.registrationStep = 1;
    this.userData = { basic: {}, profile: {}, preferences: {} };
  }

  nextRegistrationStep() {
    console.log(`➡️ Переход к следующему шагу с ${this.registrationStep}`);
    
    if (this.validateCurrentStep()) {
      this.collectStepData();
      
      if (this.registrationStep < this.maxSteps) {
        this.registrationStep++;
        console.log(`✅ Новый шаг: ${this.registrationStep}`);
        this.updateStep();
        this.updateProgressBar();
      } else {
        console.log('⚠️ Уже на последнем шаге');
      }
    } else {
      console.log('❌ Валидация не прошла, остаемся на текущем шаге');
    }
  }

  prevRegistrationStep() {
    if (this.registrationStep > 1) {
      this.registrationStep--;
      this.updateStep();
      this.updateProgressBar();
    }
  }

  updateStep() {
    console.log(`🔄 Обновляем шаг: ${this.registrationStep}`);
    
    // Скрываем все шаги
    document.querySelectorAll('.registration-step').forEach(step => {
      step.classList.add('hidden');
    });

    // Показываем текущий шаг
    const currentStep = document.getElementById(`step-${this.registrationStep}`);
    if (currentStep) {
      currentStep.classList.remove('hidden');
      console.log(`✅ Показан шаг: step-${this.registrationStep}`);
    } else {
      console.error(`❌ Шаг step-${this.registrationStep} не найден`);
    }

    // Обновляем кнопки навигации
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const completeBtn = document.getElementById('complete-registration-btn');

    if (prevBtn) prevBtn.classList.toggle('hidden', this.registrationStep === 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', this.registrationStep === this.maxSteps);
    if (completeBtn) completeBtn.classList.toggle('hidden', this.registrationStep !== this.maxSteps);

    // Обновляем номер шага
    const currentStepLabel = document.getElementById('current-step');
    if (currentStepLabel) {
      currentStepLabel.textContent = this.registrationStep;
      console.log(`✅ Номер шага обновлен: ${this.registrationStep}`);
    } else {
      console.error('❌ Элемент current-step не найден');
    }
  }

  updateProgressBar() {
    const progress = (this.registrationStep / this.maxSteps) * 100;
    console.log(`📊 Обновляем прогресс-бар: шаг ${this.registrationStep}/${this.maxSteps} = ${progress}%`);
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      console.log('✅ Прогресс-бар обновлен');
    } else {
      console.error('❌ Элемент progress-bar не найден');
    }
  }

  toggleProfileType(role) {
    const workerProfile = document.getElementById('worker-profile');
    const employerProfile = document.getElementById('employer-profile');

    if (role === 'worker') {
      workerProfile.classList.remove('hidden');
      employerProfile.classList.add('hidden');
    } else {
      workerProfile.classList.add('hidden');
      employerProfile.classList.remove('hidden');
    }
  }

  updateRoleSelection(selectedRole) {
    document.querySelectorAll('.role-option').forEach(option => {
      const role = option.dataset.role;
      if (role === selectedRole) {
        option.classList.remove('border-gray-300');
        option.classList.add('border-primary', 'bg-primary/5');
      } else {
        option.classList.remove('border-primary', 'bg-primary/5');
        option.classList.add('border-gray-300');
      }
    });
  }

  validateCurrentStep() {
    const currentStepEl = document.getElementById(`step-${this.registrationStep}`);
    
    // Для второго шага проверяем поля в зависимости от роли
    if (this.registrationStep === 2) {
      const selectedRole = this.userData.basic?.role || document.querySelector('input[name="role"]:checked')?.value;
      
      if (selectedRole === 'worker') {
        // Для соискателей проверяем только основные поля
        const requiredFields = ['specialization', 'experience', 'location'];
        for (let fieldId of requiredFields) {
          const field = document.getElementById(fieldId);
          if (field && !field.value.trim()) {
            this.showModalError(`Поле "${field.previousElementSibling?.textContent?.replace('*', '') || 'обязательное'}" не может быть пустым`);
            field.focus();
            return false;
          }
        }
      } else if (selectedRole === 'employer') {
        // Для работодателей проверяем поля компании
        const requiredFields = ['companyName', 'industry'];
        for (let fieldId of requiredFields) {
          const field = document.getElementById(fieldId);
          if (field && !field.value.trim()) {
            this.showModalError(`Поле "${field.previousElementSibling?.textContent?.replace('*', '') || 'обязательное'}" не может быть пустым`);
            field.focus();
            return false;
          }
        }
      }
    } else if (this.registrationStep === 3) {
      // Для третьего шага проверяем согласие с условиями
      const agreeTerms = document.getElementById('agreeTerms');
      console.log('🔍 Проверяем согласие с условиями:', agreeTerms?.checked);
      
      if (!agreeTerms || !agreeTerms.checked) {
        this.showModalError('Необходимо согласиться с условиями использования');
        if (agreeTerms) agreeTerms.focus();
        return false;
      }
      
      console.log('✅ Согласие с условиями получено');
    } else {
      // Для остальных шагов используем стандартную валидацию
      const requiredFields = currentStepEl.querySelectorAll('[required]');
      
      for (let field of requiredFields) {
        if (!field.value.trim()) {
          this.showModalError(`Поле "${field.previousElementSibling?.textContent?.replace('*', '') || 'обязательное'}" не может быть пустым`);
          field.focus();
          return false;
        }
      }
    }

    return true;
  }

  collectStepData() {
    if (this.registrationStep === 1) {
      this.userData.basic = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        language: document.getElementById('language').value,
        role: document.querySelector('input[name="role"]:checked').value
      };
    } else if (this.registrationStep === 2) {
      const role = this.userData.basic.role;
      
      if (role === 'worker') {
        const workTypes = Array.from(document.querySelectorAll('.work-type-checkbox:checked')).map(cb => cb.value);
        
        this.userData.profile = {
          specialization: document.getElementById('specialization').value,
          experience: document.getElementById('experience').value,
          location: document.getElementById('location').value,
          salary: {
            min: parseInt(document.getElementById('salaryMin').value) || null,
            max: parseInt(document.getElementById('salaryMax').value) || null,
            currency: 'CZK',
            period: 'month'
          },
          workType: workTypes
        };
      } else {
        this.userData.profile = {
          companyName: document.getElementById('companyName').value,
          ico: document.getElementById('ico').value,
          industry: document.getElementById('industry').value,
          size: document.getElementById('companySize').value,
          website: document.getElementById('website').value,
          description: document.getElementById('companyDescription').value
        };
      }
    } else if (this.registrationStep === 3) {
      const languages = Array.from(document.querySelectorAll('.language-item')).map(item => ({
        name: item.querySelector('.language-select').value,
        level: item.querySelector('.language-level').value
      }));

      this.userData.preferences = {
        languages,
        notifications: {
          email: document.getElementById('emailNotifications').checked,
          sms: document.getElementById('smsNotifications').checked,
          weeklyDigest: document.getElementById('weeklyDigest').checked
        }
      };
    }
  }

  async completeRegistration() {
    console.log('🚀 Начинаем завершение регистрации...');
    
    if (!this.validateCurrentStep()) {
      console.log('❌ Валидация не прошла');
      return;
    }
    
    console.log('✅ Валидация прошла успешно');
    this.collectStepData();
    console.log('📊 Данные собраны:', this.userData);

    // Показываем индикатор загрузки
    const completeBtn = document.getElementById('complete-registration-btn');
    const originalText = completeBtn.textContent;
    completeBtn.disabled = true;
    completeBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Регистрируем...';

    try {
      // Проверяем доступность Firebase
      if (!this.auth || !this.db) {
        throw new Error('Firebase не инициализирован');
      }

      let user;
      
      // Проверяем, есть ли уже аутентифицированный пользователь
      if (this.currentUser) {
        console.log('🔐 Обновляем профиль существующего пользователя:', this.currentUser.uid);
        user = this.currentUser;
      } else {
        console.log('🔐 Создаем нового пользователя в Firebase Auth...');
        // Создаем пользователя в Firebase Auth
        const userCredential = await this.auth.createUserWithEmailAndPassword(
          this.userData.basic.email,
          this.userData.basic.password
        );
        console.log('✅ Пользователь создан в Auth:', userCredential.user.uid);
        user = userCredential.user;
      }

      // Создаем профиль пользователя в Firestore
      const userDoc = {
        email: this.userData.basic.email,
        name: `${this.userData.basic.firstName} ${this.userData.basic.lastName}`,
        role: this.userData.basic.role,
        phone: this.userData.basic.phone,
        language: this.userData.basic.language,
        verified: false,
        
        // Подписка по умолчанию
        subscription: {
          type: 'basic',
          expiresAt: null,
          startedAt: firebase.firestore.FieldValue.serverTimestamp(),
          autoRenew: false
        },

        // Статистика для соискателей
        stats: this.userData.basic.role === 'worker' ? {
          applicationsThisMonth: 0,
          applicationsLimit: 5,
          profileViews: 0,
          lastApplicationDate: null
        } : null,

        // Профили
        workerProfile: this.userData.basic.role === 'worker' ? {
          ...this.userData.profile,
          languages: this.userData.preferences?.languages || [{ name: 'ru', level: 'native' }],
          availability: 'immediately'
        } : null,

        employerProfile: this.userData.basic.role === 'employer' ? {
          ...this.userData.profile,
          verified: false
        } : null,

        // Настройки
        preferences: this.userData.preferences?.notifications || { email: true, sms: false, weeklyDigest: true },

        // Метаданные
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      console.log('💾 Сохраняем профиль в Firestore...');
      await this.db.collection('users').doc(user.uid).set(userDoc);
      console.log('✅ Профиль сохранен в Firestore');

      this.showSuccess('🎉 Регистрация завершена! Добро пожаловать в WorkInCZ!');
      this.closeExtendedRegistration();
      
      // Закрываем основное модальное окно
      const authModal = document.getElementById('modal');
      if (authModal) {
        authModal.classList.add('hidden');
      }

    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      
      // Восстанавливаем кнопку
      completeBtn.disabled = false;
      completeBtn.textContent = originalText;
      
      // Переводим ошибки Firebase на русский
      let errorMessage = 'Не удалось завершить регистрацию';
      
      if (error.message === 'Firebase не инициализирован') {
        errorMessage = 'Ошибка подключения к серверу. Попробуйте обновить страницу.';
      } else if (error.code === 'auth/email-already-in-use') {
        // Восстанавливаем кнопку перед показом специального сообщения
        completeBtn.disabled = false;
        completeBtn.textContent = originalText;
        
        // Показываем специальное сообщение с кнопкой входа
        this.showEmailExistsError();
        return;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Пароль слишком простой. Используйте минимум 6 символов.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Неверный формат email адреса.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Регистрация временно отключена. Обратитесь в поддержку.';
      } else {
        errorMessage = 'Произошла ошибка: ' + error.message;
      }
      
      this.showModalError(errorMessage);
    }
  }

  addLanguageField() {
    const container = document.getElementById('languages-container');
    const languageItem = document.createElement('div');
    languageItem.className = 'language-item grid grid-cols-2 gap-3';
    languageItem.innerHTML = `
      <select class="language-select border border-gray-300 rounded-lg px-3 py-2">
        <option value="ru">Русский</option>
        <option value="cz">Чешский</option>
        <option value="en">Английский</option>
        <option value="de">Немецкий</option>
        <option value="ua">Украинский</option>
        <option value="sk">Словацкий</option>
      </select>
      <select class="language-level border border-gray-300 rounded-lg px-3 py-2">
        <option value="basic">Базовый</option>
        <option value="intermediate">Средний</option>
        <option value="advanced">Продвинутый</option>
        <option value="native">Родной</option>
      </select>
    `;
    container.appendChild(languageItem);
  }

  async checkUserProfileCompleteness(user) {
    if (!this.db) return;

    try {
      const userDoc = await this.db.collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('✅ Профиль найден в базе данных:', userData);
        console.log('🔍 Структура профиля:', {
          role: userData.role,
          workerProfile: userData.workerProfile,
          employerProfile: userData.employerProfile,
          // Проверяем старую структуру
          specialization: userData.specialization,
          experience: userData.experience,
          location: userData.location,
          companyName: userData.companyName
        });
        
        // Всегда устанавливаем данные пользователя и обновляем интерфейс
        console.log('✅ Профиль найден, загружаем данные и открываем личный кабинет');
        // Устанавливаем данные пользователя
        this.currentUser.userData = userData;
        // Обновляем интерфейс
        this.updateUIForLoggedInUser();
        
        // Проверяем полноту профиля для показа уведомления (но не блокируем вход)
        const isProfileComplete = this.isProfileComplete(userData);
        if (!isProfileComplete) {
          console.log('⚠️ Профиль не полностью заполнен, показываем уведомление');
          // Показываем уведомление о необходимости дозаполнить профиль
          setTimeout(() => {
            this.showProfileCompletionNotice();
          }, 1000);
        }
      } else {
        console.log('❌ Профиль не найден в базе данных, создаем базовый профиль');
        // Пользователь есть в Auth, но профиля нет в Firestore
        // Создаем базовый профиль с данными из Auth
        const basicUserData = {
          name: user.displayName || 'Пользователь',
          email: user.email,
          role: 'worker', // По умолчанию соискатель
          createdAt: new Date(),
          uid: user.uid
        };
        
        // Устанавливаем базовые данные
        this.currentUser.userData = basicUserData;
        // Обновляем интерфейс
        this.updateUIForLoggedInUser();
        
        // Показываем уведомление о необходимости заполнить профиль
        setTimeout(() => {
          this.showProfileCompletionNotice();
        }, 1000);
      }
    } catch (error) {
      console.error('Ошибка проверки профиля:', error);
      this.showError('Ошибка загрузки профиля: ' + error.message);
    }
  }

  isProfileComplete(userData) {
    // Проверяем обязательные поля в зависимости от роли
    const requiredFields = ['name', 'email', 'role'];
    
    // Проверяем базовые поля
    for (let field of requiredFields) {
      if (!userData[field]) {
        console.log(`❌ Отсутствует поле: ${field}`);
        return false;
      }
    }

    // Дополнительные проверки в зависимости от роли
    if (userData.role === 'worker') {
      // Проверяем новую структуру (workerProfile)
      const workerProfile = userData.workerProfile;
      if (workerProfile) {
        if (!workerProfile.specialization || !workerProfile.experience || !workerProfile.location) {
          console.log('❌ Не заполнены обязательные поля в workerProfile:', {
            specialization: workerProfile.specialization,
            experience: workerProfile.experience,
            location: workerProfile.location
          });
          return false;
        }
      } else {
        // Проверяем старую структуру (поля в корне объекта)
        if (!userData.specialization || !userData.experience || !userData.location) {
          console.log('❌ Не заполнены обязательные поля для соискателя (старая структура):', {
            specialization: userData.specialization,
            experience: userData.experience,
            location: userData.location
          });
          return false;
        }
        console.log('✅ Найдена старая структура данных для соискателя');
      }
    } else if (userData.role === 'employer') {
      // Проверяем новую структуру (employerProfile)
      const employerProfile = userData.employerProfile;
      if (employerProfile) {
        if (!employerProfile.companyName) {
          console.log('❌ Не заполнено название компании в employerProfile');
          return false;
        }
      } else {
        // Проверяем старую структуру (поля в корне объекта)
        if (!userData.companyName) {
          console.log('❌ Не заполнено название компании (старая структура)');
          return false;
        }
        console.log('✅ Найдена старая структура данных для работодателя');
      }
    }

    console.log('✅ Все обязательные поля заполнены');
    return true;
  }

  prefillExistingData(userData) {
    // Предзаполняем форму имеющимися данными
    setTimeout(() => {
      if (userData.name) {
        const nameField = document.getElementById('firstName');
        if (nameField) nameField.value = userData.name;
      }
      
      if (userData.email) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = userData.email;
      }

      if (userData.role) {
        const roleRadio = document.querySelector(`input[name="userRole"][value="${userData.role}"]`);
        if (roleRadio) {
          roleRadio.checked = true;
          this.updateRoleSelection(userData.role);
        }
      }

      // Предзаполняем данные второго шага в зависимости от роли
      if (userData.role === 'worker') {
        // Проверяем новую структуру (workerProfile)
        const profile = userData.workerProfile;
        if (profile) {
          if (profile.specialization) {
            const specField = document.getElementById('specialization');
            if (specField) specField.value = profile.specialization;
          }

          if (profile.experience) {
            const expField = document.getElementById('experience');
            if (expField) expField.value = profile.experience;
          }

          if (profile.location) {
            const locField = document.getElementById('location');
            if (locField) locField.value = profile.location;
          }
        } else {
          // Предзаполняем из старой структуры
          if (userData.specialization) {
            const specField = document.getElementById('specialization');
            if (specField) specField.value = userData.specialization;
          }

          if (userData.experience) {
            const expField = document.getElementById('experience');
            if (expField) expField.value = userData.experience;
          }

          if (userData.location) {
            const locField = document.getElementById('location');
            if (locField) locField.value = userData.location;
          }
        }
      } else if (userData.role === 'employer') {
        // Проверяем новую структуру (employerProfile)
        const profile = userData.employerProfile;
        if (profile) {
          if (profile.companyName) {
            const companyField = document.getElementById('companyName');
            if (companyField) companyField.value = profile.companyName;
          }

          if (profile.industry) {
            const industryField = document.getElementById('industry');
            if (industryField) industryField.value = profile.industry;
          }

          if (profile.size) {
            const sizeField = document.getElementById('companySize');
            if (sizeField) sizeField.value = profile.size;
          }
        } else {
          // Предзаполняем из старой структуры
          if (userData.companyName) {
            const companyField = document.getElementById('companyName');
            if (companyField) companyField.value = userData.companyName;
          }

          if (userData.industry) {
            const industryField = document.getElementById('industry');
            if (industryField) industryField.value = userData.industry;
          }

          if (userData.size) {
            const sizeField = document.getElementById('companySize');
            if (sizeField) sizeField.value = userData.size;
          }
        }
      }

      console.log('📝 Форма предзаполнена существующими данными');
    }, 500);
  }

  async loadUserProfile() {
    if (!this.currentUser) return;
    
    try {
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (userDoc.exists) {
        this.currentUser.userData = userDoc.data();
        this.updateUIForLoggedInUser();
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  updateUIForLoggedInUser() {
    const userData = this.currentUser?.userData;
    if (!userData) return;

    const firstName = userData?.name?.split(' ')[0] || 'Пользователь';
    
    // Сохраняем данные пользователя в localStorage для быстрого доступа
    localStorage.setItem('workincz_user_name', userData?.name || '');
    localStorage.setItem('workincz_user_email', userData?.email || '');
    localStorage.setItem('workincz_user_role', userData?.role || '');
    
    // Также обновляем информацию о пользователе в баннере
    this.updateUserStatusWidget(userData);
    
    console.log('🔄 Обновляем UI для авторизованного пользователя:', firstName);
    
    // Обновляем кнопки авторизации - ищем по точному тексту
    const loginButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Войти' && !btn.closest('#modal')
    );
    const registerButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.trim() === 'Регистрация' && !btn.closest('#modal')
    );
    
    if (loginButton) {
      console.log('✅ Найдена кнопка "Войти", обновляем...');
      loginButton.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <i class="ri-user-line text-sm"></i>
          </div>
          <span>Профиль</span>
        </div>
      `;
      loginButton.onclick = (e) => {
        e.preventDefault();
        this.showUserMenu(e);
      };
    }
    
    if (registerButton) {
      console.log('✅ Найдена кнопка "Регистрация", обновляем...');
      registerButton.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <i class="ri-user-voice-line text-sm"></i>
          </div>
          <span>Привет, ${firstName}!</span>
        </div>
      `;
      registerButton.classList.remove('bg-primary');
      registerButton.classList.add('bg-green-500', 'hover:bg-green-600');
      registerButton.onclick = (e) => {
        e.preventDefault();
        this.openDashboardPage();
      };
    }

    // Обновляем live статистику
    this.updateUserStatusWidget(userData);
  }

  updateUserStatusWidget(userData) {
    const statusWidget = document.querySelector('.live-users-banner span');
    if (statusWidget && userData) {
      const firstName = userData.name?.split(' ')[0] || 'Пользователь';
      const role = userData.role === 'employer' ? 'работодатель' : 'соискатель';
      
      statusWidget.innerHTML = `
        <i class="ri-user-voice-line text-primary"></i>
        <span class="font-medium">${firstName}</span> (${role}) • 
        <span class="live-users-count font-medium">2,458</span> человек онлайн
        <span class="live-activity-dot ml-2 inline-block w-2 h-2 bg-success rounded-full"></span>
      `;
    }
  }

  checkSavedUserData() {
    // Проверяем есть ли сохраненные данные пользователя
    const savedName = localStorage.getItem('workincz_user_name');
    const savedEmail = localStorage.getItem('workincz_user_email');
    const savedRole = localStorage.getItem('workincz_user_role');
    
    if (savedName && savedEmail && !this.currentUser) {
      // Показываем временную информацию о пользователе
      this.showSavedUserInfo(savedName, savedRole);
      
      // Предзаполняем форму входа если она есть
      setTimeout(() => {
        this.prefillLoginForm(savedEmail, savedName);
      }, 500);
    }
  }

  showSavedUserInfo(name, role) {
    const firstName = name.split(' ')[0];
    const userRole = role === 'employer' ? 'работодатель' : 'соискатель';
    
    // Обновляем live статистику
    const statusWidget = document.querySelector('.live-users-banner span');
    if (statusWidget) {
      statusWidget.innerHTML = `
        <i class="ri-user-voice-line text-primary"></i>
        <span class="font-medium">${firstName}</span> (${userRole}) • 
        <span class="live-users-count font-medium">2,458</span> человек онлайн
        <span class="live-activity-dot ml-2 inline-block w-2 h-2 bg-success rounded-full"></span>
      `;
    }

    // Показываем кнопку "Войти как {имя}"
    const authButtons = document.querySelectorAll('[onclick="openModal()"]');
    authButtons.forEach(btn => {
      if (btn.textContent.includes('Регистрация')) {
        btn.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <i class="ri-user-line text-sm"></i>
            </div>
            <span>Войти как ${firstName}</span>
          </div>
        `;
                 btn.onclick = () => this.showQuickLoginModal(name, localStorage.getItem('workincz_user_email'));
      }
    });
  }

  showQuickLoginModal(name, email) {
    // Создаем быстрый модал входа
    const quickModal = document.createElement('div');
    quickModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    quickModal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <i class="ri-user-line text-2xl text-primary"></i>
          </div>
          <h2 class="text-xl font-bold">Добро пожаловать, ${name.split(' ')[0]}!</h2>
          <p class="text-gray-600 mt-2">Введите пароль для входа в аккаунт</p>
        </div>
        <form id="quick-login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" value="${email}" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" readonly>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <div class="relative">
              <input type="password" id="quick-password" class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Введите пароль" required>
              <button type="button" id="toggle-quick-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                <i class="ri-eye-off-line" id="quick-password-icon"></i>
              </button>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" id="quick-login-cancel" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Войти
            </button>
          </div>
          <div class="text-center pt-2">
            <button type="button" id="forgot-user" class="text-sm text-primary hover:underline">
              Это не мой аккаунт
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(quickModal);

    // Обработчики
    document.getElementById('quick-login-cancel').onclick = () => {
      document.body.removeChild(quickModal);
      window.openModal(); // Открываем обычный модал
    };

    document.getElementById('forgot-user').onclick = () => {
      this.clearSavedUserData();
      document.body.removeChild(quickModal);
      window.openModal();
    };

    document.getElementById('quick-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const password = document.getElementById('quick-password').value;
      
      try {
        await this.auth.signInWithEmailAndPassword(email, password);
        document.body.removeChild(quickModal);
        this.showSuccess(`Добро пожаловать, ${name.split(' ')[0]}!`);
      } catch (error) {
        this.showError('Неверный пароль. Попробуйте еще раз.');
        document.getElementById('quick-password').focus();
      }
    };

    // Обработчик кнопки показа/скрытия пароля в быстром модале
    const toggleQuickPassword = document.getElementById('toggle-quick-password');
    const quickPasswordField = document.getElementById('quick-password');
    const quickPasswordIcon = document.getElementById('quick-password-icon');
    
    if (toggleQuickPassword && quickPasswordField && quickPasswordIcon) {
      toggleQuickPassword.addEventListener('click', function() {
        const type = quickPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        quickPasswordField.setAttribute('type', type);
        
        // Меняем иконку
        if (type === 'text') {
          quickPasswordIcon.className = 'ri-eye-line';
        } else {
          quickPasswordIcon.className = 'ri-eye-off-line';
        }
      });
    }

    // Фокус на поле пароля
    setTimeout(() => {
      document.getElementById('quick-password').focus();
    }, 100);
  }

  prefillLoginForm(email, name) {
    // Предзаполняем обычную форму входа для случаев когда быстрый вход не используется
    const authForm = document.getElementById('authForm');
    if (authForm) {
      const emailInput = authForm.querySelector('input[type="email"]');
      const nameInput = authForm.querySelector('input[type="text"]');
      
      if (emailInput) emailInput.value = email;
      if (nameInput && name) nameInput.value = name;
    }
  }

  clearSavedUserData() {
    localStorage.removeItem('workincz_user_name');
    localStorage.removeItem('workincz_user_email');
    localStorage.removeItem('workincz_user_role');
    
    // Восстанавливаем первоначальный вид кнопок
    this.restoreOriginalButtons();
  }

  restoreOriginalButtons() {
    const authButtons = document.querySelectorAll('[onclick="openModal()"]');
    if (authButtons.length >= 2) {
      // Первая кнопка - Войти
      authButtons[0].textContent = 'Войти';
      authButtons[0].className = 'hidden md:block text-sm font-medium text-gray-700 hover:text-primary';
      authButtons[0].onclick = () => window.openModal();

      // Вторая кнопка - Регистрация
      authButtons[1].textContent = 'Регистрация';
      authButtons[1].className = 'bg-primary text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-primary/90 whitespace-nowrap';
      authButtons[1].onclick = () => window.openModal();
    }

    // Восстанавливаем статистику
    const statusWidget = document.querySelector('.live-users-banner span');
    if (statusWidget) {
      statusWidget.innerHTML = `
        <i class="ri-user-voice-line text-primary"></i>
        <span class="live-users-count font-medium">2,458</span> человек онлайн
        <span class="live-activity-dot ml-2 inline-block w-2 h-2 bg-success rounded-full"></span>
      `;
    }
  }

  showUserMenu(event) {
    // Создаем выпадающее меню пользователя
    const existingMenu = document.getElementById('userDropdownMenu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const userData = this.currentUser?.userData;
    if (!userData) return;

    const menu = document.createElement('div');
    menu.id = 'userDropdownMenu';
    menu.className = 'absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50';
    menu.innerHTML = `
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=4F46E5&color=fff&size=40" alt="Avatar" class="w-full h-full object-cover">
          </div>
          <div>
            <div class="font-semibold text-gray-900">${userData.name || 'Пользователь'}</div>
            <div class="text-sm text-gray-600">${userData.role === 'employer' ? 'Работодатель' : 'Соискатель'}</div>
          </div>
        </div>
      </div>
      <div class="p-2">
        <button onclick="window.location.href='/dashboard.html'" class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
          <i class="ri-dashboard-line text-primary"></i>
          <span>Личный кабинет</span>
        </button>
        <button onclick="window.location.href='/'" class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
          <i class="ri-user-line text-gray-600"></i>
          <span>Мой профиль</span>
        </button>
        <button onclick="window.location.href='/'" class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
          <i class="ri-settings-line text-gray-600"></i>
          <span>Настройки</span>
        </button>
        <div class="border-t border-gray-100 my-2"></div>
        <button onclick="userProfileManager.logout()" class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600">
          <i class="ri-logout-circle-line"></i>
          <span>Выйти</span>
        </button>
      </div>
    `;

    // Находим кнопку профиля и добавляем меню
    const profileButton = event ? event.target.closest('button') : null;
    if (profileButton) {
      profileButton.style.position = 'relative';
      profileButton.appendChild(menu);

      // Закрытие меню при клике вне его
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target) && !profileButton.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 10);
    }
  }

  openDashboardPage() {
    // Перенаправляем на отдельную страницу личного кабинета
    window.location.href = '/dashboard.html';
  }

  createFullDashboardPage() {
    // Проверяем, создана ли уже страница дашборда
    if (document.getElementById('fullDashboardPage')) {
      document.getElementById('fullDashboardPage').classList.remove('hidden');
      return;
    }

    const userData = this.currentUser?.userData;
    if (!userData) return;

    const isEmployer = userData.role === 'employer';
    const firstName = userData.name?.split(' ')[0] || 'Пользователь';

    // Скрываем основной контент страницы
    const mainContent = document.querySelector('main') || document.body;
    mainContent.style.display = 'none';

    const dashboardPage = document.createElement('div');
    dashboardPage.id = 'fullDashboardPage';
    dashboardPage.className = 'min-h-screen bg-gray-50';
    dashboardPage.innerHTML = `
      <!-- Шапка личного кабинета -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
              <button id="backToMain" class="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <i class="ri-arrow-left-line"></i>
                <span>Назад на главную</span>
              </button>
              <div class="h-6 w-px bg-gray-300"></div>
              <h1 class="text-2xl font-bold text-gray-900">Личный кабинет</h1>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=4F46E5&color=fff&size=40" alt="Avatar" class="w-full h-full object-cover">
                </div>
                <div>
                  <div class="font-semibold text-gray-900">${firstName}</div>
                  <div class="text-sm text-gray-600">${isEmployer ? 'Работодатель' : 'Соискатель'}</div>
                </div>
              </div>
              <button id="dashboardLogout" class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                <i class="ri-logout-circle-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Основной контент -->
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Боковая навигация -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <nav class="space-y-2">
                <button class="dashboard-nav-btn active w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="overview">
                  <i class="ri-dashboard-line text-primary"></i>
                  <span>Обзор</span>
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="profile">
                  <i class="ri-user-line"></i>
                  <span>${isEmployer ? 'Профиль компании' : 'Мой профиль'}</span>
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="${isEmployer ? 'jobs' : 'applications'}">
                  <i class="${isEmployer ? 'ri-briefcase-line' : 'ri-send-plane-line'}"></i>
                  <span>${isEmployer ? 'Мои вакансии' : 'Мои отклики'}</span>
                  <span class="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">3</span>
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="${isEmployer ? 'candidates' : 'saved'}">
                  <i class="${isEmployer ? 'ri-team-line' : 'ri-bookmark-line'}"></i>
                  <span>${isEmployer ? 'Кандидаты' : 'Сохраненные'}</span>
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="analytics">
                  <i class="ri-bar-chart-line"></i>
                  <span>Аналитика</span>
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="subscription">
                  <i class="ri-vip-crown-line"></i>
                  <span>Подписка</span>
                  ${userData.subscription?.type === 'basic' ? '<span class="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Базовый</span>' : ''}
                </button>
                <button class="dashboard-nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors" data-section="settings">
                  <i class="ri-settings-line"></i>
                  <span>Настройки</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Основной контент -->
          <div class="lg:col-span-3">
            <div id="dashboardMainContent">
              <!-- Контент будет загружаться динамически -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dashboardPage);

    // Обработчики событий
    this.setupFullDashboardEventListeners();
    
    // Загружаем первый раздел
    this.loadFullDashboardSection('overview');
  }

  setupFullDashboardEventListeners() {
    // Навигация по разделам
    document.querySelectorAll('.dashboard-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        this.loadFullDashboardSection(section);
        
        // Обновляем активный элемент
        document.querySelectorAll('.dashboard-nav-btn').forEach(nav => nav.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Возврат на главную
    document.getElementById('backToMain').onclick = () => {
      this.closeFullDashboard();
    };

    // Выход из аккаунта
    document.getElementById('dashboardLogout').onclick = () => {
      this.logout();
    };
  }

  closeFullDashboard() {
    const dashboardPage = document.getElementById('fullDashboardPage');
    if (dashboardPage) {
      dashboardPage.remove();
    }
    
    // Показываем основной контент страницы
    const mainContent = document.querySelector('main') || document.body;
    mainContent.style.display = '';
  }

  loadFullDashboardSection(section) {
    const content = document.getElementById('dashboardMainContent');
    if (!content) return;

    const userData = this.currentUser?.userData;
    const isEmployer = userData?.role === 'employer';

    switch (section) {
      case 'overview':
        this.loadOverviewSection(content, isEmployer);
        break;
      case 'profile':
        this.loadProfileSection(content, isEmployer);
        break;
      case 'applications':
        this.loadApplicationsSection(content);
        break;
      case 'jobs':
        this.loadJobsSection(content);
        break;
      case 'saved':
        this.loadSavedSection(content);
        break;
      case 'candidates':
        this.loadCandidatesSection(content);
        break;
      case 'analytics':
        this.loadAnalyticsSection(content, isEmployer);
        break;
      case 'subscription':
        this.loadSubscriptionSection(content);
        break;
      case 'settings':
        this.loadSettingsSection(content);
        break;
      default:
        content.innerHTML = '<p class="text-gray-500">Раздел в разработке</p>';
    }
  }

  loadOverviewSection(content, isEmployer) {
    const userData = this.currentUser?.userData;
    const firstName = userData?.name?.split(' ')[0] || 'Пользователь';
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Приветствие -->
        <div class="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">Добро пожаловать, ${firstName}!</h2>
              <p class="text-primary-100">Сегодня отличный день для поиска новых возможностей</p>
            </div>
            <div class="hidden md:block">
              <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <i class="ri-user-smile-line text-4xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <i class="ri-send-plane-line text-xl text-blue-600"></i>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">5</div>
                <div class="text-sm text-gray-600">${isEmployer ? 'Активных вакансий' : 'Откликов отправлено'}</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <i class="ri-eye-line text-xl text-green-600"></i>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">127</div>
                <div class="text-sm text-gray-600">${isEmployer ? 'Просмотров вакансий' : 'Просмотров профиля'}</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <i class="ri-bookmark-line text-xl text-yellow-600"></i>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">12</div>
                <div class="text-sm text-gray-600">${isEmployer ? 'Избранных кандидатов' : 'Сохраненных вакансий'}</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <i class="ri-star-line text-xl text-purple-600"></i>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">${userData.subscription?.type === 'vip' ? 'VIP' : userData.subscription?.type === 'premium' ? 'Премиум' : 'Базовый'}</div>
                <div class="text-sm text-gray-600">Ваш статус</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Быстрые действия -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Быстрые действия</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${isEmployer ? `
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-add-line text-primary"></i>
                <span>Разместить вакансию</span>
              </button>
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-search-line text-primary"></i>
                <span>Найти кандидатов</span>
              </button>
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-bar-chart-line text-primary"></i>
                <span>Посмотреть аналитику</span>
              </button>
            ` : `
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-search-line text-primary"></i>
                <span>Найти работу</span>
              </button>
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-user-line text-primary"></i>
                <span>Редактировать профиль</span>
              </button>
              <button class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="ri-vip-crown-line text-primary"></i>
                <span>Обновить до VIP</span>
              </button>
            `}
          </div>
        </div>

        <!-- Последняя активность -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h3 class="text-lg font-semibold mb-4">Последняя активность</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <i class="ri-check-line text-green-600"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium">Профиль обновлен</div>
                <div class="text-sm text-gray-600">2 часа назад</div>
              </div>
            </div>
            
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="ri-send-plane-line text-blue-600"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium">${isEmployer ? 'Новый отклик получен' : 'Отклик отправлен'}</div>
                <div class="text-sm text-gray-600">Вчера в 15:30</div>
              </div>
            </div>
            
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <i class="ri-star-line text-yellow-600"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium">${isEmployer ? 'Кандидат добавлен в избранное' : 'Вакансия сохранена'}</div>
                <div class="text-sm text-gray-600">3 дня назад</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.clearSavedUserData();
      this.closeDashboard();
      this.showSuccess('Вы успешно вышли из аккаунта');
      
      // Перезагружаем страницу для обновления UI
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      this.showError('Ошибка при выходе: ' + error.message);
    }
  }

  loadDashboardSection(section) {
    const content = document.getElementById('dashboardContent');
    const title = document.getElementById('dashboardTitle');
    
    if (!content) return;

    const userData = this.currentUser?.userData;
    const isEmployer = userData?.role === 'employer';

    // Обновляем заголовок
    const titles = {
      profile: isEmployer ? 'Профиль компании' : 'Мой профиль',
      jobs: 'Мои вакансии',
      applications: 'Мои отклики',
      candidates: 'База кандидатов',
      saved: 'Сохраненные вакансии',
      analytics: 'Аналитика',
      subscription: 'Управление подпиской',
      settings: 'Настройки аккаунта'
    };
    
    title.textContent = titles[section] || 'Личный кабинет';

    // Загружаем контент в зависимости от раздела
    switch (section) {
      case 'profile':
        this.loadProfileSection(content, isEmployer);
        break;
      case 'applications':
        this.loadApplicationsSection(content);
        break;
      case 'jobs':
        this.loadJobsSection(content);
        break;
      case 'saved':
        this.loadSavedSection(content);
        break;
      case 'candidates':
        this.loadCandidatesSection(content);
        break;
      case 'analytics':
        this.loadAnalyticsSection(content, isEmployer);
        break;
      case 'subscription':
        this.loadSubscriptionSection(content);
        break;
      case 'settings':
        this.loadSettingsSection(content);
        break;
      default:
        content.innerHTML = '<p class="text-gray-500">Раздел в разработке</p>';
    }
  }

  loadProfileSection(content, isEmployer) {
    const userData = this.currentUser?.userData;
    
    if (isEmployer) {
      content.innerHTML = `
        <div class="space-y-6">
          <!-- Основная информация компании -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Основная информация</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название компании</label>
                <input type="text" value="${userData?.employerProfile?.companyName || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">IČO</label>
                <input type="text" value="${userData?.employerProfile?.ico || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Отрасль</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="construction" ${userData?.employerProfile?.industry === 'construction' ? 'selected' : ''}>Строительство</option>
                  <option value="manufacturing" ${userData?.employerProfile?.industry === 'manufacturing' ? 'selected' : ''}>Производство</option>
                  <option value="it" ${userData?.employerProfile?.industry === 'it' ? 'selected' : ''}>IT и технологии</option>
                  <option value="retail" ${userData?.employerProfile?.industry === 'retail' ? 'selected' : ''}>Торговля</option>
                  <option value="logistics" ${userData?.employerProfile?.industry === 'logistics' ? 'selected' : ''}>Логистика</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Размер компании</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="1-10" ${userData?.employerProfile?.size === '1-10' ? 'selected' : ''}>1-10 сотрудников</option>
                  <option value="11-50" ${userData?.employerProfile?.size === '11-50' ? 'selected' : ''}>11-50 сотрудников</option>
                  <option value="51-200" ${userData?.employerProfile?.size === '51-200' ? 'selected' : ''}>51-200 сотрудников</option>
                  <option value="201-1000" ${userData?.employerProfile?.size === '201-1000' ? 'selected' : ''}>201-1000 сотрудников</option>
                  <option value="1000+" ${userData?.employerProfile?.size === '1000+' ? 'selected' : ''}>Более 1000 сотрудников</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Веб-сайт</label>
                <input type="url" value="${userData?.employerProfile?.website || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://example.com">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Описание компании</label>
                <textarea rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Расскажите о вашей компании...">${userData?.employerProfile?.description || ''}</textarea>
              </div>
            </div>
            <div class="mt-6">
              <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">Сохранить изменения</button>
            </div>
          </div>

          <!-- Контактная информация -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Контактная информация</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value="${userData?.email || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input type="tel" value="${userData?.phone || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
            </div>
          </div>

          <!-- Статистика -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-primary mb-2">5</div>
              <div class="text-gray-600">Активных вакансий</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-secondary mb-2">23</div>
              <div class="text-gray-600">Откликов за месяц</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-success mb-2">1,240</div>
              <div class="text-gray-600">Просмотров профиля</div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Профиль соискателя
      content.innerHTML = `
        <div class="space-y-6">
          <!-- Основная информация -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Основная информация</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                <input type="text" value="${userData?.name?.split(' ')[0] || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                <input type="text" value="${userData?.name?.split(' ')[1] || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value="${userData?.email || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input type="tel" value="${userData?.phone || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="Praha" ${userData?.workerProfile?.location === 'Praha' ? 'selected' : ''}>Прага</option>
                  <option value="Brno" ${userData?.workerProfile?.location === 'Brno' ? 'selected' : ''}>Брно</option>
                  <option value="Ostrava" ${userData?.workerProfile?.location === 'Ostrava' ? 'selected' : ''}>Острава</option>
                  <option value="Plzen" ${userData?.workerProfile?.location === 'Plzen' ? 'selected' : ''}>Пльзень</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Специализация</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="construction" ${userData?.workerProfile?.specialization === 'construction' ? 'selected' : ''}>Строительство и ремонт</option>
                  <option value="warehouse" ${userData?.workerProfile?.specialization === 'warehouse' ? 'selected' : ''}>Складские работы</option>
                  <option value="cleaning" ${userData?.workerProfile?.specialization === 'cleaning' ? 'selected' : ''}>Клининг и уборка</option>
                  <option value="transport" ${userData?.workerProfile?.specialization === 'transport' ? 'selected' : ''}>Транспорт и логистика</option>
                  <option value="it" ${userData?.workerProfile?.specialization === 'it' ? 'selected' : ''}>IT и технологии</option>
                </select>
              </div>
            </div>
            <div class="mt-6">
              <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">Сохранить изменения</button>
            </div>
          </div>

          <!-- Профессиональная информация -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Профессиональные навыки</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
                <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="no-experience" ${userData?.workerProfile?.experience === 'no-experience' ? 'selected' : ''}>Без опыта</option>
                  <option value="1-year" ${userData?.workerProfile?.experience === '1-year' ? 'selected' : ''}>До 1 года</option>
                  <option value="1-3-years" ${userData?.workerProfile?.experience === '1-3-years' ? 'selected' : ''}>1-3 года</option>
                  <option value="3-5-years" ${userData?.workerProfile?.experience === '3-5-years' ? 'selected' : ''}>3-5 лет</option>
                  <option value="5-plus" ${userData?.workerProfile?.experience === '5-plus' ? 'selected' : ''}>Более 5 лет</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Желаемая зарплата (CZK/месяц)</label>
                <input type="number" value="${userData?.workerProfile?.salary?.min || ''}" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="25000">
              </div>
            </div>
          </div>

          <!-- Статистика соискателя -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-primary mb-2">${userData?.stats?.applicationsThisMonth || 0}</div>
              <div class="text-gray-600">Откликов в этом месяце</div>
              <div class="text-sm text-gray-500 mt-1">Лимит: ${userData?.stats?.applicationsLimit || 5}</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-secondary mb-2">${userData?.stats?.profileViews || 0}</div>
              <div class="text-gray-600">Просмотров профиля</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div class="text-3xl font-bold text-success mb-2">12</div>
              <div class="text-gray-600">Сохраненных вакансий</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  loadApplicationsSection(content) {
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Фильтры и статистика -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Мои отклики</h3>
            <div class="flex gap-2">
              <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Все отклики</option>
                <option>Новые</option>
                <option>Просмотрены</option>
                <option>Приглашения</option>
                <option>Отклонены</option>
              </select>
            </div>
          </div>
          
          <!-- Статистика откликов -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="text-center p-4 bg-primary/5 rounded-lg">
              <div class="text-2xl font-bold text-primary">3</div>
              <div class="text-sm text-gray-600">Всего откликов</div>
            </div>
            <div class="text-center p-4 bg-secondary/5 rounded-lg">
              <div class="text-2xl font-bold text-secondary">1</div>
              <div class="text-sm text-gray-600">Приглашения</div>
            </div>
            <div class="text-center p-4 bg-success/5 rounded-lg">
              <div class="text-2xl font-bold text-success">2</div>
              <div class="text-sm text-gray-600">Остается в месяце</div>
            </div>
            <div class="text-center p-4 bg-gray-100 rounded-lg">
              <div class="text-2xl font-bold text-gray-600">85%</div>
              <div class="text-sm text-gray-600">Отклик ответов</div>
            </div>
          </div>
        </div>

        <!-- Список откликов -->
        <div class="space-y-4">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-semibold text-lg">Разнорабочий на стройку</h4>
                <p class="text-gray-600">Stavební firma Novák • Прага</p>
                <p class="text-sm text-gray-500">Отклик отправлен: 5 января 2025</p>
              </div>
              <span class="px-3 py-1 rounded-full text-sm bg-secondary/10 text-secondary">
                Приглашение на интервью
              </span>
            </div>
            <div class="flex gap-3">
              <button class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
                Ответить на приглашение
              </button>
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Просмотреть вакансию
              </button>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-semibold text-lg">Оператор производства</h4>
                <p class="text-gray-600">Škoda Auto a.s. • Млада-Болеслав</p>
                <p class="text-sm text-gray-500">Отклик отправлен: 3 января 2025</p>
              </div>
              <span class="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                Просмотрен работодателем
              </span>
            </div>
            <div class="flex gap-3">
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Отозвать отклик
              </button>
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Просмотреть вакансию
              </button>
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-semibold text-lg">Кладовщик-комплектовщик</h4>
                <p class="text-gray-600">Alza.cz a.s. • Прага</p>
                <p class="text-sm text-gray-500">Отклик отправлен: 1 января 2025</p>
              </div>
              <span class="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                Ожидает рассмотрения
              </span>
            </div>
            <div class="flex gap-3">
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Отозвать отклик
              </button>
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Просмотреть вакансию
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadSavedSection(content) {
    content.innerHTML = `
      <div class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold">Сохраненные вакансии</h3>
            <button class="text-primary hover:underline text-sm">Очистить все</button>
          </div>
          
          <!-- Список сохраненных вакансий -->
          <div class="space-y-4">
            <div class="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-semibold">Frontend разработчик</h4>
                  <p class="text-gray-600">AVAST Software • Прага</p>
                  <p class="text-sm text-gray-500">Сохранено: 4 января 2025</p>
                </div>
                <div class="flex gap-2">
                  <button class="text-primary hover:bg-primary/10 p-2 rounded">
                    <i class="ri-send-plane-line"></i>
                  </button>
                  <button class="text-red-500 hover:bg-red-50 p-2 rounded">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>60,000 - 90,000 CZK/месяц</span>
                <span>•</span>
                <span>Полный рабочий день</span>
                <span>•</span>
                <span>Удаленно</span>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-semibold">Водитель категории C+E</h4>
                  <p class="text-gray-600">TESCO • По всей Чехии</p>
                  <p class="text-sm text-gray-500">Сохранено: 2 января 2025</p>
                </div>
                <div class="flex gap-2">
                  <button class="text-primary hover:bg-primary/10 p-2 rounded">
                    <i class="ri-send-plane-line"></i>
                  </button>
                  <button class="text-red-500 hover:bg-red-50 p-2 rounded">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>180 CZK/час</span>
                <span>•</span>
                <span>Сменный график</span>
                <span>•</span>
                <span>С жильём</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadSubscriptionSection(content) {
    const userData = this.currentUser?.userData;
    const currentPlan = userData?.subscription?.type || 'basic';
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Текущая подписка -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Текущая подписка</h3>
          <div class="flex items-center justify-between p-4 border rounded-lg ${currentPlan === 'vip' ? 'border-primary bg-primary/5' : currentPlan === 'premium' ? 'border-gray-900 bg-gray-50' : 'border-gray-300'}">
            <div>
              <h4 class="font-semibold text-lg">${currentPlan === 'vip' ? 'VIP' : currentPlan === 'premium' ? 'Премиум' : 'Базовый'}</h4>
              <p class="text-gray-600">${currentPlan === 'basic' ? 'Бесплатно' : currentPlan === 'vip' ? '399 CZK/месяц' : '1,999 CZK/месяц'}</p>
              ${currentPlan !== 'basic' ? '<p class="text-sm text-gray-500">Следующий платеж: 5 февраля 2025</p>' : ''}
            </div>
            ${currentPlan !== 'basic' ? '<button class="text-red-600 hover:underline text-sm">Отменить подписку</button>' : ''}
          </div>
        </div>

        <!-- Доступные планы -->
        <div class="grid md:grid-cols-3 gap-6">
          <!-- Базовый план -->
          <div class="bg-white border ${currentPlan === 'basic' ? 'border-primary' : 'border-gray-200'} rounded-lg p-6">
            <div class="text-center mb-6">
              <h3 class="text-xl font-semibold mb-2">Базовый</h3>
              <div class="text-3xl font-bold mb-2">Бесплатно</div>
              <p class="text-gray-600">Основные возможности</p>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">5 откликов в месяц</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">70% вакансий</span>
              </li>
              <li class="flex items-center gap-3 text-gray-400">
                <i class="ri-close-circle-line"></i>
                <span class="text-sm">Автоотклик</span>
              </li>
            </ul>
            <button class="w-full px-4 py-2 ${currentPlan === 'basic' ? 'bg-gray-100 text-gray-600' : 'border border-gray-300 hover:bg-gray-50'} rounded-lg">
              ${currentPlan === 'basic' ? 'Текущий план' : 'Выбрать план'}
            </button>
          </div>

          <!-- VIP план -->
          <div class="bg-white border ${currentPlan === 'vip' ? 'border-primary' : 'border-gray-200'} rounded-lg p-6 relative">
            ${currentPlan !== 'vip' ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2"><span class="bg-primary text-white px-3 py-1 rounded-full text-sm">Популярный</span></div>' : ''}
            <div class="text-center mb-6">
              <h3 class="text-xl font-semibold mb-2">VIP</h3>
              <div class="text-3xl font-bold mb-2">399 CZK</div>
              <p class="text-gray-600">30 дней</p>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">Безлимитные отклики</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">Все вакансии</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">Автоотклик</span>
              </li>
            </ul>
            <button class="w-full px-4 py-2 ${currentPlan === 'vip' ? 'bg-primary text-white' : 'bg-primary text-white hover:bg-primary/90'} rounded-lg">
              ${currentPlan === 'vip' ? 'Активный план' : 'Обновить до VIP'}
            </button>
          </div>

          <!-- Премиум план (для работодателей) -->
          ${userData?.role === 'employer' ? `
          <div class="bg-white border ${currentPlan === 'premium' ? 'border-gray-900' : 'border-gray-200'} rounded-lg p-6">
            <div class="text-center mb-6">
              <h3 class="text-xl font-semibold mb-2">Премиум</h3>
              <div class="text-3xl font-bold mb-2">1,999 CZK</div>
              <p class="text-gray-600">30 дней</p>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">5 вакансий + 10 фриланс</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">Аналитика</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="ri-checkbox-circle-line text-success"></i>
                <span class="text-sm">Закрепление в топе</span>
              </li>
            </ul>
            <button class="w-full px-4 py-2 ${currentPlan === 'premium' ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'} rounded-lg">
              ${currentPlan === 'premium' ? 'Активный план' : 'Обновить до Премиум'}
            </button>
          </div>
          ` : ''}
        </div>

        <!-- История платежей -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">История платежей</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <p class="font-medium">VIP подписка</p>
                <p class="text-sm text-gray-500">5 декабря 2024</p>
              </div>
              <div class="text-right">
                <p class="font-medium">399 CZK</p>
                <p class="text-sm text-success">Оплачено</p>
              </div>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <p class="font-medium">VIP подписка (первый месяц)</p>
                <p class="text-sm text-gray-500">5 ноября 2024</p>
              </div>
              <div class="text-right">
                <p class="font-medium">1 CZK</p>
                <p class="text-sm text-success">Оплачено</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  loadSettingsSection(content) {
    const userData = this.currentUser?.userData;
    
    content.innerHTML = `
      <div class="space-y-6">
        <!-- Настройки уведомлений -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Уведомления</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Email уведомления</h4>
                <p class="text-sm text-gray-600">Получать уведомления о новых вакансиях и откликах</p>
              </div>
              <label class="custom-switch">
                <input type="checkbox" ${userData?.preferences?.email ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">SMS уведомления</h4>
                <p class="text-sm text-gray-600">Получать важные уведомления по SMS</p>
              </div>
              <label class="custom-switch">
                <input type="checkbox" ${userData?.preferences?.sms ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Еженедельная сводка</h4>
                <p class="text-sm text-gray-600">Получать сводку новых вакансий раз в неделю</p>
              </div>
              <label class="custom-switch">
                <input type="checkbox" ${userData?.preferences?.weeklyDigest ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Настройки приватности -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Приватность</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Показывать профиль работодателям</h4>
                <p class="text-sm text-gray-600">Разрешить работодателям находить ваш профиль в поиске</p>
              </div>
              <label class="custom-switch">
                <input type="checkbox" checked>
                <span class="switch-slider"></span>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">Показывать онлайн статус</h4>
                <p class="text-sm text-gray-600">Показывать когда вы в последний раз были онлайн</p>
              </div>
              <label class="custom-switch">
                <input type="checkbox" checked>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Смена пароля -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Безопасность</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
              <input type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Подтвердите новый пароль</label>
              <input type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
              Изменить пароль
            </button>
          </div>
        </div>

        <!-- Удаление аккаунта -->
        <div class="bg-white border border-red-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-red-600">Опасная зона</h3>
          <div class="space-y-4">
            <div>
              <h4 class="font-medium">Удалить аккаунт</h4>
              <p class="text-sm text-gray-600 mb-3">Это действие необратимо. Все ваши данные будут удалены.</p>
              <button class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showModalError(message) {
    // Показываем ошибку внутри модального окна регистрации
    const modal = document.getElementById('extendedRegistrationModal');
    if (modal) {
      // Удаляем предыдущие ошибки
      const existingError = modal.querySelector('.modal-error');
      if (existingError) {
        existingError.remove();
      }

      // Создаем новое уведомление об ошибке
      const errorDiv = document.createElement('div');
      errorDiv.className = 'modal-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-3';
      errorDiv.innerHTML = `
        <i class="ri-error-warning-line text-red-500"></i>
        <span class="flex-1">${message}</span>
        <button class="text-red-500 hover:text-red-700" onclick="this.parentElement.remove()">
          <i class="ri-close-line"></i>
        </button>
      `;

      // Вставляем ошибку в начало текущего шага
      const currentStep = document.getElementById(`step-${this.registrationStep}`);
      if (currentStep) {
        currentStep.insertBefore(errorDiv, currentStep.firstChild);
        
        // Прокручиваем к ошибке
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Автоматически скрываем через 8 секунд
      setTimeout(() => {
        if (errorDiv.parentElement) {
          errorDiv.style.opacity = '0';
          setTimeout(() => errorDiv.remove(), 300);
        }
      }, 8000);
    } else {
      // Если модальное окно не найдено, используем обычную ошибку
      this.showError(message);
    }
  }


  showEmailExistsError() {
    const modal = document.getElementById('extendedRegistrationModal');
    if (modal) {
      // Удаляем предыдущие ошибки
      const existingError = modal.querySelector('.modal-error');
      if (existingError) {
        existingError.remove();
      }

      // Создаем специальное уведомление с кнопкой входа
      const errorDiv = document.createElement('div');
      errorDiv.className = 'modal-error bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4';
      errorDiv.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="ri-information-line text-orange-500 mt-0.5"></i>
          <div class="flex-1">
            <p class="font-medium mb-2">Пользователь с таким email уже существует</p>
            <p class="text-sm mb-3">Возможно, вы уже регистрировались ранее. Попробуйте войти в систему или используйте другой email.</p>
            <div class="flex gap-2">
              <button class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90" onclick="window.userProfileManager.switchToLogin()">
                Войти в систему
              </button>
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50" onclick="window.userProfileManager.clearEmailField()">
                Изменить email
              </button>
            </div>
          </div>
          <button class="text-orange-500 hover:text-orange-700 ml-2" onclick="this.closest('.modal-error').remove()">
            <i class="ri-close-line"></i>
          </button>
        </div>
      `;

      // Вставляем ошибку в начало первого шага
      const firstStep = document.getElementById('step-1');
      if (firstStep) {
        firstStep.insertBefore(errorDiv, firstStep.firstChild);
        
        // Прокручиваем к ошибке
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  switchToLogin() {
    // Закрываем модал регистрации
    this.closeExtendedRegistration();
    
    // Открываем модал входа
    setTimeout(() => {
      window.openLoginModal();
      
      // Предзаполняем email из формы регистрации
      const email = document.getElementById('email')?.value;
      if (email) {
        const loginEmailField = document.querySelector('#modal input[type="email"]');
        if (loginEmailField) {
          loginEmailField.value = email;
          // Фокусируемся на поле пароля
          const passwordField = document.querySelector('#modal input[type="password"]');
          if (passwordField) {
            passwordField.focus();
          }
        }
      }
    }, 300);
  }

  clearEmailField() {
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.value = '';
      emailField.focus();
    }
    
    // Удаляем сообщение об ошибке
    const errorDiv = document.querySelector('.modal-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  showProfileCompletionNotice() {
    // Создаем уведомление о необходимости дозаполнить профиль
    const notice = document.createElement('div');
    notice.className = 'fixed top-4 right-4 z-50 bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm transform translate-x-full transition-transform duration-300';
    notice.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <i class="ri-information-line text-orange-600"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-900 mb-1">Дозаполните профиль</h4>
          <p class="text-sm text-gray-600 mb-3">Заполненный профиль увеличивает ваши шансы найти работу</p>
          <div class="flex gap-2">
            <button id="complete-profile-btn" class="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90">
              Заполнить
            </button>
            <button id="dismiss-notice-btn" class="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
              Позже
            </button>
          </div>
        </div>
        <button id="close-notice-btn" class="text-gray-400 hover:text-gray-600 p-1">
          <i class="ri-close-line"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notice);

    // Показываем уведомление
    setTimeout(() => notice.classList.remove('translate-x-full'), 100);

    // Обработчики кнопок
    document.getElementById('complete-profile-btn').onclick = () => {
      document.body.removeChild(notice);
      // Открываем дашборд вместо формы регистрации
      this.showUserMenu();
    };

    document.getElementById('dismiss-notice-btn').onclick = () => {
      notice.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(notice), 300);
    };

    document.getElementById('close-notice-btn').onclick = () => {
      notice.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(notice), 300);
    };

    // Автоматически скрываем через 10 секунд
    setTimeout(() => {
      if (document.body.contains(notice)) {
        notice.classList.add('translate-x-full');
        setTimeout(() => {
          if (document.body.contains(notice)) {
            document.body.removeChild(notice);
          }
        }, 300);
      }
    }, 10000);
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
    }, 4000);
  }

  // 🧪 ТЕСТОВАЯ ФУНКЦИЯ для демонстрации работы кнопок
  simulateUserLogin() {
    console.log('🧪 Симулируем вход пользователя для тестирования');
    
    // Создаем фейкового пользователя
    this.currentUser = {
      uid: 'test-user-123',
      email: 'test@workincz.com',
      userData: {
        name: 'Vladimir Testov',
        email: 'test@workincz.com',
        role: 'worker',
        subscription: {
          type: 'basic',
          startDate: new Date(),
          endDate: null
        },
        createdAt: new Date(),
        profileCompleted: true
      }
    };
    
    // Вызываем обновление UI
    this.updateUIForLoggedInUser();
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.userProfileManager = new UserProfileManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserProfileManager;
} 