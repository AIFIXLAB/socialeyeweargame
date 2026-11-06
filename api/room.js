// ห้องเล่นกับเพื่อนของ Social Eyewear Game ใช้ Redis ตัวเดียวกับเซฟกลาง
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL = 60 * 60 * 24 * 14, MAX = 8 * 1024;
const K = c => ({ m: 'socialeyewear:room:' + c, p: 'socialeyewear:room:' + c + ':p', e: 'socialeyewear:room:' + c + ':e' });
async function pipe(cmds) {
  const r = await fetch(URL_ + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmds) });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map(x => x.result);
}
const ok = (v, max = MAX) => { const s = JSON.stringify(v); if (!s || s.length > max) throw new Error('too_large'); return s; };
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ ok: false, error: 'not_configured' });
  const q = req.query || {};
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const code = String(q.code || b.code || '');
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ ok: false, error: 'bad_code' });
  const k = K(code);
  try {
    if (req.method === 'GET') {
      const [m, p, e] = await pipe([['GET', k.m], ['HGETALL', k.p], ['LRANGE', k.e, 0, 1999]]);
      const players = {};
      if (Array.isArray(p)) for (let i = 0; i < p.length; i += 2) players[p[i]] = JSON.parse(p[i + 1]);
      return res.status(200).json({ ok: true, meta: m ? JSON.parse(m) : null, players, events: (e || []).map(x => JSON.parse(x)) });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    if (b.a === 'create') {
      const [r] = await pipe([['SET', k.m, ok(b.meta), 'NX', 'EX', TTL]]);
      return res.status(200).json({ ok: !!r, taken: !r });
    }
    if (b.a === 'meta') { await pipe([['SET', k.m, ok(b.meta), 'EX', TTL]]); return res.status(200).json({ ok: true }); }
    if (b.a === 'player') {
      if (!/^[a-z0-9]{4,16}$/.test(String(b.id))) return res.status(400).json({ ok: false });
      await pipe([['HSET', k.p, b.id, ok(b.data)], ['EXPIRE', k.p, TTL]]);
      return res.status(200).json({ ok: true });
    }
    if (b.a === 'event') { await pipe([['RPUSH', k.e, ok(b.event)], ['EXPIRE', k.e, TTL]]); return res.status(200).json({ ok: true }); }
    return res.status(400).json({ ok: false });
  } catch (e) { return res.status(502).json({ ok: false, error: 'storage' }); }
};
