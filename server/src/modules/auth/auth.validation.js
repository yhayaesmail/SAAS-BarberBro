import { validateEmail, validatePassword, validateName } from '../../utils/validation.js';

export const registerSchema = {
  firstName: [(v) => validateName(v, 'First name')],
  lastName: [(v) => validateName(v, 'Last name')],
  email: [validateEmail],
  phone: [(v) => v ? null : 'Phone number is required'],
  password: [validatePassword],
  passwordConfirm: [(v, body) => body?.password !== v ? 'Passwords do not match' : null],
};

export const loginSchema = {
  email: [validateEmail],
  password: [validatePassword],
};
