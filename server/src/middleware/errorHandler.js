import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export default function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn(err.message, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      details: err.details,
    });
    const body = {
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}
