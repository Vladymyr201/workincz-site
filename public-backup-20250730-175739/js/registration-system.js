// ВНИМАНИЕ: Проверка email временно отключена для теста. После регистрации можно сразу войти. Не забудьте вернуть проверку позже!
console.log('🔐 RegistrationSystem: скрипт загружается...');

// 🔐 Система регистрации JobBridge
class RegistrationSystem {
  constructor() {
    console.log('🔐 RegistrationSystem: конструктор запущен');
    this.currentStep = 1;
    this.registrationData = {
      role: null,
      email: '',
      password: '',
      name: '',
      phone: '',
      company: '',
      license: '',
      specialization: '',
      consent: false
    };
    
    this.init();
  }

  init() {
    console.log('🔐 RegistrationSystem: init() запущен');
    this.createModals();
    this.setupEventListeners();
    console.log('🔐 RegistrationSystem инициализирован');
  }

  createModals() {
    // Создаем модальные окна для регистрации
    const modalHTML = `
      <!-- Registration Modal -->
      <div id="registrationModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b">
              <h3 class="text-xl font-semibold text-gray-900">Регистрация в JobBridge</h3>
              <button id="closeRegistrationModal" class="text-gray-400 hover:text-gray-600">
                <i class="ri-close-line text-xl"></i>
              </button>
            </div>

            <!-- Step 1: Role Selection -->
            <div id="step1" class="p-6">
              <h4 class="text-lg font-medium mb-4">Выберите ваш тип аккаунта</h4>
              <div class="space-y-4">
                <div class="role-option border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors" data-role="candidate">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <i class="ri-user-line text-primary text-xl"></i>
                    </div>
                    <div>
                      <h5 class="font-medium">Соискатель</h5>
                      <p class="text-sm text-gray-600">Ищу работу в Чехии</p>
                    </div>
                  </div>
                </div>
                
                <div class="role-option border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors" data-role="client">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <i class="ri-building-line text-secondary text-xl"></i>
                    </div>
                    <div>
                      <h5 class="font-medium">Работодатель</h5>
                      <p class="text-sm text-gray-600">Ищу сотрудников</p>
                    </div>
                  </div>
                </div>
                
                <div class="role-option border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors" data-role="agency">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <i class="ri-team-line text-success text-xl"></i>
                    </div>
                    <div>
                      <h5 class="font-medium">Кадровое агентство</h5>
                      <p class="text-sm text-gray-600">Предоставляю услуги подбора</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Basic Information -->
            <div id="step2" class="p-6 hidden">
              <h4 class="text-lg font-medium mb-4">Основная информация</h4>
              <form id="registrationForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" id="regEmail" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Пароль *</label>
                  <input type="password" id="regPassword" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
                  <p class="text-xs text-gray-500 mt-1">Минимум 8 символов</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                  <input type="text" id="regName" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input type="tel" id="regPhone" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                </div>

                <!-- Agency specific fields -->
                <div id="agencyFields" class="hidden space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Название компании *</label>
                    <input type="text" id="regCompany" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Лицензия *</label>
                    <input type="text" id="regLicense" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" placeholder="Номер лицензии">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
                    <select id="regSpecialization" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                      <option value="">Выберите специализацию</option>
                      <option value="construction">Строительство</option>
                      <option value="warehouse">Склады и логистика</option>
                      <option value="cleaning">Уборка и обслуживание</option>
                      <option value="transport">Транспорт</option>
                      <option value="it">IT и технологии</option>
                      <option value="restaurant">Рестораны и гостиницы</option>
                      <option value="general">Общий подбор</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-start gap-2">
                  <input type="checkbox" id="regConsent" class="custom-checkbox mt-1" required>
                  <label for="regConsent" class="text-sm text-gray-700">
                    Я согласен с <a href="#" class="text-primary hover:underline">условиями использования</a> и 
                    <a href="#" class="text-primary hover:underline">политикой конфиденциальности</a> *
                  </label>
                </div>
              </form>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between p-6 border-t">
              <button id="prevStep" class="px-4 py-2 text-gray-600 hover:text-gray-800 hidden">Назад</button>
              <button id="nextStep" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Продолжить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Login Modal -->
      <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg max-w-md w-full">
            <div class="flex items-center justify-between p-6 border-b">
              <h3 class="text-xl font-semibold text-gray-900">Вход в JobBridge</h3>
              <button id="closeLoginModal" class="text-gray-400 hover:text-gray-600">
                <i class="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <form id="loginForm" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="loginEmail" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <input type="password" id="loginPassword" class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
              </div>
              
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="custom-checkbox">
                  <span class="text-sm text-gray-700">Запомнить меня</span>
                </label>
                <a href="#" class="text-sm text-primary hover:underline">Забыли пароль?</a>
              </div>
              
              <button type="submit" class="w-full bg-primary text-white py-2 rounded hover:bg-primary/90">Войти</button>
            </form>
            
            <div class="p-6 border-t text-center">
              <p class="text-sm text-gray-600">Нет аккаунта? 
                <button id="switchToRegister" class="text-primary hover:underline">Зарегистрироваться</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Кнопки открытия модальных окон
    document.getElementById('registerBtn').addEventListener('click', () => {
      this.showRegistrationModal();
    });

    document.getElementById('loginBtn').addEventListener('click', () => {
      this.showLoginModal();
    });

    // Закрытие модальных окон
    document.getElementById('closeRegistrationModal').addEventListener('click', () => {
      this.hideRegistrationModal();
    });

    document.getElementById('closeLoginModal').addEventListener('click', () => {
      this.hideLoginModal();
    });

    // Переключение между модальными окнами
    document.getElementById('switchToRegister').addEventListener('click', () => {
      this.hideLoginModal();
      this.showRegistrationModal();
    });

    // Выбор роли
    document.querySelectorAll('.role-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.selectRole(e.currentTarget.dataset.role);
      });
    });

    // Навигация по шагам
    document.getElementById('nextStep').addEventListener('click', () => {
      this.nextStep();
    });

    document.getElementById('prevStep').addEventListener('click', () => {
      this.prevStep();
    });

    // Форма регистрации
    document.getElementById('registrationForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitRegistration();
    });

    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitLogin();
    });

    // Закрытие по клику вне модального окна
    document.getElementById('registrationModal').addEventListener('click', (e) => {
      if (e.target.id === 'registrationModal') {
        this.hideRegistrationModal();
      }
    });

    document.getElementById('loginModal').addEventListener('click', (e) => {
      if (e.target.id === 'loginModal') {
        this.hideLoginModal();
      }
    });
  }

  showRegistrationModal() {
    document.getElementById('registrationModal').classList.remove('hidden');
    this.resetRegistration();
  }

  hideRegistrationModal() {
    document.getElementById('registrationModal').classList.add('hidden');
  }

  showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
  }

  hideLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
  }

  selectRole(role) {
    this.registrationData.role = role;
    
    // Убираем выделение со всех опций
    document.querySelectorAll('.role-option').forEach(option => {
      option.classList.remove('border-primary', 'bg-primary/5');
      option.classList.add('border-gray-200');
    });
    
    // Выделяем выбранную опцию
    const selectedOption = document.querySelector(`[data-role="${role}"]`);
    selectedOption.classList.remove('border-gray-200');
    selectedOption.classList.add('border-primary', 'bg-primary/5');
    
    // Показываем/скрываем поля для агентства
    const agencyFields = document.getElementById('agencyFields');
    if (role === 'agency') {
      agencyFields.classList.remove('hidden');
    } else {
      agencyFields.classList.add('hidden');
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.registrationData.role) {
        this.showError('Пожалуйста, выберите тип аккаунта');
        return;
      }
      this.showStep(2);
    } else if (this.currentStep === 2) {
      if (this.validateStep2()) {
        // ОТКЛЮЧЕНО: шаг подтверждения email для теста
        // this.showStep(3);
        // this.sendVerificationEmail();
        this.submitRegistration(); // Сразу регистрируем
      }
    }
  }

  prevStep() {
    if (this.currentStep === 2) {
      this.showStep(1);
    }
    // Убираем переход на шаг 3
  }

  showStep(step) {
    // Скрываем все шаги
    document.querySelectorAll('[id^="step"]').forEach(el => {
      el.classList.add('hidden');
    });
    // Показываем только шаг 1 или 2
    if (step === 1 || step === 2) {
      document.getElementById(`step${step}`).classList.remove('hidden');
    }
    // Обновляем кнопки навигации
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    if (step === 1) {
      prevBtn.classList.add('hidden');
      nextBtn.textContent = 'Продолжить';
      nextBtn.classList.remove('hidden');
    } else if (step === 2) {
      prevBtn.classList.remove('hidden');
      nextBtn.textContent = 'Зарегистрироваться';
      nextBtn.classList.remove('hidden');
    }
    this.currentStep = step;
  }

  validateStep2() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const name = document.getElementById('regName').value;
    const consent = document.getElementById('regConsent').checked;
    
    if (!email || !password || !name || !consent) {
      this.showError('Пожалуйста, заполните все обязательные поля');
      return false;
    }
    
    if (password.length < 8) {
      this.showError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    
    if (this.registrationData.role === 'agency') {
      const company = document.getElementById('regCompany').value;
      const license = document.getElementById('regLicense').value;
      
      if (!company || !license) {
        this.showError('Для агентства необходимо указать название компании и номер лицензии');
        return false;
      }
    }
    
    // Сохраняем данные
    this.registrationData.email = email;
    this.registrationData.password = password;
    this.registrationData.name = name;
    this.registrationData.phone = document.getElementById('regPhone').value;
    this.registrationData.company = document.getElementById('regCompany').value;
    this.registrationData.license = document.getElementById('regLicense').value;
    this.registrationData.specialization = document.getElementById('regSpecialization').value;
    this.registrationData.consent = consent;
    
    return true;
  }

  async submitRegistration() {
    try {
      if (!window.authManager) {
        this.showError('Система аутентификации не инициализирована');
        return;
      }

      // Создаем пользователя в Firebase
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        this.registrationData.email,
        this.registrationData.password
      );

      // Сохраняем дополнительные данные в Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: this.registrationData.email,
        name: this.registrationData.name,
        phone: this.registrationData.phone,
        role: this.registrationData.role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isVerified: false,
        isPremium: false,
        stats: {
          applications: 0,
          savedJobs: 0,
          profileViews: 0
        }
      };

      // Добавляем специфичные поля для агентства
      if (this.registrationData.role === 'agency') {
        userData.company = this.registrationData.company;
        userData.license = this.registrationData.license;
        userData.specialization = this.registrationData.specialization;
        userData.rating = 0;
        userData.reviews = [];
      }

      await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);

      this.showSuccess('Регистрация успешна! Теперь вы можете войти.');
      this.hideRegistrationModal();
      
      // Обновляем UI
      if (window.authManager && typeof window.authManager.updateAuthUI === 'function') {
        window.authManager.updateAuthUI(userCredential.user);
      }

    } catch (error) {
      console.error('Ошибка регистрации:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }

  async submitLogin() {
    try {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        this.showError('Пожалуйста, заполните все поля');
        return;
      }

      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      this.showSuccess('Вход выполнен успешно!');
      this.hideLoginModal();
      
      // Обновляем UI
      if (window.authManager && typeof window.authManager.updateAuthUI === 'function') {
        window.authManager.updateAuthUI(userCredential.user);
      }

    } catch (error) {
      console.error('Ошибка входа:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }

  resetRegistration() {
    this.currentStep = 1;
    this.registrationData = {
      role: null,
      email: '',
      password: '',
      name: '',
      phone: '',
      company: '',
      license: '',
      specialization: '',
      consent: false
    };
    
    // Сбрасываем форму
    document.getElementById('registrationForm').reset();
    
    // Убираем выделение ролей
    document.querySelectorAll('.role-option').forEach(option => {
      option.classList.remove('border-primary', 'bg-primary/5');
      option.classList.add('border-gray-200');
    });
    
    // Скрываем поля агентства
    document.getElementById('agencyFields').classList.add('hidden');
    
    // Показываем первый шаг
    this.showStep(1);
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Этот email уже используется',
      'auth/invalid-email': 'Неверный формат email',
      'auth/weak-password': 'Пароль слишком слабый',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение'
    };
    
    return errorMessages[errorCode] || 'Произошла ошибка. Попробуйте еще раз';
  }

  showError(message) {
    // Создаем уведомление об ошибке
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  showSuccess(message) {
    // Создаем уведомление об успехе
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Инициализация системы регистрации
window.registrationSystem = new RegistrationSystem(); 