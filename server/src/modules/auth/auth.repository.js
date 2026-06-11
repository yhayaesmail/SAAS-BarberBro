import prisma from '../../utils/prisma.js';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  active: true,
  createdAt: true,
};

export async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function create(data) {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'CUSTOMER',
    },
    select: userSelect,
  });
}

export async function createAdmin(data) {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: 'ADMIN',
    },
    select: userSelect,
  });
}

export async function findBarberByUserId(userId) {
  return prisma.barber.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      username: true,
      phone1: true,
      startTime: true,
      endTime: true,
    },
  });
}
