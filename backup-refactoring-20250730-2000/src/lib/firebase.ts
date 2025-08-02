import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase конфигурация с реальными значениями
const firebaseConfig = {
  apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
  authDomain: "workincz-759c7.firebaseapp.com",
  projectId: "workincz-759c7",
  storageBucket: "workincz-759c7.firebasestorage.app",
  messagingSenderId: "670842817143",
  appId: "1:670842817143:web:d8998634da78318e9f1472",
  databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app",
  measurementId: "G-PB27XT0CT0"
};

// Инициализация Firebase только на клиенте
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== 'undefined') {
  // Инициализация только в браузере
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Инициализация Google провайдера
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

// Экспорт сервисов Firebase
export { auth, db, storage, googleProvider };
export default app; 