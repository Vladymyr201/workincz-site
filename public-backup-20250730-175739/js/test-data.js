// Тестовые данные для демонстрации функциональности
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
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
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
    createdAt: new Date(),
    employerId: "test-employer-5"
  }
];

// Функция для анонимной аутентификации
async function signInAnonymously() {
  try {
    const userCredential = await firebase.auth().signInAnonymously();
    console.log('✅ Анонимная аутентификация успешна:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Ошибка анонимной аутентификации:', error);
    throw error;
  }
}

// Функция для добавления тестовых вакансий
async function addTestJobs() {
  try {
    console.log('🚀 Начинаем добавление тестовых вакансий...');
    
    // Сначала выполняем анонимную аутентификацию
    await signInAnonymously();
    
    const db = firebase.firestore();
    
    for (let i = 0; i < testJobs.length; i++) {
      const job = testJobs[i];
      const docRef = await db.collection('jobs').add(job);
      console.log(`✅ Вакансия "${job.title}" добавлена с ID: ${docRef.id}`);
    }
    
    console.log('🎉 Все тестовые вакансии успешно добавлены!');
    console.log(`📊 Добавлено вакансий: ${testJobs.length}`);
    
    // Показываем уведомление
    if (typeof showNotification === 'function') {
      showNotification(`✅ Добавлено ${testJobs.length} тестовых вакансий!`, 'success');
    }
    
    // Обновляем страницу через 2 секунды
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении вакансий:', error);
    if (typeof showNotification === 'function') {
      showNotification('❌ Ошибка при добавлении вакансий: ' + error.message, 'error');
    }
  }
}

// Функция для очистки тестовых данных
async function clearTestJobs() {
  try {
    console.log('🗑️ Начинаем очистку тестовых вакансий...');
    
    // Сначала выполняем анонимную аутентификацию
    await signInAnonymously();
    
    const db = firebase.firestore();
    const snapshot = await db.collection('jobs').where('employerId', '==', 'test-employer-1').get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log('✅ Тестовые вакансии удалены!');
    
    if (typeof showNotification === 'function') {
      showNotification('✅ Тестовые вакансии удалены!', 'success');
    }
    
    // Обновляем страницу через 2 секунды
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Ошибка при удалении вакансий:', error);
    if (typeof showNotification === 'function') {
      showNotification('❌ Ошибка при удалении вакансий: ' + error.message, 'error');
    }
  }
}

// Экспортируем функции для использования в других файлах
window.addTestJobs = addTestJobs;
window.clearTestJobs = clearTestJobs;
window.testJobs = testJobs; 