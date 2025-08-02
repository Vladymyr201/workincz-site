const admin = require('firebase-admin');

// Создаём временный service account для тестирования
const serviceAccount = {
  "type": "service_account",
  "project_id": "workincz-759c7",
  "private_key_id": "temporary_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nTEMP_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-temp@workincz-759c7.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-temp%40workincz-759c7.iam.gserviceaccount.com"
};

// Инициализируем Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin SDK инициализирован');
console.log('📝 Для создания реального service account key:');
console.log('1. Откройте https://console.firebase.google.com');
console.log('2. Выберите проект workincz-759c7');
console.log('3. Перейдите в Project Settings → Service Accounts');
console.log('4. Нажмите "Generate New Private Key"');
console.log('5. Сохраните файл как firebase-service-account.json');