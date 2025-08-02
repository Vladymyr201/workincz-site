/**
 * Скрипт для поиска и замены старых Firebase API ключей.
 * 
 * Этот скрипт ищет старые API ключи в файлах и заменяет их на текущий рабочий ключ.
 * Он также генерирует отчет о сделанных изменениях.
 * 
 * Использование: node scripts/fix-firebase-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Конфигурация
const OLD_API_KEYS = [
  'AIzaSyAo343vPwqrjwzjhd-d-qEKh7HqAAMsIiM', // Старый ключ, обнаруженный в логах
];

const CURRENT_API_KEY = 'AIzaSyBQBIE0lphKrKyq40dGmv3zDACVnJL90Z0'; // Актуальный ключ из firebase-config.js

// Директории для проверки
const DIRS_TO_CHECK = [
  'public',
  'src'
];

// Расширения файлов для проверки
const FILE_EXTENSIONS = ['.html', '.js', '.jsx', '.ts', '.tsx', '.json'];

// Результаты
const results = {
  scannedFiles: 0,
  modifiedFiles: [],
  errors: []
};

/**
 * Рекурсивно обходит директорию и возвращает все файлы
 */
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

/**
 * Проверяет, следует ли обрабатывать файл
 */
function shouldProcessFile(filePath) {
  // Проверяем расширение
  const ext = path.extname(filePath).toLowerCase();
  if (!FILE_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Игнорируем node_modules, .git и другие служебные директории
  const skipDirs = ['node_modules', '.git', '.github', 'dist', 'build'];
  return !skipDirs.some(dir => filePath.includes(`${path.sep}${dir}${path.sep}`));
}

/**
 * Обрабатывает файл - проверяет и заменяет API ключи
 */
async function processFile(filePath) {
  try {
    results.scannedFiles++;
    
    // Читаем файл
    let content = await readFile(filePath, 'utf8');
    let originalContent = content;
    
    // Проверяем каждый старый ключ
    for (const oldKey of OLD_API_KEYS) {
      // Используем регулярное выражение для поиска ключа
      // Это позволит найти ключ даже если он обернут в кавычки или имеет пробелы
      const keyRegex = new RegExp(oldKey, 'g');
      
      if (content.match(keyRegex)) {
        console.log(`🔑 Найден старый ключ в файле ${filePath}`);
        content = content.replace(keyRegex, CURRENT_API_KEY);
      }
    }
    
    // Если контент изменился, сохраняем файл и добавляем в результаты
    if (content !== originalContent) {
      await writeFile(filePath, content, 'utf8');
      results.modifiedFiles.push({
        path: filePath,
        replacedKeys: OLD_API_KEYS.filter(key => originalContent.includes(key))
      });
      console.log(`✅ Обновлен файл: ${filePath}`);
    }
  } catch (error) {
    results.errors.push({
      path: filePath,
      error: error.message
    });
    console.error(`❌ Ошибка при обработке файла ${filePath}: ${error.message}`);
  }
}

/**
 * Сохраняет отчет о выполнении
 */
async function saveReport() {
  const report = {
    timestamp: new Date().toISOString(),
    results: {
      scannedFiles: results.scannedFiles,
      modifiedFiles: results.modifiedFiles,
      errorCount: results.errors.length
    },
    modifiedFiles: results.modifiedFiles,
    errors: results.errors
  };
  
  await writeFile('api-key-fix-report.json', JSON.stringify(report, null, 2), 'utf8');
  console.log(`📝 Отчет сохранен в api-key-fix-report.json`);
}

/**
 * Основная функция
 */
async function main() {
  try {
    console.log('🔍 Начинаем поиск и замену старых Firebase API ключей...');
    
    // Получаем все файлы из указанных директорий
    const allFilesArrays = await Promise.all(DIRS_TO_CHECK.map(dir => getFiles(dir)));
    const allFiles = allFilesArrays.flat();
    
    // Отфильтровываем только нужные файлы
    const filesToProcess = allFiles.filter(shouldProcessFile);
    
    console.log(`📁 Найдено ${filesToProcess.length} файлов для проверки`);
    
    // Обрабатываем каждый файл
    await Promise.all(filesToProcess.map(processFile));
    
    // Сохраняем отчет
    await saveReport();
    
    // Выводим итог
    console.log('\n=== 📊 Результаты ===');
    console.log(`📁 Проверено файлов: ${results.scannedFiles}`);
    console.log(`✏️ Изменено файлов: ${results.modifiedFiles.length}`);
    console.log(`❌ Ошибок: ${results.errors.length}`);
    
    if (results.modifiedFiles.length > 0) {
      console.log('\n📄 Список измененных файлов:');
      results.modifiedFiles.forEach(file => {
        console.log(`   - ${file.path} (заменены ключи: ${file.replacedKeys.join(', ')})`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n⚠️ Произошли ошибки при обработке файлов:');
      results.errors.forEach(err => {
        console.log(`   - ${err.path}: ${err.error}`);
      });
    }
  } catch (error) {
    console.error(`❌ Критическая ошибка: ${error.message}`);
    process.exit(1);
  }
}

// Запускаем основную функцию
main().catch(err => {
  console.error('❌ Необработанная ошибка:', err);
  process.exit(1);
});