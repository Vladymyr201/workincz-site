const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем деплой на Netlify...');

// Проверяем наличие папки public
if (!fs.existsSync('public')) {
  console.error('❌ Папка public не найдена!');
  process.exit(1);
}

// Создаем файл _redirects для SPA
const redirectsContent = `/*    /index.html   200`;
fs.writeFileSync(path.join('public', '_redirects'), redirectsContent);

console.log('✅ Файл _redirects создан');

// Создаем файл _headers для безопасности
const headersContent = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;
fs.writeFileSync(path.join('public', '_headers'), headersContent);

console.log('✅ Файл _headers создан');

// Пытаемся деплоить через Netlify CLI
try {
  console.log('📤 Запускаем деплой через Netlify...');
  execSync('npx netlify-cli deploy --dir=public --prod --open', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.log('⚠️ Netlify CLI не работает, создаем архив для ручного деплоя...');
  
  // Создаем архив для ручного деплоя
  const archiver = require('archiver');
  const output = fs.createWriteStream('workincz-site.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log('✅ Архив создан: workincz-site.zip');
    console.log('📋 Инструкции для ручного деплоя:');
    console.log('1. Перейдите на https://app.netlify.com/');
    console.log('2. Нажмите "New site from ZIP"');
    console.log('3. Загрузите файл workincz-site.zip');
    console.log('4. Сайт будет доступен по адресу: https://your-site-name.netlify.app');
  });
  
  archive.pipe(output);
  archive.directory('public/', false);
  archive.finalize();
}