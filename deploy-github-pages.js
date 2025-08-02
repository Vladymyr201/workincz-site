const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Подготовка к деплою на GitHub Pages...');

// Проверяем наличие папки public
if (!fs.existsSync('public')) {
  console.error('❌ Папка public не найдена!');
  process.exit(1);
}

// Создаем файл 404.html для SPA
const notFoundContent = fs.readFileSync(path.join('public', 'index.html'), 'utf8');
fs.writeFileSync(path.join('public', '404.html'), notFoundContent);

console.log('✅ Файл 404.html создан');

// Создаем файл .nojekyll для GitHub Pages
fs.writeFileSync(path.join('public', '.nojekyll'), '');

console.log('✅ Файл .nojekyll создан');

// Создаем архив для ручного деплоя
const archiver = require('archiver');
const output = fs.createWriteStream('workincz-github-pages.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('✅ Архив создан: workincz-github-pages.zip');
  console.log('📋 Инструкции для деплоя на GitHub Pages:');
  console.log('1. Перейдите на https://github.com/your-username/your-repo');
  console.log('2. Перейдите в Settings > Pages');
  console.log('3. В разделе "Source" выберите "Deploy from a branch"');
  console.log('4. Выберите ветку "main" и папку "/ (root)"');
  console.log('5. Или загрузите архив workincz-github-pages.zip в releases');
  console.log('6. Сайт будет доступен по адресу: https://your-username.github.io/your-repo');
});

archive.pipe(output);
archive.directory('public/', false);
archive.finalize();