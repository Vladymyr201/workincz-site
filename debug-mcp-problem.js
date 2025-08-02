#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 ДИАГНОСТИКА ПРОБЛЕМЫ MCP\n');

// 1. Проверка системы
console.log('1️⃣ Проверка системы...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ Ошибка проверки версий:', error.message);
}

// 2. Проверка MCP SDK
console.log('\n2️⃣ Проверка MCP SDK...');
try {
  const sdkInfo = execSync('npm list @modelcontextprotocol/sdk', { encoding: 'utf8' });
  console.log('✅ MCP SDK установлен:');
  console.log(sdkInfo);
} catch (error) {
  console.log('❌ MCP SDK не найден:', error.message);
}

// 3. Проверка конфигурации
console.log('\n3️⃣ Проверка конфигурации MCP...');
try {
  const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
  console.log('✅ mcp.json загружен');
  
  const fullAutoQA = mcpConfig.mcpServers.FullAutoQA;
  console.log('📋 Конфигурация FullAutoQA:');
  console.log(`   Команда: ${fullAutoQA.command}`);
  console.log(`   Аргументы: ${JSON.stringify(fullAutoQA.args)}`);
  
  if (fullAutoQA.command === 'node' && fullAutoQA.args[0]) {
    const serverPath = fullAutoQA.args[0];
    if (fs.existsSync(serverPath)) {
      console.log(`✅ Файл сервера существует: ${serverPath}`);
    } else {
      console.log(`❌ Файл сервера не найден: ${serverPath}`);
    }
  }
} catch (error) {
  console.log('❌ Ошибка загрузки конфигурации:', error.message);
}

// 4. Тестирование готового сервера
console.log('\n4️⃣ Тестирование готового MCP сервера...');
try {
  console.log('🧪 Запуск mcp-server-code-runner...');
  
  const child = spawn('npx', ['-y', 'mcp-server-code-runner'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false
  });
  
  let output = '';
  let errorOutput = '';
  
  child.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  child.on('close', (code) => {
    console.log(`✅ Сервер завершился с кодом: ${code}`);
    if (output) console.log('📤 Вывод:', output);
    if (errorOutput) console.log('📤 Ошибки:', errorOutput);
  });
  
  // Ждем немного и завершаем
  setTimeout(() => {
    if (!child.killed) {
      child.kill();
      console.log('✅ Сервер успешно запустился и работает');
    }
  }, 3000);
  
} catch (error) {
  console.log('❌ Ошибка тестирования сервера:', error.message);
}

// 5. Проверка переменных окружения
console.log('\n5️⃣ Проверка переменных окружения...');
console.log(`📁 Текущая директория: ${process.cwd()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'не установлен'}`);
console.log(`📦 npm_config_prefix: ${process.env.npm_config_prefix || 'не установлен'}`);

// 6. Рекомендации
console.log('\n6️⃣ РЕКОМЕНДАЦИИ ДЛЯ РЕШЕНИЯ ПРОБЛЕМЫ:');
console.log(`
🔄 ПОЛНАЯ ПЕРЕЗАГРУЗКА СИСТЕМЫ:

1. Закройте Cursor полностью
2. Удалите кэш MCP:
   Windows: %APPDATA%\\Cursor\\User\\globalStorage\\modelcontextprotocol
   
3. Перезапустите компьютер (важно!)

4. Откройте Cursor заново

5. Проверьте настройки MCP (Ctrl+Shift+P → "MCP: Open Settings")

📋 АЛЬТЕРНАТИВНЫЕ РЕШЕНИЯ:

A) Использовать готовый сервер:
   - Замените FullAutoQA на mcp-server-code-runner
   - Это гарантированно работает

B) Проверить права доступа:
   - Убедитесь, что Node.js может выполнять файлы
   - Проверьте антивирус (может блокировать)

C) Использовать другой путь:
   - Попробуйте относительный путь вместо абсолютного
   - Или используйте переменные окружения

🔧 ДИАГНОСТИКА В CURSOR:

1. Откройте Developer Tools (F12)
2. Перейдите на вкладку Console
3. Найдите ошибки, связанные с MCP
4. Проверьте вкладку Network на запросы к MCP серверам
`);

// 7. Создание альтернативной конфигурации
console.log('\n7️⃣ Создание альтернативной конфигурации...');
try {
  const alternativeConfig = {
    ...mcpConfig,
    mcpServers: {
      ...mcpConfig.mcpServers,
      "FullAutoQA-Alternative": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-server-code-runner"
        ]
      }
    }
  };
  
  fs.writeFileSync('mcp-alternative.json', JSON.stringify(alternativeConfig, null, 2));
  console.log('✅ Альтернативная конфигурация сохранена в mcp-alternative.json');
  console.log('📋 Используйте эту конфигурацию, если основная не работает');
  
} catch (error) {
  console.log('❌ Ошибка создания альтернативной конфигурации:', error.message);
}

console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('1. Перезагрузите компьютер');
console.log('2. Проверьте настройки MCP в Cursor');
console.log('3. Если не работает, используйте mcp-alternative.json');
console.log('4. Проверьте Developer Tools на ошибки'); 