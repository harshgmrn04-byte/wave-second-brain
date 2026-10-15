# Wave — Architecture Design

**Status:** living design, not a claim that the application has been built\
**Updated:** 16 October 2026\
**Project directory:** `/Users/harsh/Projects/Wave - Second Brain`

## How to use this document

This file records the architecture and the reasons behind it. [AGENTS.md](AGENTS.md) contains the mentoring/workflow agreement; [Build Plan.md](Build%20Plan.md) defines the proposed order of work; [Progress.md](Progress.md) records what actually exists. A new coding agent should read all four and inspect the directory before changing files. The user's newest instruction overrides these documents. Do not silently turn a proposal or an old conversation into a requirement.

## Product intent and present boundaries

Wave is a personal second brain: a user saves useful material, finds it later, and sees related items grouped. The distinctive requirement is **genuine dynamic reclustering**: as the collection changes, existing items may move and clusters may be created, split, or merged. It is not enough to assign only new items to fixed categories.

The following direction has been discussed with the user:

- React on the frontend, without Next.js. TypeScript and Vite are the proposed tooling.
- Python/FastAPI for the API and Python for processing code; JavaScript `fetch` is enough for frontend HTTP calls. Axios is optional, not a backend.
- PostgreSQL hosted by Supabase, with Supabase Auth and private Storage when persistent personal libraries are introduced. PostgreSQL and Supabase are not two databases.
- A public landing page with an interactive, seeded demo that works without sign-in or a live backend.
- No chat/RAG assistant in the initial release. The core save/search/grouping path must not require an LLM API key.
- Broad multilingual OCR, transcription, and extraction may be deferred. Preserve original Unicode text and avoid claiming to understand unsupported content.
- Prefer low-cost deployment, but do not promise reliable 24/7 processing for free.

The exact source types, semantic-search quality, authentication methods, anonymous personal saving, hosting budget, and release date are **not finalized**. The user wants to decide these progressively. Do not treat the older `plan.md` in the previous directory as a locked specification.

## Logical architecture (target, not current implementation)

```text
Browser: React + TypeScript + Vite
  ├── Public landing/seeded demo → versioned static sample data
  │     (must work when Auth, API, database, and worker are unavailable)
  └── Personal library (after sign-in)
        ├── Supabase Auth → access token
        ├── FastAPI → validated, user-scoped item/search/cluster operations
        │     ├── Supabase-hosted PostgreSQL → items, search data, cluster history
        │     └── durable job/outbox record → processing request
        └── Supabase private Storage → files, if file upload is in scope

Processing execution (hosting decision open):
  durable job → Python processing code → extraction/representation
              → initial grouping or full reclustering → atomic DB update
```

The worker is **not middleware**: middleware runs inside an HTTP request path; a worker consumes durable jobs outside the user's request. A separate continuously running worker is a clean target architecture, but it is not available as a Render Free background-worker service. The free-beta execution model must be chosen only after measuring memory, runtime, and acceptable delay. A sleeping API cannot process queued work merely because a queue exists.

### Component responsibilities

| Component | Owns | Must not do |
| --- | --- | --- |
| React app | UI, form state, public static demo, displaying truthful statuses | Hold service-role/database passwords or claim seeded output is live AI |
| FastAPI | Request validation, token verification, authorization, bounded synchronous work, durable writes/enqueue | Trust a `user_id` from the browser or hide processing failures |
| PostgreSQL on Supabase | Persistent user data, transactional state, indexes, cluster versions/history | Act as a substitute for CPU needed by extraction and reclustering |
| Supabase Auth/Storage | Identity and private file objects, when introduced | Authorize an API item merely because its ID was supplied |
| Processing code | Extract available text, compute item representations, group/recluster, report results | Invent unavailable transcripts/OCR or rely on ephemeral local files |

## Data and API design principles

Build one thin, testable vertical slice at a time. Notes are the first suggested persistent source because they do not require scraping, OCR, or file upload. The following is a **candidate** schema, not a migration to create all at once:

| Record | Purpose |
| --- | --- |
| `items` | Owner ID, type, original input/reference, title, user note, preserved text, processing status, timestamps |
| `item_content` or `item_chunks` | Extracted passages and source locations if long-source retrieval is added |
| `item_representations` | Versioned features or vectors used for search/grouping; exact model is undecided |
| `clusters` | Stable user-visible UUID, owner, label, label source, active/archived state |
| `cluster_memberships` | Current item-to-cluster placement, origin/confidence, run version |
| `cluster_overrides` | Pinned placement or explicit unclustered choice made by the user |
| `cluster_runs` | Recluster version, algorithm/config version, changes, errors, timing |
| `jobs` or transactional outbox | Durable work state if processing is asynchronous |

Every private record is scoped to a verified owner. Define indexes, foreign keys, deletion behavior, and migrations as each table is introduced. If asynchronous processing is used, save the item and its work request atomically; return `202 Accepted` only for work that is actually queued. A simple synchronous operation may instead return `201 Created`. Never make a saved item disappear because enrichment failed.

Candidate endpoints, to add only when their phase arrives: item CRUD; keyword search; cluster list/details; manual move/pin; processing retry; and `/health/live` plus `/health/ready`. FastAPI's OpenAPI schema should be the contract for frontend types. No application route is implemented merely because it appears here.

## Dynamic reclustering contract

1. Form one item-level representation from the *available* title, user note, and content. If a source supplies only metadata, label it as such. Do not pretend a video or image was understood.
2. An initial assignment may be provisional. If similarity is weak or the collection is too small, leave the item **Unclustered** instead of forcing a match.
3. A full per-user run revisits **all eligible items**, not only the newest one. It may create, split, merge, and move groups. The exact algorithm and trigger policy are open until a measured spike.
4. Preserve stable cluster UUIDs where continuity is clear. Do not expose algorithm labels like `cluster_0` as permanent identities.
5. Respect manual pins, moves, and names. Automatic runs must not silently undo a user's explicit correction.
6. Compute proposed changes away from live memberships, check the input snapshot is still current, and commit one version atomically. An interrupted run leaves the last successful grouping intact; retries must be idempotent.
7. Evaluate coherence, outliers, movement/churn, manual correction rate, latency, and memory on representative user-sized collections.

Clustering can be real without an LLM. However, a cheap lexical representation may group similar words while missing semantically related or cross-language ideas. A compact embedding model is a candidate only after it passes quality and target-host RAM/CPU tests. **Dynamic behavior and semantic quality are separate claims.**

## Extraction and search boundaries

Start with user-authored notes/snippets; decide link extraction next. For external URLs, impose redirects, size/time limits, public-IP checks, content-type validation, and source-access rules. A saved link may legitimately be `metadata_only`. PDF, image OCR, YouTube transcripts, and social-site extraction are later candidates, not promises for the first deploy.

Preserve original Unicode text. Do not translate everything to English or assume whitespace/tokenization works identically across scripts. Keyword search is a valid baseline; label it as keyword search. Semantic or cross-language search requires a separately benchmarked representation and deployment fit. Chunking long sources must preserve structure and source location when that phase is reached.

## Security and cost boundaries

- Browser-visible Vite variables may contain only public configuration such as a Supabase URL and publishable key. Database passwords, Supabase secret/service-role keys, and optional model/provider keys stay server-side.
- Verify Supabase tokens in the API, derive the owner from the verified token, check ownership on every operation, and test two-user isolation. Use RLS as an additional boundary, not as a replacement for server authorization.
- Private uploaded files require owner-scoped Storage policies and server validation of referenced paths. Never use local disk as durable production storage.
- Cap input sizes, work per user, retries, and queue depth before allowing public personal saves.
- A static demo can be available while processing is unavailable. [Supabase Free may pause for low activity](https://supabase.com/docs/guides/platform/free-project-pausing). [Render Free web services sleep after inactivity and do not provide Free background workers](https://render.com/docs/free); its [Free web compute is limited to 512 MB RAM](https://render.com/docs/compute-plans). A keepalive cron is not a reliability guarantee. The final hosts and execution model are open decisions.

Production readiness is not a single final-phase task. As each vertical slice is added, account for its own validation, authorization, schema migration, failure/retry behavior, tests, logs, limits, and recovery. For example, the first private note endpoint needs two-user isolation immediately; it should not wait for a later “security phase.” Conversely, do not install monitoring, a queue, or an OCR stack before there is a concrete need.

Run an **early hosting feasibility spike after the minimal local skeleton**: check real free-tier limits, API cold starts, and the likely processing memory/CPU budget before building around an always-on worker assumption. A later clustering spike must re-test the chosen representation on the intended host. The final deployment phase is for release hardening, not the first discovery that the architecture cannot run. Provider terms and limits can change; recheck official documentation when making the deployment decision.

## Decisions to resolve at their phase gate

| Question | Needed before |
| --- | --- |
| Which user-authored and external source types count as v1? | Source adapters and UI promises |
| Can visitors save their own content without an account, or only explore seeded data? | Auth/storage design and abuse controls |
| What grouping quality is acceptable without cross-language semantic matching? | Representation/model choice |
| Which reclustering algorithm, trigger, size cap, and compute host pass tests? | Production reclustering integration |
| Is launch budget strictly ₹0/month or is a small paid worker acceptable? | Deployment architecture |
| Which Auth methods, data-retention policy, and file limits are wanted? | Public sign-up and uploads |

Record each resolved answer with its rationale here and update [Progress.md](Progress.md). Until then, implement the smallest reversible design and ask the user at the relevant gate.
