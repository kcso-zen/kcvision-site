const { clearSessionCookie, json } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  clearSessionCookie(res);
  return json(res, 200, { ok: true });
};
