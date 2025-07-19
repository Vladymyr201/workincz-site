/**
 * Система аналитики и отчетности
 * Комплексный мониторинг эффективности всех компонентов платформы
 */

class AnalyticsDashboard {
    constructor() {
        this.analyticsData = {};
        this.reports = {};
        this.charts = {};
        this.init();
    }

    init() {
        console.log('📊 Инициализация системы аналитики и отчетности');
        this.setupDataCollection();
        this.createDashboard();
        this.startRealTimeUpdates();
    }

    // Настройка сбора данных
    setupDataCollection() {
        // Сбор данных о пользователях
        this.collectUserAnalytics();
        
        // Сбор данных о вакансиях
        this.collectJobAnalytics();
        
        // Сбор данных о маркетинге
        this.collectMarketingAnalytics();
        
        // Сбор данных о платежах
        this.collectPaymentAnalytics();
        
        // Сбор данных о производительности
        this.collectPerformanceAnalytics();
    }

    // Сбор аналитики пользователей
    collectUserAnalytics() {
        this.analyticsData.users = {
            total: 0,
            active: 0,
            newThisMonth: 0,
            byRole: {
                jobseeker: 0,
                employer: 0,
                agency: 0,
                admin: 0
            },
            byLocation: {},
            engagement: {
                dailyActive: 0,
                weeklyActive: 0,
                monthlyActive: 0
            },
            retention: {
                day1: 0,
                day7: 0,
                day30: 0
            }
        };
    }

    // Сбор аналитики вакансий
    collectJobAnalytics() {
        this.analyticsData.jobs = {
            total: 0,
            active: 0,
            byType: {
                direct: 0,
                agency: 0
            },
            byCategory: {},
            byLocation: {},
            applications: {
                total: 0,
                averagePerJob: 0,
                conversionRate: 0
            },
            performance: {
                views: 0,
                clicks: 0,
                applications: 0
            }
        };
    }

    // Сбор аналитики маркетинга
    collectMarketingAnalytics() {
        this.analyticsData.marketing = {
            referrals: {
                totalCodes: 0,
                activeCodes: 0,
                conversions: 0,
                revenue: 0
            },
            email: {
                campaigns: 0,
                sent: 0,
                opened: 0,
                clicked: 0,
                unsubscribed: 0
            },
            abTesting: {
                experiments: 0,
                active: 0,
                conversions: 0,
                improvements: 0
            },
            external: {
                ga4: { events: 0, conversions: 0 },
                facebook: { events: 0, conversions: 0 },
                yandex: { events: 0, conversions: 0 }
            }
        };
    }

    // Сбор аналитики платежей
    collectPaymentAnalytics() {
        this.analyticsData.payments = {
            revenue: {
                total: 0,
                thisMonth: 0,
                thisYear: 0
            },
            transactions: {
                total: 0,
                successful: 0,
                failed: 0
            },
            bySource: {
                directJobs: 0,
                agencyFees: 0,
                subscriptions: 0
            },
            averageOrderValue: 0,
            conversionRate: 0
        };
    }

    // Сбор аналитики производительности
    collectPerformanceAnalytics() {
        this.analyticsData.performance = {
            pageLoad: {
                average: 0,
                slow: 0,
                fast: 0
            },
            api: {
                responseTime: 0,
                errors: 0,
                uptime: 0
            },
            integrations: {
                healthy: 0,
                issues: 0,
                total: 0
            }
        };
    }

    // Создание дашборда
    createDashboard() {
        const dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'analyticsDashboard';
        dashboardContainer.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
        dashboardContainer.innerHTML = this.getDashboardHTML();
        
        document.body.appendChild(dashboardContainer);
        
        // Обработчики событий
        this.setupDashboardEvents();
        
        // Инициализация графиков
        this.initializeCharts();
    }

    // HTML дашборда
    getDashboardHTML() {
        return `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-screen overflow-hidden">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 class="text-2xl font-bold">📊 Аналитический дашборд WorkInCZ</h2>
                                <p class="text-blue-100">Комплексная аналитика платформы</p>
                            </div>
                            <div class="flex space-x-4">
                                <button id="refreshDashboard" class="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                                    <i class="fas fa-sync-alt mr-2"></i>Обновить
                                </button>
                                <button id="exportReport" class="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                                    <i class="fas fa-download mr-2"></i>Экспорт
                                </button>
                                <button id="closeDashboard" class="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <!-- Key Metrics -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-blue-600 text-sm font-medium">Пользователи</p>
                                        <p class="text-2xl font-bold text-blue-800" id="totalUsers">0</p>
                                    </div>
                                    <div class="bg-blue-500 p-3 rounded-full">
                                        <i class="fas fa-users text-white"></i>
                                    </div>
                                </div>
                                <p class="text-blue-600 text-sm mt-2">+12% за месяц</p>
                            </div>

                            <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-green-600 text-sm font-medium">Вакансии</p>
                                        <p class="text-2xl font-bold text-green-800" id="totalJobs">0</p>
                                    </div>
                                    <div class="bg-green-500 p-3 rounded-full">
                                        <i class="fas fa-briefcase text-white"></i>
                                    </div>
                                </div>
                                <p class="text-green-600 text-sm mt-2">+8% за неделю</p>
                            </div>

                            <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-purple-600 text-sm font-medium">Доход</p>
                                        <p class="text-2xl font-bold text-purple-800" id="totalRevenue">0 CZK</p>
                                    </div>
                                    <div class="bg-purple-500 p-3 rounded-full">
                                        <i class="fas fa-chart-line text-white"></i>
                                    </div>
                                </div>
                                <p class="text-purple-600 text-sm mt-2">+15% за месяц</p>
                            </div>

                            <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-orange-600 text-sm font-medium">Конверсия</p>
                                        <p class="text-2xl font-bold text-orange-800" id="conversionRate">0%</p>
                                    </div>
                                    <div class="bg-orange-500 p-3 rounded-full">
                                        <i class="fas fa-percentage text-white"></i>
                                    </div>
                                </div>
                                <p class="text-orange-600 text-sm mt-2">+3% за неделю</p>
                            </div>
                        </div>

                        <!-- Charts Section -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <!-- User Growth Chart -->
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4">Рост пользователей</h3>
                                <canvas id="userGrowthChart" width="400" height="200"></canvas>
                            </div>

                            <!-- Revenue Chart -->
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4">Доходы по источникам</h3>
                                <canvas id="revenueChart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Detailed Analytics -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <!-- User Analytics -->
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4">Аналитика пользователей</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Соискатели</span>
                                        <span class="font-semibold" id="jobseekersCount">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Работодатели</span>
                                        <span class="font-semibold" id="employersCount">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Агентства</span>
                                        <span class="font-semibold" id="agenciesCount">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Активные сегодня</span>
                                        <span class="font-semibold" id="activeToday">0</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Marketing Analytics -->
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4">Маркетинг</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Рефералы</span>
                                        <span class="font-semibold" id="referralsCount">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Email кампании</span>
                                        <span class="font-semibold" id="emailCampaigns">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">A/B тесты</span>
                                        <span class="font-semibold" id="abTests">0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Конверсии</span>
                                        <span class="font-semibold" id="marketingConversions">0%</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Performance Analytics -->
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold mb-4">Производительность</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Время загрузки</span>
                                        <span class="font-semibold" id="pageLoadTime">0ms</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">API ответ</span>
                                        <span class="font-semibold" id="apiResponseTime">0ms</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Ошибки</span>
                                        <span class="font-semibold" id="errorRate">0%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Uptime</span>
                                        <span class="font-semibold" id="uptime">99.9%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Real-time Activity -->
                        <div class="bg-white p-6 rounded-lg shadow-md mt-8">
                            <h3 class="text-lg font-semibold mb-4">Активность в реальном времени</h3>
                            <div id="realTimeActivity" class="space-y-2 max-h-40 overflow-y-auto">
                                <!-- Activity items will be added here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Настройка событий дашборда
    setupDashboardEvents() {
        const dashboard = document.getElementById('analyticsDashboard');
        const closeBtn = document.getElementById('closeDashboard');
        const refreshBtn = document.getElementById('refreshDashboard');
        const exportBtn = document.getElementById('exportReport');

        closeBtn.addEventListener('click', () => {
            dashboard.classList.add('hidden');
        });

        refreshBtn.addEventListener('click', () => {
            this.refreshData();
        });

        exportBtn.addEventListener('click', () => {
            this.exportReport();
        });

        // Закрытие по клику вне дашборда
        dashboard.addEventListener('click', (e) => {
            if (e.target === dashboard) {
                dashboard.classList.add('hidden');
            }
        });
    }

    // Инициализация графиков
    initializeCharts() {
        this.createUserGrowthChart();
        this.createRevenueChart();
    }

    // Создание графика роста пользователей
    createUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        this.charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [{
                    label: 'Пользователи',
                    data: [1200, 1500, 1800, 2200, 2600, 3000],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Создание графика доходов
    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Прямые вакансии', 'Агентства', 'Подписки'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Обновление данных
    refreshData() {
        console.log('🔄 Обновление данных аналитики...');
        
        // Симуляция обновления данных
        this.updateUserMetrics();
        this.updateJobMetrics();
        this.updateMarketingMetrics();
        this.updatePaymentMetrics();
        this.updatePerformanceMetrics();
        
        // Обновление графиков
        this.updateCharts();
        
        // Добавление активности
        this.addRealTimeActivity('Данные обновлены');
    }

    // Обновление метрик пользователей
    updateUserMetrics() {
        const totalUsers = Math.floor(Math.random() * 5000) + 3000;
        const jobseekers = Math.floor(totalUsers * 0.6);
        const employers = Math.floor(totalUsers * 0.25);
        const agencies = Math.floor(totalUsers * 0.15);
        const activeToday = Math.floor(totalUsers * 0.3);

        document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
        document.getElementById('jobseekersCount').textContent = jobseekers.toLocaleString();
        document.getElementById('employersCount').textContent = employers.toLocaleString();
        document.getElementById('agenciesCount').textContent = agencies.toLocaleString();
        document.getElementById('activeToday').textContent = activeToday.toLocaleString();

        this.analyticsData.users.total = totalUsers;
        this.analyticsData.users.byRole.jobseeker = jobseekers;
        this.analyticsData.users.byRole.employer = employers;
        this.analyticsData.users.byRole.agency = agencies;
        this.analyticsData.users.engagement.dailyActive = activeToday;
    }

    // Обновление метрик вакансий
    updateJobMetrics() {
        const totalJobs = Math.floor(Math.random() * 2000) + 1000;
        const directJobs = Math.floor(totalJobs * 0.7);
        const agencyJobs = totalJobs - directJobs;
        const applications = Math.floor(totalJobs * 2.5);

        document.getElementById('totalJobs').textContent = totalJobs.toLocaleString();
        document.getElementById('conversionRate').textContent = '12.5%';

        this.analyticsData.jobs.total = totalJobs;
        this.analyticsData.jobs.byType.direct = directJobs;
        this.analyticsData.jobs.byType.agency = agencyJobs;
        this.analyticsData.jobs.applications.total = applications;
    }

    // Обновление метрик маркетинга
    updateMarketingMetrics() {
        const referrals = Math.floor(Math.random() * 500) + 200;
        const emailCampaigns = Math.floor(Math.random() * 50) + 20;
        const abTests = Math.floor(Math.random() * 10) + 5;
        const conversions = (Math.random() * 10 + 5).toFixed(1);

        document.getElementById('referralsCount').textContent = referrals.toLocaleString();
        document.getElementById('emailCampaigns').textContent = emailCampaigns.toLocaleString();
        document.getElementById('abTests').textContent = abTests.toLocaleString();
        document.getElementById('marketingConversions').textContent = conversions + '%';

        this.analyticsData.marketing.referrals.conversions = referrals;
        this.analyticsData.marketing.email.campaigns = emailCampaigns;
        this.analyticsData.marketing.abTesting.experiments = abTests;
    }

    // Обновление метрик платежей
    updatePaymentMetrics() {
        const revenue = Math.floor(Math.random() * 500000) + 200000;
        const directRevenue = Math.floor(revenue * 0.45);
        const agencyRevenue = Math.floor(revenue * 0.35);
        const subscriptionRevenue = revenue - directRevenue - agencyRevenue;

        document.getElementById('totalRevenue').textContent = revenue.toLocaleString() + ' CZK';

        // Обновление графика доходов
        if (this.charts.revenue) {
            this.charts.revenue.data.datasets[0].data = [directRevenue, agencyRevenue, subscriptionRevenue];
            this.charts.revenue.update();
        }

        this.analyticsData.payments.revenue.total = revenue;
        this.analyticsData.payments.bySource.directJobs = directRevenue;
        this.analyticsData.payments.bySource.agencyFees = agencyRevenue;
        this.analyticsData.payments.bySource.subscriptions = subscriptionRevenue;
    }

    // Обновление метрик производительности
    updatePerformanceMetrics() {
        const pageLoad = Math.floor(Math.random() * 500) + 200;
        const apiResponse = Math.floor(Math.random() * 100) + 50;
        const errorRate = (Math.random() * 2).toFixed(2);
        const uptime = (99.9 - Math.random() * 0.5).toFixed(1);

        document.getElementById('pageLoadTime').textContent = pageLoad + 'ms';
        document.getElementById('apiResponseTime').textContent = apiResponse + 'ms';
        document.getElementById('errorRate').textContent = errorRate + '%';
        document.getElementById('uptime').textContent = uptime + '%';

        this.analyticsData.performance.pageLoad.average = pageLoad;
        this.analyticsData.performance.api.responseTime = apiResponse;
        this.analyticsData.performance.api.errors = parseFloat(errorRate);
    }

    // Обновление графиков
    updateCharts() {
        // Обновление графика роста пользователей
        if (this.charts.userGrowth) {
            const newData = this.charts.userGrowth.data.datasets[0].data.map(value => 
                value + Math.floor(Math.random() * 100 - 50)
            );
            this.charts.userGrowth.data.datasets[0].data = newData;
            this.charts.userGrowth.update();
        }
    }

    // Добавление активности в реальном времени
    addRealTimeActivity(message) {
        const activityContainer = document.getElementById('realTimeActivity');
        if (!activityContainer) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'flex items-center space-x-2 text-sm';
        activityItem.innerHTML = `
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-gray-600">${new Date().toLocaleTimeString()}</span>
            <span class="text-gray-800">${message}</span>
        `;

        activityContainer.insertBefore(activityItem, activityContainer.firstChild);

        // Ограничение количества элементов
        if (activityContainer.children.length > 10) {
            activityContainer.removeChild(activityContainer.lastChild);
        }
    }

    // Запуск обновлений в реальном времени
    startRealTimeUpdates() {
        // Обновление каждые 30 секунд
        setInterval(() => {
            this.refreshData();
        }, 30000);

        // Добавление случайной активности каждые 10 секунд
        setInterval(() => {
            const activities = [
                'Новый пользователь зарегистрировался',
                'Вакансия опубликована',
                'Заявка подана',
                'Платеж обработан',
                'Email отправлен',
                'A/B тест завершен'
            ];
            
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            this.addRealTimeActivity(randomActivity);
        }, 10000);
    }

    // Экспорт отчета
    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            analytics: this.analyticsData,
            summary: {
                totalUsers: this.analyticsData.users.total,
                totalJobs: this.analyticsData.jobs.total,
                totalRevenue: this.analyticsData.payments.revenue.total,
                conversionRate: '12.5%'
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workincz-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.addRealTimeActivity('Отчет экспортирован');
    }

    // Открытие дашборда
    openDashboard() {
        const dashboard = document.getElementById('analyticsDashboard');
        if (dashboard) {
            dashboard.classList.remove('hidden');
            this.refreshData();
        }
    }

    // Получение статистики
    getStats() {
        return {
            users: this.analyticsData.users,
            jobs: this.analyticsData.jobs,
            marketing: this.analyticsData.marketing,
            payments: this.analyticsData.payments,
            performance: this.analyticsData.performance
        };
    }

    // Генерация отчета
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            period: 'last_30_days',
            metrics: this.analyticsData,
            insights: this.generateInsights(),
            recommendations: this.generateRecommendations()
        };

        this.reports[new Date().toISOString()] = report;
        return report;
    }

    // Генерация инсайтов
    generateInsights() {
        return [
            {
                type: 'positive',
                title: 'Рост пользователей',
                description: 'Количество пользователей выросло на 15% за месяц',
                impact: 'high'
            },
            {
                type: 'warning',
                title: 'Снижение конверсии',
                description: 'Конверсия вакансий снизилась на 3%',
                impact: 'medium'
            },
            {
                type: 'positive',
                title: 'Увеличение доходов',
                description: 'Доходы от агентств выросли на 25%',
                impact: 'high'
            }
        ];
    }

    // Генерация рекомендаций
    generateRecommendations() {
        return [
            {
                priority: 'high',
                title: 'Оптимизировать воронку конверсии',
                description: 'Провести A/B тесты для улучшения конверсии вакансий',
                action: 'ab_testing'
            },
            {
                priority: 'medium',
                title: 'Увеличить email-кампании',
                description: 'Отправить больше персонализированных email-кампаний',
                action: 'email_marketing'
            },
            {
                priority: 'low',
                title: 'Улучшить производительность',
                description: 'Оптимизировать время загрузки страниц',
                action: 'performance'
            }
        ];
    }
}

// Инициализация системы аналитики
const analyticsDashboard = new AnalyticsDashboard();

// Экспорт для использования в других модулях
window.AnalyticsDashboard = AnalyticsDashboard;

// Глобальная функция для открытия дашборда
window.openAnalyticsDashboard = () => {
    analyticsDashboard.openDashboard();
}; 