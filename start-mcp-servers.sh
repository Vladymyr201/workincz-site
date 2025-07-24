#!/bin/bash
# Быстрый запуск MCP серверов для WorkInCZ
echo "🚀 Запуск MCP серверов..."
npx @modelcontextprotocol/server-filesystem D:/workincz-site &
npx @modelcontextprotocol/server-sequential-thinking &
npx mcp-server-code-runner &
npx @sentry/mcp-server &
echo "✅ MCP серверы запущены"
