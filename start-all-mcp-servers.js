#!/usr/bin/env node

/**
 * 🚀 ЗАПУСК ВСЕХ MCP СЕРВЕРОВ ДЛЯ CURSOR
 * Запускает все серверы и интегрирует их с Cursor
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}${step}${colors.reset}`, 'bright');
  log(message);
}

class MCPCursorIntegrator {
  constructor() {
    this.servers = [
      {
        name: 'code-runner',
        command: 'npx',
        args: ['-y', 'mcp-server-code-runner'],
        description: 'Автоматическое тестирование кода'
      },
      {
        name: 'sentry',
        command: 'npx',
        args: ['-y', '@sentry/mcp-server'],
        description: 'Мониторинг ошибок'
      },
      {
        name: 'playwright',
        command: 'npx',
        args: ['-y', '@playwright/mcp'],
        description: 'Автоматизированное тестирование'
      },
      {
        name: 'sequential-thinking',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
        description: 'Последовательное мышление'
      },
      {
        name: 'notion',
        command: 'npx',
        args: ['-y', '@notionhq/notion-mcp-server'],
        description: 'Интеграция с Notion'
      },
      {
        name: 'supabase',
        command: 'npx',
        args: ['-y', '@supabase/mcp-server-supabase'],
        description: 'Работа с Supabase'
      },
      {
        name: 'wikipedia',
        command: 'npx',
        args: ['-y', '@shelm/wikipedia-mcp-server'],
        description: 'Поиск информации'
      },
      {
        name: 'youtube',
        command: 'npx',
        args: ['-y', 'youtube-data-mcp-server'],
        description: 'Работа с YouTube API'
      }
    ];
    
    this.runningServers = new Map();
  }

  // Запуск отдельного сервера
  async startServer(server) {
    return new Promise((resolve, reject) => {
      log(`🚀 Запускаю ${server.name}...`, 'blue');
      
      const process = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
        log(`📤 ${server.name}: ${data.toString().trim()}`, 'green');
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
        log(`⚠️ ${server.name}: ${data.toString().trim()}`, 'yellow');
      });

      process.on('error', (error) => {
        log(`❌ Ошибка запуска ${server.name}: ${error.message}`, 'red');
        reject(error);
      });

      process.on('close', (code) => {
        if (code === 0) {
          log(`✅ ${server.name} завершился успешно`, 'green');
          resolve({ server, output, errorOutput });
        } else {
          log(`❌ ${server.name} завершился с кодом ${code}`, 'red');
          reject(new Error(`${server.name} завершился с кодом ${code}`));
        }
      });

      // Сохраняем процесс для возможности остановки
      this.runningServers.set(server.name, process);

      // Даем серверу время на инициализацию
      setTimeout(() => {
        log(`✅ ${server.name} запущен и готов к работе`, 'green');
        resolve({ server, output, errorOutput });
      }, 3000);
    });
  }

  // Запуск всех серверов
  async startAllServers() {
    logStep('🚀 ЗАПУСК ВСЕХ MCP СЕРВЕРОВ', 'Запускаю все серверы для интеграции с Cursor...');

    const results = [];
    
    for (const server of this.servers) {
      try {
        const result = await this.startServer(server);
        results.push({ ...result, status: 'success' });
      } catch (error) {
        log(`❌ Не удалось запустить ${server.name}: ${error.message}`, 'red');
        results.push({ server, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  // Создание конфигурации для Cursor
  async createCursorConfig() {
    logStep('⚙️ СОЗДАНИЕ КОНФИГУРАЦИИ CURSOR', 'Создаю конфигурацию для интеграции с Cursor...');

    const cursorConfig = {
      mcpServers: {}
    };

    // Добавляем все серверы в конфигурацию
    this.servers.forEach(server => {
      cursorConfig.mcpServers[server.name] = {
        command: server.command,
        args: server.args,
        description: server.description
      };
    });

    // Сохраняем конфигурацию
    fs.writeFileSync('cursor-mcp-config.json', JSON.stringify(cursorConfig, null, 2));
    log('✅ Конфигурация Cursor создана: cursor-mcp-config.json', 'green');

    return cursorConfig;
  }

  // Создание инструкций для пользователя
  createInstructions() {
    const instructions = `# 🔧 ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ MCP СЕРВЕРОВ С CURSOR

## 📋 Что нужно сделать:

### 1. Перезапустите Cursor
После запуска всех серверов, **перезапустите Cursor** для обнаружения новых MCP серверов.

### 2. Проверьте настройки MCP
В Cursor перейдите в:
- **Settings** → **Tools & Integrations** → **MCP Tools**

### 3. Ожидаемые серверы:
- ✅ **code-runner** - Автоматическое тестирование кода
- ✅ **sentry** - Мониторинг ошибок  
- ✅ **playwright** - Автоматизированное тестирование
- ✅ **sequential-thinking** - Последовательное мышление
- ✅ **notion** - Интеграция с Notion
- ✅ **supabase** - Работа с Supabase
- ✅ **wikipedia** - Поиск информации
- ✅ **youtube** - Работа с YouTube API

### 4. Если серверы не видны:
1. Убедитесь, что все серверы запущены
2. Перезапустите Cursor
3. Проверьте логи в консоли
4. Запустите: \`node monitor-mcp.js\`

### 5. Команды управления:
\`\`\`bash
# Запуск всех серверов
node start-all-mcp-servers.js

# Мониторинг
node monitor-mcp.js

# Тестирование
node test-mcp-servers.js
\`\`\`

## 🎯 Результат:
После выполнения всех шагов в Cursor должны появиться все новые MCP серверы с их инструментами.
`;

    fs.writeFileSync('CURSOR_INTEGRATION_INSTRUCTIONS.md', instructions);
    log('✅ Инструкции созданы: CURSOR_INTEGRATION_INSTRUCTIONS.md', 'green');
  }

  // Главная функция
  async integrate() {
    log('🚀 ИНТЕГРАЦИЯ MCP СЕРВЕРОВ С CURSOR', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    log('Время: ' + new Date().toISOString(), 'cyan');

    try {
      // 1. Запускаем все серверы
      const results = await this.startAllServers();

      // 2. Создаем конфигурацию для Cursor
      await this.createCursorConfig();

      // 3. Создаем инструкции
      this.createInstructions();

      // 4. Показываем результаты
      this.showResults(results);

      log('\n🎉 ИНТЕГРАЦИЯ ЗАВЕРШЕНА!', 'bright');
      log('Теперь перезапустите Cursor для обнаружения новых серверов.', 'cyan');

    } catch (error) {
      log('❌ Ошибка интеграции: ' + error.message, 'red');
      process.exit(1);
    }
  }

  // Показ результатов
  showResults(results) {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    log('\n📊 РЕЗУЛЬТАТЫ ЗАПУСКА:', 'bright');
    log(`  Всего серверов: ${results.length}`, 'blue');
    log(`  Успешно запущено: ${successful}`, 'green');
    log(`  Ошибок: ${failed}`, failed > 0 ? 'red' : 'green');

    if (failed > 0) {
      log('\n❌ СЕРВЕРЫ С ОШИБКАМИ:', 'red');
      results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          log(`  - ${r.server.name}: ${r.error}`, 'red');
        });
    }

    log('\n✅ УСПЕШНО ЗАПУЩЕННЫЕ СЕРВЕРЫ:', 'green');
    results
      .filter(r => r.status === 'success')
      .forEach(r => {
        log(`  - ${r.server.name}: ${r.server.description}`, 'green');
      });

    log('\n📋 СЛЕДУЮЩИЕ ШАГИ:', 'cyan');
    log('  1. Перезапустите Cursor', 'blue');
    log('  2. Проверьте Settings → Tools & Integrations → MCP Tools', 'blue');
    log('  3. Убедитесь, что все серверы видны', 'blue');
  }
}

// Запуск интеграции
if (require.main === module) {
  const integrator = new MCPCursorIntegrator();
  integrator.integrate().then(() => {
    log('\n✅ Интеграция завершена успешно!', 'green');
  }).catch(error => {
    log('\n❌ Ошибка интеграции: ' + error.message, 'red');
    process.exit(1);
  });
}

module.exports = MCPCursorIntegrator; 