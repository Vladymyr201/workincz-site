// Firebase Auth - Compat API (Best Practices)

// 1. ПРАВИЛЬНАЯ конфигурация из Project Settings
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

// 2. Инициализация с проверкой
let app, auth, db, provider;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  provider = new firebase.auth.GoogleAuthProvider();
  
  // Настройка провайдера
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log('Firebase Auth инициализирован успешно');
} catch (error) {
  console.error('Ошибка инициализации Firebase:', error);
  showNotification('Ошибка инициализации системы авторизации', 'error');
}

// 3. Обработка ошибок Firebase Auth
function handleAuthError(error) {
  console.error('Auth Error:', error.code, error.message);
  
  const errorMessages = {
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
    'auth/id-token-revoked': 'Сессия отозвана. Войдите снова.'
  };
  
  const message = errorMessages[error.code] || `Ошибка авторизации: ${error.message}`;
  showNotification(message, 'error');
  
  return error;
}

// 4. Улучшенный наблюдатель состояния авторизации
let authStateUnsubscribe, tokenUnsubscribe;

function initializeAuthListeners() {
  // Отписываемся от предыдущих слушателей
  if (authStateUnsubscribe) authStateUnsubscribe();
  if (tokenUnsubscribe) tokenUnsubscribe();
  
  // Слушатель изменения состояния авторизации
  authStateUnsubscribe = auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    
    if (user) {
      // Пользователь авторизован
      console.log('User ID:', user.uid);
      console.log('User Email:', user.email);
      
      // Обновляем UI
      updateUIForAuthState(user);
      
      // Создаем или обновляем профиль
      await createOrUpdateUserProfile(user);
      
      // Если пользователь на странице авторизации
      if (window.location.pathname.includes('/auth/')) {
        showNotification('Вы уже авторизованы!', 'success');
      }
    } else {
      // Пользователь не авторизован
      updateUIForAuthState(null);
    }
  });
  
  // Слушатель изменения токенов
  tokenUnsubscribe = auth.onIdTokenChanged(async (user) => {
    if (user) {
      try {
        // Получаем свежий токен
        const token = await user.getIdToken(true);
        console.log('Token refreshed');
        
        // Сохраняем токен в localStorage для API запросов
        localStorage.setItem('authToken', token);
      } catch (error) {
        console.error('Ошибка обновления токена:', error);
        handleAuthError(error);
      }
    } else {
      // Удаляем токен при выходе
      localStorage.removeItem('authToken');
    }
  });
}

// 5. Функция обновления UI
function updateUIForAuthState(user) {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  
  if (user && loginBtn && registerBtn) {
    // Пользователь авторизован
    loginBtn.textContent = 'Личный кабинет';
    loginBtn.className = 'bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors';
    loginBtn.onclick = () => window.location.href = '/dashboard.html';
    
    registerBtn.textContent = 'Выйти';
    registerBtn.className = 'text-primary-600 hover:text-primary-700 font-medium transition-colors';
    registerBtn.onclick = () => logout();
  } else if (loginBtn && registerBtn) {
    // Пользователь не авторизован
    loginBtn.textContent = 'Войти';
    loginBtn.className = 'text-primary-600 hover:text-primary-700 font-medium transition-colors';
    loginBtn.onclick = () => window.location.href = '/auth/login.html';
    
    registerBtn.textContent = 'Регистрация';
    registerBtn.className = 'bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors';
    registerBtn.onclick = () => window.location.href = '/auth/register.html';
  }
}

// 6. Улучшенные функции аутентификации
const login = async () => {
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    showNotification('Успешный вход!', 'success');
    return user;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

const logout = async () => {
  try {
    await auth.signOut();
    showNotification('Вы вышли из системы', 'info');
    
    // Очищаем локальное хранилище
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // Перенаправляем на главную
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  } catch (error) {
    handleAuthError(error);
  }
};

// 7. Email/Password функции с улучшенной обработкой ошибок
const registerWithEmail = async (email, password) => {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const user = result.user;
    
    showNotification('Регистрация успешна!', 'success');
    return user;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

const loginWithEmail = async (email, password) => {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    showNotification('Успешный вход!', 'success');
    return result.user;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};

// 8. Создание или обновление профиля пользователя
async function createOrUpdateUserProfile(user) {
  try {
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      // Создаем новый профиль
      await userRef.set({
        email: user.email,
        name: user.displayName || user.email,
        image: user.photoURL,
        role: 'candidate',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: new Date()
      });
      console.log('Создан новый профиль пользователя');
    } else {
      // Обновляем существующий профиль
      await userRef.set({
        email: user.email,
        name: user.displayName || user.email,
        image: user.photoURL,
        updatedAt: new Date(),
        lastLogin: new Date()
      }, { merge: true });
      console.log('Обновлен профиль пользователя');
    }
  } catch (error) {
    console.error('Ошибка создания/обновления профиля:', error);
    showNotification('Ошибка обновления профиля', 'error');
  }
}

// 9. Получить текущего пользователя
const getCurrentUser = () => auth.currentUser;

// 10. Проверить, авторизован ли пользователь
const isAuthenticated = () => !!auth.currentUser;

// 11. Получить роль пользователя
const getUserRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    
    if (userSnap.exists) {
      const role = userSnap.data().role || 'candidate';
      // Кэшируем роль в localStorage
      localStorage.setItem('userRole', role);
      return role;
    }
    return 'candidate';
  } catch (error) {
    console.error('Ошибка получения роли:', error);
    return 'candidate';
  }
};

// 12. Смена роли пользователя
const changeUserRole = async (newRole) => {
  const user = auth.currentUser;
  if (!user) {
    showNotification('Пользователь не авторизован', 'error');
    return false;
  }
  
  try {
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
      role: newRole,
      updatedAt: new Date()
    }, { merge: true });
    
    // Обновляем кэш
    localStorage.setItem('userRole', newRole);
    
    showNotification(`Роль изменена на: ${newRole}`, 'success');
    return true;
  } catch (error) {
    console.error('Ошибка смены роли:', error);
    showNotification('Ошибка смены роли: ' + error.message, 'error');
    return false;
  }
};

// 13. Получить токен для API запросов
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Ошибка получения токена:', error);
    return null;
  }
};

// 14. Проверить и обновить токен
const refreshToken = async () => {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    await user.getIdToken(true);
    return true;
  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    return false;
  }
};

// 15. Функция показа уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
  
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };
  
  notification.className += ` ${colors[type]}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// 16. Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  if (auth) {
    initializeAuthListeners();
  }
});

// 17. Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
  if (authStateUnsubscribe) authStateUnsubscribe();
  if (tokenUnsubscribe) tokenUnsubscribe();
});

// Экспортируем функции для использования в других скриптах
window.authFunctions = {
  login,
  logout,
  registerWithEmail,
  loginWithEmail,
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  changeUserRole,
  getAuthToken,
  refreshToken
};