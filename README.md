# Machine Habits – Push + GitHub Pages (ultra simpel)

Du brauchst 2 Deployments:
1) **Frontend** (die App) → GitHub Pages (kostenlos)
2) **Backend** (Push-Sender) → Vercel (kostenlos)

## A) Backend (Vercel) in 6 Klicks
1. Repo auf GitHub pushen.
2. Vercel → "Add New Project" → Repo importieren → Deploy.
3. In Vercel → Project → Settings → Environment Variables setzen:

**Pflicht:**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (z.B. `mailto:du@deinmail.de`)

**VAPID Keys erzeugen (lokal am Rechner, einmalig):**
```bash
npx web-push generate-vapid-keys
```

**Optional aber empfohlen (damit Push immer zuverlässig ist): Upstash Redis (free)**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

> Ohne Upstash geht’s für Tests, aber nicht 100% zuverlässig (Serverless cold starts).

4. Nach Deploy kopierst du deine Vercel URL, z.B.:
`https://dein-projekt.vercel.app`

## B) Frontend (GitHub Pages)
1. In `frontend/index.html` oben diese Zeile ändern:
```js
const API_BASE = "https://dein-projekt.vercel.app";
```
2. Commit & push.
3. GitHub Repo → Settings → Pages → Deploy from branch → `/frontend` auswählen (oder `docs`-Folder nutzen).
4. Öffne die GitHub Pages URL am iPhone in Safari.

## iPhone Setup
1. Safari → Teilen → **Zum Home-Bildschirm**
2. App vom Homescreen öffnen
3. "Push aktivieren" drücken
4. "Test-Push" drücken

Fertig.
