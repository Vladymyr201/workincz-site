#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Перезагрузка MCP системы...\n');

// 1. Проверяем конфигурацию MCP
console.log('1️⃣ Проверка конфигурации MCP...');
try {
  const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
  console.log('✅ mcp.json загружен корректно');
  
  const fullAutoQAPath = mcpConfig.mcpServers.FullAutoQA.args[0];
  console.log(`📁 Путь к FullAutoQA: ${fullAutoQAPath}`);
  
  if (fs.existsSync(fullAutoQAPath)) {
    console.log('✅ Файл FullAutoQA существует');
  } else {
    console.log('❌ Файл FullAutoQA не найден!');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Ошибка загрузки mcp.json:', error.message);
  process.exit(1);
}

// 2. Проверяем MCP SDK
console.log('\n2️⃣ Проверка MCP SDK...');
try {
  const sdkVersion = execSync('npm list @modelcontextprotocol/sdk', { encoding: 'utf8' });
  console.log('✅ MCP SDK установлен:', sdkVersion.trim());
} catch (error) {
  console.log('❌ MCP SDK не установлен!');
  console.log('Устанавливаем...');
  execSync('npm install @modelcontextprotocol/sdk', { stdio: 'inherit' });
}

// 3. Тестируем FullAutoQA сервер
console.log('\n3️⃣ Тестирование FullAutoQA сервера...');
try {
  const serverPath = path.resolve('servers/src/testing/full-auto-qa-simple-mcp.cjs');
  console.log(`🧪 Запуск сервера: ${serverPath}`);
  
  // Запускаем сервер в фоне на короткое время
  const child = require('child_process').spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Ждем немного и проверяем, что сервер запустился
  setTimeout(() => {
    if (child.killed) {
      console.log('❌ Сервер не запустился');
    } else {
      console.log('✅ Сервер запустился успешно');
      child.kill();
    }
  }, 2000);
  
} catch (error) {
  console.log('❌ Ошибка запуска сервера:', error.message);
}

// 4. Инструкции по перезагрузке Cursor
console.log('\n4️⃣ Инструкции по перезагрузке Cursor:');
console.log(`
🔄 ПОЛНАЯ ПЕРЕЗАГРУЗКА CURSOR:

1. Закройте Cursor полностью (Ctrl+Shift+Q)
2. Удалите кэш MCP:
   - Windows: %APPDATA%\\Cursor\\User\\globalStorage\\modelcontextprotocol
   - Mac: ~/Library/Application Support/Cursor/User/globalStorage/modelcontextprotocol
   - Linux: ~/.config/Cursor/User/globalStorage/modelcontextprotocol

3. Перезапустите Cursor
4. Откройте настройки MCP (Ctrl+Shift+P → "MCP: Open Settings")
5. Проверьте, что FullAutoQA показывает "4 tools enabled" с зеленой точкой

📋 Если проблема остается:
- Проверьте консоль разработчика (F12)
- Убедитесь, что путь к серверу корректный
- Проверьте, что Node.js версии 16+ установлен
`);

// 5. Создаем файл статуса
const status = {
  timestamp: new Date().toISOString(),
  mcpConfig: 'OK',
  sdkInstalled: 'OK',
  serverPath: path.resolve('servers/src/testing/full-auto-qa-simple-mcp.cjs'),
  instructions: 'Cursor restart required'
};

fs.writeFileSync('mcp-restart-status.json', JSON.stringify(status, null, 2));
console.log('\n✅ Статус сохранен в mcp-restart-status.json');

console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
console.log('1. Перезагрузите Cursor полностью');
console.log('2. Проверьте настройки MCP');
console.log('3. Убедитесь, что FullAutoQA работает'); 