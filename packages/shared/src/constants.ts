export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const SEP10_CHALLENGE_TTL_SECONDS = 5 * 60; // 5 minutes

export const AUTH_RATE_LIMIT = { ttlSeconds: 60, limit: 10 };
export const GLOBAL_RATE_LIMIT = { ttlSeconds: 60, limit: 120 };
