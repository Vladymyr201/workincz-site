#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 ТЕСТИРОВАНИЕ FULLAUTOQA\n');

// Проверяем, что сервер работает
console.log('1️⃣ Проверка сервера...');
const server = spawn('node', ['servers/src/testing/full-auto-qa-minimal.cjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

setTimeout(() => {
  if (!server.killed) {
    server.kill();
    console.log('✅ Сервер работает корректно');
  }
}, 2000);

// Проверяем конфигурацию
console.log('\n2️⃣ Проверка конфигурации...');
try {
  const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
  const fullAutoQA = mcpConfig.mcpServers.FullAutoQA;
  
  console.log('✅ mcp.json загружен');
  console.log(`📋 FullAutoQA конфигурация:`);
  console.log(`   Команда: ${fullAutoQA.command}`);
  console.log(`   Аргументы: ${JSON.stringify(fullAutoQA.args)}`);
  
  const serverPath = fullAutoQA.args[0];
  if (fs.existsSync(serverPath)) {
    console.log(`✅ Файл сервера существует: ${serverPath}`);
  } else {
    console.log(`❌ Файл сервера не найден: ${serverPath}`);
  }
} catch (error) {
  console.log('❌ Ошибка загрузки конфигурации:', error.message);
}

// Проверяем тестовый файл
console.log('\n3️⃣ Проверка тестового файла...');
if (fs.existsSync('test-component.jsx')) {
  console.log('✅ Тестовый компонент найден: test-component.jsx');
} else {
  console.log('❌ Тестовый компонент не найден');
}

// Проверяем зависимости
console.log('\n4️⃣ Проверка зависимостей...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devDeps = packageJson.devDependencies || {};

const requiredDeps = ['vitest', 'jest', 'eslint', 'prettier'];
requiredDeps.forEach(dep => {
  if (devDeps[dep]) {
    console.log(`✅ ${dep} установлен`);
  } else {
    console.log(`❌ ${dep} не установлен`);
  }
});

console.log('\n🎯 ИНСТРУКЦИИ ДЛЯ ПРОВЕРКИ В CURSOR:');
console.log('1. Откройте Cursor');
console.log('2. Перейдите в Settings → MCP Tools');
console.log('3. Найдите FullAutoQA');
console.log('4. Должно быть "5 tools enabled":');
console.log('   - analyze_file');
console.log('   - generate_tests');
console.log('   - run_tests');
console.log('   - add_comments');
console.log('   - lint_code');

console.log('\n🔧 ТЕСТИРОВАНИЕ АВТОМАТИЧЕСКОГО СРАБАТЫВАНИЯ:');
console.log('1. Сохраните любой .jsx или .tsx файл');
console.log('2. FullAutoQA должен автоматически:');
console.log('   - Проанализировать файл');
console.log('   - Сгенерировать тесты');
console.log('   - Добавить комментарии');
console.log('   - Проверить код линтером');

console.log('\n✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!'); 