/**
 * Простая система авторизации без Firebase Auth
 * Использует JWT токены и localStorage
 */

class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.authStateCallback = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // Проверяем сохраненный токен
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            try {
                const user = this.parseToken(savedToken);
                if (user && user.exp > Date.now()) {
                    // Убеждаемся, что у пользователя есть uid
                    this.currentUser = this.ensureUserHasUid(user);
                    this.token = savedToken;
                    console.log('SimpleAuth: Восстановлена сессия для', user.email, 'uid:', this.currentUser.uid);
                    
                    // Для демо-пользователей синхронизируем с Firebase Auth
                    if (user.email === 'demo@workincz.cz' && firebase && firebase.auth) {
                        this.syncWithFirebaseAuth();
                    }
                } else {
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('SimpleAuth: Ошибка парсинга токена:', error);
                localStorage.removeItem('authToken');
            }
        }
        
        this.isInitialized = true;
        console.log('SimpleAuth: Инициализирован');
    }

    // Демо-пользователи
    getDemoUsers() {
        return {
            'demo@workincz.cz': {
                password: 'demo123',
                email: 'demo@workincz.cz',
                name: 'Демо Пользователь',
                role: 'user',
                id: 'demo-user-1',
                uid: 'demo-user-1' // Добавляем uid для совместимости с Firestore
            },
            'employer@workincz.cz': {
                password: 'employer123',
                email: 'employer@workincz.cz',
                name: 'Демо Работодатель',
                role: 'employer',
                id: 'demo-employer-1',
                uid: 'demo-employer-1' // Добавляем uid для совместимости с Firestore
            },
            'agency@workincz.cz': {
                password: 'agency123',
                email: 'agency@workincz.cz',
                name: 'Демо Агентство',
                role: 'agency',
                id: 'demo-agency-1',
                uid: 'demo-agency-1' // Добавляем uid для совместимости с Firestore
            },
            'admin@workincz.cz': {
                password: 'admin123',
                email: 'admin@workincz.cz',
                name: 'Администратор',
                role: 'admin',
                id: 'demo-admin-1',
                uid: 'demo-admin-1' // Добавляем uid для совместимости с Firestore
            }
        };
    }

    // Убеждаемся, что у пользователя есть uid
    ensureUserHasUid(user) {
        if (!user.uid && user.id) {
            user.uid = user.id;
        }
        if (!user.uid) {
            user.uid = 'user-' + Date.now();
        }
        return user;
    }

    // Простая генерация JWT токена
    generateToken(user) {
        const payload = {
            id: user.id,
            uid: user.uid || user.id, // Добавляем uid для совместимости
            email: user.email,
            name: user.name,
            role: user.role,
            exp: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        const jsonString = JSON.stringify(payload);
        return btoa(encodeURIComponent(jsonString));
    }

    parseToken(token) {
        try {
            const jsonString = decodeURIComponent(atob(token));
            const payload = JSON.parse(jsonString);
            
            if (payload.exp && payload.exp < Date.now()) {
                return null;
            }
            
            return payload;
        } catch (error) {
            console.error('SimpleAuth: Ошибка парсинга токена:', error);
            return null;
        }
    }

    // Вход
    async login(email, password) {
        console.log('SimpleAuth: Попытка входа для', email);
        
        const users = this.getDemoUsers();
        const user = users[email];
        
        if (!user || user.password !== password) {
            throw new Error('Неверный email или пароль');
        }
        
        // Для демо-пользователей выполняем анонимную аутентификацию Firebase
        if (email === 'demo@workincz.cz') {
            try {
                console.log('SimpleAuth: Выполняем анонимную аутентификацию Firebase для демо-пользователя');
                const userCredential = await firebase.auth().signInAnonymously();
                console.log('SimpleAuth: Анонимная аутентификация Firebase успешна:', userCredential.user.uid);
                
                // Обновляем uid пользователя на реальный Firebase uid
                user.uid = userCredential.user.uid;
                
                // Обновляем токен с новым uid
                this.token = this.generateToken(user);
                localStorage.setItem('authToken', this.token);
            } catch (error) {
                console.error('SimpleAuth: Ошибка анонимной аутентификации Firebase:', error);
                // Продолжаем с локальной аутентификацией
            }
        }
        
        // Убеждаемся, что у пользователя есть uid
        const userWithUid = this.ensureUserHasUid(user);
        
        // Генерируем токен
        this.token = this.generateToken(userWithUid);
        this.currentUser = userWithUid;
        
        // Сохраняем в localStorage
        localStorage.setItem('authToken', this.token);
        
        console.log('SimpleAuth: Успешный вход', user.email);
        
        // Вызываем callback
        if (this.authStateCallback) {
            this.authStateCallback(this.currentUser);
        }
        
        return this.currentUser;
    }

    // Регистрация
    async register(email, password, name = 'Пользователь') {
        console.log('SimpleAuth: Попытка регистрации для', email);

        // Проверяем, что email не занят
        const users = this.getDemoUsers();
        if (users[email]) {
            throw new Error('Пользователь с таким email уже существует');
        }

        // Создаем нового пользователя
        const userId = 'user-' + Date.now();
        const newUser = {
            email: email,
            password: password,
            name: name,
            role: 'user',
            id: userId,
            uid: userId // Добавляем uid для совместимости с Firestore
        };

        // В реальном приложении здесь был бы запрос к серверу
        console.log('SimpleAuth: Новый пользователь создан:', newUser);

        // Автоматически входим
        return this.login(email, password);
    }

    // Анонимный вход
    async anonymousLogin() {
        console.log('SimpleAuth: Анонимный вход');
        
        try {
            // Выполняем анонимную аутентификацию Firebase
            const userCredential = await firebase.auth().signInAnonymously();
            console.log('SimpleAuth: Анонимная аутентификация Firebase успешна:', userCredential.user.uid);
            
            const anonymousId = userCredential.user.uid;
            const anonymousUser = {
                email: 'anonymous@workincz.cz',
                name: 'Анонимный пользователь',
                role: 'user',
                id: anonymousId,
                uid: anonymousId // Используем реальный Firebase uid
            };
            
            // Убеждаемся, что у пользователя есть uid
            const user = this.ensureUserHasUid(anonymousUser);
            
            this.token = this.generateToken(anonymousUser);
            this.currentUser = anonymousUser;
            
            localStorage.setItem('authToken', this.token);
            
            console.log('SimpleAuth: Успешный анонимный вход');
            
            if (this.authStateCallback) {
                this.authStateCallback(this.currentUser);
            }
            
            return this.currentUser;
        } catch (error) {
            console.error('SimpleAuth: Ошибка анонимной аутентификации:', error);
            throw error;
        }
    }

    // Выход
    async logout() {
        console.log('SimpleAuth: Выход');
        
        // Выходим из Firebase Auth
        if (firebase && firebase.auth) {
            try {
                await firebase.auth().signOut();
                console.log('SimpleAuth: Выход из Firebase Auth выполнен');
            } catch (error) {
                console.error('SimpleAuth: Ошибка выхода из Firebase Auth:', error);
            }
        }
        
        // Очищаем локальные данные
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('authToken');
        
        console.log('SimpleAuth: Выход завершен');
        
        // Вызываем callback
        if (this.authStateCallback) {
            this.authStateCallback(null);
        }
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Установка callback для изменения состояния авторизации
    onAuthStateChanged(callback) {
        this.authStateCallback = callback;
        
        // Сразу вызываем callback с текущим состоянием
        if (this.isInitialized) {
            callback(this.currentUser);
        }
        
        // Инициализируем если еще не инициализированы
        if (!this.isInitialized) {
            this.init();
            callback(this.currentUser);
        }
    }

    // Очистка старого токена
    clearOldToken() {
        console.log('SimpleAuth: Очистка старого токена...');
        localStorage.removeItem('authToken');
        this.currentUser = null;
        this.token = null;
        console.log('SimpleAuth: Старый токен очищен');
    }

    // Проверка и обновление токена
    checkAndUpdateToken() {
        if (!this.token) return false;
        
        const user = this.parseToken(this.token);
        if (!user || user.exp < Date.now()) {
            console.log('SimpleAuth: Токен истек, очищаем...');
            this.clearOldToken();
            return false;
        }
        
        // Обновляем currentUser если нужно
        if (!this.currentUser || this.currentUser.id !== user.id) {
            this.currentUser = user;
            console.log('SimpleAuth: Токен обновлен для', user.email);
        }
        
        return true;
    }
    
    // Синхронизация с Firebase Auth
    async syncWithFirebaseAuth() {
        if (!firebase || !firebase.auth) {
            console.warn('SimpleAuth: Firebase не инициализирован для синхронизации');
            return false;
        }
        
        const firebaseUser = firebase.auth().currentUser;
        if (firebaseUser) {
            console.log('SimpleAuth: Синхронизация с Firebase Auth uid:', firebaseUser.uid);
            // Обновляем uid пользователя на Firebase uid
            this.currentUser.uid = firebaseUser.uid;
            this.token = this.generateToken(this.currentUser);
            localStorage.setItem('authToken', this.token);
            console.log('SimpleAuth: UID синхронизирован с Firebase Auth');
            return true;
        } else {
            console.log('SimpleAuth: Firebase Auth не аутентифицирован, выполняем анонимную аутентификацию');
            return await this.ensureFirebaseAuth();
        }
    }
    
    // Принудительная аутентификация Firebase для демо-пользователей
    async ensureFirebaseAuth() {
        if (!firebase || !firebase.auth) {
            console.warn('SimpleAuth: Firebase не инициализирован');
            return false;
        }
        
        const firebaseUser = firebase.auth().currentUser;
        if (firebaseUser) {
            console.log('SimpleAuth: Firebase пользователь уже аутентифицирован:', firebaseUser.uid);
            return true;
        }
        
        // Если это демо-пользователь, выполняем анонимную аутентификацию
        if (this.currentUser && (this.currentUser.email === 'demo@workincz.cz' || this.currentUser.email === 'anonymous@workincz.cz')) {
            try {
                console.log('SimpleAuth: Принудительная анонимная аутентификация Firebase');
                const userCredential = await firebase.auth().signInAnonymously();
                console.log('SimpleAuth: Анонимная аутентификация Firebase успешна:', userCredential.user.uid);
                
                // Обновляем uid пользователя
                this.currentUser.uid = userCredential.user.uid;
                this.token = this.generateToken(this.currentUser);
                localStorage.setItem('authToken', this.token);
                
                return true;
            } catch (error) {
                console.error('SimpleAuth: Ошибка принудительной аутентификации Firebase:', error);
                return false;
            }
        }
        
        return false;
    }
}

// Создаем глобальный экземпляр
window.simpleAuth = new SimpleAuth(); 