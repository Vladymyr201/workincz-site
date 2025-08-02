/**
 * 🔥 Firebase Integration - Интеграция Firebase с новым модулем аутентификации
 * Версия: 1.0.0
 * Дата: 30.07.2025
 */

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: "workincz-759c7.firebaseapp.com",
  databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "workincz-759c7",
  storageBucket: "workincz-759c7.firebasestorage.app",
  messagingSenderId: "670842817143",
  appId: "1:670842817143:web:d8998634da78318e9f1472",
  measurementId: "G-PB27XT0CT0"
};

// Инициализация Firebase
let firebaseApp, firebaseAuth, firebaseDb;

function initializeFirebase() {
  try {
    // Проверяем, инициализирован ли уже Firebase
    if (typeof firebase !== 'undefined') {
      try {
        firebaseApp = firebase.app();
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        console.log('✅ Firebase уже инициализирован');
      } catch (error) {
        // Если приложение не инициализировано, создаем новое
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        console.log('✅ Firebase инициализирован успешно');
      }
    } else {
      // Инициализируем Firebase
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore();
      console.log('✅ Firebase инициализирован успешно');
    }
    
    // Настраиваем провайдер Google
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Экспортируем для использования в других модулях
    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuth;
    window.firebaseDb = firebaseDb;
    window.googleProvider = googleProvider;
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    return false;
  }
}

// Функция для загрузки Firebase SDK
function loadFirebaseSDK() {
  return new Promise((resolve, reject) => {
    // Проверяем, загружен ли уже Firebase
    if (typeof firebase !== 'undefined') {
      console.log('✅ Firebase SDK уже загружен');
      resolve();
      return;
    }
    
    // Загружаем Firebase SDK
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js';
    script.onload = () => {
      console.log('✅ Firebase App SDK загружен');
      
      // Загружаем Firebase Auth
      const authScript = document.createElement('script');
      authScript.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js';
      authScript.onload = () => {
        console.log('✅ Firebase Auth SDK загружен');
        
        // Загружаем Firebase Firestore
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js';
        firestoreScript.onload = () => {
          console.log('✅ Firebase Firestore SDK загружен');
          resolve();
        };
        firestoreScript.onerror = () => {
          console.error('❌ Ошибка загрузки Firebase Firestore SDK');
          reject(new Error('Failed to load Firebase Firestore SDK'));
        };
        document.head.appendChild(firestoreScript);
      };
      authScript.onerror = () => {
        console.error('❌ Ошибка загрузки Firebase Auth SDK');
        reject(new Error('Failed to load Firebase Auth SDK'));
      };
      document.head.appendChild(authScript);
    };
    script.onerror = () => {
      console.error('❌ Ошибка загрузки Firebase App SDK');
      reject(new Error('Failed to load Firebase App SDK'));
    };
    document.head.appendChild(script);
  });
}

// Функция для инициализации Firebase и загрузки нового модуля аутентификации
async function initializeFirebaseAuth() {
  try {
    console.log('🚀 Инициализация Firebase Auth...');
    
    // Загружаем Firebase SDK
    await loadFirebaseSDK();
    
    // Инициализируем Firebase
    if (!initializeFirebase()) {
      throw new Error('Failed to initialize Firebase');
    }
    
    // Проверяем, что ModernUI уже загружен
    if (typeof window.ModernUI === 'undefined') {
      console.warn('⚠️ ModernUI не загружен, пропускаем инициализацию');
    } else {
      console.log('✅ ModernUI уже загружен');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase Auth:', error);
    return false;
  }
}

// Функция для проверки состояния аутентификации
function checkAuthState() {
  if (!firebaseAuth) {
    console.warn('⚠️ Firebase Auth не инициализирован');
    return;
  }
  
  firebaseAuth.onAuthStateChanged((user) => {
    console.log('🔄 Состояние аутентификации изменилось:', user ? 'Пользователь авторизован' : 'Пользователь не авторизован');
    
    if (user) {
      console.log('👤 Пользователь:', user.email);
      updateUIForAuthenticatedUser(user);
    } else {
      updateUIForUnauthenticatedUser();
    }
  });
}

// Функция для обновления UI для авторизованного пользователя
function updateUIForAuthenticatedUser(user) {
  // Обновляем элементы навигации
  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(element => {
    if (element.dataset.auth === 'logged-in') {
      element.style.display = 'block';
    } else if (element.dataset.auth === 'logged-out') {
      element.style.display = 'none';
    }
  });
  
  // Обновляем информацию о пользователе
  const userInfoElements = document.querySelectorAll('[data-user-info]');
  userInfoElements.forEach(element => {
    const field = element.dataset.userInfo;
    if (user[field]) {
      element.textContent = user[field];
    }
  });
  
  // Обновляем аватар
  const avatarElements = document.querySelectorAll('[data-user-avatar]');
  avatarElements.forEach(element => {
    if (user.photoURL) {
      element.src = user.photoURL;
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
  
  // Показываем уведомление
  if (window.showToast) {
    window.showToast({
      message: `Добро пожаловать, ${user.displayName || user.email}!`,
      type: 'success',
      duration: 3000
    });
  }
}

// Функция для обновления UI для неавторизованного пользователя
function updateUIForUnauthenticatedUser() {
  // Обновляем элементы навигации
  const authElements = document.querySelectorAll('[data-auth]');
  authElements.forEach(element => {
    if (element.dataset.auth === 'logged-in') {
      element.style.display = 'none';
    } else if (element.dataset.auth === 'logged-out') {
      element.style.display = 'block';
    }
  });
  
  // Очищаем информацию о пользователе
  const userInfoElements = document.querySelectorAll('[data-user-info]');
  userInfoElements.forEach(element => {
    element.textContent = '';
  });
  
  // Скрываем аватар
  const avatarElements = document.querySelectorAll('[data-user-avatar]');
  avatarElements.forEach(element => {
    element.style.display = 'none';
  });
}

// Функция для регистрации через Google
async function registerWithGoogle() {
  try {
    if (!firebaseAuth || !googleProvider) {
      throw new Error('Firebase Auth не инициализирован');
    }
    
    // Используем redirect для регистрации через Google
    await firebaseAuth.signInWithRedirect(googleProvider);
    console.log('✅ Перенаправление на Google регистрацию');
    return { redirect: true };
  } catch (error) {
    console.error('❌ Ошибка регистрации через Google:', error);
    throw error;
  }
}

// Функция для быстрого входа через Google (только для зарегистрированных пользователей)
async function quickSignInWithGoogle() {
  try {
    if (!firebaseAuth || !googleProvider) {
      throw new Error('Firebase Auth не инициализирован');
    }
    
    // Проверяем, есть ли пользователь в базе
    const result = await firebaseAuth.signInWithPopup(googleProvider);
    if (result.user) {
      // Проверяем, зарегистрирован ли пользователь
      const userDoc = await firebaseDb.collection('users').doc(result.user.uid).get();
      if (userDoc.exists) {
        console.log('✅ Быстрый вход через Google выполнен');
        return result;
      } else {
        // Пользователь не зарегистрирован, перенаправляем на регистрацию
        await firebaseAuth.signOut();
        throw new Error('Пользователь не зарегистрирован. Сначала зарегистрируйтесь.');
      }
    }
  } catch (error) {
    console.error('❌ Ошибка быстрого входа через Google:', error);
    throw error;
  }
}

// Функция для обработки результата redirect аутентификации
async function handleRedirectResult() {
  try {
    if (!firebaseAuth) {
      throw new Error('Firebase Auth не инициализирован');
    }
    
    const result = await firebaseAuth.getRedirectResult();
    if (result.user) {
      console.log('✅ Вход через Google выполнен успешно:', result.user.email);
      return result;
    }
    return null;
  } catch (error) {
    console.error('❌ Ошибка обработки redirect результата:', error);
    throw error;
  }
}

// Функция для выхода
async function signOut() {
  try {
    if (!firebaseAuth) {
      throw new Error('Firebase Auth не инициализирован');
    }
    
    await firebaseAuth.signOut();
    console.log('✅ Выход выполнен успешно');
    
    // Показываем уведомление
    if (window.showToast) {
      window.showToast({
        message: 'Выход выполнен успешно',
        type: 'info',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('❌ Ошибка выхода:', error);
    throw error;
  }
}

// Функция для получения текущего пользователя
function getCurrentUser() {
  return firebaseAuth ? firebaseAuth.currentUser : null;
}

// Функция для проверки авторизации
function isAuthenticated() {
  return !!getCurrentUser();
}

// Функция для получения токена
async function getAuthToken() {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    
    return await user.getIdToken(true);
  } catch (error) {
    console.error('❌ Ошибка получения токена:', error);
    return null;
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Инициализация Firebase интеграции...');
  
  try {
    // Инициализируем Firebase Auth
    const success = await initializeFirebaseAuth();
    
    if (success) {
      // Проверяем состояние аутентификации
      checkAuthState();
      
      console.log('✅ Firebase интеграция инициализирована успешно');
    } else {
      console.error('❌ Не удалось инициализировать Firebase интеграцию');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации Firebase интеграции:', error);
  }
});

// Экспортируем функции для использования в других модулях
window.FirebaseIntegration = {
  initializeFirebase,
  initializeFirebaseAuth,
  registerWithGoogle,
  quickSignInWithGoogle,
  handleRedirectResult,
  signOut,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  checkAuthState
}; 