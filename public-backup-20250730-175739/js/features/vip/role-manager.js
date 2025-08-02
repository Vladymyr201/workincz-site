// Role Manager - Система управления ролями пользователей (Compat API)
class RoleManager {
    constructor() {
        this.currentUser = null;
        this.currentRole = 'candidate';
        this.isInitialized = false;
        this.roles = {
            candidate: {
                name: 'Кандидат',
                color: 'blue',
                permissions: ['view_jobs', 'apply_jobs', 'view_profile', 'edit_profile']
            },
            employer: {
                name: 'Работодатель',
                color: 'green',
                permissions: ['post_jobs', 'view_applications', 'manage_jobs', 'view_candidates']
            },
            agency: {
                name: 'Агентство',
                color: 'purple',
                permissions: ['post_jobs', 'view_applications', 'manage_jobs', 'view_candidates', 'manage_clients']
            },
            admin: {
                name: 'Администратор',
                color: 'red',
                permissions: ['all']
            }
        };
        
        // Кэш для ролей
        this.roleCache = new Map();
        this.permissionCache = new Map();
    }

    // Инициализация с улучшенной обработкой ошибок
    async init() {
        try {
            // Ждем инициализации Firebase
            await this.waitForFirebase();
            
            // Подписываемся на изменения авторизации
            firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    this.loadUserRole();
                } else {
                    this.currentRole = 'candidate';
                    this.clearCache();
                }
            });

            this.isInitialized = true;
            console.log('RoleManager инициализирован успешно');
        } catch (error) {
            console.error('Ошибка инициализации RoleManager:', error);
            this.showNotification('Ошибка инициализации системы ролей', 'error');
        }
    }

    // Ожидание инициализации Firebase с таймаутом
    waitForFirebase(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Firebase не инициализирован в течение ' + timeout + 'ms'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
        });
    }

    // Загрузка роли пользователя с кэшированием
    async loadUserRole() {
        if (!this.currentUser) return;

        try {
            // Проверяем кэш
            const cachedRole = this.roleCache.get(this.currentUser.uid);
            if (cachedRole) {
                this.currentRole = cachedRole;
                this.updateRoleUI();
                return;
            }

            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentRole = userData.role || 'candidate';
                
                // Кэшируем роль
                this.roleCache.set(this.currentUser.uid, this.currentRole);
                localStorage.setItem('userRole', this.currentRole);
                
                console.log('Роль пользователя загружена:', this.currentRole);
                
                // Обновляем UI
                this.updateRoleUI();
            } else {
                // Создаем профиль пользователя
                await this.createUserProfile();
            }
        } catch (error) {
            console.error('Ошибка загрузки роли:', error);
            this.showNotification('Ошибка загрузки роли пользователя', 'error');
            
            // Используем роль по умолчанию
            this.currentRole = 'candidate';
            this.updateRoleUI();
        }
    }

    // Создание профиля пользователя
    async createUserProfile() {
        if (!this.currentUser) return;

        try {
            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            await userRef.set({
                email: this.currentUser.email,
                name: this.currentUser.displayName || this.currentUser.email,
                image: this.currentUser.photoURL,
                role: 'candidate',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                lastLogin: new Date()
            });
            
            this.currentRole = 'candidate';
            this.roleCache.set(this.currentUser.uid, this.currentRole);
            localStorage.setItem('userRole', this.currentRole);
            
            this.updateRoleUI();
            this.showNotification('Профиль создан успешно!', 'success');
        } catch (error) {
            console.error('Ошибка создания профиля:', error);
            this.showNotification('Ошибка создания профиля', 'error');
        }
    }

    // Смена роли пользователя с валидацией
    async changeRole(newRole) {
        if (!this.currentUser) {
            this.showNotification('Пользователь не авторизован', 'error');
            return false;
        }

        if (!this.roles[newRole]) {
            this.showNotification('Неизвестная роль', 'error');
            return false;
        }

        if (this.currentRole === newRole) {
            this.showNotification('Роль уже установлена', 'info');
            return true;
        }

        try {
            const userRef = firebase.firestore().collection('users').doc(this.currentUser.uid);
            await userRef.update({
                role: newRole,
                updatedAt: new Date()
            });
            
            this.currentRole = newRole;
            this.roleCache.set(this.currentUser.uid, newRole);
            localStorage.setItem('userRole', newRole);
            
            this.updateRoleUI();
            this.showNotification(`Роль изменена на: ${this.roles[newRole].name}`, 'success');
            return true;
        } catch (error) {
            console.error('Ошибка смены роли:', error);
            this.showNotification('Ошибка смены роли: ' + error.message, 'error');
            return false;
        }
    }

    // Обновление UI в зависимости от роли
    updateRoleUI() {
        // Обновляем отображение роли
        const roleElement = document.getElementById('userRole');
        if (roleElement) {
            roleElement.textContent = this.currentRole;
        }

        // Обновляем секции в зависимости от роли
        this.updateRoleSections();
        
        // Обновляем кнопки смены роли
        this.updateRoleButtons();
        
        // Обновляем разрешения
        this.updatePermissions();
    }

    // Обновление секций в зависимости от роли
    updateRoleSections() {
        const sections = ['candidateSection', 'employerSection', 'agencySection'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });

        // Показываем соответствующую секцию
        const currentSection = document.getElementById(`${this.currentRole}Section`);
        if (currentSection) {
            currentSection.style.display = 'block';
        }
    }

    // Обновление кнопок смены роли
    updateRoleButtons() {
        const buttons = ['roleCandidate', 'roleEmployer', 'roleAgency'];
        
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const role = buttonId.replace('role', '').toLowerCase();
                if (role === this.currentRole) {
                    button.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
                    button.disabled = true;
                } else {
                    button.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
                    button.disabled = false;
                }
            }
        });
    }

    // Обновление разрешений
    updatePermissions() {
        const role = this.roles[this.currentRole];
        if (!role) return;

        // Применяем разрешения к элементам интерфейса
        this.applyPermissions(role.permissions);
    }

    // Применение разрешений с кэшированием
    applyPermissions(permissions) {
        // Проверяем кэш разрешений
        const cacheKey = this.currentRole + '_' + permissions.join(',');
        if (this.permissionCache.has(cacheKey)) {
            return;
        }

        // Скрываем/показываем элементы в зависимости от разрешений
        const permissionElements = {
            'post_jobs': ['postJobBtn', 'createJobBtn'],
            'view_applications': ['applicationsBtn', 'viewApplicationsBtn'],
            'manage_jobs': ['manageJobsBtn', 'editJobBtn'],
            'view_candidates': ['candidatesBtn', 'viewCandidatesBtn']
        };

        Object.keys(permissionElements).forEach(permission => {
            const hasPermission = permissions.includes(permission) || permissions.includes('all');
            const elements = permissionElements[permission];
            
            elements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    if (hasPermission) {
                        element.style.display = 'block';
                        element.disabled = false;
                    } else {
                        element.style.display = 'none';
                        element.disabled = true;
                    }
                }
            });
        });

        // Кэшируем результат
        this.permissionCache.set(cacheKey, true);
    }

    // Проверка разрешения с кэшированием
    hasPermission(permission) {
        const role = this.roles[this.currentRole];
        if (!role) return false;
        
        return role.permissions.includes(permission) || role.permissions.includes('all');
    }

    // Получение текущей роли
    getCurrentRole() {
        return this.currentRole;
    }

    // Получение информации о роли
    getRoleInfo(role) {
        return this.roles[role] || null;
    }

    // Получение всех ролей
    getAllRoles() {
        return Object.keys(this.roles);
    }

    // Очистка кэша
    clearCache() {
        this.roleCache.clear();
        this.permissionCache.clear();
        localStorage.removeItem('userRole');
    }

    // Проверка инициализации
    isReady() {
        return this.isInitialized && this.currentUser !== null;
    }

    // Получение роли из кэша
    getCachedRole() {
        return localStorage.getItem('userRole') || 'candidate';
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
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

    // Метод для принудительного обновления роли
    async refreshRole() {
        this.clearCache();
        await this.loadUserRole();
    }

    // Метод для проверки доступности роли
    isRoleAvailable(role) {
        return this.roles.hasOwnProperty(role);
    }

    // Метод для получения всех разрешений текущей роли
    getCurrentPermissions() {
        const role = this.roles[this.currentRole];
        return role ? role.permissions : [];
    }
}

// Создаем глобальный экземпляр
window.roleManager = new RoleManager();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.roleManager.init();
}); 