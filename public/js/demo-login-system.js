// 🚀 Demo Login System - 1-клик вход для 3 ролей
class DemoLoginSystem {
  constructor() {
    this.roles = [
      { key: 'candidate', label: 'Соискатель', icon: 'ri-user-line', color: 'primary' },
      { key: 'client', label: 'Работодатель', icon: 'ri-building-line', color: 'secondary' },
      { key: 'agency', label: 'Агентство', icon: 'ri-team-line', color: 'success' }
    ];
    
    this.demoAccounts = {
      candidate: {
        email: 'demo-candidate@workincz.cz',
        name: 'Демо Соискатель',
        role: 'candidate',
        stats: { applications: 5, savedJobs: 12, profileViews: 23 }
      },
      client: {
        email: 'demo-client@workincz.cz', 
        name: 'Демо Работодатель',
        role: 'client',
        stats: { postedJobs: 8, receivedApplications: 45, activeContracts: 3 }
      },
      agency: {
        email: 'demo-agency@workincz.cz',
        name: 'Демо Агентство',
        role: 'agency',
        stats: { completedContracts: 15, activeRequests: 3, rating: 4.8 }
      }
    };
    
    this.init();
  }

  init() {
    // Проверяем, что Firebase инициализирован
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase не загружен! DemoLoginSystem не может работать.');
      return;
    }
    
    if (!firebase.auth) {
      console.error('❌ Firebase Auth не загружен! DemoLoginSystem не может работать.');
      return;
    }
    
    if (!firebase.firestore) {
      console.error('❌ Firebase Firestore не загружен! DemoLoginSystem не может работать.');
      return;
    }
    
    console.log('✅ Firebase проверен, создаю DemoLoginSystem...');
    
    // Ждем загрузки DOM с таймаутом и максимальным количеством попыток
    let attempts = 0;
    const maxAttempts = 100; // 10 секунд максимум
    
    const initDemoSystem = () => {
      attempts++;
      
      if (document.body && document.readyState === 'complete' && document.getElementById('loginBtn')) {
        console.log('✅ DOM полностью загружен, создаю модал...');
        this.createDemoLoginModal();
        this.setupEventListeners();
        console.log('🚀 DemoLoginSystem инициализирован');
      } else if (attempts < maxAttempts) {
        console.log(`⏳ DOM еще не готов (попытка ${attempts}/${maxAttempts}), ждем...`);
        setTimeout(initDemoSystem, 100);
      } else {
        console.error('❌ Не удалось дождаться загрузки DOM после 10 секунд');
      }
    };
    
    // Запускаем инициализацию
    initDemoSystem();
  }

  createDemoLoginModal() {
    // Проверяем, что document.body существует и DOM готов
    if (!document.body) {
      console.error('❌ document.body не существует, откладываю создание модала');
      setTimeout(() => this.createDemoLoginModal(), 100);
      return;
    }

    // Проверяем, что модал еще не создан
    if (document.getElementById('demoLoginModal')) {
      console.log('✅ Demo модал уже существует');
      return;
    }

    console.log('🆕 Создаю Demo модал...');

    const modalHTML = `
      <!-- Demo Login Modal -->
      <div id="demoLoginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-secondary p-6 text-white rounded-t-xl">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">🚀 Demo-вход в WorkInCZ</h3>
                <button id="closeDemoLoginModal" class="text-white/80 hover:text-white">
                  <i class="ri-close-line text-xl"></i>
                </button>
              </div>
              <p class="text-primary-100 text-sm mt-1">Выберите роль для быстрого входа</p>
            </div>
            
            <!-- Role Buttons -->
            <div class="p-6">
              <div class="space-y-3">
                <button 
                  onclick="demoLoginSystem.handleDemoLogin('candidate')"
                  class="w-full demo-login-btn border-2 border-gray-200 rounded-lg p-4 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                  data-role="candidate"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <i class="ri-user-line text-primary text-xl"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-semibold text-gray-900">Соискатель</h5>
                      <p class="text-sm text-gray-600">Быстрый вход в демо-режиме</p>
                    </div>
                    <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo</div>
                  </div>
                </button>
                
                <button 
                  onclick="demoLoginSystem.handleDemoLogin('client')"
                  class="w-full demo-login-btn border-2 border-gray-200 rounded-lg p-4 text-left hover:border-secondary hover:bg-secondary/5 transition-all group"
                  data-role="client"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <i class="ri-building-line text-secondary text-xl"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-semibold text-gray-900">Работодатель</h5>
                      <p class="text-sm text-gray-600">Быстрый вход в демо-режиме</p>
                    </div>
                    <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo</div>
                  </div>
                </button>
                
                <button 
                  onclick="demoLoginSystem.handleDemoLogin('agency')"
                  class="w-full demo-login-btn border-2 border-gray-200 rounded-lg p-4 text-left hover:border-success hover:bg-success/5 transition-all group"
                  data-role="agency"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors">
                      <i class="ri-team-line text-success text-xl"></i>
                    </div>
                    <div class="flex-1">
                      <h5 class="font-semibold text-gray-900">Агентство</h5>
                      <p class="text-sm text-gray-600">Быстрый вход в демо-режиме</p>
                    </div>
                    <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Demo</div>
                  </div>
                </button>
              </div>
              
              <!-- Magic Link Option -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-600 text-center mb-4">Или войдите через Magic-Link:</p>
                <form id="magicLinkForm" class="space-y-3">
                  <input 
                    type="email" 
                    id="magicLinkEmail" 
                    placeholder="your@email.com"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                  >
                  <button 
                    type="submit"
                    class="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Отправить Magic-Link
                  </button>
                </form>
              </div>
            </div>
            
            <div class="p-6 border-t border-gray-200 text-center">
              <p class="text-xs text-gray-500">
                Demo-аккаунты создаются автоматически и содержат тестовые данные
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    try {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      console.log('✅ Demo модал создан успешно');
    } catch (error) {
      console.error('❌ Ошибка создания Demo модала:', error);
    }
  }

  setupEventListeners() {
    // Закрытие модала
    document.getElementById('closeDemoLoginModal')?.addEventListener('click', () => {
      this.hideDemoLoginModal();
    });

    // Закрытие по клику вне модала
    document.getElementById('demoLoginModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'demoLoginModal') {
        this.hideDemoLoginModal();
      }
    });

    // Magic-Link форма
    document.getElementById('magicLinkForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMagicLink();
    });
  }

  async handleDemoLogin(role) {
    try {
      this.showLoading(`Создаю ${this.getRoleDisplayName(role)} аккаунт...`);
      
      const demoAccount = this.demoAccounts[role];
      if (!demoAccount) {
        throw new Error('Демо-аккаунт не найден');
      }

      // Создаем или получаем демо-пользователя
      const user = await this.ensureDemoUser(demoAccount);
      
      // Входим в систему
      await this.signInDemoUser(user);
      
      this.showSuccess(`Добро пожаловать, ${demoAccount.name}!`);
      this.hideDemoLoginModal();
      
      // Перенаправляем на соответствующий дашборд
      this.redirectToDashboard(role);
      
    } catch (error) {
      console.error('Ошибка Demo-входа:', error);
      this.showError(this.getErrorMessage(error));
    }
  }

  async ensureDemoUser(demoAccount) {
    try {
      console.log(`🔍 Проверяю существование демо-аккаунта: ${demoAccount.email}`);
      
      // Пытаемся войти с существующим аккаунтом
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        demoAccount.email,
        'demo123456'
      );
      
      console.log(`✅ Демо-аккаунт найден: ${demoAccount.email}`);
      
      // Если успешно, выходим и возвращаем пользователя
      await firebase.auth().signOut();
      return userCredential.user;
      
    } catch (error) {
      console.log(`❌ Ошибка при проверке аккаунта: ${error.code}`);
      
      if (error.code === 'auth/user-not-found') {
        console.log(`🆕 Создаю новый демо-аккаунт: ${demoAccount.email}`);
        // Создаем нового демо-пользователя
        return await this.createDemoUser(demoAccount);
      } else if (error.code === 'auth/wrong-password') {
        // Аккаунт существует, но пароль другой - создаем новый
        console.log(`🔄 Аккаунт существует с другим паролем, создаю новый: ${demoAccount.email}`);
        return await this.createDemoUser(demoAccount);
      }
      throw error;
    }
  }

  async createDemoUser(demoAccount) {
    try {
      console.log(`🆕 Начинаю создание демо-аккаунта: ${demoAccount.email}`);
      
      // Создаем пользователя
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        demoAccount.email,
        'demo123456'
      );

      console.log(`✅ Firebase Auth пользователь создан: ${userCredential.user.uid}`);

      // Создаем профиль в Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: demoAccount.email,
        name: demoAccount.name,
        role: demoAccount.role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isVerified: true,
        isPremium: true,
        isDemoAccount: true,
        stats: demoAccount.stats,
        // Дополнительные поля для агентства
        ...(demoAccount.role === 'agency' && {
          company: 'Демо Кадровое Агентство',
          license: 'DEMO-LICENSE-001',
          specialization: 'general',
          rating: 4.8,
          reviews: []
        })
      };

      await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);
      console.log(`✅ Firestore профиль создан для: ${demoAccount.email}`);
      
      // Выходим из созданного аккаунта
      await firebase.auth().signOut();
      console.log(`✅ Выход из созданного аккаунта выполнен`);
      
      console.log(`✅ Демо-аккаунт полностью создан: ${demoAccount.name}`);
      return userCredential.user;
      
    } catch (error) {
      console.error(`❌ Ошибка создания демо-аккаунта: ${error.code} - ${error.message}`);
      
      // Если аккаунт уже существует, пытаемся войти
      if (error.code === 'auth/email-already-in-use') {
        console.log(`🔄 Аккаунт уже существует, пытаюсь войти: ${demoAccount.email}`);
        try {
          const userCredential = await firebase.auth().signInWithEmailAndPassword(
            demoAccount.email,
            'demo123456'
          );
          await firebase.auth().signOut();
          return userCredential.user;
        } catch (loginError) {
          console.error(`❌ Не удалось войти в существующий аккаунт: ${loginError.message}`);
          throw loginError;
        }
      }
      
      throw error;
    }
  }

  async signInDemoUser(user) {
    try {
      // Входим с демо-аккаунтом
      await firebase.auth().signInWithEmailAndPassword(
        user.email,
        'demo123456'
      );
      
      console.log(`✅ Успешный вход: ${user.email}`);
      
      // Ждем готовности AuthManager с более надежной проверкой
      let attempts = 0;
      const maxAttempts = 100; // Увеличиваем время ожидания
      
      while (attempts < maxAttempts) {
        if (window.authManager && window.authManager.isInitialized) {
          console.log('✅ AuthManager готов');
          break;
        }
        console.log(`⏳ Ждем AuthManager (попытка ${attempts + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Обновляем UI только если AuthManager готов
      if (window.authManager && window.authManager.isInitialized && typeof window.authManager.updateAuthUI === 'function') {
        console.log('🔄 Обновляю UI через AuthManager');
        try {
          window.authManager.updateAuthUI(user);
        } catch (error) {
          console.error('❌ Ошибка при обновлении UI:', error);
        }
      } else {
        console.warn('⚠️ AuthManager не готов, UI обновится автоматически через onAuthStateChanged');
        console.log('🔍 Debug AuthManager:', {
          exists: !!window.authManager,
          initialized: window.authManager?.isInitialized,
          hasUpdateAuthUI: typeof window.authManager?.updateAuthUI,
          methods: window.authManager ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.authManager)) : 'N/A'
        });
      }
      
      // Устанавливаем текущую роль
      if (window.enhancedAuthSystem) {
        window.enhancedAuthSystem.currentRole = user.email.includes('candidate') ? 'candidate' : 
                                               user.email.includes('client') ? 'client' : 'agency';
        
        // Безопасно вызываем updateRoleSwitcher
        if (typeof window.enhancedAuthSystem.updateRoleSwitcher === 'function') {
          window.enhancedAuthSystem.updateRoleSwitcher();
        } else {
          console.warn('⚠️ updateRoleSwitcher не найден в enhancedAuthSystem');
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка входа в демо-аккаунт:', error);
      throw error;
    }
  }

  async handleMagicLink() {
    try {
      const email = document.getElementById('magicLinkEmail').value;
      
      if (!email) {
        this.showError('Введите email адрес');
        return;
      }

      this.showLoading('Отправляю Magic-Link...');
      
      // Отправляем Magic-Link через Firebase
      const actionCodeSettings = {
        url: window.location.origin + '/auth/confirm.html',
        handleCodeInApp: true
      };
      
      // Проверяем доступность метода
      if (typeof firebase.auth().sendSignInLinkToEmail !== 'function') {
        throw new Error('Firebase Auth не поддерживает Magic-Link в текущей версии');
      }
      
      const { error } = await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);

      if (error) {
        throw error;
      }

      // Сохраняем email в localStorage для подтверждения
      localStorage.setItem('emailForSignIn', email);
      
      this.showSuccess('Magic-Link отправлен! Проверьте почту');
      
      // Открываем почту в новой вкладке
      const mailtoLink = `mailto:${email}`;
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      console.error('Ошибка Magic-Link:', error);
      this.showError(this.getErrorMessage(error));
    }
  }

  redirectToDashboard(role) {
    const dashboards = {
      candidate: '/dashboard.html',
      client: '/employer-dashboard.html', 
      agency: '/agency-dashboard.html'
    };

    const dashboardUrl = dashboards[role];
    if (dashboardUrl) {
      // Добавляем параметр demo для отслеживания
      const url = new URL(dashboardUrl, window.location.origin);
      url.searchParams.set('demo', 'true');
      url.searchParams.set('role', role);
      
      window.location.href = url.toString();
    }
  }

  getRoleDisplayName(role) {
    const roleMap = {
      candidate: 'Соискатель',
      client: 'Работодатель', 
      agency: 'Агентство'
    };
    return roleMap[role] || 'Пользователь';
  }

  getErrorMessage(error) {
    const errorMessages = {
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-email': 'Неверный формат email',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
      'auth/email-already-in-use': 'Email уже используется'
    };
    
    return errorMessages[error.code] || error.message || 'Произошла ошибка. Попробуйте еще раз';
  }

  showDemoLoginModal() {
    document.getElementById('demoLoginModal').classList.remove('hidden');
  }

  hideDemoLoginModal() {
    document.getElementById('demoLoginModal').classList.add('hidden');
  }

  showLoading(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  }

  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <i class="ri-error-warning-line text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <i class="ri-check-circle-line text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}

// Глобальные функции
window.openDemoLoginModal = () => {
  if (window.demoLoginSystem) {
    window.demoLoginSystem.showDemoLoginModal();
  }
};

// Инициализация
window.demoLoginSystem = new DemoLoginSystem(); 