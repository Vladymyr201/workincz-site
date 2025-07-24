// 🔐 Enhanced Auth System - улучшенная система авторизации
class EnhancedAuthSystem {
  constructor() {
    this.currentRole = null;
    this.testAccounts = {
      candidate: { email: 'demo-candidate@test.cz', password: 'demo123456', name: 'Демо Соискатель' },
      client: { email: 'demo-client@test.cz', password: 'demo123456', name: 'Демо Работодатель' },
      agency: { email: 'demo-agency@test.cz', password: 'demo123456', name: 'Демо Агентство' }
    };
    this.init();
  }

  init() {
    // Проверяем, что модалы еще не созданы
    if (document.getElementById('enhancedLoginModal')) {
      console.log('✅ Enhanced модалы уже существуют');
      return;
    }

    this.createEnhancedModals();
    this.setupEventListeners();
    console.log('🔐 EnhancedAuthSystem инициализирован');
  }

  createEnhancedModals() {
    const modalHTML = `
      <!-- Enhanced Login Modal -->
      <div id="enhancedLoginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-secondary p-6 text-white rounded-t-xl">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Вход в JobBridge</h3>
                <button id="closeEnhancedLoginModal" class="text-white/80 hover:text-white">
                  <i class="ri-close-line text-xl"></i>
                </button>
              </div>
              <p class="text-primary-100 text-sm mt-1">Выберите роль для входа</p>
            </div>
            
            <!-- Role Selection -->
            <div class="p-6">
              <div class="grid grid-cols-1 gap-3 mb-6">
                <div class="role-login-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-all" data-role="candidate">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i class="ri-user-line text-primary text-lg"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900">Соискатель</h5>
                      <p class="text-sm text-gray-600">Ищу работу в Чехии</p>
                    </div>
                    <div class="text-xs text-gray-500">Тест</div>
                  </div>
                </div>
                
                <div class="role-login-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-all" data-role="client">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <i class="ri-building-line text-secondary text-lg"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900">Работодатель</h5>
                      <p class="text-sm text-gray-600">Ищу сотрудников</p>
                    </div>
                    <div class="text-xs text-gray-500">Тест</div>
                  </div>
                </div>
                
                <div class="role-login-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary transition-all" data-role="agency">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <i class="ri-team-line text-success text-lg"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-medium text-gray-900">Кадровое агентство</h5>
                      <p class="text-sm text-gray-600">Предоставляю услуги подбора</p>
                    </div>
                    <div class="text-xs text-gray-500">Тест</div>
                  </div>
                </div>
              </div>
              
              <!-- Login Form -->
              <form id="enhancedLoginForm" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="enhancedLoginEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <input type="password" id="enhancedLoginPassword" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none" required>
                </div>
                
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary">
                    <span class="text-sm text-gray-700">Запомнить меня</span>
                  </label>
                  <button type="button" class="text-sm text-primary hover:underline">Забыли пароль?</button>
                </div>
                
                <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Войти
                </button>
              </form>
              
              <!-- Quick Login Buttons -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 text-center mb-4">Быстрый вход для тестирования:</p>
                <div class="grid grid-cols-1 gap-2">
                  <button onclick="enhancedAuthSystem.quickLogin('candidate')" class="w-full bg-primary/10 text-primary py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    Войти как Соискатель
                  </button>
                  <button onclick="enhancedAuthSystem.quickLogin('client')" class="w-full bg-secondary/10 text-secondary py-2 rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors">
                    Войти как Работодатель
                  </button>
                  <button onclick="enhancedAuthSystem.quickLogin('agency')" class="w-full bg-success/10 text-success py-2 rounded-lg text-sm font-medium hover:bg-success/20 transition-colors">
                    Войти как Агентство
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Switcher Modal -->
      <div id="roleSwitcherModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Переключение роли</h3>
              <p class="text-gray-600 mb-6">Выберите роль для переключения:</p>
              
              <div class="space-y-3">
                <button onclick="enhancedAuthSystem.switchRole('candidate')" class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <i class="ri-user-line text-primary text-lg"></i>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900">Соискатель</h5>
                      <p class="text-sm text-gray-600">Поиск работы</p>
                    </div>
                  </div>
                </button>
                
                <button onclick="enhancedAuthSystem.switchRole('client')" class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <i class="ri-building-line text-secondary text-lg"></i>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900">Работодатель</h5>
                      <p class="text-sm text-gray-600">Размещение вакансий</p>
                    </div>
                  </div>
                </button>
                
                <button onclick="enhancedAuthSystem.switchRole('agency')" class="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <i class="ri-team-line text-success text-lg"></i>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900">Агентство</h5>
                      <p class="text-sm text-gray-600">Подбор персонала</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <button onclick="enhancedAuthSystem.hideRoleSwitcher()" class="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Закрытие модала
    document.getElementById('closeEnhancedLoginModal')?.addEventListener('click', () => {
      this.hideEnhancedLoginModal();
    });

    // Выбор роли
    document.querySelectorAll('.role-login-option').forEach(option => {
      option.addEventListener('click', () => {
        const role = option.dataset.role;
        this.selectLoginRole(role);
      });
    });

    // Отправка формы
    document.getElementById('enhancedLoginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitEnhancedLogin();
    });

    // Закрытие по клику вне модала
    document.getElementById('enhancedLoginModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'enhancedLoginModal') {
        this.hideEnhancedLoginModal();
      }
    });
  }

  selectLoginRole(role) {
    // Убираем выделение со всех опций
    document.querySelectorAll('.role-login-option').forEach(option => {
      option.classList.remove('border-primary', 'bg-primary/5');
      option.classList.add('border-gray-200');
    });

    // Выделяем выбранную опцию
    const selectedOption = document.querySelector(`[data-role="${role}"]`);
    if (selectedOption) {
      selectedOption.classList.remove('border-gray-200');
      selectedOption.classList.add('border-primary', 'bg-primary/5');
    }

    this.currentRole = role;

    // Заполняем форму тестовыми данными
    const testAccount = this.testAccounts[role];
    if (testAccount) {
      document.getElementById('enhancedLoginEmail').value = testAccount.email;
      document.getElementById('enhancedLoginPassword').value = testAccount.password;
    }
  }

  async quickLogin(role) {
    try {
      const testAccount = this.testAccounts[role];
      if (!testAccount) {
        this.showError('Неизвестная роль');
        return;
      }

      console.log(`🔐 Быстрый вход как ${role}...`);
      
      // Создаем или получаем тестового пользователя
      const user = await this.ensureTestUser(role, testAccount);
      if (user) {
        this.showSuccess(`Вход выполнен как ${this.getRoleDisplayName(role)}`);
        this.hideEnhancedLoginModal();
        this.showDashboard(role);
      }
      
    } catch (error) {
      console.error('Ошибка быстрого входа:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }

  async ensureTestUser(role, testAccount) {
    try {
      // Пытаемся войти с существующим аккаунтом
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        testAccount.email,
        testAccount.password
      );
      
      return userCredential.user;
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Создаем нового тестового пользователя
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(
          testAccount.email,
          testAccount.password
        );

        // Создаем профиль в Firestore
        const userData = {
          uid: userCredential.user.uid,
          email: testAccount.email,
          name: testAccount.name,
          role: role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isVerified: true,
          isPremium: true,
          isTestAccount: true
        };

        await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);
        
        return userCredential.user;
      }
      throw error;
    }
  }

  async submitEnhancedLogin() {
    try {
      const email = document.getElementById('enhancedLoginEmail').value;
      const password = document.getElementById('enhancedLoginPassword').value;

      if (!email || !password) {
        this.showError('Заполните все поля');
        return;
      }

      console.log('🔐 Выполняется вход...');
      
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      this.showSuccess('Вход выполнен успешно!');
      this.hideEnhancedLoginModal();
      
      // Определяем роль пользователя
      const userDoc = await firebase.firestore().collection('users').doc(userCredential.user.uid).get();
      const userData = userDoc.data();
      const role = userData?.role || 'candidate';
      
      this.showDashboard(role);
      
    } catch (error) {
      console.error('Ошибка входа:', error);
      this.showError(this.getErrorMessage(error.code));
    }
  }

  showEnhancedLoginModal() {
    document.getElementById('enhancedLoginModal').classList.remove('hidden');
  }

  hideEnhancedLoginModal() {
    document.getElementById('enhancedLoginModal').classList.add('hidden');
    this.resetLoginForm();
  }

  showRoleSwitcher() {
    document.getElementById('roleSwitcherModal').classList.remove('hidden');
  }

  hideRoleSwitcher() {
    document.getElementById('roleSwitcherModal').classList.add('hidden');
  }

  switchRole(role) {
    this.currentRole = role;
    this.hideRoleSwitcher();
    this.showDashboard(role);
  }

  showDashboard(role) {
    const roleRoutes = {
      candidate: '/dashboard.html',
      client: '/employer-dashboard.html',
      agency: '/agency-dashboard.html'
    };

    const route = roleRoutes[role] || '/dashboard.html';
    window.location.href = route;
  }

  getRoleDisplayName(role) {
    const names = {
      candidate: 'Соискатель',
      client: 'Работодатель',
      agency: 'Агентство'
    };
    return names[role] || role;
  }

  resetLoginForm() {
    document.getElementById('enhancedLoginForm').reset();
    this.currentRole = null;
    
    // Убираем выделение с ролей
    document.querySelectorAll('.role-login-option').forEach(option => {
      option.classList.remove('border-primary', 'bg-primary/5');
      option.classList.add('border-gray-200');
    });
  }

  getErrorMessage(errorCode) {
    const messages = {
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-email': 'Неверный формат email',
      'auth/too-many-requests': 'Слишком много попыток входа',
      'auth/network-request-failed': 'Ошибка сети'
    };
    return messages[errorCode] || 'Произошла ошибка при входе';
  }

  showError(message) {
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(`Ошибка: ${message}`);
    }
  }

  showSuccess(message) {
    if (window.showToast) {
      window.showToast(message, 'success');
    } else {
      alert(`Успех: ${message}`);
    }
  }

  // Обновление переключателя ролей
  updateRoleSwitcher() {
    console.log('🔄 Обновляю переключатель ролей, текущая роль:', this.currentRole);
    
    // Обновляем UI элементы в зависимости от роли
    const roleElements = document.querySelectorAll('[data-role]');
    roleElements.forEach(element => {
      const elementRole = element.dataset.role;
      if (elementRole === this.currentRole) {
        element.classList.add('active', 'border-primary');
        element.classList.remove('border-gray-200');
      } else {
        element.classList.remove('active', 'border-primary');
        element.classList.add('border-gray-200');
      }
    });

    // Обновляем заголовки и описания
    const roleDisplayNames = {
      candidate: 'Соискатель',
      client: 'Работодатель',
      agency: 'Агентство'
    };

    const roleDescriptions = {
      candidate: 'Ищу работу в Чехии',
      client: 'Ищу сотрудников',
      agency: 'Предоставляю услуги подбора'
    };

    // Обновляем заголовок в модале
    const modalTitle = document.querySelector('#enhancedLoginModal h3');
    if (modalTitle && this.currentRole) {
      modalTitle.textContent = `Вход как ${roleDisplayNames[this.currentRole]}`;
    }

    // Обновляем описание в модале
    const modalDescription = document.querySelector('#enhancedLoginModal .text-primary-100');
    if (modalDescription && this.currentRole) {
      modalDescription.textContent = roleDescriptions[this.currentRole];
    }

    console.log('✅ Переключатель ролей обновлен');
  }
}

// Экспорт класса
window.EnhancedAuthSystem = EnhancedAuthSystem; 