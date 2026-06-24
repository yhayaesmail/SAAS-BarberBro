import prisma from '../../utils/prisma.js';

export async function countBarbers() {
  return prisma.barber.count();
}

export async function countActiveBarbers() {
  return prisma.barber.count({ where: { active: true } });
}

export async function countReservations() {
  return prisma.reservation.count();
}

export async function countReservationsInRange(start, end) {
  return prisma.reservation.count({
    where: { startTime: { gte: start, lt: end } },
  });
}

export async function findRecentReservations(limit) {
  return prisma.reservation.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      barber: { select: { name: true } },
    },
  });
}

export async function findTopServices(limit) {
  const top = await prisma.reservationService.groupBy({
    by: ['serviceId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  if (top.length === 0) return [];

  const serviceIds = top.map((s) => s.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
  });

  return top.map((s) => {
    const svc = services.find((sv) => sv.id === s.serviceId);
    return { name: svc?.name || 'Unknown', count: s._count.id };
  });
}

export async function findBarberById(id) {
  return prisma.barber.findUnique({ where: { id } });
}

export async function findBarberWithDetails(id) {
  return prisma.barber.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, active: true } },
      services: { include: { service: true } },
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
    },
  });
}

export async function findBarberByUsernameExcluding(username, excludeId) {
  return prisma.barber.findFirst({
    where: { username, id: { not: excludeId } },
  });
}

export async function findAllBarbers({ where, page, limit }) {
  const [data, total] = await Promise.all([
    prisma.barber.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, active: true } },
        services: { include: { service: true } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.barber.count({ where }),
  ]);
  return { data, total };
}

export async function sumRevenue() {
  const result = await prisma.reservation.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalPrice: true },
  });
  return Number(result._sum.totalPrice || 0);
}

export async function sumRevenueSince(date) {
  const result = await prisma.reservation.aggregate({
    where: { status: 'COMPLETED', startTime: { gte: date } },
    _sum: { totalPrice: true },
  });
  return Number(result._sum.totalPrice || 0);
}

export async function createBarber(data, hashedPassword) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || 'Barber',
        email: data.email,
        password: hashedPassword,
        role: 'BARBER',
      },
    });

    return tx.barber.create({
      data: {
        name: data.name,
        username: data.username,
        bio: data.bio || '',
        phone1: data.phone1,
        phone2: data.phone2 || null,
        email: data.email || null,
        startTime: data.startTime,
        endTime: data.endTime,
        userId: user.id,
      },
    });
  });
}

export async function assignBarberServices(barberId, services) {
  await prisma.barberService.deleteMany({ where: { barberId } });
  for (const s of services) {
    const serviceId = typeof s === 'string' ? s : s.serviceId;
    const price = s.price ? Number(s.price) : undefined;
    const duration = s.duration ? Number(s.duration) : undefined;
    await prisma.barberService.create({ data: { barberId, serviceId, price, duration } });
  }
}

export async function setWorkingHours(barberId, hours) {
  await prisma.workingHours.deleteMany({ where: { barberId } });
  for (const wh of hours) {
    await prisma.workingHours.create({
      data: {
        barberId,
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        isActive: wh.isActive ?? true,
      },
    });
  }
}

export async function updateBarber(id, data) {
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.username) updateData.username = data.username;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.phone1) updateData.phone1 = data.phone1;
  if (data.phone2 !== undefined) updateData.phone2 = data.phone2;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.startTime) updateData.startTime = data.startTime;
  if (data.endTime) updateData.endTime = data.endTime;

  return prisma.barber.update({ where: { id }, data: updateData });
}

export async function toggleBarberActive(id, active) {
  return prisma.barber.update({ where: { id }, data: { active } });
}
