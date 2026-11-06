// เซฟกลางของ Social Eyewear Game: เก็บเซฟตามรหัส 4 หลักใน Redis (Upstash บน Vercel Marketplace)
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX = 128 * 1024;
const key = c => 'socialeyewear:save:' + c;
async function redis(cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  if (!r.ok) throw new Error('redis ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {};
  if (!URL_ || !TOKEN) return res.status(200).json({ ok: false, configured: false });
  if (req.method === 'GET' && q.ping) return res.status(200).json({ ok: true, configured: true });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const code = String(q.code || body.code || '');
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ ok: false, error: 'bad_code' });
  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', key(code)]);
      return res.status(200).json({ ok: true, json: v || null });
    }
    if (req.method === 'DELETE') {
      await redis(['DEL', key(code)]);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'POST') {
      const json = String(body.json || '');
      if (!json || json.length > MAX) return res.status(413).json({ ok: false, error: 'too_large' });
      const d = JSON.parse(json);
      if (typeof d.money !== 'number' || d.code !== code || !Number.isInteger(d.rev)) return res.status(400).json({ ok: false, error: 'bad_save' });
      if (!body.force) {
        const cur = await redis(['GET', key(code)]);
        if (cur && (JSON.parse(cur).rev || 0) >= d.rev) return res.status(409).json({ ok: false, conflict: true });
      }
      await redis(['SET', key(code), json]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'storage' });
  }
};
