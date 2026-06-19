import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keypair } from '@stellar/stellar-sdk';
import {
  buildChallengeTransaction,
  isValidStellarAddress,
  verifyChallengeTransaction,
} from '@anchorid/stellar';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class StellarService {
  private readonly serverKeypair: Keypair;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const secret = this.config.get('stellar.serverSecretKey', { infer: true });
    this.serverKeypair = secret ? Keypair.fromSecret(secret) : Keypair.random();
  }

  get serverPublicKey(): string {
    return this.serverKeypair.publicKey();
  }

  isValidAddress(address: string): boolean {
    return isValidStellarAddress(address);
  }

  buildChallenge(clientAddress: string) {
    return buildChallengeTransaction({
      serverKeypair: this.serverKeypair,
      clientAddress,
      homeDomain: this.config.get('stellar.homeDomain', { infer: true }),
      webAuthDomain: this.config.get('stellar.webAuthDomain', { infer: true }),
      networkPassphrase: this.config.get('stellar.networkPassphrase', { infer: true }),
    });
  }

  verifyChallenge(transactionXdr: string, clientAddress: string) {
    return verifyChallengeTransaction({
      transactionXdr,
      clientAddress,
      serverKeypair: this.serverKeypair,
      homeDomain: this.config.get('stellar.homeDomain', { infer: true }),
      networkPassphrase: this.config.get('stellar.networkPassphrase', { infer: true }),
    });
  }
}
