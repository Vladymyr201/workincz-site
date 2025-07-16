// Скрипт для автоматического копирования workflow-файлов из workflows-templates/ в .github/workflows/
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'workflows-templates');
const destDir = path.join(__dirname, '.github', 'workflows');

if (!fs.existsSync(srcDir)) {
  console.error('Папка workflows-templates не найдена!');
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied ${file} to .github/workflows/`);
});

console.log('Все workflow-файлы успешно скопированы!');