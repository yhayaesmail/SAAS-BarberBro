import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/index.js';

const adapter = new PrismaPg({ connectionString: config.database.url });

const prisma = new PrismaClient({
  adapter,
  log: config.env === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
