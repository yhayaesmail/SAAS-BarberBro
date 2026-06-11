export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EGYPT_PHONE_REGEX = /^(?:\+20|0020|0)?1[0-2,5]{1}[0-9]{8}$/;
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const PASSWORD_MIN = 8;

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Invalid email format';
  return null;
}

export function validateEgyptPhone(phone) {
  if (!phone || typeof phone !== 'string') return 'Phone number is required';
  const cleaned = phone.trim().replace(/\s+/g, '');
  if (!EGYPT_PHONE_REGEX.test(cleaned)) return 'Invalid Egyptian phone number';
  return null;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  return null;
}

export function validatePasswordConfirmation(password, confirm) {
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateName(value, field = 'Name') {
  if (!value || typeof value !== 'string' || !value.trim()) return `${field} is required`;
  if (value.trim().length < 2) return `${field} must be at least 2 characters`;
  if (value.trim().length > 100) return `${field} must be under 100 characters`;
  return null;
}

export function validateTime(value, field = 'Time') {
  if (!value || typeof value !== 'string') return `${field} is required`;
  if (!TIME_REGEX.test(value.trim())) return `${field} must be in HH:MM format (e.g. 09:00)`;
  return null;
}

export function validatePositiveNumber(value, field = 'Value') {
  if (value === undefined || value === null) return `${field} is required`;
  const num = Number(value);
  if (isNaN(num) || num <= 0) return `${field} must be a positive number`;
  return null;
}

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}
