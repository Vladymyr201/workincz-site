#!/usr/bin/env node

/**
 * 🧪 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ MCP СЕРВЕРОВ
 * Автоматическое тестирование всех серверов и функций
 */

const { execSync, spawn } = require('child_process');
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

function logTest(testName, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${testName}: ${status}${details ? ' - ' + details : ''}`, color);
}

class MCPTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  async runTest(testName, testFunction) {
    this.results.total++;
    try {
      const result = await testFunction();
      if (result.status === 'PASS') {
        this.results.passed++;
        logTest(testName, 'PASS', result.details);
      } else if (result.status === 'WARN') {
        this.results.warnings++;
        logTest(testName, 'WARN', result.details);
      } else {
        this.results.failed++;
        logTest(testName, 'FAIL', result.details);
      }
      this.results.details.push({ test: testName, ...result });
    } catch (error) {
      this.results.failed++;
      logTest(testName, 'FAIL', error.message);
      this.results.details.push({ test: testName, status: 'FAIL', error: error.message });
    }
  }

  // Тест 1: Проверка установки серверов
  async testServerInstallation() {
    const servers = [
      'mcp-server-code-runner',
      '@notionhq/notion-mcp-server',
      '@supabase/mcp-server-supabase',
      '@shelm/wikipedia-mcp-server',
      'youtube-data-mcp-server',
      '@modelcontextprotocol/server-sequential-thinking',
      '@upstash/context7-mcp',
      '@playwright/mcp',
      '@modelcontextprotocol/server-memory'
    ];

    let installed = 0;
    for (const server of servers) {
      try {
        execSync(`npm list -g ${server}`, { stdio: 'pipe' });
        installed++;
      } catch (error) {
        // Сервер не установлен
      }
    }

    const percentage = (installed / servers.length) * 100;
    if (percentage >= 90) {
      return { status: 'PASS', details: `${installed}/${servers.length} серверов установлено` };
    } else if (percentage >= 70) {
      return { status: 'WARN', details: `${installed}/${servers.length} серверов установлено` };
    } else {
      return { status: 'FAIL', details: `${installed}/${servers.length} серверов установлено` };
    }
  }

  // Тест 2: Проверка конфигурации mcp.json
  async testMCPConfig() {
    try {
      const config = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
      const serverCount = Object.keys(config.mcpServers || {}).length;
      const hasRules = config.rules && config.rules.length > 0;
      const hasChecklist = config.codeReviewChecklist && config.codeReviewChecklist.length > 0;

      if (serverCount >= 10 && hasRules && hasChecklist) {
        return { status: 'PASS', details: `${serverCount} серверов, ${config.rules.length} правил, ${config.codeReviewChecklist.length} проверок` };
      } else {
        return { status: 'WARN', details: `Конфигурация неполная: ${serverCount} серверов` };
      }
    } catch (error) {
      return { status: 'FAIL', details: 'Файл mcp.json не найден или поврежден' };
    }
  }

  // Тест 3: Проверка работоспособности основных серверов
  async testServerFunctionality() {
    const servers = [
      { name: 'code-runner', command: 'npx mcp-server-code-runner --help' },
      { name: 'playwright', command: 'npx @playwright/mcp --help' },
      { name: 'sequential-thinking', command: 'npx @modelcontextprotocol/server-sequential-thinking --help' }
    ];

    let working = 0;
    for (const server of servers) {
      try {
        execSync(server.command, { stdio: 'pipe', timeout: 5000 });
        working++;
      } catch (error) {
        // Сервер не работает
      }
    }

    const percentage = (working / servers.length) * 100;
    if (percentage >= 80) {
      return { status: 'PASS', details: `${working}/${servers.length} серверов работают` };
    } else if (percentage >= 50) {
      return { status: 'WARN', details: `${working}/${servers.length} серверов работают` };
    } else {
      return { status: 'FAIL', details: `${working}/${servers.length} серверов работают` };
    }
  }

  // Тест 4: Проверка GitHub Actions
  async testGitHubActions() {
    const workflowsDir = '.github/workflows';
    if (fs.existsSync(workflowsDir)) {
      const files = fs.readdirSync(workflowsDir);
      const mcpWorkflow = files.find(file => file.includes('mcp'));
      if (mcpWorkflow) {
        return { status: 'PASS', details: 'GitHub Actions workflow найден' };
      } else {
        return { status: 'WARN', details: 'GitHub Actions директория существует, но MCP workflow не найден' };
      }
    } else {
      return { status: 'FAIL', details: 'GitHub Actions директория не найдена' };
    }
  }

  // Тест 5: Проверка системы мониторинга
  async testMonitoringSystem() {
    if (fs.existsSync('monitor-mcp.js')) {
      try {
        // Проверяем, что скрипт выполняется
        execSync('node monitor-mcp.js --test', { stdio: 'pipe', timeout: 10000 });
        return { status: 'PASS', details: 'Система мониторинга работает' };
      } catch (error) {
        return { status: 'WARN', details: 'Скрипт мониторинга найден, но не прошел тест' };
      }
    } else {
      return { status: 'FAIL', details: 'Скрипт мониторинга не найден' };
    }
  }

  // Тест 6: Проверка автоматических правил
  async testAutomationRules() {
    try {
      const config = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
      const rules = config.rules || [];
      
      const hasCodeReview = rules.some(rule => rule.name === 'auto-review');
      const hasPerformance = rules.some(rule => rule.name === 'performance-check');
      const hasSecurity = rules.some(rule => rule.name === 'security-scan');

      if (hasCodeReview && hasPerformance && hasSecurity) {
        return { status: 'PASS', details: 'Все автоматические правила настроены' };
      } else if (rules.length > 0) {
        return { status: 'WARN', details: `${rules.length} правил настроено, но не все типы` };
      } else {
        return { status: 'FAIL', details: 'Автоматические правила не настроены' };
      }
    } catch (error) {
      return { status: 'FAIL', details: 'Ошибка чтения конфигурации' };
    }
  }

  // Тест 7: Проверка интеграции с проектом
  async testProjectIntegration() {
    const requiredFiles = [
      'package.json',
      'firebase.json',
      'public/index.html',
      'docs/PROJECT_KNOWLEDGE.md'
    ];

    let found = 0;
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        found++;
      }
    }

    const percentage = (found / requiredFiles.length) * 100;
    if (percentage >= 90) {
      return { status: 'PASS', details: `${found}/${requiredFiles.length} файлов проекта найдены` };
    } else if (percentage >= 70) {
      return { status: 'WARN', details: `${found}/${requiredFiles.length} файлов проекта найдены` };
    } else {
      return { status: 'FAIL', details: `${found}/${requiredFiles.length} файлов проекта найдены` };
    }
  }

  // Запуск всех тестов
  async runAllTests() {
    log('\n🧪 ЗАПУСК КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ MCP СЕРВЕРОВ', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    log('Время: ' + new Date().toISOString(), 'cyan');

    await this.runTest('Установка серверов', () => this.testServerInstallation());
    await this.runTest('Конфигурация mcp.json', () => this.testMCPConfig());
    await this.runTest('Работоспособность серверов', () => this.testServerFunctionality());
    await this.runTest('GitHub Actions', () => this.testGitHubActions());
    await this.runTest('Система мониторинга', () => this.testMonitoringSystem());
    await this.runTest('Автоматические правила', () => this.testAutomationRules());
    await this.runTest('Интеграция с проектом', () => this.testProjectIntegration());

    // Генерация отчета
    this.generateReport();
  }

  // Генерация отчета
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'WorkInCZ',
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(1)
      },
      details: this.results.details,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync('mcp-test-report.json', JSON.stringify(report, null, 2));

    log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:', 'bright');
    log(`  Всего тестов: ${this.results.total}`, 'blue');
    log(`  Успешно: ${this.results.passed}`, 'green');
    log(`  Предупреждения: ${this.results.warnings}`, 'yellow');
    log(`  Ошибки: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
    log(`  Успешность: ${report.summary.successRate}%`, report.summary.successRate >= 80 ? 'green' : 'yellow');

    if (this.results.failed > 0) {
      log('\n❌ ПРОБЛЕМЫ:', 'red');
      this.results.details
        .filter(detail => detail.status === 'FAIL')
        .forEach(detail => {
          log(`  - ${detail.test}: ${detail.details || detail.error}`, 'red');
        });
    }

    if (this.results.warnings > 0) {
      log('\n⚠️ ПРЕДУПРЕЖДЕНИЯ:', 'yellow');
      this.results.details
        .filter(detail => detail.status === 'WARN')
        .forEach(detail => {
          log(`  - ${detail.test}: ${detail.details}`, 'yellow');
        });
    }

    log('\n✅ РЕКОМЕНДАЦИИ:', 'cyan');
    report.recommendations.forEach(rec => {
      log(`  - ${rec}`, 'blue');
    });

    log('\n📄 Отчет сохранен в mcp-test-report.json', 'green');
  }

  // Генерация рекомендаций
  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push('Исправить критические ошибки перед использованием');
    }

    if (this.results.warnings > 0) {
      recommendations.push('Рассмотреть улучшение предупреждений');
    }

    if (this.results.passed / this.results.total >= 0.8) {
      recommendations.push('Система готова к использованию');
    } else {
      recommendations.push('Требуется дополнительная настройка');
    }

    recommendations.push('Регулярно запускать мониторинг: node monitor-mcp.js');
    recommendations.push('Настроить уведомления о проблемах');
    recommendations.push('Обновлять серверы ежемесячно');

    return recommendations;
  }
}

// Запуск тестирования
if (require.main === module) {
  const tester = new MCPTester();
  tester.runAllTests().then(() => {
    const exitCode = tester.results.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }).catch(error => {
    console.error('❌ Ошибка тестирования:', error);
    process.exit(1);
  });
}

module.exports = MCPTester; 