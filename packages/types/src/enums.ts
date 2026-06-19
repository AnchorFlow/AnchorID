// Mirrors apps/api/prisma/schema.prisma enums. Kept hand-in-sync (not
// generated) so the frontend never needs to import @prisma/client.

export const Role = {
  USER: 'USER',
  ANCHOR_ADMIN: 'ANCHOR_ADMIN',
  ANCHOR_MEMBER: 'ANCHOR_MEMBER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const DocumentType = {
  PASSPORT: 'PASSPORT',
  NATIONAL_ID: 'NATIONAL_ID',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  PROOF_OF_ADDRESS: 'PROOF_OF_ADDRESS',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const DocumentStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const VerificationStatus = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const VerificationLevel = {
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  ENHANCED: 'ENHANCED',
} as const;
export type VerificationLevel = (typeof VerificationLevel)[keyof typeof VerificationLevel];

export const ConsentStatus = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;
export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export const AccessRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DENIED: 'DENIED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED',
} as const;
export type AccessRequestStatus = (typeof AccessRequestStatus)[keyof typeof AccessRequestStatus];

export const AnchorStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;
export type AnchorStatus = (typeof AnchorStatus)[keyof typeof AnchorStatus];

export const AuditAction = {
  USER_REGISTERED: 'USER_REGISTERED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  IDENTITY_CREATED: 'IDENTITY_CREATED',
  IDENTITY_UPDATED: 'IDENTITY_UPDATED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_REVIEWED: 'DOCUMENT_REVIEWED',
  VERIFICATION_UPDATED: 'VERIFICATION_UPDATED',
  CONSENT_GRANTED: 'CONSENT_GRANTED',
  CONSENT_REVOKED: 'CONSENT_REVOKED',
  CONSENT_EXPIRED: 'CONSENT_EXPIRED',
  ACCESS_REQUEST_CREATED: 'ACCESS_REQUEST_CREATED',
  ACCESS_REQUEST_APPROVED: 'ACCESS_REQUEST_APPROVED',
  ACCESS_REQUEST_DENIED: 'ACCESS_REQUEST_DENIED',
  CREDENTIAL_ACCESSED: 'CREDENTIAL_ACCESSED',
  ANCHOR_REGISTERED: 'ANCHOR_REGISTERED',
  ANCHOR_APPROVED: 'ANCHOR_APPROVED',
  ANCHOR_REJECTED: 'ANCHOR_REJECTED',
  ANCHOR_SUSPENDED: 'ANCHOR_SUSPENDED',
  ANCHOR_MEMBER_ADDED: 'ANCHOR_MEMBER_ADDED',
  ANCHOR_MEMBER_REMOVED: 'ANCHOR_MEMBER_REMOVED',
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_REACTIVATED: 'ACCOUNT_REACTIVATED',
  ADMIN_ACTION: 'ADMIN_ACTION',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const CONSENT_SCOPES = [
  'profile.name',
  'profile.dob',
  'profile.nationality',
  'profile.address',
  'profile.email',
  'profile.phone',
  'profile.government_id',
  'verification.status',
  'credential.kyc_level',
] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];
