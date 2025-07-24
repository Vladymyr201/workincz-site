# 🔧 НАСТРОЙКА MCP СЕРВЕРОВ В CURSOR

## ❓ Почему не видны новые MCP серверы?

Cursor отображает только те MCP серверы, которые:
1. **Активно запущены** и работают
2. **Добавлены в конфигурацию** Cursor
3. **Совместимы** с текущей версией Cursor

## 🚀 РЕШЕНИЕ: Пошаговая настройка

### Шаг 1: Проверьте текущую конфигурацию Cursor

Откройте файл конфигурации Cursor:
- **Windows:** `%APPDATA%\Cursor\User\settings.json`
- **macOS:** `~/Library/Application Support/Cursor/User/settings.json`
- **Linux:** `~/.config/Cursor/User/settings.json`

### Шаг 2: Добавьте новые MCP серверы

Добавьте в `settings.json`:

```json
{
  "mcp.servers": {
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
    },
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
    },
    "wikipedia": {
      "command": "npx",
      "args": ["-y", "@shelm/wikipedia-mcp-server"]
    },
    "youtube": {
      "command": "npx",
      "args": ["-y", "youtube-data-mcp-server"]
    }
  }
}
```

### Шаг 3: Перезапустите Cursor

1. **Закройте Cursor полностью**
2. **Откройте Cursor заново**
3. **Подождите 30-60 секунд** для инициализации серверов

### Шаг 4: Проверьте настройки

Перейдите в:
- **Settings** → **Tools & Integrations** → **MCP Tools**

Должны появиться новые серверы:
- ✅ **code-runner** (12 tools enabled)
- ✅ **notion** (интеграция с Notion)
- ✅ **supabase** (работа с Supabase)
- ✅ **wikipedia** (поиск информации)
- ✅ **youtube** (работа с YouTube API)
- ✅ **firebase-mcp** (интеграция с Firebase)
- ✅ **github-mcp** (работа с GitHub)

## 🔧 АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ

### Автоматическая настройка

Запустите скрипт автоматической настройки:

```bash
# Запуск всех серверов
node start-all-mcp-servers.js

# Проверка статуса
node monitor-mcp.js

# Тестирование
node test-mcp-servers.js
```

### Ручная настройка через интерфейс

1. В Cursor перейдите в **Settings** → **Tools & Integrations**
2. Нажмите **"Add a Custom MCP Server"**
3. Добавьте каждый сервер по отдельности:

**Code Runner:**
- Name: `code-runner`
- Command: `npx`
- Args: `-y mcp-server-code-runner`

**Notion:**
- Name: `notion`
- Command: `npx`
- Args: `-y @notionhq/notion-mcp-server`

**Supabase:**
- Name: `supabase`
- Command: `npx`
- Args: `-y @supabase/mcp-server-supabase`

**Wikipedia:**
- Name: `wikipedia`
- Command: `npx`
- Args: `-y @shelm/wikipedia-mcp-server`

**YouTube:**
- Name: `youtube`
- Command: `npx`
- Args: `-y youtube-data-mcp-server`

## 🛠 УСТРАНЕНИЕ ПРОБЛЕМ

### Проблема: Серверы не появляются
**Решение:**
1. Проверьте, что все пакеты установлены: `npm list -g`
2. Перезапустите Cursor
3. Проверьте логи в Developer Tools (F12)

### Проблема: Ошибки подключения
**Решение:**
1. Убедитесь, что серверы запущены
2. Проверьте токены и API ключи
3. Запустите: `node monitor-mcp.js`

### Проблема: Серверы не работают
**Решение:**
1. Проверьте зависимости: `node test-mcp-servers.js`
2. Переустановите серверы: `node auto-setup-mcp.js`
3. Проверьте версию Node.js (должна быть 18+)

## 📊 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После правильной настройки в Cursor должны появиться:

**Новые MCP серверы:**
- code-runner (12 tools)
- notion (интеграция)
- supabase (база данных)
- wikipedia (поиск)
- youtube (API)
- firebase-mcp (Firebase)
- github-mcp (GitHub)

**Всего инструментов:** 50+ новых инструментов

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. **Настройте токены** для GitHub, Notion, Supabase
2. **Протестируйте инструменты** в чате с Cursor
3. **Настройте автоматизацию** для проекта WorkInCZ
4. **Используйте новые возможности** для разработки

---

**Статус:** ✅ Готово к настройке
**Последнее обновление:** 24.07.2025 