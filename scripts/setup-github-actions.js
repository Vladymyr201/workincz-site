/**
 * Скрипт для настройки GitHub Actions workflows
 * 
 * Этот скрипт проверяет наличие всех необходимых файлов и структур
 * для корректной работы GitHub Actions workflows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация
const config = {
  workflowsDir: '.github/workflows',
  actionsDir: '.github/actions',
  workflowUtilsDir: '.github/actions/workflow-utils',
  errorHandlersFile: '.github/actions/workflow-utils/error-handlers.sh',
  logsDir: '.github/logs',
  firestoreBackupLogsDir: '.github/logs/firestore-backup',
};

// Функция для создания директории, если она не существует
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Создание директории: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// Функция для проверки и создания файла, если он не существует
function ensureFileExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    console.log(`Создание файла: ${filePath}`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Создание необходимых директорий
function createDirectories() {
  console.log('Создание необходимых директорий...');
  
  ensureDirectoryExists(config.workflowsDir);
  ensureDirectoryExists(config.actionsDir);
  ensureDirectoryExists(config.workflowUtilsDir);
  ensureDirectoryExists(config.logsDir);
  ensureDirectoryExists(config.firestoreBackupLogsDir);
  
  console.log('Директории созданы успешно!');
}

// Создание файла error-handlers.sh, если он не существует
function createErrorHandlers() {
  console.log('Проверка файла error-handlers.sh...');
  
  const errorHandlersContent = `#!/bin/bash

# Утилиты для обработки ошибок в GitHub Actions workflows
# Версия: 1.0.0

# Функция для обработки и форматирования ошибок
log_error() {
  local error_msg="$1"
  local exit_code=\${2:-1}
  local details=\${3:-""}
  
  echo "::error::$error_msg"
  
  if [ -n "$details" ]; then
    echo "$details"
  fi
  
  # Для диагностики
  echo "Системная информация:"
  echo "- Дата/время: $(date)"
  echo "- Пользователь: $(whoami)"
  echo "- Директория: $(pwd)"
  echo "- Переменные окружения GitHub:"
  echo "  GITHUB_WORKFLOW: $GITHUB_WORKFLOW"
  echo "  GITHUB_RUN_ID: $GITHUB_RUN_ID"
  echo "  GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
  
  return $exit_code
}

# Проверка доступа к GCP ресурсам
check_gcp_access() {
  local resource_type="$1"
  local resource_name="$2"
  
  case "$resource_type" in
    "bucket")
      if ! gsutil ls gs://$resource_name &>/dev/null; then
        log_error "Нет доступа к бакету gs://$resource_name" 1 "Проверьте права доступа сервисного аккаунта и существование бакета"
        return 1
      fi
      ;;
    "project")
      if ! gcloud projects describe $resource_name &>/dev/null; then
        log_error "Нет доступа к проекту GCP $resource_name" 1 "Проверьте права доступа сервисного аккаунта и ID проекта"
        return 1
      fi
      ;;
    "firestore")
      if ! gcloud firestore databases list --project=$resource_name &>/dev/null; then
        log_error "Нет доступа к Firestore в проекте $resource_name" 1 "Проверьте права доступа сервисного аккаунта (datastore.importExportAdmin)"
        return 1
      fi
      ;;
    *)
      log_error "Неизвестный тип ресурса: $resource_type" 1
      return 1
      ;;
  esac
  
  echo "✅ Доступ к $resource_type '$resource_name' подтвержден"
  return 0
}

# Проверка наличия необходимых секретов
check_required_secrets() {
  local missing_secrets=()
  
  for secret_name in "$@"; do
    # Проверяем, установлена ли переменная среды с именем секрета
    if [ -z "\${!secret_name}" ]; then
      missing_secrets+=("$secret_name")
    fi
  done
  
  if [ \${#missing_secrets[@]} -gt 0 ]; then
    log_error "Отсутствуют необходимые секреты: \${missing_secrets[*]}" 1 "Добавьте эти секреты в настройках репозитория: Settings -> Secrets -> Actions"
    return 1
  fi
  
  echo "✅ Все необходимые секреты настроены"
  return 0
}

# Отправка детализированного уведомления в Slack
send_slack_notification() {
  local webhook_url="$1"
  local status="$2"  # success или failure
  local title="$3"
  local message="$4"
  local details="\${5:-""}"
  
  if [ -z "$webhook_url" ]; then
    echo "Webhook URL не указан, пропускаем отправку уведомления"
    return 0
  fi
  
  local color
  local emoji
  
  if [ "$status" = "success" ]; then
    color="#36a64f"
    emoji="✅"
  else
    color="#e01e5a"
    emoji="❌"
  fi
  
  local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "$emoji $title",
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "$message"
          }
        }
EOF
  )
  
  if [ -n "$details" ]; then
    payload+=$(cat <<EOF
,
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Детали*:\\n$details"
          }
        }
EOF
    )
  fi
  
  # Добавляем информацию о запуске
  payload+=$(cat <<EOF
,
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "Репозиторий: *$GITHUB_REPOSITORY* | Workflow: *$GITHUB_WORKFLOW* | <https://github.com/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID|Посмотреть логи>"
            }
          ]
        }
      ]
    }
  ]
}
EOF
  )
  
  # Отправляем запрос в Slack
  curl -s -X POST -H 'Content-type: application/json' --data "$payload" "$webhook_url" || echo "Ошибка отправки уведомления"
}

# Экспортируем все функции
export -f log_error
export -f check_gcp_access
export -f check_required_secrets
export -f send_slack_notification
`;
  
  ensureFileExists(config.errorHandlersFile, errorHandlersContent);
  
  // Делаем файл исполняемым
  try {
    execSync(`chmod +x ${config.errorHandlersFile}`);
    console.log('Файл error-handlers.sh создан и настроен успешно!');
  } catch (error) {
    console.log('Предупреждение: Не удалось сделать файл исполняемым. В Windows это нормально.');
  }
}

// Проверка и создание .gitkeep файлов для пустых директорий
function createGitKeepFiles() {
  console.log('Создание .gitkeep файлов для пустых директорий...');
  
  const dirsToCheck = [
    config.firestoreBackupLogsDir,
  ];
  
  dirsToCheck.forEach(dir => {
    const gitkeepPath = path.join(dir, '.gitkeep');
    ensureFileExists(gitkeepPath, '# This file ensures the directory is tracked by Git\n');
  });
  
  console.log('.gitkeep файлы созданы успешно!');
}

// Основная функция
function main() {
  console.log('Начало настройки GitHub Actions...');
  
  createDirectories();
  createErrorHandlers();
  createGitKeepFiles();
  
  console.log('Настройка GitHub Actions завершена успешно!');
  console.log('');
  console.log('Для завершения настройки:');
  console.log('1. Добавьте необходимые секреты в GitHub (см. docs/ADD_GITHUB_SECRETS.md)');
  console.log('2. Закоммитьте и запушьте изменения в репозиторий');
  console.log('3. Запустите workflow "Firestore Backup" вручную для проверки');
}

main();