/**
 * 🔥 ЕДИНАЯ КОНФИГУРАЦИЯ FIREBASE
 * 
 * Этот файл содержит единую конфигурацию Firebase для всего приложения.
 * Любые изменения параметров Firebase должны выполняться только в этом файле.
 * 
 * @version 1.0.0
 * @date 2025-07-31
 */

// Экспортируем конфигурацию как ES модуль
export const firebaseConfig = {
  apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: "workincz-759c7.firebaseapp.com",
  databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "workincz-759c7",
  storageBucket: "workincz-759c7.firebasestorage.app",
  messagingSenderId: "670842817143",
  appId: "1:670842817143:web:d8998634da78318e9f1472",
  measurementId: "G-PB27XT0CT0"
};

// Для обратной совместимости предоставляем функцию загрузки конфигурации
export const loadFirebaseConfig = () => {
  return firebaseConfig;
};

// Для совместимости с не-ES-модульным кодом
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.loadFirebaseConfig = loadFirebaseConfig;
}

// Функция для проверки валидности конфигурации
export function validateFirebaseConfig() {
  const requiredFields = [
    'apiKey', 
    'authDomain', 
    'projectId', 
    'storageBucket', 
    'messagingSenderId', 
    'appId'
  ];
  
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ В конфигурации Firebase отсутствуют обязательные поля:', missingFields);
    return false;
  }
  
  return true;
}

// Автоматическая валидация конфигурации при загрузке в браузере
if (typeof window !== 'undefined') {
  if (validateFirebaseConfig()) {
    console.log('✅ Конфигурация Firebase валидна');
  }
}

// CommonJS экспорт для совместимости с Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    loadFirebaseConfig,
    validateFirebaseConfig
  };
}