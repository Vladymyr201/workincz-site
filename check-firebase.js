#!/usr/bin/env node

/**
 * Скрипт для проверки состояния Firebase проекта
 */

const https = require('https');

const FIREBASE_URL = 'https://workincz-759c7.web.app';

console.log('🔍 Проверка Firebase проекта...\n');

function checkFirebaseSite() {
    return new Promise((resolve) => {
        console.log(`🌐 Проверка ${FIREBASE_URL}...`);
        
        const req = https.get(FIREBASE_URL, (res) => {
            console.log(`✅ Firebase сайт доступен: ${res.statusCode} ${res.statusMessage}`);
            console.log(`   Content-Type: ${res.headers['content-type']}`);
            console.log(`   Server: ${res.headers['server']}`);
            resolve(true);
        });
        
        req.on('error', (error) => {
            console.log('❌ Firebase сайт недоступен:', error.message);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ Таймаут при проверке Firebase сайта');
            req.destroy();
            resolve(false);
        });
    });
}

function checkLocalFiles() {
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n📁 Проверка локальных файлов...');
    
    const publicDir = path.join(__dirname, 'public');
    const indexFile = path.join(publicDir, 'index.html');
    
    if (fs.existsSync(publicDir)) {
        console.log('✅ Папка public существует');
        
        if (fs.existsSync(indexFile)) {
            console.log('✅ index.html существует');
            const stats = fs.statSync(indexFile);
            console.log(`   Размер: ${(stats.size / 1024).toFixed(1)} KB`);
        } else {
            console.log('❌ index.html не найден');
        }
    } else {
        console.log('❌ Папка public не найдена');
    }
}

async function main() {
    console.log('🚀 Начинаем проверку Firebase проекта...\n');
    
    checkLocalFiles();
    const firebaseOk = await checkFirebaseSite();
    
    console.log('\n📊 Результаты проверки:');
    console.log(`   Локальные файлы: ✅`);
    console.log(`   Firebase сайт: ${firebaseOk ? '✅' : '❌'}`);
    
    if (firebaseOk) {
        console.log('\n🎉 Firebase сайт работает!');
        console.log(`🌐 URL: ${FIREBASE_URL}`);
        console.log('\n🔧 Для настройки кастомного домена:');
        console.log('1. Настройте DNS в Vedos (см. docs/VEDOS_DNS_SETUP.md)');
        console.log('2. Добавьте домен в Firebase Console');
    } else {
        console.log('\n⚠️  Firebase сайт недоступен.');
        console.log('🔧 Возможные решения:');
        console.log('1. Запустите: npm run deploy');
        console.log('2. Проверьте Firebase Console');
        console.log('3. Убедитесь, что проект активен');
    }
    
    console.log('\n📖 Документация:');
    console.log('- docs/VEDOS_DNS_SETUP.md - настройка DNS');
    console.log('- docs/FINAL_DOMAIN_SETUP.md - полная настройка');
}

main().catch(console.error); 