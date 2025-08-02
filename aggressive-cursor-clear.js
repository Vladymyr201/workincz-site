#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🧹 АГРЕССИВНАЯ ОЧИСТКА КЭША CURSOR\n');

const cursorPaths = [
  // Основные пути кэша Cursor
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor'),
  path.join(os.homedir(), 'AppData', 'Local', 'Cursor'),
  path.join(os.homedir(), '.cursor'),
  path.join(os.tmpdir(), 'cursor'),
  
  // Дополнительные пути
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'workspaceStorage'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'logs'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'CachedData'),
  
  // MCP специфичные пути
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'modelcontextprotocol'),
  path.join(os.homedir(), 'AppData', 'Local', 'Cursor', 'User', 'globalStorage', 'modelcontextprotocol'),
];

console.log('1️⃣ Остановка процессов Cursor...');
try {
  if (os.platform() === 'win32') {
    execSync('taskkill /F /IM Cursor.exe 2>nul || echo Cursor не запущен', { shell: true });
    console.log('✅ Процессы Cursor остановлены');
  } else {
    execSync('pkill -f Cursor 2>/dev/null || echo Cursor не запущен', { shell: true });
    console.log('✅ Процессы Cursor остановлены');
  }
} catch (error) {
  console.log('⚠️ Не удалось остановить процессы:', error.message);
}

console.log('\n2️⃣ Очистка кэша...');
let clearedCount = 0;

cursorPaths.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    try {
      console.log(`   🗑️ Удаление: ${cachePath}`);
      
      // Рекурсивное удаление
      const deleteRecursive = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteRecursive(curPath);
            } else {
              try {
                fs.unlinkSync(curPath);
              } catch (error) {
                console.log(`      ⚠️ Не удалось удалить файл: ${curPath}`);
              }
            }
          });
          try {
            fs.rmdirSync(dirPath);
          } catch (error) {
            console.log(`      ⚠️ Не удалось удалить директорию: ${dirPath}`);
          }
        }
      };
      
      deleteRecursive(cachePath);
      clearedCount++;
      console.log(`   ✅ Удалено: ${cachePath}`);
    } catch (error) {
      console.log(`   ❌ Ошибка удаления ${cachePath}: ${error.message}`);
    }
  } else {
    console.log(`   ⚪ Не найден: ${cachePath}`);
  }
});

console.log(`\n3️⃣ Очищено директорий: ${clearedCount}`);

console.log('\n4️⃣ Очистка временных файлов...');
try {
  if (os.platform() === 'win32') {
    execSync('del /Q /F %TEMP%\\*cursor* 2>nul || echo Временные файлы не найдены', { shell: true });
  } else {
    execSync('rm -rf /tmp/*cursor* 2>/dev/null || echo Временные файлы не найдены', { shell: true });
  }
  console.log('✅ Временные файлы очищены');
} catch (error) {
  console.log('⚠️ Ошибка очистки временных файлов:', error.message);
}

console.log('\n5️⃣ Очистка кэша npm...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe' });
  console.log('✅ Кэш npm очищен');
} catch (error) {
  console.log('⚠️ Ошибка очистки кэша npm:', error.message);
}

console.log('\n🔧 ИНСТРУКЦИИ ПОСЛЕ ОЧИСТКИ:');
console.log('1. Перезагрузите компьютер');
console.log('2. Запустите Cursor заново');
console.log('3. Откройте Settings → MCP Tools');
console.log('4. Проверьте FullAutoQA - должно быть "5 tools enabled"');
console.log('5. Должна быть зеленая точка');

console.log('\n⚠️ ВАЖНО:');
console.log('- Перезагрузка компьютера обязательна!');
console.log('- Это полностью очистит все кэши Cursor');
console.log('- MCP серверы будут перезагружены');

console.log('\n✅ АГРЕССИВНАЯ ОЧИСТКА ЗАВЕРШЕНА!');
console.log('🔄 Перезагрузите компьютер и проверьте FullAutoQA!'); 