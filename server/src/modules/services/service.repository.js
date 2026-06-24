import prisma from '../../utils/prisma.js';

export async function findAll(where) {
  if (where?.where || where?.page) {
    const { where: w, page = 1, limit = 20 } = where;
    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where: w,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.service.count({ where: w }),
    ]);
    return { data, total };
  }
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

export async function count(where) {
  return prisma.service.count({ where });
}
