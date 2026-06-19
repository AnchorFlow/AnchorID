import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, ConsentStatus } from '@anchorid/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

const SCOPE_FIELD_MAP: Record<string, string> = {
  'profile.name': 'name',
  'profile.dob': 'dateOfBirth',
  'profile.nationality': 'nationality',
  'profile.address': 'address',
  'profile.email': 'email',
  'profile.phone': 'phoneNumber',
  'profile.government_id': 'governmentId',
};

@Injectable()
export class CredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async findMine(userId: string) {
    const profile = await this.prisma.identityProfile.findUnique({ where: { userId } });
    if (!profile) return [];
    return this.prisma.credential.findMany({
      where: { identityProfileId: profile.id, revokedAt: null },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /**
   * The core "verify once, use everywhere" read path: an anchor (already
   * authenticated via its API key) retrieves only the fields its active,
   * unexpired Consent grant covers — never the raw documents.
   */
  async getScopedDataForAnchor(anchorId: string, stellarAddress: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { stellarAddress },
      include: { user: { include: { identityProfile: true } } },
    });
    if (!wallet?.user.identityProfile) {
      throw new NotFoundException('No identity profile found for this Stellar address');
    }
    const profile = wallet.user.identityProfile;

    // A user may approve more than one access request from the same anchor
    // over time (e.g. a broader request after an earlier, narrower one); each
    // approval is its own Consent row, and all currently-active ones are
    // still in effect, so the anchor's visibility is the union of their
    // scopes — not just whichever grant happens to be returned first.
    const consents = await this.prisma.consent.findMany({
      where: {
        anchorId,
        identityProfileId: profile.id,
        status: ConsentStatus.ACTIVE,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (consents.length === 0) {
      throw new ForbiddenException('No active consent grant from this user for your organization');
    }

    const scopes = [...new Set(consents.flatMap((consent) => consent.scopes))];

    const data: Record<string, unknown> = {};
    for (const scope of scopes) {
      const field = SCOPE_FIELD_MAP[scope];
      if (!field) continue;
      switch (field) {
        case 'name':
          data.firstName = profile.firstName;
          data.lastName = profile.lastName;
          break;
        case 'dateOfBirth':
          data.dateOfBirth = profile.dateOfBirth;
          break;
        case 'nationality':
          data.nationality = profile.nationality;
          break;
        case 'address':
          data.address = profile.address;
          break;
        case 'email':
          data.email = profile.email;
          break;
        case 'phoneNumber':
          data.phoneNumber = profile.phoneNumber;
          break;
        case 'governmentId':
          data.governmentIdType = profile.governmentIdType;
          data.governmentIdNumber = profile.governmentIdNumber;
          break;
      }
    }

    if (scopes.includes('verification.status') || scopes.includes('credential.kyc_level')) {
      const credentials = await this.prisma.credential.findMany({
        where: { identityProfileId: profile.id, revokedAt: null },
      });
      data.credentials = credentials.map((c) => ({ type: c.type, value: c.value, issuedAt: c.issuedAt }));
    }

    await this.auditLogs.record({
      action: AuditAction.CREDENTIAL_ACCESSED,
      targetType: 'IdentityProfile',
      targetId: profile.id,
      metadata: { anchorId, scopes },
    });

    return { identityProfileId: profile.id, scopes, data };
  }
}
