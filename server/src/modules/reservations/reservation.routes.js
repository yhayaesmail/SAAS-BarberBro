import { Router } from 'express';
import * as reservationController from './reservation.controller.js';
import authenticate from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.post('/', reservationController.create);
router.get('/mine', reservationController.getMyReservations);
router.patch('/:id/cancel', reservationController.cancel);

export default router;
