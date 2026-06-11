import { validateEgyptPhone, validateEmail } from '../../utils/validation.js';

export const createReservationSchema = {
  barberId: [(v) => (v ? null : 'Barber is required')],
  serviceIds: [(v) => (Array.isArray(v) && v.length > 0 ? null : 'At least one service is required')],
  startTime: [(v) => (v ? null : 'Start time is required')],
  customerPhone: [validateEgyptPhone],
  customerEmail: [(v) => (v ? validateEmail(v) : null)],
};
