import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.js';
import requestId from './middleware/requestId.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import prisma from './utils/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../client/dist');

import authRoutes from './modules/auth/auth.routes.js';
import barberRoutes from './modules/barbers/barber.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import reservationRoutes from './modules/reservations/reservation.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(cookieParser(config.cookie.secret));
app.use(express.json({ limit: '10kb' }));
app.use(requestId);
app.use(generalLimiter);

if (config.env === 'production') {
  app.use(express.static(distPath));
}

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', async (_req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}
  res.status(dbOk ? 200 : 503).json({
    success: dbOk,
    message: dbOk ? 'KM-BARBER API is operational' : 'Database connection failed',
    data: { uptime: process.uptime(), environment: config.env, database: dbOk ? 'connected' : 'disconnected' },
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  if (config.env === 'production') {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorHandler);

export default app;
