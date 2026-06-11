import * as barberService from './barber.service.js';
import { success, paginated } from '../../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await barberService.getAll({ page: Number(page), limit: Number(limit), search });
    return paginated(res, result.data, result.total, Number(page), Number(limit));
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const barber = await barberService.getById(req.params.id);
    return success(res, barber);
  } catch (err) {
    next(err);
  }
}

export async function searchSuggestions(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return success(res, []);
    const result = await barberService.searchSuggestions(q);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAvailableSlots(req, res, next) {
  try {
    const { date, serviceIds } = req.query;
    const ids = serviceIds ? serviceIds.split(',').filter(Boolean) : [];
    const slots = await barberService.getAvailableSlots(req.params.id, date, ids);
    return success(res, slots);
  } catch (err) {
    next(err);
  }
}
