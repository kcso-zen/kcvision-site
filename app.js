// KCVISION V4 — shared scripts
document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');
  if (ham && nav) {
    ham.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Font size
  const root = document.documentElement;
  let fs = parseFloat(localStorage.getItem('kcFS') || 17);
  root.style.fontSize = fs + 'px';
  document.querySelectorAll('.fs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.a === 'up' && fs < 22) fs += 2;
      if (btn.dataset.a === 'dn' && fs > 13) fs -= 2;
      root.style.fontSize = fs + 'px';
      localStorage.setItem('kcFS', fs);
    });
  });

  // Language
  let lang = localStorage.getItem('kcLang') || 'en';
  applyLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      lang = btn.dataset.l;
      localStorage.setItem('kcLang', lang);
      applyLang(lang);
    });
  });

  function applyLang(l) {
    document.body.classList.toggle('lang-zh', l === 'zh');
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.l === l));
  }

  // TradingView fallback hide
  setTimeout(() => {
    const iframe = document.querySelector('.tv-widget iframe');
    if (iframe) {
      const fb = document.querySelector('.ticker-fallback');
      if (fb) fb.style.display = 'none';
    }
  }, 5000);

  // NFT image error fallback
  document.querySelectorAll('.nft-img img').forEach(img => {
    img.addEventListener('error', () => img.closest('.nft-img').classList.add('err'));
  });

});
