// Простой AuthManager
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('AuthManager инициализируется...');
    
    if (typeof firebase === 'undefined') {
      console.log('Firebase не загружен, ожидаем...');
      return;
    }

    try {
      this.db = firebase.firestore();
      this.auth = firebase.auth();
      
      console.log('AuthManager инициализирован успешно');
      this.isInitialized = true;
      
      // Проверяем, что методы доступны
      console.log('🔍 AuthManager методы:', {
        hasUpdateAuthUI: typeof this.updateAuthUI,
        hasWaitForReady: typeof this.waitForReady,
        hasSubscribe: typeof this.subscribe
      });
      
      // Слушатель аутентификации
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        console.log('Изменение состояния аутентификации:', user?.email || 'Выход');
        this.updateAuthUI(user);
      });
      
    } catch (error) {
      console.error('Ошибка инициализации AuthManager:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isReady() {
    return this.isInitialized;
  }

  // Обновление UI после изменения аутентификации
  updateAuthUI(user) {
    this.currentUser = user;
    console.log('AuthManager: UI обновлен для пользователя:', user?.email || 'Выход');
    
    // Уведомляем другие системы об изменении пользователя
    if (window.jobsManager) {
      window.jobsManager.currentUser = user;
    }
    
    // Обновляем UI элементы
    this.updateLoginButtons(user);
  }

  // Обновление кнопок входа/выхода
  updateLoginButtons(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    
    if (user) {
      // Пользователь вошел
      if (loginBtn) {
        loginBtn.textContent = 'Личный кабинет';
        loginBtn.onclick = () => window.location.href = '/dashboard.html';
      }
      if (registerBtn) {
        registerBtn.textContent = 'Выйти';
        registerBtn.onclick = () => this.signOut();
      }
      if (demoLoginBtn) {
        demoLoginBtn.style.display = 'none';
      }
    } else {
      // Пользователь вышел
      if (loginBtn) {
        loginBtn.textContent = 'Войти';
        loginBtn.onclick = () => {
          if (window.enhancedAuthSystem) {
            window.enhancedAuthSystem.showEnhancedLoginModal();
          }
        };
      }
      if (registerBtn) {
        registerBtn.textContent = 'Регистрация';
        registerBtn.onclick = () => {
          if (window.registrationSystem) {
            window.registrationSystem.showRegistrationModal();
          }
        };
      }
      if (demoLoginBtn) {
        demoLoginBtn.style.display = 'inline-block';
      }
    }
  }

  // Выход из системы
  async signOut() {
    try {
      await this.auth.signOut();
      console.log('Пользователь вышел из системы');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  }

  // Ожидание готовности системы
  async waitForReady() {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return true;
  }

  // Подписка на изменения аутентификации
  subscribe(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Получение данных пользователя из Firestore
  getUserData(userId) {
    // В демо-режиме возвращаем базовые данные
    return {
      role: 'candidate',
      fullName: 'Demo User',
      email: 'demo@workincz.cz'
    };
  }
}

// Экспорт класса
window.AuthManager = AuthManager; 