// 🚀 App Initialization - единая точка входа (v1.0.0)
// Решает проблемы кэширования и race conditions

class AppInitializer {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
    this.components = new Map();
    this.eventBus = new Map();
    
    console.log('🚀 AppInitializer v1.0.0 создан');
  }

  // Регистрация компонента
  register(name, component, dependencies = []) {
    this.components.set(name, { component, dependencies, ready: false });
    console.log(`📋 Зарегистрирован компонент: ${name}`);
  }

  // Подписка на события
  on(event, callback) {
    if (!this.eventBus.has(event)) {
      this.eventBus.set(event, []);
    }
    this.eventBus.get(event).push(callback);
  }

  // Отправка события
  emit(event, data) {
    if (this.eventBus.has(event)) {
      this.eventBus.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Ошибка в обработчике события ${event}:`, error);
        }
      });
    }
  }

  // Инициализация компонента
  async initComponent(name) {
    const component = this.components.get(name);
    if (!component || component.ready) {
      return;
    }

    // Проверяем зависимости
    for (const dep of component.dependencies) {
      const depComponent = this.components.get(dep);
      if (!depComponent || !depComponent.ready) {
        console.log(`⏳ Ждем инициализации зависимости ${dep} для ${name}`);
        await this.waitForComponent(dep);
      }
    }

    // Инициализируем компонент
    try {
      console.log(`🚀 Инициализация компонента: ${name}`);
      if (typeof component.component.init === 'function') {
        await component.component.init();
      }
      component.ready = true;
      this.emit('component:ready', { name, component: component.component });
      console.log(`✅ Компонент ${name} инициализирован`);
    } catch (error) {
      console.error(`❌ Ошибка инициализации компонента ${name}:`, error);
      throw error;
    }
  }

  // Ожидание готовности компонента
  waitForComponent(name, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        const component = this.components.get(name);
        if (component && component.ready) {
          resolve(component.component);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Таймаут ожидания компонента ${name}`));
          return;
        }
        
        setTimeout(check, 100);
      };
      
      check();
    });
  }

  // Основная инициализация приложения
  async init() {
    if (this.isInitialized) {
      console.log('🚀 AppInitializer уже инициализирован');
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._init();
    return this.initPromise;
  }

  async _init() {
    try {
      console.log('🚀 Начинаем инициализацию приложения...');
      
      // Очищаем кэш при необходимости
      await this.clearCache();
      
      // Инициализируем компоненты в правильном порядке
      const initOrder = [
        'firebase',
        'authManager', 
        'roleMiddleware',
        'demoLoginSystem',
        'devLogin',
        'jobsManager'
      ];

      for (const componentName of initOrder) {
        if (this.components.has(componentName)) {
          await this.initComponent(componentName);
        }
      }

      this.isInitialized = true;
      this.emit('app:ready');
      console.log('🎉 Приложение успешно инициализировано!');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации приложения:', error);
      this.emit('app:error', error);
      throw error;
    }
  }

  // Очистка кэша
  async clearCache() {
    try {
      // Очищаем Service Worker кэш
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        console.log('🧹 Service Worker кэш очищен');
      }

      // Очищаем localStorage демо-данных при необходимости
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('clear-cache') === 'true') {
        localStorage.removeItem('demoAuth');
        console.log('🧹 localStorage демо-данных очищен');
      }
    } catch (error) {
      console.warn('⚠️ Не удалось очистить кэш:', error);
    }
  }

  // Получение компонента
  getComponent(name) {
    const component = this.components.get(name);
    return component ? component.component : null;
  }

  // Проверка готовности компонента
  isComponentReady(name) {
    const component = this.components.get(name);
    return component ? component.ready : false;
  }
}

// Создаем глобальный экземпляр
window.appInitializer = new AppInitializer();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppInitializer;
} 