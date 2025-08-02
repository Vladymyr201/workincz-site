/**
 * 🔐 Auth Module - Улучшенная система аутентификации с Firebase
 * Версия: 1.0.0
 * Дата: 30.07.2025
 */
import { validateInput, processUserInput } from '../../utils/validation/index.js';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: "workincz-759c7.firebaseapp.com",
  databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "workincz-759c7",
  storageBucket: "workincz-759c7.firebasestorage.app",
  messagingSenderId: "670842817143",
  appId: "1:670842817143:web:d8998634da78318e9f1472",
  measurementId: "G-PB27XT0CT0"
};

class AuthManager {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.provider = null;
    this.currentUser = null;
    this.authStateUnsubscribe = null;
    this.tokenUnsubscribe = null;
    this.loginAttempts = 0;
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 минут
    this.lockoutUntil = 0;
    
    // Инициализация Firebase
    this.initializeFirebase();
  }

  initializeFirebase() {
    try {
      // Проверяем, инициализирован ли уже Firebase
      if (typeof firebase !== 'undefined') {
        this.app = firebase.app();
      } else {
        // Инициализируем Firebase
        this.app = firebase.initializeApp(firebaseConfig);
      }
      
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.provider = new firebase.auth.GoogleAuthProvider();
      
      // Настройка провайдера Google
      this.provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('✅ Firebase Auth инициализирован успешно');
      this.initializeAuthListeners();
    } catch (error) {
      console.error('❌ Ошибка инициализации Firebase:', error);
      this.showNotification('Ошибка инициализации системы авторизации', 'error');
    }
  }

  initializeAuthListeners() {
    // Отписываемся от предыдущих слушателей
    if (this.authStateUnsubscribe) this.authStateUnsubscribe();
    if (this.tokenUnsubscribe) this.tokenUnsubscribe();
    
    // Слушатель изменения состояния авторизации
    this.authStateUnsubscribe = this.auth.onAuthStateChanged(async (user) => {
      console.log('🔄 Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      this.currentUser = user;
      
      if (user) {
        // Пользователь авторизован
        console.log('👤 User ID:', user.uid);
        console.log('📧 User Email:', user.email);
        
        // Обновляем UI
        this.updateUI();
        
        // Создаем или обновляем профиль
        await this.createOrUpdateUserProfile(user);
        
        // Сбрасываем счетчик попыток входа
        this.resetLoginAttempts();
        
        // Если пользователь на странице авторизации
        if (window.location.pathname.includes('/auth/')) {
          this.showNotification('Вы уже авторизованы!', 'success');
        }
      } else {
        // Пользователь не авторизован
        this.updateUI();
      }
    });
    
    // Слушатель изменения токенов
    this.tokenUnsubscribe = this.auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          console.log('🔄 Token refreshed');
          // Сохраняем токен в localStorage для использования в API
          localStorage.setItem('authToken', token);
        } catch (error) {
          console.error('❌ Error refreshing token:', error);
        }
      } else {
        localStorage.removeItem('authToken');
      }
    });
  }

  async init() {
    console.log('🚀 Инициализация AuthManager...');
    
    // Загружаем сохраненные попытки входа
    this.loadLoginAttempts();
    
    // Проверяем блокировку
    if (this.isLockedOut()) {
      const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60);
      this.showNotification(`Слишком много попыток входа. Попробуйте через ${remainingTime} минут.`, 'warning');
    }
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
    
    console.log('✅ AuthManager инициализирован');
  }

  checkAuthStatus() {
    return this.currentUser !== null;
  }

  async register(userData) {
    try {
      // Валидация данных
      const validationResult = this.validateRegistrationData(userData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Обработка данных
      const processedData = this.processRegistrationData(userData);

      // Регистрация через Firebase
      const userCredential = await this.firebaseRegister(processedData);
      
      this.showNotification('Регистрация успешна!', 'success');
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      this.handleAuthError(error);
      return { success: false, error: error.message };
    }
  }

  async login(credentials) {
    try {
      // Проверяем блокировку
      if (this.isLockedOut()) {
        const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60);
        throw new Error(`Слишком много попыток входа. Попробуйте через ${remainingTime} минут.`);
      }

      // Валидация данных
      const validationResult = this.validateLoginData(credentials);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      // Обработка данных
      const processedData = this.processLoginData(credentials);

      // Вход через Firebase
      const userCredential = await this.firebaseLogin(processedData);
      
      this.showNotification('Вход выполнен успешно!', 'success');
      return { success: true, user: userCredential.user };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      this.incrementLoginAttempts();
      this.handleAuthError(error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.currentUser = null;
      localStorage.removeItem('authToken');
      this.showNotification('Выход выполнен успешно', 'info');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      this.showNotification('Ошибка при выходе', 'error');
      return { success: false, error: error.message };
    }
  }

  validateRegistrationData(data) {
    const errors = [];
    
    if (!data.email || !validateInput(data.email, 'email')) {
      errors.push('Неверный формат email');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    if (data.password !== data.confirmPassword) {
      errors.push('Пароли не совпадают');
    }
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateLoginData(data) {
    const errors = [];
    
    if (!data.email || !validateInput(data.email, 'email')) {
      errors.push('Неверный формат email');
    }
    
    if (!data.password || data.password.length < 1) {
      errors.push('Введите пароль');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  processRegistrationData(data) {
    return {
      email: processUserInput(data.email, 'email'),
      password: data.password,
      name: processUserInput(data.name, 'text'),
      role: data.role || 'user'
    };
  }

  processLoginData(data) {
    return {
      email: processUserInput(data.email, 'email'),
      password: data.password
    };
  }

  isLockedOut() {
    return Date.now() < this.lockoutUntil;
  }

  incrementLoginAttempts() {
    this.loginAttempts++;
    this.storeLoginAttempts();
    
    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.lockoutUntil = Date.now() + this.lockoutDuration;
      localStorage.setItem('lockoutUntil', this.lockoutUntil.toString());
      this.showNotification('Слишком много попыток входа. Попробуйте через 15 минут.', 'warning');
    }
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockoutUntil = 0;
    this.clearLoginAttempts();
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  storeUserData(user, token) {
    localStorage.setItem('userData', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));
    localStorage.setItem('authToken', token);
  }

  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  getStoredUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  clearStoredData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
  }

  storeLoginAttempts() {
    localStorage.setItem('loginAttempts', this.loginAttempts.toString());
  }

  clearLoginAttempts() {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutUntil');
  }

  loadLoginAttempts() {
    const attempts = localStorage.getItem('loginAttempts');
    const lockoutUntil = localStorage.getItem('lockoutUntil');
    
    if (attempts) {
      this.loginAttempts = parseInt(attempts);
    }
    
    if (lockoutUntil) {
      this.lockoutUntil = parseInt(lockoutUntil);
    }
  }

  updateUI() {
    const user = this.currentUser;
    
    // Обновляем элементы навигации
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(element => {
      if (user) {
        element.style.display = element.dataset.auth === 'logged-in' ? 'block' : 'none';
      } else {
        element.style.display = element.dataset.auth === 'logged-out' ? 'block' : 'none';
      }
    });
    
    // Обновляем информацию о пользователе
    const userInfoElements = document.querySelectorAll('[data-user-info]');
    userInfoElements.forEach(element => {
      const field = element.dataset.userInfo;
      if (user && user[field]) {
        element.textContent = user[field];
      } else {
        element.textContent = '';
      }
    });
    
    // Обновляем аватар
    const avatarElements = document.querySelectorAll('[data-user-avatar]');
    avatarElements.forEach(element => {
      if (user && user.photoURL) {
        element.src = user.photoURL;
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

  setupEventListeners() {
    // Обработчики форм авторизации
    document.addEventListener('submit', async (event) => {
      if (event.target.matches('[data-auth-form]')) {
        event.preventDefault();
        await this.handleAuthForm(event.target);
      }
    });
    
    // Обработчики кнопок
    document.addEventListener('click', async (event) => {
      if (event.target.matches('[data-auth-action]')) {
        event.preventDefault();
        const action = event.target.dataset.authAction;
        
        switch (action) {
          case 'login':
            await this.handleLoginClick();
            break;
          case 'logout':
            await this.logout();
            break;
          case 'register':
            await this.handleRegisterClick();
            break;
          case 'google':
            await this.loginWithGoogle();
            break;
        }
      }
    });
  }

  async handleAuthForm(form) {
    const formData = new FormData(form);
    const action = form.dataset.authForm;
    
    try {
      let result;
      
      if (action === 'login') {
        result = await this.login({
          email: formData.get('email'),
          password: formData.get('password')
        });
      } else if (action === 'register') {
        result = await this.register({
          email: formData.get('email'),
          password: formData.get('password'),
          confirmPassword: formData.get('confirmPassword'),
          name: formData.get('name'),
          role: formData.get('role')
        });
      }
      
      if (result.success) {
        this.showAuthResult(result);
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      this.showNotification('Ошибка при отправке формы', 'error');
    }
  }

  async handleLoginClick() {
    // Логика для кнопки входа
    console.log('🔑 Login button clicked');
  }

  async handleRegisterClick() {
    // Логика для кнопки регистрации
    console.log('📝 Register button clicked');
  }

  async loginWithGoogle() {
    try {
      const result = await this.auth.signInWithPopup(this.provider);
      this.showNotification('Вход через Google выполнен успешно!', 'success');
      return { success: true, user: result.user };
    } catch (error) {
      console.error('❌ Google login error:', error);
      this.handleAuthError(error);
      return { success: false, error: error.message };
    }
  }

  showAuthResult(result) {
    if (result.success) {
      this.showNotification('Операция выполнена успешно!', 'success');
      // Перенаправление или обновление страницы
      if (window.location.pathname.includes('/auth/')) {
        window.location.href = '/dashboard.html';
      }
    } else {
      this.showNotification(result.error, 'error');
    }
  }

  handleAuthError(error) {
    console.error('❌ Auth Error:', error.code, error.message);
    
    const errorMessages = {
      'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету.',
      'auth/operation-not-allowed': 'Данный метод входа отключен. Обратитесь к администратору.',
      'auth/user-not-found': 'Пользователь не найден. Проверьте email.',
      'auth/wrong-password': 'Неверный пароль.',
      'auth/email-already-in-use': 'Email уже используется.',
      'auth/weak-password': 'Пароль слишком слабый. Минимум 6 символов.',
      'auth/invalid-email': 'Неверный формат email.',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
      'auth/user-disabled': 'Аккаунт заблокирован.',
      'auth/popup-closed-by-user': 'Окно авторизации было закрыто.',
      'auth/cancelled-popup-request': 'Запрос авторизации был отменен.',
      'auth/popup-blocked': 'Всплывающее окно заблокировано браузером.',
      'auth/account-exists-with-different-credential': 'Аккаунт уже существует с другими данными.',
      'auth/requires-recent-login': 'Требуется повторная авторизация.',
      'auth/id-token-expired': 'Сессия истекла. Войдите снова.',
      'auth/id-token-revoked': 'Сессия отозвана. Войдите снова.'
    };
    
    const message = errorMessages[error.code] || `Ошибка авторизации: ${error.message}`;
    this.showNotification(message, 'error');
    
    return error;
  }

  async createOrUpdateUserProfile(user) {
    try {
      const userRef = this.db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        // Создаем новый профиль
        await userRef.set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
        console.log('✅ Новый профиль пользователя создан');
      } else {
        // Обновляем время последнего входа
        await userRef.update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          displayName: user.displayName || userDoc.data().displayName,
          photoURL: user.photoURL || userDoc.data().photoURL
        });
        console.log('✅ Профиль пользователя обновлен');
      }
    } catch (error) {
      console.error('❌ Error creating/updating user profile:', error);
    }
  }

  showNotification(message, type = 'info') {
    // Используем существующую систему уведомлений или создаем простую
    if (window.showToast) {
      window.showToast({ message, type });
    } else {
      // Простое уведомление
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }

  // Firebase методы
  async firebaseRegister(data) {
    return await this.auth.createUserWithEmailAndPassword(data.email, data.password);
  }

  async firebaseLogin(credentials) {
    return await this.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  // Геттеры
  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  async getUserRole() {
    if (!this.currentUser) return null;
    
    try {
      const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
      return userDoc.exists ? userDoc.data().role : 'user';
    } catch (error) {
      console.error('❌ Error getting user role:', error);
      return 'user';
    }
  }

  async getAuthToken() {
    if (!this.currentUser) return null;
    
    try {
      return await this.currentUser.getIdToken(true);
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }
}

const authManager = new AuthManager();
export default authManager;
export { AuthManager }; 