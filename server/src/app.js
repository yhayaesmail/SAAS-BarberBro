import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import authRoutes from './modules/auth/auth.routes.js';
import barberRoutes from './modules/barbers/barber.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(cookieParser(config.cookie.secret));
app.use(express.json({ limit: '10kb' }));
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KM-BARBER API is operational',
    data: { uptime: process.uptime(), environment: config.env },
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
