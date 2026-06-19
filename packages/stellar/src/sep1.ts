/**
 * SEP-1 ("stellar.toml") describes how a domain participates in the Stellar
 * ecosystem. AnchorID publishes a descriptor identifying itself as a
 * compliance/identity provider so anchors can discover its auth + KYC
 * endpoints the same way they discover any other SEP-compatible service.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md
 */

export interface AnchorIdStellarTomlConfig {
  signingKey: string;
  webAuthEndpoint: string;
  kycServer: string;
  homeDomain: string;
  orgName?: string;
  orgUrl?: string;
}

export function buildStellarToml(config: AnchorIdStellarTomlConfig): string {
  const lines = [
    `SIGNING_KEY="${config.signingKey}"`,
    `WEB_AUTH_ENDPOINT="${config.webAuthEndpoint}"`,
    `KYC_SERVER="${config.kycServer}"`,
    '',
    '[DOCUMENTATION]',
    `ORG_NAME="${config.orgName ?? 'AnchorID'}"`,
    `ORG_URL="${config.orgUrl ?? `https://${config.homeDomain}`}"`,
  ];
  return lines.join('\n');
}
