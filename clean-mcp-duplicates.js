const fs = require('fs');
const path = require('path');

console.log('🧹 ОЧИСТКА ДУБЛЕЙ MCP КОНФИГУРАЦИИ...\n');

// Список файлов для удаления (дубли)
const filesToRemove = [
  'cursor-mcp-fixed.json',
  'cursor-mcp-config.json',
  'mcp.json',
  '.cursor/mcp-backup.json',
  '.cursor/mcp.json.backup.1753373162402',
  '.cursor/mcp.json.backup'
];

// Список файлов для сохранения
const filesToKeep = [
  'mcp-clean.json',
  '.cursor/mcp-optimized.json'
];

console.log('📋 ФАЙЛЫ ДЛЯ УДАЛЕНИЯ (ДУБЛИ):');
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ ${file}`);
  }
});

console.log('\n📋 ФАЙЛЫ ДЛЯ СОХРАНЕНИЯ:');
filesToKeep.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  }
});

// Удаляем дубли
console.log('\n🗑️ УДАЛЕНИЕ ДУБЛЕЙ...');
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✅ Удален: ${file}`);
    } catch (error) {
      console.log(`❌ Ошибка удаления ${file}: ${error.message}`);
    }
  }
});

// Копируем очищенную конфигурацию в основные места
console.log('\n📁 КОПИРОВАНИЕ ОЧИЩЕННОЙ КОНФИГУРАЦИИ...');

if (fs.existsSync('mcp-clean.json')) {
  try {
    // Копируем в корень как mcp.json
    fs.copyFileSync('mcp-clean.json', 'mcp.json');
    console.log('✅ Скопирован в: mcp.json');
    
    // Копируем в .cursor/mcp.json
    fs.copyFileSync('mcp-clean.json', '.cursor/mcp.json');
    console.log('✅ Скопирован в: .cursor/mcp.json');
    
  } catch (error) {
    console.log(`❌ Ошибка копирования: ${error.message}`);
  }
}

console.log('\n🎯 ПРОВЕРКА КОНФИГУРАЦИИ...');

// Проверяем JSON синтаксис
try {
  const config = JSON.parse(fs.readFileSync('mcp-clean.json', 'utf8'));
  const serverCount = Object.keys(config.mcpServers).length;
  console.log(`✅ JSON синтаксис корректен`);
  console.log(`✅ Серверов: ${serverCount}`);
  
  // Проверяем уникальность серверов
  const serverNames = Object.keys(config.mcpServers);
  const uniqueNames = [...new Set(serverNames)];
  
  if (serverNames.length === uniqueNames.length) {
    console.log('✅ Дубли серверов отсутствуют');
  } else {
    console.log('❌ Обнаружены дубли серверов');
  }
  
} catch (error) {
  console.log(`❌ Ошибка JSON: ${error.message}`);
}

console.log('\n📊 СТАТИСТИКА ОЧИСТКИ:');
console.log(`🗑️ Удалено файлов: ${filesToRemove.length}`);
console.log(`✅ Сохранено файлов: ${filesToKeep.length}`);
console.log(`🧹 Очищена конфигурация: mcp-clean.json`);

console.log('\n🎉 ОЧИСТКА ЗАВЕРШЕНА!');
console.log('📝 Следующие шаги:');
console.log('1. Перезапустите Cursor');
console.log('2. Проверьте настройки MCP в Settings');
console.log('3. Запустите тестирование: node test-mcp-servers.js'); 