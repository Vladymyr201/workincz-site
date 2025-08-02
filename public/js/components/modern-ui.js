/**
 * 🎨 Modern UI Components - Адаптированные из Next.js проекта
 * Версия: 1.0.0
 * Дата: 30.07.2025
 * 
 * Компоненты:
 * - ModernButton - современная кнопка с вариантами
 * - ModernInput - улучшенные поля ввода
 * - ModernModal - модальные окна
 * - ModernToast - система уведомлений
 * - ModernDropdown - выпадающие меню
 */

class ModernUI {
    constructor() {
        this.toasts = [];
        this.modals = [];
        this.dropdowns = [];
        this.init();
    }

    init() {
        // Инициализация системы уведомлений
        this.createToastContainer();
        
        // Инициализация модальных окон
        this.createModalContainer();
        
        console.log('🎨 Modern UI Components инициализированы');
    }

    /**
     * Создает контейнер для модальных окон
     */
    createModalContainer() {
        // Проверяем, существует ли уже контейнер
        if (document.getElementById('modal-container')) {
            return;
        }
        
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        modalContainer.className = 'fixed inset-0 z-50 hidden';
        modalContainer.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                    <div class="modal-content p-6">
                        <!-- Содержимое модального окна будет вставлено здесь -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        console.log('✅ Контейнер модальных окон создан');
    }

    // ===== КНОПКИ =====
    
    /**
     * Создает современную кнопку с вариантами
     * @param {Object} options - опции кнопки
     * @returns {HTMLElement} - элемент кнопки
     */
    createButton(options = {}) {
        const {
            text = 'Кнопка',
            variant = 'default', // default, outline, ghost, link, destructive
            size = 'default', // sm, default, lg, icon
            loading = false,
            disabled = false,
            icon = null,
            onClick = null,
            className = '',
            type = 'button'
        } = options;

        const button = document.createElement('button');
        button.type = type;
        button.textContent = text;
        button.disabled = disabled || loading;

        // Базовые классы
        let classes = [
            'inline-flex',
            'items-center',
            'justify-center',
            'whitespace-nowrap',
            'rounded-md',
            'text-sm',
            'font-medium',
            'ring-offset-background',
            'transition-colors',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-ring',
            'focus-visible:ring-offset-2',
            'disabled:pointer-events-none',
            'disabled:opacity-50'
        ];

        // Варианты
        const variants = {
            default: 'bg-blue-600 text-white hover:bg-blue-700',
            outline: 'border border-gray-300 bg-white hover:bg-gray-50',
            ghost: 'hover:bg-gray-100',
            link: 'text-blue-600 underline-offset-4 hover:underline',
            destructive: 'bg-red-600 text-white hover:bg-red-700'
        };

        // Размеры
        const sizes = {
            sm: 'h-9 rounded-md px-3',
            default: 'h-10 px-4 py-2',
            lg: 'h-11 rounded-md px-8',
            icon: 'h-10 w-10'
        };

        classes.push(variants[variant] || variants.default);
        classes.push(sizes[size] || sizes.default);

        // Добавляем иконку если есть
        if (icon) {
            const iconElement = document.createElement('i');
            iconElement.className = icon;
            iconElement.classList.add('mr-2');
            button.insertBefore(iconElement, button.firstChild);
        }

        // Добавляем спиннер загрузки
        if (loading) {
            const spinner = document.createElement('div');
            spinner.className = 'mr-2 h-4 w-4 animate-spin';
            spinner.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            `;
            button.insertBefore(spinner, button.firstChild);
        }

        button.className = classes.join(' ') + ' ' + className;

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    // ===== ПОЛЯ ВВОДА =====

    /**
     * Создает современное поле ввода
     * @param {Object} options - опции поля
     * @returns {HTMLElement} - контейнер с полем ввода
     */
    createInput(options = {}) {
        const {
            type = 'text',
            placeholder = '',
            label = '',
            error = '',
            helperText = '',
            value = '',
            required = false,
            disabled = false,
            icon = null,
            onChange = null,
            className = '',
            id = null
        } = options;

        const container = document.createElement('div');
        container.className = 'w-full';

        // Создаем ID если не передан
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        // Добавляем лейбл
        if (label) {
            const labelElement = document.createElement('label');
            labelElement.htmlFor = inputId;
            labelElement.className = 'block text-sm font-medium text-gray-700 mb-1';
            labelElement.textContent = label;
            container.appendChild(labelElement);
        }

        // Создаем поле ввода
        const input = document.createElement('input');
        input.type = type;
        input.id = inputId;
        input.placeholder = placeholder;
        input.value = value;
        input.required = required;
        input.disabled = disabled;

        // Базовые классы
        let classes = [
            'flex',
            'h-10',
            'w-full',
            'rounded-md',
            'border',
            'border-gray-300',
            'bg-white',
            'px-3',
            'py-2',
            'text-sm',
            'ring-offset-background',
            'placeholder:text-gray-400',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-blue-500',
            'focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50'
        ];

        // Добавляем иконку если есть
        if (icon) {
            const iconContainer = document.createElement('div');
            iconContainer.className = 'relative';
            
            const iconElement = document.createElement('i');
            iconElement.className = `absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${icon}`;
            
            input.classList.add('pl-10');
            iconContainer.appendChild(iconElement);
            iconContainer.appendChild(input);
            container.appendChild(iconContainer);
        } else {
            container.appendChild(input);
        }

        // Добавляем ошибку
        if (error) {
            classes.push('border-red-500', 'focus-visible:ring-red-500');
            const errorElement = document.createElement('p');
            errorElement.className = 'mt-1 text-sm text-red-600';
            errorElement.textContent = error;
            container.appendChild(errorElement);
        }

        // Добавляем вспомогательный текст
        if (helperText && !error) {
            const helperElement = document.createElement('p');
            helperElement.className = 'mt-1 text-sm text-gray-500';
            helperElement.textContent = helperText;
            container.appendChild(helperElement);
        }

        input.className = classes.join(' ') + ' ' + className;

        if (onChange) {
            input.addEventListener('input', onChange);
        }

        return container;
    }

    // ===== МОДАЛЬНЫЕ ОКНА =====

    /**
     * Создает модальное окно
     * @param {Object} options - опции модального окна
     * @returns {Object} - объект с методами управления
     */
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            size = 'default', // sm, default, lg, xl
            closeOnOverlay = true,
            showCloseButton = true,
            onClose = null
        } = options;

        const modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;
        
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
        modal.style.display = 'none';

        // Оверлей
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-50';
        
        // Контейнер модального окна
        const container = document.createElement('div');
        container.className = 'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto';

        // Размеры
        const sizes = {
            sm: 'max-w-sm',
            default: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl'
        };
        container.className = container.className.replace('max-w-md', sizes[size] || sizes.default);

        // Заголовок
        if (title) {
            const header = document.createElement('div');
            header.className = 'flex items-center justify-between p-6 border-b border-gray-200';
            
            const titleElement = document.createElement('h3');
            titleElement.className = 'text-lg font-semibold text-gray-900';
            titleElement.textContent = title;
            
            header.appendChild(titleElement);

            if (showCloseButton) {
                const closeButton = document.createElement('button');
                closeButton.className = 'text-gray-400 hover:text-gray-600';
                closeButton.innerHTML = '<i class="fas fa-times"></i>';
                closeButton.onclick = () => this.closeModal(modalId);
                header.appendChild(closeButton);
            }

            container.appendChild(header);
        }

        // Контент
        const contentElement = document.createElement('div');
        contentElement.className = 'p-6';
        
        if (typeof content === 'string') {
            contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentElement.appendChild(content);
        }
        
        container.appendChild(contentElement);

        // Собираем модальное окно
        modal.appendChild(overlay);
        modal.appendChild(container);

        // Добавляем в DOM
        document.body.appendChild(modal);

        // Обработчики событий
        if (closeOnOverlay) {
            overlay.addEventListener('click', () => this.closeModal(modalId));
        }

        // Сохраняем в список
        this.modals.push({
            id: modalId,
            element: modal,
            onClose
        });

        return {
            id: modalId,
            show: () => this.showModal(modalId),
            close: () => this.closeModal(modalId),
            updateContent: (newContent) => this.updateModalContent(modalId, newContent)
        };
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Вызываем callback
            const modalData = this.modals.find(m => m.id === modalId);
            if (modalData && modalData.onClose) {
                modalData.onClose();
            }
        }
    }

    updateModalContent(modalId, content) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const contentElement = modal.querySelector('.p-6');
            if (contentElement) {
                if (typeof content === 'string') {
                    contentElement.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    contentElement.innerHTML = '';
                    contentElement.appendChild(content);
                }
            }
        }
    }

    // ===== УВЕДОМЛЕНИЯ =====

    /**
     * Показывает уведомление
     * @param {Object} options - опции уведомления
     */
    showToast(options = {}) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, warning, info
            duration = 5000,
            position = 'top-right' // top-right, top-left, bottom-right, bottom-left
        } = options;

        const toastId = `toast-${Math.random().toString(36).substr(2, 9)}`;
        
        // Создаем уведомление
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'bg-white border rounded-lg shadow-lg p-4 mb-4 transform transition-all duration-300 ease-in-out';
        toast.style.maxWidth = '400px';
        toast.style.transform = 'translateX(100%)';

        // Иконки для разных типов
        const icons = {
            success: 'fas fa-check-circle text-green-500',
            error: 'fas fa-exclamation-circle text-red-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            info: 'fas fa-info-circle text-blue-500'
        };

        // Цвета для разных типов
        const colors = {
            success: 'border-green-200',
            error: 'border-red-200',
            warning: 'border-yellow-200',
            info: 'border-blue-200'
        };

        toast.classList.add(colors[type] || colors.info);

        // Содержимое уведомления
        toast.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="${icons[type] || icons.info} text-lg"></i>
                </div>
                <div class="ml-3 flex-1">
                    ${title ? `<div class="text-sm font-medium text-gray-900">${title}</div>` : ''}
                    ${message ? `<div class="text-sm text-gray-500 mt-1">${message}</div>` : ''}
                </div>
                <div class="ml-4 flex-shrink-0">
                    <button class="text-gray-400 hover:text-gray-600" onclick="modernUI.closeToast('${toastId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Добавляем в контейнер
        const container = this.getToastContainer(position);
        container.appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Автоматическое закрытие
        if (duration > 0) {
            setTimeout(() => {
                this.closeToast(toastId);
            }, duration);
        }

        // Сохраняем в список
        this.toasts.push({
            id: toastId,
            element: toast,
            position
        });

        return toastId;
    }

    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);

            // Удаляем из списка
            this.toasts = this.toasts.filter(t => t.id !== toastId);
        }
    }

    createToastContainer(position) {
        const containerId = `toast-container-${position}`;
        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'fixed z-50 p-4 space-y-4';
            
            // Позиционирование
            const positions = {
                'top-right': 'top-0 right-0',
                'top-left': 'top-0 left-0',
                'bottom-right': 'bottom-0 right-0',
                'bottom-left': 'bottom-0 left-0'
            };
            
            container.className += ' ' + (positions[position] || positions['top-right']);
            document.body.appendChild(container);
        }
        
        return container;
    }

    getToastContainer(position) {
        return this.createToastContainer(position);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    /**
     * Объединяет CSS классы
     * @param {...string} classes - классы для объединения
     * @returns {string} - объединенные классы
     */
    cn(...classes) {
        return classes.filter(Boolean).join(' ');
    }

    /**
     * Форматирует дату
     * @param {Date|string} date - дата для форматирования
     * @returns {string} - отформатированная дата
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Проверяет валидность email
     * @param {string} email - email для проверки
     * @returns {boolean} - результат проверки
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Создает задержку
     * @param {number} ms - миллисекунды
     * @returns {Promise} - промис с задержкой
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Дебаунс функция
     * @param {Function} func - функция для дебаунса
     * @param {number} wait - время ожидания
     * @returns {Function} - дебаунсированная функция
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Создаем глобальный экземпляр
const modernUI = new ModernUI();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUI;
} else {
    window.ModernUI = ModernUI;
    window.modernUI = modernUI;
} 