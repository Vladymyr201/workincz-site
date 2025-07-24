// 🛡️ Role Middleware - проверка ролей и редиректы
class RoleMiddleware {
  constructor() {
    this.roles = ['candidate', 'client', 'agency', 'admin'];
    this.roleRoutes = {
      candidate: ['/dashboard.html', '/profile.html', '/applications.html'],
      client: ['/employer-dashboard.html', '/post-job.html', '/applications.html'],
      agency: ['/agency-dashboard.html', '/requests.html', '/candidates.html'],
      admin: ['/admin-dashboard.html', '/users.html', '/moderation.html']
    };
    
    this.init();
  }

  init() {
    // Проверяем аутентификацию при загрузке страницы
    this.checkAuthOnLoad();
    
    // Слушаем изменения аутентификации
    this.setupAuthListener();
    
    console.log('🛡️ RoleMiddleware инициализирован');
  }

  setupAuthListener() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.handleAuthenticatedUser(user);
        } else {
          this.handleUnauthenticatedUser();
        }
      });
    }
  }

  async checkAuthOnLoad() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
          await this.handleAuthenticatedUser(user);
        } else {
          this.handleUnauthenticatedUser();
        }
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
    }
  }

  async handleAuthenticatedUser(user) {
    try {
      // Получаем профиль пользователя
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const userRole = userData.role || 'candidate';
        
        // Проверяем доступ к текущей странице
        this.checkPageAccess(userRole);
        
        // Устанавливаем роль в глобальном состоянии
        this.setGlobalRole(userRole);
        
        // Обновляем UI в зависимости от роли
        this.updateUIForRole(userRole);
        
      } else {
        // Профиль не найден, перенаправляем на создание профиля
        this.redirectToProfileCreation();
      }
      
    } catch (error) {
      console.error('Ошибка получения профиля пользователя:', error);
      this.showError('Ошибка загрузки профиля');
    }
  }

  handleUnauthenticatedUser() {
    const currentPath = window.location.pathname;
    const publicPages = ['/', '/index.html', '/login', '/register', '/auth/confirm.html'];
    
    // Если не на публичной странице, перенаправляем на вход
    if (!publicPages.includes(currentPath)) {
      this.redirectToLogin();
    }
  }

  checkPageAccess(userRole) {
    const currentPath = window.location.pathname;
    const allowedRoutes = this.roleRoutes[userRole] || [];
    
    // Проверяем, разрешен ли доступ к текущей странице
    const hasAccess = allowedRoutes.some(route => currentPath.includes(route)) || 
                     currentPath === '/' || 
                     currentPath === '/index.html';
    
    if (!hasAccess) {
      // Перенаправляем на соответствующий дашборд
      this.redirectToRoleDashboard(userRole);
    }
  }

  redirectToRoleDashboard(role) {
    const dashboards = {
      candidate: '/dashboard.html',
      client: '/employer-dashboard.html',
      agency: '/agency-dashboard.html',
      admin: '/admin-dashboard.html'
    };

    const dashboardUrl = dashboards[role];
    if (dashboardUrl && window.location.pathname !== dashboardUrl) {
      this.showWarning(`У вас нет доступа к этой странице. Перенаправляем в личный кабинет ${this.getRoleDisplayName(role)}.`);
      
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 3000);
    }
  }

  redirectToLogin() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      this.showWarning('Для доступа к этой странице необходимо войти в систему.');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }

  redirectToProfileCreation() {
    this.showWarning('Необходимо завершить создание профиля.');
    
    setTimeout(() => {
      window.location.href = '/profile-setup.html';
    }, 3000);
  }

  setGlobalRole(role) {
    // Устанавливаем роль в глобальном состоянии
    window.currentUserRole = role;
    
    // Обновляем enhancedAuthSystem если он существует
    if (window.enhancedAuthSystem) {
      window.enhancedAuthSystem.currentRole = role;
      window.enhancedAuthSystem.updateRoleSwitcher();
    }
    
    // Добавляем класс к body для стилизации
    document.body.classList.remove('role-candidate', 'role-client', 'role-agency', 'role-admin');
    document.body.classList.add(`role-${role}`);
    
    // Сохраняем в localStorage
    localStorage.setItem('userRole', role);
  }

  updateUIForRole(role) {
    // Скрываем/показываем элементы в зависимости от роли
    this.updateNavigationForRole(role);
    this.updateSidebarForRole(role);
    this.updateContentForRole(role);
  }

  updateNavigationForRole(role) {
    // Обновляем навигацию
    const roleSwitcher = document.getElementById('roleSwitcherContainer');
    if (roleSwitcher) {
      roleSwitcher.classList.remove('hidden');
    }
    
    // Обновляем текст текущей роли
    const roleText = document.getElementById('currentRoleText');
    if (roleText) {
      roleText.textContent = this.getRoleDisplayName(role);
    }
    
    // Скрываем кнопки входа/регистрации
    const authButtons = document.querySelectorAll('#loginBtn, #registerBtn');
    authButtons.forEach(btn => {
      if (btn) btn.style.display = 'none';
    });
    
    // Показываем кнопку выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
    }
  }

  updateSidebarForRole(role) {
    // Обновляем сайдбар в зависимости от роли
    const sidebarItems = document.querySelectorAll('[data-role-only]');
    sidebarItems.forEach(item => {
      const requiredRole = item.getAttribute('data-role-only');
      if (requiredRole === role) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  updateContentForRole(role) {
    // Обновляем контент в зависимости от роли
    const contentSections = document.querySelectorAll('[data-role-content]');
    contentSections.forEach(section => {
      const sectionRole = section.getAttribute('data-role-content');
      if (sectionRole === role) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  }

  getRoleDisplayName(role) {
    const roleNames = {
      candidate: 'Соискатель',
      client: 'Работодатель',
      agency: 'Агентство',
      admin: 'Администратор'
    };
    return roleNames[role] || 'Пользователь';
  }

  // Методы для проверки прав доступа
  hasRole(requiredRole) {
    return window.currentUserRole === requiredRole;
  }

  hasAnyRole(requiredRoles) {
    return requiredRoles.includes(window.currentUserRole);
  }

  requireRole(requiredRole, redirectUrl = null) {
    if (!this.hasRole(requiredRole)) {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        this.redirectToRoleDashboard(window.currentUserRole);
      }
      return false;
    }
    return true;
  }

  // Утилиты для показа уведомлений
  showWarning(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <i class="ri-alert-line text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <i class="ri-error-warning-line text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  // Методы для работы с URL параметрами
  getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      demo: urlParams.get('demo') === 'true',
      role: urlParams.get('role'),
      magic_link: urlParams.get('magic_link') === 'true'
    };
  }

  // Обработка специальных параметров URL
  handleUrlParams() {
    const params = this.getUrlParams();
    
    if (params.demo) {
      this.showDemoModeIndicator();
    }
    
    if (params.magic_link) {
      this.showMagicLinkSuccess();
    }
  }

  showDemoModeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
    indicator.innerHTML = `
      <i class="ri-test-tube-line"></i>
      <span>Demo режим</span>
    `;
    
    document.body.appendChild(indicator);
    
    // Убираем через 5 секунд
    setTimeout(() => {
      if (indicator.parentElement) {
        indicator.remove();
      }
    }, 5000);
  }

  showMagicLinkSuccess() {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
    toast.innerHTML = `
      <i class="ri-check-circle-line text-xl"></i>
      <span>Вход через Magic-Link выполнен успешно!</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}

// Глобальные функции для доступа из HTML
window.requireRole = (role, redirectUrl) => {
  if (window.roleMiddleware) {
    return window.roleMiddleware.requireRole(role, redirectUrl);
  }
  return false;
};

window.hasRole = (role) => {
  if (window.roleMiddleware) {
    return window.roleMiddleware.hasRole(role);
  }
  return false;
};

// Инициализация
window.roleMiddleware = new RoleMiddleware(); 