const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Конфигурация
const JS_DIR = './public/js';
const OUTPUT_DIR = './public/js-hashed';
const MANIFEST_FILE = './public/manifest.json';

// Создаем выходную директорию
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Функция для генерации хеша файла
function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// Функция для копирования файла с хешем
function copyFileWithHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hash = generateHash(content);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const hashedName = `${name}.${hash}${ext}`;
  const hashedPath = path.join(OUTPUT_DIR, hashedName);
  
  fs.copyFileSync(filePath, hashedPath);
  
  return {
    original: path.relative('./public', filePath),
    hashed: path.relative('./public', hashedPath),
    hash: hash
  };
}

// Основная функция
function generateHashedFiles() {
  console.log('🚀 Генерация хешированных файлов...');
  
  const manifest = {};
  const jsFiles = fs.readdirSync(JS_DIR).filter(file => file.endsWith('.js'));
  
  jsFiles.forEach(file => {
    const filePath = path.join(JS_DIR, file);
    const result = copyFileWithHash(filePath);
    manifest[result.original] = result.hashed;
    
    console.log(`✅ ${result.original} → ${result.hashed} (${result.hash})`);
  });
  
  // Сохраняем манифест
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`📋 Манифест сохранен: ${MANIFEST_FILE}`);
  
  return manifest;
}

// Запуск
if (require.main === module) {
  generateHashedFiles();
}

module.exports = { generateHashedFiles }; 