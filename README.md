# AnchorID

**Verify once. Use everywhere.**

AnchorID is an open-source identity and compliance layer for the Stellar
ecosystem. Users complete KYC once with AnchorID and reuse that verified
identity across any participating Stellar anchor, wallet, or fintech
application via explicit, revocable, time-boxed consent grants.

Every Stellar anchor today runs its own KYC pipeline, which means users
repeat the same document submission for every anchor they touch, and anchors
duplicate compliance infrastructure they don't need to own. AnchorID exists
so a user's verified identity travels with their Stellar wallet, and anchors
can request scoped, auditable access to it instead of building a KYC stack
from scratch.

See [`docs/PRD.md`](docs/PRD.md) for the full product spec and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system design.

## Features

- **Wallet-based authentication** — SEP-10-style challenge/response signing
  proves Stellar address ownership without ever exposing a private key.
- **Reusable identity profile** — one KYC submission (personal data +
  documents) per user, not one per anchor.
- **Document upload & review** — passport, national ID, driver's license,
  proof of address, stored AES-256-GCM encrypted at rest, with an
  admin/compliance review workflow.
- **Consent-based access control** — a user grants a specific anchor access
  to a specific set of fields, for a bounded time window, and can revoke at
  any time. Every grant, revoke, and access event is audit-logged.
- **Anchor portal** — anchor organizations register, get admin-approved,
  generate API credentials, request access to a user's identity by Stellar
  address, and retrieve only the approved data subset.
- **Admin/compliance panel** — review pending anchors and documents, suspend
  users or anchors, and browse the full audit log.
- **SEP-1 / SEP-10 / SEP-12-shaped interfaces** — `stellar.toml`-style
  metadata, challenge-transaction auth, and a KYC field schema modeled on
  SEP-12's `GET /customer` semantics, so the integration story is familiar to
  existing Stellar anchor tooling.

This is an MVP: document "verification" is a human-review workflow behind a
pluggable provider interface, not a certified KYC/AML integration, and
AnchorID never custodies funds. See [`docs/PRD.md`](docs/PRD.md) §4 for the
full non-goals list.

## Tech stack

| Layer | Stack |
|---|---|
| Web | Next.js 15 (App Router), React 18, Tailwind CSS, React Hook Form + Zod |
| API | NestJS 10, Prisma 5, PostgreSQL, `@stellar/stellar-sdk` |
| Auth | SEP-10-style challenge signing, JWT access tokens + rotating refresh tokens |
| Storage | Pluggable `StorageAdapter`; MVP ships a local AES-256-GCM encrypted adapter |
| Monorepo | npm workspaces |

## Monorepo layout

```
/apps
  /web      Next.js 15 App Router frontend (user, anchor, and admin surfaces)
  /api      NestJS backend — REST API + Swagger docs
/packages
  /ui       Shared React components (shadcn/ui-based)
  /types    Shared TypeScript types + Zod schemas (used by both apps)
  /shared   Cross-cutting utilities: storage abstraction, constants, RBAC
  /stellar  Stellar SDK helpers: SEP-1/10/12 interfaces, challenge build/verify
/docs       PRD and architecture notes
```

Workspace packages are consumed as `@anchorid/ui`, `@anchorid/types`,
`@anchorid/shared`, and `@anchorid/stellar`. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the backend module map,
auth/RBAC design, and data model.

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10 (workspaces support)
- A PostgreSQL 14+ database (the snippet below uses Docker, but any
  reachable Postgres instance works)

## Getting started

1. **Install dependencies** (installs all workspaces from the repo root):

   ```bash
   npm install
   ```

2. **Start a local Postgres instance** (skip if you already have one):

   ```bash
   docker run -d --name anchorid-pg \
     -e POSTGRES_USER=anchorid \
     -e POSTGRES_PASSWORD=anchorid \
     -e POSTGRES_DB=anchorid \
     -p 5432:5432 \
     postgres:16-alpine
   ```

3. **Configure environment variables**:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

   The defaults match the Docker command above and work out of the box for
   local development. See [Environment variables](#environment-variables)
   below for what each one does.

4. **Run database migrations**:

   ```bash
   npm run prisma:migrate
   ```

5. **Start the API and web app** (in separate terminals):

   ```bash
   npm run dev:api   # NestJS on http://localhost:4000 (Swagger at /api/docs)
   npm run dev:web   # Next.js on http://localhost:3000
   ```

6. **Log in without a wallet extension**: open `http://localhost:3000/login`
   and use the **Demo wallet (Testnet)** tab — click "Generate new keypair"
   then "Sign in". This generates a disposable Testnet keypair, signs the
   SEP-10 challenge for you, and exercises the exact same auth flow a real
   Freighter-connected wallet would use, just without requiring a browser
   extension. Never use this path with a real account's secret key.

## Environment variables

### `apps/api/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `PORT` | API listen port (default `4000`) |
| `NODE_ENV` | `development` / `production` |
| `JWT_ACCESS_SECRET` | Signing secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens |
| `STELLAR_HOME_DOMAIN` | Home domain used in the SEP-10 challenge (`manage_data` key) |
| `STELLAR_WEB_AUTH_DOMAIN` | Web auth domain asserted in the challenge |
| `STELLAR_NETWORK_PASSPHRASE` | Stellar network passphrase (Testnet by default) |
| `STORAGE_ROOT_DIR` | Local filesystem root for the encrypted document storage adapter |
| `STORAGE_ENCRYPTION_KEY` | AES-256-GCM key for document encryption at rest |
| `CORS_ORIGINS` | Comma-separated allowlist of origins permitted to call the API |

All secrets above are placeholder dev values — generate real secrets before
deploying anywhere reachable.

### `apps/web/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL the web app uses to call the API (default `http://localhost:4000/api`) |

## Common scripts

Run from the repo root:

| Command | Description |
|---|---|
| `npm run dev:api` | Start the NestJS API in watch mode |
| `npm run dev:web` | Start the Next.js dev server |
| `npm run build` | Build every package and app, in dependency order |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run tests in all workspaces |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply pending Prisma migrations |
| `npm run prisma:seed` | Run the database seed script |

## API documentation

With the API running, interactive Swagger docs are available at
`http://localhost:4000/api/docs`.

## Core flow, end to end

1. A user signs a SEP-10-style challenge (`POST /auth/challenge` →
   `POST /auth/verify`) and receives a JWT.
2. They create an `IdentityProfile` and upload KYC documents.
3. An admin reviews the documents and approves a `Verification`, which
   issues a `Credential`.
4. An anchor (already registered and admin-approved, authenticating with its
   own API key/secret) submits an `AccessRequest` for the user's Stellar
   address with a specific field scope.
5. The user approves the request, creating a time-boxed `Consent` grant.
6. The anchor calls `GET /credentials/by-address/:stellarAddress` and
   receives exactly the fields covered by their active, unexpired consent —
   nothing more.
7. The user can revoke the consent at any time, immediately cutting off the
   anchor's access. Every step above is audit-logged.

## Security notes

- Refresh tokens are rotated and hashed at rest; access tokens are
  short-lived JWTs.
- Every mutating route is behind an RBAC guard (`USER`, `ANCHOR_ADMIN`,
  `ANCHOR_MEMBER`, `ADMIN`); anchor-portal routes are additionally scoped to
  the caller's own organization.
- Anchor server-to-server calls use a separate API key/secret credential
  (bcrypt-hashed), independent of end-user JWT auth.
- Uploaded files are validated by MIME allowlist, size cap, and content
  sniffing before being encrypted and stored.
- Consent is field-scoped and default-deny: an anchor only ever sees the
  union of fields covered by its currently active, unexpired consent grants
  for a given user.
- See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §7 for the full
  security checklist and what's still interface-only (KMS-backed encryption,
  a licensed verification vendor integration) versus implemented in this MVP.

## Status

This is an MVP / reference implementation, not a production deployment.
Document "verification" is a manual review workflow today, not a certified
KYC/AML integration, and the local storage adapter is for development only —
see [`docs/PRD.md`](docs/PRD.md) §8 (Risks) and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §8 (Suggested next steps)
before relying on this for real user data.
