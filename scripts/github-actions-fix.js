#!/usr/bin/env node

/**
 * Скрипт для исправления и диагностики проблем с GitHub Actions
 * 
 * Этот скрипт проверяет конфигурацию GitHub Actions, 
 * устанавливает необходимые переменные окружения и
 * помогает настроить секреты GitHub.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');
const OUTPUT_FILE = path.join(__dirname, '..', 'github-actions-diagnostics.log');

// ANSI цветовые коды
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
};

// Необходимые секреты для различных workflow
const REQUIRED_SECRETS = {
  'firestore-backup.yml': [
    'GCP_PROJECT_ID',
    'GCP_SA_KEY',
    'GCP_SA_EMAIL',
    'GCS_BUCKET',
    'SLACK_WEBHOOK_URL',
    'BACKUP_ENCRYPTION_KEY'
  ],
  'firebase-deploy.yml': [
    'FIREBASE_TOKEN',
    'FIREBASE_PROJECT_ID'
  ],
  'ci-cd-pipeline.yml': [
    'FIREBASE_TOKEN',
    'GCP_SA_KEY'
  ]
};

// Функция для записи в лог-файл
function writeToLog(message) {
  fs.appendFileSync(OUTPUT_FILE, `${message}\n`);
}

// Начало лога
writeToLog(`GitHub Actions диагностика - ${new Date().toISOString()}`);
writeToLog('=============================================\n');

/**
 * Проверка workflow файлов на типичные проблемы
 */
function checkWorkflowFiles() {
  console.log(`${COLORS.BLUE}${COLORS.BRIGHT}Проверка workflow файлов...${COLORS.RESET}\n`);
  writeToLog('Проверка workflow файлов:');
  
  try {
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(file => file.endsWith('.yml'));
    
    if (files.length === 0) {
      console.log(`${COLORS.RED}Не найдены .yml файлы в директории ${WORKFLOWS_DIR}${COLORS.RESET}`);
      writeToLog(`ОШИБКА: Не найдены .yml файлы в директории ${WORKFLOWS_DIR}`);
      return;
    }
    
    console.log(`${COLORS.GREEN}Найдено ${files.length} workflow файлов${COLORS.RESET}`);
    writeToLog(`Найдено ${files.length} workflow файлов`);
    
    files.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      console.log(`\n${COLORS.CYAN}Анализ ${file}:${COLORS.RESET}`);
      writeToLog(`\nАнализ ${file}:`);
      
      // Проверка на использование секретов
      const secretMatches = content.match(/secrets\.[A-Z_]+/g) || [];
      const usedSecrets = secretMatches.map(match => match.replace('secrets.', ''));
      const uniqueSecrets = [...new Set(usedSecrets)];
      
      console.log(`${COLORS.YELLOW}- Используемые секреты: ${uniqueSecrets.join(', ')}${COLORS.RESET}`);
      writeToLog(`- Используемые секреты: ${uniqueSecrets.join(', ')}`);
      
      // Проверка на типичные проблемы
      checkForCommonIssues(file, content, uniqueSecrets);
    });
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при проверке workflow файлов: ${error.message}${COLORS.RESET}`);
    writeToLog(`ОШИБКА: При проверке workflow файлов: ${error.message}`);
  }
}

/**
 * Проверка файла на типичные проблемы
 */
function checkForCommonIssues(fileName, content, usedSecrets) {
  const issues = [];
  
  // Проверка на использование устаревших версий actions
  if (content.includes('actions/checkout@v1') || content.includes('actions/checkout@v2')) {
    issues.push('Используется устаревшая версия actions/checkout (рекомендуется v3)');
  }
  
  if (content.includes('actions/setup-node@v1') || content.includes('actions/setup-node@v2')) {
    issues.push('Используется устаревшая версия actions/setup-node (рекомендуется v3)');
  }
  
  // Проверка на отсутствие кэширования
  if (content.includes('actions/setup-node@v3') && !content.includes('cache:')) {
    issues.push('Не используется кэширование для Node.js зависимостей');
  }
  
  // Проверка на необходимые секреты
  if (REQUIRED_SECRETS[fileName]) {
    const missingSecrets = REQUIRED_SECRETS[fileName].filter(
      secret => !usedSecrets.includes(secret)
    );
    
    if (missingSecrets.length > 0) {
      issues.push(`Отсутствуют рекомендуемые секреты: ${missingSecrets.join(', ')}`);
    }
  }
  
  // Проверка на неправильный синтаксис env
  if (content.includes('${{ env.') && !content.match(/echo "[^"]+"\s*>>\s*\$GITHUB_ENV/)) {
    issues.push('Используется env переменные, но не найдено установки через GITHUB_ENV');
  }
  
  // Вывод результатов проверки
  if (issues.length > 0) {
    console.log(`${COLORS.YELLOW}Обнаружены потенциальные проблемы:${COLORS.RESET}`);
    writeToLog('Обнаружены потенциальные проблемы:');
    
    issues.forEach((issue, index) => {
      console.log(`${COLORS.YELLOW}  ${index + 1}. ${issue}${COLORS.RESET}`);
      writeToLog(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log(`${COLORS.GREEN}Потенциальных проблем не обнаружено${COLORS.RESET}`);
    writeToLog('Потенциальных проблем не обнаружено');
  }
}

/**
 * Создание локального файла .env.github с необходимыми секретами
 */
function createEnvFile() {
  console.log(`\n${COLORS.BLUE}${COLORS.BRIGHT}Создание файла .env.github с шаблонами секретов...${COLORS.RESET}\n`);
  writeToLog('\nСоздание файла .env.github:');
  
  const envFile = path.join(__dirname, '..', '.env.github');
  let envContent = '# GitHub Secrets для локальной разработки и тестирования\n';
  envContent += '# Заполните эти значения и используйте их для настройки секретов в GitHub\n\n';
  
  // Собираем все уникальные секреты из всех workflow
  const allSecrets = new Set();
  
  Object.values(REQUIRED_SECRETS).forEach(secrets => {
    secrets.forEach(secret => allSecrets.add(secret));
  });
  
  // Генерируем содержимое файла
  allSecrets.forEach(secret => {
    envContent += `${secret}=YOUR_${secret}_VALUE\n`;
  });
  
  // Добавляем информацию, как получить некоторые секреты
  envContent += '\n# Как получить значения для секретов:\n';
  envContent += '# FIREBASE_TOKEN - выполните команду: firebase login:ci\n';
  envContent += '# GCP_SA_KEY - закодируйте JSON-ключ сервисного аккаунта в base64\n';
  envContent += '# GCS_BUCKET - имя вашего бакета Google Cloud Storage\n';
  envContent += '# BACKUP_ENCRYPTION_KEY - сгенерируйте командой: openssl rand -base64 32\n';
  
  try {
    fs.writeFileSync(envFile, envContent);
    console.log(`${COLORS.GREEN}Создан файл .env.github с шаблонами секретов${COLORS.RESET}`);
    writeToLog('Создан файл .env.github с шаблонами секретов');
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при создании файла .env.github: ${error.message}${COLORS.RESET}`);
    writeToLog(`ОШИБКА: При создании файла .env.github: ${error.message}`);
  }
}

/**
 * Проверка наличия секретов в локальном окружении для тестирования
 */
function checkLocalSecrets() {
  console.log(`\n${COLORS.BLUE}${COLORS.BRIGHT}Проверка секретов в локальном окружении...${COLORS.RESET}\n`);
  writeToLog('\nПроверка секретов в локальном окружении:');
  
  const allSecrets = new Set();
  
  Object.values(REQUIRED_SECRETS).forEach(secrets => {
    secrets.forEach(secret => allSecrets.add(secret));
  });
  
  const availableSecrets = [...allSecrets].filter(secret => process.env[secret]);
  const missingSecrets = [...allSecrets].filter(secret => !process.env[secret]);
  
  if (availableSecrets.length > 0) {
    console.log(`${COLORS.GREEN}Доступные секреты: ${availableSecrets.join(', ')}${COLORS.RESET}`);
    writeToLog(`Доступные секреты: ${availableSecrets.join(', ')}`);
  }
  
  if (missingSecrets.length > 0) {
    console.log(`${COLORS.YELLOW}Отсутствующие секреты: ${missingSecrets.join(', ')}${COLORS.RESET}`);
    writeToLog(`Отсутствующие секреты: ${missingSecrets.join(', ')}`);
  }
}

/**
 * Генерация инструкций для настройки GitHub Actions
 */
function generateInstructions() {
  console.log(`\n${COLORS.BLUE}${COLORS.BRIGHT}Генерация инструкций для настройки GitHub Actions...${COLORS.RESET}\n`);
  writeToLog('\nИнструкции для настройки GitHub Actions:');
  
  const instructions = [
    'Для настройки GitHub Actions выполните следующие шаги:',
    '',
    '1. Перейдите в настройки репозитория на GitHub',
    '   Settings → Secrets and variables → Actions',
    '',
    '2. Добавьте следующие секреты:'
  ];
  
  // Добавляем все секреты с инструкциями
  Object.entries(REQUIRED_SECRETS).forEach(([workflow, secrets]) => {
    instructions.push(`   Для workflow ${workflow}:`);
    
    secrets.forEach(secret => {
      instructions.push(`   - ${secret}`);
    });
    
    instructions.push('');
  });
  
  instructions.push('3. Проверьте права доступа сервисного аккаунта Google Cloud:');
  instructions.push('   - Для Firestore Backup: roles/datastore.importExportAdmin и roles/storage.objectAdmin');
  instructions.push('   - Для Firebase Deploy: roles/firebasehosting.admin');
  instructions.push('');
  instructions.push('4. Настройте Firebase CLI токен:');
  instructions.push('   firebase login:ci');
  instructions.push('');
  instructions.push('5. Проверьте GitHub Actions workflows вручную через вкладку Actions');
  
  const instructionsFile = path.join(__dirname, '..', 'github-actions-setup-instructions.md');
  
  try {
    fs.writeFileSync(instructionsFile, instructions.join('\n'));
    console.log(`${COLORS.GREEN}Созданы инструкции по настройке в файле ${instructionsFile}${COLORS.RESET}`);
    writeToLog(`Созданы инструкции по настройке в файле ${instructionsFile}`);
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при создании инструкций: ${error.message}${COLORS.RESET}`);
    writeToLog(`ОШИБКА: При создании инструкций: ${error.message}`);
  }
}

/**
 * Исправление типичных проблем в workflow файлах
 */
function fixCommonIssues() {
  console.log(`\n${COLORS.BLUE}${COLORS.BRIGHT}Исправление типичных проблем в workflow файлах...${COLORS.RESET}\n`);
  writeToLog('\nИсправление типичных проблем в workflow файлах:');
  
  try {
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(file => file.endsWith('.yml'));
    
    files.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Исправление устаревших версий actions
      if (content.includes('actions/checkout@v1') || content.includes('actions/checkout@v2')) {
        content = content.replace(/actions\/checkout@v[12]/g, 'actions/checkout@v3');
        updated = true;
        console.log(`${COLORS.GREEN}Обновлена версия actions/checkout в ${file}${COLORS.RESET}`);
        writeToLog(`Обновлена версия actions/checkout в ${file}`);
      }
      
      if (content.includes('actions/setup-node@v1') || content.includes('actions/setup-node@v2')) {
        content = content.replace(/actions\/setup-node@v[12]/g, 'actions/setup-node@v3');
        updated = true;
        console.log(`${COLORS.GREEN}Обновлена версия actions/setup-node в ${file}${COLORS.RESET}`);
        writeToLog(`Обновлена версия actions/setup-node в ${file}`);
      }
      
      // Добавление кэширования для Node.js
      if (content.includes('actions/setup-node@v3') && 
          !content.includes('cache:') && 
          (content.includes('npm ci') || content.includes('npm install'))) {
        
        content = content.replace(
          /uses: actions\/setup-node@v3\s+with:\s+node-version:/g,
          'uses: actions/setup-node@v3\n        with:\n          node-version:'
        );
        
        content = content.replace(
          /node-version: ['"]\d+['"](\s+)/,
          'node-version: \'18\'\n          cache: \'npm\'$1'
        );
        
        updated = true;
        console.log(`${COLORS.GREEN}Добавлено кэширование npm в ${file}${COLORS.RESET}`);
        writeToLog(`Добавлено кэширование npm в ${file}`);
      }
      
      // Обновление файла, если были внесены изменения
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`${COLORS.GREEN}Файл ${file} обновлен${COLORS.RESET}`);
        writeToLog(`Файл ${file} обновлен`);
      } else {
        console.log(`${COLORS.YELLOW}В файле ${file} не требуются исправления${COLORS.RESET}`);
        writeToLog(`В файле ${file} не требуются исправления`);
      }
    });
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при исправлении проблем: ${error.message}${COLORS.RESET}`);
    writeToLog(`ОШИБКА: При исправлении проблем: ${error.message}`);
  }
}

/**
 * Запуск диагностики и исправления
 */
function run() {
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}===== GitHub Actions Диагностика и Исправление =====${COLORS.RESET}\n`);
  
  // Очистка лог-файла
  fs.writeFileSync(OUTPUT_FILE, '');
  
  // Запуск всех проверок и исправлений
  checkWorkflowFiles();
  createEnvFile();
  checkLocalSecrets();
  
  rl.question(`\n${COLORS.YELLOW}Хотите исправить типичные проблемы в workflow файлах? (y/n) ${COLORS.RESET}`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      fixCommonIssues();
    }
    
    generateInstructions();
    
    console.log(`\n${COLORS.BRIGHT}${COLORS.GREEN}Диагностика завершена!${COLORS.RESET}`);
    console.log(`${COLORS.BLUE}Подробный отчет сохранен в: ${OUTPUT_FILE}${COLORS.RESET}`);
    console.log(`${COLORS.BLUE}Инструкции по настройке сохранены в: github-actions-setup-instructions.md${COLORS.RESET}`);
    console.log(`${COLORS.BLUE}Шаблон секретов сохранен в: .env.github${COLORS.RESET}\n`);
    
    rl.close();
  });
}

// Запуск скрипта
run();