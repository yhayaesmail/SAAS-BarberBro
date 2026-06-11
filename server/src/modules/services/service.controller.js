import * as serviceRepository from './service.repository.js';
import { success } from '../../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const services = await serviceRepository.findAll();
    return success(res, services);
  } catch (err) {
    next(err);
  }
}
