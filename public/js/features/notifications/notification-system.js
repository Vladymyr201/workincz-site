/**
 * Система уведомлений для WorkInCZ
 * Поддержка push, email и in-app уведомлений
 * GDPR-совместимая система с настройками конфиденциальности
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging.js';

const db = getFirestore();
const auth = getAuth();
const messaging = getMessaging();

// Типы уведомлений
export const NotificationType = {
    JOB_APPLICATION: 'job_application',
    APPLICATION_STATUS: 'application_status',
    NEW_MESSAGE: 'new_message',
    JOB_MATCH: 'job_match',
    INTERVIEW_INVITE: 'interview_invite',
    PAYMENT_SUCCESS: 'payment_success',
    VIP_EXPIRY: 'vip_expiry',
    SYSTEM_UPDATE: 'system_update'
};

// Приоритеты уведомлений
export const NotificationPriority = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Каналы доставки
export const DeliveryChannel = {
    IN_APP: 'in_app',
    PUSH: 'push',
    EMAIL: 'email',
    SMS: 'sms'
};

export class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.listeners = new Map();
        this.pushToken = null;
        this.isInitialized = false;
        this.userPreferences = {
            email: true,
            push: true,
            inApp: true,
            sms: false
        };
    }

    /**
     * Инициализация системы уведомлений
     */
    async initialize() {
        try {
            if (this.isInitialized) return;

            // Запросить разрешение на push уведомления
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await this.setupPushNotifications();
                }
            }

            // Загрузить настройки пользователя
            await this.loadUserPreferences();

            // Подписаться на in-app уведомления
            this.subscribeToNotifications();

            this.isInitialized = true;
            console.log('Система уведомлений инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации уведомлений:', error);
        }
    }

    /**
     * Настройка push уведомлений
     */
    async setupPushNotifications() {
        try {
            this.pushToken = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY' // Заменить на реальный ключ
            });

            if (this.pushToken) {
                await this.savePushToken(this.pushToken);
            }

            // Обработка входящих push уведомлений
            onMessage(messaging, (payload) => {
                this.showInAppNotification(payload.data);
            });
        } catch (error) {
            console.error('Ошибка настройки push уведомлений:', error);
        }
    }

    /**
     * Сохранить push токен пользователя
     */
    async savePushToken(token) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await updateDoc(doc(db, 'users', user.uid), {
                pushToken: token,
                pushTokenUpdated: new Date()
            });
        } catch (error) {
            console.error('Ошибка сохранения push токена:', error);
        }
    }

    /**
     * Отправить уведомление
     */
    async sendNotification(userId, type, data, priority = NotificationPriority.NORMAL) {
        try {
            const notificationData = {
                userId: userId,
                type: type,
                data: data,
                priority: priority,
                createdAt: new Date(),
                isRead: false,
                delivered: {
                    inApp: false,
                    push: false,
                    email: false,
                    sms: false
                }
            };

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);

            // Отправить через разные каналы
            await this.deliverNotification(docRef.id, notificationData);

            return docRef.id;
        } catch (error) {
            console.error('Ошибка отправки уведомления:', error);
            throw error;
        }
    }

    /**
     * Доставить уведомление через разные каналы
     */
    async deliverNotification(notificationId, notificationData) {
        try {
            const user = await this.getUser(notificationData.userId);
            if (!user) return;

            const deliveryPromises = [];

            // In-app уведомление
            if (this.userPreferences.inApp) {
                deliveryPromises.push(this.deliverInApp(notificationId, notificationData));
            }

            // Push уведомление
            if (this.userPreferences.push && user.pushToken) {
                deliveryPromises.push(this.deliverPush(user.pushToken, notificationData));
            }

            // Email уведомление
            if (this.userPreferences.email && user.email) {
                deliveryPromises.push(this.deliverEmail(user.email, notificationData));
            }

            // SMS уведомление
            if (this.userPreferences.sms && user.phone) {
                deliveryPromises.push(this.deliverSMS(user.phone, notificationData));
            }

            await Promise.allSettled(deliveryPromises);
        } catch (error) {
            console.error('Ошибка доставки уведомления:', error);
        }
    }

    /**
     * Доставить in-app уведомление
     */
    async deliverInApp(notificationId, notificationData) {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                'delivered.inApp': true,
                'delivered.inAppAt': new Date()
            });

            this.showInAppNotification(notificationData);
        } catch (error) {
            console.error('Ошибка доставки in-app уведомления:', error);
        }
    }

    /**
     * Доставить push уведомление
     */
    async deliverPush(token, notificationData) {
        try {
            // Отправка через Firebase Cloud Functions
            const response = await fetch('/api/send-push-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    notification: this.formatPushNotification(notificationData)
                })
            });

            if (response.ok) {
                await updateDoc(doc(db, 'notifications', notificationData.id), {
                    'delivered.push': true,
                    'delivered.pushAt': new Date()
                });
            }
        } catch (error) {
            console.error('Ошибка доставки push уведомления:', error);
        }
    }

    /**
     * Доставить email уведомление
     */
    async deliverEmail(email, notificationData) {
        try {
            const response = await fetch('/api/send-email-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    notification: this.formatEmailNotification(notificationData)
                })
            });

            if (response.ok) {
                await updateDoc(doc(db, 'notifications', notificationData.id), {
                    'delivered.email': true,
                    'delivered.emailAt': new Date()
                });
            }
        } catch (error) {
            console.error('Ошибка доставки email уведомления:', error);
        }
    }

    /**
     * Доставить SMS уведомление
     */
    async deliverSMS(phone, notificationData) {
        try {
            const response = await fetch('/api/send-sms-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    message: this.formatSMSNotification(notificationData)
                })
            });

            if (response.ok) {
                await updateDoc(doc(db, 'notifications', notificationData.id), {
                    'delivered.sms': true,
                    'delivered.smsAt': new Date()
                });
            }
        } catch (error) {
            console.error('Ошибка доставки SMS уведомления:', error);
        }
    }

    /**
     * Показать in-app уведомление
     */
    showInAppNotification(notificationData) {
        const notification = this.createNotificationElement(notificationData);
        document.body.appendChild(notification);

        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    /**
     * Создать элемент уведомления
     */
    createNotificationElement(notificationData) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 bg-white border-l-4 border-blue-500 shadow-lg rounded-lg p-4 max-w-sm z-50 transform transition-all duration-300 translate-x-full`;
        
        const title = this.getNotificationTitle(notificationData.type);
        const message = this.getNotificationMessage(notificationData.type, notificationData.data);

        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900">${title}</p>
                    <p class="mt-1 text-sm text-gray-500">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span class="sr-only">Закрыть</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Анимация появления
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Обработчик закрытия
        const closeButton = notification.querySelector('button');
        closeButton.addEventListener('click', () => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });

        return notification;
    }

    /**
     * Получить заголовок уведомления
     */
    getNotificationTitle(type) {
        const titles = {
            [NotificationType.JOB_APPLICATION]: 'Новая заявка',
            [NotificationType.APPLICATION_STATUS]: 'Статус заявки обновлен',
            [NotificationType.NEW_MESSAGE]: 'Новое сообщение',
            [NotificationType.JOB_MATCH]: 'Подходящая вакансия',
            [NotificationType.INTERVIEW_INVITE]: 'Приглашение на собеседование',
            [NotificationType.PAYMENT_SUCCESS]: 'Оплата прошла успешно',
            [NotificationType.VIP_EXPIRY]: 'VIP статус истекает',
            [NotificationType.SYSTEM_UPDATE]: 'Обновление системы'
        };
        return titles[type] || 'Уведомление';
    }

    /**
     * Получить сообщение уведомления
     */
    getNotificationMessage(type, data) {
        switch (type) {
            case NotificationType.JOB_APPLICATION:
                return `Получена заявка на вакансию "${data.jobTitle}"`;
            case NotificationType.APPLICATION_STATUS:
                return `Статус заявки изменен на "${data.status}"`;
            case NotificationType.NEW_MESSAGE:
                return `Новое сообщение от ${data.senderName}`;
            case NotificationType.JOB_MATCH:
                return `Найдена подходящая вакансия "${data.jobTitle}"`;
            case NotificationType.INTERVIEW_INVITE:
                return `Приглашение на собеседование ${data.date}`;
            case NotificationType.PAYMENT_SUCCESS:
                return `Оплата на сумму ${data.amount} ${data.currency} прошла успешно`;
            case NotificationType.VIP_EXPIRY:
                return `VIP статус истекает через ${data.daysLeft} дней`;
            case NotificationType.SYSTEM_UPDATE:
                return data.message || 'Система обновлена';
            default:
                return data.message || 'Новое уведомление';
        }
    }

    /**
     * Форматировать push уведомление
     */
    formatPushNotification(notificationData) {
        return {
            title: this.getNotificationTitle(notificationData.type),
            body: this.getNotificationMessage(notificationData.type, notificationData.data),
            icon: '/images/logo-192.png',
            badge: '/images/badge-72.png',
            data: notificationData.data
        };
    }

    /**
     * Форматировать email уведомление
     */
    formatEmailNotification(notificationData) {
        return {
            subject: this.getNotificationTitle(notificationData.type),
            body: this.getNotificationMessage(notificationData.type, notificationData.data),
            template: 'notification',
            data: notificationData.data
        };
    }

    /**
     * Форматировать SMS уведомление
     */
    formatSMSNotification(notificationData) {
        return this.getNotificationMessage(notificationData.type, notificationData.data);
    }

    /**
     * Подписаться на уведомления пользователя
     */
    subscribeToNotifications() {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('isRead', '==', false),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notification = { id: change.doc.id, ...change.doc.data() };
                    this.notifications.unshift(notification);
                    this.showInAppNotification(notification);
                }
            });
        });

        this.listeners.set('notifications', unsubscribe);
    }

    /**
     * Получить уведомления пользователя
     */
    async getUserNotifications(userId, limit = 50) {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );

            const snapshot = await getDocs(q);
            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });

            return notifications;
        } catch (error) {
            console.error('Ошибка получения уведомлений:', error);
            return [];
        }
    }

    /**
     * Отметить уведомление как прочитанное
     */
    async markAsRead(notificationId) {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                isRead: true,
                readAt: new Date()
            });
        } catch (error) {
            console.error('Ошибка отметки уведомления:', error);
        }
    }

    /**
     * Отметить все уведомления как прочитанные
     */
    async markAllAsRead(userId) {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            const batch = db.batch();

            snapshot.forEach(doc => {
                batch.update(doc.ref, {
                    isRead: true,
                    readAt: new Date()
                });
            });

            await batch.commit();
        } catch (error) {
            console.error('Ошибка отметки всех уведомлений:', error);
        }
    }

    /**
     * Загрузить настройки пользователя
     */
    async loadUserPreferences() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userDoc = await getDocs(query(
                collection(db, 'users'),
                where('uid', '==', user.uid)
            ));

            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                this.userPreferences = {
                    ...this.userPreferences,
                    ...userData.notificationPreferences
                };
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек уведомлений:', error);
        }
    }

    /**
     * Обновить настройки уведомлений
     */
    async updatePreferences(preferences) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            this.userPreferences = { ...this.userPreferences, ...preferences };

            await updateDoc(doc(db, 'users', user.uid), {
                notificationPreferences: this.userPreferences
            });
        } catch (error) {
            console.error('Ошибка обновления настроек уведомлений:', error);
        }
    }

    /**
     * Получить пользователя
     */
    async getUser(userId) {
        try {
            const userDoc = await getDocs(query(
                collection(db, 'users'),
                where('uid', '==', userId)
            ));

            if (!userDoc.empty) {
                return userDoc.docs[0].data();
            }
            return null;
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return null;
        }
    }

    /**
     * Очистить слушатели
     */
    cleanup() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
    }
}

// Глобальный экземпляр системы уведомлений
export const notificationSystem = new NotificationSystem();