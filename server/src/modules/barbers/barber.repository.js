import prisma from '../../utils/prisma.js';

const barberListSelect = {
  id: true,
  name: true,
  username: true,
  bio: true,
  imageUrl: true,
  phone1: true,
  startTime: true,
  endTime: true,
  active: true,
  _count: { select: { services: true } },
};

const barberDetailSelect = {
  id: true,
  name: true,
  username: true,
  bio: true,
  imageUrl: true,
  phone1: true,
  phone2: true,
  email: true,
  startTime: true,
  endTime: true,
  active: true,
  services: {
    include: { service: true },
  },
};

export async function findAll({ where, page, limit }) {
  const [data, total] = await Promise.all([
    prisma.barber.findMany({
      where,
      select: barberListSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.barber.count({ where }),
  ]);
  return { data, total };
}

export async function findById(id) {
  return prisma.barber.findUnique({
    where: { id },
    include: {
      services: {
        include: { service: true },
      },
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
    },
  });
}

export async function findWithWorkingHours(id) {
  return prisma.barber.findUnique({
    where: { id },
    include: { workingHours: true },
  });
}

export async function findServices(barberId, serviceIds) {
  return prisma.barberService.findMany({
    where: {
      barberId,
      serviceId: { in: serviceIds },
      service: { active: true },
    },
    include: { service: true },
  });
}

export async function findReservationsInRange(barberId, start, end) {
  return prisma.reservation.findMany({
    where: {
      barberId,
      startTime: { gte: start, lt: end },
      status: { notIn: ['CANCELLED'] },
    },
    select: { startTime: true, endTime: true },
    orderBy: { startTime: 'asc' },
  });
}

export async function findSuggestions(query) {
  return prisma.barber.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, username: true },
    take: 6,
    orderBy: { name: 'asc' },
  });
}

export async function findByUsername(username) {
  return prisma.barber.findUnique({ where: { username } });
}
