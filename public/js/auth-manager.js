// 🔐 Централизованный менеджер аутентификации WorkInCZ
class AuthManager {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.userDataCache = new Map();
    this.subscribers = new Set();
    this.isInitialized = false;
    
    // Дебаунс для предотвращения множественных вызовов
    this.authStateChangeDebounce = null;
    
    this.init();
  }

  async init() {
    if (typeof firebase === 'undefined') {
      console.log('🔧 Firebase загружается, ожидаем...');
      return;
    }

    this.db = firebase.firestore();
    this.auth = firebase.auth();
    
    console.log('🔥 AuthManager инициализирован');
    
    // ЕДИНСТВЕННЫЙ слушатель аутентификации для всего приложения
    this.auth.onAuthStateChanged(async (user) => {
      // Дебаунс для предотвращения множественных вызовов
      if (this.authStateChangeDebounce) {
        clearTimeout(this.authStateChangeDebounce);
      }
      
      this.authStateChangeDebounce = setTimeout(async () => {
        await this.handleAuthStateChange(user);
      }, 100);
    });
    
    this.isInitialized = true;
  }

  async handleAuthStateChange(user) {
    console.log('🔐 Изменение состояния аутентификации:', user?.email || 'Выход');
    
    this.currentUser = user;
    
    if (user) {
      // Загружаем данные пользователя с кешированием
      await this.loadUserData(user.uid);
      
      // 🔥 Sentry: устанавливаем контекст пользователя
      if (typeof Sentry !== 'undefined' && this.currentUser?.userData) {
        const userData = this.currentUser.userData;
        if (typeof setSentryUser === 'function') {
          setSentryUser({
            uid: user.uid,
            email: user.email,
            name: userData.name,
            role: userData.role,
            subscription: userData.subscription
          });
        }
        console.log('🔥 Sentry контекст пользователя установлен');
      }
    } else {
      // Очищаем кеш при выходе
      this.userDataCache.clear();
      
      // 🔥 Sentry: очищаем контекст пользователя
      if (typeof Sentry !== 'undefined') {
        Sentry.setUser(null);
        console.log('🔥 Sentry контекст пользователя очищен');
      }
    }
    
    // Уведомляем всех подписчиков одним пакетом
    this.notifySubscribers(user);
    
    // 🎯 Обрабатываем отложенные действия после авторизации
    if (user) {
      setTimeout(() => {
        this.handlePostAuthRedirect();
      }, 500); // Небольшая задержка для загрузки UI
    }
  }

  // Регистрация подписчиков на изменения аутентификации
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Если пользователь уже авторизован, сразу вызываем callback
    if (this.currentUser) {
      callback(this.currentUser);
    }
    
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(user) {
    this.subscribers.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.log('🔧 Минорная ошибка в подписчике AuthManager:', error.message);
      }
    });
    
    // Обновляем UI для авторизованного/неавторизованного пользователя
    this.updateAuthUI(user);
    
    // Если пользователь авторизован, обновляем UI
    if (user && user.userData && window.userProfileManager) {
      setTimeout(() => {
        console.log('🔄 Вызываем updateUIForLoggedInUser из AuthManager');
        window.userProfileManager.updateUIForLoggedInUser();
      }, 200);
    }
  }

  // Обновление UI в зависимости от статуса аутентификации
  updateAuthUI(user) {
    // Обновляем видимость кнопки сообщений
    const messagesBtn = document.getElementById('messages-btn');
    if (messagesBtn) {
      if (user) {
        messagesBtn.classList.remove('hidden');
        console.log('💬 Кнопка сообщений показана для авторизованного пользователя');
      } else {
        messagesBtn.classList.add('hidden');
        console.log('💬 Кнопка сообщений скрыта для неавторизованного пользователя');
      }
    }

    // Обновляем видимость кнопки выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      if (user) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.classList.add('flex');
        console.log('🚪 Кнопка выхода показана для авторизованного пользователя');
      } else {
        logoutBtn.classList.add('hidden');
        logoutBtn.classList.remove('flex');
        console.log('🚪 Кнопка выхода скрыта для неавторизованного пользователя');
      }
    }

    // Обновляем кнопки входа/регистрации
    const loginBtn = document.querySelector('[onclick="openLoginModal()"]');
    const registerBtn = document.querySelector('[onclick="openRegistrationModal()"]');
    
    if (loginBtn && registerBtn) {
      if (user) {
        loginBtn.style.display = 'none';
        registerBtn.textContent = user.userData?.name?.split(' ')[0] || 'Профиль';
        registerBtn.onclick = () => {
          if (window.userProfileManager) {
            window.userProfileManager.showUserProfile();
          }
        };
      } else {
        loginBtn.style.display = 'block';
        registerBtn.textContent = 'Регистрация';
        registerBtn.onclick = () => openRegistrationModal();
      }
    }
  }

  // Кешированная загрузка данных пользователя
  async loadUserData(uid) {
    if (this.userDataCache.has(uid)) {
      console.log('📱 Данные пользователя из кеша');
      return this.userDataCache.get(uid);
    }

    try {
      console.log('🔄 Загрузка данных пользователя из Firestore');
      const userDoc = await this.db.collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        this.userDataCache.set(uid, userData);
        
        // Обновляем currentUser
        if (this.currentUser) {
          this.currentUser.userData = userData;
        }
        
        return userData;
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
    
    return null;
  }

  // Получение данных текущего пользователя
  getCurrentUser() {
    return this.currentUser;
  }

  // Получение роли пользователя (поддержка гибридной модели)
  getUserRole() {
    if (!this.currentUser?.userData) {
      return 'jobseeker'; // Дефолтная роль
    }
    return this.currentUser.userData.role || 'jobseeker';
  }

  // Проверка роли пользователя
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Проверка премиум статуса
  isPremium() {
    if (!this.currentUser?.userData) {
      return false;
    }
    // БАЗОВАЯ АУТЕНТИФИКАЦИЯ ВСЕГДА БЕСПЛАТНА
    // Премиум статус нужен только для дополнительных функций
    return this.currentUser.userData.is_premium || false;
  }

  // Проверка агентства
  isAgency() {
    return this.hasRole('agency');
  }

  // Проверка работодателя
  isEmployer() {
    return this.hasRole('employer');
  }

  // Проверка соискателя
  isJobseeker() {
    return this.hasRole('jobseeker');
  }

  // Проверка админа
  isAdmin() {
    return this.hasRole('admin');
  }
    return this.currentUser;
  }

  getUserData(uid = null) {
    const targetUid = uid || this.currentUser?.uid;
    if (!targetUid) return null;
    
    return this.userDataCache.get(targetUid) || this.currentUser?.userData;
  }

  // Обновление данных пользователя в кеше
  updateUserData(uid, data) {
    if (this.userDataCache.has(uid)) {
      const existing = this.userDataCache.get(uid);
      const updated = { ...existing, ...data };
      this.userDataCache.set(uid, updated);
      
      // Обновляем currentUser если это он
      if (this.currentUser?.uid === uid) {
        this.currentUser.userData = updated;
      }
    }
  }

  // Очистка кеша
  clearCache() {
    this.userDataCache.clear();
  }

  // Проверка готовности
  isReady() {
    return this.isInitialized;
  }

  // Ожидание готовности
  async waitForReady() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
        return;
      }
      
      const checkReady = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      
      checkReady();
    });
  }

  // 🎯 МЯГКАЯ АВТОРИЗАЦИЯ - проверка перед действиями
  requireAuth(action = 'выполнить это действие', context = {}) {
    if (this.currentUser) {
      return true; // Пользователь авторизован
    }
    
    // Показываем красивый модал с призывом к авторизации
    this.showSoftAuthModal(action, context);
    return false; // Пользователь не авторизован
  }

  // Красивый модал для мягкой авторизации
  showSoftAuthModal(action, context = {}) {
    // Сохраняем контекст для возврата после авторизации
    localStorage.setItem('auth_return_context', JSON.stringify({
      action,
      ...context,
      timestamp: Date.now()
    }));

    // Создаем привлекательный модал
    const modal = document.createElement('div');
    modal.id = 'soft-auth-modal';
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm';
    
    // Определяем сообщение в зависимости от действия
    const messages = {
      'откликнуться на вакансию': {
        title: '💼 Откликнитесь на вакансию!',
        text: 'Создайте профиль за 30 секунд и получите доступ к прямому общению с работодателями',
        benefits: ['📧 Прямые сообщения с HR', '⭐ Сохранение избранных вакансий', '🔔 Уведомления о новых предложениях']
      },
      'написать сообщение': {
        title: '💬 Начните общение!',
        text: 'Зарегистрируйтесь чтобы напрямую общаться с работодателями и получить быстрый ответ',
        benefits: ['💬 Мгновенные сообщения', '📎 Отправка документов', '✅ Статус прочтения']
      },
      'сохранить вакансию': {
        title: '⭐ Сохраните интересные вакансии!',
        text: 'Создайте аккаунт чтобы не потерять найденные вакансии и получать похожие предложения',
        benefits: ['💾 Избранные вакансии', '🎯 Персональные рекомендации', '📊 История откликов']
      }
    };

    const message = messages[action] || {
      title: '🚀 Присоединяйтесь к WorkInCZ!',
      text: 'Зарегистрируйтесь чтобы получить полный доступ ко всем возможностям платформы',
      benefits: ['💼 Отклики на вакансии', '💬 Общение с работодателями', '⭐ Персонализация']
    };

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slideIn">
        <div class="bg-gradient-to-r from-primary to-secondary p-6 text-white text-center">
          <h3 class="text-xl font-bold mb-2">${message.title}</h3>
          <p class="text-primary-100">${message.text}</p>
        </div>
        
        <div class="p-6">
          <div class="space-y-3 mb-6">
            ${message.benefits.map(benefit => `
              <div class="flex items-center gap-3 text-gray-700">
                <span class="text-lg">${benefit.charAt(0)}</span>
                <span class="text-sm">${benefit.slice(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="flex gap-3">
            <button onclick="openRegistrationModal(); closeSoftAuthModal();" 
                    class="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Создать аккаунт
            </button>
            <button onclick="openLoginModal(); closeSoftAuthModal();" 
                    class="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Войти
            </button>
          </div>
          
          <button onclick="closeSoftAuthModal()" 
                  class="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm">
            Возможно, позже
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Закрытие по ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.closeSoftAuthModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    console.log(`🎯 Показан мягкий модал авторизации для: ${action}`);
  }

  // Закрытие мягкого модала
  closeSoftAuthModal() {
    const modal = document.getElementById('soft-auth-modal');
    if (modal) {
      modal.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => modal.remove(), 300);
    }
  }

  // Восстановление контекста после авторизации
  handlePostAuthRedirect() {
    const contextStr = localStorage.getItem('auth_return_context');
    if (!contextStr) return false;

    try {
      const context = JSON.parse(contextStr);
      
      // Проверяем что контекст не устарел (5 минут)
      if (Date.now() - context.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem('auth_return_context');
        return false;
      }

      localStorage.removeItem('auth_return_context');
      
      // Показываем уведомление о продолжении действия
      this.showContinueActionNotification(context);
      
      // Выполняем отложенное действие с задержкой для лучшего UX
      setTimeout(() => {
        this.executeDelayedAction(context);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Ошибка обработки контекста авторизации:', error);
      localStorage.removeItem('auth_return_context');
      return false;
    }
  }

  // Показ уведомления о продолжении действия
  showContinueActionNotification(context) {
    const actionNames = {
      'откликнуться на вакансию': 'отклик на вакансию',
      'написать сообщение': 'сообщение работодателю',
      'сохранить вакансию': 'сохранение в избранное'
    };

    const actionName = actionNames[context.action] || 'ваше действие';
    
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-[9999] flex items-center gap-3 animate-slideIn';
    notification.innerHTML = `
      <i class="ri-check-circle-line text-xl"></i>
      <div>
        <div class="font-medium">Добро пожаловать!</div>
        <div class="text-sm text-green-100">Продолжаем ${actionName}...</div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  // Выполнение отложенного действия
  executeDelayedAction(context) {
    console.log('🎯 Выполняем отложенное действие:', context.action);

    if (context.action === 'откликнуться на вакансию' && context.jobId) {
      // Выполняем отклик на вакансию
      if (window.showJobApplicationSuccess) {
        window.showJobApplicationSuccess(context.jobTitle);
      }
      console.log(`💼 Выполнен отклик на вакансию: ${context.jobTitle}`);
      
    } else if (context.action === 'написать сообщение' && context.employerId) {
      // Открываем чат с работодателем
      if (window.startChatWithUser) {
        const message = `Здравствуйте! Меня заинтересовала ваша вакансия${context.jobId ? ' (ID: ' + context.jobId + ')' : ''}.`;
        window.startChatWithUser(context.employerId, message, context.jobId);
      }
      console.log(`💬 Открыт чат с работодателем: ${context.employerId}`);
      
    } else if (context.action === 'сохранить вакансию' && context.jobId) {
      // Сохраняем вакансию в избранное
      if (window.saveJobToFavorites) {
        window.saveJobToFavorites(context.jobId, context.jobTitle);
      }
      console.log(`