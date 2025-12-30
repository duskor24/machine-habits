export default async function handler(req, res) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return res.status(500).json({ error: "Missing VAPID_PUBLIC_KEY" });
  res.status(200).json({ publicKey });
}
