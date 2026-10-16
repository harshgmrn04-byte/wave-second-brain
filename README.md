# Wave

Wave is a clean rebuild of a personal second brain for saving material, finding it later, and grouping related items.

**Status:** Phase 3 local interface preview. The public React page shows an animated capture-to-space walkthrough and an interactive card map. It uses generic UI placeholders, not seeded source content. No upload, extraction, personal save, or automatic grouping runs on this page.

## Run the frontend

Requires Node.js and npm. From the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL Vite prints (usually <http://localhost:5173/>). Pause or select a walkthrough step, open cards and follow their connections below, or switch between the green light and dark themes in the header. The page starts with the device's color preference and remembers a chosen theme on that device. The switch uses a circular reveal when the browser supports it and reduced motion is off. Stop the server with `Ctrl+C`. In `frontend/`, run `npm test` for the page test and `npm run build` for the TypeScript check and production bundle.

## Run the API

Requires Python 3.12–3.14 and `uv`. In another terminal, from the repository root:

```sh
cd backend
uv sync --locked
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open <http://127.0.0.1:8000/health/live> for the JSON health response and <http://127.0.0.1:8000/docs> for FastAPI's generated API page. Stop the server with `Ctrl+C`. In `backend/`, run `.venv/bin/python -m pytest -q` for the API test and `.venv/bin/ruff check .` for lint.

The frontend works while the API is stopped. They are not connected yet. `npm ci` and `uv sync --locked` install the versions recorded in `package-lock.json` and `uv.lock`; `node_modules/` and `.venv/` stay local and out of Git.
