# Lumen API (backend)

A Python/FastAPI backend for Lumen: accounts (client & therapist), mood
check-ins, AI companion chat, therapist client lists, and subscription plans.

## 1. Setup

```bash
cd lumen-backend
python3 -m venv venv
source venv/bin/activate          # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Environment variables

Create a `.env` file (or just export these in your shell) before running:

| Variable            | Required | Description |
|---------------------|----------|-------------|
| `SECRET_KEY`        | Recommended | Long random string used to sign login tokens. If not set, a dev default is used — **do not use the default in production**. |
| `ANTHROPIC_API_KEY` | Needed for chat | Your Anthropic API key, so the `/chat` endpoint can talk to Claude. Without it, Lumen replies with a placeholder message. |
| `DATABASE_URL`      | Optional | Defaults to a local SQLite file (`sqlite:///./lumen.db`). Set this to a Postgres URL for production, e.g. `postgresql://user:pass@host/dbname`. |

Example (Linux/macOS):

```bash
export SECRET_KEY="a-long-random-string"
export ANTHROPIC_API_KEY="sk-ant-..."
```

## 3. Run the server

```bash
uvicorn main:app --reload
```

The API will be live at `http://127.0.0.1:8000`, with interactive docs at
`http://127.0.0.1:8000/docs`.

The database tables are created automatically on first run (SQLite file
`lumen.db` will appear in this folder).

## 4. How the pieces fit together

- **`database.py`** – database connection (SQLite by default).
- **`models.py`** – tables: `users`, `therapist_profiles`, `assignments`
  (which therapist supports which client), `mood_logs`, `chat_messages`,
  `subscriptions`.
- **`schemas.py`** – request/response shapes (Pydantic).
- **`auth.py`** – password hashing + login tokens (JWT).
- **`lumen_ai.py`** – the Lumen companion's system prompt, crisis-language
  detection, and the call to Claude.
- **`main.py`** – the API routes.

## 5. Key endpoints

| Method & Path | Who | What |
|---|---|---|
| `POST /signup` | anyone | Create an account (`role`: `client` or `therapist`) |
| `POST /login` | anyone | Get a login token (send as `username` + `password` form fields) |
| `GET /me` | logged in | Your account info |
| `POST /mood` | client | Log today's mood (1–5) |
| `GET /mood` | client | Your mood history |
| `POST /chat` | client | Send a message to Lumen, get a reply |
| `GET /chat` | client | Your chat history |
| `GET /subscription` | client | Your current plan |
| `POST /subscription` | client | Change plan (demo only — see below) |
| `GET /therapist/clients` | therapist | Your clients + mood history |
| `POST /therapist/claim/{client_id}` | therapist | Take on an unassigned client |
| `GET /therapist/profile` / `PUT /therapist/profile` | therapist | Bio, specialties, license number |

All endpoints except `/signup`, `/login`, and `/` require an
`Authorization: Bearer <token>` header with the token from `/login`.

## 6. Connecting the frontend

The React prototype calls Claude directly from the browser. To use this
backend instead:

1. Point the frontend's `fetch` calls at this API (e.g. `http://localhost:8000`).
2. After login, store the returned token (e.g. in React state) and send it
   as `Authorization: Bearer <token>` on every request.
3. Replace the in-browser `askLumen()` call with `POST /chat`.

## 7. Payments (next step)

`/subscription` currently just records the chosen plan with no real
payment — it's a placeholder. For real payments and your commission model:

1. Create a [Stripe](https://stripe.com) account and enable
   **Stripe Connect** (so each therapist can have their own connected
   account for payouts).
2. On `POST /subscription`, instead of writing directly to the database,
   create a Stripe Checkout Session for the chosen plan.
3. Set up a Stripe webhook endpoint (e.g. `POST /webhooks/stripe`) that
   listens for `checkout.session.completed` and `invoice.paid` events, and
   updates the `subscriptions` table accordingly.
4. For the commission split, use
   [Stripe Connect's application fee](https://docs.stripe.com/connect/destination-charges)
   feature, so a percentage of each payment routes to your platform account
   and the rest to the therapist's connected account.

## 8. Security notes before going live

- Set a strong, random `SECRET_KEY`.
- Restrict CORS `allow_origins` in `main.py` to your actual frontend domain.
- Use HTTPS in production.
- Mental health data is sensitive — research the data-privacy regulations
  that apply to your users (e.g. HIPAA in the US) and use encrypted storage
  and a compliant hosting provider.
- Add a verification step for therapist sign-ups (e.g. manual review of
  license numbers) before they can see real clients.
