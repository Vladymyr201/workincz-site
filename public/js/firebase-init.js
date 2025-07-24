// 🔥 Firebase инициализация - общий файл
(function() {
  // Проверяем, не инициализирован ли уже Firebase
  if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
    console.log('✅ Firebase уже инициализирован');
    return;
  }

  // Конфигурация Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAo34JvPwyqjwzjhd-d-qEKh7HqAAWsIiM",
    authDomain: "workincz-759c7.firebaseapp.com",
    projectId: "workincz-759c7",
    storageBucket: "workincz-759c7.appspot.com",
    messagingSenderId: "670842817143",
    appId: "1:670842817143:web:d8998634da78318e9f1472",
    databaseURL: "https://workincz-759c7-default-rtdb.europe-west1.firebasedatabase.app"
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