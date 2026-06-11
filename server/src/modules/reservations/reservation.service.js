import * as reservationRepository from './reservation.repository.js';
import * as barberRepository from '../barbers/barber.repository.js';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { validateEgyptPhone, validateEmail } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

export async function create(customerId, data) {
  const { barberId, serviceIds, startTime, customerPhone, customerEmail, notes } = data;

  if (!barberId || !serviceIds || !serviceIds.length || !startTime || !customerPhone) {
    throw new ValidationError('Missing required fields: barberId, serviceIds, startTime, customerPhone');
  }

  const phoneErr = validateEgyptPhone(customerPhone);
  if (phoneErr) throw new ValidationError('Invalid phone number', [{ field: 'customerPhone', message: phoneErr }]);

  if (customerEmail) {
    const emailErr = validateEmail(customerEmail);
    if (emailErr) throw new ValidationError('Invalid email', [{ field: 'customerEmail', message: emailErr }]);
  }

  const barber = await barberRepository.findWithWorkingHours(barberId);
  if (!barber || !barber.active) throw new NotFoundError('Barber not found');

  const bookingDate = new Date(startTime);
  const dayOfWeek = bookingDate.getDay();

  const dayHours = barber.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek && wh.isActive);
  if (!dayHours) throw new ValidationError('Barber does not work on this day');

  const barberServices = await barberRepository.findServices(barberId, serviceIds);
  if (barberServices.length !== serviceIds.length) {
    throw new NotFoundError('One or more services not found or unavailable');
  }

  let totalDuration = 0;
  let totalPrice = 0;
  const servicesData = [];

  for (const bs of barberServices) {
    const duration = bs.duration ?? bs.service.duration;
    const price = bs.price ?? bs.service.price;
    totalDuration += duration;
    totalPrice += Number(price);
    servicesData.push({ serviceId: bs.serviceId, price, duration });
  }

  const bookingMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
  const [startHour, startMin] = dayHours.startTime.split(':').map(Number);
  const [endHour, endMin] = dayHours.endTime.split(':').map(Number);
  const workStart = startHour * 60 + startMin;
  const workEnd = endHour * 60 + endMin;

  if (bookingMinutes < workStart || bookingMinutes + totalDuration > workEnd) {
    throw new ValidationError('Selected time is outside working hours');
  }

  const endTime = new Date(bookingDate.getTime() + totalDuration * 60000);

  const reservation = await reservationRepository.createWithLock({
    barberId,
    startTime: bookingDate,
    endTime,
    customerId,
    totalPrice: totalPrice.toFixed(2),
    totalDuration,
    customerPhone,
    customerEmail: customerEmail || null,
    notes: notes || '',
    servicesData,
  });

  logger.info(`Reservation created: ${reservation.id}`, { barberId, customerId, startTime: bookingDate.toISOString() });

  return reservation;
}

export async function getByCustomer(customerId, { page, limit }) {
  return reservationRepository.findByCustomer(customerId, { page, limit });
}

export async function cancel(reservationId, user) {
  const reservation = await reservationRepository.findById(reservationId);
  if (!reservation) throw new NotFoundError('Reservation not found');

  if (reservation.customerId !== user.id && user.role !== 'ADMIN') {
    throw new ForbiddenError('Not authorized to cancel this reservation');
  }

  if (reservation.status === 'CANCELLED') {
    throw new ConflictError('Reservation is already cancelled');
  }

  const now = new Date();
  const diffMs = reservation.startTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1 && user.role !== 'ADMIN') {
    throw new ValidationError('Cannot cancel reservation less than 1 hour before start time');
  }

  return reservationRepository.updateStatus(reservationId, 'CANCELLED');
}
