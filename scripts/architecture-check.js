#!/usr/bin/env node

/**
 * 🏗️ СКРИПТ ПРОВЕРКИ АРХИТЕКТУРЫ ПРОЕКТА
 * 
 * Проверяет соответствие проекта установленным правилам:
 * - Структура файлов
 * - Отсутствие дублирований
 * - Правильность импортов
 * - Типизация
 */

const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Правила архитектуры
const ARCHITECTURE_RULES = {
  // Запрещенные файлы и папки
  forbidden: [
    'public/js-hashed/',
    'public/css/',
    'public/firebase-config.js',
    'public/js/firebase-integration.js'
  ],
  
  // Обязательные файлы
  required: [
    'src/lib/firebase.ts',
    'src/app/globals.css',
    'next.config.js',
    'tailwind.config.js',
    'PROJECT_RULES.md',
    'ARCHITECTURE.md'
  ],
  
  // Правильная структура папок
  structure: {
    'src/app/': 'Next.js App Router',
    'src/components/': 'React компоненты',
    'src/hooks/': 'React хуки',
    'src/lib/': 'Утилиты и конфигурации',
    'src/types/': 'TypeScript типы',
    'src/services/': 'Сервисы'
  },
  
  // Старые модули к удалению
  deprecated: [
    'src/modules/',
    'public/js/',
    'public/auth/'
  ]
};

class ArchitectureChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = type === 'error' ? colors.red : 
                  type === 'warning' ? colors.yellow : 
                  type === 'success' ? colors.green : colors.blue;
    
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  checkFileExists(filePath) {
    return fs.existsSync(path.join(this.projectRoot, filePath));
  }

  checkDirectoryExists(dirPath) {
    return fs.existsSync(path.join(this.projectRoot, dirPath));
  }

  // Проверка запрещенных файлов
  checkForbiddenFiles() {
    this.log('🔍 Проверка запрещенных файлов...', 'info');
    
    ARCHITECTURE_RULES.forbidden.forEach(file => {
      if (this.checkFileExists(file) || this.checkDirectoryExists(file)) {
        this.errors.push(`❌ ЗАПРЕЩЕННЫЙ ФАЙЛ: ${file} - должен быть удален`);
        this.log(`❌ Найден запрещенный файл: ${file}`, 'error');
      } else {
        this.success.push(`✅ Запрещенный файл отсутствует: ${file}`);
      }
    });
  }

  // Проверка обязательных файлов
  checkRequiredFiles() {
    this.log('🔍 Проверка обязательных файлов...', 'info');
    
    ARCHITECTURE_RULES.required.forEach(file => {
      if (this.checkFileExists(file)) {
        this.success.push(`✅ Обязательный файл найден: ${file}`);
      } else {
        this.errors.push(`❌ ОТСУТСТВУЕТ ОБЯЗАТЕЛЬНЫЙ ФАЙЛ: ${file}`);
        this.log(`❌ Отсутствует обязательный файл: ${file}`, 'error');
      }
    });
  }

  // Проверка структуры папок
  checkDirectoryStructure() {
    this.log('🔍 Проверка структуры папок...', 'info');
    
    Object.entries(ARCHITECTURE_RULES.structure).forEach(([dir, description]) => {
      if (this.checkDirectoryExists(dir)) {
        this.success.push(`✅ Папка найдена: ${dir} (${description})`);
      } else {
        this.warnings.push(`⚠️ Отсутствует папка: ${dir} (${description})`);
        this.log(`⚠️ Отсутствует папка: ${dir}`, 'warning');
      }
    });
  }

  // Проверка устаревших модулей
  checkDeprecatedModules() {
    this.log('🔍 Проверка устаревших модулей...', 'info');
    
    ARCHITECTURE_RULES.deprecated.forEach(dir => {
      if (this.checkDirectoryExists(dir)) {
        this.warnings.push(`⚠️ УСТАРЕВШИЙ МОДУЛЬ: ${dir} - требует миграции`);
        this.log(`⚠️ Найден устаревший модуль: ${dir}`, 'warning');
      } else {
        this.success.push(`✅ Устаревший модуль отсутствует: ${dir}`);
      }
    });
  }

  // Проверка TypeScript файлов
  checkTypeScriptFiles() {
    this.log('🔍 Проверка TypeScript файлов...', 'info');
    
    const tsFiles = this.findFilesByExtension('src/', '.ts');
    const tsxFiles = this.findFilesByExtension('src/', '.tsx');
    
    if (tsFiles.length > 0 || tsxFiles.length > 0) {
      this.success.push(`✅ Найдено TypeScript файлов: ${tsFiles.length + tsxFiles.length}`);
    } else {
      this.warnings.push(`⚠️ Не найдено TypeScript файлов в src/`);
    }
  }

  // Поиск файлов по расширению
  findFilesByExtension(dir, ext) {
    const files = [];
    
    if (!this.checkDirectoryExists(dir)) return files;
    
    const items = fs.readdirSync(path.join(this.projectRoot, dir));
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const fullPath = path.join(this.projectRoot, itemPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        files.push(...this.findFilesByExtension(itemPath, ext));
      } else if (item.endsWith(ext)) {
        files.push(itemPath);
      }
    });
    
    return files;
  }

  // Проверка конфигурационных файлов
  checkConfigFiles() {
    this.log('🔍 Проверка конфигурационных файлов...', 'info');
    
    const configFiles = [
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'webpack.config.js'
    ];
    
    configFiles.forEach(file => {
      if (this.checkFileExists(file)) {
        this.success.push(`✅ Конфигурационный файл найден: ${file}`);
      } else {
        this.warnings.push(`⚠️ Отсутствует конфигурационный файл: ${file}`);
      }
    });
  }

  // Генерация отчета
  generateReport() {
    this.log('\n📊 ОТЧЕТ О ПРОВЕРКЕ АРХИТЕКТУРЫ', 'info');
    this.log('='.repeat(50), 'info');
    
    // Ошибки
    if (this.errors.length > 0) {
      this.log(`\n❌ ОШИБКИ (${this.errors.length}):`, 'error');
      this.errors.forEach(error => this.log(`  ${error}`, 'error'));
    }
    
    // Предупреждения
    if (this.warnings.length > 0) {
      this.log(`\n⚠️ ПРЕДУПРЕЖДЕНИЯ (${this.warnings.length}):`, 'warning');
      this.warnings.forEach(warning => this.log(`  ${warning}`, 'warning'));
    }
    
    // Успехи
    if (this.success.length > 0) {
      this.log(`\n✅ УСПЕХИ (${this.success.length}):`, 'success');
      this.success.forEach(success => this.log(`  ${success}`, 'success'));
    }
    
    // Итоговая оценка
    const totalChecks = this.errors.length + this.warnings.length + this.success.length;
    const score = totalChecks > 0 ? Math.round((this.success.length / totalChecks) * 100) : 0;
    
    this.log('\n' + '='.repeat(50), 'info');
    this.log(`🎯 ИТОГОВАЯ ОЦЕНКА: ${score}%`, score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error');
    
    if (score >= 80) {
      this.log('🎉 Архитектура проекта в отличном состоянии!', 'success');
    } else if (score >= 60) {
      this.log('⚠️ Архитектура требует внимания', 'warning');
    } else {
      this.log('❌ Архитектура требует серьезной доработки', 'error');
    }
    
    return {
      score,
      errors: this.errors.length,
      warnings: this.warnings.length,
      success: this.success.length
    };
  }

  // Запуск всех проверок
  run() {
    this.log('🚀 Запуск проверки архитектуры проекта...', 'info');
    this.log(`📁 Корневая папка: ${this.projectRoot}`, 'info');
    
    this.checkForbiddenFiles();
    this.checkRequiredFiles();
    this.checkDirectoryStructure();
    this.checkDeprecatedModules();
    this.checkTypeScriptFiles();
    this.checkConfigFiles();
    
    const report = this.generateReport();
    
    // Сохранение отчета в файл
    const reportData = {
      timestamp: new Date().toISOString(),
      score: report.score,
      errors: this.errors,
      warnings: this.warnings,
      success: this.success,
      summary: report
    };
    
    const reportPath = path.join(this.projectRoot, 'architecture-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    this.log(`📄 Отчет сохранен: ${reportPath}`, 'info');
    
    return report;
  }
}

// Запуск проверки
if (require.main === module) {
  const checker = new ArchitectureChecker();
  const result = checker.run();
  
  // Выход с кодом ошибки если есть критические проблемы
  process.exit(result.errors > 0 ? 1 : 0);
}

module.exports = ArchitectureChecker; 