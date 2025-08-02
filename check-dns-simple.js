#!/usr/bin/env node

/**
 * Простой скрипт для проверки DNS настроек домена workclick.cz
 * Запуск: node check-dns-simple.js
 */

const dns = require('dns').promises;
const https = require('https');
const http = require('http');

const DOMAIN = 'workclick.cz';
const EXPECTED_IPS = ['151.101.1.195', '151.101.65.195'];
const FIREBASE_URL = 'https://workclick-cz.web.app';

console.log('🔍 Проверка DNS настроек для workclick.cz\n');

async function checkDNS() {
    try {
        console.log('📡 Проверяем A записи...');
        const addresses = await dns.resolve4(DOMAIN);
        console.log(`   Найдены IP адреса: ${addresses.join(', ')}`);
        
        const allCorrect = EXPECTED_IPS.every(ip => addresses.includes(ip));
        if (allCorrect) {
            console.log('   ✅ Все IP адреса корректны!');
            return true;
        } else {
            console.log('   ❌ Не все IP адреса корректны');
            console.log(`   Ожидаемые: ${EXPECTED_IPS.join(', ')}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Ошибка DNS: ${error.message}`);
        return false;
    }
}

async function checkCNAME() {
    try {
        console.log('🔗 Проверяем CNAME запись для www...');
        const cname = await dns.resolveCname(`www.${DOMAIN}`);
        console.log(`   CNAME: www.${DOMAIN} → ${cname[0]}`);
        
        if (cname[0] === 'workclick-cz.web.app') {
            console.log('   ✅ CNAME запись корректна!');
            return true;
        } else {
            console.log('   ❌ CNAME запись некорректна');
            console.log('   Ожидается: workclick-cz.web.app');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Ошибка CNAME: ${error.message}`);
        return false;
    }
}

async function checkWebsite() {
    return new Promise((resolve) => {
        console.log('🌐 Проверяем доступность сайта...');
        
        const req = https.get(`https://${DOMAIN}`, (res) => {
            console.log(`   Статус: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('   ✅ Сайт доступен!');
                resolve(true);
            } else {
                console.log('   ⚠️ Сайт отвечает, но статус не 200');
                resolve(false);
            }
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ Ошибка подключения: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('   ⏰ Таймаут подключения');
            req.destroy();
            resolve(false);
        });
    });
}

async function checkFirebaseSite() {
    return new Promise((resolve) => {
        console.log('🔥 Проверяем Firebase сайт...');
        
        const req = https.get(FIREBASE_URL, (res) => {
            console.log(`   Статус: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('   ✅ Firebase сайт работает!');
                resolve(true);
            } else {
                console.log('   ❌ Firebase сайт недоступен');
                resolve(false);
            }
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ Ошибка Firebase: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('   ⏰ Таймаут Firebase');
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    console.log('🚀 Начинаем проверку DNS настроек...\n');
    
    const dnsOk = await checkDNS();
    const cnameOk = await checkCNAME();
    const websiteOk = await checkWebsite();
    const firebaseOk = await checkFirebaseSite();
    
    console.log('\n📊 Результаты проверки:');
    console.log(`   DNS A записи: ${dnsOk ? '✅' : '❌'}`);
    console.log(`   CNAME запись: ${cnameOk ? '✅' : '❌'}`);
    console.log(`   Сайт доступен: ${websiteOk ? '✅' : '❌'}`);
    console.log(`   Firebase сайт: ${firebaseOk ? '✅' : '❌'}`);
    
    if (dnsOk && cnameOk && websiteOk && firebaseOk) {
        console.log('\n🎉 Все проверки пройдены! Домен настроен правильно!');
        console.log(`🌐 Ваш сайт доступен по адресу: https://${DOMAIN}`);
    } else {
        console.log('\n⚠️  Некоторые проверки не пройдены.');
        console.log('📖 Следуйте инструкции в docs/VEDOS_DNS_SETUP.md');
        
        if (!dnsOk) {
            console.log('\n🔧 Для исправления DNS:');
            console.log('1. Войдите в панель Vedos');
            console.log('2. Найдите домен workclick.cz');
            console.log('3. Добавьте A записи: 151.101.1.195, 151.101.65.195');
        }
        
        if (!cnameOk) {
            console.log('\n🔧 Для исправления CNAME:');
            console.log('1. Добавьте CNAME запись: www → workclick-cz.web.app');
        }
        
        if (!websiteOk) {
            console.log('\n⏰ DNS записи еще не распространились');
            console.log('Подождите до 60 минут после настройки DNS');
        }
    }
    
    console.log('\n📖 Подробная инструкция: docs/VEDOS_DNS_SETUP.md');
    console.log('📋 Полный отчет: FINAL_DOMAIN_SETUP_SUCCESS.md');
}

main().catch(console.error); 