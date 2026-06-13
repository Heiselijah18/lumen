# Lumen

An AI companion + therapist marketplace app. This repo has two parts:

- **`backend/`** — Python/FastAPI API (accounts, mood logs, AI chat, therapist dashboard)
- **`frontend/`** — React (Vite) app

## 1. Push this to GitHub

From the root of this folder (the one containing `frontend/` and `backend/`):

```bash
git init
git add .
git commit -m "Initial Lumen app"
```

Then create a new repo on GitHub (click **New repository** on github.com —
don't initialize it with a README), and push:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lumen.git
git push -u origin main
```

(If you don't have `git` set up yet: install it from git-scm.com, then run
`git config --global user.name "Your Name"` and
`git config --global user.email "you@example.com"` once.)

## 2. Deploy the backend (Render)

1. Go to [render.com](https://render.com) and sign up / log in with GitHub.
2. Click **New +** → **Web Service**, and select your `lumen` repo.
3. Set:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (under **Environment**):
   - `SECRET_KEY` → generate a random string (e.g. run `python3 -c "import secrets; print(secrets.token_hex(32))"` locally and paste the result)
   - `ANTHROPIC_API_KEY` → your Anthropic API key
   - `ALLOWED_ORIGINS` → leave this for now, you'll set it after step 3
5. (Optional but recommended) Add a free **PostgreSQL** database from Render's
   dashboard, and set `DATABASE_URL` to the connection string it gives you.
   If you skip this, the app uses SQLite, which works but Render's free tier
   doesn't persist disk storage long-term — data may be wiped on redeploys.
6. Click **Create Web Service**. After it deploys, you'll get a URL like
   `https://lumen-backend.onrender.com`. Save it — you'll need it next.

## 3. Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up / log in with GitHub.
2. Click **Add New** → **Project**, and select your `lumen` repo.
3. Set:
   - **Root Directory**: `frontend`
   - Framework preset: Vite (Vercel usually detects this automatically)
4. Add an environment variable:
   - `VITE_API_URL` → the backend URL from step 2, e.g.
     `https://lumen-backend.onrender.com`
5. Click **Deploy**. You'll get a URL like `https://lumen.vercel.app`.

## 4. Connect them

Go back to Render → your backend service → **Environment**, and set:

- `ALLOWED_ORIGINS` → your Vercel URL, e.g. `https://lumen.vercel.app`

Save, which will trigger a redeploy. Now your frontend can talk to your
backend without CORS errors.

## 5. Try it

Visit your Vercel URL. You should be able to:

- Sign up as a client or therapist
- Chat with Lumen (if `ANTHROPIC_API_KEY` is set correctly)
- Log a mood check-in
- As a therapist, view clients once they're assigned (see `/therapist/claim/{client_id}` in the API docs at `https://your-backend-url/docs`)

## Updating the app later

Any time you push new commits to `main` on GitHub, both Render and Vercel
will automatically redeploy.

```bash
git add .
git commit -m "Describe your change"
git push
```

## Local development

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit .env with your real keys
uvicorn main:app --reload
```

**Frontend** (in a separate terminal):
```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

Visit `http://localhost:5173`.

## Next steps before this is production-ready

- Add real payments (Stripe Connect) — see `backend/README.md` for details
- Add therapist verification before clients can be assigned
- Review data-privacy requirements for mental health data in the regions
  you operate in (e.g. HIPAA in the US), and use a compliant database/host
- Add a "save note" endpoint for therapists (the UI placeholder is already there)
