let mem = new Map();

async function upstashFetch(path) {
  // Support BOTH env var styles:
  // 1) Manual Upstash vars: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
  // 2) Vercel Upstash integration vars: KV_REST_API_URL / KV_REST_API_TOKEN
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const r = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error(`Upstash error: ${r.status}`);
  return r.json();
}

export async function kvSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    await upstashFetch(`set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`);
    return;
  }
  mem.set(key, value);
}

export async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    const data = await upstashFetch(`get/${encodeURIComponent(key)}`);
    const val = data?.result;
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  }
  return mem.get(key) ?? null;
}
