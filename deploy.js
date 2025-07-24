#!/usr/bin/env node

/**
 * Скрипт для автоматического деплоя WorkInCZ на GitHub Pages
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаю автоматический деплой WorkInCZ...');

// Проверяем наличие папки public
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
    console.error('❌ Папка public не найдена!');
    process.exit(1);
}

console.log('✅ Папка public найдена');

// Проверяем наличие index.html
const indexPath = path.join(publicPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ Файл index.html не найден в папке public!');
    process.exit(1);
}

console.log('✅ Файл index.html найден');

// Проверяем наличие всех JS файлов
const requiredFiles = [
    'js/auth-manager.js',
    'js/jobs.js',
    'js/reviews-system.js',
    'js/calendar-system.js',
    'js/skills-testing-system.js',
    'js/gamification-system.js',
    'js/messaging-manager.js',
    'js/subscription-system.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(publicPath, file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Файл ${file} не найден!`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('❌ Не все необходимые файлы найдены!');
    process.exit(1);
}

console.log('✅ Все необходимые файлы найдены');

// Создаем файл для GitHub Pages
const ghPagesConfig = {
    name: 'WorkInCZ',
    description: 'Европейская платформа поиска работы',
    version: '1.0.0',
    homepage: 'https://vladymyr201.github.io/workincz-site/',
    repository: {
        type: 'git',
        url: 'https://github.com/Vladymyr201/workincz-site.git'
    }
};

fs.writeFileSync(
    path.join(publicPath, 'package.json'),
    JSON.stringify(ghPagesConfig, null, 2)
);

console.log('✅ Создан package.json для GitHub Pages');

// Создаем README для GitHub Pages
const ghPagesReadme = `# WorkInCZ - Европейская платформа поиска работы

## 🚀 Демо сайт

Это демо версия платформы WorkInCZ, развернутая на GitHub Pages.

### 🎯 Функции:

- 🔐 Система аутентификации
- 💼 Поиск вакансий
- ⭐ Система отзывов и рейтингов
- 📅 Календарь событий
- 🧪 Система тестирования навыков
- 🏆 Геймификация
- 💬 Система сообщений
- 💳 Система подписок и платежей
- 📊 Аналитика
- 🔔 Уведомления
- 🤖 AI рекомендации
- 🛡️ Модерация контента

### 🔧 Тестирование:

1. Открой консоль браузера (F12)
2. Все системы работают в демо режиме
3. Данные сохраняются в localStorage

---

**WorkInCZ** - Ваш надежный партнер в поиске работы в Европе! 🇨🇿🇪🇺
`;

fs.writeFileSync(
    path.join(publicPath, 'README.md'),
    ghPagesReadme
);

console.log('✅ Создан README для GitHub Pages');

// Создаем .nojekyll для GitHub Pages
fs.writeFileSync(path.join(publicPath, '.nojekyll'), '');

console.log('✅ Создан .nojekyll файл');

console.log('\n🎉 Деплой готов!');
console.log('\n📋 Следующие шаги:');
console.log('1. Перейди в настройки репозитория: https://github.com/Vladymyr201/workincz-site/settings');
console.log('2. Прокрути вниз до раздела "Pages"');
console.log('3. В "Source" выбери "Deploy from a branch"');
console.log('4. В "Branch" выбери "master" и папку "/public"');
console.log('5. Нажми "Save"');
console.log('\n🌐 Сайт будет доступен по адресу: https://vladymyr201.github.io/workincz-site/');
console.log('\n⏱️ Деплой займет 2-5 минут');

console.log('\n🔧 Альтернативный быстрый деплой:');
console.log('1. Перейди на https://app.netlify.com/drop');
console.log('2. Перетащи папку "public"');
console.log('3. Получишь ссылку за 30 секунд!');

console.log('\n✅ WorkInCZ готов к демонстрации! 🚀'); 