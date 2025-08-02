/**
 * SimpleAuthGuard - Система защиты страниц с простой авторизацией
 * Заменяет Firebase Auth на собственную систему
 */

class SimpleAuthGuard {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('SimpleAuthGuard: Начало инициализации...');
        
        // Ждем инициализации SimpleAuth
        await this.waitForSimpleAuth();
        console.log('SimpleAuthGuard: SimpleAuth готов');
        
        // Подписываемся на изменения состояния аутентификации
        window.simpleAuth.onAuthStateChanged((user) => {
            console.log('SimpleAuthGuard: Изменение состояния авторизации:', user ? user.email : 'null');
            this.currentUser = user;
            this.isInitialized = true;
            this.handleAuthStateChange(user);
        });
        
        console.log('SimpleAuthGuard: Инициализация завершена');
    }

    async waitForSimpleAuth() {
        return new Promise((resolve) => {
            const checkSimpleAuth = () => {
                if (window.simpleAuth && window.simpleAuth.isInitialized) {
                    console.log('SimpleAuthGuard: SimpleAuth найден');
                    resolve();
                } else {
                    setTimeout(checkSimpleAuth, 50);
                }
            };
            checkSimpleAuth();
        });
    }

    handleAuthStateChange(user) {
        if (user) {
            // Пользователь авторизован
            console.log('SimpleAuthGuard: Пользователь авторизован', user.email);
            this.onUserAuthenticated(user);
        } else {
            // Пользователь не авторизован
            console.log('SimpleAuthGuard: Пользователь не авторизован');
            this.onUserUnauthenticated();
        }
    }

    onUserAuthenticated(user) {
        // Обновляем UI для авторизованного пользователя
        this.updateUIForAuthenticatedUser(user);
        
        // Проверяем, нужно ли перенаправить с страницы входа/регистрации
        this.checkRedirectFromAuthPages();
    }

    onUserUnauthenticated() {
        // Обновляем UI для неавторизованного пользователя
        this.updateUIForUnauthenticatedUser();
        
        // Проверяем, нужно ли защитить текущую страницу
        this.checkPageProtection();
    }

    updateUIForAuthenticatedUser(user) {
        // Обновляем кнопки навигации
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');
        const userName = document.getElementById('userName');

        if (loginBtn) {
            loginBtn.textContent = 'Личный кабинет';
            loginBtn.className = 'bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors';
            loginBtn.onclick = () => window.location.href = '/dashboard.html';
        }

        if (registerBtn) {
            registerBtn.textContent = 'Выйти';
            registerBtn.className = 'text-primary-600 hover:text-primary-700 font-medium transition-colors';
            registerBtn.onclick = () => this.logout();
        }

        if (userMenu) {
            userMenu.classList.remove('hidden');
        }

        if (userEmail) {
            userEmail.textContent = user.email;
        }

        if (userName) {
            userName.textContent = user.name;
        }

        // Показываем элементы для авторизованных пользователей
        document.querySelectorAll('.auth-only').forEach(el => {
            el.classList.remove('hidden');
        });

        // Скрываем элементы для неавторизованных пользователей
        document.querySelectorAll('.guest-only').forEach(el => {
            el.classList.add('hidden');
        });
    }

    updateUIForUnauthenticatedUser() {
        // Обновляем кнопки навигации
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');

        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.className = 'text-primary-600 hover:text-primary-700 font-medium transition-colors';
            loginBtn.onclick = () => window.location.href = '/simple-login.html';
        }

        if (registerBtn) {
            registerBtn.textContent = 'Регистрация';
            registerBtn.className = 'bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors';
            registerBtn.onclick = () => window.location.href = '/simple-register.html';
        }

        if (userMenu) {
            userMenu.classList.add('hidden');
        }

        // Скрываем элементы для авторизованных пользователей
        document.querySelectorAll('.auth-only').forEach(el => {
            el.classList.add('hidden');
        });

        // Показываем элементы для неавторизованных пользователей
        document.querySelectorAll('.guest-only').forEach(el => {
            el.classList.remove('hidden');
        });
    }

    checkRedirectFromAuthPages() {
        const currentPath = window.location.pathname;
        const authPages = ['/simple-login.html', '/simple-register.html', '/auth/login.html', '/auth/register.html'];
        
        if (authPages.includes(currentPath)) {
            // Если пользователь авторизован и находится на странице входа, перенаправляем на дашборд
            console.log('SimpleAuthGuard: Перенаправление с страницы авторизации на дашборд');
            window.location.href = '/dashboard.html';
        }
    }

    checkPageProtection() {
        const currentPath = window.location.pathname;
        const protectedPages = ['/dashboard.html', '/profile.html', '/my-applications.html'];
        
        if (protectedPages.includes(currentPath)) {
            // Если пользователь не авторизован и находится на защищенной странице, перенаправляем на вход
            console.log('SimpleAuthGuard: Попытка доступа к защищенной странице без авторизации');
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        this.showNotification('Для доступа к этой странице необходимо войти в систему', 'warning');
        setTimeout(() => {
            window.location.href = '/simple-login.html';
        }, 2000);
    }

    async logout() {
        try {
            await window.simpleAuth.logout();
            this.showNotification('Вы успешно вышли из системы', 'success');
            window.location.href = '/';
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            this.showNotification('Ошибка при выходе из системы', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
        
        // Настраиваем стили в зависимости от типа
        switch (type) {
            case 'success':
                notification.className += ' bg-green-500 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-500 text-white';
                break;
            case 'warning':
                notification.className += ' bg-yellow-500 text-white';
                break;
            default:
                notification.className += ' bg-blue-500 text-white';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    isAuthenticated() {
        const result = this.isInitialized && this.currentUser !== null;
        console.log('SimpleAuthGuard: Проверка авторизации:', result, 'isInitialized:', this.isInitialized, 'currentUser:', this.currentUser ? this.currentUser.email : 'null');
        return result;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    async checkPageAccess(requiredRole = null) {
        if (!this.isAuthenticated()) {
            return false;
        }

        if (!requiredRole) {
            return true;
        }

        return window.simpleAuth.hasRole(requiredRole);
    }
}

// Экспортируем для использования в других модулях
window.SimpleAuthGuard = SimpleAuthGuard; 