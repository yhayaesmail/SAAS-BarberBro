import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import * as authRepository from './auth.repository.js';
import { UnauthorizedError, ConflictError, ValidationError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';
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

export async function forgotPassword(data) {
  if (!data.email) {
    throw new ValidationError('Email is required');
  }

  const user = await authRepository.findByEmailFull(data.email.trim().toLowerCase());
  if (!user) {
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  const resetToken = jwt.sign(
    { userId: user.id, purpose: 'password-reset' },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );

  const resetUrl = `${config.cors.origin}/reset-password?token=${resetToken}`;
  logger.info(`Password reset requested for ${data.email}`, { resetUrl, requestId: 'auth' });

  return { message: 'If an account with that email exists, a reset link has been sent.' };
}

export async function updateProfile(userId, data) {
  const updateData = {};
  if (data.firstName) updateData.firstName = data.firstName.trim();
  if (data.lastName) updateData.lastName = data.lastName.trim();
  if (data.phone) {
    const phoneErr = validateEgyptPhone(data.phone);
    if (phoneErr) throw new ValidationError('Validation failed', [{ field: 'phone', message: phoneErr }]);
    updateData.phone = data.phone.trim();
  }
  if (data.phone2 !== undefined) {
    if (data.phone2) {
      const phoneErr = validateEgyptPhone(data.phone2);
      if (phoneErr) throw new ValidationError('Validation failed', [{ field: 'phone2', message: phoneErr }]);
      updateData.phone2 = data.phone2.trim();
    } else {
      updateData.phone2 = null;
    }
  }
  if (data.email) {
    const emailErr = validateEmail(data.email);
    if (emailErr) throw new ValidationError('Validation failed', [{ field: 'email', message: emailErr }]);
    const existing = await authRepository.findByEmail(data.email.trim().toLowerCase());
    if (existing && existing.id !== userId) throw new ConflictError('Email is already taken');
    updateData.email = data.email.trim().toLowerCase();
  }
  if (data.password) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!data.currentPassword) throw new ValidationError('Current password is required');
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedError('Current password is incorrect');
    const pwdErr = validatePassword(data.password);
    if (pwdErr) throw new ValidationError('Validation failed', [{ field: 'password', message: pwdErr }]);
    updateData.password = await bcrypt.hash(data.password, 12);
  }
  return authRepository.update(userId, updateData);
}

export async function resetPassword(data) {
  if (!data.token || !data.password) {
    throw new ValidationError('Token and new password are required');
  }

  const passwordErr = validatePassword(data.password);
  if (passwordErr) {
    throw new ValidationError('Validation failed', [{ field: 'password', message: passwordErr }]);
  }

  let decoded;
  try {
    decoded = jwt.verify(data.token, config.jwt.accessSecret);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  if (decoded.purpose !== 'password-reset') {
    throw new UnauthorizedError('Invalid reset token');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  await authRepository.updatePassword(decoded.userId, hashedPassword);

  return { message: 'Password reset successful. You can now login with your new password.' };
}
