import { kvGet, kvSet } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    const settings = await kvGet("machine_habits:settings") || {
      enabled: true,
      onlyIfNotDoneToday: true,
      times: ["07:45","12:30","20:30"]
    };
    return res.status(200).json(settings);
  }

  if (req.method === "POST") {
    const s = req.body || {};
    const times = Array.isArray(s.times) ? s.times : [];
    const clean = times
      .map(t => String(t).trim())
      .filter(t => /^\d{2}:\d{2}$/.test(t))
      .slice(0, 4);

    const settings = {
      enabled: !!s.enabled,
      onlyIfNotDoneToday: !!s.onlyIfNotDoneToday,
      times: clean
    };
    await kvSet("machine_habits:settings", settings);
    return res.status(200).json({ ok: true, settings });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
