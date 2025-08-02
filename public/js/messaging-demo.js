/**
 * Messaging Demo - Создание тестовых данных для демонстрации чатов
 * Используется для тестирования системы сообщений
 */

class MessagingDemo {
    constructor() {
        this.demoUsers = [
            {
                uid: 'demo_user_1',
                displayName: 'Анна Петрова',
                email: 'anna@example.com',
                role: 'applicant'
            },
            {
                uid: 'demo_user_2', 
                displayName: 'Иван Сидоров',
                email: 'ivan@example.com',
                role: 'employer'
            },
            {
                uid: 'demo_user_3',
                displayName: 'Мария Козлова',
                email: 'maria@example.com',
                role: 'applicant'
            }
        ];
    }

    async createDemoChats() {
        if (!window.firebase || !window.db) {
            console.log('Firebase не инициализирован');
            return;
        }

        try {
            console.log('🔄 Создание демо-чатов...');

            // Создаем чат между пользователями
            await this.createDemoChat('demo_user_1', 'demo_user_2', 'Разработчик React');
            await this.createDemoChat('demo_user_1', 'demo_user_3', 'Дизайнер UI/UX');
            
            console.log('✅ Демо-чаты созданы успешно');
            
        } catch (error) {
            console.error('❌ Ошибка создания демо-чатов:', error);
        }
    }

    async createDemoChat(user1Id, user2Id, jobTitle) {
        const participants = [user1Id, user2Id].sort();
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
                    lastMessage: 'Привет! Интересует ваша вакансия',
                    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessageBy: user1Id,
                    jobId: `job_${Date.now()}`,
                    chatType: 'job',
                    isActive: true,
                    isReadOnly: false,
                    // Метаданные для участников
                    [`participant_${user1Id}`]: this.getUserInfo(user1Id),
                    [`participant_${user2Id}`]: this.getUserInfo(user2Id)
                });

                // Добавляем демо-сообщения
                await this.addDemoMessages(chatId, user1Id, user2Id, jobTitle);
            }

        } catch (error) {
            console.error('Ошибка создания чата:', error);
        }
    }

    async addDemoMessages(chatId, user1Id, user2Id, jobTitle) {
        const messages = [
            {
                senderId: user1Id,
                senderName: this.getUserInfo(user1Id).displayName,
                content: `Привет! Интересует ваша вакансия "${jobTitle}". Можете рассказать подробнее?`,
                timestamp: new Date(Date.now() - 3600000) // 1 час назад
            },
            {
                senderId: user2Id,
                senderName: this.getUserInfo(user2Id).displayName,
                content: 'Здравствуйте! Конечно, расскажу подробнее. Какие у вас есть вопросы?',
                timestamp: new Date(Date.now() - 3500000) // 58 минут назад
            },
            {
                senderId: user1Id,
                senderName: this.getUserInfo(user1Id).displayName,
                content: 'Какие требования к кандидату? И какая зарплата?',
                timestamp: new Date(Date.now() - 3400000) // 56 минут назад
            },
            {
                senderId: user2Id,
                senderName: this.getUserInfo(user2Id).displayName,
                content: 'Требуется опыт от 2 лет, знание React, TypeScript. Зарплата 80-120k CZK в зависимости от опыта.',
                timestamp: new Date(Date.now() - 3300000) // 55 минут назад
            },
            {
                senderId: user1Id,
                senderName: this.getUserInfo(user1Id).displayName,
                content: 'Отлично! У меня есть опыт с React и TypeScript. Могу отправить резюме?',
                timestamp: new Date(Date.now() - 3200000) // 53 минуты назад
            },
            {
                senderId: user2Id,
                senderName: this.getUserInfo(user2Id).displayName,
                content: 'Конечно! Отправляйте на email или можете прикрепить файл здесь.',
                timestamp: new Date(Date.now() - 3100000) // 51 минута назад
            }
        ];

        for (const message of messages) {
            await db.collection('chats').doc(chatId)
                .collection('messages').add({
                    ...message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    isRead: false
                });
        }
    }

    getUserInfo(userId) {
        return this.demoUsers.find(user => user.uid === userId) || {
            displayName: 'Пользователь',
            email: 'user@example.com',
            role: 'user'
        };
    }

    async createDemoPresence() {
        try {
            // Создаем статусы присутствия для демо-пользователей
            for (const user of this.demoUsers) {
                await db.collection('presence').doc(user.uid).set({
                    online: Math.random() > 0.5, // Случайный статус
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    displayName: user.displayName
                });
            }
        } catch (error) {
            console.error('Ошибка создания демо-присутствия:', error);
        }
    }
}

// Глобальная функция для создания демо-данных
window.createMessagingDemo = async () => {
    const demo = new MessagingDemo();
    await demo.createDemoChats();
    await demo.createDemoPresence();
    console.log('🎉 Демо-данные созданы! Обновите страницу для просмотра.');
};

// Автоматическое создание демо-данных при загрузке (только в режиме разработки)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.firebase && window.db) {
                window.createMessagingDemo();
            }
        }, 2000);
    });
} 