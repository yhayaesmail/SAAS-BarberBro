import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SERVICES = [
  { name: 'Haircut', description: 'Classic haircut tailored to your preference', price: 150, duration: 30 },
  { name: 'Beard', description: 'Professional beard trimming and shaping', price: 80, duration: 20 },
  { name: 'Hair + Beard', description: 'Complete haircut and beard grooming combo', price: 200, duration: 45 },
  { name: 'Facial Mask', description: 'Refreshing and rejuvenating facial mask', price: 120, duration: 25 },
  { name: 'Kids Haircut', description: 'Kid-friendly haircut in a comfortable setting', price: 100, duration: 25 },
  { name: 'Hot Towel Shave', description: 'Luxurious hot towel straight razor shave', price: 180, duration: 35 },
];

async function main() {
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@km-barber.com' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('Admin123456', 12);
    await prisma.user.create({
      data: { firstName: 'Admin', lastName: 'KM-BARBER', email: 'admin@km-barber.com', password: hashed, role: 'ADMIN' },
    });
    console.log('Admin account seeded');
  }

  for (const svc of SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (!existing) {
      await prisma.service.create({ data: svc });
      console.log(`Service created: ${svc.name}`);
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((err) => { console.error('Seed failed:', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
