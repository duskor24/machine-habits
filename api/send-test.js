import webpush from "web-push";
import { getSubscription } from "./_store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:you@example.com";

  if (!publicKey || !privateKey) return res.status(500).json({ error: "Missing VAPID keys" });

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const sub = await getSubscription();
  if (!sub) return res.status(400).json({ error: "No subscription saved yet. Tap 'Push aktivieren' first." });

  const payload = JSON.stringify({ title: "Machine Habits", body: "Reminder: kurz abhaken 💪" });

  try {
    await webpush.sendNotification(sub, payload);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
