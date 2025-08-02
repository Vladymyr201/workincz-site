// 🔥 Firebase инициализация - общий файл
(function() {
  // Проверяем, не инициализирован ли уже Firebase
  if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
    console.log('✅ Firebase уже инициализирован');
    return;
  }

  // Загружаем безопасную конфигурацию Firebase
  const firebaseConfig = window.loadFirebaseConfig ? window.loadFirebaseConfig() : {
    apiKey: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0", // Единый API ключ
    authDomain: "workclick-cz.web.app", // Правильный домен согласно настройкам проекта
    projectId: "workincz-759c7",
    storageBucket: "workincz-759c7.appspot.com",
    messagingSenderId: "670842817143",
    appId: "1:670842817143:web:d8998634da78318e9f1472"
    // databaseURL убран - используем только Firestore
  };

  // Инициализируем Firebase только один раз
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase инициализирован успешно');
  } catch (error) {
    if (error.code === 'app/duplicate-app') {
      console.log('✅ Firebase уже инициализирован');
    } else {
      console.error('❌ Ошибка инициализации Firebase:', error);
    }
  }
})(); 