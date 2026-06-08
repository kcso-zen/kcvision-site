const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { list, put } = require('@vercel/blob');

const seedPath = path.join(process.cwd(), 'data', 'site-content.json');
const localCachePath = path.join(process.cwd(), 'data', 'site-content.local.json');
const manifestPath = 'site-content/content.json';
const sessionName = 'kcvision_admin';

async function readSeedContent() {
  const raw = await fs.readFile(seedPath, 'utf8');
  return JSON.parse(raw);
}

function hasBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function loadContent() {
  if (hasBlob()) {
    const result = await list({ prefix: manifestPath, limit: 1 });
    const blob = result.blobs.find(item => item.pathname === manifestPath) || result.blobs[0];
    if (blob?.url) {
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (response.ok) {
        return JSON.parse(await response.text());
      }
    }
  }

  try {
    if (process.env.VERCEL) {
      return readSeedContent();
    }
    const raw = await fs.readFile(localCachePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return readSeedContent();
  }
}

async function saveContent(content) {
  if (hasBlob()) {
    await put(manifestPath, JSON.stringify(content, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
  }

  if (!process.env.VERCEL) {
    await fs.writeFile(localCachePath, JSON.stringify(content, null, 2), 'utf8');
  }
  return content;
}

async function uploadAsset(field, upload) {
  const match = String(upload.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error(`Invalid upload for ${field}`);
  const contentType = upload.contentType || match[1];
  const ext = extensionForContentType(contentType, upload.name);
  const safeName = sanitizeName(field) + ext;
  const folder = field.startsWith('book') ? 'ebooks' : 'images';
  const pathname = `site-content/${folder}/${safeName}`;
  const body = Buffer.from(match[2], 'base64');

  if (!hasBlob()) {
    throw new Error('Blob storage is not configured.');
  }

  const blob = await put(pathname, body, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType
  });

  return blob.url;
}

function sanitizeName(value) {
  return String(value || 'asset').replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase();
}

function extensionForContentType(contentType, fallbackName) {
  const byType = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/epub+zip': '.epub'
  };
  if (byType[contentType]) return byType[contentType];
  const ext = path.extname(fallbackName || '');
  return ext || '';
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function sign(value) {
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function createSessionToken() {
  const payload = `${Date.now()}.${crypto.randomBytes(12).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

function isValidSession(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;
  const parts = token.split('.');
  if (parts.length < 3) return false;
  const signature = parts.pop();
  const payload = parts.join('.');
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function requireAuth(req, res) {
  const cookies = parseCookies(req);
  const token = cookies[sessionName];
  if (!isValidSession(token)) {
    json(res, 401, { ok: false, error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

function setSessionCookie(res, token) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=28800`
  );
}

function clearSessionCookie(res) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${sessionName}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`
  );
}

module.exports = {
  clearSessionCookie,
  createSessionToken,
  json,
  loadContent,
  readBody,
  requireAuth,
  saveContent,
  setSessionCookie,
  sha256,
  uploadAsset
};
