# Wave — Build Plan

**Status:** staged plan; requirements may change\
**Updated:** 16 October 2026\
**Current phase:** 0 — repository setup, **not** feature development

Read [AGENTS.md](AGENTS.md) for the durable mentoring/workflow agreement, [Architecture Design.md](Architecture%20Design.md) for the proposed system, and [Progress.md](Progress.md) for the actual state. A new chat should verify the live directory as well. The newest direct user request takes priority. The old project folder is not this project's starting codebase.

## Working agreement for every phase

The user is learning and wants senior-engineer guidance, not an agent that agrees with every suggestion or builds the entire app in one shot. At each phase:

1. Explain the goal in plain language. Give a genuine senior-engineer recommendation: what is sound, what is risky or wrong, and what evidence would change the decision. Teach unfamiliar concepts rather than merely naming tools.
2. Show the exact files, commands, accounts, and costs required **for that phase only**. Prefer project-local dependencies; do not ask for Docker, a version manager, or provider accounts before they are needed.
3. Discuss meaningful trade-offs with the user before choosing an irreversible, paid, security-sensitive, or scope-changing path.
4. Implement one small, working slice. Run relevant tests and show how the user can verify it manually.
5. Introduce production concerns alongside the feature that needs them: tests, authorization, migrations, limits, logging, failure behavior, and recovery. Do not defer all of this to launch or build unused infrastructure prematurely.
6. Update `Progress.md` with observed facts, and update the architecture/plan if a decision changed. Stop at the agreed checkpoint before starting the next phase—even if a fresh chat will handle the next one.

No phase heading is blanket authorization to create accounts, spend money, deploy publicly, delete user work, commit, or push. Do not install every future dependency at the beginning.

### Git cadence for a beginner

- In Phase 0, first understand local repository, branch, commit, and remote. Make a clean baseline commit only after reviewing what it contains. Choose a GitHub destination explicitly before any push.
- After that, commit a **coherent, tested slice** locally. A commit is a checkpoint, not a record of every keystroke. Push reviewed commits to the chosen remote regularly for backup and collaboration—especially at phase boundaries and before risky work—but never push secrets or broken work presented as complete.
- Keep `main` understandable and working. A short feature branch is useful for risky or multi-session changes; a solo beginner does not need ceremonial branches or pull requests for every tiny edit. Explain the trade-off before adopting a branch/PR convention.
- Before a commit/push, inspect `git status` and the diff, check tests, and verify `.env`, credentials, virtual environments, and build outputs are excluded. The agent should show the exact proposed Git action and target; the user decides when to perform it.

## Phase 0 — Repository foundation (next)

**Goal:** turn this blank directory into a clean, understandable local repository, without app feature code.

**Discuss first:** repository name, whether to connect the existing or a new GitHub remote, what belongs in the first commit, and whether the old prototype is to be ignored or intentionally copied later. The current intention is a clean rebuild; copying old code is not assumed.

**Work after agreement:** initialize Git, add a minimal `.gitignore` for secrets/build artifacts, keep `AGENTS.md` and the three project docs, add a short `README.md` with setup status, and make a deliberate baseline commit only when the user is ready. Check remote state before adding/pushing; do not assume a configured URL exists in this new directory.

**Exit gate:** `git status` is understandable; no secrets or virtual environments are tracked; user can describe what a repository, commit, branch, and remote mean. No frontend/backend implementation is required to complete Phase 0.

## Phase 1 — Tiny local application skeleton

**Goal:** prove the chosen languages and tools work on the user's Mac, not implement product features.

**Proposed slice:** `frontend/` with React + TypeScript + Vite showing a simple page; `backend/` with FastAPI returning a health response and generated OpenAPI docs. Use npm's local `node_modules` and `uv`'s local `backend/.venv`. Add one tiny test on each side. Keep API and UI runnable independently. No Supabase credentials, worker, OCR, or AI model yet.

**Exit gate:** fresh install, frontend build/test, backend test/lint, and both local servers run using documented commands. Explain HTTP request/response and why the frontend is not the API.

## Phase 2 — Early deployment and processing feasibility spike

**Goal:** find deployment constraints while the system is still small, not after building the clustering pipeline.

**Proposed slice:** compare current official limits for a static frontend, Supabase, an API host, and possible processing execution. Estimate cold-start delay, RAM/CPU, monthly budget, and what happens to jobs when compute sleeps. If the user chooses and authorizes it, deploy only a tiny disposable API/static probe with no personal data, then measure actual wake time and resource use. An external deployment is optional; a read-only provider assessment is still useful but must be labeled unverified until tested.

**Exit gate:** document a feasible candidate and explicit unknowns. Do **not** assert that a local embedding model or a separate free worker fits yet; re-test with the real clustering candidate in Phase 5. No public product deployment is required here.

## Phase 3 — Public, no-sign-in demo

**Goal:** give a visitor something honest and interactive before asking them to create an account.

**Proposed slice:** landing page plus synthetic/permission-safe seeded notes and links, card/detail view, collection filter, and real client-side **keyword** search. The demo must work with the backend stopped. Sample clusters may be hand-labeled initially but must be labeled as such; do not claim live AI, real visitor saves, or generated reclustering. Later, replace a before/after cluster example with output from the actual tested pipeline.

**Exit gate:** no-account interaction works on mobile and keyboard; empty states and limitations are clear; no private data or backend secret is shipped in the bundle.

## Phase 4 — First real personal-library slice

**Goal:** a signed-in user can reliably save, see, and delete one plain-text note.

**Decision gate:** create a separate Supabase **development** project only when this phase starts. Confirm initial sign-in method and data-retention expectations.

**Proposed slice:** versioned SQL migration for `items`, owner-scoped access, Supabase Auth, FastAPI token verification, typed note endpoints, and React form/list. Start with notes because they need no scraping or model. Add two-user isolation, validation, duplicate/error, and deletion tests. A plain note can be stored synchronously; do not add a queue simply to say there is a worker.

**Exit gate:** note save/list/delete works end to end; another user cannot read or mutate it; a failed request is visible rather than silently lost. Secrets remain outside Git.

## Phase 5 — Reclustering proof of concept (priority feature)

**Goal:** prove genuine dynamic reclustering with a small, representative test collection before committing to a model or worker host.

**Proposed slice:** create consent-safe synthetic/sample notes with related groups, ambiguous items, and outliers. Compare a cheap lexical representation with a compact embedding candidate **only if hosting is feasible**. Benchmark memory, startup, runtime, coherence, and cross-language failure cases. Implement the selected grouping as an isolated Python module with deterministic tests for create, move, split, merge, unclustered, stable IDs, and manual pins. Choose thresholds using examples rather than arbitrary confidence claims.

**Exit gate:** adding/editing/deleting a sample item can change **existing** memberships; interrupted runs leave prior state intact; limitations are documented. If no affordable representation produces acceptable groups, report that before promising the feature publicly.

## Phase 6 — Integrate grouping with the real library

**Goal:** personal notes trigger initial grouping and safe later reclustering.

**Decision gate:** choose synchronous bounded work, an on-demand execution strategy, or a separately hosted worker using measurements and the user's budget/latency preference. Render Free cannot host a separate Free background worker; a sleeping process cannot process jobs while idle.

**Proposed slice:** durable `needs_reclustering`/job state if asynchronous, per-user run versions, atomic membership updates, retry after failure, manual move/pin/rename, `Unclustered` view, and UI indication when grouping is provisional or stale. Keep processing idempotent. Do not run an expensive full recomputation on every save without measuring the cost.

**Exit gate:** the Phase 5 scenarios pass against the database/API, including a concurrent save, a duplicate job, and a failed run; manual corrections survive all automatic runs.

## Phase 7 — Search and additional sources, chosen incrementally

**Goal:** improve retrieval and capture without undermining the reliable core.

**Order to consider:** keyword search over notes → safe link save and public metadata → readable article extraction → chunked long content → semantic retrieval **if** model quality and hosting fit. PDF selectable text may follow. OCR, image understanding, multilingual transcription, and social-site extraction are separate later decisions. Do not claim any language/source is understood just because its URL or file was saved.

**Exit gate for each source adapter:** provenance and extraction quality visible; source failures have honest fallbacks; security limits and tests exist; existing notes/search/grouping still work.

## Phase 8 — Release deployment and hardening

**Goal:** publish an honest portfolio release with explicit operating limits.

**Decide with evidence:** revisit the Phase 2 host candidates using actual Phase 5–7 measurements; choose static frontend host, Supabase tier, API/processing host, a real monthly budget ceiling, model RAM/CPU, cold-start behavior, and whether delayed jobs are acceptable. A static landing page being available is not the same as 24/7 saves and reclustering. Free-tier keepalive cron is not an uptime SLA.

**Exit gate:** authentication and isolation tests pass; rate and upload limits exist; monitoring shows errors and stale jobs; a recovery/backup path is documented; public copy accurately describes live versus seeded features and free-tier delays.

## Scope and schedule control

There is deliberately **no fixed completion date** here. The user has not finalized all requirements, and the old 16–22-week forecast covered a broader extraction/multilingual scope. Re-estimate only after the relevant decisions and technical spikes. If a phase grows, split it; do not silently absorb OCR, chat, advanced scraping, or paid services into the current milestone.

At the end of each phase, update [Progress.md](Progress.md) with: completed files/commands, tests and results, decisions and rationale, unresolved issues, and the exact next checkpoint. This keeps future chats grounded in observed state rather than an agent's memory.
