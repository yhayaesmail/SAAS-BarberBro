import { validateName, validateEgyptPhone, validateEmail, validateTime } from '../../utils/validation.js';

export const createBarberSchema = {
  name: [(v) => validateName(v)],
  username: [(v) => v?.trim() ? null : 'Username is required'],
  phone1: [validateEgyptPhone],
  startTime: [(v) => validateTime(v, 'Start time')],
  endTime: [(v) => validateTime(v, 'End time')],
};

export const createServiceSchema = {
  name: [(v) => v?.trim() ? null : 'Name is required'],
  price: [(v) => (v && Number(v) > 0) ? null : 'Valid price is required'],
  duration: [(v) => (v && Number(v) > 0) ? null : 'Valid duration is required'],
};
