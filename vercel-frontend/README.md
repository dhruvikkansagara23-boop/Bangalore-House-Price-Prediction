# Bangalore House Price Predictor — static frontend (for Vercel)

This is your existing Flask templates/static files, rendered once into plain
HTML and rewired to call your Render backend directly, so the page itself
loads instantly. **The prediction API calls still hit Render, so the very
first API call after Render has been idle can still take 30–60s** — that
part is unaffected by this change; see the "Fixing the cold start" note below.

## What changed vs. the Flask app

- `home.html/predict.html/.../about.html` → rendered to plain
  `index.html/predict.html/.../about.html` (no Jinja, no server needed).
- Every `fetch("/...")` call to your own API in `static/js/*.js` now calls
  `API_BASE + "/..."` instead, where `API_BASE` is defined in
  `static/js/config.js`.
- `static/js/config.js` holds your Render URL. **If you ever redeploy your
  backend to a different URL, this is the only place you need to change.**
- `base.js` now fires a harmless background "warm-up" request to Render on
  every page load, so the backend starts waking up the moment someone opens
  the site instead of waiting for them to click "Estimate Price".
- `vercel.json` adds clean URLs so `/predict`, `/dashboard`, `/compare`,
  `/history`, `/about` work exactly like they did on Flask.

## Deploy steps

1. Push this folder as a new GitHub repo (or a `frontend/` folder inside
   your existing repo — Vercel lets you set a "Root Directory").
2. Go to https://vercel.com/new, import the repo.
3. Framework preset: **Other** (it's a static site, no build step needed).
4. Root Directory: point it at this folder if it's nested.
5. Deploy. You'll get a `https://<something>.vercel.app` URL.

## One thing to update on the Render backend

Your Flask app currently does `CORS(app)` (wide open). Once you know your
Vercel URL, tighten it in `server/app.py`:

```python
CORS(app, origins=[
    "https://your-project.vercel.app",
    "http://localhost:5000",  # keep for local testing
])
```

Redeploy Render after this change.

## Reminder on the cold-start issue

This split makes the **page** load instantly. The **prediction** itself will
still be slow on the first request after Render has been idle, because
that's the backend waking up, not the frontend rendering. To fix that too:
- Upgrade the Render service to a paid instance (no sleep), or
- Set up a free keep-alive ping (e.g. UptimeRobot hitting your Render URL
  every 10 minutes) to stop it from ever going fully idle.
