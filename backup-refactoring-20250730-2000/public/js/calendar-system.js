/**
 * Система календаря событий
 * Управление собеседованиями, встречами, дедлайнами и событиями
 */

class CalendarSystem {
    constructor() {
        this.events = new Map();
        this.calendars = new Map();
        this.reminders = new Map();
        this.recurringEvents = new Map();
        this.eventCategories = new Map();
        this.integrations = new Map();
        this.notificationSettings = new Map();
        this.init();
    }

    /**
     * Инициализация системы календаря
     */
    init() {
        this.loadData();
        this.initializeEventCategories();
        this.initializeCalendars();
        this.initializeIntegrations();
        this.setupEventListeners();
        console.log('📅 Система календаря инициализирована');
    }

    /**
     * Загрузка данных из localStorage
     */
    loadData() {
        try {
            const savedEvents = localStorage.getItem('calendarEvents');
            const savedCalendars = localStorage.getItem('calendars');
            const savedReminders = localStorage.getItem('calendarReminders');
            const savedNotificationSettings = localStorage.getItem('calendarNotificationSettings');

            if (savedEvents) this.events = new Map(JSON.parse(savedEvents));
            if (savedCalendars) this.calendars = new Map(JSON.parse(savedCalendars));
            if (savedReminders) this.reminders = new Map(JSON.parse(savedReminders));
            if (savedNotificationSettings) this.notificationSettings = new Map(JSON.parse(savedNotificationSettings));
        } catch (error) {
            console.error('Ошибка загрузки данных календаря:', error);
        }
    }

    /**
     * Сохранение данных в localStorage
     */
    saveData() {
        try {
            localStorage.setItem('calendarEvents', JSON.stringify(Array.from(this.events.entries())));
            localStorage.setItem('calendars', JSON.stringify(Array.from(this.calendars.entries())));
            localStorage.setItem('calendarReminders', JSON.stringify(Array.from(this.reminders.entries())));
            localStorage.setItem('calendarNotificationSettings', JSON.stringify(Array.from(this.notificationSettings.entries())));
        } catch (error) {
            console.error('Ошибка сохранения данных календаря:', error);
        }
    }

    /**
     * Инициализация категорий событий
     */
    initializeEventCategories() {
        const categories = [
            {
                id: 'interview',
                name: 'Собеседование',
                color: '#ef4444',
                icon: '🎯',
                description: 'Собеседования с работодателями'
            },
            {
                id: 'meeting',
                name: 'Встреча',
                color: '#3b82f6',
                icon: '🤝',
                description: 'Встречи с рекрутерами и HR'
            },
            {
                id: 'deadline',
                name: 'Дедлайн',
                color: '#f59e0b',
                icon: '⏰',
                description: 'Дедлайны подачи заявок и документов'
            },
            {
                id: 'test',
                name: 'Тестовое задание',
                color: '#8b5cf6',
                icon: '📝',
                description: 'Тестовые задания и экзамены'
            },
            {
                id: 'start_date',
                name: 'Начало работы',
                color: '#10b981',
                icon: '🚀',
                description: 'Даты начала работы'
            },
            {
                id: 'holiday',
                name: 'Праздник',
                color: '#ec4899',
                icon: '🎉',
                description: 'Праздники и выходные'
            },
            {
                id: 'platform_event',
                name: 'Событие платформы',
                color: '#06b6d4',
                icon: '🎪',
                description: 'События и акции платформы'
            },
            {
                id: 'personal',
                name: 'Личное',
                color: '#6b7280',
                icon: '👤',
                description: 'Личные события и заметки'
            }
        ];

        categories.forEach(category => {
            this.eventCategories.set(category.id, category);
        });
    }

    /**
     * Инициализация календарей
     */
    initializeCalendars() {
        const calendars = [
            {
                id: 'main',
                name: 'Основной календарь',
                color: '#3b82f6',
                isDefault: true,
                isVisible: true,
                userId: 'default'
            },
            {
                id: 'work',
                name: 'Рабочий календарь',
                color: '#10b981',
                isDefault: false,
                isVisible: true,
                userId: 'default'
            },
            {
                id: 'personal',
                name: 'Личный календарь',
                color: '#8b5cf6',
                isDefault: false,
                isVisible: true,
                userId: 'default'
            }
        ];

        calendars.forEach(calendar => {
            this.calendars.set(calendar.id, calendar);
        });
    }

    /**
     * Инициализация интеграций
     */
    initializeIntegrations() {
        const integrations = [
            {
                id: 'google_calendar',
                name: 'Google Calendar',
                icon: '📅',
                isEnabled: false,
                apiKey: null,
                calendarId: null
            },
            {
                id: 'outlook_calendar',
                name: 'Outlook Calendar',
                icon: '📧',
                isEnabled: false,
                apiKey: null,
                calendarId: null
            },
            {
                id: 'apple_calendar',
                name: 'Apple Calendar',
                icon: '🍎',
                isEnabled: false,
                apiKey: null,
                calendarId: null
            }
        ];

        integrations.forEach(integration => {
            this.integrations.set(integration.id, integration);
        });
    }

    /**
     * Создание события
     */
    createEvent(eventData) {
        const eventId = 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const event = {
            id: eventId,
            title: eventData.title,
            description: eventData.description || '',
            category: eventData.category || 'personal',
            calendarId: eventData.calendarId || 'main',
            startDate: new Date(eventData.startDate).getTime(),
            endDate: new Date(eventData.endDate).getTime(),
            isAllDay: eventData.isAllDay || false,
            location: eventData.location || '',
            attendees: eventData.attendees || [],
            reminders: eventData.reminders || [],
            isRecurring: eventData.isRecurring || false,
            recurrenceRule: eventData.recurrenceRule || null,
            priority: eventData.priority || 'medium',
            status: eventData.status || 'scheduled',
            createdBy: eventData.createdBy || 'current-user',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.events.set(eventId, event);

        // Создание напоминаний
        if (event.reminders.length > 0) {
            this.createReminders(eventId, event.reminders);
        }

        // Создание повторяющихся событий
        if (event.isRecurring && event.recurrenceRule) {
            this.createRecurringEvents(eventId, event.recurrenceRule);
        }

        this.saveData();
        return event;
    }

    /**
     * Обновление события
     */
    updateEvent(eventId, updates) {
        const event = this.events.get(eventId);
        if (!event) return null;

        const updatedEvent = {
            ...event,
            ...updates,
            updatedAt: Date.now()
        };

        this.events.set(eventId, updatedEvent);
        this.saveData();
        return updatedEvent;
    }

    /**
     * Удаление события
     */
    deleteEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) return false;

        // Удаление связанных напоминаний
        this.deleteEventReminders(eventId);

        // Удаление повторяющихся событий
        if (event.isRecurring) {
            this.deleteRecurringEvents(eventId);
        }

        this.events.delete(eventId);
        this.saveData();
        return true;
    }

    /**
     * Получение событий для периода
     */
    getEventsForPeriod(startDate, endDate, calendarIds = null) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        let events = Array.from(this.events.values());

        // Фильтрация по календарям
        if (calendarIds) {
            events = events.filter(event => calendarIds.includes(event.calendarId));
        }

        // Фильтрация по периоду
        events = events.filter(event => {
            const eventStart = event.startDate;
            const eventEnd = event.endDate;
            
            return (eventStart >= start && eventStart <= end) ||
                   (eventEnd >= start && eventEnd <= end) ||
                   (eventStart <= start && eventEnd >= end);
        });

        // Сортировка по дате начала
        events.sort((a, b) => a.startDate - b.startDate);

        return events;
    }

    /**
     * Получение событий для дня
     */
    getEventsForDay(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.getEventsForPeriod(startOfDay, endOfDay);
    }

    /**
     * Получение событий для недели
     */
    getEventsForWeek(date) {
        const startOfWeek = this.getStartOfWeek(date);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return this.getEventsForPeriod(startOfWeek, endOfWeek);
    }

    /**
     * Получение событий для месяца
     */
    getEventsForMonth(date) {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return this.getEventsForPeriod(startOfMonth, endOfMonth);
    }

    /**
     * Получение начала недели
     */
    getStartOfWeek(date) {
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    /**
     * Создание напоминаний
     */
    createReminders(eventId, reminders) {
        reminders.forEach(reminder => {
            const reminderId = 'reminder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const reminderData = {
                id: reminderId,
                eventId: eventId,
                type: reminder.type, // 'email', 'push', 'sms', 'telegram'
                time: reminder.time, // минуты до события
                isSent: false,
                createdAt: Date.now()
            };

            this.reminders.set(reminderId, reminderData);
        });
    }

    /**
     * Удаление напоминаний события
     */
    deleteEventReminders(eventId) {
        for (const [reminderId, reminder] of this.reminders) {
            if (reminder.eventId === eventId) {
                this.reminders.delete(reminderId);
            }
        }
    }

    /**
     * Создание повторяющихся событий
     */
    createRecurringEvents(eventId, recurrenceRule) {
        const event = this.events.get(eventId);
        if (!event) return;

        const rule = this.parseRecurrenceRule(recurrenceRule);
        const occurrences = this.generateOccurrences(event, rule);

        occurrences.forEach((occurrence, index) => {
            const recurringEventId = `${eventId}_recurring_${index}`;
            
            const recurringEvent = {
                ...event,
                id: recurringEventId,
                originalEventId: eventId,
                startDate: occurrence.startDate,
                endDate: occurrence.endDate,
                isRecurring: false,
                recurrenceRule: null
            };

            this.events.set(recurringEventId, recurringEvent);
        });
    }

    /**
     * Удаление повторяющихся событий
     */
    deleteRecurringEvents(eventId) {
        for (const [id, event] of this.events) {
            if (event.originalEventId === eventId) {
                this.events.delete(id);
            }
        }
    }

    /**
     * Парсинг правила повторения
     */
    parseRecurrenceRule(rule) {
        // Простой парсер для RRULE
        const parts = rule.split(';');
        const parsed = {};

        parts.forEach(part => {
            const [key, value] = part.split('=');
            parsed[key] = value;
        });

        return parsed;
    }

    /**
     * Генерация повторений события
     */
    generateOccurrences(event, rule) {
        const occurrences = [];
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        const duration = endDate.getTime() - startDate.getTime();

        let currentDate = new Date(startDate);
        let count = 0;
        const maxCount = parseInt(rule.COUNT) || 10;

        while (count < maxCount) {
            const occurrenceStart = new Date(currentDate);
            const occurrenceEnd = new Date(currentDate.getTime() + duration);

            occurrences.push({
                startDate: occurrenceStart.getTime(),
                endDate: occurrenceEnd.getTime()
            });

            // Следующее повторение
            if (rule.FREQ === 'DAILY') {
                currentDate.setDate(currentDate.getDate() + (parseInt(rule.INTERVAL) || 1));
            } else if (rule.FREQ === 'WEEKLY') {
                currentDate.setDate(currentDate.getDate() + (parseInt(rule.INTERVAL) || 1) * 7);
            } else if (rule.FREQ === 'MONTHLY') {
                currentDate.setMonth(currentDate.getMonth() + (parseInt(rule.INTERVAL) || 1));
            } else if (rule.FREQ === 'YEARLY') {
                currentDate.setFullYear(currentDate.getFullYear() + (parseInt(rule.INTERVAL) || 1));
            }

            count++;
        }

        return occurrences;
    }

    /**
     * Создание собеседования
     */
    createInterview(interviewData) {
        const eventData = {
            title: `Собеседование: ${interviewData.position}`,
            description: `Собеседование на позицию ${interviewData.position} в компании ${interviewData.company}`,
            category: 'interview',
            startDate: interviewData.startDate,
            endDate: interviewData.endDate,
            location: interviewData.location || 'Онлайн',
            attendees: [
                {
                    name: interviewData.interviewerName || 'Интервьюер',
                    email: interviewData.interviewerEmail || '',
                    role: 'interviewer'
                }
            ],
            reminders: [
                { type: 'push', time: 30 }, // 30 минут до
                { type: 'email', time: 60 }  // 1 час до
            ],
            priority: 'high',
            status: 'scheduled'
        };

        return this.createEvent(eventData);
    }

    /**
     * Создание встречи
     */
    createMeeting(meetingData) {
        const eventData = {
            title: meetingData.title,
            description: meetingData.description,
            category: 'meeting',
            startDate: meetingData.startDate,
            endDate: meetingData.endDate,
            location: meetingData.location || '',
            attendees: meetingData.attendees || [],
            reminders: [
                { type: 'push', time: 15 }, // 15 минут до
                { type: 'email', time: 30 }  // 30 минут до
            ],
            priority: meetingData.priority || 'medium',
            status: 'scheduled'
        };

        return this.createEvent(eventData);
    }

    /**
     * Создание дедлайна
     */
    createDeadline(deadlineData) {
        const eventData = {
            title: `Дедлайн: ${deadlineData.title}`,
            description: deadlineData.description,
            category: 'deadline',
            startDate: deadlineData.deadline,
            endDate: deadlineData.deadline,
            isAllDay: true,
            reminders: [
                { type: 'push', time: 60 },   // 1 час до
                { type: 'push', time: 1440 }, // 1 день до
                { type: 'email', time: 2880 } // 2 дня до
            ],
            priority: 'high',
            status: 'scheduled'
        };

        return this.createEvent(eventData);
    }

    /**
     * Экспорт в iCal формат
     */
    exportToICal(events) {
        let ical = 'BEGIN:VCALENDAR\r\n';
        ical += 'VERSION:2.0\r\n';
        ical += 'PRODID:-//WorkInCZ//Calendar//EN\r\n';
        ical += 'CALSCALE:GREGORIAN\r\n';
        ical += 'METHOD:PUBLISH\r\n';

        events.forEach(event => {
            ical += 'BEGIN:VEVENT\r\n';
            ical += `UID:${event.id}\r\n`;
            ical += `DTSTART:${this.formatDateForICal(event.startDate)}\r\n`;
            ical += `DTEND:${this.formatDateForICal(event.endDate)}\r\n`;
            ical += `SUMMARY:${event.title}\r\n`;
            ical += `DESCRIPTION:${event.description}\r\n`;
            if (event.location) {
                ical += `LOCATION:${event.location}\r\n`;
            }
            ical += 'END:VEVENT\r\n';
        });

        ical += 'END:VCALENDAR\r\n';
        return ical;
    }

    /**
     * Форматирование даты для iCal
     */
    formatDateForICal(timestamp) {
        const date = new Date(timestamp);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    /**
     * Интеграция с Google Calendar
     */
    async integrateWithGoogleCalendar(apiKey, calendarId) {
        const integration = this.integrations.get('google_calendar');
        if (!integration) return false;

        integration.isEnabled = true;
        integration.apiKey = apiKey;
        integration.calendarId = calendarId;

        this.integrations.set('google_calendar', integration);
        this.saveData();

        // Синхронизация событий
        await this.syncWithGoogleCalendar();
        return true;
    }

    /**
     * Синхронизация с Google Calendar
     */
    async syncWithGoogleCalendar() {
        const integration = this.integrations.get('google_calendar');
        if (!integration || !integration.isEnabled) return;

        // В реальном приложении здесь была бы интеграция с Google Calendar API
        console.log('Синхронизация с Google Calendar...');
    }

    /**
     * Получение настроек уведомлений пользователя
     */
    getUserNotificationSettings(userId) {
        if (!this.notificationSettings.has(userId)) {
            this.notificationSettings.set(userId, {
                email: true,
                push: true,
                sms: false,
                telegram: false,
                reminderTimes: [15, 30, 60, 1440], // минуты до события
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                }
            });
        }
        return this.notificationSettings.get(userId);
    }

    /**
     * Обновление настроек уведомлений
     */
    updateNotificationSettings(userId, settings) {
        const currentSettings = this.getUserNotificationSettings(userId);
        const updatedSettings = { ...currentSettings, ...settings };
        this.notificationSettings.set(userId, updatedSettings);
        this.saveData();
    }

    /**
     * Проверка напоминаний
     */
    checkReminders() {
        const now = Date.now();
        
        for (const [reminderId, reminder] of this.reminders) {
            if (reminder.isSent) continue;

            const event = this.events.get(reminder.eventId);
            if (!event) continue;

            const reminderTime = event.startDate - (reminder.time * 60 * 1000);
            
            if (now >= reminderTime) {
                this.sendReminder(reminder, event);
                reminder.isSent = true;
                this.reminders.set(reminderId, reminder);
            }
        }

        this.saveData();
    }

    /**
     * Отправка напоминания
     */
    sendReminder(reminder, event) {
        const notificationData = {
            title: 'Напоминание о событии',
            body: `${event.title} через ${reminder.time} минут`,
            icon: '/favicon.ico',
            data: {
                eventId: event.id,
                type: 'calendar_reminder'
            }
        };

        switch (reminder.type) {
            case 'push':
                this.sendPushNotification(notificationData);
                break;
            case 'email':
                this.sendEmailNotification(notificationData);
                break;
            case 'sms':
                this.sendSMSNotification(notificationData);
                break;
            case 'telegram':
                this.sendTelegramNotification(notificationData);
                break;
        }
    }

    /**
     * Отправка push уведомления
     */
    sendPushNotification(notificationData) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(notificationData.title, notificationData);
            });
        }
    }

    /**
     * Отправка email уведомления
     */
    sendEmailNotification(notificationData) {
        // В реальном приложении здесь была бы интеграция с email сервисом
        console.log('Email уведомление:', notificationData);
    }

    /**
     * Отправка SMS уведомления
     */
    sendSMSNotification(notificationData) {
        // В реальном приложении здесь была бы интеграция с SMS сервисом
        console.log('SMS уведомление:', notificationData);
    }

    /**
     * Отправка Telegram уведомления
     */
    sendTelegramNotification(notificationData) {
        // В реальном приложении здесь была бы интеграция с Telegram Bot API
        console.log('Telegram уведомление:', notificationData);
    }

    /**
     * Установка обработчиков событий
     */
    setupEventListeners() {
        // Обработка создания события
        document.addEventListener('createCalendarEvent', (e) => {
            const { eventData } = e.detail;
            this.createEvent(eventData);
        });

        // Обработка создания собеседования
        document.addEventListener('createInterview', (e) => {
            const { interviewData } = e.detail;
            this.createInterview(interviewData);
        });

        // Обработка создания встречи
        document.addEventListener('createMeeting', (e) => {
            const { meetingData } = e.detail;
            this.createMeeting(meetingData);
        });

        // Обработка создания дедлайна
        document.addEventListener('createDeadline', (e) => {
            const { deadlineData } = e.detail;
            this.createDeadline(deadlineData);
        });
    }

    /**
     * Получение статистики календаря
     */
    getCalendarStats() {
        const events = Array.from(this.events.values());
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => event.startDate > Date.now()).length;
        const pastEvents = events.filter(event => event.endDate < Date.now()).length;

        const categoryStats = {};
        events.forEach(event => {
            if (!categoryStats[event.category]) {
                categoryStats[event.category] = 0;
            }
            categoryStats[event.category]++;
        });

        return {
            totalEvents,
            upcomingEvents,
            pastEvents,
            categoryStats,
            activeIntegrations: Array.from(this.integrations.values()).filter(i => i.isEnabled).length
        };
    }

    /**
     * Тестовый режим для демонстрации
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим системы календаря');
        
        // Создание тестовых событий
        const testEvents = [
            {
                title: 'Собеседование в Google',
                description: 'Собеседование на позицию Frontend Developer',
                category: 'interview',
                startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // через 2 часа
                endDate: new Date(Date.now() + 3 * 60 * 60 * 1000),   // через 3 часа
                location: 'Онлайн (Google Meet)',
                priority: 'high'
            },
            {
                title: 'Дедлайн подачи документов',
                description: 'Необходимо подать все документы для оформления',
                category: 'deadline',
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // через 1 день
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                isAllDay: true,
                priority: 'high'
            },
            {
                title: 'Встреча с HR',
                description: 'Обсуждение условий работы и контракта',
                category: 'meeting',
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                location: 'Офис компании',
                priority: 'medium'
            }
        ];

        testEvents.forEach(eventData => {
            this.createEvent(eventData);
        });

        return {
            stats: this.getCalendarStats(),
            events: Array.from(this.events.values()),
            categories: Array.from(this.eventCategories.values()),
            calendars: Array.from(this.calendars.values())
        };
    }
}

// Экспорт для использования в других модулях
window.CalendarSystem = CalendarSystem; 