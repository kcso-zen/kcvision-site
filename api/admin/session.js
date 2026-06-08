const { json, requireAuth } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) {
    return json(res, 503, { ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  }

  if (!requireAuth(req, res)) return;
  return json(res, 200, { ok: true, authenticated: true });
};
