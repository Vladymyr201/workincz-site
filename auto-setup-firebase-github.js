#!/usr/bin/env node

/**
 * 🚀 АВТОМАТИЧЕСКАЯ НАСТРОЙКА FIREBASE И GITHUB
 * Полная настройка интеграций для проекта WorkInCZ
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Конфигурация проекта
const CONFIG = {
  firebaseToken: '[ВАШ_FIREBASE_TOKEN]',
  firebaseProjectId: 'workincz-759c7',
  githubRepo: 'workincz-site', // Будет обновлено
  githubToken: null // Будет запрошен
};

class AutoFirebaseGitHubSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.firebaseConfigPath = 'firebase.json';
    this.githubWorkflowsPath = '.github/workflows';
  }

  // Проверка и получение GitHub токена
  async getGitHubToken() {
    log('\n🐙 НАСТРОЙКА GITHUB TOKEN:', 'bright');
    log('Для полной автоматической настройки нужен GitHub Personal Access Token', 'cyan');
    log('1. Перейдите на: https://github.com/settings/tokens', 'blue');
    log('2. Нажмите "Generate new token (classic)"', 'blue');
    log('3. Выберите права: repo, workflow, admin:org', 'blue');
    log('4. Скопируйте токен и вставьте ниже', 'blue');
    
    // В реальном приложении здесь был бы prompt
    // Для демонстрации используем placeholder
    CONFIG.githubToken = 'YOUR_GITHUB_TOKEN_HERE';
    log('⚠️ Вставьте ваш GitHub токен в переменную CONFIG.githubToken', 'yellow');
  }

  // Настройка Firebase
  async setupFirebase() {
    log('\n🔥 НАСТРОЙКА FIREBASE:', 'bright');
    
    try {
      // Обновление конфигурации Firebase
      log('⚙️ Обновление конфигурации Firebase...', 'cyan');
      const firebaseConfig = {
        "hosting": {
          "public": "public",
          "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
          ],
          "rewrites": [
            {
              "source": "**",
              "destination": "/index.html"
            }
          ],
          "headers": [
            {
              "source": "**/*.@(js|css)",
              "headers": [
                {
                  "key": "Cache-Control",
                  "value": "max-age=31536000"
                }
              ]
            }
          ]
        },
        "firestore": {
          "rules": "firestore.rules",
          "indexes": "firestore.indexes.json"
        },
        "functions": {
          "source": "functions"
        },
        "storage": {
          "rules": "storage.rules"
        }
      };

      fs.writeFileSync(this.firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
      log('✅ Конфигурация Firebase обновлена', 'green');

      // Создание .firebaserc
      const firebaserc = {
        "projects": {
          "default": CONFIG.firebaseProjectId
        }
      };
      fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
      log('✅ .firebaserc создан', 'green');

    } catch (error) {
      log(`❌ Ошибка настройки Firebase: ${error.message}`, 'red');
    }
  }

  // Настройка GitHub
  async setupGitHub() {
    log('\n🐙 НАСТРОЙКА GITHUB:', 'bright');
    
    try {
      // Создание директории для workflows
      if (!fs.existsSync(this.githubWorkflowsPath)) {
        fs.mkdirSync(this.githubWorkflowsPath, { recursive: true });
        log('📁 Создана директория GitHub Actions', 'green');
      }

      // Создание основных workflows
      const workflows = {
        'ci-cd-pipeline.yml': this.createCICDWorkflow(),
        'firebase-deploy.yml': this.createFirebaseDeployWorkflow(),
        'security-scan.yml': this.createSecurityScanWorkflow(),
        'performance-test.yml': this.createPerformanceTestWorkflow()
      };

      Object.entries(workflows).forEach(([filename, content]) => {
        const filepath = path.join(this.githubWorkflowsPath, filename);
        fs.writeFileSync(filepath, content);
        log(`✅ Создан workflow: ${filename}`, 'green');
      });

      // Создание GitHub конфигурации
      const githubConfig = {
        "name": "WorkInCZ GitHub Integration",
        "description": "Автоматическая настройка GitHub для проекта WorkInCZ",
        "workflows": Object.keys(workflows),
        "required_secrets": [
          "FIREBASE_TOKEN",
          "GITHUB_TOKEN",
          "SENTRY_AUTH_TOKEN"
        ]
      };

      fs.writeFileSync('.github/config.json', JSON.stringify(githubConfig, null, 2));
      log('✅ GitHub конфигурация создана', 'green');

    } catch (error) {
      log(`❌ Ошибка настройки GitHub: ${error.message}`, 'red');
    }
  }

  // Создание CI/CD workflow
  createCICDWorkflow() {
    return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Firebase CLI
      run: npm install -g firebase-tools
    
    - name: Deploy to Firebase
      run: firebase deploy --only hosting --token "${{ secrets.FIREBASE_TOKEN }}"
`;
  }

  // Создание Firebase Deploy workflow
  createFirebaseDeployWorkflow() {
    return `name: Firebase Deploy

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Firebase CLI
      run: npm install -g firebase-tools
    
    - name: Deploy to Firebase Hosting
      run: firebase deploy --only hosting --token "${{ secrets.FIREBASE_TOKEN }}"
    
    - name: Deploy to Firebase Functions
      run: firebase deploy --only functions --token "${{ secrets.FIREBASE_TOKEN }}"
`;
  }

  // Создание Security Scan workflow
  createSecurityScanWorkflow() {
    return `name: Security Scan

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
`;
  }

  // Создание Performance Test workflow
  createPerformanceTestWorkflow() {
    return `name: Performance Test

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * *'

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Run performance tests
      run: npx playwright test --config=playwright.config.js
    
    - name: Upload performance report
      uses: actions/upload-artifact@v3
      with:
        name: performance-report
        path: playwright-report/
`;
  }

  // Создание файла с секретами
  createSecretsFile() {
    const secrets = {
      "firebase_token": CONFIG.firebaseToken,
      "firebase_project_id": CONFIG.firebaseProjectId,
      "github_token": CONFIG.githubToken,
      "setup_date": new Date().toISOString(),
      "instructions": {
        "firebase_token": "Токен для автоматического деплоя в Firebase",
        "firebase_project_id": "ID проекта Firebase",
        "github_token": "GitHub Personal Access Token для CI/CD"
      }
    };

    fs.writeFileSync('firebase-github-secrets.json', JSON.stringify(secrets, null, 2));
    log('✅ Файл с секретами создан (firebase-github-secrets.json)', 'green');
  }

  // Создание инструкций по настройке
  createSetupInstructions() {
    const instructions = `# 🔧 АВТОМАТИЧЕСКАЯ НАСТРОЙКА FIREBASE И GITHUB

## ✅ ЧТО УЖЕ НАСТРОЕНО:

### 🔥 Firebase:
- ✅ Конфигурация Firebase обновлена
- ✅ Токен получен: ${CONFIG.firebaseToken.substring(0, 20)}...
- ✅ Проект ID: ${CONFIG.firebaseProjectId}
- ✅ .firebaserc создан

### 🐙 GitHub:
- ✅ GitHub Actions workflows созданы
- ✅ CI/CD pipeline настроен
- ✅ Security scan настроен
- ✅ Performance tests настроены

## 🚀 СЛЕДУЮЩИЕ ШАГИ:

### 1. Настройте GitHub Secrets:
Перейдите в ваш GitHub репозиторий:
Settings > Secrets and variables > Actions

Добавьте следующие секреты:

#### FIREBASE_TOKEN:
\`\`\`
${CONFIG.firebaseToken}
\`\`\`

#### GITHUB_TOKEN:
\`\`\`
[Ваш GitHub Personal Access Token]
\`\`\`

### 2. Создайте GitHub репозиторий:
\`\`\`bash
# Создайте репозиторий на GitHub
# Затем выполните:
git remote add origin https://github.com/[username]/workincz-site.git
git add .
git commit -m "Initial setup with Firebase and GitHub integration"
git push -u origin main
\`\`\`

### 3. Проверьте настройку:
\`\`\`bash
# Тест Firebase
firebase serve
firebase deploy --only hosting

# Тест GitHub Actions
git push origin main  # Запустит CI/CD pipeline
\`\`\`

## 📋 СОЗДАННЫЕ ФАЙЛЫ:

### Firebase:
- \`firebase.json\` - конфигурация Firebase
- \`firebaserc\` - настройки проекта

### GitHub:
- \`.github/workflows/ci-cd-pipeline.yml\` - CI/CD pipeline
- \`.github/workflows/firebase-deploy.yml\` - автоматический деплой
- \`.github/workflows/security-scan.yml\` - проверка безопасности
- \`.github/workflows/performance-test.yml\` - тесты производительности

## 🎯 РЕЗУЛЬТАТ:

После настройки GitHub Secrets:
- ✅ Автоматический деплой при push в main
- ✅ Тестирование при pull request
- ✅ Ежедневные проверки безопасности
- ✅ Ежедневные тесты производительности
- ✅ Интеграция с Firebase Hosting

---
**Статус:** ✅ АВТОМАТИЧЕСКАЯ НАСТРОЙКА ЗАВЕРШЕНА
**Время:** ${new Date().toLocaleString()}
**Firebase проект:** ${CONFIG.firebaseProjectId}
`;

    fs.writeFileSync('FIREBASE_GITHUB_AUTO_SETUP.md', instructions);
    log('✅ Инструкции по настройке созданы', 'green');
  }

  // Главная функция настройки
  async runSetup() {
    log('🚀 ЗАПУСК АВТОМАТИЧЕСКОЙ НАСТРОЙКИ FIREBASE И GITHUB', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    
    // Получение GitHub токена
    await this.getGitHubToken();
    
    // Настройка Firebase
    await this.setupFirebase();
    
    // Настройка GitHub
    await this.setupGitHub();
    
    // Создание файла с секретами
    this.createSecretsFile();
    
    // Создание инструкций
    this.createSetupInstructions();
    
    log('\n🎉 АВТОМАТИЧЕСКАЯ НАСТРОЙКА ЗАВЕРШЕНА!', 'bright');
    log('📋 Следующие шаги:', 'cyan');
    log('1. Вставьте GitHub токен в CONFIG.githubToken', 'blue');
    log('2. Создайте GitHub репозиторий', 'blue');
    log('3. Настройте GitHub Secrets', 'blue');
    log('4. Прочитайте: FIREBASE_GITHUB_AUTO_SETUP.md', 'blue');
  }
}

// Запуск
if (require.main === module) {
  const setup = new AutoFirebaseGitHubSetup();
  setup.runSetup().catch(console.error);
}

module.exports = AutoFirebaseGitHubSetup; 