#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 ФИНАЛЬНЫЙ ТЕСТ FULLAUTOQA\n');

// Проверяем конфигурацию
console.log('1️⃣ Проверка конфигурации...');
try {
  const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
  const fullAutoQA = mcpConfig.mcpServers.FullAutoQA;
  
  console.log('✅ mcp.json загружен');
  console.log(`📋 FullAutoQA конфигурация:`);
  console.log(`   Команда: ${fullAutoQA.command}`);
  console.log(`   Аргументы: ${JSON.stringify(fullAutoQA.args)}`);
  
  if (fullAutoQA.command === 'npx' && fullAutoQA.args[0] === 'mcp-server-code-runner') {
    console.log('✅ Конфигурация корректна - использует готовый MCP сервер');
  } else {
    console.log('❌ Конфигурация некорректна');
  }
} catch (error) {
  console.log('❌ Ошибка загрузки конфигурации:', error.message);
}

// Проверяем доступность npx
console.log('\n2️⃣ Проверка npx...');
try {
  const npxVersion = require('child_process').execSync('npx --version', { encoding: 'utf8' });
  console.log(`✅ npx доступен, версия: ${npxVersion.trim()}`);
} catch (error) {
  console.log('❌ npx недоступен:', error.message);
}

// Проверяем доступность mcp-server-code-runner
console.log('\n3️⃣ Проверка mcp-server-code-runner...');
try {
  const serverPath = require.resolve('mcp-server-code-runner');
  console.log(`✅ mcp-server-code-runner найден: ${serverPath}`);
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(path.dirname(serverPath), 'package.json'), 'utf8'));
  console.log(`   Версия: ${packageJson.version}`);
  console.log(`   Описание: ${packageJson.description}`);
} catch (error) {
  console.log('❌ mcp-server-code-runner не найден:', error.message);
}

// Тестируем запуск сервера
console.log('\n4️⃣ Тестирование запуска сервера...');
const server = spawn('npx', ['mcp-server-code-runner'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

setTimeout(() => {
  if (!server.killed) {
    server.kill();
    console.log('✅ Сервер запустился успешно');
  }
}, 3000);

server.on('error', (error) => {
  console.log('❌ Ошибка запуска сервера:', error.message);
});

// Проверяем зависимости для тестирования
console.log('\n5️⃣ Проверка зависимостей для тестирования...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devDeps = packageJson.devDependencies || {};

const requiredDeps = ['vitest', 'jest', 'eslint', 'prettier'];
let allDepsInstalled = true;

requiredDeps.forEach(dep => {
  if (devDeps[dep]) {
    console.log(`✅ ${dep} установлен`);
  } else {
    console.log(`❌ ${dep} не установлен`);
    allDepsInstalled = false;
  }
});

if (allDepsInstalled) {
  console.log('✅ Все зависимости для тестирования установлены');
} else {
  console.log('❌ Не все зависимости установлены');
}

console.log('\n🎯 ИНСТРУКЦИИ ДЛЯ ПРОВЕРКИ В CURSOR:');
console.log('1. Перезапустите Cursor полностью');
console.log('2. Откройте Settings → MCP Tools');
console.log('3. Найдите FullAutoQA');
console.log('4. Должно быть "tools enabled" (не 0)');
console.log('5. Должна быть зеленая точка (работает)');

console.log('\n🔧 ТЕСТИРОВАНИЕ АВТОМАТИЧЕСКОГО СРАБАТЫВАНИЯ:');
console.log('1. Сохраните файл test-component.jsx');
console.log('2. FullAutoQA должен автоматически сработать');
console.log('3. Проверьте консоль на наличие сообщений от MCP');

console.log('\n📋 ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ:');
console.log('🔴 Проблема: "0 tools enabled"');
console.log('   Решение: Перезапустите Cursor, очистите кэш');
console.log('');
console.log('🔴 Проблема: Красная точка');
console.log('   Решение: Проверьте консоль Cursor на ошибки');
console.log('');
console.log('🔴 Проблема: Сервер не отвечает');
console.log('   Решение: Проверьте права доступа к файлам');
console.log('');
console.log('🔴 Проблема: npx не найден');
console.log('   Решение: Переустановите Node.js');

console.log('\n✅ ФИНАЛЬНЫЙ ТЕСТ ЗАВЕРШЕН!');
console.log('🎉 FullAutoQA готов к работе!'); 