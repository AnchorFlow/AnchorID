export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtlSeconds: number;
    refreshTtlSeconds: number;
  };
  stellar: {
    serverSecretKey: string;
    homeDomain: string;
    webAuthDomain: string;
    networkPassphrase: string;
  };
  storage: {
    rootDir: string;
    encryptionKey: string;
  };
  corsOrigins: string[];
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
    accessTtlSeconds: parseInt(process.env.JWT_ACCESS_TTL_SECONDS ?? '900', 10),
    refreshTtlSeconds: parseInt(process.env.JWT_REFRESH_TTL_SECONDS ?? '2592000', 10),
  },
  stellar: {
    serverSecretKey: process.env.STELLAR_SERVER_SECRET_KEY ?? '',
    homeDomain: process.env.STELLAR_HOME_DOMAIN ?? 'anchorid.org',
    webAuthDomain: process.env.STELLAR_WEB_AUTH_DOMAIN ?? 'anchorid.org',
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
  },
  storage: {
    rootDir: process.env.STORAGE_ROOT_DIR ?? './storage',
    encryptionKey: process.env.STORAGE_ENCRYPTION_KEY ?? 'dev-storage-encryption-key-change-me',
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
});
