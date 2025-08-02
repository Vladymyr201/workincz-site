/**
 * СИСТЕМА УПРАВЛЕНИЯ КАНДИДАТАМИ ДЛЯ АГЕНЦИЙ
 * Продвинутые функции для работы с кандидатами
 */

class AgencyCandidateManager {
    constructor() {
        this.candidates = [];
        this.filters = {
            skills: [],
            experience: '',
            location: '',
            salary: { min: 0, max: 0 },
            availability: '',
            status: 'all'
        };
        this.currentView = 'grid';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] Agency: ${message}`);
    }

    // Инициализация системы
    init() {
        this.log('🚀 Инициализация системы управления кандидатами...');
        
        this.loadMockCandidates();
        this.setupEventListeners();
        this.renderCandidates();
        this.setupFilters();
        
        this.log('✅ Система управления кандидатами инициализирована', 'success');
    }

    // Загрузка тестовых данных кандидатов
    loadMockCandidates() {
        this.candidates = [
            {
                id: 1,
                name: 'Анна Новакова',
                email: 'anna.novakova@email.cz',
                phone: '+420 123 456 789',
                position: 'Senior JavaScript Developer',
                experience: 5,
                skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
                location: 'Прага',
                salary: 85000,
                availability: 'immediate',
                status: 'active',
                rating: 4.8,
                lastContact: '2025-07-18',
                notes: 'Отличный кандидат, готов к переезду',
                avatar: 'https://i.pravatar.cc/150?img=1'
            },
            {
                id: 2,
                name: 'Петр Свобода',
                email: 'petr.svoboda@email.cz',
                phone: '+420 987 654 321',
                position: 'UX/UI Designer',
                experience: 3,
                skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
                location: 'Брно',
                salary: 65000,
                availability: '2_weeks',
                status: 'interviewing',
                rating: 4.5,
                lastContact: '2025-07-17',
                notes: 'Творческий дизайнер, сильный портфолио',
                avatar: 'https://i.pravatar.cc/150?img=2'
            },
            {
                id: 3,
                name: 'Мария Черна',
                email: 'marie.cerna@email.cz',
                phone: '+420 555 123 456',
                position: 'Product Manager',
                experience: 7,
                skills: ['Product Strategy', 'Agile', 'JIRA', 'Analytics'],
                location: 'Прага',
                salary: 95000,
                availability: '1_month',
                status: 'active',
                rating: 4.9,
                lastContact: '2025-07-16',
                notes: 'Опытный PM, знает рынок',
                avatar: 'https://i.pravatar.cc/150?img=3'
            },
            {
                id: 4,
                name: 'Ян Горак',
                email: 'jan.horak@email.cz',
                phone: '+420 777 888 999',
                position: 'DevOps Engineer',
                experience: 4,
                skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                location: 'Острава',
                salary: 75000,
                availability: 'immediate',
                status: 'placed',
                rating: 4.7,
                lastContact: '2025-07-15',
                notes: 'Успешно трудоустроен',
                avatar: 'https://i.pravatar.cc/150?img=4'
            },
            {
                id: 5,
                name: 'Люция Власакова',
                email: 'lucie.vlasakova@email.cz',
                phone: '+420 333 444 555',
                position: 'Frontend Developer',
                experience: 2,
                skills: ['Vue.js', 'CSS', 'HTML', 'JavaScript'],
                location: 'Пльзень',
                salary: 55000,
                availability: 'immediate',
                status: 'active',
                rating: 4.2,
                lastContact: '2025-07-14',
                notes: 'Молодая, но перспективная',
                avatar: 'https://i.pravatar.cc/150?img=5'
            }
        ];
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Переключение вида
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-toggle')) {
                this.currentView = e.target.dataset.view;
                this.renderCandidates();
            }
            
            if (e.target.matches('.sort-option')) {
                this.sortBy = e.target.dataset.sort;
                this.sortOrder = e.target.dataset.order || 'asc';
                this.renderCandidates();
            }
        });

        // Фильтры
        document.addEventListener('change', (e) => {
            if (e.target.matches('.filter-input')) {
                this.applyFilters();
            }
        });

        // Поиск
        const searchInput = document.querySelector('#candidateSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCandidates(e.target.value);
            });
        }
    }

    // Рендеринг кандидатов
    renderCandidates() {
        const container = document.querySelector('#candidatesContainer');
        if (!container) return;

        const filteredCandidates = this.getFilteredCandidates();
        const sortedCandidates = this.sortCandidates(filteredCandidates);

        if (this.currentView === 'grid') {
            container.innerHTML = this.renderGridView(sortedCandidates);
        } else {
            container.innerHTML = this.renderListView(sortedCandidates);
        }

        this.updateStats(filteredCandidates.length);
    }

    // Рендеринг в виде сетки
    renderGridView(candidates) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${candidates.map(candidate => `
                    <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                        <div class="flex items-center mb-4">
                            <img src="${candidate.avatar}" alt="${candidate.name}" 
                                 class="w-12 h-12 rounded-full mr-4">
                            <div>
                                <h3 class="font-semibold text-gray-900">${candidate.name}</h3>
                                <p class="text-sm text-gray-600">${candidate.position}</p>
                            </div>
                            <div class="ml-auto">
                                <span class="px-2 py-1 text-xs rounded-full 
                                    ${this.getStatusColor(candidate.status)}">
                                    ${this.getStatusText(candidate.status)}
                                </span>
                            </div>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-map-marker-alt mr-2"></i>
                                ${candidate.location}
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-briefcase mr-2"></i>
                                ${candidate.experience} лет опыта
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-coins mr-2"></i>
                                ${candidate.salary.toLocaleString()} CZK
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="flex items-center mb-2">
                                <span class="text-sm font-medium text-gray-700">Навыки:</span>
                                <span class="ml-auto text-sm text-gray-500">${candidate.rating} ⭐</span>
                            </div>
                            <div class="flex flex-wrap gap-1">
                                ${candidate.skills.slice(0, 3).map(skill => 
                                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${skill}</span>`
                                ).join('')}
                                ${candidate.skills.length > 3 ? 
                                    `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">+${candidate.skills.length - 3}</span>` : ''
                                }
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <button onclick="agencyCandidateManager.viewCandidate(${candidate.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                <i class="fas fa-eye mr-1"></i>Просмотр
                            </button>
                            <button onclick="agencyCandidateManager.contactCandidate(${candidate.id})" 
                                    class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                <i class="fas fa-phone mr-1"></i>Связаться
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Рендеринг в виде списка
    renderListView(candidates) {
        return `
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Кандидат
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Позиция
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Опыт
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Зарплата
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${candidates.map(candidate => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img src="${candidate.avatar}" alt="${candidate.name}" 
                                             class="w-10 h-10 rounded-full mr-3">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">${candidate.name}</div>
                                            <div class="text-sm text-gray-500">${candidate.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${candidate.position}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${candidate.experience} лет
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${candidate.salary.toLocaleString()} CZK
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(candidate.status)}">
                                        ${this.getStatusText(candidate.status)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onclick="agencyCandidateManager.viewCandidate(${candidate.id})" 
                                            class="text-blue-600 hover:text-blue-900 mr-3">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="agencyCandidateManager.contactCandidate(${candidate.id})" 
                                            class="text-green-600 hover:text-green-900 mr-3">
                                        <i class="fas fa-phone"></i>
                                    </button>
                                    <button onclick="agencyCandidateManager.editCandidate(${candidate.id})" 
                                            class="text-yellow-600 hover:text-yellow-900">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Получение отфильтрованных кандидатов
    getFilteredCandidates() {
        return this.candidates.filter(candidate => {
            // Фильтр по навыкам
            if (this.filters.skills.length > 0) {
                const hasSkill = this.filters.skills.some(skill => 
                    candidate.skills.some(candidateSkill => 
                        candidateSkill.toLowerCase().includes(skill.toLowerCase())
                    )
                );
                if (!hasSkill) return false;
            }

            // Фильтр по опыту
            if (this.filters.experience && candidate.experience < parseInt(this.filters.experience)) {
                return false;
            }

            // Фильтр по локации
            if (this.filters.location && !candidate.location.toLowerCase().includes(this.filters.location.toLowerCase())) {
                return false;
            }

            // Фильтр по зарплате
            if (this.filters.salary.min > 0 && candidate.salary < this.filters.salary.min) {
                return false;
            }
            if (this.filters.salary.max > 0 && candidate.salary > this.filters.salary.max) {
                return false;
            }

            // Фильтр по статусу
            if (this.filters.status !== 'all' && candidate.status !== this.filters.status) {
                return false;
            }

            return true;
        });
    }

    // Сортировка кандидатов
    sortCandidates(candidates) {
        return candidates.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'experience':
                    aValue = a.experience;
                    bValue = b.experience;
                    break;
                case 'salary':
                    aValue = a.salary;
                    bValue = b.salary;
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                default:
                    aValue = a.name;
                    bValue = b.name;
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    // Применение фильтров
    applyFilters() {
        const skillInputs = document.querySelectorAll('input[name="skills"]:checked');
        this.filters.skills = Array.from(skillInputs).map(input => input.value);

        const experienceSelect = document.querySelector('#experienceFilter');
        if (experienceSelect) {
            this.filters.experience = experienceSelect.value;
        }

        const locationInput = document.querySelector('#locationFilter');
        if (locationInput) {
            this.filters.location = locationInput.value;
        }

        const salaryMin = document.querySelector('#salaryMin');
        const salaryMax = document.querySelector('#salaryMax');
        if (salaryMin && salaryMax) {
            this.filters.salary.min = parseInt(salaryMin.value) || 0;
            this.filters.salary.max = parseInt(salaryMax.value) || 0;
        }

        const statusSelect = document.querySelector('#statusFilter');
        if (statusSelect) {
            this.filters.status = statusSelect.value;
        }

        this.renderCandidates();
    }

    // Поиск кандидатов
    searchCandidates(query) {
        if (!query.trim()) {
            this.renderCandidates();
            return;
        }

        const searchResults = this.candidates.filter(candidate => 
            candidate.name.toLowerCase().includes(query.toLowerCase()) ||
            candidate.position.toLowerCase().includes(query.toLowerCase()) ||
            candidate.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderSearchResults(searchResults);
    }

    // Рендеринг результатов поиска
    renderSearchResults(results) {
        const container = document.querySelector('#candidatesContainer');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-gray-400 text-4xl mb-4"></i>
                    <p class="text-gray-500">Кандидаты не найдены</p>
                </div>
            `;
            return;
        }

        this.renderCandidates();
    }

    // Настройка фильтров
    setupFilters() {
        const filterContainer = document.querySelector('#filterContainer');
        if (!filterContainer) return;

        filterContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    <i class="fas fa-filter mr-2 text-blue-600"></i>Фильтры
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Навыки -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Навыки</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" name="skills" value="JavaScript" class="filter-input mr-2">
                                <span class="text-sm">JavaScript</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="skills" value="React" class="filter-input mr-2">
                                <span class="text-sm">React</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" name="skills" value="Design" class="filter-input mr-2">
                                <span class="text-sm">Design</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Опыт -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Минимальный опыт</label>
                        <select id="experienceFilter" class="filter-input w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="">Любой</option>
                            <option value="1">1+ лет</option>
                            <option value="3">3+ лет</option>
                            <option value="5">5+ лет</option>
                        </select>
                    </div>
                    
                    <!-- Локация -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Локация</label>
                        <input type="text" id="locationFilter" placeholder="Прага, Брно..." 
                               class="filter-input w-full border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                    
                    <!-- Статус -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                        <select id="statusFilter" class="filter-input w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="all">Все</option>
                            <option value="active">Активные</option>
                            <option value="interviewing">На интервью</option>
                            <option value="placed">Трудоустроены</option>
                        </select>
                    </div>
                </div>
                
                <!-- Зарплата -->
                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Зарплата (CZK)</label>
                    <div class="flex space-x-2">
                        <input type="number" id="salaryMin" placeholder="От" 
                               class="filter-input flex-1 border border-gray-300 rounded-lg px-3 py-2">
                        <input type="number" id="salaryMax" placeholder="До" 
                               class="filter-input flex-1 border border-gray-300 rounded-lg px-3 py-2">
                    </div>
                </div>
            </div>
        `;
    }

    // Обновление статистики
    updateStats(count) {
        const statsElement = document.querySelector('#candidatesStats');
        if (statsElement) {
            statsElement.textContent = `Найдено кандидатов: ${count}`;
        }
    }

    // Получение цвета статуса
    getStatusColor(status) {
        const colors = {
            active: 'bg-green-100 text-green-800',
            interviewing: 'bg-yellow-100 text-yellow-800',
            placed: 'bg-blue-100 text-blue-800',
            inactive: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.inactive;
    }

    // Получение текста статуса
    getStatusText(status) {
        const texts = {
            active: 'Активный',
            interviewing: 'На интервью',
            placed: 'Трудоустроен',
            inactive: 'Неактивный'
        };
        return texts[status] || 'Неизвестно';
    }

    // Просмотр кандидата
    viewCandidate(id) {
        const candidate = this.candidates.find(c => c.id === id);
        if (!candidate) return;

        this.showCandidateModal(candidate);
    }

    // Показ модального окна кандидата
    showCandidateModal(candidate) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center">
                            <img src="${candidate.avatar}" alt="${candidate.name}" 
                                 class="w-16 h-16 rounded-full mr-4">
                            <div>
                                <h2 class="text-xl font-bold text-gray-900">${candidate.name}</h2>
                                <p class="text-gray-600">${candidate.position}</p>
                                <div class="flex items-center mt-1">
                                    <span class="text-yellow-500">${'⭐'.repeat(Math.floor(candidate.rating))}</span>
                                    <span class="text-sm text-gray-600 ml-1">${candidate.rating}</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-3">Контактная информация</h3>
                            <div class="space-y-2 text-sm">
                                <div><i class="fas fa-envelope mr-2 text-gray-400"></i>${candidate.email}</div>
                                <div><i class="fas fa-phone mr-2 text-gray-400"></i>${candidate.phone}</div>
                                <div><i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>${candidate.location}</div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-3">Профессиональная информация</h3>
                            <div class="space-y-2 text-sm">
                                <div><strong>Опыт:</strong> ${candidate.experience} лет</div>
                                <div><strong>Зарплата:</strong> ${candidate.salary.toLocaleString()} CZK</div>
                                <div><strong>Доступность:</strong> ${this.getAvailabilityText(candidate.availability)}</div>
                                <div><strong>Статус:</strong> 
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(candidate.status)}">
                                        ${this.getStatusText(candidate.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <h3 class="font-semibold text-gray-900 mb-3">Навыки</h3>
                        <div class="flex flex-wrap gap-2">
                            ${candidate.skills.map(skill => 
                                `<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <h3 class="font-semibold text-gray-900 mb-3">Заметки</h3>
                        <p class="text-gray-600 text-sm">${candidate.notes}</p>
                    </div>
                    
                    <div class="flex justify-end space-x-3 mt-6 pt-6 border-t">
                        <button onclick="agencyCandidateManager.contactCandidate(${candidate.id})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-phone mr-2"></i>Связаться
                        </button>
                        <button onclick="agencyCandidateManager.editCandidate(${candidate.id})" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-edit mr-2"></i>Редактировать
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Получение текста доступности
    getAvailabilityText(availability) {
        const texts = {
            immediate: 'Немедленно',
            '2_weeks': 'Через 2 недели',
            '1_month': 'Через месяц',
            '3_months': 'Через 3 месяца'
        };
        return texts[availability] || 'Не указано';
    }

    // Связь с кандидатом
    contactCandidate(id) {
        const candidate = this.candidates.find(c => c.id === id);
        if (!candidate) return;

        this.log(`📞 Связь с кандидатом: ${candidate.name}`, 'info');
        
        // Показываем уведомление
        this.showNotification(`Связываемся с ${candidate.name}...`, 'info');
        
        // Симуляция звонка
        setTimeout(() => {
            this.showNotification(`Звонок ${candidate.name} завершен`, 'success');
        }, 2000);
    }

    // Редактирование кандидата
    editCandidate(id) {
        const candidate = this.candidates.find(c => c.id === id);
        if (!candidate) return;

        this.log(`✏️ Редактирование кандидата: ${candidate.name}`, 'info');
        this.showNotification(`Редактирование ${candidate.name}`, 'info');
    }

    // Показ уведомления
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Экспорт кандидатов
    exportCandidates() {
        const filteredCandidates = this.getFilteredCandidates();
        const csv = this.convertToCSV(filteredCandidates);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        this.log('📊 Экспорт кандидатов завершен', 'success');
    }

    // Конвертация в CSV
    convertToCSV(candidates) {
        const headers = ['Имя', 'Email', 'Телефон', 'Позиция', 'Опыт', 'Зарплата', 'Локация', 'Статус'];
        const rows = candidates.map(c => [
            c.name, c.email, c.phone, c.position, c.experience, c.salary, c.location, c.status
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Глобальный экземпляр
window.agencyCandidateManager = new AgencyCandidateManager();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.agencyCandidateManager.init();
}); 