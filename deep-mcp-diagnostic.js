#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

console.log('🔍 ГЛУБОКАЯ ДИАГНОСТИКА MCP СЕРВЕРОВ\n');

// 1. Проверка системы
console.log('1️⃣ ИНФОРМАЦИЯ О СИСТЕМЕ:');
console.log(`   ОС: ${os.platform()} ${os.release()}`);
console.log(`   Архитектура: ${os.arch()}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   Рабочая директория: ${process.cwd()}`);

// 2. Проверка MCP SDK
console.log('\n2️⃣ ПРОВЕРКА MCP SDK:');
try {
  const sdkPath = require.resolve('@modelcontextprotocol/sdk/server/index.js');
  console.log(`   ✅ MCP SDK найден: ${sdkPath}`);
  
  const sdkPackage = JSON.parse(fs.readFileSync(path.join(path.dirname(sdkPath), '..', 'package.json'), 'utf8'));
  console.log(`   Версия SDK: ${sdkPackage.version}`);
} catch (error) {
  console.log(`   ❌ MCP SDK не найден: ${error.message}`);
}

// 3. Проверка конфигурации
console.log('\n3️⃣ ПРОВЕРКА КОНФИГУРАЦИИ:');
try {
  const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
  console.log('   ✅ mcp.json загружен');
  
  const servers = Object.keys(mcpConfig.mcpServers);
  console.log(`   Количество серверов: ${servers.length}`);
  
  servers.forEach(serverName => {
    const server = mcpConfig.mcpServers[serverName];
    console.log(`   📋 ${serverName}:`);
    console.log(`      Команда: ${server.command}`);
    console.log(`      Аргументы: ${JSON.stringify(server.args)}`);
    
    if (server.args && server.args[0]) {
      const serverPath = server.args[0];
      if (fs.existsSync(serverPath)) {
        console.log(`      ✅ Файл существует: ${serverPath}`);
        
        // Проверяем права доступа
        try {
          fs.accessSync(serverPath, fs.constants.R_OK | fs.constants.X_OK);
          console.log(`      ✅ Права доступа OK`);
        } catch (error) {
          console.log(`      ❌ Проблема с правами доступа: ${error.message}`);
        }
      } else {
        console.log(`      ❌ Файл не найден: ${serverPath}`);
      }
    }
  });
} catch (error) {
  console.log(`   ❌ Ошибка загрузки конфигурации: ${error.message}`);
}

// 4. Проверка переменных окружения
console.log('\n4️⃣ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ:');
const envVars = ['PATH', 'NODE_PATH', 'MCP_SERVER_PATH', 'CURSOR_MCP_PATH'];
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ${varName}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
  } else {
    console.log(`   ${varName}: не установлена`);
  }
});

// 5. Проверка процессов Cursor
console.log('\n5️⃣ ПРОВЕРКА ПРОЦЕССОВ CURSOR:');
try {
  if (os.platform() === 'win32') {
    const processes = execSync('tasklist /FI "IMAGENAME eq Cursor.exe"', { encoding: 'utf8' });
    if (processes.includes('Cursor.exe')) {
      console.log('   ✅ Cursor запущен');
    } else {
      console.log('   ❌ Cursor не запущен');
    }
  } else {
    const processes = execSync('ps aux | grep -i cursor', { encoding: 'utf8' });
    if (processes.includes('cursor')) {
      console.log('   ✅ Cursor запущен');
    } else {
      console.log('   ❌ Cursor не запущен');
    }
  }
} catch (error) {
  console.log(`   ⚠️ Не удалось проверить процессы: ${error.message}`);
}

// 6. Проверка кэша Cursor
console.log('\n6️⃣ ПРОВЕРКА КЭША CURSOR:');
const cursorPaths = [
  path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor'),
  path.join(os.homedir(), 'AppData', 'Local', 'Cursor'),
  path.join(os.homedir(), '.cursor'),
  path.join(os.tmpdir(), 'cursor')
];

cursorPaths.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    console.log(`   📁 Кэш найден: ${cachePath}`);
    try {
      const stats = fs.statSync(cachePath);
      console.log(`      Размер: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`      Изменен: ${stats.mtime}`);
    } catch (error) {
      console.log(`      ❌ Ошибка доступа: ${error.message}`);
    }
  } else {
    console.log(`   ❌ Кэш не найден: ${cachePath}`);
  }
});

// 7. Тестирование сервера
console.log('\n7️⃣ ТЕСТИРОВАНИЕ СЕРВЕРА:');
const serverPath = 'servers/src/testing/full-auto-qa-minimal.cjs';

try {
  // Проверяем синтаксис
  console.log('   🔍 Проверка синтаксиса...');
  execSync(`node -c "${serverPath}"`, { stdio: 'pipe' });
  console.log('   ✅ Синтаксис корректен');
  
  // Запускаем сервер для тестирования
  console.log('   🚀 Запуск сервера...');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 5000
  });
  
  let serverOutput = '';
  let serverError = '';
  
  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    serverError += data.toString();
  });
  
  server.on('close', (code) => {
    if (code === 0) {
      console.log('   ✅ Сервер завершился нормально');
    } else {
      console.log(`   ❌ Сервер завершился с кодом: ${code}`);
    }
    
    if (serverOutput) {
      console.log(`   📤 Вывод: ${serverOutput.trim()}`);
    }
    
    if (serverError) {
      console.log(`   📥 Ошибки: ${serverError.trim()}`);
    }
  });
  
  // Останавливаем сервер через 3 секунды
  setTimeout(() => {
    if (!server.killed) {
      server.kill();
      console.log('   ⏹️ Сервер остановлен');
    }
  }, 3000);
  
} catch (error) {
  console.log(`   ❌ Ошибка тестирования: ${error.message}`);
}

// 8. Проверка совместимости
console.log('\n8️⃣ ПРОВЕРКА СОВМЕСТИМОСТИ:');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

if (majorVersion >= 16) {
  console.log(`   ✅ Node.js ${nodeVersion} совместим с MCP`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} слишком старый для MCP`);
}

// 9. Известные проблемы
console.log('\n9️⃣ ИЗВЕСТНЫЕ ПРОБЛЕМЫ MCP:');
console.log('   🔴 Проблема 1: Кэш Cursor не очищается при перезапуске');
console.log('   🔴 Проблема 2: Неправильный порядок регистрации handlers');
console.log('   🔴 Проблема 3: Проблемы с путями в Windows');
console.log('   🔴 Проблема 4: Конфликты версий MCP SDK');
console.log('   🔴 Проблема 5: Проблемы с правами доступа к файлам');

// 10. Рекомендации
console.log('\n🔧 РЕКОМЕНДАЦИИ ДЛЯ ИСПРАВЛЕНИЯ:');
console.log('   1. Полностью удалите Cursor и переустановите');
console.log('   2. Очистите все кэши вручную');
console.log('   3. Проверьте права администратора');
console.log('   4. Обновите Node.js до последней версии');
console.log('   5. Перезагрузите компьютер после очистки кэша');
console.log('   6. Проверьте антивирус (может блокировать MCP)');
console.log('   7. Используйте абсолютные пути в конфигурации');
console.log('   8. Проверьте совместимость версий MCP SDK');

console.log('\n✅ ДИАГНОСТИКА ЗАВЕРШЕНА!'); 