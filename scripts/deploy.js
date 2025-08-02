#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем деплой на Firebase...');

try {
  // Проверяем наличие Firebase CLI
  console.log('📋 Проверяем Firebase CLI...');
  execSync('firebase --version', { stdio: 'inherit' });
  
  // Проверяем конфигурацию
  console.log('🔧 Проверяем конфигурацию...');
  if (!fs.existsSync('firebase.json')) {
    throw new Error('firebase.json не найден!');
  }
  
  if (!fs.existsSync('.firebaserc')) {
    throw new Error('.firebaserc не найден!');
  }
  
  // Логин в Firebase (если не авторизован)
  console.log('🔐 Проверяем авторизацию...');
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Уже авторизован в Firebase');
  } catch (error) {
    console.log('🔑 Требуется авторизация в Firebase...');
    console.log('📱 Откройте браузер и авторизуйтесь...');
    execSync('firebase login --no-localhost', { stdio: 'inherit' });
  }
  
  // Деплой
  console.log('🚀 Деплоим на Firebase...');
  execSync('firebase deploy --only hosting --project workincz-759c7', { stdio: 'inherit' });
  
  console.log('✅ Деплой успешно завершен!');
  console.log('🌐 Сайт доступен по адресу: https://workclick-cz.web.app');
  
} catch (error) {
  console.error('❌ Ошибка деплоя:', error.message);
  process.exit(1);
}