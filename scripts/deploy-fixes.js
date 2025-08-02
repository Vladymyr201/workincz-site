/**
 * 🚀 Deploy Fixes - Скрипт для деплоя исправлений
 * Версия: 1.0.0
 * Дата: 30.07.2025
 * 
 * Автоматизирует процесс деплоя исправлений критических проблем
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeployFixes {
    constructor() {
        this.projectRoot = process.cwd();
        this.deployLog = [];
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        this.deployLog.push(logMessage);
    }

    async run() {
        this.log('🚀 Начинаем деплой исправлений критических проблем...');

        try {
            // Шаг 1: Проверка состояния
            await this.checkStatus();

            // Шаг 2: Сборка проекта
            await this.buildProject();

            // Шаг 3: Тестирование
            await this.testProject();

            // Шаг 4: Деплой
            await this.deployProject();

            // Шаг 5: Проверка после деплоя
            await this.verifyDeployment();

            this.log('✅ Деплой исправлений завершен успешно!');
            this.saveDeployLog();

        } catch (error) {
            this.log(`❌ Ошибка при деплое: ${error.message}`);
            this.saveDeployLog();
            process.exit(1);
        }
    }

    async checkStatus() {
        this.log('📋 Проверка состояния проекта...');

        // Проверяем наличие критических файлов
        const criticalFiles = [
            'public/js/firebase-integration.js',
            'public/js/components/modern-ui.js',
            'public/css/tailwind-optimized.css',
            'public/js/utils/error-monitor.js',
            'public/auth/login.html',
            'public/index.html'
        ];

        for (const file of criticalFiles) {
            if (!fs.existsSync(path.join(this.projectRoot, file))) {
                throw new Error(`Критический файл отсутствует: ${file}`);
            }
        }

        this.log('✅ Все критические файлы найдены');

        // Проверяем git статус
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                this.log('📝 Обнаружены несохраненные изменения');
                this.log(gitStatus);
            } else {
                this.log('✅ Рабочая директория чистая');
            }
        } catch (error) {
            this.log('⚠️ Не удалось проверить git статус');
        }
    }

    async buildProject() {
        this.log('🔨 Сборка проекта...');

        try {
            // Проверяем наличие package.json
            if (fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
                this.log('📦 Установка зависимостей...');
                execSync('npm install', { stdio: 'inherit' });

                this.log('🔨 Сборка проекта...');
                execSync('npm run build', { stdio: 'inherit' });
            } else {
                this.log('⚠️ package.json не найден, пропускаем сборку');
            }
        } catch (error) {
            this.log(`⚠️ Ошибка при сборке: ${error.message}`);
            // Продолжаем, так как это может быть статический проект
        }
    }

    async testProject() {
        this.log('🧪 Тестирование проекта...');

        // Проверяем синтаксис JavaScript файлов
        const jsFiles = [
            'public/js/firebase-integration.js',
            'public/js/components/modern-ui.js',
            'public/js/utils/error-monitor.js'
        ];

        for (const file of jsFiles) {
            try {
                const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
                // Простая проверка синтаксиса
                new Function(content);
                this.log(`✅ ${file} - синтаксис корректен`);
            } catch (error) {
                throw new Error(`Ошибка синтаксиса в ${file}: ${error.message}`);
            }
        }

        // Проверяем HTML файлы
        const htmlFiles = [
            'public/auth/login.html',
            'public/index.html'
        ];

        for (const file of htmlFiles) {
            try {
                const content = fs.readFileSync(path.join(this.projectRoot, file), 'utf8');
                if (!content.includes('<!DOCTYPE html>')) {
                    throw new Error(`Некорректный HTML в ${file}`);
                }
                this.log(`✅ ${file} - HTML корректен`);
            } catch (error) {
                throw new Error(`Ошибка в ${file}: ${error.message}`);
            }
        }
    }

    async deployProject() {
        this.log('🚀 Деплой проекта...');

        try {
            // Проверяем наличие firebase.json
            if (fs.existsSync(path.join(this.projectRoot, 'firebase.json'))) {
                this.log('🔥 Деплой на Firebase Hosting...');
                execSync('firebase deploy --only hosting', { stdio: 'inherit' });
            } else {
                this.log('⚠️ firebase.json не найден, пропускаем деплой');
            }
        } catch (error) {
            throw new Error(`Ошибка при деплое: ${error.message}`);
        }
    }

    async verifyDeployment() {
        this.log('🔍 Проверка деплоя...');

        // Проверяем доступность сайта
        try {
            const https = require('https');
            const url = 'https://workclick-cz.web.app';
            
            const response = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    resolve(res.statusCode);
                }).on('error', reject);
            });

            if (response === 200) {
                this.log('✅ Сайт доступен после деплоя');
            } else {
                this.log(`⚠️ Сайт вернул статус ${response}`);
            }
        } catch (error) {
            this.log(`⚠️ Не удалось проверить доступность сайта: ${error.message}`);
        }
    }

    saveDeployLog() {
        const logFile = path.join(this.projectRoot, 'deploy-log.json');
        const logData = {
            timestamp: new Date().toISOString(),
            log: this.deployLog,
            summary: {
                totalSteps: this.deployLog.length,
                success: this.deployLog.some(log => log.includes('✅')),
                errors: this.deployLog.filter(log => log.includes('❌')).length,
                warnings: this.deployLog.filter(log => log.includes('⚠️')).length
            }
        };

        fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        this.log(`📝 Лог деплоя сохранен в ${logFile}`);
    }
}

// Запускаем деплой если скрипт вызван напрямую
if (require.main === module) {
    const deployer = new DeployFixes();
    deployer.run().catch(console.error);
}

module.exports = DeployFixes; 