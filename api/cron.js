import webpush from "web-push";
import { kvGet, kvSet } from "./_store.js";

function pad2(n) { return String(n).padStart(2, "0"); }
function ymd(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function hm(d) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

// ✅ Always compute "now" in German time (Europe/Berlin), incl. DST
function nowBerlinDate() {
  const now = new Date();
  // Create a Date object representing the local clock time in Europe/Berlin
  // (safe + simple for hour/minute/day comparisons)
  return new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
}

export default async function handler(req, res) {
  // 🔐 Auth (Vercel Cron sends Authorization header automatically if configured)
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ✅ Vercel Cron hits endpoints with GET by default.
  // We allow GET and POST so it always works.
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 🔑 VAPID
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:you@example.com";
  if (!publicKey || !privateKey) {
    return res.status(500).json({ error: "Missing VAPID keys" });
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  // 📦 Subscription
  const sub = await kvGet("machine_habits:subscription");
  if (!sub) {
    return res.status(200).json({ ok: true, info: "no subscription yet" });
  }

  // ⚙️ Settings (times are in German time, strings like "23:28")
  const settings =
    (await kvGet("machine_habits:settings")) || {
      enabled: true,
      onlyIfNotDoneToday: true,
      times: ["07:45", "12:30", "20:30"],
    };

  if (!settings.enabled) {
    return res.status(200).json({ ok: true, info: "disabled" });
  }

  // 🇩🇪 German time "now"
  const berlin = nowBerlinDate();
  const today = ymd(berlin);       // German calendar day
  const nowHM = hm(berlin);        // German clock time (HH:MM)

  // 🧠 Optional: only if not done today
  if (settings.onlyIfNotDoneToday) {
    const doneToday = (await kvGet(`machine_habits:done:${today}`)) || false;
    if (doneToday) {
      return res.status(200).json({ ok: true, info: "already done today", berlinTime: nowHM, berlinDate: today });
    }
  }

  // ⏰ Due?
  const times = Array.isArray(settings.times) ? settings.times : [];
  const due = times.includes(nowHM);
  if (!due) {
    return res.status(200).json({ ok: true, info: "not due", berlinTime: nowHM, berlinDate: today });
  }

  // 🧯 Idempotency: ensure we send max once per (day,time)
  const sentKey = `machine_habits:sent:${today}:${nowHM}`;
  const already = await kvGet(sentKey);
  if (already) {
    return res.status(200).json({ ok: true, info: "already sent", berlinTime: nowHM, berlinDate: today });
  }

  const payload = JSON.stringify({
    title: "Machine Habits",
    body: "1 Haken reicht. Woche sichern. 💪",
  });

  try {
    await webpush.sendNotification(sub, payload);

    // Persist sent marker (optionally with TTL logic if you add it later)
    await kvSet(sentKey, true);

    return res.status(200).json({ ok: true, sent: nowHM, berlinTime: nowHM, berlinDate: today });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
