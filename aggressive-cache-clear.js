#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 АГРЕССИВНАЯ ОЧИСТКА КЭША CURSOR\n');

// Полная очистка всех данных Cursor
const cursorPaths = [
  path.join(process.env.APPDATA, 'Cursor'),
  path.join(process.env.LOCALAPPDATA, 'Cursor'),
  path.join(process.env.USERPROFILE, '.cursor')
];

let clearedCount = 0;

console.log('🗑️ Удаление всех данных Cursor...\n');

cursorPaths.forEach(cursorPath => {
  try {
    if (fs.existsSync(cursorPath)) {
      console.log(`📁 Найдена папка Cursor: ${cursorPath}`);
      
      // Удаляем всю папку Cursor
      try {
        fs.rmSync(cursorPath, { recursive: true, force: true });
        console.log(`✅ Удалена папка: ${cursorPath}`);
        clearedCount++;
      } catch (error) {
        console.log(`⚠️ Не удалось удалить: ${cursorPath} - ${error.message}`);
        
        // Попробуем удалить по частям
        try {
          const items = fs.readdirSync(cursorPath);
          items.forEach(item => {
            const itemPath = path.join(cursorPath, item);
            try {
              const stats = fs.statSync(itemPath);
              if (stats.isDirectory()) {
                fs.rmSync(itemPath, { recursive: true, force: true });
                console.log(`✅ Удалена подпапка: ${itemPath}`);
                clearedCount++;
              } else {
                fs.unlinkSync(itemPath);
                console.log(`✅ Удален файл: ${itemPath}`);
                clearedCount++;
              }
            } catch (error) {
              console.log(`⚠️ Не удалось удалить элемент: ${itemPath} - ${error.message}`);
            }
          });
        } catch (error) {
          console.log(`❌ Ошибка при частичном удалении: ${cursorPath} - ${error.message}`);
        }
      }
    } else {
      console.log(`❌ Папка не найдена: ${cursorPath}`);
    }
  } catch (error) {
    console.log(`❌ Ошибка доступа к: ${cursorPath} - ${error.message}`);
  }
});

// Очистка временных файлов Cursor
console.log('\n🧹 Очистка временных файлов...');

try {
  const tempDir = process.env.TEMP;
  if (tempDir && fs.existsSync(tempDir)) {
    const tempItems = fs.readdirSync(tempDir);
    
    tempItems.forEach(item => {
      if (item.toLowerCase().includes('cursor') || 
          item.toLowerCase().includes('mcp') ||
          item.toLowerCase().includes('vscode')) {
        
        const tempPath = path.join(tempDir, item);
        try {
          const stats = fs.statSync(tempPath);
          
          if (stats.isDirectory()) {
            fs.rmSync(tempPath, { recursive: true, force: true });
            console.log(`✅ Удален временный каталог: ${tempPath}`);
            clearedCount++;
          } else {
            fs.unlinkSync(tempPath);
            console.log(`✅ Удален временный файл: ${tempPath}`);
            clearedCount++;
          }
        } catch (error) {
          // Игнорируем ошибки
        }
      }
    });
  }
} catch (error) {
  console.log(`❌ Ошибка очистки временных файлов: ${error.message}`);
}

// Очистка логов
console.log('\n📋 Очистка логов...');

const logPaths = [
  path.join(process.env.APPDATA, 'Cursor', 'logs'),
  path.join(process.env.LOCALAPPDATA, 'Cursor', 'logs')
];

logPaths.forEach(logPath => {
  try {
    if (fs.existsSync(logPath)) {
      const logItems = fs.readdirSync(logPath);
      
      logItems.forEach(item => {
        const logItemPath = path.join(logPath, item);
        try {
          const stats = fs.statSync(logItemPath);
          
          if (stats.isDirectory()) {
            fs.rmSync(logItemPath, { recursive: true, force: true });
            console.log(`✅ Удален лог-каталог: ${logItemPath}`);
            clearedCount++;
          } else {
            fs.unlinkSync(logItemPath);
            console.log(`✅ Удален лог-файл: ${logItemPath}`);
            clearedCount++;
          }
        } catch (error) {
          // Игнорируем ошибки
        }
      });
    }
  } catch (error) {
    console.log(`❌ Ошибка очистки логов: ${logPath} - ${error.message}`);
  }
});

// Создание отчета
console.log('\n📊 ОТЧЕТ ОБ АГРЕССИВНОЙ ОЧИСТКЕ:');
console.log(`✅ Удалено папок/файлов: ${clearedCount}`);

const report = {
  timestamp: new Date().toISOString(),
  clearedCount,
  cursorPaths,
  status: 'AGGRESSIVE_CACHE_CLEARED',
  warning: 'ВСЕ ДАННЫЕ CURSOR УДАЛЕНЫ!'
};

try {
  fs.writeFileSync('aggressive-cache-clear-report.json', JSON.stringify(report, null, 2));
  console.log('✅ Отчет сохранен в aggressive-cache-clear-report.json');
} catch (error) {
  console.log('❌ Ошибка сохранения отчета:', error.message);
}

console.log('\n⚠️ ВНИМАНИЕ: ВСЕ ДАННЫЕ CURSOR УДАЛЕНЫ!');
console.log('🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('1. Перезапустите компьютер');
console.log('2. Установите Cursor заново (если нужно)');
console.log('3. Откройте проект заново');
console.log('4. Проверьте настройки MCP (Ctrl + Shift + P → "MCP: Open Settings")');
console.log('5. Убедитесь, что FullAutoQA показывает "1 tool enabled"');

console.log('\n🔥 АГРЕССИВНАЯ ОЧИСТКА ЗАВЕРШЕНА! Перезапустите компьютер.'); 