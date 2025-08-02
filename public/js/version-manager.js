// 🚀 Version Manager - система управления версиями и кэшированием (v1.0.0)
// Решает проблемы агрессивного кэширования браузера

class VersionManager {
  constructor() {
    this.currentVersion = this.generateVersion();
    this.storageKey = 'workincz_version';
    this.manifestUrl = '/manifest.json';
    this.forceReloadKey = 'force_reload';
    
    console.log('🚀 VersionManager инициализирован');
  }

  // Генерация версии на основе времени и случайного числа
  generateVersion() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  // Получение версии из localStorage
  getStoredVersion() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('⚠️ Не удалось получить версию из localStorage:', error);
      return null;
    }
  }

  // Сохранение версии в localStorage
  setStoredVersion(version) {
    try {
      localStorage.setItem(this.storageKey, version);
    } catch (error) {
      console.warn('⚠️ Не удалось сохранить версию в localStorage:', error);
    }
  }

  // Проверка необходимости принудительной перезагрузки
  checkForceReload() {
    const forceReload = localStorage.getItem(this.forceReloadKey);
    if (forceReload === 'true') {
      localStorage.removeItem(this.forceReloadKey);
      console.log('🔄 Принудительная перезагрузка из localStorage');
      return true;
    }
    return false;
  }

  // Очистка всех кэшей
  async clearAllCaches() {
    console.log('🧹 Очистка всех кэшей...');
    
    // Очистка Service Worker кэшей
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        console.log('✅ Service Worker кэши очищены');
      } catch (error) {
        console.warn('⚠️ Ошибка очистки Service Worker кэшей:', error);
      }
    }

    // Очистка localStorage (кроме версии)
    try {
      const keysToKeep = [this.storageKey, 'firebase:authUser:', 'firebase:hosting:'];
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (!keysToKeep.some(keepKey => key.startsWith(keepKey))) {
          localStorage.removeItem(key);
        }
      });
      console.log('✅ localStorage очищен');
    } catch (error) {
      console.warn('⚠️ Ошибка очистки localStorage:', error);
    }

    // Очистка sessionStorage
    try {
      sessionStorage.clear();
      console.log('✅ sessionStorage очищен');
    } catch (error) {
      console.warn('⚠️ Ошибка очистки sessionStorage:', error);
    }
  }

  // Загрузка манифеста файлов
  async loadManifest() {
    try {
      const response = await fetch(this.manifestUrl, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const manifest = await response.json();
      console.log('📋 Манифест загружен:', manifest);
      return manifest;
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить манифест:', error);
      return null;
    }
  }

  // Проверка версии и обновление
  async checkVersion() {
    console.log('🔍 Проверка версии...');
    
    // Проверяем принудительную перезагрузку
    if (this.checkForceReload()) {
      await this.performUpdate();
      return;
    }

    const storedVersion = this.getStoredVersion();
    
    if (!storedVersion) {
      console.log('🆕 Первый запуск, устанавливаем версию');
      this.setStoredVersion(this.currentVersion);
      return;
    }

    // Загружаем манифест для проверки изменений
    const manifest = await this.loadManifest();
    if (!manifest) {
      console.log('⚠️ Манифест недоступен, пропускаем проверку версии');
      return;
    }

    // Проверяем, изменились ли файлы
    const hasChanges = await this.checkFileChanges(manifest);
    
    if (hasChanges) {
      console.log('🔄 Обнаружены изменения в файлах, обновляем...');
      await this.performUpdate();
    } else {
      console.log('✅ Версия актуальна');
    }
  }

  // Проверка изменений в файлах
  async checkFileChanges(manifest) {
    try {
      const checks = Object.entries(manifest).map(async ([original, hashed]) => {
        // Исправляем путь - убираем лишний js-hashed/
        const hashedPath = hashed.replace(/^js-hashed\//, '');
        const response = await fetch(`/js-hashed/${hashedPath}`, {
          method: 'HEAD',
          cache: 'no-cache'
        });
        return response.ok;
      });

      const results = await Promise.all(checks);
      const allFilesExist = results.every(exists => exists);
      
      if (!allFilesExist) {
        console.log('⚠️ Некоторые файлы недоступны');
        return true; // Требуем обновление
      }

      return false;
    } catch (error) {
      console.warn('⚠️ Ошибка проверки файлов:', error);
      return true; // Требуем обновление при ошибке
    }
  }

  // Выполнение обновления
  async performUpdate() {
    console.log('🔄 Выполнение обновления...');
    
    // Очищаем все кэши
    await this.clearAllCaches();
    
    // Устанавливаем новую версию
    this.setStoredVersion(this.currentVersion);
    
    // Принудительная перезагрузка страницы
    console.log('🔄 Принудительная перезагрузка страницы...');
    window.location.reload(true);
  }

  // Установка флага принудительной перезагрузки
  setForceReload() {
    try {
      localStorage.setItem(this.forceReloadKey, 'true');
      console.log('🚩 Установлен флаг принудительной перезагрузки');
    } catch (error) {
      console.warn('⚠️ Не удалось установить флаг перезагрузки:', error);
    }
  }

  // Получение хешированного пути к файлу
  async getHashedPath(originalPath) {
    try {
      const manifest = await this.loadManifest();
      if (manifest && manifest[originalPath]) {
        return manifest[originalPath];
      }
    } catch (error) {
      console.warn('⚠️ Не удалось получить хешированный путь:', error);
    }
    return originalPath; // Возвращаем оригинальный путь как fallback
  }

  // Инициализация
  async init() {
    console.log('🚀 Инициализация VersionManager...');
    
    // Проверяем версию при загрузке
    await this.checkVersion();
    
    // Логируем текущую версию
    console.log(`📋 Текущая версия: ${this.currentVersion}`);
    
    // Делаем доступным глобально
    window.versionManager = this;
  }
}

// Создаем глобальный экземпляр
window.versionManager = new VersionManager();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
  window.versionManager.init();
}); 