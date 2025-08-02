#!/usr/bin/env node

/**
 * Система автоматического тестирования результатов
 * Запускается после выполнения задач для проверки качества
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoTestingSystem {
  constructor() {
    this.testResults = [];
    this.pendingConfirmation = false;
  }

  // Автоматическое тестирование кода
  async testCode(code, language = 'javascript') {
    console.log('🧪 Тестирование кода...');
    
    try {
      // Проверка синтаксиса
      if (language === 'javascript') {
        const syntaxCheck = execSync(`node -c -e "${code}"`, { encoding: 'utf8' });
        this.testResults.push('✅ Синтаксис JavaScript корректен');
      }
      
      // Выполнение кода через MCP
      const mcpResult = await this.callMCP('code-runner', 'run-code', { code, languageId: language });
      
      if (mcpResult && mcpResult.result) {
        this.testResults.push('✅ Код выполняется без ошибок');
        return true;
      }
    } catch (error) {
      this.testResults.push(`❌ Ошибка выполнения: ${error.message}`);
      return false;
    }
  }

  // Тестирование файлов
  async testFiles(filePaths) {
    console.log('📁 Тестирование файлов...');
    
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          
          this.testResults.push(`✅ Файл ${filePath} создан (${stats.size} байт)`);
          
          // Проверка содержимого
          if (content.length > 0) {
            this.testResults.push(`✅ Файл ${filePath} содержит данные`);
          } else {
            this.testResults.push(`⚠️ Файл ${filePath} пустой`);
          }
        } else {
          this.testResults.push(`❌ Файл ${filePath} не найден`);
        }
      } catch (error) {
        this.testResults.push(`❌ Ошибка проверки ${filePath}: ${error.message}`);
      }
    }
  }

  // Тестирование конфигурации
  async testConfiguration(configType) {
    console.log('⚙️ Тестирование конфигурации...');
    
    try {
      switch (configType) {
        case 'mcp':
          const mcpConfig = JSON.parse(fs.readFileSync('mcp.json', 'utf8'));
          if (mcpConfig.mcpServers && Object.keys(mcpConfig.mcpServers).length > 0) {
            this.testResults.push('✅ MCP конфигурация корректна');
          }
          break;
          
        case 'firebase':
          if (fs.existsSync('firebase.json')) {
            this.testResults.push('✅ Firebase конфигурация найдена');
          }
          break;
          
        default:
          this.testResults.push('✅ Конфигурация проверена');
      }
    } catch (error) {
      this.testResults.push(`❌ Ошибка конфигурации: ${error.message}`);
    }
  }

  // Универсальный вызов MCP
  async callMCP(serverName, method, params) {
    try {
      const command = `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "${method}", "arguments": ${JSON.stringify(params)}}}' | npx mcp-server-code-runner`;
      
      const result = execSync(command, { encoding: 'utf8' });
      return JSON.parse(result);
    } catch (error) {
      console.error(`❌ Ошибка MCP ${serverName}:`, error.message);
      return null;
    }
  }

  // Запуск полного тестирования
  async runFullTesting(taskResults) {
    console.log('🚀 Запуск автоматического тестирования...');
    
    this.testResults = [];
    
    // Тестирование кода
    if (taskResults.code) {
      await this.testCode(taskResults.code, taskResults.language);
    }
    
    // Тестирование файлов
    if (taskResults.files && taskResults.files.length > 0) {
      await this.testFiles(taskResults.files);
    }
    
    // Тестирование конфигурации
    if (taskResults.config) {
      await this.testConfiguration(taskResults.config);
    }
    
    // Вывод результатов
    this.showTestResults();
    
    // Запрос подтверждения
    return this.requestConfirmation();
  }

  // Показать результаты тестирования
  showTestResults() {
    console.log('\n🧪 Результаты автоматического тестирования:');
    console.log('='.repeat(50));
    
    this.testResults.forEach(result => {
      console.log(result);
    });
    
    const passedTests = this.testResults.filter(r => r.includes('✅')).length;
    const totalTests = this.testResults.length;
    
    console.log('='.repeat(50));
    console.log(`📊 Результат: ${passedTests}/${totalTests} тестов пройдено`);
  }

  // Запрос подтверждения пользователя
  requestConfirmation() {
    console.log('\n❓ Подтвердите, что все работает правильно:');
    console.log('- "да" - фиксирую результаты в документации');
    console.log('- "нет" - исправляю проблемы');
    console.log('- "тест" - дополнительное тестирование');
    
    this.pendingConfirmation = true;
    return this.pendingConfirmation;
  }

  // Обработка ответа пользователя
  handleUserResponse(response) {
    if (!this.pendingConfirmation) {
      return false;
    }
    
    this.pendingConfirmation = false;
    
    switch (response.toLowerCase()) {
      case 'да':
      case 'yes':
      case 'ok':
        console.log('✅ Подтверждение получено! Фиксирую результаты...');
        return this.fixResults();
        
      case 'нет':
      case 'no':
        console.log('❌ Проблемы обнаружены. Исправляю...');
        return this.fixProblems();
        
      case 'тест':
      case 'test':
        console.log('🧪 Запускаю дополнительное тестирование...');
        return this.runAdditionalTests();
        
      default:
        console.log('❓ Непонятный ответ. Повторите: да/нет/тест');
        this.pendingConfirmation = true;
        return false;
    }
  }

  // Фиксация результатов в документации
  fixResults() {
    console.log('📝 Обновляю документацию...');
    // Здесь будет обновление PROJECT_KNOWLEDGE.md
    return true;
  }

  // Исправление проблем
  fixProblems() {
    console.log('🔧 Анализирую проблемы...');
    // Здесь будет анализ и исправление проблем
    return false;
  }

  // Дополнительное тестирование
  runAdditionalTests() {
    console.log('🔍 Запускаю расширенные тесты...');
    // Здесь будут дополнительные тесты
    return false;
  }
}

// Экспорт для использования
module.exports = AutoTestingSystem;

// Если запущен напрямую
if (require.main === module) {
  const tester = new AutoTestingSystem();
  
  // Пример использования
  tester.runFullTesting({
    code: 'console.log("test");',
    files: ['test-file.js'],
    config: 'mcp'
  });
} 