// 🔐 Создание тестовых аккаунтов через Firebase Admin SDK
// Запуск: node setup-test-accounts.js

const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
// Примечание: нужно создать service account key в Firebase Console
// Project Settings -> Service Accounts -> Generate New Private Key

let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
} catch (error) {
  console.error('❌ Ошибка: Не найден файл firebase-service-account.json');
  console.log('📋 Инструкция:');
  console.log('1. Перейдите в Firebase Console -> Project Settings -> Service Accounts');
  console.log('2. Нажмите "Generate New Private Key"');
  console.log('3. Сохраните файл как firebase-service-account.json в корне проекта');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const firestore = admin.firestore();

// Тестовые аккаунты
const testAccounts = [
  {
    role: 'candidate',
    email: 'test-candidate@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Соискатель',
    profile: {
      role: 'candidate',
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+420123456789',
      location: 'Прага',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '3 года',
      education: 'Высшее техническое',
      languages: ['Русский', 'Чешский', 'Английский'],
      visaStatus: 'Рабочая виза',
      salaryExpectation: '45000 CZK',
      availability: 'Немедленно',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    role: 'employer',
    email: 'test-employer@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Работодатель',
    profile: {
      role: 'employer',
      companyName: 'TechCorp s.r.o.',
      firstName: 'Анна',
      lastName: 'Новакова',
      phone: '+420987654321',
      location: 'Прага',
      industry: 'IT и разработка',
      companySize: '50-100 сотрудников',
      website: 'https://techcorp.cz',
      description: 'Инновационная IT компания',
      verificationStatus: 'verified',
      subscriptionPlan: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    role: 'agency',
    email: 'test-agency@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовое Агентство',
    profile: {
      role: 'agency',
      companyName: 'WorkBridge Agency s.r.o.',
      firstName: 'Петр',
      lastName: 'Смирнов',
      phone: '+420555666777',
      location: 'Брно',
      industry: 'Рекрутинг и HR',
      companySize: '10-25 сотрудников',
      website: 'https://workbridge.cz',
      description: 'Профессиональное агентство по трудоустройству',
      licenseNumber: 'CZ123456789',
      verificationStatus: 'verified',
      subscriptionPlan: 'premium',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  },
  {
    role: 'admin',
    email: 'test-admin@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Админ',
    profile: {
      role: 'admin',
      firstName: 'Админ',
      lastName: 'Системный',
      phone: '+420111222333',
      permissions: ['all'],
      isSuperAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }
];

async function createTestAccounts() {
  console.log('🔐 Создание тестовых аккаунтов...');
  
  for (const account of testAccounts) {
    try {
      // Проверяем, существует ли уже пользователь
      try {
        const existingUser = await auth.getUserByEmail(account.email);
        console.log(`⚠️ Аккаунт уже существует: ${account.email}`);
        
        // Обновляем профиль в Firestore
        await firestore.collection('users').doc(existingUser.uid).set({
          email: account.email,
          name: account.name,
          role: account.role,
          verified: true,
          is_premium: false,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log(`📝 Профиль обновлен в Firestore для: ${account.email}`);
        continue;
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }
      
      // Создаём пользователя в Firebase Auth
      const userRecord = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.displayName,
        emailVerified: true
      });
      
      console.log(`✅ Создан аккаунт: ${account.email} (${account.role})`);
      
      // Создаём профиль в Firestore
      await firestore.collection('users').doc(userRecord.uid).set({
        email: account.email,
        name: account.name,
        role: account.role,
        verified: true,
        is_premium: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`📝 Профиль создан в Firestore для: ${account.email}`);
      
    } catch (error) {
      console.error(`❌ Ошибка создания ${account.email}:`, error.message);
    }
  }
  
  console.log('🎉 Создание тестовых аккаунтов завершено!');
  console.log('');
  console.log('📋 Тестовые аккаунты:');
  testAccounts.forEach(account => {
    console.log(`   ${account.email} (${account.role}) - пароль: ${account.password}`);
  });
  console.log('');
  console.log('🎭 Теперь можете использовать систему переключения ролей!');
  
  process.exit(0);
}

createTestAccounts().catch(console.error); 