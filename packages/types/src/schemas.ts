import { z } from 'zod';
import {
  AccessRequestStatus,
  CONSENT_SCOPES,
  DocumentType,
} from './enums';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const challengeRequestSchema = z.object({
  stellarAddress: z
    .string()
    .length(56)
    .regex(/^G[A-Z2-7]{55}$/, 'Must be a valid Stellar public address (G...)'),
});
export type ChallengeRequestInput = z.infer<typeof challengeRequestSchema>;

export const verifyChallengeSchema = z.object({
  stellarAddress: z
    .string()
    .length(56)
    .regex(/^G[A-Z2-7]{55}$/),
  transactionXdr: z.string().min(1),
});
export type VerifyChallengeInput = z.infer<typeof verifyChallengeSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ---------------------------------------------------------------------------
// Identity profile
// ---------------------------------------------------------------------------

export const identityProfileSchema = z.object({
  firstName: z.string().min(1).max(120),
  lastName: z.string().min(1).max(120),
  dateOfBirth: z.coerce.date(),
  nationality: z.string().min(2).max(60),
  address: z.string().min(3).max(300),
  email: z.string().email(),
  phoneNumber: z.string().min(5).max(30),
  governmentIdType: z.string().max(60).optional(),
  governmentIdNumber: z.string().min(3).max(60),
});
export type IdentityProfileInput = z.infer<typeof identityProfileSchema>;

export const updateIdentityProfileSchema = identityProfileSchema.partial();
export type UpdateIdentityProfileInput = z.infer<typeof updateIdentityProfileSchema>;

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const documentTypeSchema = z.enum([
  DocumentType.PASSPORT,
  DocumentType.NATIONAL_ID,
  DocumentType.DRIVERS_LICENSE,
  DocumentType.PROOF_OF_ADDRESS,
]);

export const documentUploadMetaSchema = z.object({
  type: documentTypeSchema,
});
export type DocumentUploadMetaInput = z.infer<typeof documentUploadMetaSchema>;

export const documentReviewSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().max(500).optional(),
});
export type DocumentReviewInput = z.infer<typeof documentReviewSchema>;

// ---------------------------------------------------------------------------
// Consents / access requests
// ---------------------------------------------------------------------------

export const consentScopeSchema = z.enum(CONSENT_SCOPES);

export const grantConsentSchema = z.object({
  anchorId: z.string().uuid(),
  scopes: z.array(consentScopeSchema).min(1),
  expiresAt: z.coerce.date().optional(),
  accessRequestId: z.string().uuid().optional(),
});
export type GrantConsentInput = z.infer<typeof grantConsentSchema>;

export const createAccessRequestSchema = z.object({
  stellarAddress: z
    .string()
    .length(56)
    .regex(/^G[A-Z2-7]{55}$/),
  scopes: z.array(consentScopeSchema).min(1),
  reason: z.string().max(500).optional(),
  requestedExpiryDays: z.number().int().min(1).max(365).default(90),
});
export type CreateAccessRequestInput = z.infer<typeof createAccessRequestSchema>;

export const resolveAccessRequestSchema = z.object({
  status: z.enum([AccessRequestStatus.APPROVED, AccessRequestStatus.DENIED]),
  expiresAt: z.coerce.date().optional(),
});
export type ResolveAccessRequestInput = z.infer<typeof resolveAccessRequestSchema>;

// ---------------------------------------------------------------------------
// Anchors
// ---------------------------------------------------------------------------

export const registerAnchorSchema = z.object({
  name: z.string().min(2).max(120),
  legalName: z.string().min(2).max(160),
  // .optional() alone only treats `undefined` as absent — an empty string
  // from an untouched form field still fails .url(), so allow '' too.
  website: z.string().url().optional().or(z.literal('')),
  homeDomain: z.string().min(3).max(160),
  description: z.string().max(1000).optional(),
});
export type RegisterAnchorInput = z.infer<typeof registerAnchorSchema>;

export const addAnchorMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ANCHOR_ADMIN', 'ANCHOR_MEMBER']),
});
export type AddAnchorMemberInput = z.infer<typeof addAnchorMemberSchema>;

export const createApiCredentialSchema = z.object({
  label: z.string().max(120).optional(),
});
export type CreateApiCredentialInput = z.infer<typeof createApiCredentialSchema>;

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const suspendAccountSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type SuspendAccountInput = z.infer<typeof suspendAccountSchema>;

export const reviewAnchorSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().max(500).optional(),
});
export type ReviewAnchorInput = z.infer<typeof reviewAnchorSchema>;
