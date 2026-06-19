/**
 * Data shapes for a future Soroban contract that anchors a hash of a user's
 * approved Verification on-chain (the contract itself is out of scope for
 * the MVP — see docs/ARCHITECTURE.md §8). Keeping the shape here now means
 * the credential issuance path can compute/store this hash today without a
 * later data-model migration.
 */

export interface OnChainAttestation {
  identityProfileId: string;
  verificationId: string;
  /** sha256 of a canonical JSON of the approved verification + credential set */
  attestationHash: string;
  issuedAt: string;
  /** populated once a Soroban contract call anchors the hash */
  ledgerTxHash?: string;
}

export function buildAttestationPayload(input: {
  identityProfileId: string;
  verificationId: string;
  credentialTypes: string[];
  issuedAt: string;
}): string {
  return JSON.stringify({
    identityProfileId: input.identityProfileId,
    verificationId: input.verificationId,
    credentialTypes: [...input.credentialTypes].sort(),
    issuedAt: input.issuedAt,
  });
}
