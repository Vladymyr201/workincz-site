/**
 * 📝 Registration Logic - Логика многошаговой регистрации
 * Версия: 1.0.0
 * Дата: 30.07.2025
 */

class RegistrationManager {
    constructor() {
        this.currentStep = 1;
        this.selectedRoles = ['jobseeker']; // По умолчанию выбрана роль соискателя
        this.userData = {};
        this.init();
    }

    init() {
        console.log('📝 Registration Manager инициализирован');
        this.setupEventListeners();
        this.updateStepIndicators();
        this.checkGoogleAuth();
        this.checkGoogleAuthResult();
    }

    /**
     * Проверка входа через Google
     */
    checkGoogleAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const googleAuth = urlParams.get('googleAuth');
        const uid = urlParams.get('uid');
        
        if (googleAuth === 'true' && uid) {
            console.log('🔍 Обнаружен вход через Google, UID:', uid);
            this.handleGoogleAuthUser(uid);
        }
    }

    /**
     * Обработка пользователя, вошедшего через Google
     */
    async handleGoogleAuthUser(uid) {
        try {
            // Проверяем, есть ли уже пользователь в Firebase Auth
            if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                const user = window.firebaseAuth.currentUser;
                
                // Заполняем данные пользователя автоматически
                this.userData = {
                    email: user.email,
                    firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                    lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                    phone: user.phoneNumber || '',
                    avatar: user.photoURL || ''
                };
                
                // Переходим сразу к шагу 2 (заполнение профиля)
                this.currentStep = 2;
                document.getElementById('step-1').classList.add('hidden');
                document.getElementById('step-2').classList.remove('hidden');
                this.updateStepIndicators();
                this.showRoleForms();
                
                // Заполняем форму данными пользователя
                this.fillUserData();
                
                console.log('✅ Данные Google пользователя загружены');
            } else {
                console.log('⚠️ Пользователь не найден в Firebase Auth');
            }
        } catch (error) {
            console.error('❌ Ошибка обработки Google пользователя:', error);
        }
    }

    /**
     * Заполнение формы данными пользователя
     */
    fillUserData() {
        if (this.userData.email) {
            const emailInput = document.getElementById('profileEmail');
            if (emailInput) emailInput.value = this.userData.email;
        }
        
        if (this.userData.firstName) {
            const firstNameInput = document.getElementById('profileFirstName');
            if (firstNameInput) firstNameInput.value = this.userData.firstName;
        }
        
        if (this.userData.lastName) {
            const lastNameInput = document.getElementById('profileLastName');
            if (lastNameInput) lastNameInput.value = this.userData.lastName;
        }
        
        if (this.userData.phone) {
            const phoneInput = document.getElementById('profilePhone');
            if (phoneInput) phoneInput.value = this.userData.phone;
        }
    }

    setupEventListeners() {
        // Выбор ролей
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                this.toggleRoleSelection(card);
            });
        });

        // Навигация между шагами
        document.getElementById('next-step-1').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prev-step-2').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('prev-step-3').addEventListener('click', () => {
            this.previousStep();
        });

        // Форма профиля
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileSubmit();
        });

        // Google Sign Up
        document.getElementById('googleSignUp').addEventListener('click', () => {
            this.handleGoogleSignUp();
        });

        // Email Sign Up
        document.getElementById('emailSignUpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailSignUp();
        });

        // Валидация в реальном времени
        this.setupRealTimeValidation();
    }

    /**
     * Настройка валидации в реальном времени
     */
    setupRealTimeValidation() {
        // Валидация email
        const emailInput = document.getElementById('signupEmail');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.validateEmail(e.target.value);
            });
            emailInput.addEventListener('blur', (e) => {
                this.validateEmail(e.target.value);
            });
        }

        // Валидация пароля
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.validatePassword(e.target.value);
            });
        }

        // Валидация подтверждения пароля
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }
    }

    /**
     * Валидация email в реальном времени
     */
    validateEmail(email) {
        const emailValidation = document.getElementById('emailValidation');
        if (!emailValidation) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        if (email.length === 0) {
            this.hideValidation('emailValidation');
        } else if (isValid) {
            this.showValidation('emailValidation', '✓ Email корректный', 'success');
        } else {
            this.showValidation('emailValidation', 'Введите корректный email', 'error');
        }
    }

    /**
     * Валидация пароля в реальном времени
     */
    validatePassword(password) {
        const passwordStrength = document.getElementById('passwordStrength');
        if (!passwordStrength) return;

        if (password.length === 0) {
            this.hideValidation('passwordStrength');
            return;
        }

        // Показываем индикатор силы пароля
        passwordStrength.classList.remove('hidden');

        // Оцениваем силу пароля
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Обновляем индикатор
        const bars = passwordStrength.querySelectorAll('.flex-1');
        const strengthText = passwordStrength.querySelector('p');

        bars.forEach((bar, index) => {
            if (index < strength) {
                if (strength <= 2) {
                    bar.className = 'flex-1 h-1 bg-red-500 rounded';
                } else if (strength <= 3) {
                    bar.className = 'flex-1 h-1 bg-yellow-500 rounded';
                } else {
                    bar.className = 'flex-1 h-1 bg-green-500 rounded';
                }
            } else {
                bar.className = 'flex-1 h-1 bg-gray-200 rounded';
            }
        });

        if (strengthText) {
            if (strength <= 2) {
                strengthText.textContent = 'Слабый пароль';
                strengthText.className = 'text-xs text-red-500 mt-1';
            } else if (strength <= 3) {
                strengthText.textContent = 'Средний пароль';
                strengthText.className = 'text-xs text-yellow-500 mt-1';
            } else {
                strengthText.textContent = 'Сильный пароль';
                strengthText.className = 'text-xs text-green-500 mt-1';
            }
        }

        // Проверяем совпадение паролей
        this.validatePasswordMatch();
    }

    /**
     * Валидация совпадения паролей
     */
    validatePasswordMatch() {
        const passwordMatch = document.getElementById('passwordMatch');
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (!passwordMatch || !password || !confirmPassword) return;

        if (confirmPassword.length === 0) {
            this.hideValidation('passwordMatch');
        } else if (password === confirmPassword) {
            this.showValidation('passwordMatch', '✓ Пароли совпадают', 'success');
        } else {
            this.showValidation('passwordMatch', 'Пароли не совпадают', 'error');
        }
    }

    /**
     * Показать результат валидации
     */
    showValidation(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.remove('hidden');
        element.textContent = message;
        element.className = `text-sm mt-1 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    }

    /**
     * Скрыть результат валидации
     */
    hideValidation(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    /**
     * Переключение выбора ролей
     */
    toggleRoleSelection(card) {
        const role = card.dataset.role;
        
        // Убираем выделение со всех карточек
        document.querySelectorAll('.role-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Добавляем выделение к выбранной карточке
        card.classList.add('selected');
        
        // Обновляем список выбранных ролей
        this.selectedRoles = [role];
        
        console.log('✅ Выбрана роль:', role);
    }

    /**
     * Переход к следующему шагу
     */
    nextStep() {
        if (this.currentStep === 1) {
            // Проверяем, что роль выбрана
            if (this.selectedRoles.length === 0) {
                this.showError('Пожалуйста, выберите хотя бы одну роль');
                return;
            }
        }

        // Скрываем текущий шаг
        document.getElementById(`step-${this.currentStep}`).classList.add('hidden');
        
        // Показываем следующий шаг
        this.currentStep++;
        document.getElementById(`step-${this.currentStep}`).classList.remove('hidden');
        
        // Обновляем индикаторы шагов
        this.updateStepIndicators();
        
        // Если переходим к шагу 2, показываем соответствующие формы
        if (this.currentStep === 2) {
            this.showRoleForms();
        }
    }

    /**
     * Переход к предыдущему шагу
     */
    previousStep() {
        // Скрываем текущий шаг
        document.getElementById(`step-${this.currentStep}`).classList.add('hidden');
        
        // Показываем предыдущий шаг
        this.currentStep--;
        document.getElementById(`step-${this.currentStep}`).classList.remove('hidden');
        
        // Обновляем индикаторы шагов
        this.updateStepIndicators();
    }

    /**
     * Обновление индикаторов шагов
     */
    updateStepIndicators() {
        const indicators = document.querySelectorAll('.step-indicator');
        
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            
            if (index + 1 < this.currentStep) {
                indicator.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                indicator.classList.add('active');
            }
        });
    }

    /**
     * Показ форм для выбранных ролей
     */
    showRoleForms() {
        // Скрываем все формы ролей
        document.querySelectorAll('.role-form').forEach(form => {
            form.classList.add('hidden');
        });

        // Показываем формы для выбранных ролей
        this.selectedRoles.forEach(role => {
            const form = document.getElementById(`${role}Form`);
            if (form) {
                form.classList.remove('hidden');
            }
        });
    }

    /**
     * Обработка отправки формы профиля
     */
    handleProfileSubmit() {
        // Собираем данные формы
        const formData = new FormData(document.getElementById('profileForm'));
        this.userData = Object.fromEntries(formData.entries());
        
        // Добавляем выбранные роли
        this.userData.roles = this.selectedRoles;
        
        console.log('✅ Данные профиля собраны:', this.userData);
        
        // Переходим к следующему шагу
        this.nextStep();
    }

    /**
     * Обработка регистрации через Google
     */
    async handleGoogleSignUp() {
        try {
            if (!window.FirebaseIntegration) {
                throw new Error('Firebase не инициализирован');
            }

            // Проверяем, авторизован ли уже пользователь
            if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                const user = window.firebaseAuth.currentUser;
                console.log('✅ Пользователь уже авторизован через Google:', user.email);
                
                // Заполняем данные пользователя
                this.userData = {
                    email: user.email,
                    firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                    lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                    phone: user.phoneNumber || '',
                    avatar: user.photoURL || ''
                };
                
                // Заполняем форму
                this.fillUserData();
                
                // Переходим к следующему шагу
                this.nextStep();
            } else {
                // Выполняем регистрацию через Google с redirect
                await window.FirebaseIntegration.registerWithGoogle();
                console.log('✅ Перенаправление на Google регистрацию');
            }

        } catch (error) {
            console.error('❌ Ошибка регистрации через Google:', error);
            this.showError('Ошибка регистрации через Google: ' + error.message);
        }
    }

    /**
     * Проверка результата Google аутентификации
     */
    async checkGoogleAuthResult() {
        try {
            if (!window.FirebaseIntegration) {
                return;
            }

            const result = await window.FirebaseIntegration.handleRedirectResult();
            if (result && result.user) {
                console.log('✅ Google аутентификация завершена:', result.user.email);
                
                // Заполняем данные пользователя
                this.userData = {
                    email: result.user.email,
                    firstName: result.user.displayName ? result.user.displayName.split(' ')[0] : '',
                    lastName: result.user.displayName ? result.user.displayName.split(' ').slice(1).join(' ') : '',
                    phone: result.user.phoneNumber || '',
                    avatar: result.user.photoURL || ''
                };
                
                // Заполняем форму
                this.fillUserData();
                
                // Переходим к следующему шагу
                this.nextStep();
            }
        } catch (error) {
            console.error('❌ Ошибка обработки Google аутентификации:', error);
        }
    }

    /**
     * Обработка регистрации по email
     */
    async handleEmailSignUp() {
        try {
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Валидация
            if (!email || !password || !confirmPassword) {
                this.showError('Пожалуйста, заполните все поля');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Пароли не совпадают');
                return;
            }

            if (password.length < 6) {
                this.showError('Пароль должен содержать минимум 6 символов');
                return;
            }

            if (!window.firebaseAuth) {
                throw new Error('Firebase не инициализирован');
            }

            // Создаем аккаунт
            const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
            
            if (userCredential.user) {
                // Регистрируем пользователя с ролями
                await this.registerUserWithRoles(userCredential.user);
            }

        } catch (error) {
            console.error('❌ Ошибка регистрации по email:', error);
            this.handleRegistrationError(error);
        }
    }

    /**
     * Регистрация пользователя с ролями
     */
    async registerUserWithRoles(user) {
        try {
            if (!window.roleSystem) {
                throw new Error('Role System не инициализирована');
            }

            // Добавляем UID пользователя к данным
            this.userData.uid = user.uid;
            this.userData.provider = user.providerData[0]?.providerId || 'email';

            // Регистрируем пользователя с ролями
            const userProfile = await window.roleSystem.registerUser(this.userData, this.selectedRoles);
            
            console.log('✅ Пользователь зарегистрирован:', userProfile);
            
            // Показываем успешное сообщение
            this.showSuccess('Аккаунт создан успешно! Перенаправление в личный кабинет...');
            
            // Перенаправляем в личный кабинет
            setTimeout(() => {
                window.location.href = '../dashboard.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Ошибка регистрации пользователя:', error);
            this.showError('Ошибка создания аккаунта: ' + error.message);
        }
    }

    /**
     * Обработка ошибок регистрации
     */
    handleRegistrationError(error) {
        let message = 'Произошла ошибка при регистрации';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Пользователь с таким email уже существует';
                break;
            case 'auth/invalid-email':
                message = 'Неверный формат email';
                break;
            case 'auth/weak-password':
                message = 'Пароль слишком слабый';
                break;
            case 'auth/operation-not-allowed':
                message = 'Регистрация временно недоступна';
                break;
            default:
                message = error.message || message;
        }

        this.showError(message);
    }

    /**
     * Показ ошибки
     */
    showError(message) {
        // Создаем уведомление об ошибке
        if (window.ModernUI && window.ModernUI.showToast) {
            window.ModernUI.showToast({
                message: message,
                type: 'error',
                duration: 5000
            });
        } else if (window.modernUI && window.modernUI.showToast) {
            window.modernUI.showToast({
                message: message,
                type: 'error',
                duration: 5000
            });
        } else {
            // Fallback - простое уведомление
            alert('Ошибка: ' + message);
        }
    }

    /**
     * Показ успешного сообщения
     */
    showSuccess(message) {
        if (window.ModernUI && window.ModernUI.showToast) {
            window.ModernUI.showToast({
                message: message,
                type: 'success',
                duration: 3000
            });
        } else if (window.modernUI && window.modernUI.showToast) {
            window.modernUI.showToast({
                message: message,
                type: 'success',
                duration: 3000
            });
        } else {
            alert(message);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем инициализации Firebase
    const checkFirebase = setInterval(() => {
        if (window.firebaseAuth && window.roleSystem) {
            clearInterval(checkFirebase);
            new RegistrationManager();
        }
    }, 100);

    // Таймаут на случай, если Firebase не загрузится
    setTimeout(() => {
        clearInterval(checkFirebase);
        if (!window.firebaseAuth) {
            console.error('❌ Firebase не инициализирован');
        }
        if (!window.roleSystem) {
            console.error('❌ Role System не инициализирована');
        }
    }, 10000);
}); 