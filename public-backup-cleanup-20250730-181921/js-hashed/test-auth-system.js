// 🔐 Простая система аутентификации для тестовых аккаунтов
// Поддержка быстрого переключения между ролями

class TestAuthSystem {
  constructor() {
    this.auth = null;
    this.firestore = null;
    this.currentUser = null;
    this.currentProfile = null;
    this.isInitialized = false;
    
    console.log('[TestAuthSystem] Инициализация...');
    this.init();
  }

  // Инициализация Firebase
  async init() {
    try {
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase не загружен');
      }

      this.auth = firebase.auth();
      this.firestore = firebase.firestore();
      this.isInitialized = true;
      
      console.log('[TestAuthSystem] Firebase подключен');
      
      // Подписываемся на изменения состояния аутентификации
      this.auth.onAuthStateChanged(async (user) => {
        if (user) {
          console.log(`[TestAuthSystem] Пользователь авторизован: ${user.email}`);
          this.currentUser = user;
          await this.loadUserProfile(user.uid);
        } else {
          console.log('[TestAuthSystem] Пользователь вышел');
          this.currentUser = null;
          this.currentProfile = null;
        }
      });
      
    } catch (error) {
      console.error('[TestAuthSystem] Ошибка инициализации:', error);
    }
  }

  // Загрузка профиля пользователя
  async loadUserProfile(uid) {
    try {
      const doc = await this.firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        this.currentProfile = doc.data();
        console.log(`[TestAuthSystem] Профиль загружен: ${this.currentProfile.role}`);
      }
    } catch (error) {
      console.error('[TestAuthSystem] Ошибка загрузки профиля:', error);
    }
  }

  // Простой вход по email/password
  async signIn(email, password) {
    if (!this.isInitialized) {
      throw new Error('Система не инициализирована');
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      console.log(`[TestAuthSystem] Успешный вход: ${userCredential.user.email}`);
      return userCredential.user;
    } catch (error) {
      console.error('[TestAuthSystem] Ошибка входа:', error);
      throw error;
    }
  }

  // Выход
  async signOut() {
    if (!this.isInitialized) return;
    
    try {
      await this.auth.signOut();
      console.log('[TestAuthSystem] Выход выполнен');
    } catch (error) {
      console.error('[TestAuthSystem] Ошибка выхода:', error);
    }
  }

  // Переключение роли
  async switchRole(email) {
    const password = 'test1234'; // Общий пароль для всех тестовых аккаунтов
    
    try {
      // Сначала выходим
      await this.signOut();
      
      // Ждём немного для завершения выхода
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Входим под новой ролью
      const user = await this.signIn(email, password);
      
      // Определяем роль из email
      const role = email.split('@')[0].split('-')[1];
      
      console.log(`[TestAuthSystem] Переключение на роль: ${role}`);
      
      // Перенаправляем на соответствующий дашборд
      this.redirectToDashboard(role);
      
      return user;
    } catch (error) {
      console.error('[TestAuthSystem] Ошибка переключения роли:', error);
      throw error;
    }
  }

  // Перенаправление на дашборд
  redirectToDashboard(role) {
    const dashboards = {
      'candidate': '/dashboard.html',
      'employer': '/employer-dashboard.html', 
      'agency': '/agency-dashboard.html',
      'admin': '/admin-dashboard.html'
    };
    
    const dashboard = dashboards[role] || '/dashboard.html';
    console.log(`[TestAuthSystem] Перенаправление на: ${dashboard}`);
    
    // Добавляем параметр роли в URL
    const url = new URL(dashboard, window.location.origin);
    url.searchParams.set('role', role);
    
    window.location.href = url.toString();
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.currentUser;
  }

  // Получение текущего профиля
  getCurrentProfile() {
    return this.currentProfile;
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Получение роли
  getCurrentRole() {
    return this.currentProfile?.role || 'unknown';
  }
}

// Создаём глобальный экземпляр
window.testAuthSystem = new TestAuthSystem(); 