import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * Firebase конфигурация
 * 
 * ПРИМЕЧАНИЕ: Эта конфигурация должна быть синхронизирована с public/js/firebase-config.js
 * при любых изменениях ключей или значений.
 * 
 * Предпочтительный способ настройки - через переменные окружения.
 * Значения по умолчанию используются только при отсутствии переменных окружения.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "workincz-759c7.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "workincz-759c7",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "workincz-759c7.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "670842817143",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:670842817143:web:d8998634da78318e9f1472",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PB27XT0CT0"
};

/**
 * Валидация Firebase конфигурации
 * @returns {boolean} Результат валидации
 */
export const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('❌ Отсутствуют обязательные поля Firebase конфигурации:', missingFields);
    return false;
  }
  
  return true;
};

// Инициализация Firebase
let app: any;
let auth: any;
let db: any;
let storage: any;
let analytics: any;

/**
 * Инициализируем Firebase только один раз
 * Используется подход singleton
 */
if (typeof window !== 'undefined') {
  // Проверяем валидность конфигурации
  if (!validateFirebaseConfig()) {
    console.error('❌ Firebase конфигурация неполная');
  }
}

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Инициализируем Analytics только в браузере
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  // Подключаем эмуляторы в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    // Раскомментировать для локальной разработки с эмуляторами
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
  }
  
  console.log('✅ Firebase инициализирован успешно');
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  console.log('✅ Firebase уже инициализирован');
}

// Экспортируем сервисы
export { app, auth, db, storage, analytics };

// Экспортируем для совместимости со старым кодом
export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDb = db;
export const firebaseStorage = storage;
export const firebaseAnalytics = analytics;

// Экспортируем конфигурацию
export { firebaseConfig };

/**
 * Получение текущего пользователя
 * @returns {User|null} Текущий аутентифицированный пользователь
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Проверка аутентификации
 * @returns {boolean} Флаг аутентификации
 */
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Получение Firebase токена аутентификации
 * @returns {Promise<string|null>} Токен аутентификации или null
 */
export const getAuthToken = async () => {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(true);
  } catch (error) {
    console.error('❌ Ошибка получения токена аутентификации:', error);
    return null;
  }
};

/**
 * Выход из аккаунта
 * @returns {Promise<{success: boolean, error?: any}>} Результат операции
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    console.log('✅ Выход выполнен успешно');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка при выходе из аккаунта:', error);
    return { success: false, error };
  }
};

/**
 * Получение Google провайдера аутентификации
 * @returns {GoogleAuthProvider} Настроенный Google провайдер
 */
export const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return provider;
};

/**
 * Обработка ошибок Firebase
 * @param {any} error Firebase ошибка
 * @returns {string} Человекочитаемое сообщение об ошибке
 */
export const handleFirebaseError = (error: any) => {
  console.error('❌ Firebase ошибка:', error.code, error.message);
  
  const errorMessages: { [key: string]: string } = {
    'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету.',
    'auth/operation-not-allowed': 'Данный метод входа отключен. Обратитесь к администратору.',
    'auth/user-not-found': 'Пользователь не найден. Проверьте email.',
    'auth/wrong-password': 'Неверный пароль.',
    'auth/email-already-in-use': 'Email уже используется.',
    'auth/weak-password': 'Пароль слишком слабый. Минимум 6 символов.',
    'auth/invalid-email': 'Неверный формат email.',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
    'auth/user-disabled': 'Аккаунт заблокирован.',
    'auth/popup-closed-by-user': 'Окно авторизации было закрыто.',
    'auth/cancelled-popup-request': 'Запрос авторизации был отменен.',
    'auth/popup-blocked': 'Всплывающее окно заблокировано браузером.',
    'auth/account-exists-with-different-credential': 'Аккаунт уже существует с другими данными.',
    'auth/requires-recent-login': 'Требуется повторная авторизация.',
    'auth/id-token-expired': 'Сессия истекла. Войдите снова.',
    'auth/id-token-revoked': 'Сессия отозвана. Войдите снова.',
    'firestore/permission-denied': 'Нет доступа к данным.',
    'firestore/unavailable': 'Сервис временно недоступен.',
    'storage/unauthorized': 'Нет доступа к файлам.',
    'storage/quota-exceeded': 'Превышен лимит хранилища.'
  };
  
  return errorMessages[error.code] || `Ошибка: ${error.message}`;
};

// Инициализация при загрузке модуля в браузере
if (typeof window !== 'undefined') {
  // Экспортируем для глобального доступа (для совместимости)
  (window as any).firebaseApp = app;
  (window as any).firebaseAuth = auth;
  (window as any).firebaseDb = db;
  (window as any).firebaseStorage = storage;
  (window as any).firebaseAnalytics = analytics;
  (window as any).firebaseConfig = firebaseConfig;
  
  // Экспортируем функции для совместимости с legacy кодом
  (window as any).firebase = {
    validateConfig: validateFirebaseConfig,
    getCurrentUser,
    isAuthenticated,
    getAuthToken,
    signOut,
    getGoogleProvider,
    handleError: handleFirebaseError
  };
}

// Экспортируем недостающие функции для совместимости
export { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  User
};

export default {
  app,
  auth,
  db,
  storage,
  analytics,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  signOut,
  getGoogleProvider,
  handleFirebaseError,
  validateFirebaseConfig
};