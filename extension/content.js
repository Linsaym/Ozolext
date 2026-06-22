(function() {
    console.log('Ozolext loaded');
  // Создаём плавающую кнопку
  function createButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Выдать';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = '9999';
    btn.style.padding = '12px 24px';
    btn.style.backgroundColor = '#005BFF';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '40px';
    btn.style.boxShadow = '0 4px 12px rgba(0,91,255,0.4)';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '16px';
    btn.style.fontWeight = '600';
    btn.style.transition = 'transform 0.15s, box-shadow 0.15s';

    // Эффекты при наведении
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.04)';
      btn.style.boxShadow = '0 6px 16px rgba(0,91,255,0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 4px 12px rgba(0,91,255,0.4)';
    });

    // Клик – ищем целевую кнопку и эмулируем нажатие
    btn.addEventListener('click', () => {
      const target = document.querySelector('button[data-testid="giveOutActionButton"]');
      if (target) {
        target.click();
        // Можно добавить визуальную обратную связь
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => { btn.style.backgroundColor = '#005BFF'; }, 300);
      } else {
        alert('Кнопка оплаты не найдена на этой странице.');
      }
    });

    document.body.appendChild(btn);
  }

  // Добавляем кнопку после полной загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();