// api/_store.js
async function getRestConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;

  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  return { url, token };
}

async function upstashFetch(path, { url, token }) {
  const r = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Upstash error ${r.status}: ${txt}`);
  }
  return r.json();
}

export async function kvSet(key, value) {
  const { url, token } = await getRestConfig();
  if (!url || !token) {
    throw new Error(
      "Redis REST env vars missing. Need KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN)."
    );
  }

  // store JSON safely
  const v = encodeURIComponent(JSON.stringify(value));
  await upstashFetch(`set/${encodeURIComponent(key)}/${v}`, { url, token });
}

export async function kvGet(key) {
  const { url, token } = await getRestConfig();
  if (!url || !token) {
    throw new Error(
      "Redis REST env vars missing. Need KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN)."
    );
  }

  const data = await upstashFetch(`get/${encodeURIComponent(key)}`, { url, token });
  const val = data?.result;
  if (!val) return null;

  try { return JSON.parse(val); } catch { return null; }
}
