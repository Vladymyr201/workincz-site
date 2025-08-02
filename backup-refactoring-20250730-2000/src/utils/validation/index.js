/**
 * 🔒 Validation Module - Валидация и безопасность
 * Версия: 1.0.0
 * Дата: 30.07.2025
 */

// Схемы валидации
const VALIDATION_SCHEMAS = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Введите корректный email адрес'
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: 'Пароль должен содержать минимум 8 символов, включая буквы и цифры'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Введите корректный номер телефона'
  },
  name: {
    pattern: /^[а-яёa-z\s-]{2,50}$/i,
    message: 'Имя должно содержать 2-50 символов'
  }
};

/**
 * Валидация входных данных
 * @param {any} data - данные для валидации
 * @param {string} schema - схема валидации
 * @returns {Object} результат валидации
 */
export const validateInput = (data, schema) => {
  if (!data || !schema) {
    return {
      isValid: false,
      message: 'Отсутствуют данные для валидации'
    };
  }

  const validationSchema = VALIDATION_SCHEMAS[schema];
  if (!validationSchema) {
    return {
      isValid: false,
      message: 'Неизвестная схема валидации'
    };
  }

  const isValid = validationSchema.pattern.test(data);
  return {
    isValid,
    message: isValid ? '' : validationSchema.message
  };
};

/**
 * Валидация формы
 * @param {Object} formData - данные формы
 * @param {Object} rules - правила валидации
 * @returns {Object} результат валидации
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    const validation = validateInput(value, rule.schema);

    if (!validation.isValid) {
      errors[field] = validation.message;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Санитизация HTML для защиты от XSS
 * @param {string} input - входная строка
 * @returns {string} очищенная строка
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Валидация и санитизация пользовательского ввода
 * @param {string} input - пользовательский ввод
 * @param {string} type - тип данных
 * @returns {Object} результат обработки
 */
export const processUserInput = (input, type = 'text') => {
  const sanitized = sanitizeHTML(input);
  const validation = validateInput(sanitized, type);

  return {
    original: input,
    sanitized,
    isValid: validation.isValid,
    message: validation.message
  };
};

/**
 * Валидация файла
 * @param {File} file - файл для валидации
 * @param {Object} options - опции валидации
 * @returns {Object} результат валидации
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxFiles = 1
  } = options;

  if (!file) {
    return {
      isValid: false,
      message: 'Файл не выбран'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `Размер файла превышает ${maxSize / 1024 / 1024}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Неподдерживаемый тип файла'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Экспорт для использования в других модулях
export default {
  validateInput,
  validateForm,
  sanitizeHTML,
  processUserInput,
  validateFile,
  VALIDATION_SCHEMAS
}; 