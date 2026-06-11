import prisma from '../../utils/prisma.js';
import { ConflictError } from '../../utils/errors.js';

export async function findById(id) {
  return prisma.reservation.findUnique({ where: { id } });
}

export async function findByCustomer(customerId, { page, limit }) {
  const where = { customerId };
  const [data, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        services: { include: { service: true } },
        barber: { select: { id: true, name: true, username: true, phone1: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startTime: 'desc' },
    }),
    prisma.reservation.count({ where }),
  ]);
  return { data, total };
}

export async function findAll({ page, limit }) {
  const [data, total] = await Promise.all([
    prisma.reservation.findMany({
      include: {
        customer: { select: { firstName: true, lastName: true } },
        barber: { select: { name: true } },
        services: { include: { service: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.reservation.count(),
  ]);
  return { data, total };
}

export async function createWithLock({ barberId, startTime, endTime, customerId, totalPrice, totalDuration, customerPhone, customerEmail, notes, servicesData }) {
  return prisma.$transaction(async (tx) => {
    const conflict = await tx.reservation.findFirst({
      where: {
        barberId,
        status: { notIn: ['CANCELLED'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (conflict) {
      throw new ConflictError('This time slot has just been booked by another customer. Please choose another time.');
    }

    return tx.reservation.create({
      data: {
        customerId,
        barberId,
        startTime,
        endTime,
        totalPrice,
        totalDuration,
        status: 'CONFIRMED',
        customerPhone,
        customerEmail,
        notes,
        services: {
          create: servicesData.map((s) => ({
            serviceId: s.serviceId,
            price: s.price,
            duration: s.duration,
          })),
        },
      },
      include: {
        services: { include: { service: true } },
        barber: { select: { name: true, phone1: true } },
      },
    });
  });
}

export async function updateStatus(id, status) {
  return prisma.reservation.update({
    where: { id },
    data: { status },
  });
}

export async function countByBarberAndDateRange(barberId, start, end) {
  return prisma.reservation.count({
    where: {
      barberId,
      startTime: { gte: start, lt: end },
      status: { notIn: ['CANCELLED'] },
    },
  });
}
