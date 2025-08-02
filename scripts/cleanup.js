/**
 * 🧹 СКРИПТ ОЧИСТКИ ПРОЕКТА WORKINCZ
 * Автоматическое удаление неиспользуемых файлов и оптимизация
 */

const fs = require('fs');
const path = require('path');

// Файлы для удаления (дубликаты и неиспользуемые)
const filesToDelete = [
    'public/js/role-middleware.js',
    'public/js/role-switcher.js', 
    'public/js/version-manager.js',
    'public/js/registration-system.js',
    'public/js/chart.min.js',
    'public/js/tailwindcss.min.js',
    'public/js/demo-data.js'
];

// Файлы для перемещения в features
const filesToMove = {
    'public/js/jobs.js': 'public/js/features/jobs/',
    'public/js/job-posting.js': 'public/js/features/jobs/',
    'public/js/applications.js': 'public/js/features/jobs/',
    'public/js/chat-widget.js': 'public/js/features/chat/',
    'public/js/messaging-manager.js': 'public/js/features/chat/',
    'public/js/payment-system.js': 'public/js/features/payments/',
    'public/js/payment-manager.js': 'public/js/features/payments/',
    'public/js/subscription-system.js': 'public/js/features/payments/',
    'public/js/subscription-ui.js': 'public/js/features/payments/',
    'public/js/analytics-dashboard.js': 'public/js/features/analytics/',
    'public/js/performance-monitor.js': 'public/js/features/analytics/',
    'public/js/error-tracker.js': 'public/js/features/analytics/'
};

// Файлы для перемещения в utils
const utilsFiles = [
    'public/js/validation-engine.js',
    'public/js/optimization-engine.js'
];

console.log('🧹 Начинаю очистку проекта WorkInCZ...\n');

// 1. Удаление неиспользуемых файлов
console.log('📁 Удаление неиспользуемых файлов:');
filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            fs.unlinkSync(file);
            console.log(`  ✅ Удален: ${file}`);
        } catch (error) {
            console.log(`  ❌ Ошибка удаления ${file}: ${error.message}`);
        }
    } else {
        console.log(`  ⚠️  Файл не найден: ${file}`);
    }
});

// 2. Перемещение файлов в features
console.log('\n📦 Перемещение файлов в features:');
Object.entries(filesToMove).forEach(([source, destination]) => {
    if (fs.existsSync(source)) {
        try {
            // Создаем папку если не существует
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }
            
            const fileName = path.basename(source);
            const newPath = path.join(destination, fileName);
            
            fs.renameSync(source, newPath);
            console.log(`  ✅ Перемещен: ${source} → ${newPath}`);
        } catch (error) {
            console.log(`  ❌ Ошибка перемещения ${source}: ${error.message}`);
        }
    } else {
        console.log(`  ⚠️  Файл не найден: ${source}`);
    }
});

// 3. Перемещение файлов в utils
console.log('\n🔧 Перемещение файлов в utils:');
utilsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        try {
            const fileName = path.basename(file);
            const newPath = path.join('public/js/utils/', fileName);
            
            fs.renameSync(file, newPath);
            console.log(`  ✅ Перемещен: ${file} → ${newPath}`);
        } catch (error) {
            console.log(`  ❌ Ошибка перемещения ${file}: ${error.message}`);
        }
    } else {
        console.log(`  ⚠️  Файл не найден: ${file}`);
    }
});

// 4. Создание index файлов для модулей
console.log('\n📝 Создание index файлов:');

// Index для auth
const authIndex = `// Auth Module Index
export { default as AuthService } from './auth.js';
export { default as DashboardAuth } from './dashboard-auth.js';
`;
fs.writeFileSync('public/js/auth/index.js', authIndex);
console.log('  ✅ Создан: public/js/auth/index.js');

// Index для core
const coreIndex = `// Core Module Index
export { default as App } from './app-bundle.js';
`;
fs.writeFileSync('public/js/core/index.js', coreIndex);
console.log('  ✅ Создан: public/js/core/index.js');

// 5. Статистика
console.log('\n📊 Статистика очистки:');
const jsFiles = getAllJsFiles('public/js');
console.log(`  📁 Всего JS файлов: ${jsFiles.length}`);
console.log(`  🗂️  Структура папок:`);

const folders = getFolders('public/js');
folders.forEach(folder => {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
    console.log(`    ${folder}: ${files.length} файлов`);
});

console.log('\n🎉 Очистка завершена!');
console.log('💡 Рекомендации:');
console.log('  - Запустите тесты: npm run test');
console.log('  - Проверьте линтер: npm run lint');
console.log('  - Деплойте изменения: npm run deploy');

// Вспомогательные функции
function getAllJsFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...getAllJsFiles(fullPath));
        } else if (item.endsWith('.js')) {
            files.push(fullPath);
        }
    });
    
    return files;
}

function getFolders(dir) {
    const folders = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            folders.push(fullPath);
            folders.push(...getFolders(fullPath));
        }
    });
    
    return folders;
}