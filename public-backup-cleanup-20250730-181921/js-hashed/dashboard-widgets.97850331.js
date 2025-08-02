/**
 * Унифицированные UI-виджеты для dashboard и других секций WorkInCZ
 * Все функции снабжены JSDoc и поддержкой accessibility
 */

/**
 * Рендерит прогресс-бар по проценту выполнения.
 * @param {number} percent - процент выполнения (0-100)
 * @param {HTMLElement} container - DOM-элемент для вставки прогресс-бара
 */
function renderProgressBar(percent, container) {
  container.innerHTML = `
    <div class="w-full bg-gray-200 rounded-full h-3 mb-3" aria-label="Прогресс по целям">
      <div class="bg-green-500 h-3 rounded-full transition-all duration-700${percent === 100 ? ' animate-pulse' : ''}" style="width: ${percent}%"></div>
    </div>
  `;
}

/**
 * Рендерит бейдж с иконкой и подписью.
 * @param {string} label - текст бейджа
 * @param {string} icon - HTML-иконка (например, '<i class="ri-medal-line"></i>')
 * @param {HTMLElement} container - DOM-элемент для вставки бейджа
 */
function renderBadge(label, icon, container) {
  container.innerHTML = `
    <span class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">${icon} ${label}</span>
  `;
}

/**
 * Универсальный toast-уведомитель.
 * @param {string} message - текст уведомления
 * @param {string} [type='info'] - тип ('info', 'success', 'error')
 */
function showToast(message, type = 'info') {
  let toast = document.getElementById('unifiedToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'unifiedToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm transition-all';
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm transition-all ' + (type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-primary');
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 2010);
}

/**
 * Рендерит heatmap-календарь целей за N дней.
 * @param {Array} goals - массив целей (объекты с полями done, dateCompleted)
 * @param {number} days - количество дней для отображения (например, 30)
 * @param {HTMLElement} container - DOM-элемент для вставки heatmap
 */
function renderGoalsCalendar(goals, days, container) {
  const now = new Date();
  const dayStats = Array.from({length: days}, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    return {date: d, count: 0};
  });
  goals.forEach(g => {
    if (g.done && g.dateCompleted) {
      const d = new Date(g.dateCompleted);
      for (let i = 0; i < days; i++) {
        if (d.toDateString() === dayStats[i].date.toDateString()) {
          dayStats[i].count++;
        }
      }
    }
  });
  container.innerHTML = dayStats.map(ds => {
    const c = ds.count;
    const color = c === 0 ? 'bg-gray-200' : c === 1 ? 'bg-green-200' : c === 2 ? 'bg-green-400' : 'bg-green-600';
    const label = `${ds.date.toLocaleDateString('ru-RU')}: ${c} целей выполнено`;
    return `<div class="w-4 h-8 rounded ${color} flex items-end justify-center text-[10px] text-white focus:outline-none cursor-pointer goals-calendar-cell" tabIndex="0" aria-label="${label}" data-tooltip="${label}">${c > 0 ? c : ''}</div>`;
  }).join('');
  let tooltip = document.getElementById('goalsCalendarTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'goalsCalendarTooltip';
    tooltip.className = 'fixed z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 pointer-events-none transition-opacity duration-150';
    document.body.appendChild(tooltip);
  }
  function showTooltip(e, text) {
    tooltip.textContent = text;
    tooltip.style.left = (e.clientX + 10) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
    tooltip.style.opacity = '1';
  }
  function hideTooltip() {
    tooltip.style.opacity = '0';
  }
  container.querySelectorAll('.goals-calendar-cell').forEach(cell => {
    cell.addEventListener('mouseenter', e => showTooltip(e, cell.dataset.tooltip));
    cell.addEventListener('mouseleave', hideTooltip);
    cell.addEventListener('focus', e => showTooltip(e, cell.dataset.tooltip));
    cell.addEventListener('blur', hideTooltip);
    cell.addEventListener('keydown', e => { if (e.key === 'Escape') hideTooltip(); });
  });
}

/**
 * Рендерит статусный бейдж (например, онлайн, VIP, Премиум).
 * @param {string} label - текст бейджа
 * @param {string} color - Tailwind-класс цвета (например, 'bg-green-100 text-green-700')
 * @param {string} icon - HTML-иконка (например, '<i class="ri-vip-crown-line"></i>')
 * @param {HTMLElement} container - DOM-элемент для вставки бейджа
 */
function renderStatusBadge(label, color, icon, container) {
  container.innerHTML = `
    <span class="inline-flex items-center gap-1 ${color} px-2 py-1 rounded-full text-xs" aria-label="${label}">${icon} ${label}</span>
  `;
}

/**
 * Рендерит мини-статистику (например, количество онлайн, просмотров, откликов).
 * @param {Array<{icon: string, value: string, label: string}>} stats - массив объектов статистики
 * @param {HTMLElement} container - DOM-элемент для вставки статистики
 */
function renderMiniStats(stats, container) {
  container.innerHTML = stats.map(s => `
    <span class="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs" aria-label="${s.label}">${s.icon} <span class="font-medium">${s.value}</span> ${s.label}</span>
  `).join(' ');
}

/**
 * Рендерит skeleton loading (анимированные заглушки) разных типов.
 * @param {string} type - тип skeleton ('list', 'line', 'card')
 * @param {HTMLElement} container - DOM-элемент для вставки skeleton
 * @param {number} [count=3] - количество элементов (для списка/карточек)
 */
function renderSkeleton(type, container, count = 3) {
  let html = '';
  if (type === 'list') {
    html = Array.from({length: count}).map(() => `
      <div class="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
    `).join('');
  } else if (type === 'line') {
    html = `<div class="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>`;
  } else if (type === 'card') {
    html = Array.from({length: count}).map(() => `
      <div class="bg-white rounded-lg p-4 shadow mb-3 flex flex-col gap-2 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    `).join('');
  }
  container.innerHTML = html;
}

/**
 * Рендерит модальное окно с заголовком, контентом, кнопкой закрытия и поддержкой accessibility.
 * @param {Object} options
 * @param {string} options.title - заголовок модального окна
 * @param {string|HTMLElement} options.content - HTML-контент или DOM-элемент
 * @param {Function} [options.onClose] - callback при закрытии
 * @param {string} [options.ariaLabel] - aria-label для модального окна
 */
function renderModal({ title, content, onClose, ariaLabel }) {
  // Затемнение
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in';
  overlay.tabIndex = -1;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  if (ariaLabel) overlay.setAttribute('aria-label', ariaLabel);

  // Модальное окно
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-lg max-w-md w-full p-6 shadow-lg relative animate-modal-in';
  modal.tabIndex = 0;

  // Кнопка закрытия
  const closeBtn = document.createElement('button');
  closeBtn.className = 'absolute top-2 right-2 text-gray-400 hover:text-gray-700';
  closeBtn.setAttribute('aria-label', 'Закрыть');
  closeBtn.innerHTML = '<i class="ri-close-line text-2xl"></i>';
  closeBtn.onclick = close;

  // Заголовок
  if (title) {
    const h4 = document.createElement('h4');
    h4.className = 'text-lg font-bold mb-2 flex items-center gap-2';
    h4.innerHTML = title;
    modal.appendChild(h4);
  }

  // Контент
  if (typeof content === 'string') {
    const div = document.createElement('div');
    div.innerHTML = content;
    modal.appendChild(div);
  } else if (content instanceof HTMLElement) {
    modal.appendChild(content);
  }

  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  modal.focus();

  // Закрытие по ESC и клику вне окна
  function close() {
    overlay.classList.add('animate-fade-out');
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 200);
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  return { overlay, modal, close };
}

/**
 * Рендерит debug overlay для карьерного трекера (только dev-режим, ?debug=1)
 * @param {Array} events - массив событий (строки или объекты)
 * @param {HTMLElement} container - DOM-элемент для overlay
 */
function renderCareerDebugOverlay(events, container) {
  if (!window.location.search.includes('debug=1')) return;
  let overlay = document.getElementById('careerDebugOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'careerDebugOverlay';
    overlay.className = 'fixed top-4 right-4 z-50 bg-black/80 text-white text-xs rounded-lg shadow-lg p-4 max-w-xs max-h-[60vh] overflow-y-auto border border-yellow-400';
    overlay.setAttribute('aria-label', 'Debug overlay карьерного трекера');
    overlay.tabIndex = 0;
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class='font-bold mb-2 text-yellow-300'>Debug Career Tracker</div>` +
    events.map(e => `<div class='mb-1'>${typeof e === 'string' ? e : JSON.stringify(e)}</div>`).join('');
  overlay.style.display = 'block';
  // Кнопка закрытия overlay
  if (!document.getElementById('closeCareerDebugOverlay')) {
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeCareerDebugOverlay';
    closeBtn.className = 'absolute top-2 right-2 text-yellow-300 hover:text-white';
    closeBtn.innerHTML = '<i class="ri-close-line"></i>';
    closeBtn.setAttribute('aria-label', 'Закрыть debug overlay');
    closeBtn.onclick = () => { overlay.style.display = 'none'; };
    overlay.appendChild(closeBtn);
  }
}

/**
 * Показывает toast/snackbar с кнопкой Undo (отменить действие)
 * @param {string} message - текст уведомления
 * @param {Function} onUndo - callback при нажатии Undo
 * @param {string} [type='info'] - тип ('info', 'success', 'error')
 */
function showUndoToast(message, onUndo, type = 'info') {
  let toast = document.getElementById('undoToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'undoToast';
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-4 transition-all';
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${message}</span><button class='ml-4 px-3 py-1 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500 focus:outline-none' tabIndex="0" aria-label="Отменить">Отменить</button>`;
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-4 transition-all ' + (type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-primary');
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  const undoBtn = toast.querySelector('button');
  undoBtn.onclick = () => {
    onUndo && onUndo();
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  };
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 5000);
}
// --- Экспортируем функции ---
window.renderProgressBar = renderProgressBar;
window.renderBadge = renderBadge;
window.showToast = showToast;
window.renderGoalsCalendar = renderGoalsCalendar;
window.renderStatusBadge = renderStatusBadge;
window.renderMiniStats = renderMiniStats;
window.renderSkeleton = renderSkeleton;
window.renderModal = renderModal;
window.renderCareerDebugOverlay = renderCareerDebugOverlay;
window.showUndoToast = showUndoToast; 