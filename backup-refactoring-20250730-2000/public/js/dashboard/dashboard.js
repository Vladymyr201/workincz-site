/**
 * 🏠 Dashboard Logic - Логика личного кабинета
 * Версия: 1.0.0
 * Дата: 30.07.2025
 */

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.userRoles = [];
        this.init();
    }

    init() {
        console.log('🏠 Dashboard Manager инициализирован');
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Переключение ролей
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchRole(tab.dataset.role);
            });
        });

        // Пользовательское меню
        document.getElementById('user-menu-button').addEventListener('click', () => {
            this.toggleUserMenu();
        });

        // Выход из аккаунта
        document.getElementById('sign-out-button').addEventListener('click', () => {
            this.signOut();
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#user-menu-button') && !e.target.closest('#user-dropdown')) {
                this.closeUserMenu();
            }
        });
    }

    /**
     * Проверка состояния аутентификации
     */
    checkAuthState() {
        if (!window.firebaseAuth) {
            console.error('❌ Firebase Auth не инициализирован');
            this.redirectToLogin();
            return;
        }

        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('✅ Пользователь авторизован:', user.email);
                this.currentUser = user;
                await this.loadUserData();
            } else {
                console.log('❌ Пользователь не авторизован');
                this.redirectToLogin();
            }
        });
    }

    /**
     * Загрузка данных пользователя
     */
    async loadUserData() {
        try {
            if (!window.roleSystem) {
                throw new Error('Role System не инициализирована');
            }

            // Загружаем роли пользователя
            const userData = await window.roleSystem.loadUserRoles(this.currentUser.uid);
            
            if (userData) {
                this.userRoles = userData.roles || [];
                this.currentRole = userData.currentRole || this.userRoles[0];
                
                // Обновляем данные пользователя из Firestore
                if (userData.avatar) {
                    this.currentUser.photoURL = userData.avatar;
                }
                if (userData.displayName) {
                    this.currentUser.displayName = userData.displayName;
                }
                
                // Обновляем UI
                this.updateUserInfo();
                this.updateRoleSelector();
                this.showRoleContent();
                
                console.log('✅ Данные пользователя загружены:', userData);
            } else {
                // Пользователь не зарегистрирован с ролями
                this.redirectToRegistration();
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки данных пользователя:', error);
            this.showError('Ошибка загрузки данных: ' + error.message);
        }
    }

    /**
     * Обновление информации о пользователе
     */
    updateUserInfo() {
        const userNameElement = document.getElementById('user-name');
        const currentRoleDisplay = document.getElementById('current-role-display');
        const userAvatar = document.getElementById('user-avatar');
        const userAvatarIcon = document.getElementById('user-avatar-icon');
        const userAvatarImg = document.getElementById('user-avatar-img');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.displayName || this.currentUser.email;
        }
        
        if (currentRoleDisplay && this.currentRole) {
            const roleName = window.RoleSystem.ROLE_NAMES[this.currentRole];
            currentRoleDisplay.textContent = roleName;
        }

        // Обновляем аватар пользователя
        if (userAvatar && userAvatarIcon && userAvatarImg) {
            if (this.currentUser.photoURL) {
                // Показываем фото пользователя
                userAvatarImg.src = this.currentUser.photoURL;
                userAvatarImg.classList.remove('hidden');
                userAvatarIcon.classList.add('hidden');
            } else {
                // Показываем иконку по умолчанию
                userAvatarImg.classList.add('hidden');
                userAvatarIcon.classList.remove('hidden');
            }
        }
    }

    /**
     * Обновление селектора ролей
     */
    updateRoleSelector() {
        const roleSelectorContainer = document.getElementById('role-selector-container');
        const roleTabs = document.querySelectorAll('.role-tab');
        
        if (this.userRoles.length > 1) {
            // Показываем селектор ролей только если у пользователя несколько ролей
            roleSelectorContainer.classList.remove('hidden');
            
            // Обновляем активную роль
            roleTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.role === this.currentRole) {
                    tab.classList.add('active');
                }
                
                // Показываем только доступные роли
                if (this.userRoles.includes(tab.dataset.role)) {
                    tab.style.display = 'block';
                } else {
                    tab.style.display = 'none';
                }
            });
        } else {
            roleSelectorContainer.classList.add('hidden');
        }
    }

    /**
     * Переключение роли
     */
    async switchRole(newRole) {
        try {
            if (!this.userRoles.includes(newRole)) {
                throw new Error('У вас нет доступа к этой роли');
            }

            if (!window.roleSystem) {
                throw new Error('Role System не инициализирована');
            }

            // Переключаем роль
            await window.roleSystem.switchRole(newRole);
            
            this.currentRole = newRole;
            
            // Обновляем UI
            this.updateRoleSelector();
            this.showRoleContent();
            
            console.log('✅ Роль переключена на:', newRole);

        } catch (error) {
            console.error('❌ Ошибка переключения роли:', error);
            this.showError('Ошибка переключения роли: ' + error.message);
        }
    }

    /**
     * Показ контента для текущей роли
     */
    showRoleContent() {
        // Скрываем все дашборды ролей
        document.querySelectorAll('.role-dashboard').forEach(dashboard => {
            dashboard.classList.add('hidden');
        });

        // Показываем дашборд текущей роли
        const currentDashboard = document.getElementById(`${this.currentRole}-dashboard`);
        if (currentDashboard) {
            currentDashboard.classList.remove('hidden');
        }

        // Обновляем отображение текущей роли
        const currentRoleDisplay = document.getElementById('current-role-display');
        if (currentRoleDisplay && this.currentRole) {
            const roleName = window.RoleSystem.ROLE_NAMES[this.currentRole];
            currentRoleDisplay.textContent = roleName;
        }
    }

    /**
     * Переключение пользовательского меню
     */
    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('hidden');
    }

    /**
     * Закрытие пользовательского меню
     */
    closeUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.add('hidden');
    }

    /**
     * Выход из аккаунта
     */
    async signOut() {
        try {
            if (!window.firebaseAuth) {
                throw new Error('Firebase Auth не инициализирован');
            }

            await window.firebaseAuth.signOut();
            console.log('✅ Пользователь вышел из аккаунта');
            
            // Перенаправляем на главную страницу
            window.location.href = 'index.html';

        } catch (error) {
            console.error('❌ Ошибка выхода из аккаунта:', error);
            this.showError('Ошибка выхода: ' + error.message);
        }
    }

    /**
     * Перенаправление на страницу входа
     */
    redirectToLogin() {
        window.location.href = 'auth/login.html';
    }

    /**
     * Перенаправление на страницу регистрации
     */
    redirectToRegistration() {
        window.location.href = 'auth/register.html';
    }

    /**
     * Показ ошибки
     */
    showError(message) {
        if (window.modernUI && window.modernUI.showToast) {
            window.modernUI.showToast({
                message: message,
                type: 'error',
                duration: 5000
            });
        } else {
            alert('Ошибка: ' + message);
        }
    }

    /**
     * Показ успешного сообщения
     */
    showSuccess(message) {
        if (window.modernUI && window.modernUI.showToast) {
            window.modernUI.showToast({
                message: message,
                type: 'success',
                duration: 3000
            });
        } else {
            alert(message);
        }
    }

    /**
     * Загрузка данных для дашборда
     */
    async loadDashboardData() {
        try {
            if (!this.currentRole || !this.currentUser) {
                return;
            }

            // Загружаем данные в зависимости от роли
            switch (this.currentRole) {
                case 'jobseeker':
                    await this.loadJobseekerData();
                    break;
                case 'employer':
                    await this.loadEmployerData();
                    break;
                case 'agency':
                    await this.loadAgencyData();
                    break;
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки данных дашборда:', error);
        }
    }

    /**
     * Загрузка данных для соискателя
     */
    async loadJobseekerData() {
        // Здесь можно загружать реальные данные из Firebase
        console.log('📊 Загрузка данных для соискателя');
    }

    /**
     * Загрузка данных для работодателя
     */
    async loadEmployerData() {
        // Здесь можно загружать реальные данные из Firebase
        console.log('📊 Загрузка данных для работодателя');
    }

    /**
     * Загрузка данных для агентства
     */
    async loadAgencyData() {
        // Здесь можно загружать реальные данные из Firebase
        console.log('📊 Загрузка данных для агентства');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем инициализации Firebase и Role System
    const checkDependencies = setInterval(() => {
        if (window.firebaseAuth && window.roleSystem && window.modernUI) {
            clearInterval(checkDependencies);
            new DashboardManager();
        }
    }, 100);

    // Таймаут на случай, если зависимости не загрузятся
    setTimeout(() => {
        clearInterval(checkDependencies);
        if (!window.firebaseAuth) {
            console.error('❌ Firebase Auth не инициализирован');
        }
        if (!window.roleSystem) {
            console.error('❌ Role System не инициализирована');
        }
        if (!window.modernUI) {
            console.error('❌ Modern UI не инициализирована');
        }
    }, 10000);
}); 