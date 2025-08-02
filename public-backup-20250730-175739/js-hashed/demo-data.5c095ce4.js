// 🔥 Скрипт для добавления демо-данных в Firebase
class DemoDataManager {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    if (typeof firebase !== 'undefined') {
      this.db = firebase.firestore();
    }
  }

  async addDemoJobs() {
    if (!window.firebase || !window.db) {
      console.log('🔧 Firebase не доступен, демо-данные пропущены');
      return;
    }

    const demoJobs = [
      {
        title: 'Разнорабочий на стройку',
        companyName: 'Stavební firma Novák',
        category: 'construction',
        location: { 
          city: 'Прага',
          district: 'Praha 2',
          address: 'Náměstí Míru 15'
        },
        salary: { 
          min: 140, 
          max: 160, 
          currency: 'CZK', 
          period: 'hour' 
        },
        workType: 'full-time',
        description: 'Требуются разнорабочие на строительный объект в Праге. Опыт работы не обязателен. Предоставляем жильё и помощь с документами. Работа в дружном коллективе, соблюдение всех норм безопасности.',
        requirements: {
          experience: 'Без опыта',
          education: 'Не требуется',
          languages: [
            { name: 'Русский', level: 'native' },
            { name: 'Базовый чешский', level: 'basic' }
          ],
          skills: ['Физическая выносливость', 'Ответственность']
        },
        benefits: [
          'Предоставление жилья',
          'Помощь с документами',
          'Обучение на рабочем месте',
          'Стабильная зарплата'
        ],
        urgent: true,
        housingProvided: true,
        status: 'active',
        visibility: 'public',
        employerId: 'demo-employer-1',
        contactInfo: {
          email: 'hr@stavba-novak.cz',
          phone: '+420 123 456 789'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 45,
        applications: 12
      },
      {
        title: 'Оператор производства',
        companyName: 'Škoda Auto a.s.',
        category: 'manufacturing',
        location: { 
          city: 'Млада-Болеслав',
          district: 'Mladá Boleslav',
          address: 'Václava Klementa 869'
        },
        salary: { 
          min: 32000, 
          max: 38000, 
          currency: 'CZK', 
          period: 'month' 
        },
        workType: 'full-time',
        description: 'Работа на автомобильном производстве. Сборка компонентов, контроль качества. Предоставляем общежитие, транспорт до работы и социальный пакет. Возможность карьерного роста.',
        requirements: {
          experience: 'От 6 месяцев',
          education: 'Среднее',
          languages: [
            { name: 'Базовый чешский', level: 'basic' },
            { name: 'Английский', level: 'basic' }
          ],
          skills: ['Внимательность', 'Техническое мышление', 'Работа в команде']
        },
        benefits: [
          'Общежитие',
          'Транспорт до работы',
          'Социальный пакет',
          'Обучение и развитие',
          'Премии за качество'
        ],
        urgent: true,
        housingProvided: true,
        status: 'active',
        visibility: 'public',
        employerId: 'demo-employer-2',
        contactInfo: {
          email: 'recruitment@skoda-auto.cz',
          phone: '+420 326 811 111'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 89,
        applications: 23
      },
      {
        title: 'Кладовщик-комплектовщик',
        companyName: 'Alza.cz a.s.',
        category: 'warehouse',
        location: { 
          city: 'Прага',
          district: 'Praha 9',
          address: 'Jankovcova 1522/53'
        },
        salary: { 
          min: 130, 
          currency: 'CZK', 
          period: 'hour' 
        },
        workType: 'full-time',
        description: 'Работа на складе интернет-магазина. Комплектация заказов, сортировка товаров. Требуется внимательность и ответственность. Бонусы за выполнение плана. Современное оборудование.',
        requirements: {
          experience: 'Без опыта',
          education: 'Не требуется',
          languages: [
            { name: 'Русский', level: 'native' },
            { name: 'Английский', level: 'basic' }
          ],
          skills: ['Внимательность', 'Физическая выносливость', 'Компьютерная грамотность']
        },
        benefits: [
          'Бонусы за план',
          'Современное оборудование',
          'Обучение',
          'Карьерный рост',
          'Скидки на товары'
        ],
        urgent: true,
        housingProvided: false,
        status: 'active',
        visibility: 'public',
        employerId: 'demo-employer-3',
        contactInfo: {
          email: 'jobs@alza.cz',
          phone: '+420 225 372 372'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 67,
        applications: 18
      },
      {
        title: 'Официант в ресторан',
        companyName: 'Restaurant U Fleku',
        category: 'hospitality',
        location: { 
          city: 'Прага',
          district: 'Praha 1',
          address: 'Křemencova 11'
        },
        salary: { 
          min: 120, 
          max: 150, 
          currency: 'CZK', 
          period: 'hour' 
        },
        workType: 'part-time',
        description: 'Ищем дружелюбного официанта в традиционный чешский ресторан. Опыт приветствуется, но не обязателен. Гибкий график, чаевые, дружный коллектив.',
        requirements: {
          experience: 'Приветствуется',
          education: 'Не требуется',
          languages: [
            { name: 'Чешский', level: 'intermediate' },
            { name: 'Английский', level: 'basic' },
            { name: 'Русский', level: 'native' }
          ],
          skills: ['Коммуникабельность', 'Стрессоустойчивость', 'Аккуратность']
        },
        benefits: [
          'Чаевые',
          'Гибкий график',
          'Питание',
          'Дружный коллектив'
        ],
        urgent: false,
        housingProvided: false,
        status: 'active',
        visibility: 'public',
        employerId: 'demo-employer-4',
        contactInfo: {
          email: 'info@ufleku.cz',
          phone: '+420 224 934 019'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 34,
        applications: 8
      },
      {
        title: 'IT Support Специалист',
        companyName: 'Avast Software s.r.o.',
        category: 'it',
        location: { 
          city: 'Прага',
          district: 'Praha 4',
          address: 'Pikrtova 1737/1a'
        },
        salary: { 
          min: 45000, 
          max: 65000, 
          currency: 'CZK', 
          period: 'month' 
        },
        workType: 'full-time',
        description: 'Ищем IT Support специалиста для поддержки внутренних пользователей. Техническая поддержка, установка ПО, решение проблем с оборудованием. Отличные условия работы.',
        requirements: {
          experience: 'От 1 года',
          education: 'Высшее техническое',
          languages: [
            { name: 'Английский', level: 'intermediate' },
            { name: 'Чешский', level: 'basic' }
          ],
          skills: ['Windows/Linux', 'Сетевые технологии', 'Troubleshooting']
        },
        benefits: [
          'Отличная зарплата',
          'Современный офис',
          'Обучение и сертификации',
          'Гибкий график',
          'Международная команда'
        ],
        urgent: false,
        housingProvided: false,
        status: 'active',
        visibility: 'vip_only',
        employerId: 'demo-employer-5',
        contactInfo: {
          email: 'careers@avast.com',
          phone: '+420 274 005 555'
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        views: 156,
        applications: 45
      }
    ];

    try {
      console.log('🔥 Добавляем демо-вакансии в Firestore...');
      
      for (const job of demoJobs) {
        await this.db.collection('jobs').add(job);
        console.log(`✅ Добавлена вакансия: ${job.title}`);
      }
      
      console.log('🎉 Все демо-вакансии успешно добавлены!');
      window.showToast('Демо-вакансии добавлены в базу данных!', 'success');
      
    } catch (error) {
      console.error('❌ Ошибка добавления демо-вакансий:', error);
      window.showToast('Ошибка добавления демо-вакансий: ' + error.message, 'error');
    }
  }

  async addDemoEmployers() {
    if (!window.firebase || !window.db) {
      console.log('🔧 Firebase не доступен, демо-данные пропущены');
      return;
    }

    const demoEmployers = [
      {
        id: 'demo-employer-1',
        companyName: 'Stavební firma Novák',
        industry: 'Строительство',
        size: '50-100 сотрудников',
        description: 'Строительная компания с 15-летним опытом работы',
        website: 'https://stavba-novak.cz',
        verified: true
      },
      {
        id: 'demo-employer-2', 
        companyName: 'Škoda Auto a.s.',
        industry: 'Автомобилестроение',
        size: '1000+ сотрудников',
        description: 'Ведущий автомобильный производитель Чехии',
        website: 'https://skoda-auto.cz',
        verified: true
      },
      {
        id: 'demo-employer-3',
        companyName: 'Alza.cz a.s.',
        industry: 'E-commerce',
        size: '500-1000 сотрудников', 
        description: 'Крупнейший интернет-магазин в Чехии',
        website: 'https://alza.cz',
        verified: true
      },
      {
        id: 'demo-employer-4',
        companyName: 'Restaurant U Fleku',
        industry: 'Ресторанный бизнес',
        size: '10-50 сотрудников',
        description: 'Традиционный чешский ресторан с богатой историей',
        website: 'https://ufleku.cz',
        verified: true
      },
      {
        id: 'demo-employer-5',
        companyName: 'Avast Software s.r.o.',
        industry: 'IT/Кибербезопасность',
        size: '1000+ сотрудников',
        description: 'Мировой лидер в области кибербезопасности',
        website: 'https://avast.com',
        verified: true
      }
    ];

    try {
      console.log('🏢 Добавляем демо-работодателей...');
      
      for (const employer of demoEmployers) {
        await this.db.collection('employers').doc(employer.id).set(employer);
        console.log(`✅ Добавлен работодатель: ${employer.companyName}`);
      }
      
      console.log('🎉 Все демо-работодатели успешно добавлены!');
      
    } catch (error) {
      console.error('❌ Ошибка добавления работодателей:', error);
    }
  }

  showSuccess(message) {
    window.showToast(message, 'success');
  }

  showError(message) {
    window.showToast(message, 'error');
  }
}

// Функция для быстрого добавления демо-данных
async function addDemoData() {
  const demoManager = new DemoDataManager();
  await demoManager.addDemoEmployers();
  await demoManager.addDemoJobs();
}

// Экспорт для использования в консоли
if (typeof window !== 'undefined') {
  window.addDemoData = addDemoData;
  window.demoDataManager = new DemoDataManager();
} 