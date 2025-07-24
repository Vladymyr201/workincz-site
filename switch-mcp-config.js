#!/usr/bin/env node

/**
 * 🔄 ПЕРЕКЛЮЧАТЕЛЬ КОНФИГУРАЦИЙ MCP
 * Позволяет переключаться между полной (159 инструментов) и оптимизированной (40 инструментов) конфигурацией
 */

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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class MCPConfigSwitcher {
  constructor() {
    this.configPath = '.cursor/mcp.json';
    this.optimizedPath = '.cursor/mcp-optimized.json';
    this.backupPath = '.cursor/mcp-backup.json';
  }

  // Создание резервной копии
  createBackup() {
    if (fs.existsSync(this.configPath)) {
      fs.copyFileSync(this.configPath, this.backupPath);
      log('💾 Резервная копия создана', 'green');
    }
  }

  // Переключение на оптимизированную конфигурацию
  switchToOptimized() {
    log('🔄 Переключение на оптимизированную конфигурацию...', 'cyan');
    
    this.createBackup();
    
    if (fs.existsSync(this.optimizedPath)) {
      fs.copyFileSync(this.optimizedPath, this.configPath);
      log('✅ Переключено на оптимизированную конфигурацию (7 серверов, ~40 инструментов)', 'green');
      this.showOptimizedInfo();
    } else {
      log('❌ Файл оптимизированной конфигурации не найден', 'red');
    }
  }

  // Переключение на полную конфигурацию
  switchToFull() {
    log('🔄 Переключение на полную конфигурацию...', 'cyan');
    
    this.createBackup();
    
    const fullConfig = {
      "mcpServers": {
        "filesystem": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-filesystem", "D:/workincz-site"]
        },
        "sequential-thinking": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
        },
        "context7": {
          "command": "npx",
          "args": ["-y", "@upstash/context7-mcp"]
        },
        "playwright": {
          "command": "npx",
          "args": ["-y", "@playwright/mcp"]
        },
        "time": {
          "command": "python",
          "args": ["-m", "mcp_server_time"]
        },
        "memory": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-memory"]
        },
        "sentry": {
          "command": "npx",
          "args": ["-y", "@sentry/mcp-server", "--auth-token", "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"]
        },
        "code-runner": {
          "command": "npx",
          "args": ["-y", "mcp-server-code-runner"]
        },
        "notion": {
          "command": "npx",
          "args": ["-y", "@notionhq/notion-mcp-server"]
        },
        "supabase": {
          "command": "npx",
          "args": ["-y", "@supabase/mcp-server-supabase"]
        },
        "wikipedia": {
          "command": "npx",
          "args": ["-y", "@shelm/wikipedia-mcp-server"]
        },
        "youtube": {
          "command": "npx",
          "args": ["-y", "youtube-data-mcp-server"]
        },
        "firebase-mcp": {
          "command": "npx",
          "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
        },
        "github-mcp": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-github"],
          "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE",
            "GITHUB_API_URL": "https://api.github.com",
            "GH_HOST": "github.com"
          }
        }
      }
    };

    fs.writeFileSync(this.configPath, JSON.stringify(fullConfig, null, 2));
    log('✅ Переключено на полную конфигурацию (14 серверов, ~159 инструментов)', 'green');
    this.showFullInfo();
  }

  // Показать информацию об оптимизированной конфигурации
  showOptimizedInfo() {
    log('\n📊 ОПТИМИЗИРОВАННАЯ КОНФИГУРАЦИЯ:', 'bright');
    log('Серверов: 7', 'green');
    log('Инструментов: ~40', 'green');
    log('Производительность: ✅ Оптимальная', 'green');
    log('Совместимость: ✅ Полная', 'green');
    
    log('\n✅ ВКЛЮЧЕННЫЕ СЕРВЕРЫ:', 'green');
    const servers = [
      'filesystem (12 tools)',
      'sequential-thinking (1 tool)',
      'context7 (2 tools)',
      'playwright (24 tools)',
      'memory',
      'code-runner',
      'firebase-mcp'
    ];
    
    servers.forEach(server => {
      log(`  - ${server}`, 'green');
    });
  }

  // Показать информацию о полной конфигурации
  showFullInfo() {
    log('\n📊 ПОЛНАЯ КОНФИГУРАЦИЯ:', 'bright');
    log('Серверов: 14', 'yellow');
    log('Инструментов: ~159', 'yellow');
    log('Производительность: ⚠️ Может быть медленнее', 'yellow');
    log('Совместимость: ⚠️ Некоторые модели могут игнорировать лишние инструменты', 'yellow');
    
    log('\n✅ ВКЛЮЧЕННЫЕ СЕРВЕРЫ:', 'green');
    const servers = [
      'filesystem (12 tools)',
      'sequential-thinking (1 tool)',
      'context7 (2 tools)',
      'playwright (24 tools)',
      'time',
      'memory',
      'sentry',
      'code-runner',
      'notion',
      'supabase',
      'wikipedia',
      'youtube',
      'firebase-mcp',
      'github-mcp'
    ];
    
    servers.forEach(server => {
      log(`  - ${server}`, 'green');
    });
  }

  // Показать текущую конфигурацию
  showCurrent() {
    if (fs.existsSync(this.configPath)) {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const serverCount = Object.keys(config.mcpServers || {}).length;
      
      log('\n📊 ТЕКУЩАЯ КОНФИГУРАЦИЯ:', 'bright');
      log(`Серверов: ${serverCount}`, 'cyan');
      
      if (serverCount <= 7) {
        log('Тип: Оптимизированная (~40 инструментов)', 'green');
        log('Рекомендация: ✅ Оптимальная производительность', 'green');
      } else {
        log('Тип: Полная (~159 инструментов)', 'yellow');
        log('Рекомендация: ⚠️ Может влиять на производительность', 'yellow');
      }
    } else {
      log('❌ Файл конфигурации не найден', 'red');
    }
  }

  // Показать справку
  showHelp() {
    log('\n🔄 ПЕРЕКЛЮЧАТЕЛЬ КОНФИГУРАЦИЙ MCP', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    
    log('\n📋 КОМАНДЫ:', 'cyan');
    log('  node switch-mcp-config.js optimized  - Переключиться на оптимизированную (7 серверов)', 'blue');
    log('  node switch-mcp-config.js full       - Переключиться на полную (14 серверов)', 'blue');
    log('  node switch-mcp-config.js current    - Показать текущую конфигурацию', 'blue');
    log('  node switch-mcp-config.js help       - Показать эту справку', 'blue');
    
    log('\n⚠️ ВАЖНО:', 'yellow');
    log('  - После переключения перезапустите Cursor', 'yellow');
    log('  - Оптимизированная конфигурация рекомендуется для лучшей производительности', 'yellow');
    log('  - Полная конфигурация может вызывать предупреждения о лимите инструментов', 'yellow');
  }
}

// Главная функция
function main() {
  const switcher = new MCPConfigSwitcher();
  const command = process.argv[2] || 'help';

  switch (command) {
    case 'optimized':
      switcher.switchToOptimized();
      break;
    case 'full':
      switcher.switchToFull();
      break;
    case 'current':
      switcher.showCurrent();
      break;
    case 'help':
    default:
      switcher.showHelp();
      break;
  }
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = MCPConfigSwitcher; 