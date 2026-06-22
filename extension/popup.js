document.addEventListener('DOMContentLoaded', () => {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const sub = document.getElementById('statusSub');
  const triggerBtn = document.getElementById('triggerBtn');
  const floatingToggle = document.getElementById('floatingToggle');

  let isActive = false;

  // --- Загрузка сохранённого состояния ---
  chrome.storage.local.get(['floatingButtonEnabled'], (result) => {
    const enabled = result.floatingButtonEnabled !== undefined ? result.floatingButtonEnabled : true;
    floatingToggle.checked = enabled;
    sendToggleMessage(enabled);
  });

  // --- Сохранение состояния при переключении ---
  floatingToggle.addEventListener('change', () => {
    const enabled = floatingToggle.checked;
    chrome.storage.local.set({ floatingButtonEnabled: enabled });
    sendToggleMessage(enabled);
  });

  function sendToggleMessage(enabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleFloatingButton',
          enabled: enabled
        }).catch(() => {});
      }
    });
  }

  // --- Проверка статуса на странице ---
  function checkStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) return;

      const isOzonPage = tab.url.includes('turbo-pvz.ozon.ru/orders/session/');

      if (isOzonPage) {
        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
          if (chrome.runtime.lastError) {
            updateUI(false);
            return;
          }
          updateUI(response && response.isActive);
        });
      } else {
        updateUI(false);
      }
    });
  }

  function updateUI(active) {
    isActive = active;

    if (active) {
      dot.className = 'dot active';
      label.textContent = '✅ Готов к работе';
      sub.textContent = 'Целевая кнопка найдена';
      triggerBtn.className = 'btn-action active';
      triggerBtn.textContent = '▶ Выдать заказ';
      triggerBtn.disabled = false;
    } else {
      dot.className = 'dot';
      label.textContent = '⏳ Ожидание кнопки...';
      sub.textContent = 'Кнопка ещё не загрузилась';
      triggerBtn.className = 'btn-action';
      triggerBtn.textContent = '⏳ Ожидание...';
      triggerBtn.disabled = true;
    }
  }

  // --- Клик по кнопке "Выдать заказ" ---
  triggerBtn.addEventListener('click', () => {
    if (!isActive) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'clickGiveout' }, (response) => {
          if (!chrome.runtime.lastError && response && response.success) {
            triggerBtn.textContent = '✅ Готово!';
            setTimeout(() => {
              triggerBtn.textContent = '▶ Выдать заказ';
            }, 1200);
          }
        });
      }
    });
  });

  // --- Периодическое обновление статуса (каждые 2 секунды) ---
  setInterval(checkStatus, 2000);
  checkStatus();
});