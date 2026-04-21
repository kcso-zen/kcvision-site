// KCVISION — shared scripts

// ===== MOBILE NAV TOGGLE =====
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // ===== FONT SIZE =====
  const root = document.documentElement;
  let currentSize = parseFloat(localStorage.getItem('kcFontSize') || 16);
  root.style.fontSize = currentSize + 'px';

  document.querySelectorAll('.fs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'up' && currentSize < 22) currentSize += 2;
      if (btn.dataset.action === 'dn' && currentSize > 12) currentSize -= 2;
      root.style.fontSize = currentSize + 'px';
      localStorage.setItem('kcFontSize', currentSize);
    });
  });

  // ===== LANGUAGE TOGGLE =====
  let lang = localStorage.getItem('kcLang') || 'en';
  applyLang(lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      lang = btn.dataset.lang;
      localStorage.setItem('kcLang', lang);
      applyLang(lang);
      document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.lang === lang)
      );
    });
  });

  function applyLang(l) {
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = l === 'zh' ? (el.dataset.zh || el.dataset.en) : el.dataset.en;
    });
    document.querySelectorAll('.lang-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.lang === l)
    );
  }
});
