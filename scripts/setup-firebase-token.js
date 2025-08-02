#!/usr/bin/env node

/**
 * Скрипт для получения токена Firebase для CI/CD
 * 
 * Запуск: node scripts/setup-firebase-token.js
 * 
 * Этот скрипт поможет вам получить токен Firebase для использования 
 * в GitHub Actions и других CI/CD системах.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI цветовые коды
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BRIGHT: '\x1b[1m',
};

/**
 * Проверяет наличие установленного Firebase CLI
 */
function checkFirebaseCLI() {
  try {
    console.log(`${COLORS.BLUE}Проверка наличия Firebase CLI...${COLORS.RESET}`);
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log(`${COLORS.RED}Firebase CLI не найден.${COLORS.RESET}`);
    return false;
  }
}

/**
 * Устанавливает Firebase CLI, если он не установлен
 */
function installFirebaseCLI() {
  console.log(`${COLORS.YELLOW}Установка Firebase CLI...${COLORS.RESET}`);
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log(`${COLORS.GREEN}Firebase CLI успешно установлен!${COLORS.RESET}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при установке Firebase CLI: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Получает токен Firebase для CI
 */
function getFirebaseToken() {
  console.log(`${COLORS.BLUE}${COLORS.BRIGHT}Получение токена Firebase CI...${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}Сейчас откроется окно браузера для входа в аккаунт Firebase.${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}После успешного входа вы получите токен для использования в CI/CD.${COLORS.RESET}\n`);
  
  try {
    const result = execSync('firebase login:ci', { encoding: 'utf8' });
    const tokenMatch = result.match(/(?:Use this token to login on a CI server:\s+)(.+)/);
    
    if (tokenMatch && tokenMatch[1]) {
      const token = tokenMatch[1].trim();
      return token;
    } else {
      console.error(`${COLORS.RED}Не удалось извлечь токен из вывода команды.${COLORS.RESET}`);
      return null;
    }
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при получении токена: ${error.message}${COLORS.RESET}`);
    return null;
  }
}

/**
 * Сохраняет токен в файл конфигурации
 */
function saveToken(token) {
  const secretsFile = path.join(__dirname, '..', 'github-secrets-template.env');
  
  try {
    let content = fs.readFileSync(secretsFile, 'utf8');
    content = content.replace(/FIREBASE_TOKEN=.+/, `FIREBASE_TOKEN=${token}`);
    
    fs.writeFileSync(secretsFile, content);
    console.log(`${COLORS.GREEN}Токен сохранен в файле github-secrets-template.env${COLORS.RESET}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при сохранении токена: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Выводит инструкции для добавления токена в GitHub Secrets
 */
function showInstructions(token) {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}=== Инструкции для добавления токена в GitHub Secrets ===${COLORS.RESET}\n`);
  console.log(`${COLORS.CYAN}1. Перейдите в настройки вашего репозитория на GitHub:${COLORS.RESET}`);
  console.log(`   Settings → Secrets and variables → Actions → New repository secret\n`);
  console.log(`${COLORS.CYAN}2. Создайте новый секрет:${COLORS.RESET}`);
  console.log(`   Name: FIREBASE_TOKEN`);
  console.log(`   Value: ${token}\n`);
  console.log(`${COLORS.CYAN}3. Нажмите "Add secret" для сохранения${COLORS.RESET}\n`);
  console.log(`${COLORS.YELLOW}Примечание: Храните этот токен в безопасном месте, не публикуйте его!${COLORS.RESET}\n`);
}

/**
 * Получает список проектов Firebase
 */
function listFirebaseProjects() {
  console.log(`${COLORS.BLUE}Получение списка проектов Firebase...${COLORS.RESET}\n`);
  
  try {
    const result = execSync('firebase projects:list', { encoding: 'utf8' });
    console.log(result);
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при получении списка проектов: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Главная функция скрипта
 */
async function main() {
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}===== Настройка Firebase для GitHub Actions =====${COLORS.RESET}\n`);
  
  // Проверяем наличие Firebase CLI
  if (!checkFirebaseCLI()) {
    const shouldInstall = await new Promise(resolve => {
      rl.question(`${COLORS.YELLOW}Firebase CLI не установлен. Установить? (y/n) ${COLORS.RESET}`, answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (shouldInstall) {
      if (!installFirebaseCLI()) {
        console.log(`${COLORS.RED}Не удалось установить Firebase CLI. Пожалуйста, установите вручную:${COLORS.RESET}`);
        console.log('npm install -g firebase-tools');
        rl.close();
        return;
      }
    } else {
      console.log(`${COLORS.RED}Firebase CLI необходим для продолжения.${COLORS.RESET}`);
      rl.close();
      return;
    }
  }
  
  // Получаем токен Firebase CI
  const token = getFirebaseToken();
  
  if (token) {
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}Токен Firebase CI успешно получен!${COLORS.RESET}\n`);
    
    // Сохраняем токен в файл
    saveToken(token);
    
    // Показываем инструкции
    showInstructions(token);
    
    // Получаем список проектов
    const shouldListProjects = await new Promise(resolve => {
      rl.question(`${COLORS.YELLOW}Хотите получить список проектов Firebase? (y/n) ${COLORS.RESET}`, answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
    
    if (shouldListProjects) {
      listFirebaseProjects();
    }
    
    console.log(`\n${COLORS.GREEN}${COLORS.BRIGHT}Настройка Firebase успешно завершена!${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.RED}Не удалось получить токен Firebase CI.${COLORS.RESET}`);
  }
  
  rl.close();
}

// Запуск скрипта
main().catch(error => {
  console.error(`${COLORS.RED}Ошибка: ${error.message}${COLORS.RESET}`);
  rl.close();
});