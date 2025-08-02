// 🛡️ RoleMiddleware - проверка ролей и доступов (v8.0.1)
// Поддержка Firebase Anonymous Auth и демо-пользователей
// Интеграция с AppInitializer

class RoleMiddleware {
  constructor() {
    this.roleRoutes = {
      candidate: ['dashboard', 'profile', 'applications', 'saved-jobs'],
      client: ['employer-dashboard', 'post-job', 'applications', 'company'],
      agency: ['agency-dashboard', 'candidates', 'contracts', 'agency-profile'],
      admin: ['admin-dashboard', 'users', 'moderation', 'analytics']
    };
    
    this.publicPages = [
      '/', '/index.html', '/auth/confirm.html', '/test-demo-fix.html'
    ];
    
    this.isInitialized = false;
    this.currentRole = null;
    this.authManager = null;
    
    console.log('🛡️ RoleMiddleware v8.0.1 создан');
  }

  async init() {
    if (this.isInitialized) {
      console.log('🛡️ RoleMiddleware уже инициализирован');
      return;
    }

    try {
      console.log('🛡️ RoleMiddleware: начало инициализации');
      
      // Получаем AuthManager через AppInitializer
      if (window.appInitializer) {
        this.authManager = window.appInitializer.getComponent('authManager');
        if (!this.authManager) {
          console.log('⏳ Ждем инициализации AuthManager...');
          this.authManager = await window.appInitializer.waitForComponent('authManager');
        }
      } else {
        // Fallback для обратной совместимости
        this.authManager = window.authManager;
      }
      
      if (!this.authManager) {
        console.warn('⚠️ AuthManager не найден, RoleMiddleware работает в ограниченном режиме');
      }
      
      this.isInitialized = true;
      console.log('🛡️ RoleMiddleware v8.0.1 инициализирован');
      
      // Запускаем проверку доступа
      this.checkAccess();
      
    } catch (error) {
      console.error('❌ Ошибка инициализации RoleMiddleware:', error);
      throw error;
    }
  }

  async checkAccess() {
    if (!this.isInitialized) {
      console.log('⏳ RoleMiddleware еще не инициализирован, откладываю проверку');
      setTimeout(() => this.checkAccess(), 500);
      return;
    }

    const currentPath = window.location.pathname;
    console.log(`🔍 RoleMiddleware: проверка доступа для ${currentPath}`);

    // Проверяем, является ли страница публичной
    if (this.isPublicPage(currentPath)) {
      console.log('🔍 Страница публичная, доступ разрешен');
      return;
    }

    // Проверяем демо-пользователей по URL параметрам
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.get('demo') === 'true';
    const demoRole = urlParams.get('role');
    
    if (isDemo && demoRole) {
      console.log(`🔍 Обнаружен демо-пользователь с ролью: ${demoRole}`);
      
      // Проверяем, разрешена ли текущая страница для этой роли
      const allowedPages = this.roleRoutes[demoRole] || [];
      const currentPage = currentPath.replace('.html', '').replace('/', '');
      
      if (allowedPages.includes(currentPage) || currentPath.includes(demoRole)) {
        console.log(`✅ Демо-пользователь ${demoRole} имеет доступ к ${currentPath}`);
        this.updateUIForRole(demoRole);
        return;
      } else {
        console.log(`❌ Демо-пользователь ${demoRole} не имеет доступа к ${currentPath}`);
        this.redirectToMainPage();
        return;
      }
    }

    // Получаем информацию о пользователе
    const user = window.authManager?.getCurrentUser();
    const profile = window.authManager?.getCurrentProfile();
    
    if (!user) {
      console.log('🔍 Пользователь не авторизован, перенаправление на главную');
      this.handleUnauthenticatedUser();
      return;
    }

    // Определяем роль пользователя
    const userRole = this.determineUserRole(user, profile);
    this.currentRole = userRole;
    
    console.log(`🔍 Пользователь авторизован, роль: ${userRole}`);
    
    // Проверяем доступ к текущей странице
    this.checkPageAccess(userRole);
  }

  determineUserRole(user, profile) {
    // Приоритет: профиль из Firestore > URL параметры > определение по email
    if (profile?.role) {
      return profile.role;
    }
    
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    if (urlRole && this.roleRoutes[urlRole]) {
      return urlRole;
    }
    
    // Определяем по email (для обратной совместимости)
    if (user.email) {
      if (user.email.includes('candidate')) return 'candidate';
      if (user.email.includes('client')) return 'client';
      if (user.email.includes('agency')) return 'agency';
      if (user.email.includes('admin')) return 'admin';
    }
    
    // Для анонимных пользователей определяем роль по URL
    if (user.isAnonymous) {
      const currentPath = window.location.pathname;
      if (currentPath.includes('employer-dashboard')) return 'client';
      if (currentPath.includes('agency-dashboard')) return 'agency';
      if (currentPath.includes('admin-dashboard')) return 'admin';
      return 'candidate'; // По умолчанию
    }
    
    return 'candidate'; // Роль по умолчанию
  }

  checkPageAccess(userRole) {
    const currentPath = window.location.pathname;
    const allowedRoutes = this.roleRoutes[userRole] || [];
    
    console.log(`🔍 Проверка доступа для роли ${userRole}:`);
    console.log(`   Текущая страница: ${currentPath}`);
    console.log(`   Разрешенные маршруты:`, allowedRoutes);
    
    // Проверяем, есть ли доступ к текущей странице
    const hasAccess = allowedRoutes.some(route => currentPath.includes(route)) ||
                     currentPath === '/' ||
                     currentPath === '/index.html';
    
    console.log(`🔍 Доступ разрешен: ${hasAccess}`);

    // Специальная логика для демо-пользователей
    const isDemo = window.authManager?.isDemoUser() || 
                   new URLSearchParams(window.location.search).get('demo') === 'true';
    
    if (isDemo) {
      console.log('🔍 Демо-пользователь, проверяем специальную логику доступа');
      
      // Для демо-пользователей разрешаем доступ к дашбордам
      const demoAllowedPages = [
        '/dashboard.html', '/dashboard',
        '/employer-dashboard.html', '/employer-dashboard',
        '/agency-dashboard.html', '/agency-dashboard',
        '/admin-dashboard.html', '/admin-dashboard'
      ];

      if (demoAllowedPages.includes(currentPath)) {
        console.log('🔍 Демо-пользователь на разрешенной странице дашборда');
        this.updateUIForRole(userRole);
        return;
      }

      // Если демо-пользователь на главной странице, не перенаправляем
      if (currentPath === '/' || currentPath === '/index.html') {
        console.log('🔍 Демо-пользователь на главной странице, не перенаправляем');
        return;
      }
    }

    if (!hasAccess) {
      console.log('❌ Доступ запрещен, перенаправление на главную');
      this.redirectToMainPage();
    } else {
      console.log('✅ Доступ разрешен');
      this.updateUIForRole(userRole);
    }
  }

  isPublicPage(path) {
    return this.publicPages.some(publicPage => 
      path === publicPage || path.startsWith(publicPage)
    );
  }

  handleUnauthenticatedUser() {
    const currentPath = window.location.pathname;
    
    // Проверяем dev-пользователей по URL параметрам
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === 'true';
    const devRole = urlParams.get('role');
    
    if (isDev && devRole) {
      console.log(`🔍 Обнаружен dev-пользователь с ролью: ${devRole}`);
      
      // Проверяем, разрешена ли текущая страница для этой роли
      const allowedPages = this.roleRoutes[devRole] || [];
      const currentPage = currentPath.replace('.html', '').replace('/', '');
      
      if (allowedPages.includes(currentPage) || currentPath.includes(devRole)) {
        console.log(`✅ Dev-пользователь ${devRole} имеет доступ к ${currentPath}`);
        this.updateUIForRole(devRole);
        return;
      } else {
        console.log(`❌ Dev-пользователь ${devRole} не имеет доступа к ${currentPath}`);
        this.redirectToMainPage();
        return;
      }
    }
    
    // Если пользователь на публичной странице, не перенаправляем
    if (this.isPublicPage(currentPath)) {
      console.log('🔍 Неавторизованный пользователь на публичной странице');
      return;
    }
    
    // Перенаправляем на главную страницу
    console.log('🔄 Перенаправление неавторизованного пользователя на главную');
    this.redirectToMainPage();
  }

  redirectToMainPage() {
    // Проверяем, не находимся ли уже на главной странице
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      console.log('🔍 Уже на главной странице, перенаправление не требуется');
      return;
    }
    
    console.log('🔄 Перенаправление на главную страницу');
    window.location.href = '/';
  }

  updateUIForRole(role) {
    console.log(`🎨 Обновление UI для роли: ${role}`);
    
    // Устанавливаем глобальные переменные
    window.currentUserRole = role;
    
    // Обновляем классы body для стилизации
    document.body.classList.remove('role-candidate', 'role-client', 'role-agency', 'role-admin');
    document.body.classList.add(`role-${role}`);
    
    // Уведомляем другие компоненты об изменении роли
    const event = new CustomEvent('roleChanged', { detail: { role } });
    document.dispatchEvent(event);
    
    console.log(`✅ UI обновлен для роли: ${role}`);
  }

  getCurrentRole() {
    return this.currentRole;
  }

  hasRole(role) {
    return this.currentRole === role;
  }

  isDemoUser() {
    return window.authManager?.isDemoUser() || 
           new URLSearchParams(window.location.search).get('demo') === 'true';
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.roleMiddleware = new RoleMiddleware();
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoleMiddleware;
} 