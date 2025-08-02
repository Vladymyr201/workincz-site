#!/usr/bin/env node

/**
 * Скрипт для принудительного использования MCP серверов
 * Автоматически запускает MCP инструменты при определенных событиях
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MCPEnforcer {
  constructor() {
    this.mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
    this.activeServers = new Set();
  }

  // Принудительно использовать sequential-thinking
  async forceSequentialThinking(problem) {
    console.log('🔍 Запуск sequential-thinking для анализа проблемы...');
    
    // Здесь будет вызов MCP sequential-thinking
    const result = await this.callMCP('sequential-thinking', 'analyze', { problem });
    return result;
  }

  // Принудительно использовать FullAutoQA
  async forceFullAutoQA(filePath) {
    console.log('🧪 Запуск FullAutoQA для анализа файла...');
    
    const result = await this.callMCP('FullAutoQA', 'analyze_file', { file_path: filePath });
    return result;
  }

  // Принудительно использовать code-runner
  async forceCodeRunner(code, language = 'javascript') {
    console.log('⚡ Запуск code-runner для выполнения кода...');
    
    const result = await this.callMCP('code-runner', 'run-code', { 
      code, 
      languageId: language 
    });
    return result;
  }

  // Универсальный вызов MCP
  async callMCP(serverName, method, params) {
    try {
      const command = `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "${method}", "arguments": ${JSON.stringify(params)}}}' | npx ${this.mcpConfig.mcpServers[serverName].args[0]}`;
      
      const result = execSync(command, { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      console.error(`❌ Ошибка вызова MCP ${serverName}:`, error.message);
      return null;
    }
  }

  // Автоматический анализ при изменении файла
  async onFileChange(filePath) {
    console.log(`📁 Файл изменен: ${filePath}`);
    
    // Принудительно используем FullAutoQA
    await this.forceFullAutoQA(filePath);
    
    // Принудительно используем code-runner для тестирования
    const testCode = `console.log("Testing file: ${filePath}");`;
    await this.forceCodeRunner(testCode);
  }

  // Автоматический анализ при генерации кода
  async onCodeGeneration(code, language = 'javascript') {
    console.log('💻 Код сгенерирован, запускаем анализ...');
    
    // Принудительно используем code-runner
    await this.forceCodeRunner(code, language);
    
    // Принудительно используем FullAutoQA
    const tempFile = `temp-${Date.now()}.js`;
    fs.writeFileSync(tempFile, code);
    await this.forceFullAutoQA(tempFile);
    fs.unlinkSync(tempFile);
  }

  // Принудительный анализ проблемы
  async onProblemSolving(problem) {
    console.log('🤔 Анализ проблемы...');
    
    // Принудительно используем sequential-thinking
    await this.forceSequentialThinking(problem);
    
    // Принудительно используем memory для сохранения контекста
    await this.callMCP('memory', 'create_entities', {
      entities: [{
        name: 'problem-analysis',
        entityType: 'analysis',
        observations: [problem]
      }]
    });
  }
}

// Экспорт для использования
module.exports = MCPEnforcer;

// Если запущен напрямую
if (require.main === module) {
  const enforcer = new MCPEnforcer();
  
  // Пример использования
  enforcer.onProblemSolving('Как оптимизировать производительность React приложения?')
    .then(() => {
      console.log('✅ MCP анализ завершен');
    })
    .catch(console.error);
} 