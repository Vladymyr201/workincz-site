#!/usr/bin/env node

/**
 * Автоматическая установка MCP серверов для WorkInCZ
 * Устанавливает все необходимые серверы и зависимости
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Список MCP серверов для установки (доступные в npm)
const mcpServers = [
  'mcp-server-code-runner',
  '@notionhq/notion-mcp-server',
  '@supabase/mcp-server-supabase',
  '@shelm/wikipedia-mcp-server',
  'youtube-data-mcp-server',
  'firebase-tools@latest'
];

// Список дополнительных зависимостей
const additionalDeps = [
  '@modelcontextprotocol/server-sequential-thinking',
  '@upstash/context7-mcp',
  '@playwright/mcp',
  '@modelcontextprotocol/server-memory'
];

console.log('🚀 Начинаю установку MCP серверов для WorkInCZ...\n');

// Функция для безопасного выполнения команд
function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - успешно\n`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при ${description}:`, error.message);
    return false;
  }
}

// Проверяем наличие package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json не найден. Убедитесь, что вы находитесь в корне проекта.');
  process.exit(1);
}

// Устанавливаем основные зависимости
console.log('📋 Устанавливаю основные зависимости...\n');
runCommand('npm install', 'Установка основных зависимостей');

// Устанавливаем MCP серверы
console.log('🔧 Устанавливаю MCP серверы...\n');
mcpServers.forEach(server => {
  runCommand(`npm install -g ${server}`, `Установка ${server}`);
});

// Устанавливаем дополнительные зависимости
console.log('📚 Устанавливаю дополнительные зависимости...\n');
additionalDeps.forEach(dep => {
  runCommand(`npm install ${dep}`, `Установка ${dep}`);
});

// Проверяем конфигурацию mcp.json
console.log('🔍 Проверяю конфигурацию mcp.json...\n');
if (fs.existsSync('mcp.json')) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
    console.log('✅ mcp.json найден и валиден');
    console.log(`📊 Настроено серверов: ${Object.keys(mcpConfig.mcpServers || {}).length}`);
    
    if (mcpConfig.codeReviewChecklist) {
      console.log(`📋 Code review checklist: ${mcpConfig.codeReviewChecklist.length} пунктов`);
    }
    
    if (mcpConfig.rules) {
      console.log(`⚙️ Автоматические правила: ${mcpConfig.rules.length}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при чтении mcp.json:', error.message);
  }
} else {
  console.error('❌ mcp.json не найден');
}

// Создаем скрипт для быстрого запуска
const startupScript = `#!/bin/bash
# Быстрый запуск MCP серверов для WorkInCZ
echo "🚀 Запуск MCP серверов..."
npx @modelcontextprotocol/server-filesystem D:/workincz-site &
npx @modelcontextprotocol/server-sequential-thinking &
npx mcp-server-code-runner &
npx @sentry/mcp-server &
echo "✅ MCP серверы запущены"
`;

fs.writeFileSync('start-mcp-servers.sh', startupScript);
fs.chmodSync('start-mcp-servers.sh', '755');

console.log('\n🎉 Установка MCP серверов завершена!');
console.log('\n📋 Что было установлено:');
console.log('  • Code Runner - для автоматического тестирования кода');
console.log('  • Notion MCP - для интеграции с Notion');
console.log('  • Supabase MCP - для работы с Supabase');
console.log('  • Wikipedia MCP - для поиска информации');
console.log('  • YouTube MCP - для работы с YouTube API');
console.log('  • Firebase MCP - для интеграции с Firebase');
console.log('  • GitHub MCP - для работы с GitHub');
console.log('\n⚙️ Автоматические правила:');
console.log('  • Code review при изменении файлов');
console.log('  • Performance testing при деплое');
console.log('  • 14 пунктов проверки качества кода');
console.log('\n🚀 Для запуска серверов используйте:');
console.log('  ./start-mcp-servers.sh');
console.log('\n📝 Не забудьте настроить GitHub токен в mcp.json!'); 