#!/usr/bin/env node

/**
 * 🔧 УПРОЩЕННАЯ НАСТРОЙКА FIREBASE И GITHUB
 * Автоматическая настройка интеграций для проекта WorkInCZ
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

class FirebaseGitHubSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.firebaseConfigPath = 'firebase.json';
    this.githubWorkflowsPath = '.github/workflows';
  }

  // Проверка текущей конфигурации
  checkCurrentSetup() {
    log('\n🔍 ПРОВЕРКА ТЕКУЩЕЙ НАСТРОЙКИ:', 'bright');
    
    // Проверка Firebase
    if (fs.existsSync(this.firebaseConfigPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(this.firebaseConfigPath, 'utf8'));
      log('✅ Firebase конфигурация найдена', 'green');
      log(`   Проект: ${firebaseConfig.projectId || 'Не указан'}`, 'cyan');
    } else {
      log('❌ Firebase конфигурация не найдена', 'red');
    }

    // Проверка GitHub Actions
    if (fs.existsSync(this.githubWorkflowsPath)) {
      const workflows = fs.readdirSync(this.githubWorkflowsPath);
      log(`✅ GitHub Actions найдены: ${workflows.length} workflow(s)`, 'green');
      workflows.forEach(workflow => {
        log(`   - ${workflow}`, 'cyan');
      });
    } else {
      log('❌ GitHub Actions не найдены', 'red');
    }
  }

  // Настройка Firebase
  async setupFirebase() {
    log('\n🔥 НАСТРОЙКА FIREBASE:', 'bright');
    
    try {
      // Проверка Firebase CLI
      log('📋 Проверка Firebase CLI...', 'cyan');
      execSync('firebase --version', { stdio: 'pipe' });
      log('✅ Firebase CLI установлен', 'green');
      
      // Проверка авторизации
      log('🔐 Проверка авторизации Firebase...', 'cyan');
      try {
        execSync('firebase projects:list', { stdio: 'pipe' });
        log('✅ Авторизация Firebase активна', 'green');
      } catch (error) {
        log('⚠️ Требуется авторизация Firebase', 'yellow');
        log('   Выполните: firebase login', 'yellow');
      }

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

  // Создание инструкций по настройке
  createSetupInstructions() {
    const instructions = `# 🔧 ИНСТРУКЦИИ ПО НАСТРОЙКЕ FIREBASE И GITHUB

## 🔥 FIREBASE НАСТРОЙКА:

### 1. Авторизация Firebase:
\`\`\`bash
firebase login
\`\`\`

### 2. Инициализация проекта:
\`\`\`bash
firebase init hosting
firebase init firestore
firebase init functions
\`\`\`

### 3. Получение токена для CI/CD:
\`\`\`bash
firebase login:ci
\`\`\`

## 🐙 GITHUB НАСТРОЙКА:

### 1. Создание репозитория:
- Создайте новый репозиторий на GitHub
- Добавьте remote: \`git remote add origin https://github.com/username/workincz-site.git\`

### 2. Настройка Secrets:
Перейдите в Settings > Secrets and variables > Actions и добавьте:

- \`FIREBASE_TOKEN\` - токен из Firebase CLI
- \`GITHUB_TOKEN\` - автоматически создается GitHub
- \`SNYK_TOKEN\` - для security scanning (опционально)

### 3. Push в main branch:
\`\`\`bash
git add .
git commit -m "Initial setup with Firebase and GitHub integration"
git push -u origin main
\`\`\`

## ✅ ПРОВЕРКА НАСТРОЙКИ:

### Firebase:
- [ ] Авторизация активна
- [ ] Проект инициализирован
- [ ] Hosting настроен
- [ ] Firestore настроен
- [ ] Functions настроены

### GitHub:
- [ ] Репозиторий создан
- [ ] Secrets настроены
- [ ] Workflows активны
- [ ] CI/CD работает
- [ ] Deploy автоматический

## 🚀 КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ:

\`\`\`bash
# Тест Firebase
firebase serve
firebase deploy --only hosting

# Тест GitHub Actions
git push origin main  # Запустит CI/CD pipeline
\`\`\`
`;

    fs.writeFileSync('FIREBASE_GITHUB_SETUP.md', instructions);
    log('✅ Инструкции по настройке созданы', 'green');
  }

  // Главная функция настройки
  async runSetup() {
    log('🚀 ЗАПУСК НАСТРОЙКИ FIREBASE И GITHUB', 'bright');
    log('Проект: WorkInCZ', 'cyan');
    
    // Проверка текущей настройки
    this.checkCurrentSetup();
    
    // Настройка Firebase
    await this.setupFirebase();
    
    // Настройка GitHub
    await this.setupGitHub();
    
    // Создание инструкций
    this.createSetupInstructions();
    
    log('\n🎉 НАСТРОЙКА ЗАВЕРШЕНА!', 'bright');
    log('📋 Следующие шаги:', 'cyan');
    log('1. Выполните: firebase login', 'blue');
    log('2. Настройте GitHub Secrets', 'blue');
    log('3. Прочитайте: FIREBASE_GITHUB_SETUP.md', 'blue');
  }
}

// Запуск
if (require.main === module) {
  const setup = new FirebaseGitHubSetup();
  setup.runSetup().catch(console.error);
}

module.exports = FirebaseGitHubSetup; 