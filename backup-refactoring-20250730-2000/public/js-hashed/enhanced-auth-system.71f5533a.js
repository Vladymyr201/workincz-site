// 🔐 Enhanced Auth System - улучшенная система аутентификации (v3.4)
// Упрощенная версия с прямым входом без persistence

class EnhancedAuthSystem {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.init();
  }

  async init() {
    console.log('🔐 EnhancedAuthSystem v3.4 инициализируется...');
    
    if (typeof firebase !== 'undefined') {
      this.isInitialized = true;
      console.log('✅ EnhancedAuthSystem инициализирован');
    } else {
      console.error('❌ Firebase не загружен!');
    }
  }

  // Быстрый вход для демо-пользователей
  async quickLogin(role) {
    console.log(`🔐 Быстрый вход как ${role}...`);
    
    if (!this.isInitialized) {
      console.error('❌ EnhancedAuthSystem не инициализирован!');
      return;
    }

    try {
      // Устанавливаем флаги демо-входа
      sessionStorage.setItem('demoLogin', 'true');
      sessionStorage.setItem('demoRole', role);
      
      let email, password;
      switch(role) {
        case 'candidate': 
          email = 'demo-candidate@test.cz'; 
          password = 'demoPassword'; 
          break;
        case 'client': 
          email = 'demo-client@test.cz'; 
          password = 'demoPassword'; 
          break;
        case 'agency': 
          email = 'demo-agency@test.cz'; 
          password = 'demoPassword'; 
          break;
        default: 
          throw new Error('Неизвестная роль');
      }
      
      console.log(`🔐 Попытка входа: ${email}`);
      
      // Выполняем вход через Firebase без persistence
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log('✅ Firebase вход выполнен:', userCredential.user.email);
      
      // Немедленно перенаправляем на дашборд
      this.showDashboard(role);
      
    } catch (error) {
      console.error('❌ Ошибка демо-входа:', error);
      sessionStorage.removeItem('demoLogin');
      sessionStorage.removeItem('demoRole');
      alert('Ошибка демо-входа: ' + error.message);
    }
  }

  // Показ соответствующего дашборда
  showDashboard(role) {
    const timestamp = Date.now();
    let dashboardUrl;
    
    switch (role) {
      case 'candidate':
        dashboardUrl = `/dashboard.html?demo=true&role=${role}&timestamp=${timestamp}`;
        break;
      case 'client':
        dashboardUrl = `/employer-dashboard.html?demo=true&role=${role}&timestamp=${timestamp}`;
        break;
      case 'agency':
        dashboardUrl = `/agency-dashboard.html?demo=true&role=${role}&timestamp=${timestamp}`;
        break;
      default:
        dashboardUrl = '/';
    }
    
    console.log('➡️ showDashboard: переход на', dashboardUrl);
    alert('showDashboard: переход на ' + dashboardUrl);
    window.location.href = dashboardUrl;
  }

  // Показ модального окна входа
  showEnhancedLoginModal() {
    console.log('🔐 Показываем модальное окно входа...');
    // Реализация модального окна входа
  }
}

// Создаем глобальный экземпляр
window.enhancedAuthSystem = new EnhancedAuthSystem(); 