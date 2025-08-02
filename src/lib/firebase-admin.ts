// Этот файл предназначен только для серверной части
// и НЕ должен использоваться в клиентском коде!

import * as admin from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';

// Получаем конфигурацию из переменных окружения или используем значения по умолчанию
const projectId = process.env.FIREBASE_PROJECT_ID || 'workincz-759c7';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-p2nmp@workincz-759c7.iam.gserviceaccount.com';
const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : undefined;

// Инициализируем firebase-admin только один раз
let firebaseAdmin: admin.app.App;

try {
  // Проверяем, если уже инициализировано
  if (getApps().length === 0) {
    // Инициализация с учетными данными, если privateKey доступен
    if (privateKey) {
      firebaseAdmin = admin.initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
      console.log('✅ Firebase Admin SDK инициализирован с учетными данными из переменных окружения');
    } else {
      // Инициализация с автоматическим обнаружением учетных данных
      // (работает только в среде Google Cloud или с переменной окружения GOOGLE_APPLICATION_CREDENTIALS)
      firebaseAdmin = admin.initializeApp();
      console.log('✅ Firebase Admin SDK инициализирован с автоматическим обнаружением учетных данных');
    }
  } else {
    firebaseAdmin = admin.app();
    console.log('✅ Используется существующий экземпляр Firebase Admin SDK');
  }
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase Admin SDK:', error);
  throw new Error('Не удалось инициализировать Firebase Admin SDK');
}

export { firebaseAdmin };

export const auth = firebaseAdmin.auth();
export const firestore = firebaseAdmin.firestore();
export const storage = firebaseAdmin.storage();

export default firebaseAdmin;