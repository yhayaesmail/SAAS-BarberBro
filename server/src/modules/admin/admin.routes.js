import { Router } from 'express';
import * as adminController from './admin.controller.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/barbers', adminController.getAllBarbers);
router.get('/barbers/:id', adminController.getBarberById);
router.post('/barbers', adminController.createBarber);
router.put('/barbers/:id', adminController.updateBarber);
router.patch('/barbers/:id/toggle', adminController.toggleBarberStatus);
router.get('/services', adminController.getAllServices);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.get('/reservations', adminController.getAllReservations);

export default router;
