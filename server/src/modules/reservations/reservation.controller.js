import * as reservationService from './reservation.service.js';
import { success, created } from '../../utils/response.js';

export async function create(req, res, next) {
  try {
    const reservation = await reservationService.create(req.user.id, req.body);
    return created(res, reservation, 'Reservation created successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMyReservations(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await reservationService.getByCustomer(req.user.id, { page: Number(page), limit: Number(limit) });
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

export async function cancel(req, res, next) {
  try {
    const reservation = await reservationService.cancel(req.params.id, req.user);
    return success(res, reservation, 'Reservation cancelled successfully');
  } catch (err) {
    next(err);
  }
}
