document.addEventListener('DOMContentLoaded', () => {
  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const sub = document.getElementById('statusSub');
  const triggerBtn = document.getElementById('triggerBtn');

  // Проверяем, активна ли страница Ozon
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('turbo-pvz.ozon.ru/orders/session/')) {
      dot.className = 'dot';
      label.textContent = '✅ Сессия открыта';
      sub.textContent = 'Кнопка готова к работе';
    } else {
      dot.className = 'dot inactive';
      label.textContent = '⛔ Не на странице выдачи';
      sub.textContent = 'Перейдите в сессию Turbo PVZ';
    }
  });

  // Отправляем сообщение в content script, чтобы он нажал кнопку
  triggerBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'clickGiveout' }, (response) => {
          if (chrome.runtime.lastError) {
            alert('Не удалось связаться со страницей. Обновите страницу и попробуйте снова.');
          } else if (response && response.success) {
            triggerBtn.textContent = '✅ Готово!';
            setTimeout(() => { triggerBtn.textContent = '▶ Выдать заказ'; }, 1200);
          } else {
            alert('Кнопка оплаты не найдена на этой странице.');
          }
        });
      }
    });
  });
});