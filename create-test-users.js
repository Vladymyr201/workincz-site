const https = require('https');
const fs = require('fs');

// Конфигурация Firebase
const FIREBASE_PROJECT_ID = 'workincz-759c7';
const FIREBASE_API_KEY = 'AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0';

// Тестовые аккаунты
const testAccounts = [
  {
    email: 'test-candidate@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Соискатель',
    role: 'candidate'
  },
  {
    email: 'test-employer@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Работодатель',
    role: 'employer'
  },
  {
    email: 'test-agency@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовое Агентство',
    role: 'agency'
  },
  {
    email: 'test-admin@workclick.cz',
    password: 'test1234',
    displayName: 'Тестовый Админ',
    role: 'admin'
  }
];

// Функция для создания пользователя через Firebase Auth REST API
function createUser(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      emailVerified: true
    });

    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      port: 443,
      path: `/v1/projects/${FIREBASE_PROJECT_ID}/accounts`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`✅ Пользователь создан: ${userData.email}`);
            resolve(result);
          } else {
            console.log(`⚠️  Пользователь уже существует: ${userData.email}`);
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Основная функция
async function createTestUsers() {
  console.log('🎭 Создание тестовых пользователей...');
  
  for (const account of testAccounts) {
    try {
      await createUser(account);
    } catch (error) {
      console.error(`❌ Ошибка создания пользователя ${account.email}:`, error.message);
    }
  }
  
  console.log('✅ Создание пользователей завершено');
  console.log('📝 Теперь создайте профили в Firestore вручную');
  console.log('🔗 https://console.firebase.google.com/project/workincz-759c7/firestore');
}

createTestUsers().catch(console.error);