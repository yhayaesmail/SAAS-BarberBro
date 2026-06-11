import prisma from '../../utils/prisma.js';

export async function findAll() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });
}

export async function findById(id) {
  return prisma.service.findUnique({ where: { id } });
}

export async function create(data) {
  return prisma.service.create({ data });
}

export async function update(id, data) {
  return prisma.service.update({ where: { id }, data });
}
