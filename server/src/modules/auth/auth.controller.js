import * as authService from './auth.service.js';
import { success, created } from '../../utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await authService.getProfile(req.user.id);
    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body);
    return success(res, result, 'Tokens refreshed successfully');
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body);
    return success(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    return success(res, result, 'Password reset successful');
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const profile = await authService.updateProfile(req.user.id, req.body);
    return success(res, profile, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}
