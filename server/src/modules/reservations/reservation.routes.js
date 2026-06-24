import { Router } from 'express';
import * as reservationController from './reservation.controller.js';
import authenticate from '../../middleware/authenticate.js';
import { reservationLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);
router.post('/', reservationLimiter, reservationController.create);
router.get('/mine', reservationController.getMyReservations);
router.get('/barber/mine', reservationController.getMyBarberReservations);
router.patch('/:id/cancel', reservationController.cancel);

export default router;
