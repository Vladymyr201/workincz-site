import '@testing-library/jest-dom';
import './test-firebase-setup.js';

// Дополнительные глобальные настройки для тестов
global.console = {
  ...console,
  // Подавляем предупреждения в тестах
  warn: vi.fn(),
  error: vi.fn(),
}; 