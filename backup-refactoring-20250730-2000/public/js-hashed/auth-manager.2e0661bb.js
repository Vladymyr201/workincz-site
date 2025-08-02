// 🔐 AuthManager - единый менеджер аутентификации (v1.0.5)
// Поддержка Firebase Anonymous Auth и демо-пользователей

class AuthManager {
  constructor() {
    this.unsubscribe = null;
    this.isInitialized = false;
    this.currentUser = null;
    this.currentProfile = null;
    this.handlers = new Map();
    this.DEFAULT_TIMEOUT = 300000; // Увеличиваем таймаут до 5 минут для предотвращения прерывания сессии
    
    console.log('[AuthManager] v1.0.5 инициализирован');
    
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
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase не загружен');
      }

      this.auth = firebase.auth();
      this.firestore = firebase.firestore();
      console.log('[AuthManager] Firebase Auth и Firestore подключены');
      
      this.isInitialized = true;
      console.log('[AuthManager] инициализация завершена');
    } catch (error) {
      console.error('[AuthManager] Ошибка инициализации:', error);
      throw error;
    }
  }

  // Подписка на изменения состояния аутентификации
  subscribe(options = {}) {
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
    this.unsubscribe = this.auth.onAuthStateChanged(async (user) => {
      console.log(`[AuthManager] ${id}: onAuthStateChanged →`, user?.uid || 'Выход');
      
      if (user && !handled) {
        handled = true;
        clearTimeout(timeoutId);
        
        try {
          // Получаем профиль пользователя из Firestore
          const profile = await this.getUserProfile(user.uid);
          
          this.currentUser = user;
          this.currentProfile = profile;
          
          console.log(`[AuthManager] ${id}: пользователь авторизован`, {
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            role: profile?.role || 'unknown'
          });
          
          onLoggedIn(user, profile);
        } catch (error) {
          console.error('[AuthManager] Ошибка получения профиля:', error);
          // Даже если профиль не получен, считаем пользователя авторизованным
          this.currentUser = user;
          onLoggedIn(user, null);
        }
      } else if (!user && !handled) {
        handled = true;
        clearTimeout(timeoutId);
        this.currentUser = null;
        this.currentProfile = null;
        console.log(`[AuthManager] ${id}: пользователь вышел`);
        onLoggedOut();
      }
    });
  }

  // Получение профиля пользователя из Firestore
  async getUserProfile(uid) {
    try {
      const doc = await this.firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error('[AuthManager] Ошибка получения профиля:', error);
      return null;
    }
  }

  // Установка пользователя (для демо-системы)
  setUser(user, profile) {
    this.currentUser = user;
    this.currentProfile = profile;
    console.log('[AuthManager] Пользователь установлен:', {
      uid: user?.uid,
      role: profile?.role,
      isDemo: profile?.isDemoAccount
    });
  }

  // Отписка от изменений
  unsubscribe(id = 'default') {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log(`[AuthManager] Отписка ${id} выполнена`);
    }
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

  // Проверка демо-пользователя
  isDemoUser() {
    return this.currentProfile?.isDemoAccount || false;
  }

  // Проверка анонимного пользователя
  isAnonymousUser() {
    return this.currentUser?.isAnonymous || false;
  }

  // Выход из системы
  async signOut() {
    try {
      if (this.currentUser) {
        await this.auth.signOut();
        this.currentUser = null;
        this.currentProfile = null;
        console.log('[AuthManager] Выход выполнен');
      }
    } catch (error) {
      console.error('[AuthManager] Ошибка выхода:', error);
      throw error;
    }
  }
}

// Глобальный экземпляр
window.authManager = new AuthManager(); 