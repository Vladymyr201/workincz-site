// Используем require вместо import для CommonJS
require('@testing-library/jest-dom');
require('./test-firebase-setup.js');

// Дополнительные глобальные настройки для тестов
global.console = {
  ...console,
  // Подавляем предупреждения в тестах
  warn: jest.fn(),
  error: jest.fn(),
}; 