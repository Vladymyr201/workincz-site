// MESSAGING MANAGER - Система сообщений и уведомлений для WorkInCZ
// Полноценная система чатов между работодателями и соискателями

class MessagingManager {
    constructor() {
        this.currentUser = null;
        this.activeChats = new Map();
        this.unreadCounts = new Map();
        this.messageListeners = new Map();
        this.notificationSound = null;
        this.isInitialized = false;
        
        this.init();
    }

    // Инициализация системы сообщений
    async init() {
        try {
            // Ждем инициализации Firebase (без предупреждений)
            if (!window.firebase || !window.db) {
                // Проверяем каждые 250мс (вместо 100мс для меньшей нагрузки)
                setTimeout(() => this.init(), 250);
                return;
            }

            // Создаем звук уведомления
            this.createNotificationSound();
            
            // Слушаем изменения аутентификации
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    this.setupUserPresence();
                    this.loadUserChats();
                    this.setupGlobalNotifications();
                } else {
                    this.currentUser = null;
                    this.cleanup();
                }
            });

            this.isInitialized = true;
            console.log('✅ MessagingManager инициализирован');
            
        } catch (error) {
            console.log('🔧 MessagingManager: требуется авторизация для полной функциональности');
        }
    }

    // ======== ОСНОВНЫЕ ФУНКЦИИ ЧАТА ========

    // Создание нового чата между пользователями
    async createChat(participantId, initialMessage = null, jobId = null) {
        if (!this.currentUser) {
            throw new Error('Пользователь не авторизован');
        }

        const participants = [this.currentUser.uid, participantId].sort();
        const chatId = participants.join('_');

        try {
            // Проверяем, существует ли уже чат
            const existingChat = await db.collection('chats').doc(chatId).get();
            
            if (!existingChat.exists) {
                // Создаем новый чат
                await db.collection('chats').doc(chatId).set({
                    participants: participants,
                    participantIds: participants,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessage: null,
                    lastMessageTime: null,
                    lastMessageBy: null,
                    jobId: jobId || null,
                    isActive: true,
                    // Метаданные для участников
                    [`participant_${this.currentUser.uid}`]: await this.getUserInfo(this.currentUser.uid),
                    [`participant_${participantId}`]: await this.getUserInfo(participantId)
                });
            }

            // Отправляем начальное сообщение если есть
            if (initialMessage) {
                await this.sendMessage(chatId, initialMessage);
            }

            return chatId;
            
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            throw error;
        }
    }

    // Отправка сообщения
    async sendMessage(chatId, content, type = 'text', attachments = []) {
        if (!this.currentUser) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            const messageData = {
                content: content.trim(),
                type: type, // 'text', 'image', 'file', 'system'
                senderId: this.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isRead: false,
                attachments: attachments,
                edited: false,
                editedAt: null
            };

            // Добавляем сообщение в коллекцию
            const messageRef = await db.collection('chats').doc(chatId)
                .collection('messages').add(messageData);

            // Обновляем информацию о последнем сообщении в чате
            await db.collection('chats').doc(chatId).update({
                lastMessage: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageBy: this.currentUser.uid,
                [`unread_${this.getOtherParticipant(chatId)}`]: firebase.firestore.FieldValue.increment(1)
            });

            // Отправляем push-уведомление другому участнику
            await this.sendPushNotification(chatId, content);

            return messageRef.id;
            
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            throw error;
        }
    }

    // Получение списка чатов пользователя
    async loadUserChats() {
        if (!this.currentUser) return;

        try {
            const chatsQuery = db.collection('chats')
                .where('participantIds', 'array-contains', this.currentUser.uid)
                .where('isActive', '==', true)
                .orderBy('lastMessageTime', 'desc');

            // Слушаем изменения в реальном времени
            const unsubscribe = chatsQuery.onSnapshot((snapshot) => {
                this.activeChats.clear();
                
                snapshot.docs.forEach(doc => {
                    const chatData = doc.data();
                    this.activeChats.set(doc.id, {
                        id: doc.id,
                        ...chatData
                    });
                });

                this.updateChatsList();
                this.updateUnreadCounts();
            });

            // Сохраняем функцию отписки
            this.chatsListener = unsubscribe;
            
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        }
    }

    // Загрузка сообщений конкретного чата
    async loadChatMessages(chatId, limit = 50) {
        try {
            const messagesQuery = db.collection('chats').doc(chatId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limit);

            // Слушаем новые сообщения в реальном времени
            const unsubscribe = messagesQuery.onSnapshot((snapshot) => {
                const messages = [];
                
                snapshot.docs.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Сортируем по времени (старые -> новые)
                messages.reverse();
                
                this.displayMessages(chatId, messages);
                
                // Отмечаем сообщения как прочитанные
                this.markMessagesAsRead(chatId);
            });

            // Сохраняем слушатель
            this.messageListeners.set(chatId, unsubscribe);
            
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    }

    // ======== УВЕДОМЛЕНИЯ И СТАТУСЫ ========

    // Настройка системы присутствия (онлайн/оффлайн)
    setupUserPresence() {
        if (!this.currentUser) return;

        const userPresenceRef = db.collection('presence').doc(this.currentUser.uid);
        
        // Отмечаем пользователя как онлайн
        userPresenceRef.set({
            isOnline: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            userId: this.currentUser.uid
        });

        // Отмечаем как оффлайн при закрытии страницы
        window.addEventListener('beforeunload', () => {
            userPresenceRef.set({
                isOnline: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.currentUser.uid
            });
        });

        // Обновляем статус каждые 30 секунд
        setInterval(() => {
            userPresenceRef.update({
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }, 30000);
    }

    // Настройка глобальных уведомлений
    setupGlobalNotifications() {
        if (!this.currentUser) return;

        // Слушаем уведомления для текущего пользователя
        const notificationsQuery = db.collection('notifications')
            .where('userId', '==', this.currentUser.uid)
            .where('isRead', '==', false)
            .orderBy('createdAt', 'desc');

        notificationsQuery.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notification = change.doc.data();
                    this.showNotification(notification);
                }
            });
        });
    }

    // Отправка push-уведомления
    async sendPushNotification(chatId, messageContent) {
        try {
            const otherUserId = this.getOtherParticipant(chatId);
            const senderInfo = await this.getUserInfo(this.currentUser.uid);
            
            // Создаем уведомление в Firestore
            await db.collection('notifications').add({
                userId: otherUserId,
                type: 'new_message',
                title: `Новое сообщение от ${senderInfo.name}`,
                body: messageContent.substring(0, 100),
                chatId: chatId,
                senderId: this.currentUser.uid,
                isRead: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Browser notification API (если разрешено)
            if (Notification.permission === 'granted') {
                new Notification(`💬 ${senderInfo.name}`, {
                    body: messageContent,
                    icon: '/favicon.ico',
                    tag: `chat_${chatId}`,
                    requireInteraction: false
                });
            }
            
        } catch (error) {
            console.error('Ошибка отправки уведомления:', error);
        }
    }

    // ======== UI КОМПОНЕНТЫ ========

    // Отображение списка чатов
    updateChatsList() {
        const chatsContainer = document.getElementById('chats-list');
        if (!chatsContainer) return;

        let chatsHTML = '';
        
        this.activeChats.forEach((chat, chatId) => {
            const otherParticipant = this.getOtherParticipantInfo(chat);
            const unreadCount = chat[`unread_${this.currentUser.uid}`] || 0;
            const isOnline = this.isUserOnline(otherParticipant.id);
            
            chatsHTML += `
                <div class="chat-item p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                     onclick="messagingManager.openChat('${chatId}')" data-chat-id="${chatId}">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold">
                                ${otherParticipant.name.charAt(0).toUpperCase()}
                            </div>
                            ${isOnline ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>' : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h4 class="font-medium text-gray-900 truncate">${otherParticipant.name}</h4>
                                <span class="text-xs text-gray-500">${this.formatMessageTime(chat.lastMessageTime)}</span>
                            </div>
                            <p class="text-sm text-gray-600 truncate">${chat.lastMessage || 'Начните общение...'}</p>
                        </div>
                        ${unreadCount > 0 ? `
                            <div class="bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                                ${unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        if (chatsHTML === '') {
            chatsHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="ri-message-3-line text-4xl mb-4 block"></i>
                    <p>У вас пока нет сообщений</p>
                    <p class="text-sm mt-2">Откликнитесь на вакансию или разместите объявление</p>
                </div>
            `;
        }

        chatsContainer.innerHTML = chatsHTML;
    }

    // 💬 СОВРЕМЕННОЕ ОТОБРАЖЕНИЕ СООБЩЕНИЙ С РАСШИРЕННЫМ ФУНКЦИОНАЛОМ
    displayMessages(chatId, messages) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        let messagesHTML = '';
        let lastDate = null;
        let lastSender = null;
        
        messages.forEach((message, index) => {
            const messageDate = this.formatMessageDate(message.timestamp);
            const messageTime = this.formatMessageTime(message.timestamp);
            const isOwn = message.senderId === this.currentUser.uid;
            const isGrouped = lastSender === message.senderId && messageDate === lastDate;
            
            // Показываем разделитель дат
            if (messageDate !== lastDate) {
                messagesHTML += `
                    <div class="text-center my-6">
                        <span class="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full shadow-sm">
                            ${messageDate}
                        </span>
                    </div>
                `;
                lastDate = messageDate;
            }
            
            // 🎨 СОВРЕМЕННОЕ СООБЩЕНИЕ С ПОЛНЫМ ФУНКЦИОНАЛОМ
            messagesHTML += `
                <div class="message-item ${isGrouped ? 'mb-1' : 'mb-4'} ${isOwn ? 'message-own' : 'message-other'}" 
                     data-message-id="${message.id}" 
                     data-sender-id="${message.senderId}"
                     oncontextmenu="messagingManager.showMessageContextMenu(event, '${message.id}')">
                    
                    <div class="flex ${isOwn ? 'justify-end' : 'justify-start'} gap-3 group">
                        
                        <!-- Аватар отправителя (для входящих сообщений) -->
                        ${!isOwn && !isGrouped ? `
                            <div class="relative flex-shrink-0">
                                <div class="w-8 h-8 bg-gradient-to-br from-primary/70 to-primary rounded-full flex items-center justify-center text-white text-sm shadow-md">
                                    ${message.senderName?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </div>
                        ` : (!isOwn && isGrouped ? '<div class="w-8"></div>' : '')}
                        
                        <!-- Контейнер сообщения -->
                        <div class="max-w-[75%] lg:max-w-md xl:max-w-lg">
                            
                            <!-- Имя отправителя (только для групповых чатов) -->
                            ${!isOwn && !isGrouped && message.senderName ? `
                                <div class="text-xs text-gray-500 mb-1 px-2">
                                    ${message.senderName}
                                </div>
                            ` : ''}
                            
                            <!-- Пузырь сообщения -->
                            <div class="message-bubble relative group/bubble ${isOwn ? 
                                'bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl rounded-br-md shadow-lg' : 
                                'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-md border border-gray-100'
                            } p-3 transition-all duration-200 hover:shadow-lg">
                                
                                <!-- Основной контент сообщения -->
                                <div class="message-content">
                                    ${this.renderMessageContent(message)}
                                </div>
                                
                                <!-- Реакции (если есть) -->
                                ${message.reactions && Object.keys(message.reactions).length > 0 ? `
                                    <div class="flex gap-1 mt-2 pt-2 border-t ${isOwn ? 'border-white/20' : 'border-gray-100'}">
                                        ${Object.entries(message.reactions).map(([emoji, users]) => `
                                            <button onclick="messagingManager.toggleReaction('${message.id}', '${emoji}')" 
                                                    class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                                                        users.includes(this.currentUser?.uid) ? 
                                                        'bg-primary/20 text-primary' : 
                                                        'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    } transition-colors">
                                                <span>${emoji}</span>
                                                <span>${users.length}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                
                                <!-- Быстрые действия (появляются при наведении) -->
                                <div class="absolute ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 flex gap-1 px-2">
                                    <!-- Реакция -->
                                    <button onclick="messagingManager.quickReaction('${message.id}', '👍')" 
                                            class="w-7 h-7 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                            title="Поставить лайк">
                                        👍
                                    </button>
                                    <!-- Ответить -->
                                    <button onclick="messagingManager.replyToMessage('${message.id}')" 
                                            class="w-7 h-7 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
                                            title="Ответить">
                                        <i class="ri-reply-line text-xs"></i>
                                    </button>
                                    <!-- Еще действия -->
                                    <button onclick="messagingManager.showMessageActions('${message.id}')" 
                                            class="w-7 h-7 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors"
                                            title="Еще действия">
                                        <i class="ri-more-2-line text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Информация о сообщении -->
                            <div class="flex items-center gap-2 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}">
                                <span class="text-xs text-gray-400">${messageTime}</span>
                                
                                <!-- Статусы доставки для отправленных сообщений -->
                                ${isOwn ? `
                                    <div class="flex items-center gap-1">
                                        ${this.getMessageStatusIcon(message)}
                                    </div>
                                ` : ''}
                                
                                <!-- Отредактировано -->
                                ${message.edited ? `
                                    <span class="text-xs text-gray-400 italic">изменено</span>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Время (для исходящих) с правой стороны -->
                        ${isOwn && !isGrouped ? `
                            <div class="flex-shrink-0 self-end pb-6">
                                <div class="text-xs text-gray-400">${messageTime}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            lastSender = message.senderId;
        });

        messagesContainer.innerHTML = messagesHTML;
        
        // Прокручиваем вниз к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Рендеринг содержимого сообщения
    renderMessageContent(message) {
        switch (message.type) {
            case 'text':
                return this.linkify(this.escapeHtml(message.content));
            case 'image':
                return `<img src="${message.content}" alt="Image" class="max-w-full rounded-lg" onclick="this.requestFullscreen()">`;
            case 'file':
                return `<a href="${message.content}" target="_blank" class="flex items-center gap-2 hover:underline">
                    <i class="ri-file-line"></i>
                    <span>Файл</span>
                </a>`;
            case 'system':
                return `<em>${message.content}</em>`;
            default:
                return this.escapeHtml(message.content);
        }
    }

    // Открытие чата
    async openChat(chatId) {
        try {
            // Показываем окно чата
            this.showChatWindow(chatId);
            
            // Загружаем сообщения
            await this.loadChatMessages(chatId);
            
            // Отмечаем чат как активный
            this.currentChatId = chatId;
            
            // Обновляем UI
            this.updateActiveChatUI(chatId);
            
        } catch (error) {
            console.error('Ошибка открытия чата:', error);
        }
    }

    // Показ окна чата
    showChatWindow(chatId) {
        const chat = this.activeChats.get(chatId);
        if (!chat) return;

        const otherParticipant = this.getOtherParticipantInfo(chat);
        
        // Создаем или обновляем окно чата
        let chatWindow = document.getElementById('chat-window');
        if (!chatWindow) {
            chatWindow = this.createChatWindow();
        }

        // Обновляем заголовок чата
        const chatHeader = chatWindow.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="ri-drag-move-line text-gray-400"></i>
                    <button onclick="messagingManager.closeChatWindow()" class="text-gray-500 hover:text-gray-700 lg:hidden">
                        <i class="ri-arrow-left-line text-xl"></i>
                    </button>
                    <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold">
                        ${otherParticipant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900">${otherParticipant.name}</h3>
                        <p class="text-sm text-gray-500">${this.getUserStatus(otherParticipant.id)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="messagingManager.toggleChatOptions('${chatId}')" class="text-gray-500 hover:text-gray-700 z-10" style="pointer-events: auto;">
                        <i class="ri-more-line text-xl"></i>
                    </button>
                    <button onclick="messagingManager.closeChatWindow()" class="text-gray-500 hover:text-gray-700 hidden lg:block z-10" style="pointer-events: auto;">
                        <i class="ri-close-line text-xl"></i>
                    </button>
                </div>
            `;
        }

        chatWindow.classList.remove('hidden');
        chatWindow.classList.add('flex');
    }

    // 🎨 СОЗДАНИЕ ОПТИМИЗИРОВАННОГО ОКНА ЧАТА (БЕЗ ЛАГОВ)
    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'chat-window';
        chatWindow.className = 'fixed inset-0 lg:inset-auto lg:bottom-4 lg:right-4 lg:w-[400px] lg:h-[600px] bg-white border lg:border-gray-200 lg:rounded-2xl lg:shadow-lg flex-col z-70 hidden';
        
        chatWindow.innerHTML = `
            <!-- 🎯 ОПТИМИЗИРОВАННАЯ ШАПКА ЧАТА -->
            <div class="chat-header flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 lg:rounded-t-2xl cursor-move select-none" onmousedown="startDragChatWindow(event)">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <div id="chat-avatar" class="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            👤
                        </div>
                        <div id="chat-online-indicator" class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full hidden"></div>
                    </div>
                    <div>
                        <h3 id="chat-title" class="font-semibold text-gray-900 text-sm">Чат</h3>
                        <p id="chat-status" class="text-xs text-gray-500">онлайн</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <!-- Поиск в чате -->
                    <button onclick="messagingManager.toggleChatSearch()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Поиск">
                        <i class="ri-search-line text-base"></i>
                    </button>
                    <!-- Настройки -->
                    <button onclick="messagingManager.openChatSettings()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Настройки">
                        <i class="ri-settings-3-line text-base"></i>
                    </button>
                    <!-- Закрыть -->
                    <button onclick="messagingManager.closeChatWindow()" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Закрыть">
                        <i class="ri-close-line text-base"></i>
                    </button>
                </div>
            </div>

            <!-- 🔍 ПОИСК ПО СООБЩЕНИЯМ (СКРЫТЫЙ) -->
            <div id="chat-search-panel" class="hidden p-3 border-b border-gray-100 bg-yellow-50">
                <div class="flex gap-2">
                    <input type="text" id="chat-search-input" placeholder="Поиск сообщений..." 
                           class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none">
                    <button onclick="messagingManager.searchMessages()" class="bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary/90">
                        <i class="ri-search-line"></i>
                    </button>
                </div>
            </div>
            
            <!-- 💬 ОПТИМИЗИРОВАННАЯ ОБЛАСТЬ СООБЩЕНИЙ -->
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 bg-white space-y-3">
                <div class="text-center text-gray-500 text-sm py-8">
                    <i class="ri-chat-3-line text-2xl mb-2 block text-gray-300"></i>
                    Начните общение...
                </div>
            </div>

            <!-- ⌨️ СТАТУС "ПЕЧАТАЕТ..." -->
            <div id="typing-indicator" class="hidden px-4 py-2 text-sm text-gray-500 bg-gray-50">
                <div class="flex items-center gap-2">
                    <div class="flex gap-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span id="typing-user">Пользователь печатает...</span>
                </div>
            </div>
            
            <!-- 📝 РАСШИРЕННАЯ ФОРМА ОТПРАВКИ -->
            <div class="p-4 border-t border-gray-100 bg-white lg:rounded-b-2xl">
                <!-- Панель инструментов -->
                <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <button type="button" onclick="messagingManager.attachFile()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Прикрепить файл">
                        <i class="ri-attachment-line"></i>
                    </button>
                    <button type="button" onclick="messagingManager.recordVoice()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Голосовое сообщение">
                        <i class="ri-mic-line"></i>
                    </button>
                    <button type="button" onclick="messagingManager.insertEmoji()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Эмодзи">
                        <i class="ri-emotion-line"></i>
                    </button>
                    <div class="flex-1"></div>
                    <button type="button" onclick="messagingManager.toggleTranslation()" class="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Автоперевод">
                        <i class="ri-translate-2"></i>
                    </button>
                </div>
                
                <!-- Основная форма -->
                <form id="message-form" class="flex gap-3">
                    <div class="flex-1 relative">
                        <textarea id="message-input" 
                                  placeholder="Введите сообщение..." 
                                  rows="1"
                                  class="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-sm transition-all duration-200"
                                  onkeydown="messagingManager.handleInputKeydown(event)"
                                  oninput="messagingManager.handleInputChange(event)"></textarea>
                        <!-- Счетчик символов -->
                        <div id="char-counter" class="absolute bottom-2 right-3 text-xs text-gray-400 hidden">0/500</div>
                    </div>
                    <button type="submit" 
                            id="send-button"
                            class="bg-primary text-white px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="ri-send-plane-line text-base"></i>
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(chatWindow);

        // Обработчик отправки сообщений
        const messageForm = chatWindow.querySelector('#message-form');
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        return chatWindow;
    }

    // ======== НОВЫЕ ПРОДВИНУТЫЕ ФУНКЦИИ ЧАТА ========

    // 📊 Получение иконки статуса сообщения
    getMessageStatusIcon(message) {
        const now = Date.now();
        const messageTime = message.timestamp?.toDate?.()?.getTime() || now;
        
        if (message.isRead) {
            // Прочитано - синие двойные галочки
            return '<i class="ri-check-double-line text-blue-500 text-sm" title="Прочитано"></i>';
        } else if (message.delivered || (now - messageTime > 5000)) {
            // Доставлено - серые двойные галочки
            return '<i class="ri-check-double-line text-gray-400 text-sm" title="Доставлено"></i>';
        } else {
            // Отправлено - одна серая галочка
            return '<i class="ri-check-line text-gray-400 text-sm" title="Отправлено"></i>';
        }
    }

    // 📋 Показ контекстного меню сообщения
    showMessageContextMenu(event, messageId) {
        event.preventDefault();
        
        // Удаляем существующее меню
        const existingMenu = document.getElementById('message-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const message = this.findMessageById(messageId);
        if (!message) return;

        const menu = document.createElement('div');
        menu.id = 'message-context-menu';
        menu.className = 'fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-[100] min-w-[180px]';
        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';

        const isOwn = message.senderId === this.currentUser?.uid;

        menu.innerHTML = `
            <!-- Копировать -->
            <button onclick="messagingManager.copyMessage('${messageId}')" 
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm">
                <i class="ri-file-copy-line text-gray-500"></i>
                Копировать текст
            </button>
            
            <!-- Перевести -->
            <button onclick="messagingManager.translateMessage('${messageId}')" 
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm">
                <i class="ri-translate-2 text-gray-500"></i>
                Перевести
            </button>
            
            <!-- Ответить -->
            <button onclick="messagingManager.replyToMessage('${messageId}')" 
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm">
                <i class="ri-reply-line text-gray-500"></i>
                Ответить
            </button>
            
            <!-- Переслать -->
            <button onclick="messagingManager.forwardMessage('${messageId}')" 
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm">
                <i class="ri-share-forward-line text-gray-500"></i>
                Переслать
            </button>
            
            <div class="border-t border-gray-100 my-1"></div>
            
            <!-- Реакции -->
            <div class="px-4 py-2">
                <div class="text-xs text-gray-500 mb-2">Быстрые реакции:</div>
                <div class="flex gap-2">
                    ${['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => `
                        <button onclick="messagingManager.quickReaction('${messageId}', '${emoji}')" 
                                class="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-base transition-colors">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            ${isOwn ? `
                <div class="border-t border-gray-100 my-1"></div>
                
                <!-- Редактировать (только свои сообщения) -->
                <button onclick="messagingManager.editMessage('${messageId}')" 
                        class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm">
                    <i class="ri-edit-line text-gray-500"></i>
                    Редактировать
                </button>
                
                <!-- Удалить -->
                <button onclick="messagingManager.deleteMessage('${messageId}')" 
                        class="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 text-sm">
                    <i class="ri-delete-bin-line text-red-500"></i>
                    Удалить
                </button>
            ` : ''}
        `;

        document.body.appendChild(menu);

        // Закрытие меню при клике вне его
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    // 📋 Копирование сообщения
    async copyMessage(messageId) {
        const message = this.findMessageById(messageId);
        if (!message) return;

        try {
            await navigator.clipboard.writeText(message.content);
            this.showSuccessToast('Сообщение скопировано');
        } catch (error) {
            console.error('Ошибка копирования:', error);
            this.showErrorToast('Не удалось скопировать');
        }

        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // 🌍 Перевод сообщения
    async translateMessage(messageId) {
        const message = this.findMessageById(messageId);
        if (!message) return;

        try {
            // Показываем индикатор загрузки
            const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
            if (messageElement) {
                const originalContent = messageElement.innerHTML;
                messageElement.innerHTML = `
                    ${originalContent}
                    <div class="mt-2 p-2 bg-yellow-50 rounded-lg text-sm text-gray-600 flex items-center gap-2">
                        <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        Переводим...
                    </div>
                `;

                // Используем Google Translate API (или локальное решение)
                const translatedText = await this.translateText(message.content, 'ru');
                
                messageElement.innerHTML = `
                    ${originalContent}
                    <div class="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                        <div class="text-xs text-blue-600 mb-1 flex items-center gap-2">
                            <i class="ri-translate-2"></i>
                            Перевод на русский:
                        </div>
                        <div class="text-sm text-gray-800">${translatedText}</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Ошибка перевода:', error);
            this.showErrorToast('Не удалось перевести сообщение');
        }

        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // 🌍 Функция перевода текста
    async translateText(text, targetLang = 'ru') {
        try {
            // Простое решение с использованием публичного API
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                return data.responseData.translatedText;
            }
            
            // Fallback - простая замена часто используемых фраз
            const translations = {
                'hello': 'привет',
                'good morning': 'доброе утро',
                'thank you': 'спасибо',
                'yes': 'да',
                'no': 'нет'
            };
            
            return translations[text.toLowerCase()] || `[Перевод: ${text}]`;
            
        } catch (error) {
            console.error('Ошибка перевода:', error);
            return `[Не удалось перевести: ${text}]`;
        }
    }

    // 😀 Быстрая реакция на сообщение
    async quickReaction(messageId, emoji) {
        try {
            const messageRef = db.collection('chats').doc(this.currentChatId)
                .collection('messages').doc(messageId);
            
            await db.runTransaction(async (transaction) => {
                const messageDoc = await transaction.get(messageRef);
                const messageData = messageDoc.data();
                
                const reactions = messageData.reactions || {};
                const emojiReactions = reactions[emoji] || [];
                
                if (emojiReactions.includes(this.currentUser.uid)) {
                    // Убираем реакцию
                    reactions[emoji] = emojiReactions.filter(uid => uid !== this.currentUser.uid);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    // Добавляем реакцию
                    reactions[emoji] = [...emojiReactions, this.currentUser.uid];
                }
                
                transaction.update(messageRef, { reactions });
            });
            
        } catch (error) {
            console.error('Ошибка добавления реакции:', error);
        }

        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // 💬 Ответ на сообщение
    replyToMessage(messageId) {
        const message = this.findMessageById(messageId);
        if (!message) return;

        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            // Добавляем контекст ответа
            const replyContext = document.createElement('div');
            replyContext.className = 'reply-context p-3 border-l-4 border-primary bg-primary/5 rounded-r-lg mb-3';
            replyContext.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-primary font-medium">
                        <i class="ri-reply-line mr-1"></i>
                        Ответ на сообщение
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="ri-close-line"></i>
                    </button>
                </div>
                <div class="text-sm text-gray-600 truncate">${message.content}</div>
            `;
            
            messageInput.parentElement.parentElement.insertBefore(replyContext, messageInput.parentElement);
            messageInput.focus();
            messageInput.dataset.replyTo = messageId;
        }

        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // ⌨️ Обработка ввода с клавиатуры
    handleInputKeydown(event) {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Shift+Enter = новая строка
                return;
            } else {
                // Enter = отправить
                event.preventDefault();
                this.handleSendMessage();
            }
        }
    }

    // 📝 Обработка изменения текста
    handleInputChange(event) {
        const input = event.target;
        const charCounter = document.getElementById('char-counter');
        const sendButton = document.getElementById('send-button');
        
        // Автоизменение высоты textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        
        // Счетчик символов
        if (charCounter) {
            const length = input.value.length;
            charCounter.textContent = `${length}/500`;
            charCounter.classList.toggle('hidden', length === 0);
            charCounter.classList.toggle('text-red-500', length > 450);
        }
        
        // Активность кнопки отправки
        if (sendButton) {
            sendButton.disabled = input.value.trim().length === 0;
        }
        
        // Показ статуса "печатает..."
        this.showTypingStatus();
    }

    // ⌨️ Показ статуса "печатает..."
    showTypingStatus() {
        if (!this.currentChatId) return;
        
        // Отправляем статус печатает
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            // Убираем статус через 3 секунды
            if (this.currentChatId) {
                db.collection('chats').doc(this.currentChatId).update({
                    [`typing_${this.currentUser.uid}`]: null
                }).catch(() => {});
            }
        }, 3000);
        
        // Обновляем статус
        if (this.currentChatId) {
            db.collection('chats').doc(this.currentChatId).update({
                [`typing_${this.currentUser.uid}`]: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
        }
    }

    // ======== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========

    // Поиск сообщения по ID
    findMessageById(messageId) {
        // Ищем в текущих сообщениях чата
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return null;
        
        // Возвращаем мок-объект с основными данными
        return {
            id: messageId,
            content: messageElement.querySelector('.message-content')?.textContent || '',
            senderId: messageElement.dataset.senderId
        };
    }

    // Показ успешного уведомления
    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm transform translate-x-full opacity-0 transition-all duration-300';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="ri-check-line"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);
        
        // Удаление через 3 секунды
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Обработка отправки сообщения
    async handleSendMessage() {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();
        
        if (!content || !this.currentChatId) return;

        // Проверяем на ответ
        const replyTo = messageInput.dataset.replyTo;
        if (replyTo) {
            delete messageInput.dataset.replyTo;
            // Убираем контекст ответа
            const replyContext = messageInput.closest('form').previousElementSibling;
            if (replyContext?.classList.contains('reply-context')) {
                replyContext.remove();
            }
        }

        try {
            await this.sendMessage(this.currentChatId, content, 'text', [], replyTo);
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Сбрасываем счетчик символов
            const charCounter = document.getElementById('char-counter');
            if (charCounter) {
                charCounter.classList.add('hidden');
            }
            
            // Воспроизводим звук отправки
            this.playNotificationSound();
            
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            this.showErrorToast('Не удалось отправить сообщение');
        }
    }

    // Отметка сообщений как прочитанных
    async markMessagesAsRead(chatId) {
        if (!this.currentUser) return;

        try {
            const unreadMessagesQuery = db.collection('chats').doc(chatId)
                .collection('messages')
                .where('senderId', '!=', this.currentUser.uid)
                .where('isRead', '==', false);

            const snapshot = await unreadMessagesQuery.get();
            
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });

            if (!snapshot.empty) {
                await batch.commit();
                
                // Обнуляем счетчик непрочитанных
                await db.collection('chats').doc(chatId).update({
                    [`unread_${this.currentUser.uid}`]: 0
                });
            }
            
        } catch (error) {
            console.error('Ошибка отметки сообщений как прочитанных:', error);
        }
    }

    // Получение информации о пользователе
    async getUserInfo(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                return userDoc.data();
            }
            return { name: 'Неизвестный пользователь', email: '' };
        } catch (error) {
            console.error('Ошибка получения информации о пользователе:', error);
            return { name: 'Неизвестный пользователь', email: '' };
        }
    }

    // Получение другого участника чата
    getOtherParticipant(chatId) {
        if (!this.currentUser) return null;
        
        const participants = chatId.split('_');
        return participants.find(id => id !== this.currentUser.uid);
    }

    // Получение информации о другом участнике
    getOtherParticipantInfo(chat) {
        const otherUserId = this.getOtherParticipant(chat.id);
        return chat[`participant_${otherUserId}`] || { name: 'Неизвестный пользователь', id: otherUserId };
    }

    // Форматирование времени сообщения
    formatMessageTime(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'сейчас';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ru-RU');
    }

    // Форматирование даты сообщения
    formatMessageDate(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) return 'Сегодня';
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
        
        return date.toLocaleDateString('ru-RU');
    }

    // Создание звука уведомления
    createNotificationSound() {
        // Создаем аудио контекст для звуков уведомлений
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
        } catch (error) {
            console.log('Web Audio API не поддерживается');
        }
    }

    // Воспроизведение звука уведомления
    playNotificationSound() {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Не удалось воспроизвести звук уведомления');
        }
    }

    // Показ уведомления
    showNotification(notification) {
        // Показываем всплывающее уведомление
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm animate-slideIn';
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    <i class="ri-message-3-line"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900 mb-1">${notification.title}</h4>
                    <p class="text-sm text-gray-600">${notification.body}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Убираем уведомление через 5 секунд
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);

        // Воспроизводим звук
        this.playNotificationSound();
    }

    // Показ тоста с ошибкой
    showErrorToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="ri-error-warning-line"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Обновление счетчиков непрочитанных сообщений
    updateUnreadCounts() {
        let totalUnread = 0;
        
        this.activeChats.forEach(chat => {
            const unread = chat[`unread_${this.currentUser?.uid}`] || 0;
            totalUnread += unread;
        });

        // Обновляем значок в навигации
        const messageIcon = document.querySelector('.messages-badge');
        if (messageIcon) {
            if (totalUnread > 0) {
                messageIcon.textContent = totalUnread > 99 ? '99+' : totalUnread;
                messageIcon.classList.remove('hidden');
            } else {
                messageIcon.classList.add('hidden');
            }
        }

        // Обновляем title страницы
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) WorkInCZ — Работа для мигрантов в Чехии`;
        } else {
            document.title = 'WorkInCZ — Работа для мигрантов в Чехии';
        }
    }

    // Проверка, онлайн ли пользователь
    async isUserOnline(userId) {
        try {
            const presenceDoc = await db.collection('presence').doc(userId).get();
            if (presenceDoc.exists) {
                const presence = presenceDoc.data();
                const lastSeen = presence.lastSeen?.toDate() || new Date(0);
                const now = new Date();
                return presence.isOnline && (now - lastSeen) < 60000; // Онлайн если активность < 1 мин
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Получение статуса пользователя
    getUserStatus(userId) {
        if (this.isUserOnline(userId)) {
            return 'онлайн';
        }
        return 'не в сети';
    }

    // ======== ДОПОЛНИТЕЛЬНЫЕ ПРОДВИНУТЫЕ ФУНКЦИИ ========

    // 🔍 Переключение панели поиска
    toggleChatSearch() {
        const searchPanel = document.getElementById('chat-search-panel');
        const searchInput = document.getElementById('chat-search-input');
        
        if (searchPanel) {
            searchPanel.classList.toggle('hidden');
            if (!searchPanel.classList.contains('hidden')) {
                searchInput.focus();
            }
        }
    }

    // 🔍 Поиск сообщений
    async searchMessages() {
        const searchInput = document.getElementById('chat-search-input');
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query || !this.currentChatId) return;

        try {
            // Поиск по сообщениям в текущем чате
            const messages = document.querySelectorAll('.message-item');
            let foundCount = 0;
            
            messages.forEach(messageEl => {
                const content = messageEl.querySelector('.message-content');
                if (content) {
                    const text = content.textContent.toLowerCase();
                    const isMatch = text.includes(query);
                    
                    messageEl.classList.toggle('search-highlight', isMatch);
                    if (isMatch) {
                        foundCount++;
                        // Подсвечиваем найденный текст
                        this.highlightSearchText(content, query);
                    }
                }
            });

            // Показываем результат
            this.showSuccessToast(`Найдено сообщений: ${foundCount}`);
            
            // Прокручиваем к первому найденному
            const firstMatch = document.querySelector('.search-highlight');
            if (firstMatch) {
                firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
        } catch (error) {
            console.error('Ошибка поиска:', error);
            this.showErrorToast('Ошибка поиска сообщений');
        }
    }

    // 🔍 Подсветка найденного текста
    highlightSearchText(element, query) {
        const text = element.textContent;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlightedText = text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
        element.innerHTML = highlightedText;
    }

    // ⚙️ Открытие настроек чата
    openChatSettings() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[110]';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold">Настройки чата</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="ri-close-line text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <!-- Уведомления -->
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">Уведомления</div>
                            <div class="text-sm text-gray-500">Получать звуковые уведомления</div>
                        </div>
                        <label class="custom-switch">
                            <input type="checkbox" id="notifications-toggle" checked>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    
                    <!-- Автоперевод -->
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">Автоперевод</div>
                            <div class="text-sm text-gray-500">Переводить входящие сообщения</div>
                        </div>
                        <label class="custom-switch">
                            <input type="checkbox" id="auto-translate-toggle">
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    
                    <!-- Размер шрифта -->
                    <div>
                        <label class="block font-medium mb-2">Размер шрифта</label>
                        <select id="font-size-select" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="small">Маленький</option>
                            <option value="medium" selected>Средний</option>
                            <option value="large">Большой</option>
                        </select>
                    </div>
                    
                    <!-- Тема -->
                    <div>
                        <label class="block font-medium mb-2">Тема оформления</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="messagingManager.setTheme('light')" class="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                                <i class="ri-sun-line block mb-1"></i>
                                Светлая
                            </button>
                            <button onclick="messagingManager.setTheme('dark')" class="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                                <i class="ri-moon-line block mb-1"></i>
                                Темная
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Отмена
                    </button>
                    <button onclick="messagingManager.saveChatSettings(); this.closest('.fixed').remove()" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                        Сохранить
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 💾 Сохранение настроек чата
    saveChatSettings() {
        const settings = {
            notifications: document.getElementById('notifications-toggle')?.checked || true,
            autoTranslate: document.getElementById('auto-translate-toggle')?.checked || false,
            fontSize: document.getElementById('font-size-select')?.value || 'medium',
            theme: localStorage.getItem('chat-theme') || 'light'
        };
        
        localStorage.setItem('chat-settings', JSON.stringify(settings));
        this.applyChatSettings(settings);
        this.showSuccessToast('Настройки сохранены');
    }

    // 🎨 Применение настроек чата
    applyChatSettings(settings) {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;
        
        // Размер шрифта
        chatWindow.classList.remove('text-sm', 'text-base', 'text-lg');
        switch (settings.fontSize) {
            case 'small': chatWindow.classList.add('text-sm'); break;
            case 'large': chatWindow.classList.add('text-lg'); break;
            default: chatWindow.classList.add('text-base');
        }
        
        // Тема
        if (settings.theme === 'dark') {
            chatWindow.classList.add('dark-theme');
        } else {
            chatWindow.classList.remove('dark-theme');
        }
    }

    // 📎 Прикрепление файла
    async attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf,.doc,.docx,.txt';
        input.multiple = false;
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Проверка размера файла (макс 10МБ)
            if (file.size > 10 * 1024 * 1024) {
                this.showErrorToast('Файл слишком большой (максимум 10МБ)');
                return;
            }
            
            try {
                // Показываем индикатор загрузки
                this.showSuccessToast('Загружаем файл...');
                
                // Симуляция загрузки файла
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const fileType = file.type.startsWith('image/') ? 'image' : 'file';
                const fileUrl = URL.createObjectURL(file); // В реальности загрузили бы в Storage
                
                await this.sendMessage(this.currentChatId, fileUrl, fileType, [{
                    name: file.name,
                    size: file.size,
                    type: file.type
                }]);
                
                this.showSuccessToast('Файл отправлен');
                
            } catch (error) {
                console.error('Ошибка загрузки файла:', error);
                this.showErrorToast('Не удалось загрузить файл');
            }
        };
        
        input.click();
    }

    // 🎤 Запись голосового сообщения
    async recordVoice() {
        if (this.isRecording) {
            this.stopVoiceRecording();
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                this.sendVoiceMessage(blob);
                
                // Останавливаем все треки
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Обновляем UI кнопки записи
            const recordBtn = document.querySelector('[onclick*="recordVoice"]');
            if (recordBtn) {
                recordBtn.innerHTML = '<i class="ri-stop-line"></i>';
                recordBtn.classList.add('bg-red-500', 'text-white');
                recordBtn.title = 'Остановить запись';
            }
            
            this.showSuccessToast('Запись началась');
            
        } catch (error) {
            console.error('Ошибка записи:', error);
            this.showErrorToast('Не удалось начать запись');
        }
    }

    // 🎤 Остановка записи голоса
    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Восстанавливаем UI кнопки
            const recordBtn = document.querySelector('[onclick*="recordVoice"]');
            if (recordBtn) {
                recordBtn.innerHTML = '<i class="ri-mic-line"></i>';
                recordBtn.classList.remove('bg-red-500', 'text-white');
                recordBtn.title = 'Голосовое сообщение';
            }
        }
    }

    // 🎤 Отправка голосового сообщения
    async sendVoiceMessage(blob) {
        try {
            const voiceUrl = URL.createObjectURL(blob);
            await this.sendMessage(this.currentChatId, voiceUrl, 'voice', [{
                name: 'voice.webm',
                size: blob.size,
                type: blob.type,
                duration: this.recordingDuration || 0
            }]);
            
            this.showSuccessToast('Голосовое сообщение отправлено');
        } catch (error) {
            console.error('Ошибка отправки голосового сообщения:', error);
            this.showErrorToast('Не удалось отправить голосовое сообщение');
        }
    }

    // 😀 Вставка эмодзи
    insertEmoji() {
        const emojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '👏', '🔥', '💯', '❤️', '🎉', '🚀'];
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[110]';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">Выберите эмодзи</h3>
                <div class="grid grid-cols-6 gap-3">
                    ${emojis.map(emoji => `
                        <button onclick="messagingManager.addEmojiToInput('${emoji}'); this.closest('.fixed').remove()" 
                                class="w-10 h-10 text-2xl hover:bg-gray-100 rounded-lg transition-colors">
                            ${emoji}
                        </button>
                    `).join('')}
                </div>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Закрыть
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 😀 Добавление эмодзи в поле ввода
    addEmojiToInput(emoji) {
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            const text = messageInput.value;
            
            messageInput.value = text.slice(0, start) + emoji + text.slice(end);
            messageInput.focus();
            messageInput.setSelectionRange(start + emoji.length, start + emoji.length);
            
            // Триггерим событие изменения
            messageInput.dispatchEvent(new Event('input'));
        }
    }

    // 🌍 Переключение автоперевода
    toggleTranslation() {
        this.autoTranslateEnabled = !this.autoTranslateEnabled;
        const btn = document.querySelector('[onclick*="toggleTranslation"]');
        
        if (btn) {
            if (this.autoTranslateEnabled) {
                btn.classList.add('bg-primary', 'text-white');
                btn.classList.remove('text-gray-500', 'hover:text-primary');
                this.showSuccessToast('Автоперевод включен');
            } else {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('text-gray-500', 'hover:text-primary');
                this.showSuccessToast('Автоперевод выключен');
            }
        }
    }

    // ✏️ Редактирование сообщения
    async editMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
        if (!messageElement) return;

        const originalText = messageElement.textContent;
        
        // Создаем поле редактирования
        const editInput = document.createElement('textarea');
        editInput.value = originalText;
        editInput.className = 'w-full p-2 border border-primary rounded-lg text-sm resize-none';
        editInput.rows = 2;
        
        const editContainer = document.createElement('div');
        editContainer.innerHTML = `
            <div class="space-y-2">
                ${editInput.outerHTML}
                <div class="flex gap-2">
                    <button onclick="messagingManager.saveEditedMessage('${messageId}', this.parentElement.previousElementSibling.value)" 
                            class="px-3 py-1 bg-primary text-white rounded text-sm">
                        Сохранить
                    </button>
                    <button onclick="messagingManager.cancelEditMessage('${messageId}')" 
                            class="px-3 py-1 border border-gray-300 rounded text-sm">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        messageElement.style.display = 'none';
        messageElement.parentElement.appendChild(editContainer);
        editContainer.querySelector('textarea').focus();
        
        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // 💾 Сохранение отредактированного сообщения
    async saveEditedMessage(messageId, newContent) {
        if (!newContent.trim()) return;

        try {
            const messageRef = db.collection('chats').doc(this.currentChatId)
                .collection('messages').doc(messageId);
                
            await messageRef.update({
                content: newContent.trim(),
                edited: true,
                editedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            this.showSuccessToast('Сообщение изменено');
        } catch (error) {
            console.error('Ошибка редактирования:', error);
            this.showErrorToast('Не удалось изменить сообщение');
        }
    }

    // ❌ Отмена редактирования
    cancelEditMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
        if (messageElement) {
            messageElement.style.display = 'block';
            const editContainer = messageElement.parentElement.querySelector('.space-y-2')?.parentElement;
            if (editContainer) {
                editContainer.remove();
            }
        }
    }

    // 🗑️ Удаление сообщения
    async deleteMessage(messageId) {
        if (!confirm('Удалить это сообщение?')) return;

        try {
            await db.collection('chats').doc(this.currentChatId)
                .collection('messages').doc(messageId).delete();
                
            this.showSuccessToast('Сообщение удалено');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            this.showErrorToast('Не удалось удалить сообщение');
        }
        
        // Закрываем контекстное меню
        const menu = document.getElementById('message-context-menu');
        if (menu) menu.remove();
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Преобразование ссылок в кликабельные
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" class="underline text-blue-500">$1</a>');
    }

    // Закрытие окна чата
    closeChatWindow() {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            chatWindow.style.animation = 'slideOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                chatWindow.classList.add('hidden');
                chatWindow.classList.remove('flex');
                chatWindow.style.animation = '';
            }, 300);
            
            console.log('💬 Окно чата закрыто');
        }
        
        // Очищаем текущий чат
        this.currentChatId = null;
        
        // Отписываемся от слушателей сообщений
        this.messageListeners.forEach(unsubscribe => unsubscribe());
        this.messageListeners.clear();
    }

    // Очистка при выходе пользователя
    cleanup() {
        this.activeChats.clear();
        this.unreadCounts.clear();
        
        // Отписываемся от всех слушателей
        if (this.chatsListener) {
            this.chatsListener();
            this.chatsListener = null;
        }
        
        this.messageListeners.forEach(unsubscribe => unsubscribe());
        this.messageListeners.clear();
        
        this.closeChatWindow();
    }
}

// ======== ГЛОБАЛЬНЫЕ ФУНКЦИИ ========

// Функция для инициации чата с пользователем (вызывается из карточек вакансий)
async function startChatWithUser(userId, initialMessage = '', jobId = null) {
    console.log(`💬 Попытка начать чат с пользователем: ${userId}`);
    
    // 🎯 ПРОВЕРКА АВТОРИЗАЦИИ ДЛЯ СООБЩЕНИЙ
    if (window.requireAuth && !window.requireAuth('написать сообщение', { employerId: userId, jobId })) {
        return; // Показан мягкий модал авторизации
    }

    if (!window.messagingManager) {
        console.log('🔧 MessagingManager требует авторизации');
        return;
    }

    try {
        const chatId = await messagingManager.createChat(userId, initialMessage, jobId);
        messagingManager.openChat(chatId);
    } catch (error) {
        console.error('Ошибка создания чата:', error);
        alert('Не удалось создать чат. Убедитесь, что вы авторизованы.');
    }
}

// Функция для открытия списка сообщений
function openMessagesPanel() {
    // Создаем или показываем панель сообщений
    let messagesPanel = document.getElementById('messages-panel');
    if (!messagesPanel) {
        messagesPanel = createMessagesPanel();
    }

    messagesPanel.classList.remove('hidden');
    messagesPanel.classList.add('flex');
}

// Создание панели сообщений
function createMessagesPanel() {
    const panel = document.createElement('div');
    panel.id = 'messages-panel';
    panel.className = 'fixed inset-0 lg:inset-auto lg:bottom-4 lg:left-4 lg:w-80 lg:h-[500px] bg-white border lg:border-gray-200 lg:rounded-lg lg:shadow-lg flex-col z-60 hidden';
    
    panel.innerHTML = `
        <!-- Заголовок -->
        <div class="messages-header flex items-center justify-between p-4 border-b border-gray-200 bg-white lg:rounded-t-lg cursor-move select-none" onmousedown="startDragMessagesPanel(event)">
            <div class="flex items-center gap-2">
                <i class="ri-drag-move-line text-gray-400"></i>
                <h3 class="font-semibold text-gray-900">Сообщения</h3>
            </div>
            <button onclick="closeMessagesPanel()" class="text-gray-500 hover:text-gray-700 z-10" style="pointer-events: auto;">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>
        
        <!-- Список чатов -->
        <div id="chats-list" class="flex-1 overflow-y-auto">
            <!-- Чаты загружаются динамически -->
        </div>
        
        <!-- Футер -->
        <div class="p-3 border-t border-gray-200 bg-gray-50 lg:rounded-b-lg">
            <button onclick="requestNotificationPermission()" class="text-sm text-primary hover:underline">
                Включить уведомления
            </button>
        </div>
    `;

    document.body.appendChild(panel);
    return panel;
}

// Закрытие панели сообщений
function closeMessagesPanel() {
  const panel = document.getElementById('messages-panel');
  if (panel) {
    panel.style.animation = 'slideOut 0.3s ease-out forwards';
    
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('flex');
      panel.style.animation = '';
    }, 300);
    
    console.log('💬 Панель сообщений закрыта');
  }
}

// Запрос разрешения на уведомления
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('Ваш браузер не поддерживает уведомления');
        return;
    }

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification('WorkInCZ', {
                body: 'Уведомления включены! Теперь вы не пропустите новые сообщения.',
                icon: '/favicon.ico'
            });
        }
    }
}

// Инициализация системы сообщений
const messagingManager = new MessagingManager();

// Обработчик ESC для закрытия модальных окон
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Закрываем панель сообщений
    const messagesPanel = document.getElementById('messages-panel');
    if (messagesPanel && !messagesPanel.classList.contains('hidden')) {
      closeMessagesPanel();
      return;
    }
    
    // Закрываем окно чата
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow && !chatWindow.classList.contains('hidden')) {
      if (window.messagingManager) {
        window.messagingManager.closeChatWindow();
      }
      return;
    }
    
    // Закрываем основной модал авторизации
    const authModal = document.getElementById('modal');
    if (authModal && !authModal.classList.contains('hidden')) {
      closeModal();
      return;
    }
  }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessagingManager;
}

// CSS стили для анимаций (добавляем в head)
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .animate-slideIn {
            animation: slideIn 0.3s ease-out;
        }
        
        .message-bubble {
            animation: messageAppear 0.2s ease-out;
        }
        
        @keyframes messageAppear {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .chat-item:hover {
            background-color: #f9fafb;
        }
        
        #chat-messages {
            scroll-behavior: smooth;
        }
        
        .message-item {
            opacity: 0;
            animation: fadeIn 0.2s ease-out forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        #messages-panel, #chat-window {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});

// ======== DRAG AND DROP ДЛЯ ОКОН СООБЩЕНИЙ ========

// Переменные для перетаскивания
let isDraggingMessagesPanel = false;
let isDraggingChatWindow = false;
let dragStartX = 0;
let dragStartY = 0;
let panelStartX = 0;
let panelStartY = 0;

// Функция начала перетаскивания панели сообщений
function startDragMessagesPanel(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем, что клик не по кнопке закрытия
    if (e.target.closest('button')) return;
    
    isDraggingMessagesPanel = true;
    
    const panel = document.getElementById('messages-panel');
    const rect = panel.getBoundingClientRect();
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    // Делаем позиционирование absolute (ОПТИМИЗИРОВАНО)
    panel.style.position = 'fixed';
    panel.style.left = panelStartX + 'px';
    panel.style.top = panelStartY + 'px';
    panel.style.bottom = 'auto';
    panel.style.right = 'auto';
    panel.style.zIndex = '100';
    panel.style.cursor = 'grabbing';
    
    document.addEventListener('mousemove', dragMessagesPanel);
    document.addEventListener('mouseup', stopDragMessagesPanel);
    
    // Отключаем выделение текста
    document.body.style.userSelect = 'none';
}

// Функция перетаскивания панели сообщений
function dragMessagesPanel(e) {
    if (!isDraggingMessagesPanel) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    const newX = panelStartX + deltaX;
    const newY = panelStartY + deltaY;
    
    // Ограничиваем границами экрана
    const panel = document.getElementById('messages-panel');
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    panel.style.left = constrainedX + 'px';
    panel.style.top = constrainedY + 'px';
}

// Функция завершения перетаскивания панели сообщений
function stopDragMessagesPanel() {
    if (!isDraggingMessagesPanel) return;
    
    isDraggingMessagesPanel = false;
    const panel = document.getElementById('messages-panel');
    
    // Возвращаем стили (ОПТИМИЗИРОВАНО)
    panel.style.cursor = '';
    panel.style.zIndex = '40';
    
    // Сохраняем позицию
    localStorage.setItem('messages-panel-position', JSON.stringify({
        x: parseInt(panel.style.left),
        y: parseInt(panel.style.top)
    }));
    
    document.removeEventListener('mousemove', dragMessagesPanel);
    document.removeEventListener('mouseup', stopDragMessagesPanel);
    
    // Включаем выделение текста
    document.body.style.userSelect = '';
}

// Функция начала перетаскивания окна чата
function startDragChatWindow(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем, что клик не по кнопке
    if (e.target.closest('button')) return;
    
    isDraggingChatWindow = true;
    
    const chatWindow = document.getElementById('chat-window');
    const rect = chatWindow.getBoundingClientRect();
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    // Делаем позиционирование absolute (ОПТИМИЗИРОВАНО)
    chatWindow.style.position = 'fixed';
    chatWindow.style.left = panelStartX + 'px';
    chatWindow.style.top = panelStartY + 'px';
    chatWindow.style.bottom = 'auto';
    chatWindow.style.right = 'auto';
    chatWindow.style.zIndex = '200';
    chatWindow.style.cursor = 'grabbing';
    
    document.addEventListener('mousemove', dragChatWindow);
    document.addEventListener('mouseup', stopDragChatWindow);
    
    // Отключаем выделение текста
    document.body.style.userSelect = 'none';
}

// Функция перетаскивания окна чата
function dragChatWindow(e) {
    if (!isDraggingChatWindow) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    const newX = panelStartX + deltaX;
    const newY = panelStartY + deltaY;
    
    // Ограничиваем границами экрана
    const chatWindow = document.getElementById('chat-window');
    const maxX = window.innerWidth - chatWindow.offsetWidth;
    const maxY = window.innerHeight - chatWindow.offsetHeight;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    
    chatWindow.style.left = constrainedX + 'px';
    chatWindow.style.top = constrainedY + 'px';
}

// Функция завершения перетаскивания окна чата
function stopDragChatWindow() {
    if (!isDraggingChatWindow) return;
    
    isDraggingChatWindow = false;
    const chatWindow = document.getElementById('chat-window');
    
    // Возвращаем стили (ОПТИМИЗИРОВАНО)
    chatWindow.style.cursor = '';
    chatWindow.style.zIndex = '50';
    
    // Сохраняем позицию
    localStorage.setItem('chat-window-position', JSON.stringify({
        x: parseInt(chatWindow.style.left),
        y: parseInt(chatWindow.style.top)
    }));
    
    document.removeEventListener('mousemove', dragChatWindow);
    document.removeEventListener('mouseup', stopDragChatWindow);
    
    // Включаем выделение текста
    document.body.style.userSelect = '';
}

// Восстановление сохраненных позиций при создании окон
const originalCreateMessagesPanel = createMessagesPanel;
window.createMessagesPanel = function() {
    const panel = originalCreateMessagesPanel();
    
    // Восстанавливаем позицию
    setTimeout(() => {
        const savedPosition = localStorage.getItem('messages-panel-position');
        if (savedPosition) {
            try {
                const position = JSON.parse(savedPosition);
                panel.style.position = 'fixed';
                panel.style.left = position.x + 'px';
                panel.style.top = position.y + 'px';
                panel.style.bottom = 'auto';
                panel.style.right = 'auto';
            } catch (e) {
                console.log('Ошибка загрузки позиции панели сообщений');
            }
        }
    }, 100);
    
    return panel;
};

// Восстановление позиции окна чата
document.addEventListener('DOMContentLoaded', function() {
    // Перехватываем создание окна чата
    const originalCreateChatWindow = MessagingManager.prototype.createChatWindow;
    MessagingManager.prototype.createChatWindow = function() {
        const chatWindow = originalCreateChatWindow.call(this);
        
        // Восстанавливаем позицию
        setTimeout(() => {
            const savedPosition = localStorage.getItem('chat-window-position');
            if (savedPosition) {
                try {
                    const position = JSON.parse(savedPosition);
                    chatWindow.style.position = 'fixed';
                    chatWindow.style.left = position.x + 'px';
                    chatWindow.style.top = position.y + 'px';
                    chatWindow.style.bottom = 'auto';
                    chatWindow.style.right = 'auto';
                } catch (e) {
                    console.log('Ошибка загрузки позиции окна чата');
                }
            }
        }, 100);
        
        return chatWindow;
    };
});

console.log('💬 Окна сообщений готовы к перетаскиванию!');
console.log('💡 Позиции сохраняются автоматически в localStorage'); 