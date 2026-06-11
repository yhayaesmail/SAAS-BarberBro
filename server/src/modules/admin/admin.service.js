import bcrypt from 'bcrypt';
import * as adminRepository from './admin.repository.js';
import * as barberRepository from '../barbers/barber.repository.js';
import * as serviceRepository from '../services/service.repository.js';
import * as reservationRepository from '../reservations/reservation.repository.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import { validateName, validateEgyptPhone, validateEmail, validateTime } from '../../utils/validation.js';

function validateBarberInput(data) {
  const errors = [];
  const checks = [
    { field: 'name', error: validateName(data.name) },
    { field: 'username', error: data.username?.trim() ? null : 'Username is required' },
    { field: 'phone1', error: validateEgyptPhone(data.phone1) },
    { field: 'startTime', error: validateTime(data.startTime, 'Start time') },
    { field: 'endTime', error: validateTime(data.endTime, 'End time') },
  ];
  if (data.phone2) {
    const e = validateEgyptPhone(data.phone2);
    if (e) errors.push({ field: 'phone2', message: e });
  }
  if (data.email) {
    const e = validateEmail(data.email);
    if (e) errors.push({ field: 'email', message: e });
  }
  for (const c of checks) {
    if (c.error) errors.push({ field: c.field, message: c.error });
  }
  return errors;
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [totalBarbers, activeBarbers, totalReservations, todayReservations, recentReservations, topServices] = await Promise.all([
    adminRepository.countBarbers(),
    adminRepository.countActiveBarbers(),
    adminRepository.countReservations(),
    adminRepository.countReservationsInRange(todayStart, todayEnd),
    adminRepository.findRecentReservations(10),
    adminRepository.findTopServices(5),
  ]);

  return {
    totalBarbers,
    activeBarbers,
    totalReservations,
    todayReservations,
    revenuePlaceholder: 0,
    recentReservations,
    topServices,
  };
}

export async function createBarber(data) {
  const validationErrors = validateBarberInput(data);
  if (validationErrors.length > 0) throw new ValidationError('Validation failed', validationErrors);

  const existingUsername = await barberRepository.findByUsername(data.username);
  if (existingUsername) throw new ConflictError('Username is already taken');

  const hashedPassword = await bcrypt.hash('barber123', 12);
  const barber = await adminRepository.createBarber(data, hashedPassword);

  if (data.services?.length > 0) {
    await adminRepository.assignBarberServices(barber.id, data.services);
  }

  if (data.workingHours?.length > 0) {
    await adminRepository.setWorkingHours(barber.id, data.workingHours);
  } else {
    const defaultHours = [];
    for (let d = 0; d < 7; d++) {
      defaultHours.push({ dayOfWeek: d, startTime: data.startTime, endTime: data.endTime, isActive: d !== 5 });
    }
    await adminRepository.setWorkingHours(barber.id, defaultHours);
  }

  return adminRepository.findBarberWithDetails(barber.id);
}

export async function updateBarber(id, data) {
  const existing = await adminRepository.findBarberById(id);
  if (!existing) throw new NotFoundError('Barber not found');

  if (data.username) {
    const taken = await adminRepository.findBarberByUsernameExcluding(data.username, id);
    if (taken) throw new ConflictError('Username is already taken');
  }

  await adminRepository.updateBarber(id, data);

  if (data.services) {
    await adminRepository.assignBarberServices(id, data.services);
  }

  if (data.workingHours) {
    await adminRepository.setWorkingHours(id, data.workingHours);
  }

  return adminRepository.findBarberWithDetails(id);
}

export async function toggleBarberStatus(id) {
  const barber = await adminRepository.findBarberById(id);
  if (!barber) throw new NotFoundError('Barber not found');
  return adminRepository.toggleBarberActive(id, !barber.active);
}

export async function getBarberById(id) {
  const barber = await adminRepository.findBarberWithDetails(id);
  if (!barber) throw new NotFoundError('Barber not found');
  return barber;
}

export async function getAllBarbers() {
  return adminRepository.findAllBarbers();
}

export async function createService(data) {
  if (!data.name || !data.price || !data.duration) {
    throw new ValidationError('Missing required fields: name, price, duration');
  }
  return serviceRepository.create({
    name: data.name,
    description: data.description || '',
    price: data.price,
    duration: Number(data.duration),
  });
}

export async function updateService(id, data) {
  const existing = await serviceRepository.findById(id);
  if (!existing) throw new NotFoundError('Service not found');
  return serviceRepository.update(id, data);
}

export async function getAllServices() {
  return serviceRepository.findAll();
}

export async function getAllReservations({ page, limit }) {
  return reservationRepository.findAll({ page, limit });
}
