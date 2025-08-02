# 🔧 НАСТРОЙКА DNS ДЛЯ WORKCLICK.CZ

## 📋 Текущие DNS записи (WEDOS):
A workclick.cz → 151.101.1.195
AAAA workclick.cz → 2a02:2b88:1:4::16

## 🎯 Нужные DNS записи (Firebase):
A workclick.cz → 199.36.158.100
TXT workclick.cz → hosting-site=workclick-cz

## 📝 Пошаговые инструкции:

### 1. Войти в панель WEDOS
- URL: https://client.wedos.com/
- Выбрать домен: workclick.cz

### 2. Удалить старые записи
- A workclick.cz → 151.101.1.195
- AAAA workclick.cz → 2a02:2b88:1:4::16

### 3. Добавить новые записи
- A workclick.cz → 199.36.158.100
- TXT workclick.cz → hosting-site=workclick-cz

### 4. Проверить настройки
- Подождать: 5-15 минут
- Проверить: https://workclick.cz
- Статус: https://console.firebase.google.com/project/workincz-759c7/hosting

## 🔍 Проверка DNS:
- DNS Checker: https://dnschecker.org/
- Домен: workclick.cz

---
Создано: 2025-07-29T07:31:00.000Z