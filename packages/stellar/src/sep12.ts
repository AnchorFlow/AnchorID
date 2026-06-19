/**
 * SEP-12 defines a standard KYC field schema and a `/customer` endpoint
 * shape. AnchorID's IdentityProfile/Document/Verification models map onto
 * these types so a future literal SEP-12 endpoint is a thin translation
 * layer rather than a new data model.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md
 */

export type Sep12CustomerStatus = 'ACCEPTED' | 'PROCESSING' | 'NEEDS_INFO' | 'REJECTED';

export interface Sep12KycFields {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  mobile_number?: string;
  birth_date?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  id_country_code?: string;
}

export interface Sep12CustomerResponse {
  id: string;
  status: Sep12CustomerStatus;
  fields?: Record<string, { description: string; type: string; optional?: boolean }>;
  message?: string;
}

export function toSep12Status(
  verificationStatus: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED',
): Sep12CustomerStatus {
  switch (verificationStatus) {
    case 'PENDING':
    case 'IN_REVIEW':
      return 'PROCESSING';
    case 'APPROVED':
      return 'ACCEPTED';
    case 'REJECTED':
    case 'EXPIRED':
      return 'REJECTED';
    default:
      return 'NEEDS_INFO';
  }
}
