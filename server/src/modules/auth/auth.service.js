import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import * as authRepository from './auth.repository.js';
import { UnauthorizedError, ConflictError, ValidationError } from '../../utils/errors.js';
import {
  validateName,
  validateEmail,
  validateEgyptPhone,
  validatePassword,
  validatePasswordConfirmation,
} from '../../utils/validation.js';

function generateTokens(user) {
  const payload = { userId: user.id, role: user.role };
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiry });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
  return { accessToken, refreshToken };
}

function validateRegistrationData(data) {
  const errors = [];
  const checks = [
    { field: 'firstName', error: validateName(data.firstName, 'First name') },
    { field: 'lastName', error: validateName(data.lastName, 'Last name') },
    { field: 'email', error: validateEmail(data.email) },
    { field: 'phone', error: validateEgyptPhone(data.phone) },
    { field: 'password', error: validatePassword(data.password) },
    { field: 'passwordConfirm', error: validatePasswordConfirmation(data.password, data.passwordConfirm) },
  ];
  for (const check of checks) {
    if (check.error) errors.push({ field: check.field, message: check.error });
  }
  return errors;
}

export async function register(data) {
  const validationErrors = validateRegistrationData(data);
  if (validationErrors.length > 0) {
    throw new ValidationError('Validation failed', validationErrors);
  }

  const existing = await authRepository.findByEmail(data.email);
  if (existing) throw new ConflictError('Email is already registered');

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await authRepository.create({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    password: hashedPassword,
  });

  const tokens = generateTokens(user);
  return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }, ...tokens };
}

export async function login(data) {
  if (!data.email || !data.password) {
    throw new UnauthorizedError('Email and password are required');
  }

  const user = await authRepository.findByEmail(data.email.trim().toLowerCase());
  if (!user || !user.active) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = generateTokens(user);
  return {
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    ...tokens,
  };
}

export async function getProfile(userId) {
  const user = await authRepository.findById(userId);
  if (!user) throw new UnauthorizedError('User not found');

  let barber = null;
  if (user.role === 'BARBER') {
    barber = await authRepository.findBarberByUserId(userId);
  }

  return { ...user, barber };
}

export async function refresh(data) {
  if (!data.refreshToken) {
    throw new UnauthorizedError('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(data.refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await authRepository.findById(decoded.userId);
  if (!user || !user.active) {
    throw new UnauthorizedError('User not found');
  }

  const tokens = generateTokens(user);
  return {
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    ...tokens,
  };
}
