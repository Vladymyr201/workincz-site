#!/usr/bin/env node

/**
 * Скрипт для подготовки ключа сервисного аккаунта Google Cloud для GitHub Actions
 * 
 * Запуск: node scripts/setup-gcp-service-account.js <путь_к_ключу.json>
 */

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
 * Кодирует файл ключа в base64
 */
function encodeBase64(filePath) {
  try {
    console.log(`${COLORS.BLUE}Чтение файла ключа: ${filePath}${COLORS.RESET}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Парсим JSON для проверки
    const keyData = JSON.parse(fileContent);
    
    // Проверяем, что это файл ключа сервисного аккаунта
    if (!keyData.type || keyData.type !== 'service_account') {
      throw new Error('Файл не является ключом сервисного аккаунта Google Cloud');
    }
    
    // Получаем email сервисного аккаунта
    const serviceAccountEmail = keyData.client_email;
    const projectId = keyData.project_id;
    
    // Кодируем в base64
    const base64Content = Buffer.from(fileContent).toString('base64');
    
    console.log(`${COLORS.GREEN}Файл успешно закодирован в base64.${COLORS.RESET}`);
    
    return {
      base64Key: base64Content,
      email: serviceAccountEmail,
      projectId: projectId
    };
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при чтении/кодировании файла: ${error.message}${COLORS.RESET}`);
    return null;
  }
}

/**
 * Обновляет файл шаблонов секретов
 */
function updateSecretsTemplate(base64Key, email, projectId) {
  const secretsFile = path.join(__dirname, '..', 'github-secrets-template.env');
  
  try {
    console.log(`${COLORS.BLUE}Обновление файла шаблонов секретов...${COLORS.RESET}`);
    
    // Читаем текущее содержимое файла
    let content = fs.readFileSync(secretsFile, 'utf8');
    
    // Обновляем нужные переменные
    content = content
      .replace(/GCP_PROJECT_ID=.+/, `GCP_PROJECT_ID=${projectId}`)
      .replace(/GCP_SA_EMAIL=.+/, `GCP_SA_EMAIL=${email}`)
      .replace(/GCP_SA_KEY=.+/, `GCP_SA_KEY=${base64Key}`);
    
    // Также обновляем FIREBASE_PROJECT_ID, если он совпадает с GCP_PROJECT_ID
    content = content.replace(/FIREBASE_PROJECT_ID=.+/, `FIREBASE_PROJECT_ID=${projectId}`);
    
    // Записываем обновленный файл
    fs.writeFileSync(secretsFile, content);
    
    console.log(`${COLORS.GREEN}Файл шаблонов секретов успешно обновлен.${COLORS.RESET}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}Ошибка при обновлении файла шаблонов: ${error.message}${COLORS.RESET}`);
    return false;
  }
}

/**
 * Показывает инструкции для добавления секретов в GitHub
 */
function showInstructions(email, projectId) {
  console.log(`\n${COLORS.BRIGHT}${COLORS.BLUE}=== Инструкции для добавления секретов в GitHub ===\n${COLORS.RESET}`);
  
  console.log(`${COLORS.CYAN}1. Перейдите в настройки репозитория на GitHub:${COLORS.RESET}`);
  console.log(`   Settings → Secrets and variables → Actions → New repository secret\n`);
  
  console.log(`${COLORS.CYAN}2. Добавьте следующие секреты:${COLORS.RESET}`);
  console.log(`   a) GCP_PROJECT_ID: ${projectId}`);
  console.log(`   b) GCP_SA_EMAIL: ${email}`);
  console.log(`   c) GCP_SA_KEY: <Закодированный ключ из файла github-secrets-template.env>\n`);
  
  console.log(`${COLORS.CYAN}3. Убедитесь, что у сервисного аккаунта есть необходимые роли:${COLORS.RESET}`);
  console.log(`   - roles/datastore.importExportAdmin (для Firestore бэкапов)`);
  console.log(`   - roles/storage.objectAdmin (для доступа к бакету GCS)\n`);
  
  console.log(`${COLORS.CYAN}4. Создайте бакет Google Cloud Storage:${COLORS.RESET}`);
  console.log(`   a) Перейдите в Google Cloud Console → Storage → Buckets → Create`);
  console.log(`   b) Укажите имя бакета (например, "${projectId}-backups")`);
  console.log(`   c) Добавьте имя бакета как секрет GCS_BUCKET в GitHub\n`);
}

/**
 * Главная функция
 */
async function main() {
  console.log(`${COLORS.BRIGHT}${COLORS.BLUE}===== Настройка сервисного аккаунта GCP для GitHub Actions =====${COLORS.RESET}\n`);
  
  let keyFilePath;
  
  // Проверяем, указан ли путь к файлу как аргумент
  if (process.argv.length > 2) {
    keyFilePath = process.argv[2];
  } else {
    // Запрашиваем путь к файлу ключа
    keyFilePath = await new Promise(resolve => {
      rl.question(`${COLORS.YELLOW}Введите путь к файлу ключа сервисного аккаунта (.json): ${COLORS.RESET}`, answer => {
        resolve(answer.trim());
      });
    });
  }
  
  // Проверяем существование файла
  if (!fs.existsSync(keyFilePath)) {
    console.error(`${COLORS.RED}Файл не найден: ${keyFilePath}${COLORS.RESET}`);
    rl.close();
    return;
  }
  
  // Кодируем файл
  const result = encodeBase64(keyFilePath);
  
  if (result) {
    // Обновляем файл шаблонов
    updateSecretsTemplate(result.base64Key, result.email, result.projectId);
    
    // Показываем инструкции
    showInstructions(result.email, result.projectId);
    
    console.log(`${COLORS.GREEN}${COLORS.BRIGHT}Ключ сервисного аккаунта успешно подготовлен!${COLORS.RESET}`);
    console.log(`${COLORS.GREEN}Проверьте файл github-secrets-template.env для получения всех секретов.${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.RED}Не удалось подготовить ключ сервисного аккаунта.${COLORS.RESET}`);
  }
  
  rl.close();
}

// Запуск скрипта
main().catch(error => {
  console.error(`${COLORS.RED}Ошибка: ${error.message}${COLORS.RESET}`);
  rl.close();
});