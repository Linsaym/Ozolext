(function() {
  // --- Конфигурация ---
  const TARGET_SELECTOR = 'button[data-testid="giveOutActionButton"]';
  const FLOATING_BTN_ID = 'ozolext-floating-btn';

  // --- Функция поиска целевой кнопки ---
  function findTargetButton() {
    return document.querySelector(TARGET_SELECTOR);
  }

  // --- Функция клика по целевой кнопке (с ожиданием) ---
  function clickGiveoutButton() {
    return new Promise((resolve) => {
      // Проверяем сразу
      let target = findTargetButton();
      if (target) {
        target.click();
        resolve(true);
        return;
      }

      // Если кнопки нет – ждём её появления (максимум 10 секунд)
      let attempts = 0;
      const maxAttempts = 20; // 20 * 500ms = 10 секунд
      const interval = setInterval(() => {
        attempts++;
        target = findTargetButton();
        if (target) {
          clearInterval(interval);
          target.click();
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(false);
        }
      }, 500);
    });
  }

  // --- Создание плавающей кнопки ---
  function createFloatingButton() {
    // Проверяем, не создана ли уже
    if (document.getElementById(FLOATING_BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = FLOATING_BTN_ID;
    btn.textContent = 'Выдать';
    
    // Стили
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '9999',
      padding: '12px 24px',
      backgroundColor: '#005BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '40px',
      boxShadow: '0 4px 12px rgba(0,91,255,0.4)',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'transform 0.15s, box-shadow 0.15s, background-color 0.3s',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    // Эффекты при наведении
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.04)';
      btn.style.boxShadow = '0 6px 16px rgba(0,91,255,0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 12px rgba(0,91,255,0.4)';
    });

    // Обработчик клика
    btn.addEventListener('click', async () => {
      // Меняем состояние кнопки
      const originalText = btn.textContent;
      btn.textContent = '⏳ Ищем...';
      btn.style.backgroundColor = '#6c757d';
      btn.style.cursor = 'wait';
      btn.disabled = true;

      const success = await clickGiveoutButton();

      // Восстанавливаем состояние
      btn.disabled = false;
      btn.style.cursor = 'pointer';
      
      if (success) {
        btn.textContent = '✅ Готово!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '#005BFF';
        }, 1200);
      } else {
        btn.textContent = '❌ Не найдено';
        btn.style.backgroundColor = '#dc3545';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '#005BFF';
        }, 1500);
      }
    });

    document.body.appendChild(btn);
  }

  // --- Создание плавающей кнопки при загрузке ---
  function init() {
    if (document.body) {
      createFloatingButton();
    } else {
      document.addEventListener('DOMContentLoaded', createFloatingButton);
    }
  }

  // --- Слушатель сообщений из popup ---
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'clickGiveout') {
      clickGiveoutButton().then((success) => {
        sendResponse({ success });
      });
      return true; // Асинхронный ответ
    }
  });

  // --- Запуск ---
  init();

  // --- Дополнительно: следим за появлением body (на случай, если скрипт загружен рано) ---
  if (document.readyState === 'loading') {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        createFloatingButton();
      }
    });
  }

  console.log('[Ozolext] Content script загружен и ожидает появления кнопки.');
})();