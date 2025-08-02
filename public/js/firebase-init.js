/**
 * 🔥 ЕДИНАЯ ИНИЦИАЛИЗАЦИЯ FIREBASE
 * 
 * Этот файл предоставляет единую точку инициализации Firebase для всего приложения.
 * Он импортирует конфигурацию из firebase-config.js и инициализирует Firebase SDK.
 * 
 * @version 1.0.0
 * @date 2025-07-31
 */

// Импорт конфигурации
import { firebaseConfig, validateFirebaseConfig } from './firebase-config.js';

// Глобальные переменные
let firebaseApp;
let firebaseAuth;
let firebaseFirestore;
let firebaseStorage;
let firebaseAnalytics;

// Инициализация Firebase с предотвращением дублирования
function initializeFirebase() {
  try {
    // Валидация конфигурации
    if (!validateFirebaseConfig()) {
      throw new Error('Невалидная конфигурация Firebase');
    }

    // Проверяем, инициализирован ли уже Firebase
    if (firebase.apps.length === 0) {
      console.log('🚀 Инициализация Firebase...');
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      console.log('🔄 Firebase уже инициализирован, используем существующий экземпляр');
      firebaseApp = firebase.app();
    }

    // Инициализация сервисов
    firebaseAuth = firebase.auth();
    firebaseFirestore = firebase.firestore();
    firebaseStorage = firebase.storage();

    // Инициализируем Analytics только в production
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      firebaseAnalytics = firebase.analytics();
    }

    // Настройка Firestore для автономной работы
    firebaseFirestore.enablePersistence({ synchronizeTabs: true })
      .then(() => {
        console.log('✅ Firestore настроен для автономной работы');
      })
      .catch(error => {
        if (error.code === 'failed-precondition') {
          console.warn('⚠️ Автономный режим Firestore не активирован: открыто несколько вкладок');
        } else if (error.code === 'unimplemented') {
          console.warn('⚠️ Этот браузер не поддерживает автономный режим Firestore');
        } else {
          console.error('❌ Ошибка настройки Firestore:', error);
        }
      });

    console.log('✅ Firebase успешно инициализирован');
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    showFirebaseError(error);
    return false;
  }
}

// Отображение ошибки Firebase
function showFirebaseError(error) {
  // Создаем элемент уведомления
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
  const style = document.createElement('style');
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
  
  // Добавляем сообщение
  notification.textContent = `Ошибка Firebase: ${error.message || 'Неизвестная ошибка'}`;
  
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

// Функции для доступа к сервисам Firebase
function getFirebaseApp() {
  return firebaseApp;
}

function getFirebaseAuth() {
  return firebaseAuth;
}

function getFirebaseFirestore() {
  return firebaseFirestore;
}

function getFirebaseStorage() {
  return firebaseStorage;
}

function getFirebaseAnalytics() {
  return firebaseAnalytics;
}

// Экспорт функций и объектов
export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  getFirebaseAnalytics
};

// Регистрируем функции в глобальной области для совместимости
if (typeof window !== 'undefined') {
  window.initializeFirebase = initializeFirebase;
  window.getFirebaseApp = getFirebaseApp;
  window.getFirebaseAuth = getFirebaseAuth;
  window.getFirebaseFirestore = getFirebaseFirestore;
  window.getFirebaseStorage = getFirebaseStorage;
  window.getFirebaseAnalytics = getFirebaseAnalytics;
}

// Автоматическая инициализация при загрузке страницы
if (typeof document !== 'undefined') {
  // Проверяем, что Firebase SDK загружен
  if (typeof firebase !== 'undefined') {
    // Инициализируем после полной загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
      initializeFirebase();
    });
  } else {
    console.error('❌ Firebase SDK не загружен! Убедитесь, что Firebase SDK загружен перед этим скриптом.');
  }
}