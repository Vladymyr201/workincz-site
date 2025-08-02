/**
 * UI компоненты для системы календаря
 * Интерфейс календаря с различными видами отображения
 */

class CalendarUI {
    constructor(calendarSystem) {
        this.system = calendarSystem;
        this.currentView = 'month'; // month, week, day, list
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.isVisible = false;
        this.init();
    }

    /**
     * Инициализация UI календаря
     */
    init() {
        this.createCalendarUI();
        this.setupEventListeners();
        console.log('📅 UI календаря инициализирован');
    }

    /**
     * Создание UI компонентов календаря
     */
    createCalendarUI() {
        // Создание модального окна календаря
        const modal = document.createElement('div');
        modal.id = 'calendarModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-7xl w-full max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center">
                            <span class="mr-2">📅</span>
                            Календарь событий
                        </h3>
                        <button id="closeCalendarModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Панель инструментов -->
                    <div class="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center space-x-4">
                            <button id="prevMonth" class="p-2 hover:bg-gray-200 rounded">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <h4 id="currentMonth" class="text-lg font-semibold text-gray-800">Январь 2024</h4>
                            <button id="nextMonth" class="p-2 hover:bg-gray-200 rounded">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                            <button id="todayBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Сегодня
                            </button>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="flex bg-gray-200 rounded-lg p-1">
                                <button id="monthView" class="px-3 py-1 rounded bg-white shadow text-sm">Месяц</button>
                                <button id="weekView" class="px-3 py-1 rounded text-sm hover:bg-gray-100">Неделя</button>
                                <button id="dayView" class="px-3 py-1 rounded text-sm hover:bg-gray-100">День</button>
                                <button id="listView" class="px-3 py-1 rounded text-sm hover:bg-gray-100">Список</button>
                            </div>
                            <button id="addEventBtn" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                + Добавить событие
                            </button>
                        </div>
                    </div>
                    
                    <!-- Основная область календаря -->
                    <div id="calendarContent" class="bg-white rounded-lg border">
                        <!-- Содержимое будет загружено динамически -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Создание модального окна для добавления события
        const eventModal = document.createElement('div');
        eventModal.id = 'eventModal';
        eventModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
        eventModal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg p-6 max-w-md w-full">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-800">Добавить событие</h3>
                        <button id="closeEventModal" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="eventForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Название события</label>
                            <input type="text" id="eventTitle" class="w-full border border-gray-300 rounded px-3 py-2" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                            <textarea id="eventDescription" class="w-full border border-gray-300 rounded px-3 py-2" rows="3"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                            <select id="eventCategory" class="w-full border border-gray-300 rounded px-3 py-2">
                                <option value="personal">Личное</option>
                                <option value="interview">Собеседование</option>
                                <option value="meeting">Встреча</option>
                                <option value="deadline">Дедлайн</option>
                                <option value="test">Тестовое задание</option>
                                <option value="start_date">Начало работы</option>
                                <option value="holiday">Праздник</option>
                                <option value="platform_event">Событие платформы</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Начало</label>
                                <input type="datetime-local" id="eventStart" class="w-full border border-gray-300 rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Окончание</label>
                                <input type="datetime-local" id="eventEnd" class="w-full border border-gray-300 rounded px-3 py-2" required>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
                            <input type="text" id="eventLocation" class="w-full border border-gray-300 rounded px-3 py-2">
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="eventAllDay" class="mr-2">
                            <label for="eventAllDay" class="text-sm text-gray-700">Весь день</label>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" id="cancelEvent" class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                Отмена
                            </button>
                            <button type="submit" id="saveEvent" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Сохранить
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(eventModal);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeCalendarModal') {
                this.hideModal();
            }
            if (e.target.id === 'closeEventModal') {
                this.hideEventModal();
            }
            if (e.target.id === 'cancelEvent') {
                this.hideEventModal();
            }
        });

        // Закрытие по клику вне модального окна
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('calendarModal');
            if (e.target === modal) {
                this.hideModal();
            }
            
            const eventModal = document.getElementById('eventModal');
            if (e.target === eventModal) {
                this.hideEventModal();
            }
        });

        // Навигация по календарю
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prevMonth') {
                this.previousMonth();
            }
            if (e.target.id === 'nextMonth') {
                this.nextMonth();
            }
            if (e.target.id === 'todayBtn') {
                this.goToToday();
            }
        });

        // Переключение видов
        document.addEventListener('click', (e) => {
            if (e.target.id === 'monthView') {
                this.switchView('month');
            }
            if (e.target.id === 'weekView') {
                this.switchView('week');
            }
            if (e.target.id === 'dayView') {
                this.switchView('day');
            }
            if (e.target.id === 'listView') {
                this.switchView('list');
            }
        });

        // Добавление события
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addEventBtn') {
                this.showEventModal();
            }
        });

        // Форма события
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'eventForm') {
                e.preventDefault();
                this.handleAddEvent();
            }
        });

        // Обработка "весь день"
        document.addEventListener('change', (e) => {
            if (e.target.id === 'eventAllDay') {
                this.toggleAllDay();
            }
        });
    }

    /**
     * Показать модальное окно календаря
     */
    showModal() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isVisible = true;
            this.loadCalendar();
        }
    }

    /**
     * Скрыть модальное окно календаря
     */
    hideModal() {
        const modal = document.getElementById('calendarModal');
        if (modal) {
            modal.classList.add('hidden');
            this.isVisible = false;
        }
    }

    /**
     * Показать модальное окно события
     */
    showEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.initializeEventForm();
        }
    }

    /**
     * Скрыть модальное окно события
     */
    hideEventModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.classList.add('hidden');
            this.resetEventForm();
        }
    }

    /**
     * Инициализация формы события
     */
    initializeEventForm() {
        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000); // через час
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // через 2 часа

        document.getElementById('eventStart').value = this.formatDateTimeLocal(startTime);
        document.getElementById('eventEnd').value = this.formatDateTimeLocal(endTime);
    }

    /**
     * Сброс формы события
     */
    resetEventForm() {
        document.getElementById('eventForm').reset();
    }

    /**
     * Форматирование даты для datetime-local
     */
    formatDateTimeLocal(date) {
        return date.toISOString().slice(0, 16);
    }

    /**
     * Переключение "весь день"
     */
    toggleAllDay() {
        const isAllDay = document.getElementById('eventAllDay').checked;
        const startInput = document.getElementById('eventStart');
        const endInput = document.getElementById('eventEnd');

        if (isAllDay) {
            startInput.type = 'date';
            endInput.type = 'date';
        } else {
            startInput.type = 'datetime-local';
            endInput.type = 'datetime-local';
        }
    }

    /**
     * Загрузка календаря
     */
    loadCalendar() {
        this.updateCurrentMonthDisplay();
        this.renderCalendar();
    }

    /**
     * Обновление отображения текущего месяца
     */
    updateCurrentMonthDisplay() {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];

        const monthName = monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        
        document.getElementById('currentMonth').textContent = `${monthName} ${year}`;
    }

    /**
     * Рендеринг календаря
     */
    renderCalendar() {
        const container = document.getElementById('calendarContent');
        if (!container) return;

        switch (this.currentView) {
            case 'month':
                container.innerHTML = this.renderMonthView();
                break;
            case 'week':
                container.innerHTML = this.renderWeekView();
                break;
            case 'day':
                container.innerHTML = this.renderDayView();
                break;
            case 'list':
                container.innerHTML = this.renderListView();
                break;
        }

        this.setupCalendarEventListeners();
    }

    /**
     * Рендеринг месячного вида
     */
    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = `
            <div class="grid grid-cols-7 gap-px bg-gray-200">
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Вс</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Пн</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Вт</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Ср</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Чт</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Пт</div>
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Сб</div>
        `;

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === month;
            const isToday = this.isToday(date);
            const isSelected = this.isSelectedDate(date);
            
            const events = this.system.getEventsForDay(date);
            
            let dayClass = 'bg-white p-2 min-h-24';
            if (!isCurrentMonth) dayClass += ' text-gray-400';
            if (isToday) dayClass += ' bg-blue-50';
            if (isSelected) dayClass += ' ring-2 ring-blue-500';

            html += `<div class="${dayClass}" data-date="${date.toISOString().split('T')[0]}">`;
            html += `<div class="text-sm font-medium mb-1">${date.getDate()}</div>`;
            
            // Отображение событий
            events.slice(0, 3).forEach(event => {
                const category = this.system.eventCategories.get(event.category);
                const color = category ? category.color : '#6b7280';
                
                html += `
                    <div class="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-75" 
                         style="background-color: ${color}; color: white;"
                         data-event-id="${event.id}">
                        ${event.title}
                    </div>
                `;
            });
            
            if (events.length > 3) {
                html += `<div class="text-xs text-gray-500">+${events.length - 3} еще</div>`;
            }
            
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * Рендеринг недельного вида
     */
    renderWeekView() {
        const weekStart = this.system.getStartOfWeek(this.currentDate);
        const events = this.system.getEventsForWeek(this.currentDate);

        let html = `
            <div class="grid grid-cols-8 gap-px bg-gray-200">
                <div class="bg-gray-100 p-2 text-center text-sm font-medium text-gray-700">Время</div>
        `;

        // Заголовки дней недели
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            
            const isToday = this.isToday(date);
            const dayClass = isToday ? 'bg-blue-50' : 'bg-gray-100';
            
            html += `
                <div class="${dayClass} p-2 text-center">
                    <div class="text-sm font-medium">${this.getDayName(date)}</div>
                    <div class="text-lg font-bold">${date.getDate()}</div>
                </div>
            `;
        }

        // Временные слоты
        for (let hour = 8; hour <= 20; hour++) {
            html += `<div class="bg-gray-100 p-2 text-xs text-gray-500 text-right">${hour}:00</div>`;
            
            for (let day = 0; day < 7; day++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + day);
                date.setHours(hour, 0, 0, 0);
                
                const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.startDate);
                    return eventDate.getDate() === date.getDate() && 
                           eventDate.getHours() === hour;
                });

                html += `<div class="bg-white p-1 min-h-12 relative">`;
                
                dayEvents.forEach(event => {
                    const category = this.system.eventCategories.get(event.category);
                    const color = category ? category.color : '#6b7280';
                    
                    html += `
                        <div class="text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-75" 
                             style="background-color: ${color}; color: white;"
                             data-event-id="${event.id}">
                            ${event.title}
                        </div>
                    `;
                });
                
                html += '</div>';
            }
        }

        html += '</div>';
        return html;
    }

    /**
     * Рендеринг дневного вида
     */
    renderDayView() {
        const events = this.system.getEventsForDay(this.selectedDate);
        const dateStr = this.selectedDate.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let html = `
            <div class="p-4">
                <h4 class="text-lg font-semibold mb-4">${dateStr}</h4>
                <div class="space-y-2">
        `;

        if (events.length === 0) {
            html += `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-4">📅</div>
                    <p>На этот день событий не запланировано</p>
                </div>
            `;
        } else {
            events.forEach(event => {
                const category = this.system.eventCategories.get(event.category);
                const color = category ? category.color : '#6b7280';
                const startTime = new Date(event.startDate).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const endTime = new Date(event.endDate).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                html += `
                    <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" data-event-id="${event.id}">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                                <h5 class="font-medium">${event.title}</h5>
                            </div>
                            <span class="text-sm text-gray-500">${startTime} - ${endTime}</span>
                        </div>
                        ${event.description ? `<p class="text-sm text-gray-600 mb-2">${event.description}</p>` : ''}
                        ${event.location ? `<p class="text-sm text-gray-500">📍 ${event.location}</p>` : ''}
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Рендеринг списка событий
     */
    renderListView() {
        const events = Array.from(this.system.events.values())
            .sort((a, b) => a.startDate - b.startDate);

        let html = `
            <div class="p-4">
                <h4 class="text-lg font-semibold mb-4">Все события</h4>
                <div class="space-y-2">
        `;

        if (events.length === 0) {
            html += `
                <div class="text-center text-gray-500 py-8">
                    <div class="text-4xl mb-4">📅</div>
                    <p>Событий не найдено</p>
                </div>
            `;
        } else {
            events.forEach(event => {
                const category = this.system.eventCategories.get(event.category);
                const color = category ? category.color : '#6b7280';
                const date = new Date(event.startDate);
                const dateStr = date.toLocaleDateString('ru-RU');
                const timeStr = date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                html += `
                    <div class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" data-event-id="${event.id}">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                                <h5 class="font-medium">${event.title}</h5>
                            </div>
                            <span class="text-sm text-gray-500">${dateStr} ${timeStr}</span>
                        </div>
                        ${event.description ? `<p class="text-sm text-gray-600 mb-2">${event.description}</p>` : ''}
                        ${event.location ? `<p class="text-sm text-gray-500">📍 ${event.location}</p>` : ''}
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Настройка обработчиков событий календаря
     */
    setupCalendarEventListeners() {
        // Клики по дням в месячном виде
        document.querySelectorAll('[data-date]').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                this.selectedDate = new Date(dateStr);
                this.switchView('day');
            });
        });

        // Клики по событиям
        document.querySelectorAll('[data-event-id]').forEach(event => {
            event.addEventListener('click', (e) => {
                const eventId = e.currentTarget.dataset.eventId;
                this.showEventDetails(eventId);
            });
        });
    }

    /**
     * Показать детали события
     */
    showEventDetails(eventId) {
        const event = this.system.events.get(eventId);
        if (!event) return;

        const category = this.system.eventCategories.get(event.category);
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        const details = `
            <div class="p-4">
                <h4 class="text-lg font-semibold mb-4">${event.title}</h4>
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-medium text-gray-700">Дата и время:</label>
                        <p class="text-sm text-gray-600">
                            ${startDate.toLocaleDateString('ru-RU')} ${startDate.toLocaleTimeString('ru-RU')} - 
                            ${endDate.toLocaleTimeString('ru-RU')}
                        </p>
                    </div>
                    ${event.description ? `
                        <div>
                            <label class="text-sm font-medium text-gray-700">Описание:</label>
                            <p class="text-sm text-gray-600">${event.description}</p>
                        </div>
                    ` : ''}
                    ${event.location ? `
                        <div>
                            <label class="text-sm font-medium text-gray-700">Местоположение:</label>
                            <p class="text-sm text-gray-600">${event.location}</p>
                        </div>
                    ` : ''}
                    <div>
                        <label class="text-sm font-medium text-gray-700">Категория:</label>
                        <p class="text-sm text-gray-600">${category ? category.name : 'Не указана'}</p>
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Редактировать
                    </button>
                    <button class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Удалить
                    </button>
                </div>
            </div>
        `;

        // Показать модальное окно с деталями
        alert(details);
    }

    /**
     * Обработка добавления события
     */
    handleAddEvent() {
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const category = document.getElementById('eventCategory').value;
        const startDate = document.getElementById('eventStart').value;
        const endDate = document.getElementById('eventEnd').value;
        const location = document.getElementById('eventLocation').value;
        const isAllDay = document.getElementById('eventAllDay').checked;

        if (!title || !startDate || !endDate) {
            alert('Заполните обязательные поля');
            return;
        }

        const eventData = {
            title: title,
            description: description,
            category: category,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location: location,
            isAllDay: isAllDay
        };

        this.system.createEvent(eventData);
        this.hideEventModal();
        this.renderCalendar();
        this.showSuccessMessage('Событие добавлено');
    }

    /**
     * Переключение вида календаря
     */
    switchView(view) {
        this.currentView = view;
        
        // Обновление активной кнопки
        document.querySelectorAll('#monthView, #weekView, #dayView, #listView').forEach(btn => {
            btn.classList.remove('bg-white', 'shadow');
            btn.classList.add('hover:bg-gray-100');
        });
        
        document.getElementById(view + 'View').classList.add('bg-white', 'shadow');
        document.getElementById(view + 'View').classList.remove('hover:bg-gray-100');
        
        this.renderCalendar();
    }

    /**
     * Переход к предыдущему месяцу
     */
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.loadCalendar();
    }

    /**
     * Переход к следующему месяцу
     */
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.loadCalendar();
    }

    /**
     * Переход к сегодняшнему дню
     */
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.loadCalendar();
    }

    /**
     * Проверка является ли дата сегодняшней
     */
    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    /**
     * Проверка является ли дата выбранной
     */
    isSelectedDate(date) {
        return date.getDate() === this.selectedDate.getDate() &&
               date.getMonth() === this.selectedDate.getMonth() &&
               date.getFullYear() === this.selectedDate.getFullYear();
    }

    /**
     * Получение названия дня недели
     */
    getDayName(date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    }

    /**
     * Показать сообщение об успехе
     */
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Создание кнопки для открытия календаря
     */
    createCalendarButton() {
        const button = document.createElement('button');
        button.id = 'openCalendarModal';
        button.className = 'fixed bottom-4 right-32 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors z-50';
        button.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
        `;
        button.title = 'Календарь событий';

        button.addEventListener('click', () => {
            this.showModal();
        });

        document.body.appendChild(button);
    }

    /**
     * Интеграция с основной страницей
     */
    integrateWithMainPage() {
        // Добавляем кнопку календаря в навигацию
        const nav = document.querySelector('nav') || document.querySelector('.navbar');
        if (nav) {
            const calendarNavItem = document.createElement('div');
            calendarNavItem.className = 'flex items-center space-x-2';
            calendarNavItem.innerHTML = `
                <button id="navCalendar" class="text-gray-600 hover:text-green-500 transition-colors flex items-center space-x-1">
                    <span>📅</span>
                    <span class="hidden md:inline">Календарь</span>
                </button>
            `;
            
            nav.appendChild(calendarNavItem);
            
            document.getElementById('navCalendar').addEventListener('click', () => {
                this.showModal();
            });
        }

        // Создаем плавающую кнопку
        this.createCalendarButton();
    }

    /**
     * Получение статистики UI
     */
    getStats() {
        return {
            isVisible: this.isVisible,
            currentView: this.currentView,
            currentDate: this.currentDate,
            selectedDate: this.selectedDate,
            systemStats: this.system.getCalendarStats()
        };
    }

    /**
     * Тестовый режим
     */
    enableTestMode() {
        console.log('🧪 Включен тестовый режим UI календаря');
        
        // Показываем модальное окно
        this.showModal();
        
        return {
            stats: this.getStats(),
            systemStats: this.system.getCalendarStats()
        };
    }
}

// Экспорт для использования в других модулях
window.CalendarUI = CalendarUI; 