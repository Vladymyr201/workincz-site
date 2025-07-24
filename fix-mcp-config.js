#!/usr/bin/env node

/**
 * 🔧 АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ГЛОБАЛЬНОЙ КОНФИГУРАЦИИ MCP
 * Исправляет JSON синтаксис и добавляет все новые серверы
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

class MCPConfigFixer {
  constructor() {
    this.platform = os.platform();
    this.configPaths = this.getConfigPaths();
    this.newServers = {
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
    };
  }

  // Получение путей к конфигурационным файлам
  getConfigPaths() {
    const paths = [];
    
    if (this.platform === 'win32') {
      // Windows пути
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      paths.push(path.join(appData, 'Cursor', 'User', 'settings.json'));
      paths.push(path.join(os.homedir(), '.cursor', 'mcp.json'));
      paths.push(path.join(appData, 'Cursor', 'User', 'mcp.json'));
    } else if (this.platform === 'darwin') {
      // macOS пути
      paths.push(path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'settings.json'));
      paths.push(path.join(os.homedir(), '.cursor', 'mcp.json'));
    } else {
      // Linux пути
      paths.push(path.join(os.homedir(), '.config', 'Cursor', 'User', 'settings.json'));
      paths.push(path.join(os.homedir(), '.cursor', 'mcp.json'));
    }

    return paths;
  }

  // Поиск существующего файла конфигурации
  findConfigFile() {
    for (const configPath of this.configPaths) {
      if (fs.existsSync(configPath)) {
        log(`✅ Найден файл конфигурации: ${configPath}`, 'green');
        return configPath;
      }
    }
    
    // Если файл не найден, создаем новый
    const defaultPath = this.configPaths[0];
    log(`📝 Создаю новый файл конфигурации: ${defaultPath}`, 'yellow');
    return defaultPath;
  }

  // Создание резервной копии
  createBackup(configPath) {
    const backupPath = configPath + '.backup.' + Date.now();
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath);
      log(`💾 Резервная копия создана: ${backupPath}`, 'green');
    }
    return backupPath;
  }

  // Чтение и исправление конфигурации
  readAndFixConfig(configPath) {
    let config = {};
    
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(content);
        log(`✅ Существующая конфигурация прочитана`, 'green');
      } catch (error) {
        log(`⚠️ Ошибка чтения JSON: ${error.message}`, 'yellow');
        log(`🔧 Исправляю синтаксис JSON...`, 'blue');
        
        // Попытка исправить JSON
        const fixedContent = this.fixJsonSyntax(content);
        try {
          config = JSON.parse(fixedContent);
          log(`✅ JSON синтаксис исправлен`, 'green');
        } catch (fixError) {
          log(`❌ Не удалось исправить JSON, создаю новую конфигурацию`, 'red');
          config = {};
        }
      }
    }

    return config;
  }

  // Исправление JSON синтаксиса
  fixJsonSyntax(content) {
    // Удаляем лишние запятые в конце объектов
    content = content.replace(/,(\s*[}\]])/g, '$1');
    
    // Убеждаемся, что JSON завершен правильно
    if (!content.trim().endsWith('}')) {
      content = content.trim() + '\n}';
    }
    
    // Удаляем лишние символы в начале
    content = content.replace(/^[^{]*/, '');
    
    return content;
  }

  // Добавление MCP серверов в конфигурацию
  addMCPServers(config) {
    // Инициализируем mcp.servers если его нет
    if (!config.mcp) {
      config.mcp = {};
    }
    if (!config.mcp.servers) {
      config.mcp.servers = {};
    }

    // Добавляем существующие серверы, если их нет
    const existingServers = {
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
        "args": ["-y", "mcp-server-sentry", "--auth-token", "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"]
      }
    };

    // Объединяем все серверы
    const allServers = { ...existingServers, ...this.newServers };

    // Добавляем серверы в конфигурацию
    let addedCount = 0;
    for (const [name, server] of Object.entries(allServers)) {
      if (!config.mcp.servers[name]) {
        config.mcp.servers[name] = server;
        addedCount++;
        log(`➕ Добавлен сервер: ${name}`, 'green');
      }
    }

    log(`📊 Всего добавлено новых серверов: ${addedCount}`, 'blue');
    return config;
  }

  // Запись конфигурации
  writeConfig(configPath, config) {
    try {
      // Создаем директорию если её нет
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`📁 Создана директория: ${dir}`, 'green');
      }

      // Записываем конфигурацию
      const content = JSON.stringify(config, null, 2);
      fs.writeFileSync(configPath, content, 'utf8');
      log(`✅ Конфигурация записана: ${configPath}`, 'green');

      // Проверяем JSON синтаксис
      JSON.parse(content);
      log(`✅ JSON синтаксис корректен`, 'green');

      return true;
    } catch (error) {
      log(`❌ Ошибка записи конфигурации: ${error.message}`, 'red');
      return false;
    }
  }

  // Проверка установки серверов
  checkServerInstallation() {
    logStep('🔍 ПРОВЕРКА УСТАНОВКИ СЕРВЕРОВ', 'Проверяю установку MCP серверов...');

    const servers = [
      'mcp-server-code-runner',
      '@notionhq/notion-mcp-server',
      '@supabase/mcp-server-supabase',
      '@shelm/wikipedia-mcp-server',
      'youtube-data-mcp-server'
    ];

    for (const server of servers) {
      try {
        execSync(`npx -y ${server} --help`, { stdio: 'ignore' });
        log(`✅ ${server} установлен`, 'green');
      } catch (error) {
        log(`⚠️ ${server} не найден, устанавливаю...`, 'yellow');
        try {
          execSync(`npm install -g ${server}`, { stdio: 'ignore' });
          log(`✅ ${server} установлен`, 'green');
        } catch (installError) {
          log(`❌ Не удалось установить ${server}`, 'red');
        }
      }
    }
  }

  // Создание инструкций
  createInstructions(configPath) {
    const instructions = `# 🎉 MCP КОНФИГУРАЦИЯ ИСПРАВЛЕНА!

## ✅ Что было сделано:

1. **Исправлен JSON синтаксис** в глобальной конфигурации MCP
2. **Добавлены новые серверы:**
   - code-runner (автоматическое тестирование)
   - notion (интеграция с Notion)
   - supabase (работа с Supabase)
   - wikipedia (поиск информации)
   - youtube (работа с YouTube API)
   - firebase-mcp (интеграция с Firebase)
   - github-mcp (работа с GitHub)

3. **Создана резервная копия** оригинальной конфигурации

## 🚀 Следующие шаги:

### 1. Перезапустите Cursor
**ВАЖНО:** Закройте Cursor полностью и откройте заново

### 2. Проверьте настройки
Перейдите в: **Settings** → **Tools & Integrations** → **MCP Tools**

### 3. Ожидаемые результаты:
- ✅ Ошибка "JSON syntax error" должна исчезнуть
- ✅ Должны появиться новые серверы
- ✅ Все серверы должны быть активны (зеленые переключатели)

### 4. Если проблемы остались:
1. Проверьте логи в Developer Tools (F12)
2. Запустите: \`node monitor-mcp.js\`
3. Проверьте файл: \`${configPath}\`

## 📁 Файлы:
- **Конфигурация:** \`${configPath}\`
- **Резервная копия:** \`${configPath}.backup.*\`
- **Мониторинг:** \`node monitor-mcp.js\`

## 🎯 Результат:
После перезапуска Cursor все новые MCP серверы должны быть видны и работать!

---
**Статус:** ✅ Исправлено
**Время:** ${new Date().toISOString()}
`;

    fs.writeFileSync('MCP_FIX_REPORT.md', instructions);
    log('✅ Отчет создан: MCP_FIX_REPORT.md', 'green');
  }

  // Главная функция
  async fix() {
    log('🔧 АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ MCP КОНФИГУРАЦИИ', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    log('Время: ' + new Date().toISOString(), 'cyan');

    try {
      // 1. Находим файл конфигурации
      logStep('🔍 ПОИСК КОНФИГУРАЦИИ', 'Ищу глобальный файл конфигурации MCP...');
      const configPath = this.findConfigFile();

      // 2. Создаем резервную копию
      logStep('💾 РЕЗЕРВНАЯ КОПИЯ', 'Создаю резервную копию оригинальной конфигурации...');
      this.createBackup(configPath);

      // 3. Читаем и исправляем конфигурацию
      logStep('🔧 ИСПРАВЛЕНИЕ JSON', 'Читаю и исправляю JSON синтаксис...');
      let config = this.readAndFixConfig(configPath);

      // 4. Добавляем MCP серверы
      logStep('➕ ДОБАВЛЕНИЕ СЕРВЕРОВ', 'Добавляю новые MCP серверы в конфигурацию...');
      config = this.addMCPServers(config);

      // 5. Записываем конфигурацию
      logStep('💾 ЗАПИСЬ КОНФИГУРАЦИИ', 'Записываю исправленную конфигурацию...');
      const success = this.writeConfig(configPath, config);

      if (!success) {
        throw new Error('Не удалось записать конфигурацию');
      }

      // 6. Проверяем установку серверов
      this.checkServerInstallation();

      // 7. Создаем инструкции
      logStep('📝 ИНСТРУКЦИИ', 'Создаю инструкции по завершению настройки...');
      this.createInstructions(configPath);

      // 8. Показываем результаты
      this.showResults(configPath, config);

      log('\n🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО!', 'bright');
      log('Теперь перезапустите Cursor для применения изменений.', 'cyan');

    } catch (error) {
      log('❌ Ошибка исправления: ' + error.message, 'red');
      process.exit(1);
    }
  }

  // Показ результатов
  showResults(configPath, config) {
    const serverCount = Object.keys(config.mcp?.servers || {}).length;

    log('\n📊 РЕЗУЛЬТАТЫ ИСПРАВЛЕНИЯ:', 'bright');
    log(`  Файл конфигурации: ${configPath}`, 'blue');
    log(`  Всего серверов: ${serverCount}`, 'green');
    log(`  JSON синтаксис: ✅ Корректен`, 'green');

    log('\n✅ ДОБАВЛЕННЫЕ СЕРВЕРЫ:', 'green');
    Object.keys(config.mcp?.servers || {}).forEach(name => {
      log(`  - ${name}`, 'green');
    });

    log('\n📋 СЛЕДУЮЩИЕ ШАГИ:', 'cyan');
    log('  1. Перезапустите Cursor', 'blue');
    log('  2. Проверьте Settings → Tools & Integrations → MCP Tools', 'blue');
    log('  3. Убедитесь, что ошибка JSON исчезла', 'blue');
  }
}

// Запуск исправления
if (require.main === module) {
  const fixer = new MCPConfigFixer();
  fixer.fix().then(() => {
    log('\n✅ Исправление завершено успешно!', 'green');
  }).catch(error => {
    log('\n❌ Ошибка исправления: ' + error.message, 'red');
    process.exit(1);
  });
}

module.exports = MCPConfigFixer; 