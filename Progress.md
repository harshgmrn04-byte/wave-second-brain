# Wave — Progress

**Updated:** 16 October 2026\
**Project directory:** `/Users/harsh/Projects/Wave - Second Brain`\
**Current phase:** 0 — repository foundation complete; Phase 1 awaits discussion\
**Overall state:** local Git repository on `main` with one baseline commit; no remote or app implementation

## Read this first in a new chat

Read [AGENTS.md](AGENTS.md) for the durable working agreement, [Architecture Design.md](Architecture%20Design.md) for the proposed design, [Build Plan.md](Build%20Plan.md) for the staged work, and this file for actual progress. Verify the live directory; the user's latest request always wins. Do not infer that a feature is implemented because the architecture or plan describes it. The user wants a senior engineer who challenges weak assumptions, explains unfamiliar concepts and production trade-offs to a beginner, and pauses at phase checkpoints rather than one-shotting the app.

The user intends to start a **new chat for each phase**. These repository files are the handoff; past chat memory is not required. Codex recognizes a root `AGENTS.md` as repository guidance when working here, but a fresh chat should still be opened in this directory and told the intended phase. Other coding agents may need to be explicitly directed to read it.

## Verified state of this new directory

- The directory existed and was empty when first inspected on 16 October 2026.
- `Architecture Design.md`, `Build Plan.md`, and `Progress.md` were created from scratch for the clean rebuild. `AGENTS.md` was added afterward to preserve the mentoring and phase-gating workflow across chats.
- Git was initialized here on 16 October 2026 on `main`, and the user approved a first local baseline commit. No remote or push has been made. The user chose to keep the repository local for now and the working name **Wave Second Brain**.
- `.gitignore` excludes local secrets, dependencies, build output, Python caches, and editor/OS files; `.env.example` is allowed. `README.md` identifies the project and points to the handoff documents.
- There is no `frontend/`, `backend/`, database migration, package lockfile, virtual environment, application code, test suite, Supabase project configuration, or deployment here.
- No application tests can yet be run in this directory because there is no application code.
- The older `/Users/harsh/Projects/Wave` folder contains a preliminary prototype. It is **not** progress in this new project and must not be copied, deleted, committed, or used as the baseline unless the user explicitly chooses that.

## Decisions carried into the rebuild

| Topic | Current direction | Certainty |
| --- | --- | --- |
| Frontend | React; TypeScript + Vite proposed; no Next.js | React/no Next.js agreed; tooling strongly preferred |
| API/processing language | Python + FastAPI; Python processing code | Agreed direction; execution topology still open |
| Managed data | Supabase-hosted PostgreSQL, Auth, private Storage when needed | Chosen direction; no project created here |
| Demo | Interactive seeded public experience without sign-in | Requirement |
| Grouping | Real dynamic reclustering, including changes to existing memberships | Priority requirement; algorithm/host unresolved |
| Chat | Excluded from initial release | Requirement |
| LLM key | Core path should work without one | Requirement; compute still needs resources |
| Multilingual extraction | Broad support may be deferred; preserve Unicode and report limits | Scope intentionally open |
| Deployment | Low-cost/best-effort preferred; no free 24/7 processing guarantee | Budget/host choice unresolved |
| Learning workflow | One phase/new chat, senior critique plus beginner-friendly explanations, verify a small slice, then hand off | Agreed working approach |
| Git workflow | Explain commits/branches/remotes; commit coherent verified slices and push regularly after a remote is chosen and secrets are checked | Working practice; no Git actions performed yet |
| Hosting feasibility | Probe early after the local skeleton; final release hardening still comes later | Sequencing decision, not a provider choice |

Do not equate “multilingual extraction deferred” with “all non-English notes prohibited,” or “dynamic reclustering required” with “semantic cross-language grouping guaranteed.” Those are separate product decisions.

## What has not been decided

Initial source types beyond notes; guest personal saves versus seeded demo only; exact login method; expected collection size; clustering representation/model and quality bar; reclustering triggers; worker/queue hosting; strict monthly budget; production hosts; OCR/transcription; and release date. Ask when each decision becomes necessary, not all at once.

## Phase 0 checks on 16 October 2026

- `git init -b main` succeeded after workspace permission escalation for `.git`.
- Before the commit, `git status --short --branch` showed six untracked foundation files and no commits on `main`: `.gitignore`, `AGENTS.md`, `Architecture Design.md`, `Build Plan.md`, `Progress.md`, and `README.md`.
- `git remote -v` returned no remote. `git check-ignore -v` confirmed `.env`, `.env.local`, `backend/.venv`, `frontend/node_modules`, and `frontend/dist` are ignored, while `.env.example` is allowed.
- File inventory showed only the six foundation files. A targeted scan for common private-key and provider-key patterns found no matches. This is a limited check, not a guarantee about all possible secret formats.
- `git diff --cached --check` passed after replacing intentional trailing-space Markdown breaks with backslash breaks. The staged review showed exactly the six approved files.
- The first local commit, `chore: establish Wave repository foundation`, was created on `main`. `Progress.md` was then updated with the observed result and folded into that same baseline commit. Check `git log -1` for its final hash.

## Next checkpoint: discuss Phase 1

1. Stop at the Phase 0 exit gate. Confirm the final commit and clean working tree; keep the repository local until the user chooses a remote destination.
2. Discuss the Phase 1 local React/FastAPI skeleton, commands, and trade-offs with the user before implementing it. Do not start it as part of this phase.

**Stop condition for the next coding agent:** after Phase 0 is verified, hand the result to the user and discuss Phase 1 before implementing it.

At every later phase handoff, record in this file the exact changes, tests and results, Git actions actually performed, decisions and rationale, unresolved risks, and next checkpoint. Do not replace evidence with “done” based only on a plan. Update architecture or sequencing when decisions change. Do not start the next phase in the same chat unless the user explicitly asks.

## Suggested first message for a fresh coding chat

> We are rebuilding Wave in `/Users/harsh/Projects/Wave - Second Brain`. Read `AGENTS.md`, `Architecture Design.md`, `Build Plan.md`, and `Progress.md`. Start with Phase 0 repository setup only. Verify the directory's actual state, challenge questionable assumptions, explain each step for a beginner, and do not import or delete the previous prototype. Update `Progress.md` with what was really done, then stop at the phase checkpoint.
