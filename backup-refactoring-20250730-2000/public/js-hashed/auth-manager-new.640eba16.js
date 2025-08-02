// 🔐 AuthManager - единый менеджер аутентификации (v1.0.4)
// Централизует все подписки на onAuthStateChanged

class AuthManager {
  constructor() {
    this.unsubscribe = null;
    this.isInitialized = false;
    this.currentUser = null;
    this.handlers = new Map();
    this.DEFAULT_TIMEOUT = 300000; // Увеличиваем таймаут до 5 минут для предотвращения прерывания сессии
    
    console.log('[AuthManager] v1.0.4 инициализирован');
    
    // Автоматическая инициализация при создании
    this.init().catch(error => {
      console.error('[AuthManager] Ошибка автоматической инициализации:', error);
    });
  }

  // Инициализация Firebase Auth
  async init() {
    if (this.isInitialized) {
      console.log('[AuthManager] уже инициализирован');
      return;
    }

    try {
      console.log('[AuthManager] Начало инициализации...');
      
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase не загружен');
      }
      console.log('[AuthManager] Firebase SDK доступен');

      this.auth = firebase.auth();
      console.log('[AuthManager] Firebase Auth подключен');
      
      // Проверяем, что auth действительно работает
      if (!this.auth) {
        throw new Error('Firebase Auth не инициализирован');
      }
      console.log('[AuthManager] Firebase Auth проверен');
      
      this.isInitialized = true;
      console.log('[AuthManager] инициализация завершена');
      
      // Устанавливаем флаг готовности для AppInitializer
      this.ready = true;
      console.log('[AuthManager] флаг ready установлен');
      
    } catch (error) {
      console.error('[AuthManager] Ошибка инициализации:', error);
      throw error;
    }
  }

  // Подписка на изменения состояния аутентификации
  async subscribe(options = {}) {
    if (!this.isInitialized) {
      console.error('[AuthManager] Не инициализирован!');
      return;
    }

    const {
      onLoggedIn = () => {},
      onLoggedOut = () => {},
      timeout = this.DEFAULT_TIMEOUT,
      id = 'default'
    } = options;

    console.log(`[AuthManager] Подписка ${id} с таймаутом ${timeout}ms`);

    // Отписываемся от предыдущей подписки
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    let handled = false;
    let timeoutId = null;

    // Проверяем URL параметры для демо-входа
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true';
    const demoRole = urlParams.get('role');
    
    if (isDemo && demoRole) {
      console.log(`[AuthManager] ${id}: обнаружен демо-вход с ролью ${demoRole}`);
      // Для демо-входа создаем анонимного пользователя
      try {
                      const anonymousUser = await firebase.auth().signInAnonymously();
        console.log(`[AuthManager] ${id}: анонимный пользователь создан`);
        handled = true;
        this.currentUser = anonymousUser.user;
        onLoggedIn(anonymousUser.user);
        return;
      } catch (error) {
        console.warn(`[AuthManager] ${id}: ошибка создания анонимного пользователя:`, error);
        // Продолжаем с обычной логикой
      }
    }

    // Устанавливаем таймаут
    timeoutId = setTimeout(() => {
      if (!handled) {
        console.log(`[AuthManager] ${id}: таймаут вышел, считаем user = null`);
        handled = true;
        onLoggedOut();
        this.unsubscribe();
      }
    }, timeout);

    // Подписываемся на изменения состояния
    this.unsubscribe = this.auth.onAuthStateChanged((user) => {
      console.log(`[AuthManager] ${id}: onAuthStateChanged →`, user?.email || 'Выход');
      
      if (user && !handled) {
        handled = true;
        clearTimeout(timeoutId);
        this.currentUser = user;
        console.log(`[AuthManager] ${id}: пользователь авторизован`, user.email);
        onLoggedIn(user);
      } else if (!user && !handled) {
        // Проверяем демо-авторизацию в localStorage еще раз (на случай если она появилась после инициализации)
        const demoAuth = this.checkDemoAuth();
        if (demoAuth) {
          console.log(`[AuthManager] ${id}: обнаружена демо-авторизация для ${demoAuth.email}`);
          handled = true;
          clearTimeout(timeoutId);
          this.currentUser = demoAuth;
          onLoggedIn(demoAuth);
        } else {
          // Не вызываем onLoggedOut сразу, ждем таймаут
          console.log(`[AuthManager] ${id}: пользователь не авторизован, ждем таймаут`);
        }
      }
    });

    // Сохраняем обработчики для возможности отписки
    this.handlers.set(id, {
      onLoggedIn,
      onLoggedOut,
      timeoutId,
      handled
    });

    return () => this.unsubscribe(id);
  }

  // Отписка от конкретной подписки
  unsubscribe(id = 'default') {
    const handler = this.handlers.get(id);
    if (handler) {
      if (handler.timeoutId) {
        clearTimeout(handler.timeoutId);
      }
      this.handlers.delete(id);
      console.log(`[AuthManager] Отписка ${id} выполнена`);
    }

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.currentUser || this.auth?.currentUser;
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  // Выход
  async signOut() {
    if (this.auth) {
      await this.auth.signOut();
      this.currentUser = null;
      console.log('[AuthManager] Выход выполнен');
    }
    // Очищаем демо-авторизацию при выходе
    localStorage.removeItem('demoAuth');
  }

  // Проверка демо-авторизации в localStorage
  checkDemoAuth() {
    try {
      const demoAuthStr = localStorage.getItem('demoAuth');
      if (!demoAuthStr) return null;

      const demoAuth = JSON.parse(demoAuthStr);
      
      // Проверяем, что демо-авторизация не устарела (24 часа)
      const now = Date.now();
      const authAge = now - demoAuth.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 часа
      
      if (authAge > maxAge) {
        console.log('[AuthManager] Демо-авторизация устарела, очищаем');
        localStorage.removeItem('demoAuth');
        return null;
      }

      console.log(`[AuthManager] Восстанавливаем демо-авторизацию: ${demoAuth.email}`);
      return demoAuth;
    } catch (error) {
      console.error('[AuthManager] Ошибка проверки демо-авторизации:', error);
      localStorage.removeItem('demoAuth');
      return null;
    }
  }
}

// Создаем глобальный экземпляр
window.authManager = new AuthManager();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
} 