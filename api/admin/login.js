const {
  createSessionToken,
  json,
  readBody,
  setSessionCookie,
  sha256
} = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.ADMIN_SESSION_SECRET) {
    return json(res, 503, { ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  }

  try {
    const body = await readBody(req);
    const password = String(body.password || '').trim();
    if (!password || sha256(password) !== process.env.ADMIN_PASSWORD_HASH) {
      return json(res, 401, { ok: false, error: 'INVALID_PASSWORD' });
    }

    setSessionCookie(res, createSessionToken());
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
