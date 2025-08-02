const admin = require('firebase-admin');

// Проверяем наличие service account файла
let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
  console.log('✅ Service account файл найден');
} catch (error) {
  console.log('⚠️  Service account файл не найден, создаём временный...');
  
  // Создаём временный service account
  serviceAccount = {
    "type": "service_account",
    "project_id": "workincz-759c7",
    "private_key_id": "temp_key_" + Date.now(),
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nzLmdvrtLDv6/9tUAcR4c/7/6HNpHN0dxFfmDtlYkfgrHkQgKZFPkIipySDmxWeh\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-temp@workincz-759c7.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-temp%40workincz-759c7.iam.gserviceaccount.com"
  };
}

// Инициализируем Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK инициализирован');
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase Admin SDK:', error.message);
  console.log('📝 Создайте тестовые аккаунты вручную через Firebase Console:');
  console.log('🔗 https://console.firebase.google.com/project/workincz-759c7/authentication/users');
  process.exit(1);
}

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
  console.log('🎭 Создание тестовых аккаунтов...');
  
  for (const account of testAccounts) {
    try {
      // Проверяем, существует ли уже пользователь
      try {
        const existingUser = await auth.getUserByEmail(account.email);
        console.log(`⚠️  Аккаунт уже существует: ${account.email}`);
        
        // Обновляем профиль в Firestore
        await firestore.collection('users').doc(existingUser.uid).set({
          ...account.profile,
          email: account.email,
          displayName: account.displayName
        }, { merge: true });
        
        console.log(`✅ Профиль обновлён: ${account.email}`);
        
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Создаём нового пользователя
          const userRecord = await auth.createUser({
            email: account.email,
            password: account.password,
            displayName: account.displayName,
            emailVerified: true
          });
          
          console.log(`✅ Пользователь создан: ${account.email} (UID: ${userRecord.uid})`);
          
          // Создаём профиль в Firestore
          await firestore.collection('users').doc(userRecord.uid).set({
            ...account.profile,
            email: account.email,
            displayName: account.displayName
          });
          
          console.log(`✅ Профиль создан: ${account.email}`);
        } else {
          throw error;
        }
      }
      
    } catch (error) {
      console.error(`❌ Ошибка создания аккаунта ${account.email}:`, error.message);
    }
  }
  
  console.log('\n🎉 Создание тестовых аккаунтов завершено!');
  console.log('\n📋 Тестовые аккаунты:');
  testAccounts.forEach(account => {
    console.log(`   ${account.role}: ${account.email} / ${account.password}`);
  });
  
  console.log('\n🎯 Тестирование:');
  console.log('1. Откройте: https://workclick.cz/test-role-switcher.html');
  console.log('2. Используйте переключатель ролей 🎭');
  console.log('3. Протестируйте переключение между ролями');
}

createTestAccounts().catch(console.error);