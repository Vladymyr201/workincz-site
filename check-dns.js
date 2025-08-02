#!/usr/bin/env node

/**
 * Скрипт для проверки DNS настроек домена workclick.cz
 * Запуск: node check-dns.js
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
        console.log('📡 Проверка A записей...');
        const addresses = await dns.resolve4(DOMAIN);
        console.log(`✅ Найдено ${addresses.length} A записей:`);
        addresses.forEach(ip => console.log(`   - ${ip}`));
        
        const hasCorrectIPs = EXPECTED_IPS.every(ip => addresses.includes(ip));
        if (hasCorrectIPs) {
            console.log('✅ Все правильные IP адреса найдены!');
        } else {
            console.log('❌ Не все правильные IP адреса найдены');
            console.log('Ожидаемые IP:', EXPECTED_IPS.join(', '));
        }
        
        return hasCorrectIPs;
    } catch (error) {
        console.log('❌ Ошибка при проверке DNS:', error.message);
        return false;
    }
}

async function checkCNAME() {
    try {
        console.log('\n🔗 Проверка CNAME записи для www...');
        const cname = await dns.resolveCname(`www.${DOMAIN}`);
        console.log(`✅ CNAME запись: www.${DOMAIN} → ${cname[0]}`);
        
        if (cname[0] === FIREBASE_URL) {
            console.log('✅ CNAME запись настроена правильно!');
            return true;
        } else {
            console.log('❌ CNAME запись настроена неправильно');
            console.log(`Ожидается: ${FIREBASE_URL}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при проверке CNAME:', error.message);
        return false;
    }
}

async function checkWebsite() {
    return new Promise((resolve) => {
        console.log('\n🌐 Проверка доступности сайта...');
        
        const req = https.get(`https://${DOMAIN}`, (res) => {
            console.log(`✅ Сайт доступен: ${res.statusCode} ${res.statusMessage}`);
            console.log(`   Content-Type: ${res.headers['content-type']}`);
            resolve(true);
        });
        
        req.on('error', (error) => {
            console.log('❌ Сайт недоступен:', error.message);
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('❌ Таймаут при проверке сайта');
            req.destroy();
            resolve(false);
        });
    });
}

async function checkFirebaseSite() {
    return new Promise((resolve) => {
        console.log('\n🔥 Проверка Firebase сайта...');
        
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
    }
    
    console.log('\n📖 Подробная инструкция: docs/VEDOS_DNS_SETUP.md');
}

main().catch(console.error); 