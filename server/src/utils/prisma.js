import pkg from '@prisma/client';
import adapterPkg from '@prisma/adapter-pg';
import config from '../config/index.js';

const { PrismaClient } = pkg;
const { PrismaPg } = adapterPkg;

const adapter = new PrismaPg({ connectionString: config.database.url });

const prisma = new PrismaClient({
  adapter,
  log: config.env === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
