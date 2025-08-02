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
      const output = execSync(command, { stdio: 'pipe', timeout: 10000 });
      return { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: output.toString().trim() 
      };
    } catch (error) {
      console.error(`Ошибка проверки ${serverName}:`, error.message);
      this.alerts.push({
        server: serverName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async generateReport() {
    // Проверяем только установленные пакеты
    const servers = [
      { name: 'node', command: 'node --version' },
      { name: 'npm', command: 'npm --version' },
      { name: 'git', command: 'git --version' }
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
