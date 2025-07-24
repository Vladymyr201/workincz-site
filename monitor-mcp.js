#!/usr/bin/env node

/**
 * 📊 МОНИТОРИНГ MCP СЕРВЕРОВ
 * Автоматический мониторинг и отчеты
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPMonitor {
  constructor() {
    this.reportPath = 'mcp-monitoring-report.json';
    this.alerts = [];
  }

  async checkServerHealth(serverName, command) {
    try {
      execSync(command, { stdio: 'pipe', timeout: 5000 });
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      this.alerts.push({
        server: serverName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async generateReport() {
    const servers = [
      { name: 'code-runner', command: 'npx mcp-server-code-runner --version' },
      { name: 'sentry', command: 'npx @sentry/mcp-server --version' },
      { name: 'playwright', command: 'npx @playwright/mcp --version' },
      { name: 'sequential-thinking', command: 'npx @modelcontextprotocol/server-sequential-thinking --version' }
    ];

    const report = {
      timestamp: new Date().toISOString(),
      project: 'WorkInCZ',
      servers: {},
      alerts: this.alerts,
      summary: {
        total: servers.length,
        healthy: 0,
        unhealthy: 0
      }
    };

    for (const server of servers) {
      const health = await this.checkServerHealth(server.name, server.command);
      report.servers[server.name] = health;
      
      if (health.status === 'healthy') {
        report.summary.healthy++;
      } else {
        report.summary.unhealthy++;
      }
    }

    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
    console.log('📊 Отчет мониторинга создан:', this.reportPath);
    
    if (this.alerts.length > 0) {
      console.log('⚠️ Обнаружены проблемы:', this.alerts.length);
      this.alerts.forEach(alert => {
        console.log(`  - ${alert.server}: ${alert.error}`);
      });
    }

    return report;
  }
}

// Запуск мониторинга
const monitor = new MCPMonitor();
monitor.generateReport().then(report => {
  console.log('✅ Мониторинг завершен');
  process.exit(report.summary.unhealthy > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Ошибка мониторинга:', error);
  process.exit(1);
});
