/**
 * Скрипт для проверки безопасности проекта, в частности поиска API-ключей Firebase
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execSync } = require('child_process');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// API-ключи для проверки - старые и текущие
const API_KEYS = [
  {
    value: "AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0",
    isCurrent: true,
    description: "Текущий рабочий ключ Firebase"
  },
  {
    value: "AIzaSyAo343vPwqrjwzjhd-d-qEKh7HqAAMsIiM",
    isCurrent: false,
    description: "Устаревший ключ Firebase"
  }
];

// Регулярное выражение для поиска API-ключей Firebase
const FIREBASE_API_KEY_REGEX = /(?:firebaseConfig|apiKey|API_KEY).*['"]([A-Za-z0-9_-]{39})['"]|['"]([A-Za-z0-9_-]{39})['"].*(?:firebaseConfig|apiKey|API_KEY)/g;

// Директории для поиска и исключения
const SEARCH_DIRS = ['public', 'src', 'public-backup-20250730-175739', 'public-backup-cleanup-20250730-181921', 'backup-20250730-1750', 'backup-refactoring-20250730-2000'];
const EXCLUDE_DIRS = ['node_modules', '.git', '.github/workflows', 'dist', 'build'];

// Файлы для исключения из проверки (может включать скрипты проверки безопасности)
const EXCLUDE_FILES = ['security-check.js', 'fix-firebase-api-keys.js'];

// Результаты проверки
const results = {
  files: {},
  summary: {
    totalFiles: 0,
    filesWithApiKeys: 0,
    totalApiKeysFound: 0,
    oldApiKeysFound: 0
  }
};

/**
 * Проверяет, нужно ли исключить путь из проверки
 */
function shouldExclude(filePath) {
  const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');
  
  // Проверяем исключенные директории
  if (EXCLUDE_DIRS.some(dir => normalizedPath.includes(`/${dir}/`))) {
    return true;
  }
  
  // Проверяем исключенные файлы
  const fileName = path.basename(normalizedPath);
  if (EXCLUDE_FILES.includes(fileName)) {
    return true;
  }
  
  return false;
}

/**
 * Рекурсивно обходит директорию и собирает все файлы
 */
async function getFiles(dir) {
  if (shouldExclude(dir)) {
    return [];
  }
  
  try {
    const items = await readdir(dir);
    
    const filePromises = items.map(async item => {
      const fullPath = path.join(dir, item);
      
      if (shouldExclude(fullPath)) {
        return [];
      }
      
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        return getFiles(fullPath);
      } else {
        return [fullPath];
      }
    });
    
    const files = await Promise.all(filePromises);
    return files.flat();
  } catch (error) {
    console.error(`❌ Ошибка чтения директории ${dir}:`, error.message);
    return [];
  }
}

/**
 * Ищет API-ключи Firebase в указанном файле
 */
async function searchApiKeysInFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    results.summary.totalFiles++;
    
    // Ищем все совпадения с регулярным выражением
    let match;
    let apiKeysInFile = [];
    
    while ((match = FIREBASE_API_KEY_REGEX.exec(content)) !== null) {
      const apiKey = match[1] || match[2];
      if (apiKey) {
        apiKeysInFile.push(apiKey);
      }
    }
    
    // Проверяем все известные API-ключи
    for (const keyInfo of API_KEYS) {
      if (content.includes(keyInfo.value)) {
        if (!apiKeysInFile.includes(keyInfo.value)) {
          apiKeysInFile.push(keyInfo.value);
        }
      }
    }
    
    // Если найдены API-ключи, добавляем их в результаты
    if (apiKeysInFile.length > 0) {
      results.files[filePath] = {
        keys: apiKeysInFile.map(key => {
          const keyInfo = API_KEYS.find(info => info.value === key) || { 
            value: key, 
            isCurrent: false, 
            description: "Неизвестный API-ключ" 
          };
          
          return {
            value: key,
            isCurrent: keyInfo.isCurrent,
            description: keyInfo.description
          };
        })
      };
      
      results.summary.filesWithApiKeys++;
      results.summary.totalApiKeysFound += apiKeysInFile.length;
      
      // Считаем количество старых ключей
      results.summary.oldApiKeysFound += apiKeysInFile.filter(key => {
        const keyInfo = API_KEYS.find(info => info.value === key);
        return keyInfo && !keyInfo.isCurrent;
      }).length;
    }
    
  } catch (error) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, error.message);
  }
}

/**
 * Сохраняет отчет о проверке
 */
async function saveReport() {
  const reportPath = 'security-check-report.json';
  await writeFile(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`📝 Отчет сохранен в ${reportPath}`);
}

/**
 * Выводит результаты проверки в консоль
 */
function printResults() {
  console.log('\n=== 📊 Результаты проверки безопасности ===');
  console.log(`📁 Проверено файлов: ${results.summary.totalFiles}`);
  console.log(`🔑 Файлов с API-ключами: ${results.summary.filesWithApiKeys}`);
  console.log(`🔑 Всего найдено API-ключей: ${results.summary.totalApiKeysFound}`);
  console.log(`⚠️ Найдено устаревших API-ключей: ${results.summary.oldApiKeysFound}`);
  
  if (results.summary.filesWithApiKeys > 0) {
    console.log('\n📄 Файлы с API-ключами:');
    
    // Сортируем файлы по количеству устаревших ключей (сначала с устаревшими ключами)
    const sortedFiles = Object.entries(results.files).sort((a, b) => {
      const aOldKeys = a[1].keys.filter(k => !k.isCurrent).length;
      const bOldKeys = b[1].keys.filter(k => !k.isCurrent).length;
      return bOldKeys - aOldKeys;
    });
    
    for (const [filePath, fileInfo] of sortedFiles) {
      const oldKeys = fileInfo.keys.filter(k => !k.isCurrent);
      const currentKeys = fileInfo.keys.filter(k => k.isCurrent);
      
      const status = oldKeys.length > 0 ? '⚠️' : '✅';
      console.log(`${status} ${filePath}:`);
      
      if (oldKeys.length > 0) {
        console.log('   Устаревшие ключи:');
        oldKeys.forEach(key => {
          console.log(`   - ${key.value.substring(0, 10)}...${key.value.substring(key.value.length - 5)} (${key.description})`);
        });
      }
      
      if (currentKeys.length > 0) {
        console.log('   Актуальные ключи:');
        currentKeys.forEach(key => {
          console.log(`   - ${key.value.substring(0, 10)}...${key.value.substring(key.value.length - 5)} (${key.description})`);
        });
      }
      
      console.log('');
    }
  }
  
  // Выводим итоговое заключение
  if (results.summary.oldApiKeysFound === 0) {
    console.log('\n✅ ПРОВЕРКА ПРОЙДЕНА: устаревшие API-ключи не обнаружены');
  } else {
    console.log(`\n⚠️ ВНИМАНИЕ: обнаружено ${results.summary.oldApiKeysFound} устаревших API-ключей в ${Object.entries(results.files).filter(([_, info]) => info.keys.some(k => !k.isCurrent)).length} файлах`);
    console.log('   Рекомендуется заменить устаревшие ключи на актуальные');
  }
}

/**
 * Главная функция
 */
async function main() {
  try {
    console.log('🔍 Начинаем проверку безопасности проекта...');
    
    // Получаем все файлы из указанных директорий
    const filePromises = SEARCH_DIRS.map(dir => getFiles(dir));
    const fileArrays = await Promise.all(filePromises);
    const allFiles = fileArrays.flat();
    
    console.log(`📁 Найдено ${allFiles.length} файлов для проверки`);
    
    // Проверяем каждый файл на наличие API-ключей
    await Promise.all(allFiles.map(searchApiKeysInFile));
    
    // Выводим результаты
    printResults();
    
    // Сохраняем отчет
    await saveReport();
    
    // Если найдены устаревшие ключи, завершаем процесс с ошибкой
    if (results.summary.oldApiKeysFound > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Запускаем проверку
main();