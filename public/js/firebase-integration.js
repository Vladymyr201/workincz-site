/**
 * 🔥 ИНТЕГРАЦИЯ FIREBASE
 * 
 * Этот файл обеспечивает интеграцию с Firebase для устаревших HTML-страниц.
 * Он импортирует конфигурацию из firebase-config.js и инициализирует Firebase SDK.
 * 
 * @version 1.0.0
 * @date 2025-07-31
 */

// Проверяем, загружена ли конфигурация Firebase
(function() {
  // Если файл firebase-config.js уже загружен и доступен глобально
  if (window.firebaseConfig) {
    initializeFirebaseServices(window.firebaseConfig);
  } else {
    // Загружаем конфигурацию динамически
    loadFirebaseConfig()
      .then(config => {
        window.firebaseConfig = config;
        initializeFirebaseServices(config);
      })
      .catch(error => {
        console.error('❌ Ошибка загрузки Firebase конфигурации:', error);
        showFirebaseError('Ошибка загрузки Firebase конфигурации');
      });
  }
})();

/**
 * Загружает конфигурацию Firebase
 * @returns {Promise<Object>} Firebase конфигурация
 */
function loadFirebaseConfig() {
  return new Promise((resolve, reject) => {
    // Пытаемся загрузить из файла
    fetch('/js/firebase-config.js')
      .then(response => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить конфигурацию Firebase');
        }
        return response.text();
      })
      .then(text => {
        // Извлекаем конфигурацию из текста файла
        try {
          // Создаем безопасную среду выполнения
          const configScript = new Function(`
            let firebaseConfig = null;
            const module = {};
            const exports = {};
            
            ${text}
            
            if (typeof firebaseConfig !== 'undefined') {
              return firebaseConfig;
            } else if (module.exports && module.exports.firebaseConfig) {
              return module.exports.firebaseConfig;
            } else if (typeof exports.firebaseConfig !== 'undefined') {
              return exports.firebaseConfig;
            } else if (typeof loadFirebaseConfig === 'function') {
              return loadFirebaseConfig();
            }
            
            throw new Error('Конфигурация Firebase не найдена в файле');
          `);
          
          const config = configScript();
          resolve(config);
        } catch (error) {
          // Используем запасную конфигурацию
          resolve(getBackupFirebaseConfig());
        }
      })
      .catch(error => {
        console.warn('⚠️ Используется запасная конфигурация Firebase:', error);
        resolve(getBackupFirebaseConfig());
      });
  });
}

/**
 * Возвращает запасную конфигурацию Firebase
 * @returns {Object} Запасная Firebase конфигурация
 */
function getBackupFirebaseConfig() {
  return {
    apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
    authDomain: "workincz-759c7.firebaseapp.com",
    databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "workincz-759c7",
    storageBucket: "workincz-759c7.firebasestorage.app",
    messagingSenderId: "670842817143",
    appId: "1:670842817143:web:d8998634da78318e9f1472",
    measurementId: "G-PB27XT0CT0"
  };
}

/**
 * Инициализирует сервисы Firebase
 * @param {Object} config Firebase конфигурация
 */
function initializeFirebaseServices(config) {
  try {
    // Проверяем, был ли Firebase уже инициализирован
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config);
      console.log('✅ Firebase успешно инициализирован');
    } else {
      console.log('ℹ️ Firebase уже инициализирован');
    }
    
    // Определяем основные сервисы в глобальной области видимости
    window.firebaseAuth = firebase.auth();
    window.firebaseFirestore = firebase.firestore();
    window.firebaseStorage = firebase.storage && firebase.storage();
    
    // Инициализируем Analytics только в production
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      window.firebaseAnalytics = firebase.analytics && firebase.analytics();
    }
    
    // Устанавливаем настройки Firestore для автономной работы
    if (window.firebaseFirestore && window.firebaseFirestore.enablePersistence) {
      window.firebaseFirestore.enablePersistence({ synchronizeTabs: true })
        .then(() => {
          console.log('✅ Firestore настроен для автономной работы');
        })
        .catch(error => {
          if (error.code === 'failed-precondition') {
            console.warn('⚠️ Автономный режим Firestore не активирован: открыто несколько вкладок');
          } else if (error.code === 'unimplemented') {
            console.warn('⚠️ Этот браузер не поддерживает автономный режим Firestore');
          }
        });
    }
    
    // Создаем событие для информирования других скриптов
    const event = new Event('firebase-ready');
    window.dispatchEvent(event);
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    showFirebaseError(error.message || 'Ошибка инициализации Firebase');
  }
}

/**
 * Отображает ошибку Firebase
 * @param {string} message Сообщение об ошибке
 */
function showFirebaseError(message) {
  // Создаем и отображаем уведомление об ошибке
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '15px 20px';
  notification.style.backgroundColor = '#f44336';
  notification.style.color = 'white';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.zIndex = '9999';
  notification.style.maxWidth = '300px';
  notification.style.animation = 'slideIn 0.3s forwards';
  
  // Добавляем стили анимации
  if (!document.getElementById('firebase-error-styles')) {
    const style = document.createElement('style');
    style.id = 'firebase-error-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Добавляем сообщение
  notification.textContent = `Ошибка Firebase: ${message}`;
  
  // Добавляем уведомление на страницу
  document.body.appendChild(notification);
  
  // Удаляем уведомление через 5 секунд
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}