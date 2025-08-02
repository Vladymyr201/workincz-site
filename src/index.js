/**
 * 🚀 WorkInCZ Application - Главное приложение
 * Версия: 2.0.0
 * Дата: 30.07.2025
 * Интеграция: Firebase + Модульная архитектура
 */
import authManager from './modules/auth/index.js';
import jobsManager from './modules/jobs/index.js';
import { validateInput, sanitizeHTML } from './utils/validation/index.js';

class WorkInCZApp {
  constructor() {
    this.modules = new Map();
    this.config = {
      version: '2.0.0',
      environment: 'production',
      debug: false
    };
    
    // Пользовательские настройки
    this.userPreferences = this.loadUserPreferences();
    
    // Состояние приложения
    this.state = {
      isInitialized: false,
      currentUser: null,
      currentPage: 'home',
      isLoading: false
    };
    
    // Система событий
    this.eventListeners = new Map();
    
    console.log('🚀 WorkInCZ Application инициализируется...');
  }

  async init() {
    try {
      console.log('🔄 Инициализация приложения...');
      
      // Инициализируем модули
      await this.initializeModules();
      
      // Настраиваем обработчики событий
      this.setupEventListeners();
      
      // Загружаем начальные данные
      await this.loadInitialData();
      
      // Обновляем UI
      this.updateUI();
      
      // Показываем уведомление о готовности
      this.showReadyNotification();
      
      this.state.isInitialized = true;
      console.log('✅ WorkInCZ Application инициализировано успешно');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации приложения:', error);
      this.handleError(error);
    }
  }

  async initializeModules() {
    console.log('📦 Инициализация модулей...');
    
    try {
      // Инициализируем AuthManager
      await authManager.init();
      this.modules.set('auth', authManager);
      console.log('✅ AuthManager инициализирован');
      
      // Инициализируем JobsManager
      await jobsManager.init();
      this.modules.set('jobs', jobsManager);
      console.log('✅ JobsManager инициализирован');
      
      // Подписываемся на события модулей
      this.setupModuleEventListeners();
      
    } catch (error) {
      console.error('❌ Ошибка инициализации модулей:', error);
      throw error;
    }
  }

  setupModuleEventListeners() {
    // События AuthManager
    document.addEventListener('auth:authStateChanged', (event) => {
      this.state.currentUser = event.detail.user;
      this.updateUI();
      this.dispatchEvent('userStateChanged', { user: event.detail.user });
    });
    
    // События JobsManager
    document.addEventListener('jobs:jobsManagerReady', (event) => {
      console.log('✅ JobsManager готов к работе');
      this.dispatchEvent('moduleReady', { module: 'jobs' });
    });
    
    document.addEventListener('jobs:jobsLoaded', (event) => {
      console.log(`📋 Загружено ${event.detail.jobs.length} вакансий`);
      this.dispatchEvent('jobsLoaded', event.detail);
    });
    
    document.addEventListener('jobs:jobApplied', (event) => {
      console.log('✅ Заявка подана:', event.detail.jobId);
      this.dispatchEvent('jobApplied', event.detail);
    });
    
    document.addEventListener('jobs:jobsError', (event) => {
      console.error('❌ Ошибка JobsManager:', event.detail.error);
      this.handleError(event.detail.error);
    });
  }

  setupEventListeners() {
    // Глобальные события приложения
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Пользовательские события
    document.addEventListener('themeChange', (event) => {
      this.userPreferences.theme = event.detail.theme;
      this.saveUserPreferences();
      this.updateUI();
    });
    
    document.addEventListener('languageChange', (event) => {
      this.userPreferences.language = event.detail.language;
      this.saveUserPreferences();
      this.updateUI();
    });
    
    // Навигация
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-nav]')) {
        event.preventDefault();
        const page = event.target.dataset.nav;
        this.navigateTo(page);
      }
    });
    
    // Обработка форм
    document.addEventListener('submit', (event) => {
      if (event.target.matches('form')) {
        event.preventDefault();
        this.handleFormSubmit(event.target);
      }
    });
  }

  async loadInitialData() {
    try {
      console.log('📊 Загрузка начальных данных...');
      
      // Загружаем данные пользователя если авторизован
      if (authManager.isAuthenticated()) {
        await this.loadUserData();
      }
      
      // Определяем текущую страницу
      this.state.currentPage = this.getCurrentPage();
      
    } catch (error) {
      console.error('❌ Ошибка загрузки начальных данных:', error);
    }
  }

  async loadUserData() {
    try {
      const user = authManager.getCurrentUser();
      if (user) {
        this.state.currentUser = user;
        console.log('👤 Данные пользователя загружены:', user.email);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
  }

  loadUserPreferences() {
    try {
      const stored = localStorage.getItem('workincz_preferences');
      return stored ? JSON.parse(stored) : this.getDefaultPreferences();
    } catch (error) {
      console.error('❌ Ошибка загрузки настроек:', error);
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      theme: 'light',
      language: 'ru',
      notifications: true,
      autoSave: true,
      compactMode: false
    };
  }

  saveUserPreferences() {
    try {
      localStorage.setItem('workincz_preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('❌ Ошибка сохранения настроек:', error);
    }
  }

  updateUI() {
    try {
      // Применяем тему
      this.applyTheme();
      
      // Обновляем язык
      this.updateLanguage();
      
      // Обновляем навигацию
      this.updateNavigation();
      
      // Обновляем элементы пользователя
      this.updateUserElements();
      
    } catch (error) {
      console.error('❌ Ошибка обновления UI:', error);
    }
  }

  applyTheme() {
    const theme = this.userPreferences.theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  updateLanguage() {
    const language = this.userPreferences.language;
    document.documentElement.setAttribute('lang', language);
    
    // Обновляем тексты на странице
    this.updatePageTexts(language);
  }

  updatePageTexts(language) {
    // Обновляем основные тексты на странице
    const translations = this.getTranslations(language);
    
    // Обновляем заголовки
    const titles = document.querySelectorAll('[data-i18n]');
    titles.forEach(element => {
      const key = element.dataset.i18n;
      const translation = translations[key];
      if (translation) {
        element.textContent = translation;
      }
    });
  }

  updateNavigation() {
    // Обновляем элементы навигации в зависимости от состояния аутентификации
    const isAuthenticated = authManager.isAuthenticated();
    
    // Кнопки входа/выхода
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    
    if (loginBtn) loginBtn.style.display = isAuthenticated ? 'none' : 'block';
    if (registerBtn) registerBtn.style.display = isAuthenticated ? 'none' : 'block';
    if (logoutBtn) logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
    if (profileBtn) profileBtn.style.display = isAuthenticated ? 'block' : 'none';
    
    // Ссылки на защищенные страницы
    const protectedLinks = document.querySelectorAll('[data-protected]');
    protectedLinks.forEach(link => {
      if (isAuthenticated) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });
  }

  updateUserElements() {
    const user = authManager.getCurrentUser();
    
    if (user) {
      // Обновляем имя пользователя
      const userNameElements = document.querySelectorAll('[data-user-name]');
      userNameElements.forEach(element => {
        element.textContent = user.displayName || user.email;
      });
      
      // Обновляем аватар
      const avatarElements = document.querySelectorAll('[data-user-avatar]');
      avatarElements.forEach(element => {
        if (user.photoURL) {
          element.src = user.photoURL;
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      });
      
      // Обновляем email
      const emailElements = document.querySelectorAll('[data-user-email]');
      emailElements.forEach(element => {
        element.textContent = user.email;
      });
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'home';
  }

  navigateTo(page) {
    try {
      this.state.currentPage = page;
      
      // Обновляем URL
      const url = page === 'home' ? '/' : `/${page}.html`;
      window.history.pushState({ page }, '', url);
      
      // Загружаем страницу
      this.loadPage(page);
      
    } catch (error) {
      console.error('❌ Ошибка навигации:', error);
    }
  }

  async loadPage(page) {
    try {
      this.state.isLoading = true;
      
      // Показываем индикатор загрузки
      this.showLoadingIndicator();
      
      // Загружаем контент страницы
      const response = await fetch(`/${page}.html`);
      const html = await response.text();
      
      // Обновляем контент
      const mainContent = document.querySelector('main') || document.getElementById('main');
      if (mainContent) {
        mainContent.innerHTML = html;
      }
      
      // Инициализируем специфичные для страницы функции
      this.initializePageSpecificFeatures(page);
      
      this.state.isLoading = false;
      this.hideLoadingIndicator();
      
    } catch (error) {
      console.error('❌ Ошибка загрузки страницы:', error);
      this.state.isLoading = false;
      this.hideLoadingIndicator();
    }
  }

  initializePageSpecificFeatures(page) {
    switch (page) {
      case 'jobs':
        // Инициализируем функции страницы вакансий
        if (jobsManager.isInitialized) {
          jobsManager.loadJobs();
        }
        break;
      case 'dashboard':
        // Инициализируем функции дашборда
        this.initializeDashboard();
        break;
      case 'profile':
        // Инициализируем функции профиля
        this.initializeProfile();
        break;
    }
  }

  initializeDashboard() {
    // Инициализация дашборда
    console.log('📊 Инициализация дашборда...');
  }

  initializeProfile() {
    // Инициализация профиля
    console.log('👤 Инициализация профиля...');
  }

  handleResize() {
    // Обработка изменения размера окна
    this.dispatchEvent('resize', { width: window.innerWidth, height: window.innerHeight });
  }

  handleScroll() {
    // Обработка прокрутки
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.dispatchEvent('scroll', { scrollTop });
  }

  async handleFormSubmit(form) {
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Валидируем данные
      const validationResult = this.validateFormData(data, form.dataset.validation);
      if (!validationResult.isValid) {
        this.showError(validationResult.errors.join(', '));
        return;
      }
      
      // Обрабатываем форму в зависимости от типа
      const formType = form.dataset.type;
      await this.processForm(formType, data);
      
    } catch (error) {
      console.error('❌ Ошибка обработки формы:', error);
      this.handleError(error);
    }
  }

  validateFormData(data, validationRules) {
    const errors = [];
    
    if (validationRules) {
      const rules = JSON.parse(validationRules);
      
      Object.keys(rules).forEach(field => {
        const value = data[field];
        const rule = rules[field];
        
        if (rule.required && !value) {
          errors.push(`${field} обязателен`);
        }
        
        if (rule.email && value && !this.isValidEmail(value)) {
          errors.push(`${field} должен быть валидным email`);
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
          errors.push(`${field} должен содержать минимум ${rule.minLength} символов`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async processForm(formType, data) {
    switch (formType) {
      case 'search':
        // Обработка поиска
        if (jobsManager.isInitialized) {
          jobsManager.searchJobs(data.query);
        }
        break;
      case 'filter':
        // Обработка фильтров
        if (jobsManager.isInitialized) {
          jobsManager.setFilters(data);
        }
        break;
      default:
        console.log('Неизвестный тип формы:', formType);
    }
  }

  showLoadingIndicator() {
    // Показываем индикатор загрузки
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.className = 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50';
    loader.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    `;
    document.body.appendChild(loader);
  }

  hideLoadingIndicator() {
    // Скрываем индикатор загрузки
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.remove();
    }
  }

  showReadyNotification() {
    console.log('🎉 WorkInCZ Application готово к работе!');
    
    // Показываем уведомление о готовности
    if (window.showToast) {
      window.showToast('Приложение готово к работе!', 'success');
    }
  }

  handleError(error) {
    console.error('❌ Application Error:', error);
    
    const message = error.message || 'Произошла ошибка в приложении';
    
    // Показываем ошибку пользователю
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      alert(message);
    }
    
    // Отправляем ошибку в систему мониторинга
    this.reportError(error);
  }

  reportError(error) {
    // Отправка ошибки в систему мониторинга
    console.log('📊 Отправка ошибки в систему мониторинга:', error);
    
    // Здесь можно добавить интеграцию с Sentry или другой системой мониторинга
  }

  // Публичные методы для внешнего использования
  getModule(name) {
    return this.modules.get(name);
  }

  addEventListener(event, handler, options = {}) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push({ handler, options });
  }

  removeEventListener(event, handler) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.findIndex(listener => listener.handler === handler);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, data = {}) {
    // Внутренние обработчики
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(({ handler }) => {
        try {
          handler(data);
        } catch (error) {
          console.error('❌ Ошибка в обработчике события:', error);
        }
      });
    }
    
    // Внешние события
    const customEvent = new CustomEvent(`app:${event}`, {
      detail: { app: this, ...data }
    });
    document.dispatchEvent(customEvent);
  }

  getTranslation(key, language = 'ru') {
    const translations = this.getTranslations(language);
    return translations[key] || key;
  }

  getTranslations(language) {
    const translations = {
      ru: {
        'app.ready': 'Приложение готово к работе!',
        'app.error': 'Произошла ошибка',
        'app.loading': 'Загрузка...',
        'auth.login': 'Войти',
        'auth.register': 'Регистрация',
        'auth.logout': 'Выйти',
        'jobs.search': 'Поиск вакансий',
        'jobs.filter': 'Фильтры',
        'jobs.apply': 'Откликнуться',
        'jobs.save': 'Сохранить'
      },
      en: {
        'app.ready': 'Application is ready!',
        'app.error': 'An error occurred',
        'app.loading': 'Loading...',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.logout': 'Logout',
        'jobs.search': 'Search jobs',
        'jobs.filter': 'Filters',
        'jobs.apply': 'Apply',
        'jobs.save': 'Save'
      },
      cs: {
        'app.ready': 'Aplikace je připravena!',
        'app.error': 'Došlo k chybě',
        'app.loading': 'Načítání...',
        'auth.login': 'Přihlásit',
        'auth.register': 'Registrace',
        'auth.logout': 'Odhlásit',
        'jobs.search': 'Hledat práci',
        'jobs.filter': 'Filtry',
        'jobs.apply': 'Přihlásit se',
        'jobs.save': 'Uložit'
      }
    };
    
    return translations[language] || translations.ru;
  }

  async loadUserData() {
    try {
      if (authManager.isAuthenticated()) {
        const user = authManager.getCurrentUser();
        this.state.currentUser = user;
        console.log('👤 Данные пользователя загружены:', user.email);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
  }
}

// Создаем экземпляр приложения
const app = new WorkInCZApp();

// Инициализируем приложение после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Экспортируем для использования в других модулях
export default app;
window.WorkInCZApp = app; 