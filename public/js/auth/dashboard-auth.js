// 🎭 DashboardAuth - система аутентификации для дашбордов (v1.0.3)
// Обрабатывает проверку авторизации на страницах дашбордов

console.log('🎭 DashboardAuth: загружен для', window.location.pathname);

class DashboardAuth {
  constructor() {
    console.log('🎭 DashboardAuth: конструктор вызван');
    this.isInitialized = false;
    this.init();
  }

  init() {
    console.log('🎭 DashboardAuth: инициализация начата');
    
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupAuthCheck();
      });
    } else {
      this.setupAuthCheck();
    }
  }

  setupAuthCheck() {
    console.log('🎭 DashboardAuth: настройка проверки авторизации');
    
    // Проверяем авторизацию сразу
    this.checkAuth();

    // Подписываемся на изменения состояния авторизации
    if (window.authManager) {
      window.authManager.subscribe('default', (user) => {
        console.log('🎭 DashboardAuth: получено изменение состояния авторизации:', user ? user.uid : 'null');
        this.checkAuth();
      });
    } else {
      console.warn('🎭 DashboardAuth: AuthManager не найден, используем прямую проверку Firebase');
      // Fallback: прямая проверка Firebase Auth
      if (firebase && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
          console.log('🎭 DashboardAuth: Firebase Auth изменение состояния:', user ? user.uid : 'null');
          this.checkAuth();
        });
      }
    }
    
    this.isInitialized = true;
    console.log('🎭 DashboardAuth: инициализация завершена');
  }

  checkAuth() {
    console.log('🎭 DashboardAuth: проверка авторизации');
    
    // Получаем информацию о пользователе
    let user = window.authManager?.getCurrentUser();
    let profile = null; // getCurrentProfile не существует в новой версии

    // FALLBACK: Если AuthManager не работает, проверяем Firebase Auth напрямую
    if (!user && firebase && firebase.auth) {
      console.log('🎭 DashboardAuth: AuthManager не вернул пользователя, проверяем Firebase Auth напрямую');
      user = firebase.auth().currentUser;

      if (user) {
        console.log('🎭 DashboardAuth: пользователь найден через Firebase Auth напрямую:', user.uid);
        // Пытаемся получить профиль из Firestore
        firebase.firestore().collection('users').doc(user.uid).get()
          .then(userDoc => {
            profile = userDoc.data();
            console.log('🎭 DashboardAuth: профиль получен из Firestore:', profile);
            this.handleAuthenticatedUser(user, profile);
          })
          .catch(error => {
            console.warn('🎭 DashboardAuth: ошибка получения профиля из Firestore:', error);
            this.handleAuthenticatedUser(user, null);
          });
        return;
      }
    }

    // Если AuthManager вернул пользователя, но нет профиля
    if (user && !profile) {
      console.log('🎭 DashboardAuth: получаем профиль из Firestore для пользователя:', user.uid);
      firebase.firestore().collection('users').doc(user.uid).get()
        .then(userDoc => {
          profile = userDoc.data();
          console.log('🎭 DashboardAuth: профиль получен из Firestore:', profile);
          this.handleAuthenticatedUser(user, profile);
        })
        .catch(error => {
          console.warn('🎭 DashboardAuth: ошибка получения профиля из Firestore:', error);
          this.handleAuthenticatedUser(user, null);
        });
      return;
    }

    if (user) {
      console.log('🎭 DashboardAuth: пользователь авторизован:', user.uid);
      this.handleAuthenticatedUser(user, profile);
    } else {
      console.log('🎭 DashboardAuth: пользователь не авторизован');
      this.handleUnauthenticatedUser();
    }
  }

  handleAuthenticatedUser(user, profile) {
    console.log('🎭 DashboardAuth: обработка авторизованного пользователя:', user.uid);
    
    // Проверяем роль пользователя
    const userRole = profile?.role || 'candidate';
    const currentPath = window.location.pathname;
    
    console.log('🎭 DashboardAuth: роль пользователя:', userRole, 'текущий путь:', currentPath);
    
    // Проверяем соответствие роли и страницы
    const rolePages = {
      'candidate': '/dashboard.html',
      'employer': '/employer-dashboard.html',
      'agency': '/agency-dashboard.html'
    };
    
    const expectedPage = rolePages[userRole];
    
    if (expectedPage && currentPath !== expectedPage) {
      console.log('🎭 DashboardAuth: перенаправление на правильную страницу:', expectedPage);
      window.location.href = expectedPage;
      return;
    }
    
    console.log('🎭 DashboardAuth: пользователь на правильной странице');
    
    // Обновляем UI для авторизованного пользователя
    this.updateUIForAuthenticatedUser(user, profile);
  }

  handleUnauthenticatedUser() {
    console.log('🎭 DashboardAuth: пользователь не авторизован, проверяем демо и dev-пользователей');

    // FALLBACK: Проверяем Firebase Auth напрямую
    if (firebase && firebase.auth) {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        console.log('🎭 DashboardAuth: пользователь найден через Firebase Auth напрямую:', currentUser.uid);
        
        // Пытаемся получить профиль из Firestore
        firebase.firestore().collection('users').doc(currentUser.uid).get()
          .then(userDoc => {
            const profile = userDoc.data();
            console.log('🎭 DashboardAuth: профиль получен из Firestore:', profile);
            this.handleAuthenticatedUser(currentUser, profile);
          })
          .catch(error => {
            console.warn('🎭 DashboardAuth: ошибка получения профиля из Firestore:', error);
            this.handleAuthenticatedUser(currentUser, null);
          });
        return;
      }
    }

    // Проверяем демо и dev-пользователей по URL параметрам
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true';
    const isDev = urlParams.get('dev') === 'true';
    const role = urlParams.get('role');
    
    // Обрабатываем демо или dev-пользователей
    if (role && (isDemo || isDev)) {
      console.log('🎭 DashboardAuth: обнаружен демо/dev-пользователь с ролью:', role);
      // Создаем фиктивного пользователя для демо-входа
      const fakeUser = {
        uid: `demo-${Date.now()}`,
        email: `demo-${role}@workincz.cz`,
        isAnonymous: true
      };
      this.handleAuthenticatedUser(fakeUser, { role: role, isDemoAccount: true });
      return;
    }

    console.log('🎭 DashboardAuth: перенаправление на главную страницу');
    // Перенаправляем на главную страницу через 3 секунды
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }

  updateUIForAuthenticatedUser(user, profile) {
    console.log('🎭 DashboardAuth: обновление UI для авторизованного пользователя');
    
    // Скрываем элементы для неавторизованных пользователей
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // Показываем элементы для авторизованных пользователей
    const userElements = document.querySelectorAll('.user-only');
    userElements.forEach(el => {
      el.style.display = 'block';
    });
    
    // Обновляем информацию о пользователе
    if (profile) {
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = profile.name || profile.email || 'Пользователь';
      }
      
      const userRoleElement = document.getElementById('userRole');
      if (userRoleElement) {
    const roleNames = {
          'candidate': 'Соискатель',
          'employer': 'Работодатель',
          'agency': 'Агентство'
        };
        userRoleElement.textContent = roleNames[profile.role] || profile.role;
      }
    }
  }
}

// Автоматическая инициализация при загрузке страницы
console.log('🎭 DashboardAuth: автоматическая инициализация');
  window.dashboardAuth = new DashboardAuth();