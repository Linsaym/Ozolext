(function() {
  'use strict';

  const TARGET_SELECTOR = 'button[data-testid="giveOutActionButton"]';
  const FLOATING_BTN_ID = 'ozolext-floating-btn';

  console.log('[Ozolext] active');

  let targetButton = null;
  let isActive = false;
  let isFloatingEnabled = true;
  let observer = null;

  // --- Поиск целевой кнопки ---
  function findTargetButton() {
    return document.querySelector(TARGET_SELECTOR);
  }

  // --- Обновление состояния плавающей кнопки ---
  function updateButtonState() {
    const btn = document.getElementById(FLOATING_BTN_ID);
    if (!btn) return;

    // Если кнопка отключена — скрываем
    if (!isFloatingEnabled) {
      btn.style.display = 'none';
      return;
    }

    btn.style.display = 'block';
    targetButton = findTargetButton();
    isActive = !!targetButton;

    if (isActive) {
      btn.style.backgroundColor = '#005BFF';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.opacity = '1';
      btn.textContent = 'Выдать';
      btn.disabled = false;
    } else {
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
    if (document.getElementById(FLOATING_BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;
    btn.textContent = '⏳ Ожидание...';
    btn.disabled = true;

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

    btn.addEventListener('click', () => {
      if (!isActive || !targetButton || !isFloatingEnabled) return;
      targetButton.click();

      btn.textContent = '✅ Готово!';
      btn.style.backgroundColor = '#28a745';
      btn.style.color = '#fff';
      setTimeout(() => {
        if (isFloatingEnabled) {
          updateButtonState();
        } else {
          btn.style.display = 'none';
        }
      }, 800);
    });

    btn.addEventListener('mouseenter', () => {
      if (isActive && isFloatingEnabled) {
        btn.style.transform = 'scale(1.04)';
        btn.style.boxShadow = '0 6px 16px rgba(0,91,255,0.5)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      if (isActive && isFloatingEnabled) {
        btn.style.boxShadow = '0 4px 12px rgba(0,91,255,0.4)';
      } else {
        btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }
    });

    document.body.appendChild(btn);

    if (!isFloatingEnabled) {
      btn.style.display = 'none';
    }

    updateButtonState();
  }

  // --- MutationObserver для отслеживания появления целевой кнопки ---
  function startObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      const currentTarget = findTargetButton();
      // Обновляем состояние только если изменилось
      if (currentTarget !== targetButton) {
        targetButton = currentTarget;
        updateButtonState();
        if (currentTarget) {
          console.log('[Ozolext] Целевая кнопка появилась 🎯');
        } else {
          console.log('[Ozolext] Целевая кнопка исчезла');
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    // Проверяем сразу
    targetButton = findTargetButton();
    updateButtonState();
    if (targetButton) {
      console.log('[Ozolext] Целевая кнопка уже есть на странице 🎯');
    }
  }

  // --- Обработка сообщений из popup ---
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

    if (message.action === 'getStatus') {
      sendResponse({ isActive });
      return true;
    }

    if (message.action === 'toggleFloatingButton') {
      isFloatingEnabled = message.enabled;
      const btn = document.getElementById(FLOATING_BTN_ID);
      if (btn) {
        if (isFloatingEnabled) {
          btn.style.display = 'block';
          updateButtonState();
        } else {
          btn.style.display = 'none';
        }
      }
      console.log(`[Ozolext] Отображение кнопки ${isFloatingEnabled ? 'включено' : 'выключено'}`);
      sendResponse({ success: true });
      return true;
    }
  });

  // --- Инициализация ---
  function init() {
    if (document.body) {
      createFloatingButton();
      startObserver();
    } else {
      const readyObserver = new MutationObserver(() => {
        if (document.body) {
          readyObserver.disconnect();
          createFloatingButton();
          startObserver();
        }
      });
      readyObserver.observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Страховка
  setTimeout(() => {
    if (!document.getElementById(FLOATING_BTN_ID)) {
      createFloatingButton();
      startObserver();
    }
  }, 2000);
})();