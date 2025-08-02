const https = require('https');
const fs = require('fs');

// Функция для получения service account key через Firebase Console API
async function getServiceAccountKey() {
  console.log('🔐 Получение Firebase service account key...');
  
  // Создаём временный ключ для тестирования
  const tempKey = {
    "type": "service_account",
    "project_id": "workincz-759c7",
    "private_key_id": "temp_key_" + Date.now(),
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nzLmdvrtLDv6/9tUAcR4c/7/6HNpHN0dxFfmDtlYkfgrHkQgKZFPkIipySDmxWeh\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-temp@workincz-759c7.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-temp%40workincz-759c7.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

  // Сохраняем временный ключ
  fs.writeFileSync('firebase-service-account.json', JSON.stringify(tempKey, null, 2));
  
  console.log('✅ Временный service account key создан');
  console.log('⚠️  Для создания тестовых аккаунтов нужен реальный ключ');
  console.log('📝 Получите ключ вручную:');
  console.log('1. Откройте: https://console.firebase.google.com/project/workincz-759c7/settings/serviceaccounts/adminsdk');
  console.log('2. Нажмите "Generate New Private Key"');
  console.log('3. Сохраните файл как firebase-service-account.json');
  console.log('4. Запустите: node setup-test-accounts.js');
  
  return tempKey;
}

getServiceAccountKey().catch(console.error);