/**
 * Dashboard Messaging Module
 * Современный интерфейс чатов для личного кабинета WorkInCZ
 * Интеграция с MessagingManager для real-time общения
 */

class DashboardMessaging {
    constructor() {
        this.currentUser = null;
        this.activeChatId = null;
        this.chats = new Map();
        this.messageListeners = new Map();
        this.isInitialized = false;
        
        // DOM элементы
        this.elements = {
            chatsContainer: null,
            messagesContainer: null,
            messageInput: null,
            sendButton: null,
            chatSearch: null,
            unreadCount: null,
            messagesBadge: null,
            noChatsMessage: null,
            noChatSelected: null,
            activeChat: null,
            chatTitle: null,
            chatStatus: null
        };
        
        this.init();
    }

    async init() {
        try {
            // Ждем инициализации Firebase
            if (!window.firebase || !window.db) {
                setTimeout(() => this.init(), 250);
                return;
            }

            this.initializeElements();
            this.setupEventListeners();
            this.setupAuthListener();
            
            this.isInitialized = true;
            console.log('✅ DashboardMessaging инициализирован');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации DashboardMessaging:', error);
        }
    }

    initializeElements() {
        this.elements = {
            chatsContainer: document.getElementById('chats-container'),
            messagesContainer: document.getElementById('messages-container'),
            messageInput: document.getElementById('message-input'),
            sendButton: document.getElementById('send-message-btn'),
            chatSearch: document.getElementById('chat-search'),
            unreadCount: document.getElementById('unread-messages-count'),
            messagesBadge: document.getElementById('messages-badge'),
            noChatsMessage: document.getElementById('no-chats-message'),
            noChatSelected: document.getElementById('no-chat-selected'),
            activeChat: document.getElementById('active-chat'),
            chatTitle: document.getElementById('chat-title'),
            chatStatus: document.getElementById('chat-status'),
            emojiBtn: document.getElementById('emoji-btn'),
            attachBtn: document.getElementById('attach-btn'),
            newChatBtn: document.getElementById('new-chat-btn'),
            messagesSettingsBtn: document.getElementById('messages-settings-btn')
        };
    }

    setupEventListeners() {
        // Отправка сообщения
        this.elements.sendButton?.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Поиск чатов
        this.elements.chatSearch?.addEventListener('input', (e) => this.searchChats(e.target.value));

        // Автоматическое изменение размера textarea
        this.elements.messageInput?.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });

        // Новый чат
        this.elements.newChatBtn?.addEventListener('click', () => this.showNewChatModal());

        // Настройки
        this.elements.messagesSettingsBtn?.addEventListener('click', () => this.showSettingsModal());

        // Мобильная навигация
        const mobileBackBtn = document.getElementById('mobile-back-btn');
        mobileBackBtn?.addEventListener('click', () => this.showChatsList());
    }

    setupAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserChats();
                this.setupPresence();
            } else {
                this.currentUser = null;
                this.cleanup();
            }
        });
    }

    async loadUserChats() {
        if (!this.currentUser) return;

        try {
            // Загружаем чаты пользователя
            const chatsQuery = db.collection('chats')
                .where('participants', 'array-contains', this.currentUser.uid)
                .orderBy('lastMessageTime', 'desc');

            const unsubscribe = chatsQuery.onSnapshot((snapshot) => {
                const chats = [];
                let totalUnread = 0;

                snapshot.docs.forEach(doc => {
                    const chatData = doc.data();
                    const chat = {
                        id: doc.id,
                        ...chatData,
                        otherParticipant: this.getOtherParticipant(doc.id, chatData.participants)
                    };

                    // Подсчитываем непрочитанные сообщения
                    const unreadKey = `unread_${this.currentUser.uid}`;
                    if (chatData[unreadKey]) {
                        totalUnread += chatData[unreadKey];
                    }

                    chats.push(chat);
                    this.chats.set(doc.id, chat);
                });

                this.renderChatsList(chats);
                this.updateUnreadCount(totalUnread);

                // Показываем/скрываем сообщение о пустых чатах
                if (chats.length === 0) {
                    this.elements.noChatsMessage?.classList.remove('hidden');
                } else {
                    this.elements.noChatsMessage?.classList.add('hidden');
                }
            });

            // Сохраняем слушатель
            this.messageListeners.set('chats', unsubscribe);

        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        }
    }

    renderChatsList(chats) {
        if (!this.elements.chatsContainer) return;

        const chatsHTML = chats.map(chat => this.renderChatItem(chat)).join('');
        this.elements.chatsContainer.innerHTML = chatsHTML;

        // Добавляем обработчики кликов
        chats.forEach(chat => {
            const chatElement = document.getElementById(`chat-${chat.id}`);
            if (chatElement) {
                chatElement.addEventListener('click', () => this.openChat(chat.id));
            }
        });
    }

    renderChatItem(chat) {
        const unreadKey = `unread_${this.currentUser.uid}`;
        const unreadCount = chat[unreadKey] || 0;
        const lastMessage = chat.lastMessage || 'Нет сообщений';
        const lastMessageTime = chat.lastMessageTime ? this.formatTime(chat.lastMessageTime.toDate()) : '';
        const isOnline = this.isUserOnline(chat.otherParticipant);

        return `
            <div id="chat-${chat.id}" class="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${this.activeChatId === chat.id ? 'bg-primary/5 border-primary/20' : ''}">
                <div class="relative">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <i class="ri-user-line text-primary"></i>
                    </div>
                    ${isOnline ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <h4 class="text-sm font-medium text-gray-900 truncate">${chat.otherParticipant?.displayName || 'Пользователь'}</h4>
                        <span class="text-xs text-gray-500">${lastMessageTime}</span>
                    </div>
                    <p class="text-sm text-gray-600 truncate">${lastMessage}</p>
                </div>
                ${unreadCount > 0 ? `<div class="bg-primary text-white text-xs px-2 py-1 rounded-full">${unreadCount}</div>` : ''}
            </div>
        `;
    }

    async openChat(chatId) {
        if (this.activeChatId === chatId) return;

        // Закрываем предыдущий чат
        if (this.activeChatId) {
            this.closeChat();
        }

        this.activeChatId = chatId;
        const chat = this.chats.get(chatId);

        if (!chat) return;

        // Обновляем UI
        this.elements.noChatSelected?.classList.add('hidden');
        this.elements.activeChat?.classList.remove('hidden');

        // Мобильная навигация
        this.showChatMessages();

        // Обновляем заголовок чата
        this.elements.chatTitle.textContent = chat.otherParticipant?.displayName || 'Пользователь';
        this.elements.chatStatus.textContent = this.isUserOnline(chat.otherParticipant) ? 'Онлайн' : 'Оффлайн';

        // Загружаем сообщения
        await this.loadChatMessages(chatId);

        // Отмечаем как прочитанные
        await this.markChatAsRead(chatId);

        // Обновляем активный чат в списке
        this.updateActiveChatInList();
    }

    async loadChatMessages(chatId) {
        if (!this.elements.messagesContainer) return;

        try {
            // Очищаем предыдущие сообщения
            this.elements.messagesContainer.innerHTML = '';

            const messagesQuery = db.collection('chats').doc(chatId)
                .collection('messages')
                .orderBy('timestamp', 'asc')
                .limit(50);

            const unsubscribe = messagesQuery.onSnapshot((snapshot) => {
                const messages = [];
                snapshot.docs.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                this.renderMessages(messages);
                this.scrollToBottom();
            });

            // Сохраняем слушатель
            this.messageListeners.set(chatId, unsubscribe);

        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    }

    renderMessages(messages) {
        if (!this.elements.messagesContainer) return;

        const messagesHTML = messages.map(message => this.renderMessage(message)).join('');
        this.elements.messagesContainer.innerHTML = messagesHTML;
    }

    renderMessage(message) {
        const isOwn = message.senderId === this.currentUser.uid;
        const messageTime = message.timestamp ? this.formatTime(message.timestamp.toDate()) : '';
        const messageDate = message.timestamp ? this.formatDate(message.timestamp.toDate()) : '';

        return `
            <div class="flex ${isOwn ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs lg:max-w-md">
                    ${!isOwn ? `
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-xs text-gray-500">${message.senderName || 'Пользователь'}</span>
                            <span class="text-xs text-gray-400">${messageTime}</span>
                        </div>
                    ` : ''}
                    <div class="flex ${isOwn ? 'justify-end' : 'justify-start'}">
                        <div class="px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}">
                            <div class="text-sm">${this.escapeHtml(message.content)}</div>
                            ${isOwn ? `<div class="text-xs opacity-70 mt-1 text-right">${messageTime}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async sendMessage() {
        if (!this.activeChatId || !this.elements.messageInput) return;

        const content = this.elements.messageInput.value.trim();
        if (!content) return;

        try {
            // Очищаем поле ввода
            this.elements.messageInput.value = '';
            this.elements.messageInput.style.height = 'auto';

            // Отправляем сообщение через MessagingManager
            if (window.messagingManager) {
                await window.messagingManager.sendMessage(this.activeChatId, content);
            } else {
                // Fallback - отправляем напрямую
                await this.sendMessageDirect(this.activeChatId, content);
            }

        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            this.showError('Ошибка отправки сообщения');
        }
    }

    async sendMessageDirect(chatId, content) {
        const messageData = {
            content: content,
            senderId: this.currentUser.uid,
            senderName: this.currentUser.displayName || this.currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isRead: false
        };

        await db.collection('chats').doc(chatId)
            .collection('messages').add(messageData);

        // Обновляем информацию о последнем сообщении
        await db.collection('chats').doc(chatId).update({
            lastMessage: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageBy: this.currentUser.uid,
            [`unread_${this.getOtherParticipant(chatId)}`]: firebase.firestore.FieldValue.increment(1)
        });
    }

    async markChatAsRead(chatId) {
        if (!this.currentUser) return;

        try {
            await db.collection('chats').doc(chatId).update({
                [`unread_${this.currentUser.uid}`]: 0
            });
        } catch (error) {
            console.error('Ошибка отметки чата как прочитанного:', error);
        }
    }

    searchChats(query) {
        const chatElements = this.elements.chatsContainer?.querySelectorAll('[id^="chat-"]');
        if (!chatElements) return;

        chatElements.forEach(element => {
            const chatName = element.querySelector('h4')?.textContent || '';
            const isVisible = chatName.toLowerCase().includes(query.toLowerCase());
            element.style.display = isVisible ? 'flex' : 'none';
        });
    }

    updateUnreadCount(count) {
        // Обновляем счетчик в заголовке
        if (this.elements.unreadCount) {
            if (count > 0) {
                this.elements.unreadCount.textContent = count;
                this.elements.unreadCount.classList.remove('hidden');
            } else {
                this.elements.unreadCount.classList.add('hidden');
            }
        }

        // Обновляем счетчик в sidebar
        if (this.elements.messagesBadge) {
            if (count > 0) {
                this.elements.messagesBadge.textContent = count;
                this.elements.messagesBadge.classList.remove('hidden');
            } else {
                this.elements.messagesBadge.classList.add('hidden');
            }
        }
    }

    updateActiveChatInList() {
        // Убираем активный класс со всех чатов
        const chatElements = this.elements.chatsContainer?.querySelectorAll('[id^="chat-"]');
        chatElements?.forEach(element => {
            element.classList.remove('bg-primary/5', 'border-primary/20');
        });

        // Добавляем активный класс к текущему чату
        const activeChatElement = document.getElementById(`chat-${this.activeChatId}`);
        if (activeChatElement) {
            activeChatElement.classList.add('bg-primary/5', 'border-primary/20');
        }
    }

    closeChat() {
        // Отписываемся от слушателя сообщений
        const listener = this.messageListeners.get(this.activeChatId);
        if (listener) {
            listener();
            this.messageListeners.delete(this.activeChatId);
        }

        this.activeChatId = null;
        this.elements.activeChat?.classList.add('hidden');
        this.elements.noChatSelected?.classList.remove('hidden');
        this.updateActiveChatInList();
    }

    showChatMessages() {
        // Показываем область сообщений на мобильных устройствах
        const chatsList = document.getElementById('chats-list');
        const chatMessages = document.getElementById('chat-messages');
        
        if (chatsList && chatMessages) {
            chatsList.classList.add('hidden');
            chatMessages.classList.remove('hidden');
        }
    }

    showChatsList() {
        // Показываем список чатов на мобильных устройствах
        const chatsList = document.getElementById('chats-list');
        const chatMessages = document.getElementById('chat-messages');
        
        if (chatsList && chatMessages) {
            chatsList.classList.remove('hidden');
            chatMessages.classList.add('hidden');
        }
    }

    scrollToBottom() {
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
    }

    // Вспомогательные методы
    getOtherParticipant(chatId, participants) {
        if (!participants) return null;
        const otherId = participants.find(id => id !== this.currentUser.uid);
        return this.chats.get(chatId)?.otherParticipant || { displayName: 'Пользователь' };
    }

    isUserOnline(userId) {
        // Простая проверка - можно расширить
        return Math.random() > 0.5; // Заглушка
    }

    formatTime(date) {
        return date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Показываем ошибку пользователю
        console.error(message);
    }

    setupPresence() {
        // Настройка статуса присутствия
        if (this.currentUser) {
            const presenceRef = db.collection('presence').doc(this.currentUser.uid);
            
            // Отмечаем пользователя как онлайн
            presenceRef.set({
                online: true,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });

            // При отключении отмечаем как оффлайн
            window.addEventListener('beforeunload', () => {
                presenceRef.update({
                    online: false,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        }
    }

    showNewChatModal() {
        // Показываем модальное окно для создания нового чата
        alert('Функция создания нового чата будет добавлена позже');
    }

    showSettingsModal() {
        // Показываем настройки чатов
        alert('Настройки чатов будут добавлены позже');
    }

    cleanup() {
        // Очищаем все слушатели
        this.messageListeners.forEach(listener => listener());
        this.messageListeners.clear();
        
        this.chats.clear();
        this.activeChatId = null;
        this.currentUser = null;
    }
}

// Инициализация модуля
let dashboardMessaging = null;

document.addEventListener('DOMContentLoaded', () => {
    dashboardMessaging = new DashboardMessaging();
});

// Экспорт для использования в других модулях
window.dashboardMessaging = dashboardMessaging; 