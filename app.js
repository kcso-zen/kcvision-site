document.addEventListener('DOMContentLoaded', async () => {
  const STORAGE_KEYS = {
    fs: 'kcFS',
    lang: 'kcLang'
  };

  const DEFAULT_CONTENT = {
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
    card1DescEn: 'The blue-chip ape collection that defined PFP status culture. This sample artwork is now used as the lead visual on-site.',
    card2Sub: 'Mutant Ape · Yuga Labs · 2021',
    card2Name: 'MAYC',
    card2DescEn: 'Full commercial rights. The OG PFP expansion that pushed ape culture deeper into crypto identity.',
    card3Sub: 'Pudgy Penguins · 2021',
    card3Name: 'PPG',
    card3DescEn: 'From near-death to global IP. Walmart toys and animation proved a community NFT can become mass-market IP.',
    card4Sub: 'Milady Maker · CC0 · 2021',
    card4Name: 'Milady',
    card4DescEn: 'CC0 anime aesthetic. Cult status after Musk tweet. Pure online-tribe energy. Anyone can use freely.',
    thesisEn: "I don't flip JPEGs. I collect <strong>cultural milestones</strong>. BAYC, MAYC, Pudgy Penguins and Milady each represent a different chapter of crypto's social history. Whether they 10x or go to zero is secondary. They are my on-chain identity.",
    bookZhHeading: 'Chinese EPUB',
    bookZhTitle: 'Title: On-Chain Money War - Chinese Edition.',
    bookZhLink: 'https://www.amazon.com/dp/B0GX34ZYG8',
    bookEnHeading: 'English EPUB',
    bookEnTitle: 'Title: The On-Chain Money War - English Edition.',
    bookEnLink: 'https://www.amazon.com/dp/B0GX34ZYG8'
  };

  initNav();
  initFontSize();
  initLanguage();
  initNftFallback();

  const sharedContent = await fetchPublicContent();
  applySharedContent(sharedContent);

  if (document.body.dataset.page === 'admin') {
    initAdmin(sharedContent);
  }

  function initNav() {
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('navLinks');
    if (ham && nav) {
      ham.addEventListener('click', () => nav.classList.toggle('open'));
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('open'));
      });
    }
  }

  function initFontSize() {
    const root = document.documentElement;
    let size = Number(localStorage.getItem(STORAGE_KEYS.fs) || 17);
    root.style.fontSize = `${size}px`;
    document.querySelectorAll('.fs-btn').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.a === 'up' && size < 22) size += 2;
        if (button.dataset.a === 'dn' && size > 13) size -= 2;
        root.style.fontSize = `${size}px`;
        localStorage.setItem(STORAGE_KEYS.fs, String(size));
      });
    });
  }

  function initLanguage() {
    let lang = localStorage.getItem(STORAGE_KEYS.lang) || 'en';
    applyLang(lang);
    document.querySelectorAll('.lang-btn').forEach(button => {
      button.addEventListener('click', () => {
        lang = button.dataset.l;
        localStorage.setItem(STORAGE_KEYS.lang, lang);
        applyLang(lang);
      });
    });
  }

  function applyLang(lang) {
    document.body.classList.toggle('lang-zh', lang === 'zh');
    document.querySelectorAll('.lang-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.l === lang);
    });
  }

  function initNftFallback() {
    document.querySelectorAll('.nft-img img').forEach(img => {
      img.addEventListener('error', () => img.closest('.nft-img')?.classList.add('err'));
    });
  }

  async function fetchPublicContent() {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (!response.ok) throw new Error('content unavailable');
      const data = await response.json();
      return { ...DEFAULT_CONTENT, ...(data.content || {}) };
    } catch {
      return { ...DEFAULT_CONTENT };
    }
  }

  function applySharedContent(content) {
    document.querySelectorAll('[data-edit-image]').forEach(node => {
      const key = node.dataset.editImage;
      const img = node.tagName === 'IMG' ? node : node.querySelector('img');
      if (!img || !content[key]) return;
      img.src = content[key];
      if (node.dataset.editShape) {
        node.classList.toggle('is-circle', (content[node.dataset.editShape] || 'square') === 'circle');
      }
    });

    document.querySelectorAll('[data-edit-text]').forEach(node => {
      const key = node.dataset.editText;
      if (content[key]) node.innerHTML = content[key];
    });

    document.querySelectorAll('[data-edit-link]').forEach(node => {
      const key = node.dataset.editLink;
      if (content[key]) node.href = content[key];
    });

    document.querySelectorAll('[data-download-link]').forEach(node => {
      const key = node.dataset.downloadLink;
      const value = content[key];
      if (value) {
        node.href = value;
        node.removeAttribute('aria-disabled');
        node.classList.remove('is-disabled');
      } else {
        node.href = '#';
        node.setAttribute('aria-disabled', 'true');
        node.classList.add('is-disabled');
      }
    });

    for (let index = 1; index <= 4; index += 1) {
      const card = document.querySelector(`.nft-grid .nft-card:nth-child(${index})`);
      if (!card) continue;
      const sub = card.querySelector('.nft-sub');
      const name = card.querySelector('.nft-name');
      const descEn = card.querySelector('.nft-desc .en');
      if (sub) sub.textContent = content[`card${index}Sub`] || '';
      if (name) name.textContent = content[`card${index}Name`] || '';
      if (descEn) descEn.innerHTML = content[`card${index}DescEn`] || '';
    }

    const thesisEn = document.querySelector('section.container div[style*="background:linear-gradient"] .en');
    if (thesisEn && content.thesisEn) thesisEn.innerHTML = content.thesisEn;
  }

  function initAdmin(initialContent) {
    const loginPanel = document.getElementById('adminLogin');
    const editorPanel = document.getElementById('adminEditor');
    const statusText = document.getElementById('adminStatusText');
    const loginForm = document.getElementById('adminLoginForm');
    const saveBtn = document.getElementById('adminSaveBtn');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    let currentContent = { ...initialContent };
    let pendingUploads = {};
    let removals = new Set();

    boot();

    async function boot() {
      statusText.textContent = '正在檢查登入狀態。';
      const session = await fetchJson('/api/admin/session');
      if (session.ok) {
        statusText.textContent = '已登入，正在載入雲端內容。';
        const adminData = await fetchJson('/api/admin/content');
        if (adminData.ok) {
          currentContent = { ...DEFAULT_CONTENT, ...(adminData.content || {}) };
          showEditor();
          populateAdminForm();
          statusText.textContent = '後台已連線，所有變更會寫入雲端。';
          return;
        }
      }
      loginPanel.hidden = false;
      editorPanel.hidden = true;
      statusText.textContent = '請先登入後台。';
    }

    loginForm?.addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const password = String(formData.get('password') || '');
      const result = await fetchJson('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      if (!result.ok) {
        alert('密碼錯誤或後台尚未完成配置。');
        return;
      }
      loginForm.reset();
      await boot();
    });

    document.querySelectorAll('[data-admin-file]').forEach(input => {
      input.addEventListener('change', async event => {
        const field = event.currentTarget;
        const file = field.files?.[0];
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        pendingUploads[field.dataset.adminFile] = {
          name: file.name,
          contentType: file.type || inferContentType(file.name),
          dataUrl
        };
        removals.delete(field.dataset.adminFile);
        const preview = document.querySelector(`[data-admin-preview="${field.dataset.adminFile}"]`);
        if (preview) preview.src = dataUrl;
      });
    });

    document.querySelectorAll('[data-admin-download]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.adminDownload;
        const draft = pendingUploads[key];
        if (draft?.dataUrl) {
          window.open(draft.dataUrl, '_blank');
          return;
        }
        if (currentContent[key]) {
          window.open(currentContent[key], '_blank');
          return;
        }
        alert('目前沒有可下載檔案。');
      });
    });

    document.querySelectorAll('[data-admin-delete]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.adminDelete;
        delete pendingUploads[key];
        removals.add(key);
        const preview = document.querySelector(`[data-admin-preview="${key}"]`);
        if (preview) preview.removeAttribute('src');
        currentContent[key] = '';
        alert('已標記刪除，按 Save 才會正式生效。');
      });
    });

    saveBtn?.addEventListener('click', async () => {
      saveBtn.disabled = true;
      try {
        const nextContent = { ...currentContent };
        document.querySelectorAll('[data-admin-input]').forEach(field => {
          nextContent[field.dataset.adminInput] = field.value.trim();
        });

        const result = await fetchJson('/api/admin/content', {
          method: 'POST',
          body: JSON.stringify({
            content: nextContent,
            uploads: pendingUploads,
            removals: Array.from(removals)
          })
        });

        if (!result.ok) {
          throw new Error(result.error || 'save failed');
        }

        currentContent = { ...DEFAULT_CONTENT, ...(result.content || {}) };
        pendingUploads = {};
        removals = new Set();
        applySharedContent(currentContent);
        populateAdminForm();
        statusText.textContent = '已成功寫入雲端，現在任何電腦都會看到新資料。';
        alert('已正式儲存到網站。');
      } catch (error) {
        alert(`儲存失敗：${error.message}`);
      } finally {
        saveBtn.disabled = false;
      }
    });

    logoutBtn?.addEventListener('click', async () => {
      await fetchJson('/api/admin/logout', { method: 'POST' });
      window.location.reload();
    });

    function showEditor() {
      loginPanel.hidden = true;
      editorPanel.hidden = false;
    }

    function populateAdminForm() {
      document.querySelectorAll('[data-admin-input]').forEach(field => {
        const key = field.dataset.adminInput;
        if (field.tagName === 'SELECT') {
          field.value = currentContent[key] || 'square';
        } else {
          field.value = currentContent[key] || '';
        }
      });

      document.querySelectorAll('[data-admin-preview]').forEach(img => {
        const key = img.dataset.adminPreview;
        const draft = pendingUploads[key];
        if (draft?.dataUrl) {
          img.src = draft.dataUrl;
        } else if (currentContent[key]) {
          img.src = currentContent[key];
        } else {
          img.removeAttribute('src');
        }
      });
    }
  }

  async function fetchJson(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        ...options
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return { ok: false, ...data };
      return { ok: true, ...data };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function inferContentType(name) {
    const lower = String(name || '').toLowerCase();
    if (lower.endsWith('.epub')) return 'application/epub+zip';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
  }
});
