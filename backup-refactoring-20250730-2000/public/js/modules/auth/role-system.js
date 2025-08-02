/**
 * 🎭 Role System - Система управления ролями пользователей
 * Версия: 1.0.0
 * Дата: 30.07.2025
 * 
 * Роли:
 * - jobseeker (Соискатель)
 * - employer (Работодатель) 
 * - agency (Кадровое агентство)
 */

class RoleSystem {
    constructor() {
        this.currentRole = null;
        this.userRoles = [];
        this.init();
    }

    init() {
        console.log('🎭 Role System инициализирована');
    }

    /**
     * Доступные роли в системе
     */
    static get ROLES() {
        return {
            JOBSEEKER: 'jobseeker',
            EMPLOYER: 'employer', 
            AGENCY: 'agency'
        };
    }

    /**
     * Названия ролей на русском
     */
    static get ROLE_NAMES() {
        return {
            [RoleSystem.ROLES.JOBSEEKER]: 'Соискатель',
            [RoleSystem.ROLES.EMPLOYER]: 'Работодатель',
            [RoleSystem.ROLES.AGENCY]: 'Кадровое агентство'
        };
    }

    /**
     * Описания ролей
     */
    static get ROLE_DESCRIPTIONS() {
        return {
            [RoleSystem.ROLES.JOBSEEKER]: 'Ищете работу в Чехии? Создайте профиль и найдите подходящую вакансию',
            [RoleSystem.ROLES.EMPLOYER]: 'Ищете сотрудников? Размещайте вакансии и находите подходящих кандидатов',
            [RoleSystem.ROLES.AGENCY]: 'Предоставляете услуги по подбору персонала? Подключитесь к платформе'
        };
    }

    /**
     * Возможности каждой роли
     */
    static get ROLE_FEATURES() {
        return {
            [RoleSystem.ROLES.JOBSEEKER]: [
                'Просмотр вакансий',
                'Подача заявок',
                'Общение с работодателями',
                'Отслеживание статуса'
            ],
            [RoleSystem.ROLES.EMPLOYER]: [
                'Размещение вакансий',
                'Просмотр кандидатов',
                'Управление заявками',
                'Аналитика'
            ],
            [RoleSystem.ROLES.AGENCY]: [
                'Управление клиентами',
                'Подбор кандидатов',
                'Комиссионные',
                'Аналитика'
            ]
        };
    }

    /**
     * Иконки для ролей
     */
    static get ROLE_ICONS() {
        return {
            [RoleSystem.ROLES.JOBSEEKER]: 'fas fa-user',
            [RoleSystem.ROLES.EMPLOYER]: 'fas fa-building',
            [RoleSystem.ROLES.AGENCY]: 'fas fa-handshake'
        };
    }

    /**
     * Цвета для ролей
     */
    static get ROLE_COLORS() {
        return {
            [RoleSystem.ROLES.JOBSEEKER]: 'blue',
            [RoleSystem.ROLES.EMPLOYER]: 'green',
            [RoleSystem.ROLES.AGENCY]: 'purple'
        };
    }

    /**
     * Регистрация пользователя с ролями
     */
    async registerUser(userData, selectedRoles) {
        try {
            if (!window.firebaseAuth || !window.firebaseDb) {
                throw new Error('Firebase не инициализирован');
            }

            const user = window.firebaseAuth.currentUser;
            if (!user) {
                throw new Error('Пользователь не авторизован');
            }

            // Создаем профиль пользователя
            const userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName || user.displayName || userData.firstName + ' ' + userData.lastName,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || user.phoneNumber || '',
                avatar: userData.avatar || user.photoURL || '',
                provider: userData.provider || user.providerData[0]?.providerId || 'email',
                roles: selectedRoles,
                currentRole: selectedRoles[0], // Первая роль по умолчанию
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };

            // Сохраняем в Firestore
            await window.firebaseDb.collection('users').doc(user.uid).set(userProfile);

            // Инициализируем профили для каждой роли
            for (const role of selectedRoles) {
                await this.initializeRoleProfile(user.uid, role, userData);
            }

            // Устанавливаем текущую роль
            this.currentRole = selectedRoles[0];
            this.userRoles = selectedRoles;

            console.log('✅ Пользователь зарегистрирован с ролями:', selectedRoles);
            return userProfile;

        } catch (error) {
            console.error('❌ Ошибка регистрации пользователя:', error);
            throw error;
        }
    }

    /**
     * Инициализация профиля для конкретной роли
     */
    async initializeRoleProfile(uid, role, userData) {
        try {
            const roleProfile = {
                uid: uid,
                role: role,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };

            // Добавляем специфичные поля для каждой роли
            switch (role) {
                case RoleSystem.ROLES.JOBSEEKER:
                    roleProfile.profile = {
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        birthDate: userData.birthDate || '',
                        location: userData.location || '',
                        skills: userData.skills || [],
                        experience: userData.experience || '',
                        education: userData.education || '',
                        languages: userData.languages || [],
                        resume: null,
                        applications: [],
                        avatar: userData.avatar || ''
                    };
                    break;

                case RoleSystem.ROLES.EMPLOYER:
                    roleProfile.company = {
                        name: userData.companyName || '',
                        description: userData.companyDescription || '',
                        industry: userData.industry || '',
                        size: userData.companySize || '',
                        location: userData.location || '',
                        website: userData.website || '',
                        logo: null,
                        vacancies: [],
                        contactPerson: {
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            phone: userData.phone || ''
                        }
                    };
                    break;

                case RoleSystem.ROLES.AGENCY:
                    roleProfile.agency = {
                        name: userData.agencyName || '',
                        description: userData.agencyDescription || '',
                        services: userData.services || [],
                        location: userData.location || '',
                        website: userData.website || '',
                        logo: null,
                        clients: [],
                        candidates: [],
                        contactPerson: {
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || '',
                            phone: userData.phone || ''
                        }
                    };
                    break;
            }

            // Сохраняем профиль роли
            await window.firebaseDb.collection('roleProfiles').doc(`${uid}_${role}`).set(roleProfile);

            console.log(`✅ Профиль роли ${role} инициализирован`);

        } catch (error) {
            console.error(`❌ Ошибка инициализации профиля роли ${role}:`, error);
            throw error;
        }
    }

    /**
     * Загрузка ролей пользователя
     */
    async loadUserRoles(uid) {
        try {
            if (!window.firebaseDb) {
                throw new Error('Firebase не инициализирован');
            }

            const userDoc = await window.firebaseDb.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.userRoles = userData.roles || [];
                this.currentRole = userData.currentRole || this.userRoles[0];
                
                console.log('✅ Роли пользователя загружены:', this.userRoles);
                return userData;
            } else {
                console.warn('⚠️ Профиль пользователя не найден');
                return null;
            }

        } catch (error) {
            console.error('❌ Ошибка загрузки ролей пользователя:', error);
            throw error;
        }
    }

    /**
     * Переключение роли
     */
    async switchRole(newRole) {
        try {
            if (!this.userRoles.includes(newRole)) {
                throw new Error('У пользователя нет такой роли');
            }

            if (!window.firebaseAuth || !window.firebaseDb) {
                throw new Error('Firebase не инициализирован');
            }

            const user = window.firebaseAuth.currentUser;
            if (!user) {
                throw new Error('Пользователь не авторизован');
            }

            // Обновляем текущую роль в базе
            await window.firebaseDb.collection('users').doc(user.uid).update({
                currentRole: newRole,
                updatedAt: new Date()
            });

            this.currentRole = newRole;
            console.log('✅ Роль переключена на:', newRole);

            // Обновляем UI
            this.updateUIForRole(newRole);

            return newRole;

        } catch (error) {
            console.error('❌ Ошибка переключения роли:', error);
            throw error;
        }
    }

    /**
     * Получение текущей роли
     */
    getCurrentRole() {
        return this.currentRole;
    }

    /**
     * Получение всех ролей пользователя
     */
    getUserRoles() {
        return this.userRoles;
    }

    /**
     * Проверка наличия роли у пользователя
     */
    hasRole(role) {
        return this.userRoles.includes(role);
    }

    /**
     * Обновление UI в зависимости от роли
     */
    updateUIForRole(role) {
        // Обновляем навигацию
        this.updateNavigation(role);
        
        // Обновляем контент страницы
        this.updatePageContent(role);
        
        // Обновляем селектор ролей
        this.updateRoleSelector(role);
    }

    /**
     * Обновление навигации для роли
     */
    updateNavigation(role) {
        const roleName = RoleSystem.ROLE_NAMES[role];
        const roleIcon = RoleSystem.ROLE_ICONS[role];
        
        // Обновляем отображение текущей роли в навигации
        const roleIndicator = document.getElementById('current-role-indicator');
        if (roleIndicator) {
            roleIndicator.innerHTML = `
                <i class="${roleIcon}"></i>
                <span>${roleName}</span>
            `;
        }

        // Показываем/скрываем элементы навигации в зависимости от роли
        this.toggleNavigationItems(role);
    }

    /**
     * Переключение элементов навигации
     */
    toggleNavigationItems(role) {
        // Элементы для соискателей
        const jobseekerItems = document.querySelectorAll('[data-role="jobseeker"]');
        jobseekerItems.forEach(item => {
            item.style.display = role === RoleSystem.ROLES.JOBSEEKER ? 'block' : 'none';
        });

        // Элементы для работодателей
        const employerItems = document.querySelectorAll('[data-role="employer"]');
        employerItems.forEach(item => {
            item.style.display = role === RoleSystem.ROLES.EMPLOYER ? 'block' : 'none';
        });

        // Элементы для агентств
        const agencyItems = document.querySelectorAll('[data-role="agency"]');
        agencyItems.forEach(item => {
            item.style.display = role === RoleSystem.ROLES.AGENCY ? 'block' : 'none';
        });
    }

    /**
     * Обновление контента страницы
     */
    updatePageContent(role) {
        // Обновляем заголовок страницы
        const pageTitle = document.querySelector('[data-role-title]');
        if (pageTitle) {
            pageTitle.textContent = RoleSystem.ROLE_NAMES[role];
        }

        // Обновляем описание
        const pageDescription = document.querySelector('[data-role-description]');
        if (pageDescription) {
            pageDescription.textContent = RoleSystem.ROLE_DESCRIPTIONS[role];
        }

        // Показываем соответствующий контент
        this.showRoleContent(role);
    }

    /**
     * Показ контента для конкретной роли
     */
    showRoleContent(role) {
        // Скрываем все контенты ролей
        const allRoleContents = document.querySelectorAll('[data-role-content]');
        allRoleContents.forEach(content => {
            content.style.display = 'none';
        });

        // Показываем контент текущей роли
        const currentRoleContent = document.querySelector(`[data-role-content="${role}"]`);
        if (currentRoleContent) {
            currentRoleContent.style.display = 'block';
        }
    }

    /**
     * Обновление селектора ролей
     */
    updateRoleSelector(role) {
        const roleSelector = document.getElementById('role-selector');
        if (roleSelector) {
            roleSelector.value = role;
        }

        // Обновляем активную вкладку в селекторе ролей
        const roleTabs = document.querySelectorAll('[data-role-tab]');
        roleTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.roleTab === role) {
                tab.classList.add('active');
            }
        });
    }

    /**
     * Создание селектора ролей
     */
    createRoleSelector() {
        const selector = document.createElement('div');
        selector.className = 'role-selector';
        selector.innerHTML = `
            <div class="role-selector-header">
                <span>Текущая роль:</span>
                <div class="current-role">
                    <i class="${RoleSystem.ROLE_ICONS[this.currentRole]}"></i>
                    <span>${RoleSystem.ROLE_NAMES[this.currentRole]}</span>
                </div>
            </div>
            <div class="role-tabs">
                ${this.userRoles.map(role => `
                    <button class="role-tab ${role === this.currentRole ? 'active' : ''}" 
                            data-role-tab="${role}"
                            onclick="roleSystem.switchRole('${role}')">
                        <i class="${RoleSystem.ROLE_ICONS[role]}"></i>
                        <span>${RoleSystem.ROLE_NAMES[role]}</span>
                    </button>
                `).join('')}
            </div>
        `;
        return selector;
    }
}

// Создаем глобальный экземпляр
const roleSystem = new RoleSystem();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleSystem;
} else {
    window.RoleSystem = RoleSystem;
    window.roleSystem = roleSystem;
} 