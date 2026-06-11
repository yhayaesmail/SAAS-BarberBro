import { Router } from 'express';
import * as barberController from './barber.controller.js';

const router = Router();

router.get('/', barberController.getAll);
router.get('/suggestions', barberController.searchSuggestions);
router.get('/:id', barberController.getById);
router.get('/:id/slots', barberController.getAvailableSlots);

export default router;
