// Storage layer:
// - If you set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, we store the subscription there (recommended).
// - Otherwise we keep it in memory (works for quick tests, not reliable across cold starts).

let mem = null;

async function upstashFetch(cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const r = await fetch(`${url}/${cmd}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error(`Upstash error: ${r.status}`);
  return r.json();
}

export async function putSubscription(sub) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    await upstashFetch(`set/machine_habits_sub/${encodeURIComponent(JSON.stringify(sub))}`);
    return;
  }
  mem = sub;
}

export async function getSubscription() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const data = await upstashFetch("get/machine_habits_sub");
    const val = data?.result;
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  }
  return mem;
}
