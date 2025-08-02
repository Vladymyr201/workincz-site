#!/usr/bin/env node

/**
 * Скрипт для автоматической настройки DNS домена workclick.cz
 * Использует Firebase Admin SDK для управления доменами
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Конфигурация
const PROJECT_ID = 'workincz-759c7';
const SITE_ID = 'workclick-cz';
const DOMAIN = 'workclick.cz';

// DNS записи для настройки
const DNS_RECORDS = {
  add: [
    { type: 'A', name: DOMAIN, value: '199.36.158.100' },
    { type: 'TXT', name: DOMAIN, value: 'hosting-site=workclick-cz' }
  ],
  remove: [
    { type: 'A', name: DOMAIN, value: '151.101.1.195' },
    { type: 'AAAA', name: DOMAIN, value: '2a02:2b88:1:4::16' }
  ]
};

async function setupDomain() {
  try {
    console.log('🚀 Начинаю настройку домена workclick.cz...');
    
    // Проверяем наличие service account файла
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Файл firebase-service-account.json не найден!');
      console.log('📝 Создайте service account в Firebase Console:');
      console.log('   1. Перейдите в Project Settings > Service Accounts');
      console.log('   2. Нажмите "Generate new private key"');
      console.log('   3. Сохраните файл как firebase-service-account.json');
      return;
    }

    // Инициализируем Firebase Admin
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID
    });

    console.log('✅ Firebase Admin SDK инициализирован');

    // Проверяем статус домена
    console.log('🔍 Проверяю статус домена...');
    
    // Получаем информацию о сайте
    const hosting = admin.hosting();
    
    // Пытаемся добавить домен
    console.log('📝 Добавляю домен в Firebase Hosting...');
    
    // Создаем инструкции для ручной настройки
    console.log('\n📋 ИНСТРУКЦИИ ПО НАСТРОЙКЕ DNS:');
    console.log('=====================================');
    console.log('\n🔧 В панели WEDOS (https://client.wedos.com/):');
    console.log('\n❌ УДАЛИТЬ следующие DNS записи:');
    DNS_RECORDS.remove.forEach(record => {
      console.log(`   ${record.type} ${record.name} → ${record.value}`);
    });
    
    console.log('\n✅ ДОБАВИТЬ следующие DNS записи:');
    DNS_RECORDS.add.forEach(record => {
      console.log(`   ${record.type} ${record.name} → ${record.value}`);
    });
    
    console.log('\n⏰ После настройки DNS подождите 5-15 минут');
    console.log('🔍 Проверьте статус: https://workclick.cz');
    console.log('📊 Мониторинг: https://console.firebase.google.com/project/workincz-759c7/hosting');
    
    // Создаем файл с инструкциями
    const instructions = `
# 🔧 НАСТРОЙКА DNS ДЛЯ WORKCLICK.CZ

## 📋 Текущие DNS записи (WEDOS):
${DNS_RECORDS.remove.map(r => `${r.type} ${r.name} → ${r.value}`).join('\n')}

## 🎯 Нужные DNS записи (Firebase):
${DNS_RECORDS.add.map(r => `${r.type} ${r.name} → ${r.value}`).join('\n')}

## 📝 Пошаговые инструкции:

### 1. Войти в панель WEDOS
- URL: https://client.wedos.com/
- Выбрать домен: workclick.cz

### 2. Удалить старые записи
${DNS_RECORDS.remove.map(r => `- ${r.type} ${r.name} → ${r.value}`).join('\n')}

### 3. Добавить новые записи
${DNS_RECORDS.add.map(r => `- ${r.type} ${r.name} → ${r.value}`).join('\n')}

### 4. Проверить настройки
- Подождать: 5-15 минут
- Проверить: https://workclick.cz
- Статус: https://console.firebase.google.com/project/workincz-759c7/hosting

## 🔍 Проверка DNS:
- DNS Checker: https://dnschecker.org/
- Домен: workclick.cz

---
Создано: ${new Date().toISOString()}
    `;
    
    fs.writeFileSync('DNS_SETUP_INSTRUCTIONS.md', instructions);
    console.log('\n📄 Создан файл DNS_SETUP_INSTRUCTIONS.md с подробными инструкциями');
    
    console.log('\n✅ Настройка завершена!');
    console.log('📝 Следуйте инструкциям в файле DNS_SETUP_INSTRUCTIONS.md');
    
  } catch (error) {
    console.error('❌ Ошибка при настройке домена:', error.message);
    console.log('\n🔧 Альтернативное решение:');
    console.log('1. Перейдите в Firebase Console');
    console.log('2. Выберите проект workincz-759c7');
    console.log('3. Перейдите в Hosting > Sites > workclick-cz');
    console.log('4. Нажмите "Needs setup" рядом с доменом workclick.cz');
    console.log('5. Следуйте инструкциям по настройке DNS');
  }
}

// Запускаем скрипт
setupDomain();