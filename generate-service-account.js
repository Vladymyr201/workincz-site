const fs = require('fs');
const path = require('path');

// Создаём service account credentials на основе существующей конфигурации
const serviceAccount = {
  "type": "service_account",
  "project_id": "workincz-759c7",
  "private_key_id": "auto_generated_key_id",
  "private_key": process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nAUTO_GENERATED_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-auto@workincz-759c7.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-auto%40workincz-759c7.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Сохраняем в файл
const filePath = path.join(__dirname, 'firebase-service-account.json');
fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));

console.log('✅ Service account файл создан:', filePath);
console.log('⚠️  ВНИМАНИЕ: Это временный файл для тестирования!');
console.log('📝 Для продакшена получите реальный ключ в Firebase Console');
console.log('🔗 https://console.firebase.google.com/project/workincz-759c7/settings/serviceaccounts/adminsdk');