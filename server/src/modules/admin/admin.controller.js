import * as adminService from './admin.service.js';
import { success, created, paginated } from '../../utils/response.js';

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
    const { page = 1, limit = 20, search } = req.query;
    const result = await adminService.getAllBarbers({ page: Number(page), limit: Number(limit), search });
    return paginated(res, result.data, result.total, Number(page), Number(limit));
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
    const { page = 1, limit = 20, search } = req.query;
    const result = await adminService.getAllServices({ page: Number(page), limit: Number(limit), search });
    return paginated(res, result.data, result.total, Number(page), Number(limit));
  } catch (err) {
    next(err);
  }
}

export async function getAllReservations(req, res, next) {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const result = await adminService.getAllReservations({ page: Number(page), limit: Number(limit), search, status });
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

export async function toggleServiceStatus(req, res, next) {
  try {
    const service = await adminService.toggleServiceStatus(req.params.id);
    return success(res, service, `Service ${service.active ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    next(err);
  }
}

export async function updateReservationStatus(req, res, next) {
  try {
    const reservation = await adminService.updateReservationStatus(req.params.id, req.body.status);
    return success(res, reservation, `Reservation ${req.body.status.toLowerCase()} successfully`);
  } catch (err) {
    next(err);
  }
}
