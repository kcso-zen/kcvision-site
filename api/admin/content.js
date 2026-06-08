const {
  json,
  loadContent,
  readBody,
  requireAuth,
  saveContent,
  uploadAsset
} = require('./_lib');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    const content = await loadContent();
    return json(res, 200, { ok: true, content });
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  if (!requireAuth(req, res)) return;

  try {
    const body = await readBody(req);
    const current = await loadContent();
    const next = { ...current, ...(body.content || {}) };
    const uploads = body.uploads || {};

    for (const [field, upload] of Object.entries(uploads)) {
      if (!upload) continue;
      next[field] = await uploadAsset(field, upload);
    }

    for (const field of body.removals || []) {
      delete next[field];
    }

    await saveContent(next);
    return json(res, 200, { ok: true, content: next });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
