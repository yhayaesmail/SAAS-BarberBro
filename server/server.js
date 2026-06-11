import 'dotenv/config';
import app from './src/app.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`KM-BARBER API running on port ${config.port} [${config.env}]`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received - shutting down gracefully');
  server.close(() => process.exit(0));
});
