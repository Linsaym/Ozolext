(function() {
  'use strict';

  // --- Конфигурация ---
  const TARGET_SELECTOR = 'button[data-testid="giveOutActionButton"]';
  const FLOATING_BTN_ID = 'ozolext-floating-btn';
  const CHECK_INTERVAL_MS = 200; // Проверяем каждую секунду

  // --- Логирование ---
  console.log('[Ozolext] active');

  // --- Переменные состояния ---
  let targetButton = null;
  let isActive = false;

  // --- Функция поиска целевой кнопки ---
  function findTargetButton() {
    return document.querySelector(TARGET_SELECTOR);
  }

  // --- Функция обновления состояния кнопки ---
  function updateButtonState() {
    targetButton = findTargetButton();
    isActive = !!targetButton;

    const btn = document.getElementById(FLOATING_BTN_ID);
    if (!btn) return;

    if (isActive) {
      // Активная кнопка
      btn.style.backgroundColor = '#005BFF';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.textContent = 'Выдать';
      btn.disabled = false;
    } else {
      // Неактивная (серая) кнопка
      btn.style.backgroundColor = '#6c757d';
      btn.style.color = '#adb5bd';
      btn.style.cursor = 'not-allowed';
      btn.style.opacity = '0.6';
      btn.textContent = '⏳ Ожидание...';
      btn.disabled = true;
    }
  }

  // --- Создание плавающей кнопки ---
  function createFloatingButton() {
    // Проверяем, не создана ли уже
    if (document.getElementById(FLOATING_BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;
    btn.textContent = '⏳ Ожидание...';
    btn.disabled = true;
    
    // Базовые стили (серые, пока не активируется)
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '12px 24px',
      backgroundColor: '#6c757d',
      color: '#adb5bd',
      border: 'none',
      borderRadius: '40px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      cursor: 'not-allowed',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      opacity: '0.6',
    });

    // Обработчик клика (будет работать только когда активна)
    btn.addEventListener('click', () => {
      if (!isActive || !targetButton) {
        // Если кнопка неактивна, ничего не делаем (но можно показать подсказку)
        return;
      }

      // Эмулируем клик по целевой кнопке
      targetButton.click();

      // Визуальная обратная связь
      btn.textContent = '✅ Готово!';
      btn.style.backgroundColor = '#28a745';
      btn.style.color = '#fff';
      setTimeout(() => {
        if (isActive && targetButton) {
          btn.textContent = 'Выдать';
          btn.style.backgroundColor = '#005BFF';
          btn.style.color = '#fff';
        } else {
          updateButtonState();
        }
      }, 800);
    });

    // Эффекты при наведении (только если активна)
    btn.addEventListener('mouseenter', () => {
      if (isActive) {
        btn.style.transform = 'scale(1.04)';
        btn.style.boxShadow = '0 6px 16px rgba(0,91,255,0.5)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      if (isActive) {
        btn.style.boxShadow = '0 4px 12px rgba(0,91,255,0.4)';
      } else {
        btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }
    });

    document.body.appendChild(btn);
    
    // Первоначальное обновление состояния
    updateButtonState();
  }

  // --- Периодическая проверка ---
  function startPeriodicCheck() {
    setInterval(() => {
      const oldTarget = targetButton;
      const newTarget = findTargetButton();
      
      // Если состояние изменилось — обновляем кнопку
      if (oldTarget !== newTarget || (newTarget && !isActive)) {
        targetButton = newTarget;
        updateButtonState();
        
        // Логируем изменения (для отладки)
        if (newTarget && !isActive) {
          console.log('[Ozolext] Целевая кнопка найдена! 🎯');
        } else if (!newTarget && isActive) {
          console.log('[Ozolext] Целевая кнопка пропала');
        }
      }
    }, CHECK_INTERVAL_MS);
  }

  // --- Слушатель сообщений из popup ---
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'clickGiveout') {
      if (isActive && targetButton) {
        targetButton.click();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, reason: 'Кнопка не активна' });
      }
      return true;
    }
  });

  // --- Инициализация ---
  function init() {
    if (document.body) {
      createFloatingButton();
      startPeriodicCheck();
    } else {
      // Если body ещё нет, ждём его появления
      const observer = new MutationObserver(() => {
        if (document.body) {
          observer.disconnect();
          createFloatingButton();
          startPeriodicCheck();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  // --- Запуск ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Дополнительная страховка: если кнопка не создалась, пробуем ещё раз
  setTimeout(() => {
    if (!document.getElementById(FLOATING_BTN_ID)) {
      createFloatingButton();
      startPeriodicCheck();
    }
  }, 2000);

})();