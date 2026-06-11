import * as barberRepository from './barber.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

const SLOT_INTERVAL = 30;

export async function getAll({ page, limit, search }) {
  const where = { active: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ];
  }
  return barberRepository.findAll({ where, page, limit });
}

export async function searchSuggestions(query) {
  return barberRepository.findSuggestions(query);
}

export async function getById(id) {
  const barber = await barberRepository.findById(id);
  if (!barber || !barber.active) throw new NotFoundError('Barber not found');
  return barber;
}

export async function getAvailableSlots(barberId, dateStr, serviceIds) {
  const barber = await barberRepository.findWithWorkingHours(barberId);
  if (!barber || !barber.active) throw new NotFoundError('Barber not found');

  const date = dateStr ? new Date(dateStr) : new Date();
  const dayOfWeek = date.getDay();

  const dayHours = barber.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek && wh.isActive);
  if (!dayHours) {
    return { date: date.toISOString().split('T')[0], dayOfWeek, workStart: null, workEnd: null, slots: [] };
  }

  const [startHour, startMin] = dayHours.startTime.split(':').map(Number);
  const [endHour, endMin] = dayHours.endTime.split(':').map(Number);
  const workStart = startHour * 60 + startMin;
  const workEnd = endHour * 60 + endMin;

  let totalDuration = 0;
  if (serviceIds.length > 0) {
    const barberServices = await barberRepository.findServices(barberId, serviceIds);
    if (barberServices.length !== serviceIds.length) {
      throw new NotFoundError('One or more services not found for this barber');
    }
    for (const bs of barberServices) {
      totalDuration += bs.duration ?? bs.service.duration;
    }
  } else {
    totalDuration = SLOT_INTERVAL;
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const reservations = await barberRepository.findReservationsInRange(barberId, dayStart, dayEnd);

  const occupiedSlots = reservations.map((r) => ({
    start: r.startTime.getHours() * 60 + r.startTime.getMinutes(),
    end: r.endTime.getHours() * 60 + r.endTime.getMinutes(),
  }));

  const slots = [];
  for (let start = workStart; start + totalDuration <= workEnd; start += SLOT_INTERVAL) {
    const end = start + totalDuration;
    const isOccupied = occupiedSlots.some(
      (occ) => (start < occ.end && end > occ.start)
    );
    slots.push({
      startMin: start,
      endMin: end,
      startTime: `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`,
      endTime: `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`,
      available: !isOccupied,
    });
  }

  return {
    date: date.toISOString().split('T')[0],
    dayOfWeek,
    workStart,
    workEnd,
    totalDuration,
    slots,
  };
}
