import {
  AccessRequestStatus,
  AccountStatus,
  AnchorStatus,
  ConsentStatus,
  DocumentStatus,
  DocumentType,
  Role,
  VerificationLevel,
  VerificationStatus,
} from './enums';

// Plain, framework-agnostic shapes returned by the API. These intentionally
// mirror Prisma model shapes (minus Prisma-internal fields) so the frontend
// can type API responses without depending on @prisma/client.

export interface UserDto {
  id: string;
  email: string | null;
  role: Role;
  status: AccountStatus;
  createdAt: string;
}

export interface WalletDto {
  id: string;
  stellarAddress: string;
  isPrimary: boolean;
  verifiedAt: string | null;
}

export interface IdentityProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phoneNumber: string;
  governmentIdType: string | null;
  governmentIdNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDto {
  id: string;
  identityProfileId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  rejectionReason: string | null;
  createdAt: string;
}

export interface VerificationDto {
  id: string;
  identityProfileId: string;
  status: VerificationStatus;
  level: VerificationLevel;
  provider: string;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CredentialDto {
  id: string;
  type: string;
  value: unknown;
  issuedAt: string;
  expiresAt: string | null;
}

export interface AnchorOrganizationDto {
  id: string;
  name: string;
  legalName: string;
  website: string | null;
  homeDomain: string;
  status: AnchorStatus;
  description: string | null;
  createdAt: string;
}

export interface AnchorMemberDto {
  id: string;
  anchorId: string;
  userId: string;
  role: Role;
  email: string | null;
}

export interface AnchorApiCredentialDto {
  id: string;
  keyId: string;
  label: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  /** Only ever present once, in the create-response, never on list */
  secret?: string;
}

export interface ConsentDto {
  id: string;
  anchorId: string;
  anchorName?: string;
  identityProfileId: string;
  status: ConsentStatus;
  scopes: string[];
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

export interface AccessRequestDto {
  id: string;
  anchorId: string;
  anchorName?: string;
  identityProfileId: string;
  status: AccessRequestStatus;
  scopes: string[];
  reason: string | null;
  requestedExpiryDays: number;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AuditLogDto {
  id: string;
  action: string;
  actorId: string | null;
  actorRole: Role | null;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface PaginatedDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
