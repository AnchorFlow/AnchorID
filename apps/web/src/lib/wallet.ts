'use client';

import {
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';

/**
 * Thin WalletAdapter abstraction (PRD 6.1, step 1) so a real browser
 * extension wallet and the Testnet-only dev keypair path share one shape.
 * Freighter signs in the extension — the private key never reaches this app.
 */
export interface WalletAdapter {
  isAvailable(): Promise<boolean>;
  connect(): Promise<string>;
  sign(transactionXdr: string, networkPassphrase: string): Promise<string>;
}

export const freighterAdapter: WalletAdapter = {
  async isAvailable() {
    const result = await freighterIsConnected();
    return Boolean(result.isConnected) && !result.error;
  },
  async connect() {
    const result = await freighterRequestAccess();
    if (result.error || !result.address) {
      throw new Error(result.error?.message ?? 'Freighter access was denied');
    }
    return result.address;
  },
  async sign(transactionXdr, networkPassphrase) {
    const result = await freighterSignTransaction(transactionXdr, { networkPassphrase });
    if (result.error || !result.signedTxXdr) {
      throw new Error(result.error?.message ?? 'Freighter declined to sign the challenge');
    }
    return result.signedTxXdr;
  },
};
