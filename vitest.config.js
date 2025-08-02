import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.js',
        'test-firebase-setup.js'
      ]
    },
    // Настройки для серверных тестов
    environmentOptions: {
      jsdom: {
        // Поддержка для серверных тестов
        resources: 'usable',
      }
    },
    // Исключаем тесты с симлинками в Windows
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ]
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}); 