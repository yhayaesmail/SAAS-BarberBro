import { Router } from 'express';
import * as authController from './auth.controller.js';
import authenticate from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.get('/profile', authenticate, authController.getProfile);

export default router;
