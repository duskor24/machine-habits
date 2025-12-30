// api/health.js
import { kvSet, kvGet } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const testKey = "machine_habits:healthcheck";
    const payload = { t: Date.now() };
    await kvSet(testKey, payload);
    const back = await kvGet(testKey);

    return res.status(200).json({
      ok: true,
      redis: true,
      roundtrip: back,
      envDetected: {
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, redis: false, error: String(e) });
  }
}
