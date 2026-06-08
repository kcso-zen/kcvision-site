const { json, loadContent } = require('./admin/_lib');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const content = await loadContent();
    return json(res, 200, { ok: true, content });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
};
