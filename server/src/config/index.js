import 'dotenv/config';

const REQUIRED_VARS = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'fallback-cookie-secret',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

const exampleVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_ACCESS_EXPIRY', 'JWT_REFRESH_EXPIRY', 'COOKIE_SECRET', 'PORT', 'NODE_ENV', 'CORS_ORIGIN', 'LOG_LEVEL', 'DB_POOL_MIN', 'DB_POOL_MAX', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX'];
const envExample = exampleVars.filter((key) => !process.env[key]);
if (envExample.length > 0) {
  console.warn(`Warning: Missing optional env vars (will use defaults): ${envExample.join(', ')}`);
}

export default config;
