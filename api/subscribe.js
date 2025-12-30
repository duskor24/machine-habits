import { kvSet } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Vercel kann req.body als String liefern → robust machen
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  // akzeptiere beide Formen:
  // 1) { endpoint: ... }
  // 2) { subscription: { endpoint: ... } }
  const sub = body?.subscription ?? body;

  if (!sub || !sub.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  await kvSet("machine_habits:subscription", sub);
  return res.status(200).json({ ok: true });
}
