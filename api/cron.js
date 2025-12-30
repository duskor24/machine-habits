import webpush from "web-push";
import { kvGet, kvSet } from "./_store.js";

function pad2(n){ return String(n).padStart(2,"0"); }
function ymd(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function hm(d){ return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  if (!secret || auth !== `Bearer ${secret}`) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:you@example.com";
  if (!publicKey || !privateKey) return res.status(500).json({ error: "Missing VAPID keys" });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const sub = await kvGet("machine_habits:subscription");
  if (!sub) return res.status(200).json({ ok: true, info: "no subscription yet" });

  const settings = await kvGet("machine_habits:settings") || { enabled:true, onlyIfNotDoneToday:true, times:["07:45","12:30","20:30"] };
  if (!settings.enabled) return res.status(200).json({ ok: true, info: "disabled" });

  const now = new Date();
  const today = ymd(now);
  const nowHM = hm(now);

  if (settings.onlyIfNotDoneToday) {
    const doneToday = await kvGet(`machine_habits:done:${today}`) || false;
    if (doneToday) return res.status(200).json({ ok: true, info: "already done today" });
  }

  const due = (settings.times || []).includes(nowHM);
  if (!due) return res.status(200).json({ ok: true, info: "not due" });

  const sentKey = `machine_habits:sent:${today}:${nowHM}`;
  const already = await kvGet(sentKey);
  if (already) return res.status(200).json({ ok: true, info: "already sent" });

  const payload = JSON.stringify({ title:"Machine Habits", body:"1 Haken reicht. Woche sichern. 💪" });

  try {
    await webpush.sendNotification(sub, payload);
    await kvSet(sentKey, true);
    return res.status(200).json({ ok: true, sent: nowHM });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
