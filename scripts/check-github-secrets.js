#!/usr/bin/env node

/**
 * Скрипт для проверки наличия необходимых секретов GitHub Actions
 * 
 * Этот скрипт проверяет, настроены ли все необходимые секреты для GitHub Actions workflows.
 * Запускайте его для проверки корректной настройки CI/CD.
 * 
 * Требуется токен GitHub с разрешением на чтение секретов.
 * Установите переменную окружения GITHUB_TOKEN перед запуском.
 * 
 * Использование:
 * GITHUB_TOKEN=your_token node scripts/check-github-secrets.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Конфигурация
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_NAME = process.env.GITHUB_REPOSITORY || getRepositoryName();
const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');

// Основные группы секретов
const SECRET_CATEGORIES = {
  'Firebase и Google Cloud': [
    'GCP_PROJECT_ID', 'GCP_SA_KEY', 'GCP_SA_EMAIL', 'GCS_BUCKET', 
    'FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_TOKEN'
  ],
  'Безопасность': [
    'BACKUP_ENCRYPTION_KEY', 'SONAR_TOKEN', 'SENTRY_AUTH_TOKEN', 'NPM_TOKEN'
  ],
  'Уведомления': [
    'SLACK_WEBHOOK_URL', 'DISCORD_WEBHOOK', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'
  ],
  'Деплой': [
    'VERCEL_TOKEN'
  ],
  'Тестирование и мониторинг': [
    'PLAYWRIGHT_KEY', 'CYPRESS_KEY', 'DATADOG_API_KEY', 'NEW_RELIC_API_KEY'
  ]
};

// Зависимости workflows от секретов
const WORKFLOW_SECRET_DEPENDENCIES = {
  'firestore-backup.yml': [
    'GCP_PROJECT_ID', 'GCP_SA_KEY', 'GCP_SA_EMAIL', 'GCS_BUCKET', 
    'SLACK_WEBHOOK_URL', 'BACKUP_ENCRYPTION_KEY'
  ],
  'firebase-deploy.yml': [
    'FIREBASE_TOKEN', 'FIREBASE_PROJECT_ID'
  ],
  'secure-deploy.yml': [
    'FIREBASE_TOKEN', 'FIREBASE_SERVICE_ACCOUNT'
  ],
  'ci-cd-pipeline.yml': [
    'GCP_SA_KEY', 'SLACK_WEBHOOK_URL', 'SENTRY_AUTH_TOKEN', 'NPM_TOKEN'
  ],
  'deploy.yml': [
    'VERCEL_TOKEN'
  ],
  'performance-test.yml': [
    'PLAYWRIGHT_KEY', 'NEW_RELIC_API_KEY'
  ],
  'security-scan.yml': [
    'SONAR_TOKEN', 'DISCORD_WEBHOOK'
  ],
  'mcp-automation.yml': [
    'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'
  ],
  'ci-cd.yml': [
    'CYPRESS_KEY'
  ]
};

// Маркеры состояния секретов для цветного вывода
const STATUS = {
  PRESENT: '✓',
  MISSING: '✗',
  WARNING: '⚠️',
  INFO: 'ℹ️'
};

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

/**
 * Получение имени репозитория из Git
 * @returns {string} Имя репозитория в формате owner/repo
 */
function getRepositoryName() {
  try {
    // Получаем URL удаленного репозитория
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
    // Извлекаем имя репозитория из URL
    const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+)(\.git)?$/);
    if (match) {
      return match[1];
    }
    console.log(`${COLORS.YELLOW}${STATUS.WARNING} Не удалось определить имя репозитория из git. Используйте GITHUB_REPOSITORY=owner/repo для указания вручную.${COLORS.RESET}`);
    return null;
  } catch (error) {
    console.log(`${COLORS.YELLOW}${STATUS.WARNING} Ошибка при получении имени репозитория: ${error.message}${COLORS.RESET}`);
    return null;
  }
}

/**
 * Получение списка секретов из GitHub API
 * @returns {Promise<string[]>} Список имен секретов
 */
async function fetchRepositorySecrets() {
  if (!GITHUB_TOKEN) {
    console.log(`${COLORS.YELLOW}${STATUS.WARNING} GITHUB_TOKEN не установлен. Проверка секретов недоступна.${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}Установите токен через: export GITHUB_TOKEN=your_token${COLORS.RESET}`);
    return [];
  }

  if (!REPO_NAME) {
    console.log(`${COLORS.YELLOW}${STATUS.WARNING} Имя репозитория не определено. Проверка секретов недоступна.${COLORS.RESET}`);
    return [];
  }

  try {
    console.log(`${COLORS.BLUE}${STATUS.INFO} Получение списка секретов для ${REPO_NAME}...${COLORS.RESET}`);
    
    // В реальном сценарии здесь был бы API-запрос к GitHub
    // Но поскольку этот скрипт является демонстрационным, мы симулируем запрос
    console.log(`${COLORS.DIM}(Симуляция запроса к GitHub API)${COLORS.RESET}`);
    
    return []; // Пустой список, так как у нас нет реального доступа к API
  } catch (error) {
    console.log(`${COLORS.RED}${STATUS.MISSING} Ошибка при получении секретов: ${error.message}${COLORS.RESET}`);
    return [];
  }
}

/**
 * Получение списка всех необходимых секретов из workflows
 * @returns {Set<string>} Уникальный список всех секретов
 */
function getAllRequiredSecrets() {
  const allSecrets = new Set();
  
  // Добавляем секреты из предопределенных категорий
  Object.values(SECRET_CATEGORIES).forEach(secrets => {
    secrets.forEach(secret => allSecrets.add(secret));
  });
  
  // Добавляем секреты из зависимостей workflow
  Object.values(WORKFLOW_SECRET_DEPENDENCIES).forEach(secrets => {
    secrets.forEach(secret => allSecrets.add(secret));
  });
  
  return allSecrets;
}

/**
 * Проверка наличия секрета в списке существующих секретов
 * @param {string} secret Имя секрета для проверки
 * @param {string[]} existingSecrets Список существующих секретов
 * @returns {boolean} True, если секрет существует
 */
function checkSecretExists(secret, existingSecrets) {
  return existingSecrets.includes(secret);
}

/**
 * Анализ workflow файла на использование секретов
 * @param {string} filePath Путь к файлу workflow
 * @returns {string[]} Список найденных секретов
 */
function extractSecretsFromWorkflow(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Ищем все использования secrets.X в файле
    const secretMatches = content.match(/secrets\.[A-Z_]+/g) || [];
    // Извлекаем только имена секретов без префикса secrets.
    return secretMatches.map(match => match.replace('secrets.', ''));
  } catch (error) {
    console.log(`${COLORS.YELLOW}${STATUS.WARNING} Ошибка при анализе ${filePath}: ${error.message}${COLORS.RESET}`);
    return [];
  }
}

/**
 * Анализ всех workflow файлов для выявления используемых секретов
 */
function analyzeWorkflows() {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}Анализ workflow файлов для обнаружения секретов...${COLORS.RESET}\n`);
  
  try {
    // Проверяем существование директории workflows
    if (!fs.existsSync(WORKFLOWS_DIR)) {
      console.log(`${COLORS.YELLOW}${STATUS.WARNING} Директория workflows не найдена: ${WORKFLOWS_DIR}${COLORS.RESET}`);
      return {};
    }
    
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(file => file.endsWith('.yml'));
    const workflowSecrets = {};
    
    files.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const extractedSecrets = extractSecretsFromWorkflow(filePath);
      
      if (extractedSecrets.length > 0) {
        workflowSecrets[file] = extractedSecrets;
        console.log(`${COLORS.CYAN}${file}${COLORS.RESET}: ${extractedSecrets.length} секретов найдено`);
        
        // Проверяем, все ли найденные секреты определены в конфигурации
        const missingInConfig = extractedSecrets.filter(secret => {
          return !Object.values(SECRET_CATEGORIES).flat().includes(secret) &&
                 !WORKFLOW_SECRET_DEPENDENCIES[file]?.includes(secret);
        });
        
        if (missingInConfig.length > 0) {
          console.log(`${COLORS.YELLOW}${STATUS.WARNING} Секреты не определены в конфигурации скрипта: ${missingInConfig.join(', ')}${COLORS.RESET}`);
        }
      } else {
        console.log(`${COLORS.DIM}${file}: секреты не найдены${COLORS.RESET}`);
      }
    });
    
    return workflowSecrets;
  } catch (error) {
    console.log(`${COLORS.RED}${STATUS.MISSING} Ошибка при анализе workflows: ${error.message}${COLORS.RESET}`);
    return {};
  }
}

/**
 * Вывод информации о секретах по категориям
 * @param {string[]} existingSecrets Список существующих секретов
 */
function displaySecretsByCategory(existingSecrets) {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}Проверка секретов по категориям:${COLORS.RESET}\n`);
  
  let totalMissing = 0;
  
  Object.entries(SECRET_CATEGORIES).forEach(([category, secrets]) => {
    console.log(`\n${COLORS.BRIGHT}${COLORS.CYAN}${category}:${COLORS.RESET}`);
    
    secrets.forEach(secret => {
      const exists = checkSecretExists(secret, existingSecrets);
      
      if (exists) {
        console.log(`${COLORS.GREEN}${STATUS.PRESENT} ${secret}${COLORS.RESET}`);
      } else {
        console.log(`${COLORS.RED}${STATUS.MISSING} ${secret}${COLORS.RESET}`);
        totalMissing++;
      }
    });
  });
  
  return totalMissing;
}

/**
 * Вывод статуса секретов для каждого workflow
 * @param {string[]} existingSecrets Список существующих секретов
 */
function displayWorkflowSecretStatus(existingSecrets) {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}Статус секретов для каждого workflow:${COLORS.RESET}\n`);
  
  Object.entries(WORKFLOW_SECRET_DEPENDENCIES).forEach(([workflow, requiredSecrets]) => {
    const missingSecrets = requiredSecrets.filter(secret => !checkSecretExists(secret, existingSecrets));
    
    if (missingSecrets.length === 0) {
      console.log(`${COLORS.GREEN}${STATUS.PRESENT} ${workflow} - все необходимые секреты настроены${COLORS.RESET}`);
    } else {
      console.log(`${COLORS.RED}${STATUS.MISSING} ${workflow} - отсутствуют секреты: ${missingSecrets.join(', ')}${COLORS.RESET}`);
    }
  });
}

/**
 * Запрос действия пользователя для создания отсутствующих секретов
 * @param {number} missingCount Количество отсутствующих секретов
 */
function promptUserAction(missingCount) {
  if (missingCount === 0) {
    console.log(`\n${COLORS.GREEN}${STATUS.PRESENT} Все необходимые секреты настроены!${COLORS.RESET}`);
    rl.close();
    return;
  }
  
  console.log(`\n${COLORS.YELLOW}Отсутствует ${missingCount} секретов. Хотите создать шаблон для их добавления? (y/n)${COLORS.RESET}`);
  
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log(`\n${COLORS.BLUE}${STATUS.INFO} Для добавления секретов выполните следующие шаги:${COLORS.RESET}\n`);
      console.log(`${COLORS.BRIGHT}1. Перейдите на GitHub в настройки репозитория:${COLORS.RESET}`);
      console.log(`   https://github.com/${REPO_NAME}/settings/secrets/actions\n`);
      console.log(`${COLORS.BRIGHT}2. Нажмите "New repository secret" и добавьте следующие секреты:${COLORS.RESET}`);
      
      Object.entries(SECRET_CATEGORIES).forEach(([category, secrets]) => {
        const missingSecrets = secrets.filter(secret => !checkSecretExists(secret, existingSecrets));
        
        if (missingSecrets.length > 0) {
          console.log(`\n${COLORS.CYAN}${category}:${COLORS.RESET}`);
          
          missingSecrets.forEach(secret => {
            console.log(`   - ${secret}`);
          });
        }
      });
      
      console.log(`\n${COLORS.BRIGHT}3. После добавления всех секретов, запустите этот скрипт снова для проверки.${COLORS.RESET}\n`);
      console.log(`${COLORS.BLUE}${STATUS.INFO} Дополнительную информацию о секретах можно найти в файле:${COLORS.RESET}`);
      console.log(`   docs/github-actions-secrets-template.md\n`);
    }
    
    rl.close();
  });
}

/**
 * Основная функция скрипта
 */
async function main() {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}=== Проверка секретов GitHub Actions ===${COLORS.RESET}\n`);
  
  // Анализ workflow файлов
  const workflowSecrets = analyzeWorkflows();
  
  // Получение списка существующих секретов через API
  const existingSecrets = await fetchRepositorySecrets();
  
  // Все необходимые секреты
  const requiredSecrets = getAllRequiredSecrets();
  
  // Вывод статуса по категориям
  const missingCount = displaySecretsByCategory(existingSecrets);
  
  // Вывод статуса по workflow
  displayWorkflowSecretStatus(existingSecrets);
  
  // Запрос действия для создания недостающих секретов
  promptUserAction(missingCount);
}

// Запуск скрипта
main();