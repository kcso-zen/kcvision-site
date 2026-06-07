// KCVISION V4 - shared scripts
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEYS = {
    fs: 'kcFS',
    lang: 'kcLang',
    nft: 'kcNftContentV1',
    pass: 'kcAdminPassHashV1',
    auth: 'kcAdminAuthedV1'
  };
  const DEFAULT_NFT_CONTENT = {
    featureImage: 'images/nft/bayc-feature.svg',
    card1Image: 'images/nft/bayc-849.png',
    card2Image: 'images/nft/mayc-card.svg',
    card3Image: 'images/nft/ppg-card.svg',
    card4Image: 'images/nft/milady-card.svg',
    card1Shape: 'square',
    card2Shape: 'square',
    card3Shape: 'square',
    card4Shape: 'square',
    card1Sub: 'Bored Ape Yacht Club · Yuga Labs · 2021',
    card1Name: 'BAYC',
    card1DescEn: "The blue-chip ape collection that defined PFP status culture. This sample artwork is now used as the lead visual on-site.",
    card2Sub: 'Mutant Ape · Yuga Labs · 2021',
    card2Name: 'MAYC',
    card2DescEn: "Full commercial rights. The OG PFP expansion that pushed ape culture deeper into crypto identity.",
    card3Sub: 'Pudgy Penguins · 2021',
    card3Name: 'PPG',
    card3DescEn: 'From near-death to global IP. Walmart toys and animation proved a community NFT can become mass-market IP.',
    card4Sub: 'Milady Maker · CC0 · 2021',
    card4Name: 'Milady',
    card4DescEn: 'CC0 anime aesthetic. Cult status after Musk tweet. Pure online-tribe energy. Anyone can use freely.',
    thesisEn: "I don't flip JPEGs. I collect <strong>cultural milestones</strong>. BAYC, MAYC, Pudgy Penguins and Milady each represent a different chapter of crypto's social history. Whether they 10x or go to zero is secondary. They are my on-chain identity."
  };

  initNav();
  initFontSize();
  initLanguage();
  initNftFallback();
  applyNftContent();

  if (document.body.dataset.page === 'admin') {
    initAdmin();
  }

  function initNav() {
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('navLinks');
    if (ham && nav) {
      ham.addEventListener('click', () => nav.classList.toggle('open'));
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
    }
  }

  function initFontSize() {
    const root = document.documentElement;
    let fs = parseFloat(localStorage.getItem(STORAGE_KEYS.fs) || 17);
    root.style.fontSize = fs + 'px';
    document.querySelectorAll('.fs-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.a === 'up' && fs < 22) fs += 2;
        if (btn.dataset.a === 'dn' && fs > 13) fs -= 2;
        root.style.fontSize = fs + 'px';
        localStorage.setItem(STORAGE_KEYS.fs, fs);
      });
    });
  }

  function initLanguage() {
    let lang = localStorage.getItem(STORAGE_KEYS.lang) || 'en';
    applyLang(lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        lang = btn.dataset.l;
        localStorage.setItem(STORAGE_KEYS.lang, lang);
        applyLang(lang);
      });
    });
  }

  function applyLang(lang) {
    document.body.classList.toggle('lang-zh', lang === 'zh');
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.l === lang);
    });
  }

  function initNftFallback() {
    document.querySelectorAll('.nft-img img').forEach(img => {
      img.addEventListener('error', () => img.closest('.nft-img')?.classList.add('err'));
    });
  }

  function getStoredNftContent() {
    try {
      return { ...DEFAULT_NFT_CONTENT, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.nft) || '{}') };
    } catch {
      return { ...DEFAULT_NFT_CONTENT };
    }
  }

  function applyNftContent() {
    const content = getStoredNftContent();

    document.querySelectorAll('[data-edit-image]').forEach(node => {
      const key = node.dataset.editImage;
      const img = node.tagName === 'IMG' ? node : node.querySelector('img');
      if (!img) return;
      if (content[key]) img.src = content[key];
      if (node.dataset.editShape) {
        node.classList.toggle('is-circle', (content[node.dataset.editShape] || 'square') === 'circle');
      }
    });

    document.querySelectorAll('[data-edit-text]').forEach(node => {
      const key = node.dataset.editText;
      if (content[key]) node.innerHTML = content[key];
    });

    const cardSelectors = [
      null,
      '.nft-grid .nft-card:nth-child(1)',
      '.nft-grid .nft-card:nth-child(2)',
      '.nft-grid .nft-card:nth-child(3)',
      '.nft-grid .nft-card:nth-child(4)'
    ];

    cardSelectors.forEach((selector, index) => {
      if (!selector) return;
      const card = document.querySelector(selector);
      if (!card) return;
      const sub = card.querySelector('.nft-sub');
      const name = card.querySelector('.nft-name');
      const descEn = card.querySelector('.nft-desc .en');
      if (sub) sub.textContent = content[`card${index}Sub`];
      if (name) name.textContent = content[`card${index}Name`];
      if (descEn) descEn.innerHTML = content[`card${index}DescEn`];
    });

    const thesisEn = document.querySelector('section.container div[style*="background:linear-gradient"] .en');
    if (thesisEn) thesisEn.innerHTML = content.thesisEn;
  }

  async function initAdmin() {
    const setupPanel = document.getElementById('adminSetup');
    const loginPanel = document.getElementById('adminLogin');
    const editorPanel = document.getElementById('adminEditor');
    const setupForm = document.getElementById('adminSetupForm');
    const loginForm = document.getElementById('adminLoginForm');
    const saveBtn = document.getElementById('adminSaveBtn');
    const resetBtn = document.getElementById('adminResetBtn');

    const hasPassword = !!localStorage.getItem(STORAGE_KEYS.pass);
    const authed = sessionStorage.getItem(STORAGE_KEYS.auth) === 'yes';
    if (setupPanel) setupPanel.hidden = hasPassword;
    if (loginPanel) loginPanel.hidden = !hasPassword || authed;
    if (editorPanel) editorPanel.hidden = !authed;

    if (authed) populateAdminForm();

    setupForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(setupForm);
      const password = String(formData.get('password') || '');
      const confirm = String(formData.get('confirm') || '');
      if (password.length < 6 || password !== confirm) {
        alert('Password 唔一致，或者太短。');
        return;
      }
      localStorage.setItem(STORAGE_KEYS.pass, await sha256(password));
      sessionStorage.setItem(STORAGE_KEYS.auth, 'yes');
      if (setupPanel) setupPanel.hidden = true;
      if (loginPanel) loginPanel.hidden = true;
      if (editorPanel) editorPanel.hidden = false;
      populateAdminForm();
    });

    loginForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const password = String(formData.get('password') || '');
      const hash = await sha256(password);
      if (hash !== localStorage.getItem(STORAGE_KEYS.pass)) {
        alert('Password 錯誤。');
        return;
      }
      sessionStorage.setItem(STORAGE_KEYS.auth, 'yes');
      if (loginPanel) loginPanel.hidden = true;
      if (editorPanel) editorPanel.hidden = false;
      populateAdminForm();
    });

    document.querySelectorAll('[data-admin-file]').forEach(input => {
      input.addEventListener('change', async event => {
        const field = event.currentTarget;
        const file = field.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        field.dataset.pendingValue = dataUrl;
        const preview = document.querySelector(`[data-admin-preview="${field.dataset.adminFile}"]`);
        if (preview) preview.src = dataUrl;
      });
    });

    saveBtn?.addEventListener('click', () => {
      const current = getStoredNftContent();
      const next = { ...current };
      document.querySelectorAll('[data-admin-input]').forEach(field => {
        next[field.dataset.adminInput] = field.value.trim();
      });
      document.querySelectorAll('[data-admin-file]').forEach(field => {
        if (field.dataset.pendingValue) next[field.dataset.adminFile] = field.dataset.pendingValue;
      });
      localStorage.setItem(STORAGE_KEYS.nft, JSON.stringify(next));
      alert('NFT 頁內容已儲存。');
    });

    resetBtn?.addEventListener('click', () => {
      if (!window.confirm('確定重設 NFT 頁內容？')) return;
      localStorage.removeItem(STORAGE_KEYS.nft);
      window.location.reload();
    });
  }

  function populateAdminForm() {
    const content = getStoredNftContent();
    document.querySelectorAll('[data-admin-input]').forEach(field => {
      const key = field.dataset.adminInput;
      if (content[key]) {
        field.value = content[key];
      } else if (field.tagName === 'SELECT') {
        field.value = 'square';
      } else {
        field.value = '';
      }
    });
    document.querySelectorAll('[data-admin-preview]').forEach(img => {
      const key = img.dataset.adminPreview;
      if (content[key]) img.src = content[key];
    });
  }

  async function sha256(text) {
    const bytes = new TextEncoder().encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buffer)).map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});
