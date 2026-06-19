# AnchorID — System Architecture

## 1. High-level overview

```
                         ┌─────────────────────┐
                         │      apps/web        │
                         │  Next.js 15 (App Dir) │
                         │  Tailwind + shadcn/ui │
                         └──────────┬───────────┘
                                    │ REST (fetch) + JWT
                                    ▼
                         ┌─────────────────────┐
                         │      apps/api         │
                         │   NestJS + Prisma      │
                         │  RBAC / SEP-10 / Audit │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐
        │   PostgreSQL    │  │ Storage Adapter │  │ Stellar Horizon   │
        │   (Prisma)      │  │ (encrypted, S3- │  │ (SDK, SEP-10 sig  │
        │                 │  │ compatible iface)│  │ verification)     │
        └───────────────┘  └────────────────┘  └──────────────────┘
```

## 2. Monorepo layout

```
/apps
  /web      Next.js 15 App Router frontend
  /api      NestJS backend (REST + Swagger)
/packages
  /ui       Shared shadcn/ui-based React components
  /types    Shared TypeScript types/interfaces + Zod schemas (frontend+backend)
  /shared   Cross-cutting utilities: storage abstraction, constants, RBAC enums
  /stellar  Stellar SDK helpers: SEP-1/10/12 interfaces, challenge build/verify
/docs       PRD, architecture, API notes
```

npm workspaces wire `packages/*` into both `apps/web` and `apps/api` as
`@anchorid/ui`, `@anchorid/types`, `@anchorid/shared`, `@anchorid/stellar`.

## 3. Backend module map (NestJS)

```
apps/api/src
  app.module.ts
  common/
    decorators/        @CurrentUser, @Roles, @Public
    guards/             JwtAuthGuard, RolesGuard, ApiKeyGuard
    filters/            HttpExceptionFilter
    interceptors/       AuditInterceptor
    pipes/              FileValidationPipe
  prisma/                PrismaService + PrismaModule
  auth/                  SEP-10 challenge issue/verify, JWT, refresh tokens
  users/                 User CRUD, role management
  wallets/               Wallet linking
  identity-profiles/     IdentityProfile CRUD
  documents/             Upload, metadata, status
  verifications/         Verification lifecycle (admin/provider driven)
  credentials/            Derived "verified credential" read API (consent-scoped)
  consents/               Grant / revoke / expire / history
  access-requests/         Anchor-initiated requests against a user's identity
  anchors/                 AnchorOrganization, AnchorMember, API credentials
  admin/                   Admin-only aggregation endpoints
  audit-logs/              Audit log read API + AuditService used everywhere else
  stellar/                 Thin wrapper around @anchorid/stellar for the API layer
```

Each feature module follows: `*.module.ts`, `*.controller.ts`, `*.service.ts`,
`dto/*.dto.ts` (class-validator + Swagger decorators), and a matching
`*.spec.ts`.

### 3.1 Why NestJS module-per-domain

Domain modules map 1:1 to Prisma models and to the REST resource tree. This
keeps RBAC declarative (`@Roles('ADMIN')` at the controller level) and keeps
the audit interceptor generic — it reads a `@AuditAction('...')` decorator
rather than each service hand-rolling log calls.

### 3.2 AuthN/AuthZ

- **Wallet auth (SEP-10-style)**: `POST /auth/challenge` returns a Stellar
  "challenge transaction" envelope (XDR-shaped JSON in the MVP — see
  `packages/stellar`) bound to the requesting Stellar address with a 5-minute
  TTL nonce. `POST /auth/verify` validates the signature against the address's
  public key using `@stellar/stellar-sdk`, issues a JWT access token (15 min)
  + refresh token (30 days, rotated + hashed at rest).
- **RBAC**: `Role` enum — `USER`, `ANCHOR_ADMIN`, `ANCHOR_MEMBER`, `ADMIN`.
  `RolesGuard` reads `@Roles(...)` metadata; `AnchorMembershipGuard` further
  scopes anchor-portal routes to the caller's own `AnchorOrganization`.
  Soroban-token-gated roles are a documented extension point, not implemented.
- **Anchor API credentials**: anchors get a `keyId` + secret (hashed,
  bcrypt) for server-to-server calls (`ApiKeyGuard`), separate from end-user
  JWT auth.

### 3.3 Storage abstraction

`packages/shared/src/storage` defines `StorageAdapter` (`put`, `getSignedUrl`,
`delete`). MVP ships a `LocalEncryptedStorageAdapter` (AES-256-GCM, key from
`STORAGE_ENCRYPTION_KEY`) writing to a Docker volume; the interface is
designed so a production deployment swaps in an S3/KMS adapter with zero
controller/service changes.

### 3.4 Audit logging

`AuditInterceptor` + `AuditService.record()` write an `AuditLog` row for every
mutating request (login, identity update, document upload, consent
grant/revoke, access request, admin action) capturing actor, action, target,
metadata diff, IP, and timestamp. Audit logs are append-only at the
application layer (no update/delete endpoints).

## 4. Frontend architecture

- App Router route groups: `(public)`, `(user)`, `(anchor)`, `(admin)`,
  mapping to the four UI surfaces in the spec, each with its own layout and
  middleware-enforced role gate (`middleware.ts` reads the JWT cookie's role
  claim before rendering protected groups).
- Server actions/`fetch` call the NestJS API directly (`NEXT_PUBLIC_API_URL`);
  the access/refresh tokens are stored as httpOnly cookies set by API
  responses, read by `middleware.ts` for route protection.
- Forms: React Hook Form + `@hookform/resolvers/zod`, schemas imported from
  `@anchorid/types` so the same Zod schema validates client-side and is
  re-exported for backend DTO parity.
- Components: `@anchorid/ui` wraps shadcn/ui primitives (Button, Card, Form,
  Dialog, Table, Badge, Tabs) so both the marketing site and app shell share a
  design system.

## 5. Stellar integration (`packages/stellar`)

- `sep1.ts` — builds/parses a `stellar.toml`-shaped descriptor for AnchorID
  acting as an identity-provider participant.
- `sep10.ts` — `buildChallengeTransaction(address, serverKeypair, network)`
  and `verifyChallengeTransaction(xdr, address, serverKeypair, network)` using
  `@stellar/stellar-sdk`'s `Transaction`/`Keypair`, modeled directly on the
  SEP-10 spec (manage_data operation carrying the nonce, signed by both
  server and client key).
- `sep12.ts` — type definitions mirroring SEP-12's `customer` field schema
  (`KycField`, `CustomerStatus`) so `IdentityProfile`/`Document` map cleanly
  onto a future real SEP-12 `/customer` endpoint.

These are real, runnable implementations of the cryptographic primitives, not
mocks — but AnchorID's HTTP endpoints are AnchorID-native REST (documented
above), not yet the literal SEP-10/12 wire protocol. Wiring AnchorID as a
drop-in SEP-10/12 server is the documented next step (see PRD risks).

## 6. Data model

See `apps/api/prisma/schema.prisma`. Highlights:

- Every table has `id` (uuid), `createdAt`, `updatedAt`, `deletedAt`
  (soft delete) where applicable.
- `Consent` and `AccessRequest` both carry `expiresAt`; a scheduled sweep
  (`ConsentsService.expireStale()`, invoked by a Nest `@Cron`) flips expired
  `ACTIVE` consents to `EXPIRED` and is also enforced defensively at read
  time in `CredentialsService`.
- `AuditLog` has no foreign key cascade deletes — audit history must outlive
  the entities it describes (it stores denormalized snapshot fields).

## 7. Security checklist (MVP)

- [x] JWT access + rotating refresh tokens (refresh hashed at rest)
- [x] RBAC guards on every mutating route
- [x] class-validator DTOs on every input
- [x] File upload validation (mime allowlist, size cap, content sniffing)
- [x] Helmet secure headers + CORS allowlist
- [x] Global rate limiting (`@nestjs/throttler`) + stricter limits on auth
- [x] Audit logging on all sensitive actions
- [ ] KMS-backed encryption at rest (interface ready, local AES impl in MVP)
- [ ] Real document-verification vendor integration (interface ready, manual
      review workflow in MVP)

## 8. Suggested next steps post-MVP

1. Replace `LocalEncryptedStorageAdapter` with S3 + KMS in production.
2. Implement literal SEP-10/SEP-12 wire-compatible endpoints so existing
   Stellar anchor tooling can talk to AnchorID without a custom client.
3. Add a Soroban contract for on-chain, anchor-verifiable attestation hashes
   (data shapes already exist in `packages/stellar/soroban.ts`).
4. Pluggable verification providers (Sumsub/Onfido-style) behind the existing
   `VerificationProvider` interface in `verifications/providers`.
