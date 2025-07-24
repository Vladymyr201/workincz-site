// 🔐 Dashboard Auth - аутентификация для страниц ЛК
class DashboardAuth {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('🔐 DashboardAuth инициализируется...');
    
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase не загружен! DashboardAuth не может работать.');
      return;
    }

    try {
      this.db = firebase.firestore();
      this.auth = firebase.auth();
      
      console.log('🔐 DashboardAuth инициализирован успешно');
      this.isInitialized = true;
      
      // Слушатель аутентификации
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        console.log('DashboardAuth: изменение состояния аутентификации:', user?.email || 'Выход');
        
        if (!user) {
          // Если пользователь не авторизован, перенаправляем на главную
          console.log('❌ Пользователь не авторизован, перенаправляем на главную');
          window.location.href = '/';
        } else {
          // Обновляем UI для авторизованного пользователя
          this.updateDashboardUI(user);
        }
      });
      
    } catch (error) {
      console.error('Ошибка инициализации DashboardAuth:', error);
    }
  }

  // Обновление UI для страниц ЛК
  updateDashboardUI(user) {
    // Обновляем информацию о пользователе
    const userInfoElements = document.querySelectorAll('.user-name, .user-email');
    userInfoElements.forEach(el => {
      if (el.classList.contains('user-name')) {
        el.textContent = user.displayName || 'Пользователь';
      } else if (el.classList.contains('user-email')) {
        el.textContent = user.email;
      }
    });

    // Показываем/скрываем элементы в зависимости от роли
    this.updateRoleBasedUI(user);
  }

  // Обновление UI в зависимости от роли
  updateRoleBasedUI(user) {
    // Получаем роль пользователя из URL или localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || 'candidate';
    
    // Скрываем/показываем элементы в зависимости от роли
    const roleElements = document.querySelectorAll('[data-role]');
    roleElements.forEach(el => {
      const elementRole = el.dataset.role;
      if (elementRole === role || elementRole === 'all') {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Обновляем заголовок страницы
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
      const roleNames = {
        candidate: 'Соискатель',
        client: 'Работодатель',
        agency: 'Агентство'
      };
      pageTitle.textContent = `Личный кабинет - ${roleNames[role] || 'Пользователь'}`;
    }
  }

  // Выход из системы
  async signOut() {
    try {
      await this.auth.signOut();
      console.log('Пользователь вышел из системы');
      window.location.href = '/';
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  }

  // Получение текущего пользователя
  getCurrentUser() {
    return this.currentUser;
  }

  // Проверка готовности
  isReady() {
    return this.isInitialized;
  }
}

// Экспорт класса
window.DashboardAuth = DashboardAuth; 