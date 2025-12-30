# Machine Habits — Schnellsetup (so wenig Schritte wie möglich)

## Was du bekommst
- iOS PWA (GitHub Pages) mit Weekly-Streak (5/7), Habit-Liste, Reset-Logik
- Push + Reminder-Zeiten in der App
- Vercel Backend (Push API)
- GitHub Actions Cron (alle 5 Minuten) schickt Push zu deinen Zeiten

---

## Schritt 1 — ZIP ins Repo hochladen
1) Entpacke diese ZIP lokal
2) In dein GitHub Repo root hochladen/ersetzen:
   - docs/
   - api/
   - package.json
   - .github/

Commit.

---

## Schritt 2 — GitHub Pages
Repo → Settings → Pages
- Source: Deploy from branch
- Branch: main
- Folder: /docs

---

## Schritt 3 — Vercel Backend
Vercel → New Project → importiere dein Repo → Deploy

Dann in Vercel:
### (A) Deployment Protection aus
Project → Settings → Deployment Protection → Disabled

### (B) Upstash Redis (Free)
Project → Storage → Create → Upstash Redis → Connect to Project
→ Dadurch entstehen automatisch:
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

### (C) Env Vars setzen
Project → Settings → Environment Variables
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT   (z.B. mailto:du@domain.de)
- CRON_SECRET     (z.B. mh_super_geheim_123)

Redeploy.

---

## Schritt 4 — API_BASE eintragen (einmalig)
In GitHub: docs/index.html
Ganz oben:
const API_BASE = "PASTE_YOUR_VERCEL_URL_HERE";
ersetzen durch deine Vercel URL:
const API_BASE = "https://DEIN-PROJEKT.vercel.app";

Commit.

---

## Schritt 5 — GitHub Actions Secrets
Repo → Settings → Secrets and variables → Actions → New repository secret
- CRON_URL: https://DEIN-PROJEKT.vercel.app/api/cron
- CRON_SECRET: (genau derselbe Wert wie in Vercel)

---

## Schritt 6 — iPhone
1) Öffne deine GitHub Pages URL in Safari
2) Teilen → „Zum Home-Bildschirm“
3) App vom Homescreen öffnen
4) Push aktivieren → erlauben
5) Test-Push drücken
6) Zeiten einstellen → „Zeiten speichern“

Fertig.
