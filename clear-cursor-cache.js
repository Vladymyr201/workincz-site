#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 ОЧИСТКА КЭША CURSOR MCP\n');

// Пути к кэшу Cursor
const cachePaths = [
  path.join(process.env.APPDATA, 'Cursor', 'User', 'globalStorage'),
  path.join(process.env.APPDATA, 'Cursor', 'User', 'workspaceStorage'),
  path.join(process.env.APPDATA, 'Cursor', 'logs'),
  path.join(process.env.LOCALAPPDATA, 'Cursor', 'User', 'globalStorage'),
  path.join(process.env.LOCALAPPDATA, 'Cursor', 'User', 'workspaceStorage')
];

let clearedCount = 0;

console.log('🔍 Поиск папок кэша Cursor...\n');

cachePaths.forEach(cachePath => {
  try {
    if (fs.existsSync(cachePath)) {
      console.log(`📁 Найдена папка: ${cachePath}`);
      
      // Поиск папок MCP
      const items = fs.readdirSync(cachePath);
      
      items.forEach(item => {
        const itemPath = path.join(cachePath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          // Проверяем, содержит ли папка MCP
          if (item.toLowerCase().includes('mcp') || 
              item.toLowerCase().includes('modelcontextprotocol') ||
              item.toLowerCase().includes('cursor')) {
            
            try {
              // Удаляем папку рекурсивно
              fs.rmSync(itemPath, { recursive: true, force: true });
              console.log(`✅ Удалена папка: ${itemPath}`);
              clearedCount++;
            } catch (error) {
              console.log(`⚠️ Не удалось удалить: ${itemPath} - ${error.message}`);
            }
          }
        }
      });
    } else {
      console.log(`❌ Папка не найдена: ${cachePath}`);
    }
  } catch (error) {
    console.log(`❌ Ошибка доступа к: ${cachePath} - ${error.message}`);
  }
});

// Дополнительная очистка - поиск всех папок с MCP
console.log('\n🔍 Дополнительный поиск папок MCP...');

const searchPaths = [
  process.env.APPDATA,
  process.env.LOCALAPPDATA,
  process.env.USERPROFILE
];

searchPaths.forEach(searchPath => {
  if (!searchPath) return;
  
  try {
    const searchForMCP = (dir, depth = 0) => {
      if (depth > 3) return; // Ограничиваем глубину поиска
      
      try {
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
          const itemPath = path.join(dir, item);
          
          try {
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
              // Проверяем, содержит ли папка MCP
              if (item.toLowerCase().includes('mcp') && 
                  item.toLowerCase().includes('cursor')) {
                
                try {
                  fs.rmSync(itemPath, { recursive: true, force: true });
                  console.log(`✅ Удалена MCP папка: ${itemPath}`);
                  clearedCount++;
                } catch (error) {
                  console.log(`⚠️ Не удалось удалить MCP папку: ${itemPath} - ${error.message}`);
                }
              } else {
                // Рекурсивный поиск
                searchForMCP(itemPath, depth + 1);
              }
            }
          } catch (error) {
            // Игнорируем ошибки доступа
          }
        });
      } catch (error) {
        // Игнорируем ошибки доступа
      }
    };
    
    searchForMCP(searchPath);
  } catch (error) {
    console.log(`❌ Ошибка поиска в: ${searchPath} - ${error.message}`);
  }
});

// Очистка временных файлов
console.log('\n🧹 Очистка временных файлов...');

try {
  const tempDir = process.env.TEMP;
  if (tempDir && fs.existsSync(tempDir)) {
    const tempItems = fs.readdirSync(tempDir);
    
    tempItems.forEach(item => {
      if (item.toLowerCase().includes('cursor') || 
          item.toLowerCase().includes('mcp')) {
        
        const tempPath = path.join(tempDir, item);
        try {
          const stats = fs.statSync(tempPath);
          
          if (stats.isDirectory()) {
            fs.rmSync(tempPath, { recursive: true, force: true });
            console.log(`✅ Удален временный файл: ${tempPath}`);
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

// Создание отчета
console.log('\n📊 ОТЧЕТ ОБ ОЧИСТКЕ:');
console.log(`✅ Удалено папок/файлов: ${clearedCount}`);

const report = {
  timestamp: new Date().toISOString(),
  clearedCount,
  cachePaths,
  status: 'CACHE_CLEARED'
};

try {
  fs.writeFileSync('cursor-cache-clear-report.json', JSON.stringify(report, null, 2));
  console.log('✅ Отчет сохранен в cursor-cache-clear-report.json');
} catch (error) {
  console.log('❌ Ошибка сохранения отчета:', error.message);
}

console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('1. Перезапустите Cursor');
console.log('2. Проверьте настройки MCP (Ctrl + Shift + P → "MCP: Open Settings")');
console.log('3. Убедитесь, что FullAutoQA показывает "1 tool enabled"');

console.log('\n✅ КЭШ ОЧИЩЕН! Теперь перезапустите Cursor.'); 