import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, 'server/.env') });

const serverReq = createRequire(resolve(__dirname, 'server/node_modules'));
const { PrismaClient } = serverReq('@prisma/client');
const { PrismaPg } = serverReq('@prisma/adapter-pg');
const bcrypt = serverReq('bcrypt');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = 'admin@km-barber.com';
const ADMIN_PASSWORD = 'Admin123456';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'KM-BARBER',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'ADMIN',
    },
  });

  console.log('═══════════════════════════════════════');
  console.log('  ADMIN ACCOUNT CREATED SUCCESSFULLY');
  console.log('═══════════════════════════════════════');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     ADMIN`);
  console.log('═══════════════════════════════════════');
}

main()
  .catch((err) => { console.error('Failed:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
