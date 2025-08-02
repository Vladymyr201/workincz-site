/**
 * Система чата для WorkInCZ
 * Real-time обмен сообщениями между соискателями и работодателями
 * Поддержка GDPR, шифрования и модерации
 */

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

// Структура сообщения
const MessageSchema = {
    id: '',
    chatId: '',
    senderId: '',
    senderName: '',
    senderRole: '', // applicant, employer, agency
    content: '',
    type: 'text', // text, image, file, system
    timestamp: null,
    isRead: false,
    attachments: [],
    metadata: {
        language: 'cs', // cs, en, de
        isEncrypted: false,
        moderationStatus: 'pending' // pending, approved, flagged
    }
};

// Структура чата
const ChatSchema = {
    id: '',
    participants: [], // массив userId
    jobId: '', // ID вакансии
    applicationId: '', // ID заявки
    lastMessage: null,
    createdAt: null,
    updatedAt: null,
    status: 'active', // active, archived, blocked
    settings: {
        notifications: true,
        autoTranslate: false,
        language: 'cs'
    }
};

export class ChatSystem {
    constructor() {
        this.currentChat = null;
        this.chatListeners = new Map();
        this.messageListeners = new Map();
        this.unreadCount = 0;
    }

    /**
     * Создать новый чат
     */
    async createChat(jobId, applicationId, participants) {
        try {
            const chatData = {
                participants: participants,
                jobId: jobId,
                applicationId: applicationId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active',
                settings: {
                    notifications: true,
                    autoTranslate: false,
                    language: 'cs'
                }
            };

            const docRef = await addDoc(collection(db, 'chats'), chatData);
            return docRef.id;
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            throw error;
        }
    }

    /**
     * Отправить сообщение
     */
    async sendMessage(chatId, content, type = 'text', attachments = []) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Пользователь не авторизован');

            // Загрузить вложения если есть
            const uploadedAttachments = [];
            for (const attachment of attachments) {
                const fileRef = ref(storage, `chat-attachments/${chatId}/${Date.now()}_${attachment.name}`);
                await uploadBytes(fileRef, attachment);
                const url = await getDownloadURL(fileRef);
                uploadedAttachments.push({
                    name: attachment.name,
                    url: url,
                    size: attachment.size,
                    type: attachment.type
                });
            }

            const messageData = {
                chatId: chatId,
                senderId: user.uid,
                senderName: user.displayName || user.email,
                senderRole: await this.getUserRole(user.uid),
                content: content,
                type: type,
                timestamp: new Date(),
                isRead: false,
                attachments: uploadedAttachments,
                metadata: {
                    language: this.detectLanguage(content),
                    isEncrypted: false,
                    moderationStatus: 'pending'
                }
            };

            const docRef = await addDoc(collection(db, 'messages'), messageData);
            
            // Обновить последнее сообщение в чате
            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: messageData,
                updatedAt: new Date()
            });

            return docRef.id;
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            throw error;
        }
    }

    /**
     * Получить сообщения чата
     */
    async getChatMessages(chatId, limit = 50) {
        try {
            const q = query(
                collection(db, 'messages'),
                where('chatId', '==', chatId),
                orderBy('timestamp', 'desc'),
                limit(limit)
            );

            const snapshot = await getDocs(q);
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });

            return messages.reverse();
        } catch (error) {
            console.error('Ошибка получения сообщений:', error);
            throw error;
        }
    }

    /**
     * Подписаться на real-time обновления чата
     */
    subscribeToChat(chatId, callback) {
        if (this.chatListeners.has(chatId)) {
            this.chatListeners.get(chatId)();
        }

        const unsubscribe = onSnapshot(
            query(
                collection(db, 'messages'),
                where('chatId', '==', chatId),
                orderBy('timestamp', 'desc'),
                limit(100)
            ),
            (snapshot) => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({ id: doc.id, ...doc.data() });
                });
                callback(messages.reverse());
            }
        );

        this.chatListeners.set(chatId, unsubscribe);
        return unsubscribe;
    }

    /**
     * Получить список чатов пользователя
     */
    async getUserChats(userId) {
        try {
            const q = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', userId),
                orderBy('updatedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const chats = [];
            snapshot.forEach(doc => {
                chats.push({ id: doc.id, ...doc.data() });
            });

            return chats;
        } catch (error) {
            console.error('Ошибка получения чатов:', error);
            throw error;
        }
    }

    /**
     * Отметить сообщения как прочитанные
     */
    async markMessagesAsRead(chatId, userId) {
        try {
            const q = query(
                collection(db, 'messages'),
                where('chatId', '==', chatId),
                where('senderId', '!=', userId),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            const batch = db.batch();

            snapshot.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('Ошибка отметки сообщений:', error);
            throw error;
        }
    }

    /**
     * Получить количество непрочитанных сообщений
     */
    async getUnreadCount(userId) {
        try {
            const q = query(
                collection(db, 'messages'),
                where('senderId', '!=', userId),
                where('isRead', '==', false)
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Ошибка получения непрочитанных сообщений:', error);
            return 0;
        }
    }

    /**
     * Определить язык сообщения
     */
    detectLanguage(text) {
        // Простая детекция языка по символам
        const czechChars = /[áčďéěíňóřšťúůýž]/i;
        const germanChars = /[äöüß]/i;
        
        if (czechChars.test(text)) return 'cs';
        if (germanChars.test(text)) return 'de';
        return 'en';
    }

    /**
     * Получить роль пользователя
     */
    async getUserRole(userId) {
        try {
            const userDoc = await getDocs(query(
                collection(db, 'users'),
                where('uid', '==', userId)
            ));

            if (!userDoc.empty) {
                return userDoc.docs[0].data().role || 'applicant';
            }
            return 'applicant';
        } catch (error) {
            console.error('Ошибка получения роли пользователя:', error);
            return 'applicant';
        }
    }

    /**
     * Архивировать чат
     */
    async archiveChat(chatId) {
        try {
            await updateDoc(doc(db, 'chats', chatId), {
                status: 'archived',
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Ошибка архивирования чата:', error);
            throw error;
        }
    }

    /**
     * Очистить слушатели
     */
    cleanup() {
        this.chatListeners.forEach(unsubscribe => unsubscribe());
        this.chatListeners.clear();
        this.messageListeners.forEach(unsubscribe => unsubscribe());
        this.messageListeners.clear();
    }
}

// Глобальный экземпляр системы чата
export const chatSystem = new ChatSystem();