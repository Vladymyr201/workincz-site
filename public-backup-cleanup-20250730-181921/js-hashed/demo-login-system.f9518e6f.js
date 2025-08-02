// 🚀 Demo Login System - Firebase Anonymous Auth (лучшие практики)
class DemoLoginSystem {
  constructor() {
    this.roles = [
      { key: 'candidate', label: 'Соискатель', icon: 'ri-user-line', color: 'primary' },
      { key: 'client', label: 'Работодатель', icon: 'ri-building-line', color: 'secondary' },
      { key: 'agency', label: 'Агентство', icon: 'ri-team-line', color: 'success' }
    ];
    
    this.demoData = {
      candidate: {
        name: 'Демо Соискатель',
        role: 'candidate',
        stats: { applications: 5, savedJobs: 12, profileViews: 23 },
        profile: {
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '3 года',
          location: 'Прага'
        }
      },
      client: {
        name: 'Демо Работодатель',
        role: 'client',
        stats: { postedJobs: 8, activeCandidates: 45, completedHires: 12 },
        profile: {
          company: 'TechCorp CZ',
          industry: 'IT',
          location: 'Прага'
        }
      },
      agency: {
        name: 'Демо Агентство',
        role: 'agency',
        stats: { activeRequests: 15, completedContracts: 28, totalRevenue: 125000 },
        profile: {
          agency: 'StaffPro Agency',
          specializations: ['IT', 'Строительство', 'Логистика'],
          location: 'Брно'
        }
      }
    };
    
    this.isInitialized = false;
    
    console.log('✅ Firebase проверен, создаю DemoLoginSystem...');
    this.init();
  }

  async init() {
    try {
      // Ждем загрузки DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.createDemoLoginModal());
      } else {
        this.createDemoLoginModal();
      }
      
      this.isInitialized = true;
      console.log('🚀 DemoLoginSystem инициализирован');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации DemoLoginSystem:', error);
    }
  }

  createDemoLoginModal() {
    console.log('✅ DOM полностью загружен, создаю модал...');
    
    // Проверяем, не создан ли уже модал
    if (document.getElementById('demoLoginModal')) {
      return;
    }

    // Проверяем, не находимся ли на тестовой странице
    if (window.location.pathname === '/test-demo-fix.html') {
      console.log('🔍 На тестовой странице, модал не создается');
      return;
    }

    console.log('🆕 Создаю Demo модал...');
    
    const modal = document.createElement('div');
    modal.id = 'demoLoginModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">🚀 Демо-вход</h3>
          <button class="text-gray-500 hover:text-gray-700 text-2xl" onclick="this.closest('#demoLoginModal').classList.add('hidden')">×</button>
        </div>
        
        <p class="text-gray-600 mb-6">Выберите роль для демо-входа в личный кабинет:</p>
        
        <div class="space-y-3">
          ${this.roles.map(role => `
            <button 
              class="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
              onclick="window.demoLoginSystem?.signInAsRole('${role.key}')"
            >
              <i class="${role.icon} text-xl text-${role.color}-600"></i>
              <div>
                <div class="font-medium">${role.label}</div>
                <div class="text-sm text-gray-500">Демо-аккаунт с тестовыми данными</div>
              </div>
            </button>
          `).join('')}
        </div>
        
        <div class="mt-4 text-sm text-gray-500">
          💡 Демо-аккаунты создаются автоматически и содержат тестовые данные
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик для кнопки демо-входа
    const demoButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('🚀 Демо-вход'));
    
    if (demoButton) {
      demoButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }
  }

  async signInAsRole(role) {
    try {
      console.log(`🔐 Начинаю демо-вход для роли: ${role}`);
      
      // Показываем индикатор загрузки
      this.showLoading();
      
      // Создаем демо-пользователя
      const user = await this.createDemoUser(role);
      
      if (!user) {
        throw new Error('Не удалось создать демо-пользователя');
      }
      
      console.log(`✅ Демо-пользователь создан: ${user.uid}`);
      
      // Создаем профиль в Firestore
      await this.createDemoProfile(user, role);
      
      // Перенаправляем на соответствующий дашборд
      this.redirectToDashboard(role);
      
    } catch (error) {
      console.error('❌ Ошибка Demo-входа:', error);
      this.showError('Произошла ошибка. Попробуйте еще раз.');
    }
  }

  async createDemoUser(role) {
    try {
      console.log('🔐 Создаю демо-пользователя...');
      
      // Проверяем, что Firebase Auth доступен
      if (!firebase || !firebase.auth) {
        throw new Error('Firebase Auth не доступен');
      }
      
      // Используем правильный синтаксис для текущей версии Firebase
      const auth = firebase.auth();
      
      // Создаем анонимного пользователя
      const userCredential = await firebase.auth().signInAnonymously();
      const user = userCredential.user;
      
      console.log('✅ Анонимный пользователь создан:', user.uid);
      return user;
      
    } catch (error) {
      console.error('❌ Ошибка создания анонимного пользователя:', error);
      
      // Fallback: создаем пользователя с email/password
      try {
        const email = `demo-${role}@workincz.cz`;
        const password = 'demo123456';
        
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Демо-пользователь создан через email/password:', user.uid);
        return user;
        
      } catch (fallbackError) {
        console.error('❌ Ошибка fallback создания пользователя:', fallbackError);
        throw error;
      }
    }
  }

  async createDemoProfile(user, role) {
    try {
      console.log('📝 Создаю демо-профиль в Firestore...');
      
      const profileData = {
        ...this.demoData[role],
        uid: user.uid,
        isDemoAccount: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Сохраняем профиль в Firestore
      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .set(profileData);
      
      console.log('✅ Демо-профиль создан в Firestore');
      
    } catch (error) {
      console.error('❌ Ошибка создания демо-профиля:', error);
      // Не прерываем процесс, если профиль не создался
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
      const url = new URL(dashboardUrl, window.location.origin);
      url.searchParams.set('demo', 'true');
      url.searchParams.set('role', role);
      url.searchParams.set('timestamp', Date.now().toString());
      
      console.log(`🚀 Перенаправление на: ${url.toString()}`);
      
      // Добавляем небольшую задержку для стабилизации состояния
      setTimeout(() => {
        window.location.href = url.toString();
      }, 500);
    } else {
      console.error(`❌ Неизвестная роль: ${role}`);
    }
  }

  showLoading() {
    // Показываем индикатор загрузки
    const modal = document.getElementById('demoLoginModal');
    if (modal) {
      const content = modal.querySelector('.bg-white');
      content.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Создание демо-аккаунта...</p>
        </div>
      `;
    }
  }

  showError(message) {
    // Показываем ошибку
    const modal = document.getElementById('demoLoginModal');
    if (modal) {
      const content = modal.querySelector('.bg-white');
      content.innerHTML = `
        <div class="text-center py-8">
          <div class="text-red-500 text-4xl mb-4">❌</div>
          <p class="text-red-600 mb-4">${message}</p>
          <button 
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onclick="window.demoLoginSystem?.createDemoLoginModal()"
          >
            Попробовать снова
          </button>
        </div>
      `;
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем, что Firebase доступен
  if (typeof firebase !== 'undefined' && firebase.auth) {
    window.demoLoginSystem = new DemoLoginSystem();
  } else {
    console.warn('⚠️ Firebase не загружен, DemoLoginSystem не инициализирован');
  }
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoLoginSystem;
} 