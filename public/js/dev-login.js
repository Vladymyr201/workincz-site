// 🛠️ Dev Login - headless вход для разработки
class DevLogin {
  constructor() {
    this.devAccounts = {
      candidate: {
        email: 'dev-candidate@workincz.cz',
        password: 'dev123456',
        name: 'Dev Соискатель',
        role: 'candidate'
      },
      client: {
        email: 'dev-client@workincz.cz',
        password: 'dev123456', 
        name: 'Dev Работодатель',
        role: 'client'
      },
      agency: {
        email: 'dev-agency@workincz.cz',
        password: 'dev123456',
        name: 'Dev Агентство',
        role: 'agency'
      },
      admin: {
        email: 'dev-admin@workincz.cz',
        password: 'dev123456',
        name: 'Dev Админ',
        role: 'admin'
      }
    };
    
    this.init();
  }

  init() {
    // Создаем dev-панель только в режиме разработки
    if (this.isDevelopmentMode()) {
      this.createDevPanel();
      this.setupDevCommands();
      console.log('🛠️ DevLogin инициализирован');
    }
  }

  isDevelopmentMode() {
    // Проверяем режим разработки
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('dev') ||
           window.location.search.includes('dev=true');
  }

  createDevPanel() {
    const panelHTML = `
      <!-- Dev Panel -->
      <div id="devPanel" class="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg z-50 max-w-xs">
        <div class="p-3 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">🛠️ Dev Tools</h4>
            <button id="toggleDevPanel" class="text-gray-400 hover:text-white">
              <i class="ri-arrow-up-s-line"></i>
            </button>
          </div>
        </div>
        
        <div id="devPanelContent" class="p-3 space-y-2">
          <!-- Quick Login Buttons -->
          <div class="space-y-1">
            <p class="text-xs text-gray-400 mb-2">Быстрый вход:</p>
            <button onclick="devLogin.quickLogin('candidate')" class="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded">
              👤 Соискатель
            </button>
            <button onclick="devLogin.quickLogin('client')" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-2 rounded">
              🏢 Работодатель
            </button>
            <button onclick="devLogin.quickLogin('agency')" class="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
              👥 Агентство
            </button>
            <button onclick="devLogin.quickLogin('admin')" class="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">
              🔧 Админ
            </button>
          </div>
          
          <!-- Dev Commands -->
          <div class="border-t border-gray-700 pt-2 mt-2">
            <p class="text-xs text-gray-400 mb-2">Команды:</p>
            <button onclick="devLogin.createTestData()" class="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded mb-1">
              📊 Создать тестовые данные
            </button>
            <button onclick="devLogin.clearAllData()" class="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded mb-1">
              🗑️ Очистить данные
            </button>
            <button onclick="devLogin.logout()" class="w-full bg-gray-600 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded">
              🚪 Выйти
            </button>
          </div>
          
          <!-- Current User Info -->
          <div id="devUserInfo" class="border-t border-gray-700 pt-2 mt-2 hidden">
            <p class="text-xs text-gray-400 mb-1">Текущий пользователь:</p>
            <p id="devCurrentUser" class="text-xs text-white"></p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
    this.setupDevPanelEvents();
  }

  setupDevPanelEvents() {
    // Переключение панели
    document.getElementById('toggleDevPanel')?.addEventListener('click', () => {
      const content = document.getElementById('devPanelContent');
      const icon = document.querySelector('#toggleDevPanel i');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'ri-arrow-up-s-line';
      } else {
        content.style.display = 'none';
        icon.className = 'ri-arrow-down-s-line';
      }
    });

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D для показа/скрытия панели
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const panel = document.getElementById('devPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
      
      // Ctrl+Shift+1-4 для быстрого входа
      if (e.ctrlKey && e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const roles = ['candidate', 'client', 'agency', 'admin'];
        const roleIndex = parseInt(e.key) - 1;
        if (roles[roleIndex]) {
          this.quickLogin(roles[roleIndex]);
        }
      }
    });
  }

  setupDevCommands() {
    // Добавляем команды в консоль
    window.devLogin = this;
    
    // Глобальные функции для консоли
    window.devQuickLogin = (role) => this.quickLogin(role);
    window.devCreateData = () => this.createTestData();
    window.devClearData = () => this.clearAllData();
    window.devLogout = () => this.logout();
    
    console.log('🛠️ Dev команды доступны:');
    console.log('- devQuickLogin("candidate|client|agency|admin")');
    console.log('- devCreateData()');
    console.log('- devClearData()');
    console.log('- devLogout()');
    console.log('- Горячие клавиши: Ctrl+Shift+D (панель), Ctrl+Shift+1-4 (вход)');
  }

  async quickLogin(role) {
    try {
      const devAccount = this.devAccounts[role];
      if (!devAccount) {
        throw new Error(`Dev аккаунт для роли ${role} не найден`);
      }

      this.showDevMessage(`Вход как ${devAccount.name}...`);
      
      // Создаем или получаем dev-пользователя
      const user = await this.ensureDevUser(devAccount);
      
      // Входим в систему
      await this.signInDevUser(user);
      
      this.showDevMessage(`✅ Вход выполнен как ${devAccount.name}`);
      this.updateDevUserInfo();
      
      // Перенаправляем на соответствующий дашборд
      this.redirectToDashboard(role);
      
    } catch (error) {
      console.error('Ошибка dev-входа:', error);
      this.showDevError(`Ошибка входа: ${error.message}`);
    }
  }

  async ensureDevUser(devAccount) {
    try {
      // Пытаемся войти с существующим аккаунтом
      const userCredential = await firebase.auth().signInWithEmailAndPassword(
        devAccount.email,
        devAccount.password
      );
      
      // Если успешно, выходим и возвращаем пользователя
      await firebase.auth().signOut();
      return userCredential.user;
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Создаем нового dev-пользователя
        return await this.createDevUser(devAccount);
      }
      throw error;
    }
  }

  async createDevUser(devAccount) {
    // Создаем пользователя
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(
      devAccount.email,
      devAccount.password
    );

    // Создаем профиль в Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: devAccount.email,
      name: devAccount.name,
      role: devAccount.role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      isVerified: true,
      isPremium: true,
      isDevAccount: true,
      stats: this.getDevStats(devAccount.role),
      // Дополнительные поля для агентства
      ...(devAccount.role === 'agency' && {
        company: 'Dev Кадровое Агентство',
        license: 'DEV-LICENSE-001',
        specialization: 'general',
        rating: 4.9,
        reviews: []
      })
    };

    await firebase.firestore().collection('users').doc(userCredential.user.uid).set(userData);
    
    // Выходим из созданного аккаунта
    await firebase.auth().signOut();
    
    console.log(`✅ Создан dev-аккаунт: ${devAccount.name}`);
    return userCredential.user;
  }

  getDevStats(role) {
    const stats = {
      candidate: { applications: 15, savedJobs: 25, profileViews: 45 },
      client: { postedJobs: 12, receivedApplications: 67, activeContracts: 8 },
      agency: { completedContracts: 23, activeRequests: 5, rating: 4.9 },
      admin: { totalUsers: 150, totalJobs: 89, totalContracts: 34 }
    };
    return stats[role] || {};
  }

  async signInDevUser(user) {
    // Входим с dev-аккаунтом
    await firebase.auth().signInWithEmailAndPassword(
      user.email,
      'dev123456'
    );
    
    // Обновляем UI
    if (window.authManager) {
      if (window.authManager && typeof window.authManager.updateAuthUI === 'function') {
      window.authManager.updateAuthUI(user);
    }
    }
    
    // Устанавливаем текущую роль
    if (window.enhancedAuthSystem) {
      const role = user.email.includes('candidate') ? 'candidate' : 
                  user.email.includes('client') ? 'client' : 
                  user.email.includes('agency') ? 'agency' : 'admin';
      window.enhancedAuthSystem.currentRole = role;
      window.enhancedAuthSystem.updateRoleSwitcher();
    }
  }

  async createTestData() {
    try {
      this.showDevMessage('Создание тестовых данных...');
      
      // Создаем тестовые вакансии
      await this.createTestJobs();
      
      // Создаем тестовые заявки
      await this.createTestApplications();
      
      // Создаем тестовые чаты
      await this.createTestChats();
      
      this.showDevMessage('✅ Тестовые данные созданы');
      
    } catch (error) {
      console.error('Ошибка создания тестовых данных:', error);
      this.showDevError(`Ошибка: ${error.message}`);
    }
  }

  async createTestJobs() {
    const testJobs = [
      {
        title: 'Разработчик JavaScript',
        company: 'TechCorp',
        location: 'Прага',
        salary: '45000-65000 Kč',
        type: 'full-time',
        description: 'Ищем опытного JS разработчика...'
      },
      {
        title: 'Менеджер по продажам',
        company: 'SalesPro',
        location: 'Брно',
        salary: '35000-50000 Kč',
        type: 'full-time',
        description: 'Требуется менеджер по продажам...'
      }
    ];

    for (const job of testJobs) {
      await firebase.firestore().collection('jobs').add({
        ...job,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        employerId: 'dev-employer-id'
      });
    }
  }

  async createTestApplications() {
    const applications = [
      { jobId: 'test-job-1', candidateId: 'dev-candidate-id', status: 'pending' },
      { jobId: 'test-job-2', candidateId: 'dev-candidate-id', status: 'accepted' }
    ];

    for (const app of applications) {
      await firebase.firestore().collection('applications').add({
        ...app,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  async createTestChats() {
    const chats = [
      { participants: ['dev-candidate-id', 'dev-employer-id'], type: 'job-discussion' },
      { participants: ['dev-agency-id', 'dev-client-id'], type: 'contract-discussion' }
    ];

    for (const chat of chats) {
      await firebase.firestore().collection('chats').add({
        ...chat,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
    }
  }

  async clearAllData() {
    if (!confirm('⚠️ Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить!')) {
      return;
    }

    try {
      this.showDevMessage('Очистка данных...');
      
      // Удаляем все коллекции
      const collections = ['users', 'jobs', 'applications', 'chats', 'messages'];
      
      for (const collectionName of collections) {
        const snapshot = await firebase.firestore().collection(collectionName).get();
        const batch = firebase.firestore().batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      
      this.showDevMessage('✅ Все данные очищены');
      
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      this.showDevError(`Ошибка: ${error.message}`);
    }
  }

  async logout() {
    try {
      await firebase.auth().signOut();
      this.showDevMessage('✅ Выход выполнен');
      this.updateDevUserInfo();
      
      // Перенаправляем на главную
      window.location.href = '/';
      
    } catch (error) {
      console.error('Ошибка выхода:', error);
      this.showDevError(`Ошибка выхода: ${error.message}`);
    }
  }

  redirectToDashboard(role) {
    const dashboards = {
      candidate: '/dashboard.html',
      client: '/employer-dashboard.html',
      agency: '/agency-dashboard.html',
      admin: '/admin-dashboard.html'
    };

    const dashboardUrl = dashboards[role];
    if (dashboardUrl) {
      const url = new URL(dashboardUrl, window.location.origin);
      url.searchParams.set('dev', 'true');
      url.searchParams.set('role', role);
      
      window.location.href = url.toString();
    }
  }

  updateDevUserInfo() {
    const userInfo = document.getElementById('devUserInfo');
    const currentUser = document.getElementById('devCurrentUser');
    
    if (userInfo && currentUser) {
      const user = firebase.auth().currentUser;
      
      if (user) {
        userInfo.classList.remove('hidden');
        currentUser.textContent = `${user.email} (${this.getUserRole(user.email)})`;
      } else {
        userInfo.classList.add('hidden');
      }
    }
  }

  getUserRole(email) {
    if (email.includes('candidate')) return 'Соискатель';
    if (email.includes('client')) return 'Работодатель';
    if (email.includes('agency')) return 'Агентство';
    if (email.includes('admin')) return 'Админ';
    return 'Неизвестно';
  }

  showDevMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    toast.textContent = `🛠️ ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  }

  showDevError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
    toast.textContent = `🛠️ ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}

// Инициализация только в режиме разработки
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev') ||
    window.location.search.includes('dev=true')) {
  window.devLogin = new DevLogin();
} 