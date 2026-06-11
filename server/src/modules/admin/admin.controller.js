import * as adminService from './admin.service.js';
import { success, created } from '../../utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function createBarber(req, res, next) {
  try {
    const barber = await adminService.createBarber(req.body);
    return created(res, barber, 'Barber created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateBarber(req, res, next) {
  try {
    const barber = await adminService.updateBarber(req.params.id, req.body);
    return success(res, barber, 'Barber updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function toggleBarberStatus(req, res, next) {
  try {
    const barber = await adminService.toggleBarberStatus(req.params.id);
    return success(res, barber, `Barber ${barber.active ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    next(err);
  }
}

export async function getBarberById(req, res, next) {
  try {
    const barber = await adminService.getBarberById(req.params.id);
    return success(res, barber);
  } catch (err) {
    next(err);
  }
}

export async function getAllBarbers(req, res, next) {
  try {
    const barbers = await adminService.getAllBarbers();
    return success(res, barbers);
  } catch (err) {
    next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await adminService.createService(req.body);
    return created(res, service, 'Service created successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await adminService.updateService(req.params.id, req.body);
    return success(res, service, 'Service updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function getAllServices(req, res, next) {
  try {
    const services = await adminService.getAllServices();
    return success(res, services);
  } catch (err) {
    next(err);
  }
}

export async function getAllReservations(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await adminService.getAllReservations({ page: Number(page), limit: Number(limit) });
    return res.status(200).json({
      success: true,
      message: 'Reservations retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(result.total / Number(limit)),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
