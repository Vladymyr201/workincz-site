#!/usr/bin/env node

/**
 * Скрипт для автоматической настройки Firebase сайта
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'workincz-759c7';
const SITE_ID = 'workclick-cz';
const FIREBASE_URL = `https://${SITE_ID}.web.app`;

console.log('🚀 Автоматическая настройка Firebase сайта...\n');

// Проверяем, что папка public существует
function checkPublicFolder() {
    const publicDir = path.join(__dirname, 'public');
    const indexFile = path.join(publicDir, 'index.html');
    
    if (!fs.existsSync(publicDir)) {
        console.log('❌ Папка public не найдена');
        return false;
    }
    
    if (!fs.existsSync(indexFile)) {
        console.log('❌ index.html не найден');
        return false;
    }
    
    console.log('✅ Папка public и файлы найдены');
    return true;
}

// Проверяем доступность Firebase сайта
function checkFirebaseSite() {
    return new Promise((resolve) => {
        console.log(`🌐 Проверка ${FIREBASE_URL}...`);
        
        const req = https.get(FIREBASE_URL, (res) => {
            console.log(`✅ Firebase сайт доступен: ${res.statusCode} ${res.statusMessage}`);
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

// Проверяем DNS записи
function checkDNS() {
    return new Promise((resolve) => {
        const dns = require('dns').promises;
        
        dns.resolve4('workclick.cz')
            .then(addresses => {
                console.log('📡 DNS записи для workclick.cz:');
                addresses.forEach(ip => console.log(`   - ${ip}`));
                
                const expectedIPs = ['151.101.1.195', '151.101.65.195'];
                const hasCorrectIPs = expectedIPs.every(ip => addresses.includes(ip));
                
                if (hasCorrectIPs) {
                    console.log('✅ DNS записи настроены правильно');
                    resolve(true);
                } else {
                    console.log('❌ DNS записи настроены неправильно');
                    console.log('Ожидаемые IP:', expectedIPs.join(', '));
                    resolve(false);
                }
            })
            .catch(error => {
                console.log('❌ Ошибка при проверке DNS:', error.message);
                resolve(false);
            });
    });
}

// Создаем инструкцию для Firebase Console
function createFirebaseInstructions() {
    const instructions = `
# 🔧 Инструкция для Firebase Console

## Шаг 1: Создание сайта
1. Перейдите в [Firebase Console](https://console.firebase.google.com/project/${PROJECT_ID}/hosting)
2. Нажмите "Add site"
3. Введите Site ID: ${SITE_ID}
4. Нажмите "Create site"

## Шаг 2: Деплой файлов
1. В Firebase Console выберите сайт ${SITE_ID}
2. Нажмите "Deploy to live"
3. Загрузите папку "public" из проекта
4. Нажмите "Deploy"

## Шаг 3: Добавление кастомного домена
1. В настройках сайта нажмите "Add custom domain"
2. Введите: workclick.cz
3. Следуйте инструкциям по верификации

## Шаг 4: Настройка DNS в Vedos
Добавьте DNS записи:
- A запись: @ → 151.101.1.195
- A запись: @ → 151.101.65.195
- CNAME запись: www → ${FIREBASE_URL}
`;

    fs.writeFileSync('FIREBASE_SETUP_INSTRUCTIONS.md', instructions);
    console.log('📝 Создана инструкция: FIREBASE_SETUP_INSTRUCTIONS.md');
}

// Создаем скрипт для деплоя через Firebase CLI
function createDeployScript() {
    const script = `#!/bin/bash
# Скрипт для деплоя на Firebase

echo "🚀 Деплой на Firebase..."

# Очищаем кэш Firebase
firebase logout
firebase login

# Проверяем проект
firebase use ${PROJECT_ID}

# Создаем сайт если не существует
firebase hosting:sites:create ${SITE_ID} || echo "Сайт уже существует"

# Деплоим
firebase deploy --only hosting

echo "✅ Деплой завершен!"
echo "🌐 Сайт доступен: ${FIREBASE_URL}"
`;

    fs.writeFileSync('deploy-firebase.sh', script);
    console.log('📝 Создан скрипт деплоя: deploy-firebase.sh');
}

// Создаем PowerShell скрипт для Windows
function createPowerShellScript() {
    const script = `# PowerShell скрипт для деплоя на Firebase

Write-Host "🚀 Деплой на Firebase..." -ForegroundColor Green

# Очищаем кэш Firebase
firebase logout
firebase login

# Проверяем проект
firebase use ${PROJECT_ID}

# Создаем сайт если не существует
firebase hosting:sites:create ${SITE_ID}

# Деплоим
firebase deploy --only hosting

Write-Host "✅ Деплой завершен!" -ForegroundColor Green
Write-Host "🌐 Сайт доступен: ${FIREBASE_URL}" -ForegroundColor Cyan
`;

    fs.writeFileSync('deploy-firebase.ps1', script);
    console.log('📝 Создан PowerShell скрипт: deploy-firebase.ps1');
}

async function main() {
    console.log('🔍 Проверка проекта...\n');
    
    // Проверяем файлы
    const filesOk = checkPublicFolder();
    if (!filesOk) {
        console.log('❌ Файлы проекта не найдены');
        return;
    }
    
    // Проверяем Firebase сайт
    const firebaseOk = await checkFirebaseSite();
    
    // Проверяем DNS
    const dnsOk = await checkDNS();
    
    console.log('\n📊 Результаты проверки:');
    console.log(`   Файлы проекта: ${filesOk ? '✅' : '❌'}`);
    console.log(`   Firebase сайт: ${firebaseOk ? '✅' : '❌'}`);
    console.log(`   DNS записи: ${dnsOk ? '✅' : '❌'}`);
    
    // Создаем инструкции и скрипты
    createFirebaseInstructions();
    createDeployScript();
    createPowerShellScript();
    
    console.log('\n🎯 Следующие шаги:');
    
    if (!firebaseOk) {
        console.log('1. 🔧 Создайте сайт в Firebase Console (см. FIREBASE_SETUP_INSTRUCTIONS.md)');
        console.log('2. 🚀 Запустите: ./deploy-firebase.ps1');
    }
    
    if (!dnsOk) {
        console.log('3. 🌐 Настройте DNS в Vedos (см. docs/VEDOS_DNS_SETUP.md)');
    }
    
    if (firebaseOk && dnsOk) {
        console.log('🎉 Все настроено! Сайт доступен по адресу: https://workclick.cz');
    }
    
    console.log('\n📖 Документация:');
    console.log('- FIREBASE_SETUP_INSTRUCTIONS.md - инструкция для Firebase Console');
    console.log('- docs/VEDOS_DNS_SETUP.md - настройка DNS');
    console.log('- deploy-firebase.ps1 - скрипт деплоя');
}

main().catch(console.error); 