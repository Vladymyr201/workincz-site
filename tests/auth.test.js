/**
 * 🧪 ТЕСТЫ АУТЕНТИФИКАЦИИ WORKINCZ
 * Проверка основных функций аутентификации
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService, Utils, UI } from '../public/js/core/app-bundle.js';

describe('AuthService', () => {
  beforeEach(() => {
    // Очищаем состояние перед каждым тестом
    document.body.innerHTML = '';
  });

  it('should initialize auth service', () => {
    expect(AuthService).toBeDefined();
  });

  it('should have login method', () => {
    expect(typeof AuthService.login).toBe('function');
  });

  it('should have logout method', () => {
    expect(typeof AuthService.logout).toBe('function');
  });
});

describe('Utils', () => {
  it('should have utility functions', () => {
    expect(Utils).toBeDefined();
  });
});

describe('UI', () => {
  it('should have UI functions', () => {
    expect(UI).toBeDefined();
  });
});