# AnchorID — Product Requirements Document

## 1. Summary

AnchorID is an open-source identity and compliance layer for the Stellar ecosystem.
Users complete KYC once with AnchorID and reuse that verified identity across any
participating Stellar anchor, wallet, or fintech application via explicit,
revocable, time-boxed consent grants.

**Tagline:** Verify once. Use everywhere.

## 2. Problem

Every Stellar anchor currently runs its own KYC pipeline (frequently a SEP-12
implementation backed by a bespoke compliance vendor). This means:

- Users repeat the same KYC submission for every anchor/wallet they touch,
  causing drop-off and friction at the worst possible time (deposit/withdraw).
- Anchors duplicate compliance infrastructure and carry redundant liability
  for document storage and verification.
- There is no portable, user-controlled identity primitive that travels with
  a Stellar account the way the account itself does.

## 3. Solution

AnchorID provides:

1. A **reusable identity profile** tied to a Stellar wallet address, verified
   via a SEP-10-compatible challenge/response signature flow (proves wallet
   ownership without exposing a private key).
2. **Document upload & verification workflow** for passport, national ID,
   driver's license, and proof of address, with admin/compliance review.
3. **Consent-based access control**: a user explicitly grants a specific
   anchor organization access to specific credential fields, for a bounded
   time window, and can revoke at any time. Every grant/revoke/access event
   is audit-logged.
4. An **anchor portal** so anchor organizations can onboard, register API
   credentials, request access to a user's verified identity, and retrieve
   approved data via API — without ever building their own KYC stack.
5. An **admin/compliance panel** for reviewing anchors, identities, and
   documents, and for handling suspensions and audit review.
6. **SEP-1 / SEP-10 / SEP-12-shaped interfaces** so the integration story for
   existing Stellar anchors is familiar: `stellar.toml` style metadata,
   challenge-transaction auth, and a KYC field schema compatible with SEP-12's
   `GET /customer` semantics.

## 4. Non-goals (MVP)

- AnchorID is not itself a licensed KYC/AML vendor — document "verification"
  in this MVP is a human-review workflow plus a pluggable verification
  provider interface, not a certified identity-verification integration.
- No production custody of funds; AnchorID never touches a user's balance,
  only identity/compliance metadata.
- Soroban smart-contract-based attestations are designed for (interfaces,
  data shapes) but not deployed in the MVP — see `packages/stellar`.
- Mobile apps are out of scope; the web app is responsive but not native.

## 5. Target Users

| User | Need |
|---|---|
| Stellar anchors | Reduce KYC integration cost; trust a portable, auditable identity |
| Wallet providers | Offer frictionless onboarding to anchors without building compliance |
| Fintech / remittance platforms | Plug into a shared compliance layer instead of N bespoke ones |
| End users | Verify once, control who sees what, revoke at any time |

## 6. Core User Journeys

### 6.1 End user

1. Connect Stellar wallet (Freighter/Albedo-style signing, abstracted behind
   a `WalletAdapter` interface).
2. Sign a SEP-10-style challenge to prove address ownership → receive JWT +
   refresh token.
3. Create an `IdentityProfile` (personal data fields).
4. Upload KYC documents (passport, national ID, driver's license, proof of
   address).
5. Track verification status (`PENDING → IN_REVIEW → APPROVED/REJECTED`).
6. Receive an access request from an anchor; approve with an expiry, or deny.
7. View consent history; revoke any active grant at any time.

### 6.2 Anchor

1. Register an organization profile; submit for admin approval.
2. Once approved, generate API credentials (key/secret pair, hashed at rest).
3. Submit an `AccessRequest` for a specific user's identity (by AnchorID or
   Stellar address) and a specific field scope.
4. Poll/receive approval status.
5. On approval, retrieve the approved data subset via the Credentials API,
   scoped strictly to the consent grant.

### 6.3 Admin

1. Review pending anchor registrations → approve/reject.
2. Review pending identity documents → approve/reject with reason.
3. Suspend a user or anchor account.
4. Browse the full audit log with filters.

## 7. Success Metrics (post-MVP instrumentation)

- Time-to-verified-identity (first KYC completion).
- Number of anchors reusing a single verified profile (reuse rate).
- Consent grant → revoke ratio and average grant lifetime.
- Anchor integration time (time from registration to first successful
  `AccessRequest` retrieval).

## 8. Risks

- **Custodial liability of documents**: mitigated by an encrypted storage
  abstraction (`packages/shared/storage`) and strict field-level consent
  scoping; production deployment must put real KMS-backed encryption behind
  the same interface.
- **Sybil / wallet-spoofing**: mitigated by SEP-10-style challenge signing;
  production must add replay protection (challenge nonce + short TTL, which
  is implemented) and consider hardware-key support.
- **Anchor over-collection**: AccessRequest is field-scoped and consent is
  explicit per anchor; default-deny is enforced at the API layer.
- **Regulatory scope creep**: AnchorID is infrastructure, not a KYC authority;
  the verification provider interface keeps the door open for a licensed
  vendor integration without changing the data model.

## 9. MVP Scope Checklist

See `/docs/ARCHITECTURE.md` for the system design and `prisma/schema.prisma`
for the data model. Feature checklist tracked in the top-level README.
