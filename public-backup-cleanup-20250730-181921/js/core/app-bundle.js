/**
 * 🚀 ОПТИМИЗИРОВАННЫЙ БАНДЛ ПРИЛОЖЕНИЯ WORKINCZ
 * Объединяет основные функции для улучшения производительности
 */

// Импорт основных модулей
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: "workincz-759c7.firebaseapp.com",
  databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.fil",
  projectId: "workincz-759c7",
  storageBucket: "workincz-759c7.firebasestorage.app",
  messagingSenderId: "670842817143",
  appId: "1:670842817143:web:d8998634da78318e9f1472",
  measurementId: "G-PB27XT0CT0"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🎯 ОСНОВНЫЕ ФУНКЦИИ АУТЕНТИФИКАЦИИ
export const AuthService = {
    // Вход через Google
    loginWithGoogle: () => signInWithPopup(auth, provider).catch(console.error),
    
    // Выход
    logout: () => signOut(auth).then(() => location.replace('/')),
    
    // Регистрация по email
    registerWithEmail: (email, password) => 
        createUserWithEmailAndPassword(auth, email, password),
    
    // Вход по email
    loginWithEmail: (email, password) => 
        signInWithEmailAndPassword(auth, email, password),
    
    // Получить текущего пользователя
    getCurrentUser: () => auth.currentUser,
    
    // Проверить авторизацию
    isAuthenticated: () => !!auth.currentUser,
    
    // Слушатель состояния авторизации
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback)
};

// 🛡️ ЗАЩИТА МАРШРУТОВ
AuthService.onAuthStateChanged(user => {
    const onDashboard = location.pathname.endsWith('/dashboard.html');
    if (!user && onDashboard) {
        location.replace('/');      // нет токена → на логин
    }
    if (user && !onDashboard && location.pathname === '/') {
        location.replace('/dashboard.html'); // есть токен → на дашборд
    }
});

// 📊 УТИЛИТЫ
export const Utils = {
    // Форматирование даты
    formatDate: (date) => new Date(date).toLocaleDateString('ru-RU'),
    
    // Валидация email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Показ уведомлений
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    
    // Загрузка данных
    loadData: async (url) => {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return null;
        }
    }
};

// 🎨 UI КОМПОНЕНТЫ
export const UI = {
    // Показать/скрыть модальное окно
    toggleModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        }
    },
    
    // Обновить статус загрузки
    setLoading: (isLoading) => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = isLoading ? 'block' : 'none';
        }
    },
    
    // Обновить информацию пользователя
    updateUserInfo: (user) => {
        const userInfo = document.getElementById('userInfo');
        if (userInfo && user) {
            userInfo.innerHTML = `
                <h3>Информация о пользователе</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>ID:</strong> ${user.uid}</p>
                <p><strong>Последний вход:</strong> ${Utils.formatDate(user.metadata.lastSignInTime)}</p>
            `;
        }
    }
};

// 🚀 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
export const App = {
    init: () => {
        console.log('🚀 WorkInCZ приложение инициализировано');
        
        // Настройка обработчиков событий
        document.addEventListener('DOMContentLoaded', () => {
            // Обработчик выхода
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', AuthService.logout);
            }
            
            // Обработчики модальных окон
            const authButtons = document.querySelectorAll('[onclick*="showAuthModal"]');
            authButtons.forEach(btn => {
                btn.addEventListener('click', () => UI.toggleModal('authModal'));
            });
        });
    }
};

// Автоматическая инициализация
App.init();

// Экспорт для использования в других модулях
export { auth, app };