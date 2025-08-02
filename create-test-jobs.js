// Скрипт для создания тестовых вакансий в Firebase Firestore
const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Тестовые вакансии
const testJobs = [
  {
    title: "Frontend Developer",
    company: "TechCorp Prague",
    location: {
      city: "Прага",
      country: "Чехия"
    },
    salary: {
      min: 3500,
      max: 4500,
      currency: "EUR"
    },
    type: "full-time",
    category: "IT & Разработка",
    experience: "mid",
    description: "Мы ищем опытного Frontend разработчика для работы над инновационными проектами. Требуется знание React, TypeScript и современных веб-технологий.",
    requirements: [
      "Опыт работы с React 2+ года",
      "Знание TypeScript",
      "Опыт с CSS/SCSS",
      "Понимание принципов UX/UI"
    ],
    benefits: [
      "Гибкий график работы",
      "Удаленная работа",
      "Медицинская страховка",
      "25 дней отпуска"
    ],
    status: "active",
    urgent: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employerId: "test-employer-1"
  },
  {
    title: "UX Designer",
    company: "Design Studio",
    location: {
      city: "Брно",
      country: "Чехия"
    },
    salary: {
      min: 2800,
      max: 3800,
      currency: "EUR"
    },
    type: "full-time",
    category: "IT & Разработка",
    experience: "mid",
    description: "Создавайте потрясающие пользовательские интерфейсы для наших клиентов. Работайте с современными инструментами дизайна.",
    requirements: [
      "Опыт в UX/UI дизайне 3+ года",
      "Знание Figma, Sketch",
      "Понимание принципов дизайна",
      "Портфолио работ"
    ],
    benefits: [
      "Творческая атмосфера",
      "Профессиональное развитие",
      "Участие в конференциях",
      "Гибкий график"
    ],
    status: "active",
    urgent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employerId: "test-employer-2"
  },
  {
    title: "Project Manager",
    company: "Global Solutions",
    location: {
      city: "Прага",
      country: "Чехия"
    },
    salary: {
      min: 4000,
      max: 5500,
      currency: "EUR"
    },
    type: "full-time",
    category: "IT & Разработка",
    experience: "senior",
    description: "Управляйте крупными IT проектами и командами разработчиков. Отвечайте за планирование, координацию и успешную реализацию проектов.",
    requirements: [
      "Опыт управления проектами 5+ лет",
      "Знание методологий Agile/Scrum",
      "Опыт работы с международными командами",
      "Отличные коммуникативные навыки"
    ],
    benefits: [
      "Высокая зарплата",
      "Карьерный рост",
      "Международные проекты",
      "Премии за успешные проекты"
    ],
    status: "active",
    urgent: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employerId: "test-employer-3"
  },
  {
    title: "Marketing Specialist",
    company: "Digital Agency",
    location: {
      city: "Острава",
      country: "Чехия"
    },
    salary: {
      min: 2200,
      max: 3200,
      currency: "EUR"
    },
    type: "full-time",
    category: "Маркетинг",
    experience: "junior",
    description: "Присоединяйтесь к нашей команде маркетологов! Работайте над digital-кампаниями для клиентов из разных отраслей.",
    requirements: [
      "Образование в области маркетинга",
      "Знание социальных сетей",
      "Опыт работы с Google Analytics",
      "Креативное мышление"
    ],
    benefits: [
      "Обучение и развитие",
      "Молодая команда",
      "Интересные проекты",
      "Возможность роста"
    ],
    status: "active",
    urgent: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employerId: "test-employer-4"
  },
  {
    title: "Sales Manager",
    company: "Tech Sales",
    location: {
      city: "Прага",
      country: "Чехия"
    },
    salary: {
      min: 3000,
      max: 4500,
      currency: "EUR"
    },
    type: "full-time",
    category: "Продажи",
    experience: "mid",
    description: "Продавайте IT решения крупным клиентам. Работайте с B2B сегментом и достигайте высоких результатов.",
    requirements: [
      "Опыт в B2B продажах 3+ года",
      "Знание IT продуктов",
      "Навыки презентации",
      "Целеустремленность"
    ],
    benefits: [
      "Комиссионные от продаж",
      "Корпоративная машина",
      "Премии за достижения",
      "Карьерный рост"
    ],
    status: "active",
    urgent: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employerId: "test-employer-5"
  }
];

// Функция для добавления вакансий
async function createTestJobs() {
  try {
    console.log('🚀 Начинаем создание тестовых вакансий...');
    
    for (let i = 0; i < testJobs.length; i++) {
      const job = testJobs[i];
      const docRef = await db.collection('jobs').add(job);
      console.log(`✅ Вакансия "${job.title}" создана с ID: ${docRef.id}`);
    }
    
    console.log('🎉 Все тестовые вакансии успешно созданы!');
    console.log(`📊 Создано вакансий: ${testJobs.length}`);
    
    // Получаем статистику
    const snapshot = await db.collection('jobs').where('status', '==', 'active').get();
    console.log(`📈 Всего активных вакансий в базе: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Ошибка при создании вакансий:', error);
  } finally {
    process.exit(0);
  }
}

// Запускаем создание вакансий
createTestJobs(); 