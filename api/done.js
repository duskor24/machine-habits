import { kvSet } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { date, done } = req.body || {};
  if (!date || typeof done !== "boolean") return res.status(400).json({ error: "Invalid payload" });

  await kvSet(`machine_habits:done:${date}`, done);
  return res.status(200).json({ ok: true });
}
