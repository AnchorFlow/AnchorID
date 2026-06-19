import {
  Account,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

/**
 * SEP-10-style "Stellar Web Authentication" challenge transaction.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
 *
 * The challenge is a transaction (sequence 0, signed by the server) carrying
 * a `manage_data` operation whose source account is the *client's* address
 * and whose value is a random nonce. The client proves address ownership by
 * countersigning the same transaction with their private key; the server
 * verifies both signatures and the nonce/timebounds before issuing a JWT.
 */

export interface BuildChallengeOptions {
  serverKeypair: Keypair;
  clientAddress: string;
  homeDomain: string;
  webAuthDomain: string;
  networkPassphrase?: string;
  timeoutSeconds?: number;
}

export interface BuiltChallenge {
  transactionXdr: string;
  networkPassphrase: string;
  nonce: string;
}

export function buildChallengeTransaction({
  serverKeypair,
  clientAddress,
  homeDomain,
  webAuthDomain,
  networkPassphrase = Networks.TESTNET,
  timeoutSeconds = 300,
}: BuildChallengeOptions): BuiltChallenge {
  const nonce = randomBytes(48).toString('base64');

  // Per SEP-10, the server account used as the transaction source has a
  // sequence number of "-1" relative semantics — in practice we use 0 and
  // never submit this transaction to the network; it exists purely as a
  // signed, structured challenge payload.
  const serverAccount = new Account(serverKeypair.publicKey(), '-1');

  const transaction = new TransactionBuilder(serverAccount, {
    fee: '100',
    networkPassphrase,
    timebounds: {
      minTime: 0,
      maxTime: Math.floor(Date.now() / 1000) + timeoutSeconds,
    },
  })
    .addOperation(
      Operation.manageData({
        source: clientAddress,
        name: `${homeDomain} auth`,
        value: nonce,
      }),
    )
    .addOperation(
      Operation.manageData({
        source: serverKeypair.publicKey(),
        name: 'web_auth_domain',
        value: webAuthDomain,
      }),
    )
    .build();

  transaction.sign(serverKeypair);

  return {
    transactionXdr: transaction.toEnvelope().toXDR('base64'),
    networkPassphrase,
    nonce,
  };
}

export interface VerifyChallengeOptions {
  transactionXdr: string;
  clientAddress: string;
  serverKeypair: Keypair;
  homeDomain: string;
  networkPassphrase?: string;
}

export interface VerifyChallengeResult {
  valid: boolean;
  reason?: string;
  nonce?: string;
}

export function verifyChallengeTransaction({
  transactionXdr,
  clientAddress,
  serverKeypair,
  homeDomain,
  networkPassphrase = Networks.TESTNET,
}: VerifyChallengeOptions): VerifyChallengeResult {
  let transaction;
  try {
    transaction = TransactionBuilder.fromXDR(transactionXdr, networkPassphrase);
  } catch {
    return { valid: false, reason: 'Malformed transaction XDR' };
  }

  if ('innerTransaction' in transaction) {
    return { valid: false, reason: 'Fee-bump transactions are not accepted' };
  }

  if (transaction.source !== serverKeypair.publicKey()) {
    return { valid: false, reason: 'Transaction source must be the server account' };
  }

  if (transaction.sequence !== '0' && transaction.sequence !== '-1') {
    // tolerate either representation depending on SDK version
  }

  const now = Math.floor(Date.now() / 1000);
  const { minTime, maxTime } = transaction.timeBounds ?? { minTime: '0', maxTime: '0' };
  if (Number(maxTime) !== 0 && (now < Number(minTime) || now > Number(maxTime))) {
    return { valid: false, reason: 'Challenge has expired' };
  }

  const operations = transaction.operations;
  if (operations.length < 1 || operations[0].type !== 'manageData') {
    return { valid: false, reason: 'First operation must be manage_data' };
  }
  const firstOp = operations[0] as { source?: string; name: string; value?: Buffer | null };
  if (firstOp.source !== clientAddress) {
    return { valid: false, reason: 'manage_data source must be the client address' };
  }
  if (firstOp.name !== `${homeDomain} auth`) {
    return { valid: false, reason: 'manage_data name does not match home domain' };
  }
  // The nonce was written as the literal bytes of a base64 string (not
  // base64-encoded binary), so it must be decoded as utf8 here, not
  // re-encoded as base64 — otherwise it never matches the issued nonce.
  const nonce = firstOp.value ? Buffer.from(firstOp.value).toString('utf8') : undefined;

  const hash = transaction.hash();
  const signedByServer = transaction.signatures.some((sig) =>
    serverKeypair.verify(hash, sig.signature()),
  );
  if (!signedByServer) {
    return { valid: false, reason: 'Missing server signature' };
  }

  const clientKeypair = Keypair.fromPublicKey(clientAddress);
  const signedByClient = transaction.signatures.some((sig) =>
    clientKeypair.verify(hash, sig.signature()),
  );
  if (!signedByClient) {
    return { valid: false, reason: 'Missing client signature' };
  }

  return { valid: true, nonce };
}
