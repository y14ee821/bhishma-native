# Deploying Bhishma to Free Hosting

This guide deploys the whole stack on **100% free** tiers:

| Component | Host | Free tier |
|---|---|---|
| Frontend (Expo Web) | **Vercel** | 100 GB bandwidth / mo, unlimited static deploys, HTTPS, custom domain |
| Backend (FastAPI) | **Render** Web Service | 750 hrs / mo, HTTPS. **Sleeps after 15 min idle → first request after sleep takes ~30 s** |
| Database | **MongoDB Atlas** | Free M0 cluster (already configured) |
| MQTT broker | `wss://test.mosquitto.org:8081/mqtt` | Public, free |

The repo is structured so that:

- `bhishma-native/` → frontend (deployed by Vercel; sub-dir is set in the Vercel project)
- `bhishma-backend/` → backend (deployed by Render via the root-level `render.yaml` blueprint)

---

## 0. Prerequisites

1. Push all changes to GitHub on `main`:
   ```bash
   git status
   git add .
   git commit -m "chore: add Vercel + Render deployment configs"
   git push origin main
   ```
2. Make sure `.env` files are **not** committed (they are in `.gitignore` already).
3. Have accounts on:
   - <https://vercel.com> (sign in with GitHub)
   - <https://render.com> (sign in with GitHub)
   - Your existing Google Cloud project for OAuth

---

## 1. Deploy the backend on Render

The repo includes a [`render.yaml`](./render.yaml) Blueprint that defines the service. You only need to fill in the secret env vars in the dashboard.

1. Go to <https://dashboard.render.com/blueprints> → **New Blueprint Instance**.
2. Connect the GitHub repo `y14ee821/bhishma-native`. Render will detect `render.yaml`.
3. When prompted, set the following secrets (copy values from `bhishma-backend/.env`):

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET_KEY` | A strong random string |
   | `GOOGLE_CLIENT_ID` | Web OAuth client id |
   | `GOOGLE_ANDROID_CLIENT_ID` | Android OAuth client id |
   | `GOOGLE_CLIENT_SECRET` | Web OAuth client secret |
   | `ALLOWED_ORIGINS` | Leave **blank for now**; you'll fill this in after Vercel gives you a domain (Step 3.4) |

4. Click **Apply**. First build takes ~3–5 min.
5. When it goes green, copy the service URL — it looks like
   `https://bhishma-backend.onrender.com`
6. Verify it's live:
   ```
   GET https://bhishma-backend.onrender.com/health
   → {"status":"healthy"}
   ```

> **MongoDB Atlas note.** Atlas blocks unknown IPs. Either add `0.0.0.0/0` to **Network Access → IP Access List** (simple) or add Render's egress IPs (more locked-down — see Render dashboard → service → "Connect").

---

## 2. Deploy the frontend on Vercel

1. Go to <https://vercel.com/new>, **Import Git Repository**, pick `y14ee821/bhishma-native`.
2. In the **Configure Project** step:
   - **Root Directory** → click *Edit* → set to `bhishma-native`
   - **Framework Preset** → *Other* (the included `vercel.json` defines the build)
   - **Build Command**, **Output Directory**, **Install Command** → leave on "From `vercel.json`"
3. Expand **Environment Variables** and add (Production + Preview):

   | Name | Value |
   |---|---|
   | `EXPO_PUBLIC_API_URL` | `https://bhishma-backend.onrender.com` (your Render URL from Step 1.5) |
   | `REACT_APP_MQTT_HOST` | `wss://test.mosquitto.org:8081/mqtt` |
   | `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Your Google **Web** OAuth client id |
   | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same as above |
   | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Your Google iOS client id |
   | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Your Google Android client id |

4. Click **Deploy**. First build takes ~3–5 min and produces `dist/` via `expo export --platform web`.
5. When it goes green, Vercel assigns a domain like `https://bhishma-native.vercel.app`.

> **Why `EXPO_PUBLIC_*`?** Expo only inlines env vars whose names start with `EXPO_PUBLIC_` (or a few legacy `REACT_APP_*`) into the web bundle. Anything else is invisible to the browser.

---

## 3. Wire the two together

### 3.1 Tell the backend which origin is allowed

1. Render dashboard → `bhishma-backend` → **Environment** → edit `ALLOWED_ORIGINS`:
   ```
   https://bhishma-native.vercel.app
   ```
   (Add any preview/custom domains as a comma-separated list.)
2. Save → Render auto-restarts the service.

The backend now sends `Access-Control-Allow-Origin` only for your Vercel domain.

### 3.2 Update Google OAuth for the new web origin

In <https://console.cloud.google.com/apis/credentials> → open the **Web** OAuth client:

- **Authorized JavaScript origins** → add `https://bhishma-native.vercel.app`
- **Authorized redirect URIs** → add `https://bhishma-native.vercel.app` (and `https://bhishma-native.vercel.app/` if needed by `expo-auth-session`)

Without this, Google sign-in on the web will fail with `redirect_uri_mismatch` or `origin not allowed`.

### 3.3 Smoke test

Open `https://bhishma-native.vercel.app` and check:

- App loads (first load may be slow on Render cold start).
- Open browser DevTools → Network: API calls to `…onrender.com` return 200, no CORS errors.
- Google sign-in completes.
- MQTT connects (you should see your `📡 MQTT Configuration:` log).

---

## 4. Day-2: how updates work

- `git push origin main` → **both** Vercel and Render auto-deploy.
- Vercel also gives you **preview URLs** for every PR.
- To roll back: Vercel "Deployments" tab → click any prior build → "Promote to Production"; Render → "Manual Deploy" → pick a previous commit.

---

## 5. Known limitations on free tiers

| Limit | Mitigation |
|---|---|
| Render free service sleeps after 15 min idle (~30 s cold start) | Use an uptime pinger like <https://cron-job.org> hitting `/health` every 10 min. **Note: this consumes your 750 hrs/mo budget faster** — fine because keeping it awake 24×7 uses 720 hrs. |
| Vercel free: no commercial use, 100 GB bandwidth | Plenty for a hobby app |
| `test.mosquitto.org` is public and has no auth | Replace with [HiveMQ Cloud free](https://www.hivemq.com/mqtt-cloud-broker/) (100 connections free) for anything beyond demo use |
| MongoDB Atlas M0 = 512 MB storage | Stay within ~hundreds of users / few thousand docs |

---

## 6. Alternative free hosts (if Render/Vercel don't suit)

| Frontend alternatives | Backend alternatives |
|---|---|
| **Cloudflare Pages** — uncapped bandwidth, faster CDN, same build setup | **Fly.io** — 3 small machines free, doesn't sleep |
| **Netlify** — same as Vercel; same `dist/` output | **Koyeb** — 1 free service, doesn't sleep, 512 MB RAM |
| **GitHub Pages** — works for SPA but needs base-path config | **Hugging Face Spaces** — free FastAPI runtime |

The configs in this repo are portable: all you need is to produce `dist/` for the frontend and run `uvicorn main:app --host 0.0.0.0 --port $PORT` for the backend.

---

## 7. Troubleshooting

**Vercel build fails with peer-dependency errors**
The `vercel.json` install command uses `npm install --legacy-peer-deps` to be safe with React 19 / Expo SDK 54. If it still fails, switch to `yarn install` (Vercel detects `yarn.lock` automatically — just remove `installCommand` from `vercel.json`).

**`Mixed Content` errors in browser console**
You're calling `http://...` from an `https://...` page. Make sure `EXPO_PUBLIC_API_URL` starts with `https://` and `REACT_APP_MQTT_HOST` starts with `wss://`.

**`CORS error: No 'Access-Control-Allow-Origin'`**
Either `ALLOWED_ORIGINS` on Render doesn't include your Vercel URL, or Render's service is still restarting. Wait 30 s and retry.

**Google sign-in shows `redirect_uri_mismatch`**
You forgot Step 3.2.

**Render service stuck on "deploying"**
Check the build logs for missing system libs. `motor`/`pymongo` build wheels cleanly on Render's default Python 3.11.9, but if you bump versions you may need to add system packages.

**Expo web build OOM / slow on Vercel**
Vercel's default build container is 8 GB which is plenty for this app. If it ever fails, set env var `NODE_OPTIONS=--max_old_space_size=4096` in Vercel.
