import { Router } from 'express';
import * as serviceController from './service.controller.js';

const router = Router();

router.get('/', serviceController.getAll);

export default router;
