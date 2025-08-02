// 🔐 Безопасная конфигурация Firebase
// Этот файл будет заменяться при деплое с правильными переменными окружения

(function() {
  // Функция для загрузки конфигурации из переменных окружения
  const loadFirebaseConfig = () => {
    // В продакшене эти значения будут заменены на реальные переменные окружения
    return {
      apiKey: window.FIREBASE_API_KEY || "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0", // Новый безопасный ключ
      authDomain: "workincz-759c7.firebaseapp.com",
      projectId: "workincz-759c7",
      storageBucket: "workincz-759c7.appspot.com",
      messagingSenderId: "670842817143",
      appId: "1:670842817143:web:d8998634da78318e9f1472",
      // databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app" // Закомментировано - используем только Firestore
    };
  };

  // Экспортируем функцию для использования в других файлах
  window.loadFirebaseConfig = loadFirebaseConfig;
  
  console.log('🔐 Firebase конфигурация загружена безопасно');
})(); 