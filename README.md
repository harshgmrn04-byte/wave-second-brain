# Wave

Wave is a clean rebuild of a personal second brain for saving material, finding it later, and grouping related items.

**Status:** Phase 3 public interface preview remains live on Vercel. Local Phase 4 code now supports Google sign-in and private plain-text note save/list/delete through FastAPI and a limited Supabase Postgres role. The public page still shows only a concept preview; it does not run extraction, clustering, or visitor saves. Link and image resources are future work. The Phase 4 code has not been pushed or deployed, so the live Vercel frontend still runs the earlier Phase 3 version.

## Run the frontend

Requires Node.js and npm. From the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL Vite prints (usually <http://localhost:5173/>). Pause or select a walkthrough step, open cards and follow their connections below, or switch between the green light and dark themes in the header. The page starts with the device's color preference and remembers a chosen theme on that device. The switch uses a circular reveal when the browser supports it and reduced motion is off. Stop the server with `Ctrl+C`. In `frontend/`, run `npm test` for the page test and `npm run build` for the TypeScript check and production bundle.

For local Google sign-in, copy `frontend/.env.example` to `frontend/.env.local`, then set the development project's URL and `sb_publishable_` key. Set `VITE_WAVE_API_URL=http://127.0.0.1:8000` for the local note API. The `.env.local` file is ignored by Git. Configure Supabase Auth's Site URL as `http://localhost:5173` and allow `http://localhost:5173/auth/callback` as a redirect URL. With these values present, the header shows **Get started** or **My library** according to the session. The same Google button signs in an existing user or creates an account on first use. The `/library` page saves and lists plain-text notes when FastAPI is running; delete removes the live database row after a confirmation. Keep any `sb_secret_` or `service_role` key out of the frontend.

### Where frontend changes go

| To change | Start here |
| --- | --- |
| Public landing sections and interactive preview | `frontend/src/features/landing/` |
| Google sign-in, callback, or session behavior | `frontend/src/features/auth/` |
| Signed-in library page | `frontend/src/features/library/` |
| Wave mark or theme switching behavior | `frontend/src/shared/brand/` or `frontend/src/shared/theme/` |
| Light or dark colors for any component | `frontend/src/styles/themes/light.css` or `dark.css` |
| Component layout, responsive rules, or the font stack | `frontend/src/styles/components/`, `responsive.css`, or `base.css` |

The same React components render in both themes; only their appearance rules differ. The SVG Wave mark lives in a component, so there is no separate image asset yet. Add an asset folder when fonts or images are actually introduced.

## Run the API

Requires Python 3.12–3.14 and `uv`. In another terminal, from the repository root:

```sh
cd backend
uv sync --locked
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/health/live> for the JSON health response and <http://127.0.0.1:8000/docs> for FastAPI's generated API page. Stop the server with `Ctrl+C`. In `backend/`, run `.venv/bin/python -m pytest -q` for the API test and `.venv/bin/ruff check .` for lint.

The public frontend works while the API is stopped. With `VITE_WAVE_API_URL` set in ignored `frontend/.env.local`, a signed-in library shows **Check local API sign-in**; this read-only check sends the session token to FastAPI and confirms the returned user ID. Note saves need the API, Auth, and database to be available; failures are shown and the draft remains in the form. `npm ci` and `uv sync --locked` install the versions recorded in `package-lock.json` and `uv.lock`; `node_modules/` and `.venv/` stay local and out of Git.

### Development database security proof

The first private-note migration is [backend/migrations/0001_private_notes.sql](backend/migrations/0001_private_notes.sql). It creates a limited `wave_api` login, a `wave.resources` table, owner RLS, and grants for note save/list/delete. It was applied to the current development project and the rollback-only two-identity RLS proof passed on 17 October 2026; a fresh project still needs its own migration and proof. The runtime API must use `wave_api`, never the `postgres` migration login or a service-role key. The development project's Data API was confirmed off by the user after migration.

To apply it in a fresh development project, copy `backend/.env.example` to ignored `backend/.env.local`, fill in the Supabase URL and publishable key, then open that project's **Connect → Session pooler** dialog and note its hostname. From `backend/`, run `.venv/bin/python scripts/setup_dev_db.py`. Enter the hostname and the project's **database** password at the hidden prompt. The script uses `postgres` only for this one-time migration, generates a separate `wave_api` password, and saves only the limited connection URL in `backend/.env.local`. Do not paste either password, a connection URL, or an access token into chat. Then run `.venv/bin/python scripts/prove_rls.py`; its synthetic inserts are rolled back. The pooler host must be copied from Supabase rather than guessed from the region. If setup fails, report the error text without secrets.

Phase 4 no longer includes 30-day Trash. The intended delete removes the live note row immediately; provider backups have their own retention behavior.

## Local development handoff

Read `AGENTS.md`, `Progress.md`, `Architecture Design.md`, and `Build Plan.md` in this workspace before starting another feature chat. They record the Phase 4 decisions, what was actually tested, and the next checkpoint. These four handoff files are intentionally Git-ignored and available only in this local workspace; they are not present in a fresh GitHub checkout. Keep secrets in ignored local environment files and do not paste database passwords or private keys into chat.
